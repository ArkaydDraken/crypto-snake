const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const swipeArea = document.getElementById('swipeArea');

// Adjust canvas size for device pixel ratio
function resizeCanvas() {
    const size = Math.min(window.innerWidth - 40, 400);
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    canvas.width = size;
    canvas.height = size;
    
    // Redraw game if it was running
    if (isGameRunning) {
        drawGame();
    }
}

// Game settings
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
let touchStartX = 0;
let touchStartY = 0;

// Initialize game
resizeCanvas();
window.addEventListener('resize', resizeCanvas);
initGame();

function initGame() {
    // Clear existing interval
    if (gameInterval) clearInterval(gameInterval);
    
    // Set initial snake position (centered)
    const centerX = Math.floor(canvas.width / 2 / GRID_SIZE) * GRID_SIZE;
    const centerY = Math.floor(canvas.height / 2 / GRID_SIZE) * GRID_SIZE;
    
    snake = [
        {x: centerX, y: centerY},
        {x: centerX - GRID_SIZE, y: centerY},
        {x: centerX - GRID_SIZE * 2, y: centerY}
    ];
    
    generateFood();
    dx = GRID_SIZE;
    dy = 0;
    score = 0;
    speed = INITIAL_SPEED;
    isGameRunning = true;
    
    updateScore();
    gameInterval = setInterval(gameLoop, speed);
    drawGame();
}

function generateFood() {
    const cols = Math.floor(canvas.width / GRID_SIZE);
    const rows = Math.floor(canvas.height / GRID_SIZE);
    
    let newFood;
    let isFoodValid = false;
    let attempts = 0;
    const maxAttempts = 100;
    
    while (!isFoodValid && attempts < maxAttempts) {
        attempts++;
        newFood = {
            x: Math.floor(Math.random() * cols) * GRID_SIZE,
            y: Math.floor(Math.random() * rows) * GRID_SIZE
        };
        
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

// Touch controls
swipeArea.addEventListener('touchstart', handleTouchStart, {passive: false});
swipeArea.addEventListener('touchmove', handleTouchMove, {passive: false});

function handleTouchStart(e) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    e.preventDefault();
}

function handleTouchMove(e) {
    if (!isGameRunning) {
        // Check if tap was on restart button
        const touchX = e.touches[0].clientX;
        const touchY = e.touches[0].clientY;
        const rect = canvas.getBoundingClientRect();
        const x = touchX - rect.left;
        const y = touchY - rect.top;
        
        if (x >= canvas.width/2 - 60 && x <= canvas.width/2 + 60 &&
            y >= canvas.height/2 + 40 && y <= canvas.height/2 + 80) {
            initGame();
        }
        return;
    }
    
    const touchEndX = e.touches[0].clientX;
    const touchEndY = e.touches[0].clientY;
    
    const dx = touchEndX - touchStartX;
    const dy = touchEndY - touchStartY;
    
    // Determine primary direction
    if (Math.abs(dx) > Math.abs(dy)) {
        // Horizontal swipe
        if (dx > 0) {
            changeDirection(GRID_SIZE, 0); // Right
        } else {
            changeDirection(-GRID_SIZE, 0); // Left
        }
    } else {
        // Vertical swipe
        if (dy > 0) {
            changeDirection(0, GRID_SIZE); // Down
        } else {
            changeDirection(0, -GRID_SIZE); // Up
        }
    }
    
    e.preventDefault();
}

// Button controls
document.getElementById('upBtn').addEventListener('click', () => changeDirection(0, -GRID_SIZE));
document.getElementById('downBtn').addEventListener('click', () => changeDirection(0, GRID_SIZE));
document.getElementById('leftBtn').addEventListener('click', () => changeDirection(-GRID_SIZE, 0));
document.getElementById('rightBtn').addEventListener('click', () => changeDirection(GRID_SIZE, 0));

// Keyboard controls
document.addEventListener('keydown', e => {
    if (!isGameRunning) {
        if (e.key === ' ' || e.key === 'Enter') {
            initGame();
        }
        return;
    }
    
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

// Handle restart click on canvas
canvas.addEventListener('click', (e) => {
    if (!isGameRunning) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        if (x >= canvas.width/2 - 60 && x <= canvas.width/2 + 60 &&
            y >= canvas.height/2 + 40 && y <= canvas.height/2 + 80) {
            initGame();
        }
    }
});
