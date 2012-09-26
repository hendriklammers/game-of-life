// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
// requestAnimationFrame polyfill by Erik Möller
// fixes from Paul Irish and Tino Zijdel
(function () {
	var lastTime = 0;
	var vendors = ['ms', 'moz', 'webkit', 'o'];
	for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
		window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
		window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
	}

	if (!window.requestAnimationFrame) window.requestAnimationFrame = function (callback, element) {
		var currTime = new Date().getTime();
		var timeToCall = Math.max(0, 16 - (currTime - lastTime));
		var id = window.setTimeout(function () {
			callback(currTime + timeToCall);
		}, timeToCall);
		lastTime = currTime + timeToCall;
		return id;
	};

	if (!window.cancelAnimationFrame) window.cancelAnimationFrame = function (id) {
		clearTimeout(id);
	};
}());

// Mozilla bind polyfill
if (!Function.prototype.bind) {
	Function.prototype.bind = function (oThis) {
		if (typeof this !== "function") {
			// closest thing possible to the ECMAScript 5 internal IsCallable function
			throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
		}

		var aArgs = Array.prototype.slice.call(arguments, 1),
			fToBind = this,
			fNOP = function () {},
			fBound = function () {
				return fToBind.apply(this instanceof fNOP && oThis ? this : oThis, aArgs.concat(Array.prototype.slice.call(arguments)));
			};

		fNOP.prototype = this.prototype;
		fBound.prototype = new fNOP();

		return fBound;
	};
}

// Add mouse coordinates on the Canvas element
(function () {
	function mouseCoords(event) {
		var totalOffsetX = 0;
		var totalOffsetY = 0;
		var canvasX = 0;
		var canvasY = 0;
		var currentElement = this;

		do {
			totalOffsetX += currentElement.offsetLeft;
			totalOffsetY += currentElement.offsetTop;
		}
		while (currentElement = currentElement.offsetParent)

		canvasX = event.pageX - totalOffsetX;
		canvasY = event.pageY - totalOffsetY;

		return {
			x: canvasX,
			y: canvasY
		}
	}
	HTMLCanvasElement.prototype.mouseCoords = mouseCoords;
}());

// Namespace
var GOF = window.GOF || {};

// Settings
GOF.settings = {
	UPDATE_RATE: 20,
	FPS: 60,
	cellSize: 10,
	cellsX: 50,
	cellsY: 40
};

/**
 * Cell
 */
(function () {

	function Cell(x, y) {
		this.x = x;
		this.y = y;
		this.isAlive = false;
		this.nextState = Math.random() > 0.5 ? true : false;
	}

	Cell.prototype.switchState = function() {
		this.isAlive = this.nextState;
	};

	Cell.prototype.update = function () {
		// Mouse logic here?
	};

	Cell.prototype.draw = function (context) {
		if (this.isAlive) {
			// context.translate(this.x, this.y);
			context.fillStyle = '#000000';
			context.fillRect(this.x, this.y, GOF.settings.cellSize, GOF.settings.cellSize);
		}
	};

	GOF.Cell = Cell;

}());

/**
 * Grid
 */
(function () {

	function Grid() {
		var cellsX = GOF.settings.cellsX;
		var cellsY = GOF.settings.cellsY;

		// Create Two dimensional Array
		this.cells = new Array(cellsX);
		for (var i = 0; i < cellsX; i++) {
			this.cells[i] = new Array(cellsY);
		}

		// Fill Array with new Cells
		for (var x = 0; x < cellsX; x++) {
			for (var y = 0; y < cellsY; y++) {
				this.cells[x][y] = new GOF.Cell(x * GOF.settings.cellSize, y * GOF.settings.cellSize);
			}
		}
		this.setNextState();

	}

	Grid.prototype.update = function () {
		// Loop through every cell on the grid
		for (var x = 0; x < this.cells.length; x++) {
			for (var y = 0; y < this.cells[x].length; y++) {
				var living = this.cells[x][y].isAlive;
				var count = this.getLivingNeighbors(x, y);
				var result = false;

				// Apply the rules and set the next state.
				if (living && count < 2) {
					result = false;
				}
				if (living && (count == 2 || count == 3)) {
					result = true;
				}
				if (living && count > 3) {
					result = false;
				}
				if (!living && count == 3) {
					result = true;
				}

				this.cells[x][y].nextState = result;
			}
		}

		this.setNextState();
	};

	Grid.prototype.getLivingNeighbors = function (x, y) {
		var count = 0;
		var cellsX = GOF.settings.cellsX;
		var cellsY = GOF.settings.cellsY;

		// Check cell on the right.
		if (x != cellsX - 1) {
			if (this.cells[x + 1][y].isAlive) {
				count++;
			}
		}
		// Check cell on the bottom right.
		if (x != cellsX - 1 && y != cellsY - 1) {
			if (this.cells[x + 1][y + 1].isAlive) {
				count++;
			}
		}
		// Check cell on the bottom.
		if (y != cellsY - 1) {
			if (this.cells[x][y + 1].isAlive) {
				count++;
			}
		}
		// Check cell on the bottom left.
		if (x !== 0 && y != cellsY - 1) {
			if (this.cells[x - 1][y + 1].isAlive) {
				count++;
			}
		}
		// Check cell on the left.
		if (x !== 0) {
			if (this.cells[x - 1][y].isAlive) {
				count++;
			}
		}
		// Check cell on the top left.
		if (x !== 0 && y !== 0) {
			if (this.cells[x - 1][y - 1].isAlive) {
				count++;
			}
		}
		// Check cell on the top.
		if (y !== 0) {
			if (this.cells[x][y - 1].isAlive) {
				count++;
			}
		}
		// Check cell on the top right.
		if (x != cellsX - 1 && y !== 0) {
			if (this.cells[x + 1][y - 1].isAlive) {
				count++;
			}
		}

		return count;
	};

	Grid.prototype.draw = function (context) {
		// Draw the cells
		for (var x = 0; x < this.cells.length; x++) {
			for (var y = 0; y < this.cells[x].length; y++) {
				this.cells[x][y].draw(context);
			}
		}

		// Draw the grid
		context.strokeStyle = '#c8c8c8';
		context.lineWidth = 1;
		// Horizontal grid lines
		for (var i = 0; i < GOF.settings.cellsY; i++) {
			// Add 0.5 to y position to maintain crisp lines
			var posY = (i * GOF.settings.cellSize) + 0.5;
			context.beginPath();
			context.moveTo(0, posY);
			context.lineTo(GOF.settings.cellsX * GOF.settings.cellSize, posY);
			context.stroke();
		}
		// Vertical grid lines
		for (var j = 0; j < GOF.settings.cellsX; j++) {
			// Add 0.5 to y position to maintain crisp lines
			var posX = (j * GOF.settings.cellSize) + 0.5;
			context.beginPath();
			context.moveTo(posX, 0);
			context.lineTo(posX, GOF.settings.cellsY * GOF.settings.cellSize);
			context.stroke();
		}

	};

	Grid.prototype.clear = function() {
		for (var x = 0; x < GOF.settings.cellsX; x++) {
			for (var y = 0; y < GOF.settings.cellsY; y++) {
				this.cells[x][y].nextState = false;
			}
		}
		this.setNextState();
	};

	Grid.prototype.setNextState = function() {
		for (var x = 0; x < GOF.settings.cellsX; x++) {
			for (var y = 0; y < GOF.settings.cellsY; y++) {
				this.cells[x][y].switchState();
			}
		}
	};

	GOF.Grid = Grid;

}());

/**
 * Game
 */
(function () {

	function Game() {
		this.canvas = null;
		this.context = null;
		this.isPaused = false;
		this.isLeftMouseDown = false;
	}

	Game.prototype.init = function () {
		this.canvas = document.getElementById('my-canvas');
		if (this.canvas.getContext) {
			this.context = this.canvas.getContext('2d');

			// Set canvas size
			this.canvas.width = GOF.settings.cellsX * GOF.settings.cellSize;
			this.canvas.height = GOF.settings.cellsY * GOF.settings.cellSize;

			// Create Grid
			this.grid = new GOF.Grid();

			// Update interval
			setInterval(this.update.bind(this), 1000 / GOF.settings.UPDATE_RATE);
			// render loop
			requestAnimationFrame(this.render.bind(this));

			this.addListeners();

		} else {
			alert('You need a modern browser to view this');
		}
	};

	Game.prototype.addListeners = function() {
		var self = this;
		document.onkeypress = function(event) {
			if(event.keyCode == 32) {
				self.isPaused = !self.isPaused;
			}
			if(event.keyCode == 13) {
				self.grid.clear();
			}
		};
		// Left mouse button
		this.canvas.onmousedown = function(event) {
			self.isLeftMouseDown = true;
		}
		document.onmouseup = function(event) {
			self.isLeftMouseDown = false;
		}
		// Right mouse button
		this.canvas.oncontextmenu = function(event) {
			event.preventDefault();
		}
	};

	Game.prototype.update = function () {
		if (this.isPaused) {
			return;
		}

		this.grid.update();
	};

	Game.prototype.render = function () {
		requestAnimationFrame(this.render.bind(this));

		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

		// Show Pause
		if (this.isPaused) {
			this.context.fillStyle = '#b8030f';
			this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
			this.context.font = 'bold 76px Arial';
			this.context.textAlign = 'center';
			this.context.textBaseline = 'middle';
			this.context.fillStyle = '#ffffff';
			this.context.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2);
		}

		this.context.save();
		this.grid.draw(this.context);
		this.context.restore();
	};

	GOF.Game = Game;

}());

(function () {

	var game = new GOF.Game();
	game.init();

}());