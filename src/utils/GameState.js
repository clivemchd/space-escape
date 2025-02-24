export class GameState {
    constructor() {
        this.reset();
    }

    reset() {
        this.score = 0;
        this.lives = 3;
        this.isGameOver = false;
        this.isPaused = false;
        this.speed = 0.1;
        this.updateDisplay();
    }

    updateScore(amount) {
        this.score += amount;
        this.updateDisplay();
    }

    decreaseLives(amount) {
        this.lives -= amount;
        this.updateDisplay();
        if (this.lives <= 0) {
            this.gameOver();
        }
    }

    updateDisplay() {
        document.getElementById('score-value').textContent = Math.floor(this.score);
        
        // Update hearts display
        const hearts = document.querySelectorAll('.heart');
        hearts.forEach((heart, index) => {
            const lifeForThisHeart = this.lives - index;
            
            if (lifeForThisHeart >= 1) {
                heart.className = 'heart full';
            } else if (lifeForThisHeart === 0.5) {
                heart.className = 'heart half';
            } else {
                heart.className = 'heart empty';
            }
        });
    }

    increaseSpeed(amount) {
        this.speed += amount;
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        const pauseScreen = document.getElementById('pause-screen');
        if (this.isPaused) {
            pauseScreen.classList.remove('hidden');
        } else {
            pauseScreen.classList.add('hidden');
        }
    }

    endGame() {
        this.isGameOver = true;
        this.gameOver();
    }

    gameOver() {
        this.isGameOver = true;
        document.getElementById('game-over').classList.remove('hidden');
        document.getElementById('final-score').textContent = Math.floor(this.score);
    }
} 