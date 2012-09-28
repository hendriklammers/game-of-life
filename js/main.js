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
		while ((currentElement = currentElement.offsetParent));

		canvasX = event.pageX - totalOffsetX;
		canvasY = event.pageY - totalOffsetY;

		return {
			x: canvasX,
			y: canvasY
		};
	}
	HTMLCanvasElement.prototype.mouseCoords = mouseCoords;
}());

// Namespace
var GameOfLife = window.GameOfLife || {};

// Settings
GameOfLife.settings = {
	UPDATE_RATE: 20,
	FPS: 60,
	cellSize: 10,
	cellsX: 80,
	cellsY: 50
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

	Cell.prototype.switchState = function () {
		this.isAlive = this.nextState;
	};

	Cell.prototype.draw = function (context) {
		if (this.isAlive) {
			context.save();
			context.fillStyle = '#000000';
			context.fillRect(this.x, this.y, GameOfLife.settings.cellSize, GameOfLife.settings.cellSize);
			context.restore();
		}
	};

	GameOfLife.Cell = Cell;

}());

/**
 * Grid
 */
(function () {

	function Grid() {
		var cellsX = GameOfLife.settings.cellsX;
		var cellsY = GameOfLife.settings.cellsY;

		// Create Two dimensional Array
		this.cells = new Array(cellsX);
		for (var i = 0; i < cellsX; i++) {
			this.cells[i] = new Array(cellsY);
		}

		// Fill Array with new Cells
		for (var x = 0; x < cellsX; x++) {
			for (var y = 0; y < cellsY; y++) {
				this.cells[x][y] = new GameOfLife.Cell(x * GameOfLife.settings.cellSize, y * GameOfLife.settings.cellSize);
			}
		}
		this.setNextState();

	}

	Grid.prototype.update = function () {
		// Loop through every cell on the grid
		for (var x = 0; x < GameOfLife.settings.cellsX; x++) {
			for (var y = 0; y < GameOfLife.settings.cellsY; y++) {
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
		var cellsX = GameOfLife.settings.cellsX;
		var cellsY = GameOfLife.settings.cellsY;

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
		for (var x = 0; x < GameOfLife.settings.cellsX; x++) {
			for (var y = 0; y < GameOfLife.settings.cellsY; y++) {
				this.cells[x][y].draw(context);
			}
		}

		// Draw the grid
		context.save();
		context.strokeStyle = '#c8c8c8';
		context.lineWidth = 1;
		// Horizontal grid lines
		// Skip the first line
		for (var i = 0; i < GameOfLife.settings.cellsY - 1; i++) {
			// Add 0.5 to y position to maintain crisp lines
			var posY = (i * GameOfLife.settings.cellSize) + 0.5 + GameOfLife.settings.cellSize;
			context.beginPath();
			context.moveTo(0, posY);
			context.lineTo(GameOfLife.settings.cellsX * GameOfLife.settings.cellSize, posY);
			context.stroke();
		}
		// Vertical grid lines
		// Skip the first line
		for (var j = 0; j < GameOfLife.settings.cellsX - 1; j++) {
			// Add 0.5 to y position to maintain crisp lines
			var posX = (j * GameOfLife.settings.cellSize) + 0.5 + GameOfLife.settings.cellSize;
			context.beginPath();
			context.moveTo(posX, 0);
			context.lineTo(posX, GameOfLife.settings.cellsY * GameOfLife.settings.cellSize);
			context.stroke();
		}
		context.restore();
	};

	Grid.prototype.selectWithMouse = function (x, y, state) {
		// Get cell below the mouse
		var col = Math.floor(x / GameOfLife.settings.cellSize);
		var row = Math.floor(y / GameOfLife.settings.cellSize);
		// Safety check to see if collumn and row are within range
		if (col >= 0 && col < GameOfLife.settings.cellsX) {
			if (row >= 0 && row < GameOfLife.settings.cellsY) {
				// Set dead or alive
				var cell = this.cells[col][row];
				if (state == 'alive') {
					cell.isAlive = true;
				} else {
					cell.isAlive = false;
				}
			}
		}
	};

	Grid.prototype.randomize = function () {
		for (var x = 0; x < GameOfLife.settings.cellsX; x++) {
			for (var y = 0; y < GameOfLife.settings.cellsY; y++) {
				this.cells[x][y].nextState = Math.random() > 0.5 ? true : false;
			}
		}
		this.setNextState();
	};

	Grid.prototype.clear = function () {
		for (var x = 0; x < GameOfLife.settings.cellsX; x++) {
			for (var y = 0; y < GameOfLife.settings.cellsY; y++) {
				this.cells[x][y].nextState = false;
			}
		}
		this.setNextState();
	};

	Grid.prototype.setNextState = function () {
		for (var x = 0; x < GameOfLife.settings.cellsX; x++) {
			for (var y = 0; y < GameOfLife.settings.cellsY; y++) {
				this.cells[x][y].switchState();
			}
		}
	};

	GameOfLife.Grid = Grid;

}());

/**
 * Game
 */
(function () {

	function Game() {
		this.canvas = null;
		this.context = null;
		this.isPaused = false;
		this.mouse = {
			isDown: false,
			x: null,
			y: null,
			rightButton: false
		};
	}

	Game.prototype.init = function () {
		this.canvas = document.getElementById('my-canvas');
		if (this.canvas.getContext) {
			this.context = this.canvas.getContext('2d');

			// Set canvas size
			this.canvas.width = GameOfLife.settings.cellsX * GameOfLife.settings.cellSize;
			this.canvas.height = GameOfLife.settings.cellsY * GameOfLife.settings.cellSize;

			// Create Grid
			this.grid = new GameOfLife.Grid();

			// Update interval
			setInterval(this.update.bind(this), 1000 / GameOfLife.settings.UPDATE_RATE);
			// Animation loop, bind scope
			requestAnimationFrame(this.animLoop.bind(this));

			this.addListeners();

		} else {
			alert('You need a modern browser to view this');
		}
	};

	Game.prototype.addListeners = function () {
		var self = this;

		// Pause button
		document.getElementById('pause-button').onclick = function (event) {
			event.preventDefault();
			if (!self.isPaused) {
				self.isPaused = true;
				this.innerHTML = 'Resume';
			} else {
				self.isPaused = false;
				this.innerHTML = 'Pause';
			}
		};

		// Clear button
		document.getElementById('clear-button').onclick = function (event) {
			event.preventDefault();
			self.grid.clear();
		};

		// Randomize button
		document.getElementById('randomize-button').onclick = function (event) {
			event.preventDefault();
			self.grid.randomize();
		};

		// Left mouse button
		this.canvas.onmousedown = function (event) {
			self.mouse = {
				isDown: true,
				x: this.mouseCoords(event).x,
				y: this.mouseCoords(event).y
			};
		};

		// When mouse is moved
		this.canvas.onmousemove = function (event) {
			self.mouse.x = this.mouseCoords(event).x;
			self.mouse.y = this.mouseCoords(event).y;
		};

		// Mouse button released
		document.onmouseup = function (event) {
			self.mouse.isDown = false;
			self.mouse.rightButton = false;
		};

		// Right mouse button
		this.canvas.oncontextmenu = function (event) {
			event.preventDefault();
			self.mouse.rightButton = true;
		};
	};

	Game.prototype.update = function () {
		// Only update when game isn't paused
		if (!this.isPaused) {
			this.grid.update();
		}
	};

	Game.prototype.animLoop = function () {
		var self = this;
		setTimeout(function () {
			requestAnimationFrame(self.animLoop.bind(self));
			// Call render method
			self.render();
		}, 1000 / GameOfLife.settings.FPS);
	};

	Game.prototype.render = function() {
		// Start with a blank canvas every render cycle
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

		// Show Pause in the background
		if (this.isPaused) {
			this.context.save();
			this.context.font = 'bold 76px Arial';
			this.context.textAlign = 'center';
			this.context.textBaseline = 'middle';
			this.context.fillStyle = '#ff5569';
			this.context.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2);
			this.context.restore();
		}

		// Check is the mousebutton is pressed and call method on the grid object
		if (this.mouse.isDown) {
			if (this.mouse.rightButton) {
				this.grid.selectWithMouse(this.mouse.x, this.mouse.y, 'death');
			} else {
				this.grid.selectWithMouse(this.mouse.x, this.mouse.y, 'alive');
			}
		}

		// Draw the grid
		this.grid.draw(this.context);
	};

	GameOfLife.Game = Game;

}());

(function () {
	// Create an instance of the game
	var game = new GameOfLife.Game();
	game.init();

}());