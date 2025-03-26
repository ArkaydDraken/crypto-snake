const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');

// Game settings
const GRID_SIZE = 20;
const GAME_SPEED = 150; // ms
const SNAKE_COLOR = '#00FF00';
const FOOD_COLOR = '#F7931A'; // Bitcoin orange

// Game state
let snake = [
    { x: 200, y: 200 },
    { x: 180, y: 200 },
    { x: 160, y: 200 }
];
let food = generateFood();
let dx = GRID_SIZE;
let dy = 0;
let score = 0;
let gameInterval;
let isGameRunning = true;

// Initialize game
startGame();

function startGame() {
    document.addEventListener('keydown', changeDirection);
    gameInterval = setInterval(main, GAME_SPEED);
}

function generateFood() {
    const cols = canvas.width / GRID_SIZE;
    const rows = canvas.height / GRID_SIZE;
    
    let newFood;
    do {
        newFood = {
            x: Math.floor(Math.random() * cols) * GRID_SIZE,
            y: Math.floor(Math.random() * rows) * GRID_SIZE
        };
    } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    
    return newFood;
}

function drawFood() {
    ctx.fillStyle = FOOD_COLOR;
    ctx.font = `${GRID_SIZE}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText("₿", food.x + GRID_SIZE/2, food.y + GRID_SIZE/2);
}

function drawSnake() {
    snake.forEach((segment, index) => {
        ctx.fillStyle = index === 0 ? '#00CC00' : SNAKE_COLOR; // Head is darker
        ctx.fillRect(segment.x, segment.y, GRID_SIZE, GRID_SIZE);
        
        // Add borders to segments
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.strokeRect(segment.x, segment.y, GRID_SIZE, GRID_SIZE);
    });
}

function changeDirection(event) {
    const keyPressed = event.key;
    const goingUp = dy === -GRID_SIZE;
    const goingDown = dy === GRID_SIZE;
    const goingRight = dx === GRID_SIZE;
    const goingLeft = dx === -GRID_SIZE;

    if (keyPressed === 'ArrowUp' && !goingDown) {
        dx = 0;
        dy = -GRID_SIZE;
    } else if (keyPressed === 'ArrowDown' && !goingUp) {
        dx = 0;
        dy = GRID_SIZE;
    } else if (keyPressed === 'ArrowLeft' && !goingRight) {
        dx = -GRID_SIZE;
        dy = 0;
    } else if (keyPressed === 'ArrowRight' && !goingLeft) {
        dx = GRID_SIZE;
        dy = 0;
    }
}

function checkCollision(head) {
    // Wall collision
    if (
        head.x < 0 ||
        head.y < 0 ||
        head.x >= canvas.width ||
        head.y >= canvas.height
    ) {
        return true;
    }
    
    // Self collision (skip head)
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }
    
    return false;
}

function updateScore() {
    scoreElement.textContent = `Score: ${score}`;
}

function gameOver() {
    isGameRunning = false;
    clearInterval(gameInterval);
    
    // Show game over message
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#FF0000';
    ctx.font = '30px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('💀 Game Over!', canvas.width/2, canvas.height/2 - 30);
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, canvas.width/2, canvas.height/2 + 10);
    ctx.fillText('Press F5 to restart', canvas.width/2, canvas.height/2 + 40);
}

function main() {
    if (!isGameRunning) return;
    
    // Create new head
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };
    
    // Check collision
    if (checkCollision(head)) {
        gameOver();
        return;
    }
    
    // Add new head
    snake.unshift(head);
    
    // Check if food eaten
    if (head.x === food.x && head.y === food.y) {
        score++;
        updateScore();
        food = generateFood();
    } else {
        // Remove tail if no food eaten
        snake.pop();
    }
    
    // Clear canvas and redraw everything
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawFood();
    drawSnake();
}
