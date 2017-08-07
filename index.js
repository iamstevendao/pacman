function init() {
	const canvas = document.getElementById('root');
	const ctx = canvas.getContext("2d");
	canvas.width = window.innerWidth > innerHeight ? innerHeight : innerWidth;
	canvas.height = canvas.width;
	const w = canvas.width;
	const MARGIN_PACMAN = 1;
	const STEP = 5;
	const COLOR = {
		BACKGROUND: "#000000",
		PACMAN: "#990000",
		POWER: "#ff0000",
		MAP: "#000099",
		FOOD: "#999999",
		CHERRY: "#990000",
		CHERRY_BRANCH: "#009900",
		EYE: "#ffffff",
		GHOST_WEAK: "#A9A9A9",
		GHOST: ["#993333", "#339933", "#333399", "#999933", "#993399", "#339999"]
	};
	const SIZE = {
		GRID: 19,
		BLOCK: w / 19
	};
	const NUMBER = {
		GHOST: 8,
		CHERRY: 5,
		ROW: SIZE.GRID * STEP,
		POWER: 50,
		INTERVAL: 100
	}
	const ELEMENT = { FOOD: "food", BLOCK: "block", CHERRY: "cherry", GHOST: "ghost" };
	const GHOST_AREA = { x: 7, y: 8, w: 5, h: 3 };
	const DIRECTION = { LEFT: "left", RIGHT: "right", UP: "up", DOWN: "down" };
	var pacman = {};
	var map = [];
	var food = [];
	var ghosts = [];
	var cherries = [];
	var isOpen = false;
	var score = 0;

	reset();
	setInterval(update, NUMBER.INTERVAL);

	function update() {
		draw();
		controlGame();
	}
	function draw() {
		drawBackground();
		drawMap();
		drawFood();
		drawCherries();
		drawPacman();
		drawGhosts();
		drawScore();
	}
	function reset() {
		toDefault();
		generateElements();
		function toDefault() {
			score = 0;
			map = [];
			food = [];
			ghosts = [];
			cherries = [];
			pacman = { x: 1, y: 1, direction: "right", power: 0 };
		}
	}
	function generateElements() {
		generateMap();
		generateFood();
		generateCherry();
		generateGhosts();
	}

	function isContained(arr, obj) {
		return arr.some(value => (
			value.x == obj.x && value.y == obj.y
		));
	}

	function randomProperty(obj) {
		var keys = Object.keys(obj);
		return obj[keys[keys.length * Math.random() << 0]];
	}

	function generateGhosts() {
		for (let i = 0; i < NUMBER.GHOST; i++) {
			let x = Math.floor(Math.random() * GHOST_AREA.w) + GHOST_AREA.x;
			let y = Math.floor(Math.random() * GHOST_AREA.h) + GHOST_AREA.y;
			let direction = randomProperty(DIRECTION);
			let color = randomProperty(COLOR.GHOST);
			ghosts.push({ x: x, y: y, color: color, direction: direction });
		}
	}
	function generateCherry() {
		while (cherries.length < NUMBER.CHERRY) {
			let index = Math.floor(Math.random() * food.length);
			let cher = food[index];
			if (!isContained(cherries, cher)) {
				cherries.push(cher);
				food.splice(index, 1);
			}
		}
	}
	function drawCherries() {
		cherries.forEach(cherry => {
			drawElement(ELEMENT.CHERRY, cherry);
		});
	}
	function drawGhosts() {
		ghosts.forEach(value => {
			//drawGhost(value);
			drawElement(ELEMENT.GHOST, value);
		});
	}

	function generateFood() {
		for (let i = 0; i < SIZE.GRID; i++) {
			for (let j = 0; j < SIZE.GRID; j++) {
				let foo = { x: i, y: j };
				if (!isContained(map, foo)) {
					food.push(foo);
				}
			}
		}
	}

	function drawScore() {
		ctx.fillStyle = COLOR.FOOD;
		ctx.font = "20px Monaco";
		ctx.fillText("Score: " + score, 0, SIZE.BLOCK);
	}

	function controlGame() {
		//control pacman
		controlObject(pacman, false);
		//control ghost
		ghosts.forEach(value => {
			controlObject(value, true);
		});
		//control score
		controlScore();

		function controlScore() {
			//pacman crashes ghost
			ghosts.forEach((value, index) => {
				if (Math.ceil(value.x) == Math.ceil(pacman.x) && Math.ceil(value.y) == Math.ceil(pacman.y) || Math.floor(value.x) == Math.floor(pacman.x) && Math.floor(value.y) == Math.floor(pacman.y)) {
					if (pacman.power < 0) {
						reset();
					} else {
						//pacman eats ghost
						ghosts.splice(index, 1);
						score += 10;
					}
				}
			});

			if (food.length == 0 || ghosts.length == 0) {
				reset();
			}

			let x = Math.round(pacman.x);
			let y = Math.round(pacman.y);
			//pacman eats food
			food.forEach((value, i) => {
				if (x == value.x && y == value.y) {
					score++;
					food.splice(i, 1);
				}
			});

			//pacman eats cherry
			cherries.forEach((cherry, index) => {
				if (cherry.x == x && cherry.y == y) {
					pacman.power = NUMBER.INTERVAL * NUMBER.POWER;
					cherries.splice(index, 1);
					score += 5;
				}
			});
		}

		function controlObject(obj, isGhost) {
			let possibleDirection = [];
			let index = 0;
			Object.keys(DIRECTION).forEach(key => {
				if (whereCantGo().indexOf(DIRECTION[key]) == -1)
					possibleDirection.push(DIRECTION[key]);
			});
			if (isPossible(obj.direction)) {
				if ((index = possibleDirection.indexOf(opositeOf(obj.direction))) != -1)
					possibleDirection.splice(index, 1);
			}
			if (isGhost && Number.isInteger(obj.x) && Number.isInteger(obj.y)) {
				obj.direction = possibleDirection[Math.floor(Math.random() * possibleDirection.length)];
			}
			if (!isGhost) {
				obj.power -= NUMBER.INTERVAL;
				isOpen = !isOpen;
			}
			function opositeOf(x) {
				switch (x) {
					case DIRECTION.LEFT:
						return DIRECTION.RIGHT;
					case DIRECTION.RIGHT:
						return DIRECTION.LEFT;
					case DIRECTION.UP:
						return DIRECTION.DOWN;
					case DIRECTION.DOWN:
						return DIRECTION.UP;
				}
			}
			function isPossible(x) {
				return possibleDirection.indexOf(x) == -1 ? false : true;
			}

			switch (obj.direction) {
				case DIRECTION.RIGHT:
					if (isPossible(DIRECTION.RIGHT)) {
						obj.x += 1 / 4;
						obj.y = Math.round(obj.y);
					}
					break;
				case DIRECTION.LEFT:
					if (isPossible(DIRECTION.LEFT)) {
						obj.x -= 1 / 4;
						obj.y = Math.round(obj.y);
					}
					break;
				case DIRECTION.UP:
					if (isPossible(DIRECTION.UP)) {
						obj.y -= 1 / 4;
						obj.x = Math.round(obj.x);
					}
					break;
				case DIRECTION.DOWN:
					if (isPossible(DIRECTION.DOWN)) {
						obj.y += 1 / 4;
						obj.x = Math.round(obj.x);
					}
					break;
			}
			function whereCantGo() {
				let direction = [];
				if (isCrashed(obj.x + 1, obj.y))
					direction.push(DIRECTION.RIGHT);
				if (isCrashed(obj.x - 1, obj.y))
					direction.push(DIRECTION.LEFT);
				if (isCrashed(obj.x, obj.y - 1))
					direction.push(DIRECTION.UP);
				if (isCrashed(obj.x, obj.y + 1))
					direction.push(DIRECTION.DOWN);
				return direction;
			}
			function isCrashed(x, y) {
				return map.some(value => (value.x == x && value.y == y));
			}
		}
	}
	function drawPacman() {
		let color = pacman.power < 0 ? COLOR.PACMAN : COLOR.POWER;
		let margin = pacman.power < 0 ? MARGIN_PACMAN : 0;
		let angle = getAngle();
		let eye = getEye();
		let pac = {};
		pac.x = pacman.x * SIZE.BLOCK + SIZE.BLOCK / 2 + margin;
		pac.y = pacman.y * SIZE.BLOCK + SIZE.BLOCK / 2 + margin;
		pac.radius = SIZE.BLOCK / 2 - margin * 2;

		ctx.beginPath();
		ctx.arc(pac.x, pac.y, pac.radius, angle.startMouth, angle.endMouth, false);
		ctx.fillStyle = color;
		ctx.fill();
		ctx.beginPath();
		ctx.arc(pac.x, pac.y, pac.radius, angle.startHead, angle.endHead, false);
		ctx.fill();
		ctx.beginPath();
		ctx.arc(eye.x, eye.y, SIZE.BLOCK / 10, 0, 2 * Math.PI, false);
		ctx.fillStyle = COLOR.FOOD;
		ctx.fill();

		function getEye() {
			let eye = {};
			const base = { x: pacman.x * SIZE.BLOCK, y: pacman.y * SIZE.BLOCK };
			switch (pacman.direction) {
				case DIRECTION.RIGHT:
				case DIRECTION.LEFT:
					eye.x = base.x + SIZE.BLOCK / 2;
					eye.y = base.y + SIZE.BLOCK / 4;
					break;
				case DIRECTION.UP:
					eye.x = base.x + SIZE.BLOCK / 4;
					eye.y = base.y + SIZE.BLOCK / 2;
					break;
				case DIRECTION.DOWN:
					eye.x = base.x + SIZE.BLOCK * 3 / 4;
					eye.y = base.y + SIZE.BLOCK / 2;
					break;
			}
			return eye;
		}
		function getAngle() {
			let angle = { startMouth: Math.PI, endMouth: Math.PI, startHead: Math.PI, endHead: Math.PI };
			if (!isOpen) {
				angle.startMouth = 0;
				angle.endHead = 0;
				return angle;
			}
			let mouth = 0, head = 0;
			switch (pacman.direction) {
				case DIRECTION.RIGHT:
					mouth = 0.25;
					head = 0.75
					break;
				case DIRECTION.LEFT:
					mouth = 1.75;
					head = 1.25
					break;
				case DIRECTION.UP:
					mouth = 0.25;
					head = 1.75;
					break;
				case DIRECTION.DOWN:
					mouth = 0.75;
					head = 1.25;
					break;
			}
			angle.startMouth *= mouth;
			angle.endMouth *= mouth > 1 ? mouth - 1 : mouth + 1;
			angle.startHead *= head;
			angle.endHead *= head > 1 ? head - 1 : head + 1;
			return angle;
		}
	}

	function generateMap() {
		for (let i = 0; i < SIZE.GRID / 2; i++) {
			generateOthers(i, 0);
		}
		for (let i = 1; i < SIZE.GRID / 2; i++) {
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
		pushIntoMap({ x: SIZE.GRID - 6 - 1, y: 9 });
		for (let i = 8; i < 8 + 3; i++) {
			pushIntoMap({ x: i, y: 11 });
		}
		function generateOthers(x, y) {
			pushIntoMap({ x: x, y: y });
			pushIntoMap({ x: SIZE.GRID - x - 1, y: y });
			pushIntoMap({ x: x, y: SIZE.GRID - y - 1 });
			pushIntoMap({ x: SIZE.GRID - x - 1, y: SIZE.GRID - y - 1 });
		}
		function pushIntoMap(value) {
			map.push({ x: value.x, y: value.y });
		}
	}

	function drawFood() {
		food.forEach(value => {
			drawElement(ELEMENT.FOOD, value);
		});
	}

	function drawBackground() {
		ctx.fillStyle = COLOR.BACKGROUND;
		ctx.fillRect(0, 0, w, w);
	}

	function drawMap() {
		map.forEach(value => {
			drawElement(ELEMENT.BLOCK, value);
		});
	}
	function drawElement(ele, obj) {
		let x = obj.x * SIZE.BLOCK;
		let y = obj.y * SIZE.BLOCK;
		switch (ele) {
			case ELEMENT.BLOCK:
				ctx.fillStyle = COLOR.MAP;
				ctx.fillRect(x, y, SIZE.BLOCK, SIZE.BLOCK);
				break;
			case ELEMENT.FOOD:
				ctx.fillStyle = COLOR.FOOD;
				ctx.fillRect(x + SIZE.BLOCK / 3, y + SIZE.BLOCK / 3, SIZE.BLOCK / 3, SIZE.BLOCK / 3);
				break;
			case ELEMENT.CHERRY:
				ctx.fillStyle = COLOR.CHERRY;
				ctx.beginPath();
				ctx.arc(x + SIZE.BLOCK / 4, y + SIZE.BLOCK / 2, SIZE.BLOCK / 4, 0, 2 * Math.PI, false);
				ctx.arc(x + SIZE.BLOCK * 3 / 4, y + SIZE.BLOCK * 3 / 4, SIZE.BLOCK / 4, 0, 2 * Math.PI, false);
				ctx.fill();
				ctx.beginPath();
				ctx.moveTo(x + SIZE.BLOCK / 4, y + SIZE.BLOCK / 4);
				ctx.lineTo(x + SIZE.BLOCK, y);
				ctx.moveTo(x + SIZE.BLOCK * 3 / 4, y);
				ctx.lineTo(x + SIZE.BLOCK * 3 / 4, y + SIZE.BLOCK / 2);
				ctx.lineWidth = 3;
				ctx.strokeStyle = COLOR.CHERRY_BRANCH;
				ctx.stroke();
				break;
			case ELEMENT.GHOST:
				const pow = pacman.power / 100;
				let color = pow < 0 || pow == 1 || pow == 5 || pow == 9 || pow == 13 ? obj.color : COLOR.GHOST_WEAK;
				ctx.fillStyle = color;
				ctx.fillRect(x, y + SIZE.BLOCK / 2, SIZE.BLOCK, SIZE.BLOCK / 4);
				ctx.beginPath();
				ctx.arc(x + SIZE.BLOCK / 2, y + SIZE.BLOCK / 2, SIZE.BLOCK / 2, Math.PI, 0, false);
				for (let i = -3; i <= 3; i += 2) {
					ctx.arc(x + SIZE.BLOCK / 2 + SIZE.BLOCK * i / 8, y + SIZE.BLOCK / 2 + SIZE.BLOCK / 4, SIZE.BLOCK / 8, 0, Math.PI, false);
				}
				ctx.fill();
				ctx.fillStyle = COLOR.EYE;
				ctx.beginPath();
				ctx.arc(x + SIZE.BLOCK / 4, y + SIZE.BLOCK / 2, SIZE.BLOCK / 8, 0, 2 * Math.PI, false);
				ctx.arc(x + SIZE.BLOCK * 3 / 4, y + SIZE.BLOCK / 2, SIZE.BLOCK / 8, 0, 2 * Math.PI, false);
				ctx.fill();
				break;
		}
	}

	document.onkeydown = function (e) {
		switch (e.keyCode) {
			case 37:
				pacman.direction = DIRECTION.LEFT;
				pacman.y = Math.round(pacman.y);
				break;
			case 38:
				pacman.direction = DIRECTION.UP;
				pacman.x = Math.round(pacman.x);
				break;
			case 39:
				pacman.direction = DIRECTION.RIGHT;
				pacman.y = Math.round(pacman.y);
				break;
			case 40:
				pacman.direction = DIRECTION.DOWN;
				pacman.x = Math.round(pacman.x);
				break;
		}
	};
}

init();