const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const gridSize = 20;
let snake = [{ x: 160, y: 200 }];
let food = { x: 200, y: 200 };
let dx = gridSize;
let dy = 0;
let score = 0;

function drawCell(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, gridSize - 2, gridSize - 2);
}

function drawFood() {
    ctx.font = "20px Arial";
    ctx.fillText("₿", food.x, food.y + gridSize);
}

function update() {
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };

    // Check collision
    if (head.x < 0 || head.y < 0 || head.x >= canvas.width || head.y >= canvas.height || snake.some(s => s.x === head.x && s.y === head.y)) {
        alert("💀 Game Over! Your score: " + score);
        document.location.reload();
    }

    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
        score++;
        food = {
            x: Math.floor(Math.random() * (canvas.width / gridSize)) * gridSize,
            y: Math.floor(Math.random() * (canvas.height / gridSize)) * gridSize
        };
    } else {
        snake.pop();
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawFood();
    snake.forEach(cell => drawCell(cell.x, cell.y, 'lime'));
}

document.addEventListener("keydown", e => {
    if (e.key === "ArrowUp" && dy === 0) { dx = 0; dy = -gridSize; }
    else if (e.key === "ArrowDown" && dy === 0) { dx = 0; dy = gridSize; }
    else if (e.key === "ArrowLeft" && dx === 0) { dx = -gridSize; dy = 0; }
    else if (e.key === "ArrowRight" && dx === 0) { dx = gridSize; dy = 0; }
});

setInterval(update, 100);
