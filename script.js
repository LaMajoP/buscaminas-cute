class Minesweeper {
    constructor() {
        this.board = [];
        this.rows = 0;
        this.cols = 0;
        this.mines = 0;
        this.gameOver = false;
        this.firstClick = true;
        this.minesLeft = 0;
        this.timer = 0;
        this.timerInterval = null;

        this.difficulties = {
            easy: { rows: 8, cols: 8, mines: 10 },
            medium: { rows: 12, cols: 12, mines: 30 },
            hard: { rows: 16, cols: 16, mines: 50 }
        };

        this.initializeGame('easy');
        this.setupEventListeners();
    }

    initializeGame(difficulty) {
        const config = this.difficulties[difficulty];
        this.rows = config.rows;
        this.cols = config.cols;
        this.mines = config.mines;
        this.minesLeft = this.mines;
        this.gameOver = false;
        this.firstClick = true;
        this.board = [];
        this.stopTimer();
        this.timer = 0;
        document.getElementById('time').textContent = '0';
        document.getElementById('mines-count').textContent = this.minesLeft;

        this.createBoard();
        this.renderBoard();
    }

    createBoard() {
        for (let i = 0; i < this.rows; i++) {
            this.board[i] = [];
            for (let j = 0; j < this.cols; j++) {
                this.board[i][j] = {
                    isMine: false,
                    isRevealed: false,
                    isFlagged: false,
                    neighborMines: 0
                };
            }
        }
    }

    placeMines(firstRow, firstCol) {
        let minesPlaced = 0;
        while (minesPlaced < this.mines) {
            const row = Math.floor(Math.random() * this.rows);
            const col = Math.floor(Math.random() * this.cols);
            
            // Evitar colocar mina en la primera celda clickeada o alrededor
            if (Math.abs(row - firstRow) <= 1 && Math.abs(col - firstCol) <= 1) {
                continue;
            }

            if (!this.board[row][col].isMine) {
                this.board[row][col].isMine = true;
                minesPlaced++;
            }
        }

        this.calculateNeighborMines();
    }

    calculateNeighborMines() {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                if (!this.board[i][j].isMine) {
                    let count = 0;
                    for (let di = -1; di <= 1; di++) {
                        for (let dj = -1; dj <= 1; dj++) {
                            const ni = i + di;
                            const nj = j + dj;
                            if (ni >= 0 && ni < this.rows && nj >= 0 && nj < this.cols) {
                                if (this.board[ni][nj].isMine) count++;
                            }
                        }
                    }
                    this.board[i][j].neighborMines = count;
                }
            }
        }
    }

    renderBoard() {
        const boardElement = document.getElementById('board');
        boardElement.style.gridTemplateColumns = `repeat(${this.cols}, 40px)`;
        boardElement.innerHTML = '';

        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                const cell = document.createElement('button');
                cell.className = 'cell';
                cell.dataset.row = i;
                cell.dataset.col = j;
                boardElement.appendChild(cell);
            }
        }
    }

    revealCell(row, col) {
        if (this.gameOver || this.board[row][col].isFlagged || this.board[row][col].isRevealed) {
            return;
        }

        if (this.firstClick) {
            this.firstClick = false;
            this.placeMines(row, col);
            this.startTimer();
        }

        this.board[row][col].isRevealed = true;
        const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);

        if (this.board[row][col].isMine) {
            this.gameOver = true;
            cell.innerHTML = '💥';
            cell.classList.add('mine');
            this.revealAllMines();
            this.showGameMessage('¡Game Over! 😢');
            this.stopTimer();
            return;
        }

        cell.classList.add('revealed');
        
        if (this.board[row][col].neighborMines > 0) {
            cell.textContent = this.board[row][col].neighborMines;
            cell.dataset.number = this.board[row][col].neighborMines;
        } else {
            // Revelar celdas vecinas si no hay minas cercanas
            for (let di = -1; di <= 1; di++) {
                for (let dj = -1; dj <= 1; dj++) {
                    const ni = row + di;
                    const nj = col + dj;
                    if (ni >= 0 && ni < this.rows && nj >= 0 && nj < this.cols) {
                        if (!this.board[ni][nj].isRevealed) {
                            this.revealCell(ni, nj);
                        }
                    }
                }
            }
        }

        if (this.checkWin()) {
            this.gameOver = true;
            this.showGameMessage('¡Felicitaciones! ¡Has ganado! 🎉');
            this.stopTimer();
        }
    }

    toggleFlag(row, col) {
        if (this.gameOver || this.board[row][col].isRevealed) {
            return;
        }

        const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        
        if (this.board[row][col].isFlagged) {
            this.board[row][col].isFlagged = false;
            cell.innerHTML = '';
            cell.classList.remove('flagged');
            this.minesLeft++;
        } else {
            this.board[row][col].isFlagged = true;
            cell.innerHTML = '🚩';
            cell.classList.add('flagged');
            this.minesLeft--;
        }

        document.getElementById('mines-count').textContent = this.minesLeft;
    }

    revealAllMines() {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                if (this.board[i][j].isMine) {
                    const cell = document.querySelector(`[data-row="${i}"][data-col="${j}"]`);
                    cell.innerHTML = '💣';
                    cell.classList.add('mine');
                }
            }
        }
    }

    checkWin() {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                if (!this.board[i][j].isMine && !this.board[i][j].isRevealed) {
                    return false;
                }
            }
        }
        return true;
    }

    startTimer() {
        this.timerInterval = setInterval(() => {
            this.timer++;
            document.getElementById('time').textContent = this.timer;
        }, 1000);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    showGameMessage(message) {
        const messageElement = document.getElementById('game-message');
        document.getElementById('message-text').textContent = message;
        messageElement.classList.remove('hidden');
    }

    setupEventListeners() {
        const boardElement = document.getElementById('board');
        boardElement.addEventListener('click', (e) => {
            if (e.target.classList.contains('cell')) {
                const row = parseInt(e.target.dataset.row);
                const col = parseInt(e.target.dataset.col);
                this.revealCell(row, col);
            }
        });

        boardElement.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            if (e.target.classList.contains('cell')) {
                const row = parseInt(e.target.dataset.row);
                const col = parseInt(e.target.dataset.col);
                this.toggleFlag(row, col);
            }
        });

        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const difficulty = btn.dataset.difficulty;
                this.initializeGame(difficulty);
            });
        });

        document.getElementById('new-game-btn').addEventListener('click', () => {
            this.initializeGame('easy');
        });

        document.getElementById('restart-btn').addEventListener('click', () => {
            document.getElementById('game-message').classList.add('hidden');
            this.initializeGame('easy');
        });
    }
}

// Iniciar el juego cuando se carga la página
window.addEventListener('DOMContentLoaded', () => {
    new Minesweeper();
});