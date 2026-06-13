// Canvas setup
const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

// Game variables
const paddleWidth = 10;
const paddleHeight = 80;
const ballSize = 8;

let gameRunning = false;

// Player paddle
const playerPaddle = {
    x: 10,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    maxSpeed: 6
};

// Computer paddle
const computerPaddle = {
    x: canvas.width - paddleWidth - 10,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    speed: 4
};

// Ball
const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    dx: 5,
    dy: 5,
    size: ballSize,
    maxSpeed: 8
};

// Scores
let playerScore = 0;
let computerScore = 0;

// Keyboard input
const keys = {};

// Mouse position
let mouseY = canvas.height / 2;

// Event listeners
document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

document.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseY = e.clientY - rect.top;
});

canvas.addEventListener('click', () => {
    gameRunning = true;
    document.getElementById('gameStatus').textContent = 'Game Running!';
});

// Update player paddle position
function updatePlayerPaddle() {
    // Mouse control
    const targetY = mouseY - playerPaddle.height / 2;
    
    // Arrow key control
    if (keys['ArrowUp']) {
        playerPaddle.dy = -playerPaddle.maxSpeed;
    } else if (keys['ArrowDown']) {
        playerPaddle.dy = playerPaddle.maxSpeed;
    } else {
        // Smoothly move towards mouse position
        const diff = targetY - playerPaddle.y;
        playerPaddle.dy = Math.max(-playerPaddle.maxSpeed, Math.min(playerPaddle.maxSpeed, diff * 0.1));
    }

    playerPaddle.y += playerPaddle.dy;

    // Keep paddle in bounds
    if (playerPaddle.y < 0) {
        playerPaddle.y = 0;
    } else if (playerPaddle.y + playerPaddle.height > canvas.height) {
        playerPaddle.y = canvas.height - playerPaddle.height;
    }
}

// Update computer paddle position (AI)
function updateComputerPaddle() {
    const computerCenter = computerPaddle.y + computerPaddle.height / 2;
    const ballCenter = ball.y;

    // AI follows the ball with some difficulty adjustment
    if (computerCenter < ballCenter - 35) {
        computerPaddle.y += computerPaddle.speed;
    } else if (computerCenter > ballCenter + 35) {
        computerPaddle.y -= computerPaddle.speed;
    }

    // Keep paddle in bounds
    if (computerPaddle.y < 0) {
        computerPaddle.y = 0;
    } else if (computerPaddle.y + computerPaddle.height > canvas.height) {
        computerPaddle.y = canvas.height - computerPaddle.height;
    }
}

// Update ball position
function updateBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Wall collision (top and bottom)
    if (ball.y - ball.size < 0) {
        ball.y = ball.size;
        ball.dy = -ball.dy;
    } else if (ball.y + ball.size > canvas.height) {
        ball.y = canvas.height - ball.size;
        ball.dy = -ball.dy;
    }

    // Paddle collision - Player
    if (
        ball.x - ball.size < playerPaddle.x + playerPaddle.width &&
        ball.y > playerPaddle.y &&
        ball.y < playerPaddle.y + playerPaddle.height
    ) {
        ball.x = playerPaddle.x + playerPaddle.width + ball.size;
        ball.dx = -ball.dx;

        // Add spin based on where ball hit the paddle
        const deltaY = ball.y - (playerPaddle.y + playerPaddle.height / 2);
        ball.dy += deltaY * 0.05;
        
        // Cap ball speed
        const speed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
        if (speed > ball.maxSpeed) {
            ball.dx = (ball.dx / speed) * ball.maxSpeed;
            ball.dy = (ball.dy / speed) * ball.maxSpeed;
        }
    }

    // Paddle collision - Computer
    if (
        ball.x + ball.size > computerPaddle.x &&
        ball.y > computerPaddle.y &&
        ball.y < computerPaddle.y + computerPaddle.height
    ) {
        ball.x = computerPaddle.x - ball.size;
        ball.dx = -ball.dx;

        // Add spin based on where ball hit the paddle
        const deltaY = ball.y - (computerPaddle.y + computerPaddle.height / 2);
        ball.dy += deltaY * 0.05;

        // Cap ball speed
        const speed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
        if (speed > ball.maxSpeed) {
            ball.dx = (ball.dx / speed) * ball.maxSpeed;
            ball.dy = (ball.dy / speed) * ball.maxSpeed;
        }
    }

    // Scoring
    if (ball.x < 0) {
        computerScore++;
        resetBall();
    } else if (ball.x > canvas.width) {
        playerScore++;
        resetBall();
    }
}

// Reset ball to center
function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = (Math.random() > 0.5 ? 1 : -1) * 5;
    ball.dy = (Math.random() - 0.5) * 6;
}

// Draw functions
function drawPaddle(paddle) {
    ctx.fillStyle = '#00ff88';
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
    ctx.shadowColor = '#00ff88';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
}

function drawBall() {
    ctx.fillStyle = '#ff6b6b';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowColor = '#ff6b6b';
    ctx.shadowBlur = 15;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
}

function drawCenterLine() {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
}

function drawGame() {
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw center line
    drawCenterLine();

    // Draw paddles and ball
    drawPaddle(playerPaddle);
    drawPaddle(computerPaddle);
    drawBall();

    // Reset shadow
    ctx.shadowBlur = 0;
}

// Update scores display
function updateScores() {
    document.getElementById('playerScore').textContent = playerScore;
    document.getElementById('computerScore').textContent = computerScore;
}

// Game loop
function gameLoop() {
    if (gameRunning) {
        updatePlayerPaddle();
        updateComputerPaddle();
        updateBall();
        updateScores();
    }

    drawGame();
    requestAnimationFrame(gameLoop);
}

// Start the game loop
gameLoop();
