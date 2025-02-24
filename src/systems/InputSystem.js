export class InputSystem {
    constructor(onShoot, onPause, onEndGame) {
        this.keys = {
            ArrowLeft: false,
            ArrowRight: false,
            ArrowUp: false,
            ArrowDown: false,
            Space: false
        };
        
        this.onShoot = onShoot;
        this.onPause = onPause;
        this.onEndGame = onEndGame;
        
        window.addEventListener('keydown', this.handleKeyDown.bind(this));
        window.addEventListener('keyup', this.handleKeyUp.bind(this));
    }
    
    handleKeyDown(e) {
        if (e.code in this.keys) {
            this.keys[e.code] = true;
            if (e.code === 'Space') {
                this.onShoot();
            }
        } else if (e.code === 'Escape') {
            this.onPause();
        } else if (e.code === 'KeyQ') {
            this.onEndGame();
        }
    }
    
    handleKeyUp(e) {
        if (e.code in this.keys) {
            this.keys[e.code] = false;
        }
    }
    
    isKeyPressed(key) {
        return this.keys[key];
    }
} 