const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const restartBtn = document.getElementById('restartBtn');

// Настройки игры
const GRID_SIZE = 20;
const INITIAL_SPEED = 150;
const COLORS = {
    snake: '#00FF00',
    snakeHead: '#00CC00',
    food: '#F7931A',
    background: '#111',
    text: '#FFFFFF',
    gameOver: '#FF0000',
    wall: '#333333'
};

// Состояние игры
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

// Инициализация игры
resizeCanvas();
window.addEventListener('resize', resizeCanvas);
initGame();

// Изменение размера canvas
function resizeCanvas() {
    const size = Math.min(window.innerWidth - 40, 400);
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    canvas.width = size;
    canvas.height = size;
    
    if (isGameRunning) {
        drawGame();
    }
}

// Основная функция инициализации игры
function initGame() {
    // Очистка предыдущего интервала
    if (gameInterval) clearInterval(gameInterval);
    
    // Установка начальной позиции змейки (по центру)
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
    restartBtn.style.display = 'none';
    
    updateScore();
    gameInterval = setInterval(gameLoop, speed);
    drawGame();
}

// Генерация еды
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

// Отрисовка игры
function drawGame() {
    // Очистка canvas
    ctx.fillStyle = COLORS.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Отрисовка границ
    ctx.strokeStyle = COLORS.wall;
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);
    
    // Отрисовка еды (символ биткоина)
    ctx.fillStyle = COLORS.food;
    ctx.font = `${GRID_SIZE}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText("₿", food.x + GRID_SIZE/2, food.y + GRID_SIZE/2);
    
    // Отрисовка змейки
    snake.forEach((segment, index) => {
        ctx.fillStyle = index === 0 ? COLORS.snakeHead : COLORS.snake;
        ctx.fillRect(segment.x, segment.y, GRID_SIZE, GRID_SIZE);
        
        // Границы сегментов
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.strokeRect(segment.x, segment.y, GRID_SIZE, GRID_SIZE);
    });
}

// Обновление игрового состояния
function updateGame() {
    if (!isGameRunning) return;
    
    // Создание новой головы с проверкой выхода за границы
    let head = {
        x: snake[0].x + dx,
        y: snake[0].y + dy
    };
    
    // Прохождение сквозь стены
    if (head.x < 0) head.x = canvas.width - GRID_SIZE;
    if (head.x >= canvas.width) head.x = 0;
    if (head.y < 0) head.y = canvas.height - GRID_SIZE;
    if (head.y >= canvas.height) head.y = 0;
    
    // Проверка столкновения с собой
    if (checkSelfCollision(head)) {
        gameOver();
        return;
    }
    
    // Добавление новой головы
    snake.unshift(head);
    
    // Проверка съедена ли еда
    if (head.x === food.x && head.y === food.y) {
        score++;
        updateScore();
        
        // Увеличение скорости каждые 5 очков
        if (score % 5 === 0 && speed > 50) {
            speed -= 5;
            clearInterval(gameInterval);
            gameInterval = setInterval(gameLoop, speed);
        }
        
        generateFood();
    } else {
        // Удаление хвоста если еда не съедена
        snake.pop();
    }
}

// Проверка столкновения с собой
function checkSelfCollision(head) {
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }
    return false;
}

// Конец игры
function gameOver() {
    isGameRunning = false;
    clearInterval(gameInterval);
    
    // Отрисовка экрана конца игры
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = COLORS.gameOver;
    ctx.font = '30px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('💀 Конец игры!', canvas.width/2, canvas.height/2 - 30);
    
    ctx.font = '20px Arial';
    ctx.fillText(`Счёт: ${score}`, canvas.width/2, canvas.height/2 + 10);
    
    // Показ кнопки рестарта
    restartBtn.style.display = 'block';
}

// Обновление счёта
function updateScore() {
    scoreElement.textContent = score;
}

// Основной игровой цикл
function gameLoop() {
    updateGame();
    drawGame();
}

// Изменение направления
function changeDirection(newDx, newDy) {
    // Запрет разворота на 180 градусов
    if ((dx !== 0 && newDx !== 0) || (dy !== 0 && newDy !== 0)) {
        return;
    }
    
    dx = newDx;
    dy = newDy;
}

// Обработчики событий для кнопок управления
document.getElementById('upBtn').addEventListener('click', () => changeDirection(0, -GRID_SIZE));
document.getElementById('downBtn').addEventListener('click', () => changeDirection(0, GRID_SIZE));
document.getElementById('leftBtn').addEventListener('click', () => changeDirection(-GRID_SIZE, 0));
document.getElementById('rightBtn').addEventListener('click', () => changeDirection(GRID_SIZE, 0));

// Обработчик кнопки рестарта
restartBtn.addEventListener('click', initGame);

// Управление с клавиатуры
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

// Свайпы для мобильных устройств
canvas.addEventListener('touchstart', handleTouchStart, {passive: false});
canvas.addEventListener('touchmove', handleTouchMove, {passive: false});

function handleTouchStart(e) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    e.preventDefault();
}

function handleTouchMove(e) {
    if (!isGameRunning) return;
    
    const touchEndX = e.touches[0].clientX;
    const touchEndY = e.touches[0].clientY;
    
    const dx = touchEndX - touchStartX;
    const dy = touchEndY - touchStartY;
    
    // Определение направления свайпа
    if (Math.abs(dx) > Math.abs(dy)) {
        // Горизонтальный свайп
        if (dx > 0) {
            changeDirection(GRID_SIZE, 0); // Вправо
        } else {
            changeDirection(-GRID_SIZE, 0); // Влево
        }
    } else {
        // Вертикальный свайп
        if (dy > 0) {
            changeDirection(0, GRID_SIZE); // Вниз
        } else {
            changeDirection(0, -GRID_SIZE); // Вверх
        }
    }
    
    e.preventDefault();
}
