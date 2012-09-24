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


// Namespace
var GOF = window.GOF || {};

// Settings
GOF.settings = {
	UPDATE_RATE: 20,
	FPS: 60,
	cellSize: 10
};

/**
 * Cell
 */
(function () {

	function Cell(x, y) {
		this.x = x;
		this.y = y;
		this.isAlive = false;
	}

	Cell.prototype.update = function () {
		// Mouse logic here?
	};

	Cell.prototype.draw = function (context) {
		if (this.isAlive) {
			context.translate(this.x, this.y);
			context.fillStyle = '#1e001a';
			context.fillRect(0, 0, GOF.settings.cellSize);
		}
	};

	GOF.Cell = Cell;

}());

/**
 * Grid
 */
(function() {
	
	function Grid() {
		
	}
	
}());

/**
 * Main
 */
(function () {

	function Main() {
		this.canvas = null;
		this.context = null;
	}

	Main.prototype.init = function () {
		this.canvas = document.getElementById('my-canvas');
		if (this.canvas.getContext) {
			this.context = this.canvas.getContext('2d');

			// Update interval
			// setInterval(this.update.bind(this), 1000 / GOF.settings.UPDATE_RATE);

			// render loop
			requestAnimationFrame(this.render.bind(this));

		} else {
			alert('You need a modern browser to view this');
		}
	};

	Main.prototype.update = function () {
		console.log(this);
	};

	Main.prototype.render = function () {
		requestAnimationFrame(this.render.bind(this));


	};

	GOF.Main = Main;

}());

(function () {

	var game = new GOF.Main();
	game.init();

}());