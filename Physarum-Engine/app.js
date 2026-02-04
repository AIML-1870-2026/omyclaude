/**
 * Physarum Transport Engine - Main Application
 * Initialization, render loop, and UI bindings
 */

class PhysarumApp {
    constructor() {
        // Canvas setup
        this.canvas = document.getElementById('simulation-canvas');
        this.ctx = this.canvas.getContext('2d');

        // Set canvas size
        this.width = CONFIG.canvas.width;
        this.height = CONFIG.canvas.height;
        this.canvas.width = this.width;
        this.canvas.height = this.height;

        // Initialize simulation components
        this.trailMap = new TrailMap(this.width, this.height);
        this.engine = new PhysarumEngine(this.width, this.height, CONFIG.agents.count);

        // Spawn agents in center circle for interesting initial pattern
        this.engine.initializeCircular(this.width / 2, this.height / 2, this.width / 4);

        // FPS tracking
        this.lastTime = performance.now();
        this.frameCount = 0;
        this.fps = 0;
        this.fpsUpdateInterval = 500; // Update FPS display every 500ms
        this.lastFpsUpdate = 0;

        // Animation state
        this.isRunning = true;
        this.animationId = null;

        // Bind UI controls
        this.bindControls();

        // Start the simulation
        this.loop();
    }

    bindControls() {
        // Agent count slider
        const agentSlider = document.getElementById('agent-count');
        const agentValue = document.getElementById('agent-count-value');
        if (agentSlider) {
            agentSlider.addEventListener('input', (e) => {
                const count = parseInt(e.target.value);
                agentValue.textContent = this.formatNumber(count);
                this.engine.resize(count);
            });
        }

        // Sensor angle slider
        const sensorAngleSlider = document.getElementById('sensor-angle');
        const sensorAngleValue = document.getElementById('sensor-angle-value');
        if (sensorAngleSlider) {
            sensorAngleSlider.addEventListener('input', (e) => {
                const degrees = parseFloat(e.target.value);
                sensorAngleValue.textContent = degrees + '\u00B0';
                this.engine.setSensorAngle(degrees * Math.PI / 180);
            });
        }

        // Sensor distance slider
        const sensorDistSlider = document.getElementById('sensor-distance');
        const sensorDistValue = document.getElementById('sensor-distance-value');
        if (sensorDistSlider) {
            sensorDistSlider.addEventListener('input', (e) => {
                const dist = parseFloat(e.target.value);
                sensorDistValue.textContent = dist + 'px';
                this.engine.setSensorDistance(dist);
            });
        }

        // Move speed slider
        const speedSlider = document.getElementById('move-speed');
        const speedValue = document.getElementById('move-speed-value');
        if (speedSlider) {
            speedSlider.addEventListener('input', (e) => {
                const speed = parseFloat(e.target.value);
                speedValue.textContent = speed.toFixed(1);
                this.engine.setMoveSpeed(speed);
            });
        }

        // Decay rate slider
        const decaySlider = document.getElementById('decay-rate');
        const decayValue = document.getElementById('decay-rate-value');
        if (decaySlider) {
            decaySlider.addEventListener('input', (e) => {
                const rate = parseFloat(e.target.value);
                decayValue.textContent = rate.toFixed(3);
                this.trailMap.setDecayRate(rate);
            });
        }

        // Deposit amount slider
        const depositSlider = document.getElementById('deposit-amount');
        const depositValue = document.getElementById('deposit-amount-value');
        if (depositSlider) {
            depositSlider.addEventListener('input', (e) => {
                const amount = parseFloat(e.target.value);
                depositValue.textContent = amount;
                this.trailMap.setDepositAmount(amount);
            });
        }

        // Reset button
        const resetBtn = document.getElementById('reset-btn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.reset());
        }

        // Pause/Play button
        const pauseBtn = document.getElementById('pause-btn');
        if (pauseBtn) {
            pauseBtn.addEventListener('click', () => this.togglePause());
        }

        // Clear region on click (for testing dynamic rerouting)
        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = (e.clientX - rect.left) * (this.width / rect.width);
            const y = (e.clientY - rect.top) * (this.height / rect.height);
            this.trailMap.clearRegion(x, y, 50);
        });
    }

    formatNumber(num) {
        if (num >= 1000) {
            return (num / 1000).toFixed(0) + 'k';
        }
        return num.toString();
    }

    reset() {
        // Reset trail map
        this.trailMap.clear();

        // Reinitialize agents
        this.engine.initializeCircular(this.width / 2, this.height / 2, this.width / 4);

        // Reset sliders to default values
        this.resetSliders();
    }

    resetSliders() {
        const defaults = {
            'agent-count': CONFIG.agents.count,
            'sensor-angle': CONFIG.sensor.angle * 180 / Math.PI,
            'sensor-distance': CONFIG.sensor.distance,
            'move-speed': CONFIG.agents.speed,
            'decay-rate': CONFIG.trail.decayRate,
            'deposit-amount': CONFIG.trail.depositAmount
        };

        for (const [id, value] of Object.entries(defaults)) {
            const slider = document.getElementById(id);
            if (slider) {
                slider.value = value;
                slider.dispatchEvent(new Event('input'));
            }
        }
    }

    togglePause() {
        this.isRunning = !this.isRunning;
        const pauseBtn = document.getElementById('pause-btn');
        if (pauseBtn) {
            pauseBtn.textContent = this.isRunning ? 'Pause' : 'Play';
        }
        if (this.isRunning) {
            this.lastTime = performance.now();
            this.loop();
        }
    }

    update() {
        // Deposit pheromones at agent positions
        this.engine.deposit(this.trailMap, this.trailMap.depositAmount);

        // Update trail map (diffusion + decay)
        this.trailMap.update();

        // Update agents (sensing + steering + movement)
        this.engine.update(this.trailMap);
    }

    render() {
        // Render trail map to canvas
        this.trailMap.render(this.ctx);
    }

    updateFPS() {
        const now = performance.now();
        this.frameCount++;

        if (now - this.lastFpsUpdate >= this.fpsUpdateInterval) {
            this.fps = Math.round(this.frameCount * 1000 / (now - this.lastFpsUpdate));
            this.frameCount = 0;
            this.lastFpsUpdate = now;

            // Update FPS display
            const fpsDisplay = document.getElementById('fps-value');
            if (fpsDisplay) {
                fpsDisplay.textContent = this.fps;
            }

            // Update agent count display
            const agentDisplay = document.getElementById('current-agents');
            if (agentDisplay) {
                agentDisplay.textContent = this.formatNumber(this.engine.agentCount);
            }
        }
    }

    loop() {
        if (!this.isRunning) return;

        this.update();
        this.render();
        this.updateFPS();

        this.animationId = requestAnimationFrame(() => this.loop());
    }

    // Clean up
    destroy() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
}

// Initialize app when DOM is ready
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new PhysarumApp();
});
