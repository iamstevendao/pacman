function init() {
	var canvas = document.getElementById('root');
	const ROW_NUMBER = 57;
	const COLOR_BORDER = "#aaaaaa";
	const COLOR_BACKGROUND = "#000000";
	const COLOR_PACMAN = "#990000";
	const COLOR_GHOST = "#993333";
	const COLOR_MAP = "#000099";
	const COLOR_FOOD = "#999999";
	const SIZE_UNIT = 3;
	const MARGIN_PACMAN = 1;
	const GRID_HEIGHT = 19;
	const GRID_WIDTH = 19;
	const FOOD = "food";
	const BLOCK = "block";
	const PACMAN_X = "x";
	const PACMAN_Y = "y";
	const NUMBER_GHOSTS = 3;

	var ctx = canvas.getContext("2d");
	var w = window.innerWidth;
	var h = window.innerHeight;
	canvas.width = w > h ? h : w;
	canvas.height = canvas.width;
	w = canvas.width;
	var cw = w / ROW_NUMBER;
	const SIZE_BLOCK = SIZE_UNIT * cw;
	var pacman = { x: 4, y: 4, direction: "right" };
	var map = [];
	var food = [];
	var ghosts = [];
	const GHOST_AREA = { x: 7, y: 8, w: 5, h: 3 };
	const DIRECTION = { l: "left", r: "right", u: "up", d: "down" };
	var score = 0;

	initialize();
	setInterval(updateFrame, 100);

	function updateFrame() {
		drawBackground();
		updateMap();
		updateFood();
		updatePacman();
		updateGhosts();
		updateScore();
		console.log(ghosts[0].prev + " " + ghosts[0].direction);
	}
	function initialize() {
		generateMap();
		generateFood();
		generateGhosts();
	}
	function randomProperty(obj) {
		var keys = Object.keys(obj)
		return obj[keys[keys.length * Math.random() << 0]];
	};
	function generateGhosts() {

		for (let i = 0; i < NUMBER_GHOSTS; i++) {
			let x = Math.floor(Math.random() * GHOST_AREA.w * SIZE_UNIT) + GHOST_AREA.x * SIZE_UNIT;
			let y = Math.floor(Math.random() * GHOST_AREA.h * SIZE_UNIT) + GHOST_AREA.y * SIZE_UNIT;
			let direction = randomProperty(DIRECTION);
			console.log("x: " + x + " y: " + y + " direction: " + direction);
			ghosts.push({ x: x, y: y, direction: direction, prev: direction });
		}

	}
	function updateGhosts() {
		controlGhosts();
		drawGhosts();
	}
	function drawGhosts() {
		ghosts.forEach(value => {
			drawGhost(value);
		})
	}
	function drawGhost(value) {
		ctx.fillStyle = COLOR_GHOST;
		ctx.fillRect((value.x - 1) * cw, (value.y - 1) * cw, SIZE_BLOCK, SIZE_BLOCK);
	}
	function controlGhosts() {
		ghosts.forEach(value => {
			controlObject(value, true);
		})
	}
	function generateFood() {
		console.log(map.length);
		for (let i = 0; i < GRID_WIDTH * SIZE_UNIT; i++) {
			for (let j = 0; j < GRID_HEIGHT * SIZE_UNIT; j++) {
				if (i % 3 == 1 && j % 3 == 1 && !map.some(value => (
					value.x == i && value.y == j
				))) {
					food.push({ x: i, y: j });
				}
			}
		}
	}

	function updateFood() {
		drawFood();
	}
	function updateMap() {
		drawMap();
	}
	function updatePacman() {
		controlObject(pacman, false);
		drawPacman();
	}
	function updateScore() {
		controlScore();
		drawScore();
		function controlScore() {
			food.forEach((value, i) => {
				if (pacman.x == value.x && pacman.y == value.y) {
					score++;
					food.splice(i, 1);
				}
			});
		}
		function drawScore() {
			ctx.fillStyle = COLOR_FOOD;
			ctx.font = "20px Monaco";
			ctx.fillText("Score: " + score, 0, cw * 3);
		}
	}

	function controlObject(obj, isGhost) {
		let crashed = true;
		let possibleDirection = [];
		let index = 0;
		Object.keys(DIRECTION).forEach(key => {
			if (whereCantGo().indexOf(DIRECTION[key]) == -1)
				possibleDirection.push(DIRECTION[key]);
		});
		if (possibleDirection.indexOf(obj.direction) != -1) {
			if ((index = possibleDirection.indexOf(opositeOf(obj.direction))) != -1)
				possibleDirection.splice(index, 1);
		}
		obj.direction = possibleDirection[Math.floor(Math.random() * possibleDirection.length)];
		function opositeOf(x) {
			switch (x) {
				case DIRECTION.l:
					return DIRECTION.r;
				case DIRECTION.r:
					return DIRECTION.l;
				case DIRECTION.u:
					return DIRECTION.d;
				case DIRECTION.d:
					return DIRECTION.u;
			}
		}
		// possibleDirection.forEach((value, i) => {
		// 	if (whereCantGo().indexOf(value) > - 1) {
		// 		possibleDirection.splice(i, 1);
		// 	}
		// });
		//console.log(possibleDirection);
		switch (obj.direction) {
			case DIRECTION.r:
				if (!(crashed = isCrashed(obj.x + 2, obj.y))) {
					if (isAligned(PACMAN_Y))
						obj.x--;
					obj.x++;
					possibleDirection.splice(possibleDirection.indexOf(DIRECTION.l), 1);
				}
				break;
			case DIRECTION.l:
				if (!(crashed = isCrashed(obj.x - 2, obj.y))) {
					if (isAligned(PACMAN_Y))
						obj.x++;
					obj.x--;
					possibleDirection.splice(possibleDirection.indexOf(DIRECTION.r), 1);
				}
				break;
			case DIRECTION.u:
				if (!(crashed = isCrashed(obj.x, obj.y - 2))) {
					if (isAligned(PACMAN_X))
						obj.y++;
					obj.y--;
					possibleDirection.splice(possibleDirection.indexOf(DIRECTION.d), 1);
				}
				break;
			case DIRECTION.d:
				if (!(crashed = isCrashed(obj.x, obj.y + 2))) {
					if (isAligned(PACMAN_X))
						obj.y--;
					obj.y++;
					possibleDirection.splice(possibleDirection.indexOf(DIRECTION.u), 1);
				}
				break;
		}
		// if (isGhost) {
		// 	if (crashed) {
		// 		if (obj.prev != null) {
		// 			obj.direction = obj.prev;
		// 		} else {
		// 			obj.direction = randomProperty(DIRECTION);
		// 		}
		// 		obj.prev = null;
		// 	} else {
		// 		obj.prev = obj.direction;

		// 		console.log("possible: " + possibleDirection.length);
		// 		obj.direction = possibleDirection[Math.floor(Math.random() * possibleDirection.length)];
		// 		//console.log(Math.floor(Math.random() * possibleDirection.length));
		// 	}
		// }
		function whereCantGo() {
			let direction = [];
			if (isCrashed(obj.x + 2, obj.y))
				direction.push(DIRECTION.r);
			if (isCrashed(obj.x - 2, obj.y))
				direction.push(DIRECTION.l);
			if (isCrashed(obj.x, obj.y - 2))
				direction.push(DIRECTION.u);
			if (isCrashed(obj.x, obj.y + 2))
				direction.push(DIRECTION.d);
			console.log("where cant go: " + direction.length);
			return direction;
		}
		function isCrashed(x, y) {
			return map.some(value => (value.x == x && value.y == y));
		}

		function isAligned(value) {
			if (value == PACMAN_X) {
				if (obj.x % 3 == 0) { obj.x++; return true; }
				if (obj.x % 3 == 2) { obj.x--; return true; }
			} else {
				if (obj.y % 3 == 0) { obj.y++; return true; }
				if (obj.y % 3 == 2) { obj.y--; return true; }
			}
			return false;
		}
	}
	function drawPacman() {
		ctx.beginPath();
		ctx.arc(pacman.x * cw + cw / 2 + MARGIN_PACMAN, pacman.y * cw + cw / 2 + MARGIN_PACMAN, SIZE_BLOCK / 2 - MARGIN_PACMAN * 2, 0.25 * Math.PI, 1.25 * Math.PI, false);
		ctx.fillStyle = COLOR_PACMAN;
		ctx.fill();
		ctx.beginPath();
		ctx.arc(pacman.x * cw + cw / 2 + MARGIN_PACMAN, pacman.y * cw + cw / 2 + MARGIN_PACMAN, SIZE_BLOCK / 2 - MARGIN_PACMAN * 2, 0.75 * Math.PI, 1.75 * Math.PI, false);
		ctx.fill();
		ctx.beginPath();
		ctx.arc(pacman.x * cw + cw / 2 + MARGIN_PACMAN, pacman.y * cw - cw / 3 + MARGIN_PACMAN, cw / 4 - 0.5, 0, 2 * Math.PI, false);
		ctx.fillStyle = COLOR_BACKGROUND;
		ctx.fill();
	}

	function generateMap() {
		for (let i = 0; i < GRID_WIDTH / 2; i++) {
			generateOthers(i, 0);
		}
		for (let i = 1; i < GRID_HEIGHT / 2; i++) {
			generateOthers(0, i);
		}
		for (let i = 2; i < 2 + 5; i++) {
			generateOthers(2, i);
		}
		for (let i = 4; i < 4 + 5; i++) {
			generateOthers(i, 2);
		}
		for (let i = 2; i < 2 + 3; i++) {
			generateOthers(i, 8);
		}
		for (let i = 4; i < 9; i += 2) {
			for (let j = 4; j < 4 + 2; j++) {
				generateOthers(i, j);
			}
		}
		generateOthers(4, 7);
		generateOthers(7, 7);
		generateOthers(6, 7);
		generateOthers(6, 8);
		pushIntoMap({ x: 6, y: 9 });
		pushIntoMap({ x: GRID_WIDTH - 6 - 1, y: 9 });
		pushIntoMap({ x: 9, y: 7 });
		for (let i = 8; i < 8 + 3; i++) {
			pushIntoMap({ x: i, y: 11 });
		}
		function generateOthers(x, y) {
			pushIntoMap({ x: x, y: y });
			pushIntoMap({ x: GRID_WIDTH - x - 1, y: y });
			pushIntoMap({ x: x, y: GRID_HEIGHT - y - 1 });
			pushIntoMap({ x: GRID_WIDTH - x - 1, y: GRID_HEIGHT - y - 1 });
		}
		function pushIntoMap(value) {
			for (let i = value.x * SIZE_UNIT; i <= value.x * SIZE_UNIT + 2; i++) {
				for (let j = value.y * SIZE_UNIT; j <= value.y * SIZE_UNIT + 2; j++) {
					map.push({ x: i, y: j });
				}
			}
		}
	}

	function drawFood() {
		food.forEach(value => {
			drawElement(FOOD, value.x, value.y);
		});
	}

	function drawBackground() {
		ctx.fillStyle = COLOR_BACKGROUND;
		ctx.fillRect(0, 0, w, h);
	}

	function drawMap() {
		map.forEach(value => {
			drawElement(BLOCK, value.x, value.y);
		});
	}
	function drawElement(ele, x, y) {
		switch (ele) {
			case BLOCK:
				ctx.fillStyle = COLOR_MAP;
				ctx.fillRect(x * cw, y * cw, cw, cw);
				break;
			case FOOD:
				ctx.fillStyle = COLOR_FOOD;
				ctx.fillRect(x * cw + cw / 2 - cw / 2, y * cw + cw / 2 - cw / 2, cw, cw);
				break;

		}
	}

	document.onkeydown = function (e) {
		switch (e.keyCode) {
			case 37:
				pacman.direction = DIRECTION.l;
				break;
			case 38:
				pacman.direction = DIRECTION.u;
				break;
			case 39:
				pacman.direction = DIRECTION.r;
				break;
			case 40:
				pacman.direction = DIRECTION.d;
				break;
			case 32:
				console.log("space pressed");

				break;
		}
	};
}

init();