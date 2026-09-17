// Game state variables
let gameBoard = ['', '', '', '', '', '', '', '', ''];
let currentPlayer = 'X';
let gameMode = 'pvp'; // 'pvp' or 'ai'
let gameActive = true;
let scores = { X: 0, O: 0, draws: 0 };

// Winning combinations
const winningConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6] // diagonals
];

/**
 * Creates floating particles for background animation
 */
function createParticles() {
    const particleCount = 50;
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 15 + 's';
        particle.style.animationDuration = (Math.random() * 10 + 10) + 's';
        document.body.appendChild(particle);
    }
}

/**
 * Sets the game mode (Player vs Player or Player vs AI)
 * @param {string} mode - 'pvp' or 'ai'
 */
function setGameMode(mode) {
    gameMode = mode;
    const buttons = document.querySelectorAll('.mode-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    
    // Find the button that was clicked and make it active
    const clickedButton = Array.from(buttons).find(btn => 
        (mode === 'pvp' && btn.textContent.includes('Player vs Player')) ||
        (mode === 'ai' && btn.textContent.includes('Player vs AI'))
    );
    
    if (clickedButton) {
        clickedButton.classList.add('active');
    }
    
    resetGame();
    
    const status = document.getElementById('gameStatus');
    if (mode === 'ai') {
        status.textContent = 'Playing against AI. You are X!';
    } else {
        status.textContent = 'Player vs Player mode. Player X starts!';
    }
}

/**
 * Handles player move
 * @param {number} index - Board position (0-8)
 */
function makeMove(index) {
    if (gameBoard[index] !== '' || !gameActive) return;

    gameBoard[index] = currentPlayer;
    updateBoard();

    if (checkWinner()) {
        handleGameEnd();
        return;
    }

    if (checkDraw()) {
        handleDraw();
        return;
    }

    switchPlayer();

    // AI move in AI mode
    if (gameMode === 'ai' && currentPlayer === 'O' && gameActive) {
        setTimeout(makeAIMove, 600); // Delay for better UX
    }
}

/**
 * Makes AI move
 */
function makeAIMove() {
    const bestMove = getBestMove();
    if (bestMove !== -1) {
        gameBoard[bestMove] = currentPlayer;
        updateBoard();

        if (checkWinner()) {
            handleGameEnd();
            return;
        }

        if (checkDraw()) {
            handleDraw();
            return;
        }

        switchPlayer();
    }
}

/**
 * Gets the best move for AI using minimax strategy
 * @returns {number} Best move index
 */
function getBestMove() {
    // Priority 1: Try to win
    for (let i = 0; i < 9; i++) {
        if (gameBoard[i] === '') {
            gameBoard[i] = 'O';
            if (checkWinForPlayer('O')) {
                gameBoard[i] = '';
                return i;
            }
            gameBoard[i] = '';
        }
    }

    // Priority 2: Block player from winning
    for (let i = 0; i < 9; i++) {
        if (gameBoard[i] === '') {
            gameBoard[i] = 'X';
            if (checkWinForPlayer('X')) {
                gameBoard[i] = '';
                return i;
            }
            gameBoard[i] = '';
        }
    }

    // Priority 3: Take center if available
    if (gameBoard[4] === '') return 4;

    // Priority 4: Take corners
    const corners = [0, 2, 6, 8];
    const availableCorners = corners.filter(corner => gameBoard[corner] === '');
    if (availableCorners.length > 0) {
        return availableCorners[Math.floor(Math.random() * availableCorners.length)];
    }

    // Priority 5: Take any available space
    const availableMoves = gameBoard
        .map((cell, index) => cell === '' ? index : null)
        .filter(val => val !== null);
    
    return availableMoves.length > 0 
        ? availableMoves[Math.floor(Math.random() * availableMoves.length)] 
        : -1;
}

/**
 * Checks if a specific player has won
 * @param {string} player - 'X' or 'O'
 * @returns {boolean} True if player has won
 */
function checkWinForPlayer(player) {
    return winningConditions.some(condition => {
        return condition.every(index => gameBoard[index] === player);
    });
}

/**
 * Updates the visual board with current game state
 */
function updateBoard() {
    const cells = document.querySelectorAll('.cell');
    cells.forEach((cell, index) => {
        cell.textContent = gameBoard[index];
        cell.className = 'cell';
        if (gameBoard[index] !== '') {
            cell.classList.add(gameBoard[index].toLowerCase());
        }
    });
}

/**
 * Checks for winning condition
 * @returns {boolean} True if there's a winner
 */
function checkWinner() {
    for (let condition of winningConditions) {
        const [a, b, c] = condition;
        if (gameBoard[a] && gameBoard[a] === gameBoard[b] && gameBoard[a] === gameBoard[c]) {
            // Highlight winning cells
            const cells = document.querySelectorAll('.cell');
            condition.forEach(index => {
                cells[index].classList.add('winning');
            });
            return true;
        }
    }
    return false;
}

/**
 * Checks for draw condition
 * @returns {boolean} True if game is a draw
 */
function checkDraw() {
    return gameBoard.every(cell => cell !== '');
}

/**
 * Handles game end when there's a winner
 */
function handleGameEnd() {
    gameActive = false;
    scores[currentPlayer]++;
    updateScore();
    
    const status = document.getElementById('gameStatus');
    status.textContent = `🎉 Player ${currentPlayer} wins!`;
    status.classList.add('winner');
}

/**
 * Handles game end when it's a draw
 */
function handleDraw() {
    gameActive = false;
    scores.draws++;
    updateScore();
    
    const status = document.getElementById('gameStatus');
    status.textContent = "🤝 It's a draw!";
    status.classList.add('draw');
}

/**
 * Switches current player
 */
function switchPlayer() {
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    document.getElementById('currentPlayerDisplay').textContent = currentPlayer;
    
    const status = document.getElementById('gameStatus');
    if (gameActive) {
        if (gameMode === 'ai') {
            status.textContent = currentPlayer === 'X' ? 'Your turn!' : 'AI is thinking...';
        } else {
            status.textContent = `Player ${currentPlayer}'s turn`;
        }
    }
}

/**
 * Updates the score display
 */
function updateScore() {
    document.getElementById('scoreX').textContent = `X: ${scores.X}`;
    document.getElementById('scoreO').textContent = `O: ${scores.O}`;
    document.getElementById('scoreDraw').textContent = `Draws: ${scores.draws}`;
}

/**
 * Resets the game to initial state
 */
function resetGame() {
    gameBoard = ['', '', '', '', '', '', '', '', ''];
    currentPlayer = 'X';
    gameActive = true;
    
    updateBoard();
    document.getElementById('currentPlayerDisplay').textContent = 'X';
    
    const status = document.getElementById('gameStatus');
    status.className = 'status';
    
    if (gameMode === 'ai') {
        status.textContent = 'New game started! You are X, make your move!';
    } else {
        status.textContent = 'New game started! Player X\'s turn';
    }
}

/**
 * Resets the score counters
 */
function resetScore() {
    scores = { X: 0, O: 0, draws: 0 };
    updateScore();
}

/**
 * Adds interactive mouse effects to background shapes
 */
function addMouseInteraction() {
    document.addEventListener('mousemove', (e) => {
        const shapes = document.querySelectorAll('.shape');
        shapes.forEach(shape => {
            const rect = shape.getBoundingClientRect();
            const isHovered = e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom;
            shape.style.transform = isHovered ? 'scale(1.1)' : 'scale(1)';
        });
    });
}
