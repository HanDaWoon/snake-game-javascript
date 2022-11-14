let game;
let canvas = document.getElementById("snake"); // criar elemento que irá rodar o jogo
let context = canvas.getContext("2d");
let scoreShow = document.getElementById("score");
let btnHow = document.getElementById("btn-how");
let box = 32;
let score = 0;
let interval = 250;
let scores;
let useSlow = false;
let direction = "right";

let snake = []; // criar cobrinha como lista, já que ela vai ser uma série de coordenadas, que quando pintadas, criam os quadradinhos

snake[0] = {
	x: 8 * box,
	y: 8 * box,
};

let food = {
	x: Math.floor(Math.random() * 15 + 1) * box,
	y: Math.floor(Math.random() * 15 + 1) * box,
};

function createBG() {
	context.fillStyle = "white";
	context.fillRect(0, 0, 16 * box, 16 * box); // desenha o retângulo usando x e y e a largura e altura setadas
}

function createSnake() {
	for (i = 0; i < snake.length; i++) {
		context.fillStyle = "darkgreen";
		context.fillRect(snake[i].x, snake[i].y, box, box);
	}
}

function createFood() {
	context.fillStyle = "rgb(151, 94, 109)";
	context.fillRect(food.x, food.y, box, box);
}

document.addEventListener("keydown", update); // quando um evento acontece, detecta e chama uma função

function update(event) {
	if (event.keyCode == 37 && direction != "right") direction = "left";
	if (event.keyCode == 38 && direction != "down") direction = "up";
	if (event.keyCode == 39 && direction != "left") direction = "right";
	if (event.keyCode == 40 && direction != "up") direction = "down";
	// use slowdown
	if (event.keyCode == 32) {
		if (!useSlow) slowDown();
	}
}

let count = 0;
function startGame() {
	count += 1;
	if (count < interval / 10) return;
	count = 0;

	if (snake[0].x > 15 * box && direction == "right") snake[0].x = 0;
	if (snake[0].x < 0 && direction == "left") snake[0].x = 16 * box;
	if (snake[0].y > 15 * box && direction == "down") snake[0].y = 0;
	if (snake[0].y < 0 && direction == "up") snake[0].y = 16 * box;

	for (i = 1; i < snake.length; i++) {
		if (snake[0].x == snake[i].x && snake[0].y == snake[i].y) {
			clearInterval(game);
			alert("Game Over :(");
			endGame();
		}
	}

	createBG();
	createSnake();
	createFood();

	let snakeX = snake[0].x;
	let snakeY = snake[0].y;

	if (direction == "right") snakeX += box;
	if (direction == "left") snakeX -= box;
	if (direction == "up") snakeY -= box;
	if (direction == "down") snakeY += box;

	if (snakeX != food.x || snakeY != food.y) {
		snake.pop(); // pop tira o último elemento da lista
	} else {
		food.x = Math.floor(Math.random() * 15 + 1) * box;
		food.y = Math.floor(Math.random() * 15 + 1) * box;
		scoreCnt();
		speedUp();
	}

	let newHead = {
		x: snakeX,
		y: snakeY,
	};

	snake.unshift(newHead); // método unshift adiciona o primeiro quadrado da cobrinha
}

// end game
const endGame = () => {
	clearInterval(game);

	canvas.style.display = "none";
	let endDiv = document.createElement("div");
	let stable = document.createElement("table");
	let endT3 = document.createElement("t3");
	let btnRestart = document.createElement("button");
	endDiv.innerHTML = '<div class="end-game"><h1>Game Over</h1>';
	stable.innerHTML = "<tr><th>Player</th><th>Score</th></tr>";
	scores.forEach((k) => {
		stable.innerHTML += `<tr><td>${k.player}</td><td>${k.score}</td></tr>`;
	});
	endT3.innerHTML +=
		'<input type="text" id="player-name" placeholder="Player Name" />';
	endT3.innerHTML += '<button id="btn-post">Save score</button></div>';
	endDiv.appendChild(stable);
	endDiv.appendChild(endT3);
	btnRestart.innerHTML = "Restart";
	btnRestart.id = "btn-restart";
	btnRestart.style.margin = "10px";
	endDiv.appendChild(btnRestart);
	document.getElementById("bb").appendChild(endDiv);
	document.getElementById("btn-post").addEventListener("click", postScore);
	document.getElementById("btn-restart").addEventListener("click", restart);
};

// restart game
const restart = () => {
	document.getElementById("bb").remove();
	interval = 250;
	score = 0;
	scoreCnt();
	// set snake to initial position and direction
	snake = [];
	snake[0] = {
		x: 8 * box,
		y: 8 * box,
	};
	canvas.style.display = "block";
	startInterval(10);
};

// score counter
const scoreCnt = () => {
	score = snake.length;
	scoreShow.innerText = score;
};

// slow down
const slowDown = () => {
	speedDown();
	useSlow = true;
};

const startInterval = (_interval) => {
	game = setInterval(startGame, _interval);
};
const speedUp = () => {
	interval -= 10;
};
const speedDown = () => {
	interval += 300;
	setTimeout(() => {
		interval -= 100;
	}, 5000);
};

const getScore = () => {
	fetch("http://localhost:8081/scores?_sort=score&_order=desc&_limit=5", {
		method: "GET",
	})
		.then((res) => {
			if (res.ok == true) return res.json();
		})
		.then((res) => {
			scores = res;
		});
};

const postScore = () => {
	player = document.getElementById("player-name").value;
	fetch("http://localhost:8081/scores", {
		method: "POST",
		headers: {
			Aceept: "application/json",
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			player: player,
			score: score,
		}),
	})
		.then((res) => {
			if (res.ok == true) alert("Score posted");
		})
		.then(() => location.reload());
};

btnHow.addEventListener("click", () => {
	alert(
		"Use the arrow keys to move the snake and use space to slow down !Only use space once!"
	);
});

getScore();
startInterval(10);
