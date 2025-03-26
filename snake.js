const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');

// Game elements
const GRID_SIZE = 20;
const INITIAL_SPEED = 150;
const COLORS = {
    snake: '#00FF00',
    snakeHead: '#00CC00',
    food: '#F7931A',
    background: '#111',
    text: '#FFFFFF',
    gameOver: '#FF0000'
};

// Game state
let snake = [];
let food = {};
let dx = 0;
let dy = 0;
let score = 0;
let speed = INITIAL_SPEED;
let gameInterval;
let isGameRunning = false;
let lastUpdateTime = 0;

// Controls
const upBtn = document.getElementById('upBtn');
const downBtn = document.getElementById('downBtn');
const leftBtn = document.getElementById('leftBtn');
const rightBtn = document.getElementById('rightBtn');

// Initialize game
initGame();

function initGame() {
    // Set up initial game state
    snake = [
        {x: 200, y: 200},
        {x: 180, y: 200},
        {x: 160, y: 200}
    ];
    generateFood();
    dx = GRID_SIZE;
    dy = 0;
    score = 0;
    speed = INITIAL_SPEED;
    isGameRunning = true;
    lastUpdateTime = 0;
    
    // Clear any existing interval
    if (gameInterval) clearInterval(gameInterval);
    
    // Start game loop
    gameInterval = setInterval(gameLoop, speed);
    
    // Update score display
    updateScore();
    
    // Draw initial state
    drawGame();
}

function generateFood() {
    const cols = canvas.width / GRID_SIZE;
    const rows = canvas.height / GRID_SIZE;
    
    let newFood;
    let isFoodValid = false;
    
    while (!isFoodValid) {
        newFood = {
            x: Math.floor(Math.random() * cols) * GRID_SIZE,
            y: Math.floor(Math.random() * rows) * GRID_SIZE
        };
        
        // Check if food spawns on snake
        isFoodValid = !snake.some(segment => 
            segment.x === newFood.x && segment.y === newFood.y
        );
    }
    
    food = newFood;
}

function drawGame() {
    // Clear canvas
    ctx.fillStyle = COLORS.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw food (Bitcoin symbol)
    ctx.fillStyle = COLORS.food;
    ctx.font = `${GRID_SIZE}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText("₿", food.x + GRID_SIZE/2, food.y + GRID_SIZE/2);
    
    // Draw snake
    snake.forEach((segment, index) => {
        ctx.fillStyle = index === 0 ? COLORS.snakeHead : COLORS.snake;
        ctx.fillRect(segment.x, segment.y, GRID_SIZE, GRID_SIZE);
        
        // Add border to segments
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.strokeRect(segment.x, segment.y, GRID_SIZE, GRID_SIZE);
    });
}

function updateGame() {
    if (!isGameRunning) return;
    
    // Create new head
    const head = {
        x: snake[0].x + dx,
        y: snake[0].y + dy
    };
    
    // Check collisions
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
        
        // Increase speed slightly every 5 points
        if (score % 5 === 0 && speed > 50) {
            speed -= 5;
            clearInterval(gameInterval);
            gameInterval = setInterval(gameLoop, speed);
        }
        
        generateFood();
    } else {
        // Remove tail if no food eaten
        snake.pop();
    }
}

function checkCollision(head) {
    // Wall collision
    if (head.x < 0 || head.y < 0 || 
        head.x >= canvas.width || head.y >= canvas.height) {
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

function gameOver() {
    isGameRunning = false;
    clearInterval(gameInterval);
    
    // Draw game over screen
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = COLORS.gameOver;
    ctx.font = '30px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('💀 Game Over!', canvas.width/2, canvas.height/2 - 30);
    
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, canvas.width/2, canvas.height/2 + 10);
    
    // Draw restart button
    ctx.fillStyle = COLORS.snake;
    ctx.fillRect(canvas.width/2 - 60, canvas.height/2 + 40, 120, 40);
    ctx.fillStyle = '#000';
    ctx.font = '18px Arial';
    ctx.fillText('Play Again', canvas.width/2, canvas.height/2 + 65);
}

function updateScore() {
    scoreElement.textContent = `Score: ${score}`;
}

function gameLoop() {
    updateGame();
    drawGame();
}

function changeDirection(newDx, newDy) {
    // Prevent 180-degree turns
    if ((dx !== 0 && newDx !== 0) || (dy !== 0 && newDy !== 0)) {
        return;
    }
    
    dx = newDx;
    dy = newDy;
}

// Event listeners
document.addEventListener('keydown', e => {
    if (!isGameRunning) return;
    
    switch(e.key) {
        case 'ArrowUp':
            changeDirection(0, -GRID_SIZE);
            break;
        case 'ArrowDown':
            changeDirection(0, GRID_SIZE);
            break;
        case 'ArrowLeft':
            changeDirection(-GRID_SIZE, 0);
            break;
        case 'ArrowRight':
            changeDirection(GRID_SIZE, 0);
            break;
    }
});

// Mobile controls
upBtn.addEventListener('click', () => changeDirection(0, -GRID_SIZE));
downBtn.addEventListener('click', () => changeDirection(0, GRID_SIZE));
leftBtn.addEventListener('click', () => changeDirection(-GRID_SIZE, 0));
rightBtn.addEventListener('click', () => changeDirection(GRID_SIZE, 0));

// Handle restart click
canvas.addEventListener('click', (e) => {
    if (!isGameRunning) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Check if click was on restart button
        if (x >= canvas.width/2 - 60 && x <= canvas.width/2 + 60 &&
            y >= canvas.height/2 + 40 && y <= canvas.height/2 + 80) {
            initGame();
        }
    }
});
