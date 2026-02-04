/**
 * Physarum Transport Engine - Core Engine
 * Handles agent state, sensing, and steering using vectorized operations
 */

class PhysarumEngine {
    constructor(width, height, agentCount) {
        this.width = width;
        this.height = height;
        this.agentCount = agentCount;

        // Agent state as TypedArrays for performance
        // Each agent has: x, y position and theta (heading angle)
        this.positionsX = new Float32Array(agentCount);
        this.positionsY = new Float32Array(agentCount);
        this.headings = new Float32Array(agentCount);

        // Sensor parameters (can be updated in real-time)
        this.sensorAngle = CONFIG.sensor.angle;
        this.sensorDistance = CONFIG.sensor.distance;
        this.moveSpeed = CONFIG.agents.speed;
        this.turnAngle = CONFIG.steering.turnAngle;

        // Initialize agents with random positions and headings
        this.initializeAgents();
    }

    initializeAgents() {
        for (let i = 0; i < this.agentCount; i++) {
            // Random position within bounds
            this.positionsX[i] = Math.random() * this.width;
            this.positionsY[i] = Math.random() * this.height;
            // Random heading (0 to 2π)
            this.headings[i] = Math.random() * Math.PI * 2;
        }
    }

    // Spawn agents in a circular pattern (for interesting initial conditions)
    initializeCircular(centerX, centerY, radius) {
        for (let i = 0; i < this.agentCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const r = Math.random() * radius;
            this.positionsX[i] = centerX + Math.cos(angle) * r;
            this.positionsY[i] = centerY + Math.sin(angle) * r;
            // Point toward center
            this.headings[i] = Math.atan2(centerY - this.positionsY[i], centerX - this.positionsX[i]);
        }
    }

    // Resize agent arrays (when agent count changes)
    resize(newCount) {
        if (newCount === this.agentCount) return;

        const newPosX = new Float32Array(newCount);
        const newPosY = new Float32Array(newCount);
        const newHeadings = new Float32Array(newCount);

        // Copy existing agents
        const copyCount = Math.min(this.agentCount, newCount);
        for (let i = 0; i < copyCount; i++) {
            newPosX[i] = this.positionsX[i];
            newPosY[i] = this.positionsY[i];
            newHeadings[i] = this.headings[i];
        }

        // Initialize new agents if growing
        for (let i = copyCount; i < newCount; i++) {
            newPosX[i] = Math.random() * this.width;
            newPosY[i] = Math.random() * this.height;
            newHeadings[i] = Math.random() * Math.PI * 2;
        }

        this.positionsX = newPosX;
        this.positionsY = newPosY;
        this.headings = newHeadings;
        this.agentCount = newCount;
    }

    /**
     * Sample the trail map at a given position using bilinear interpolation
     */
    sampleTrail(trailMap, x, y) {
        // Wrap coordinates (toroidal)
        x = ((x % this.width) + this.width) % this.width;
        y = ((y % this.height) + this.height) % this.height;

        // Integer coordinates
        const x0 = Math.floor(x);
        const y0 = Math.floor(y);
        const x1 = (x0 + 1) % this.width;
        const y1 = (y0 + 1) % this.height;

        // Fractional parts
        const fx = x - x0;
        const fy = y - y0;

        // Bilinear interpolation
        const v00 = trailMap.data[y0 * this.width + x0];
        const v10 = trailMap.data[y0 * this.width + x1];
        const v01 = trailMap.data[y1 * this.width + x0];
        const v11 = trailMap.data[y1 * this.width + x1];

        return (v00 * (1 - fx) * (1 - fy) +
                v10 * fx * (1 - fy) +
                v01 * (1 - fx) * fy +
                v11 * fx * fy);
    }

    /**
     * Update all agents - sensing, steering, and movement
     * This is the main simulation step
     */
    update(trailMap) {
        const cos = Math.cos;
        const sin = Math.sin;
        const PI2 = Math.PI * 2;

        for (let i = 0; i < this.agentCount; i++) {
            const x = this.positionsX[i];
            const y = this.positionsY[i];
            const theta = this.headings[i];

            // Calculate sensor positions (Center, Left, Right)
            const cosTheta = cos(theta);
            const sinTheta = sin(theta);
            const cosLeft = cos(theta - this.sensorAngle);
            const sinLeft = sin(theta - this.sensorAngle);
            const cosRight = cos(theta + this.sensorAngle);
            const sinRight = sin(theta + this.sensorAngle);

            // Sensor coordinates
            const cx = x + cosTheta * this.sensorDistance;
            const cy = y + sinTheta * this.sensorDistance;
            const lx = x + cosLeft * this.sensorDistance;
            const ly = y + sinLeft * this.sensorDistance;
            const rx = x + cosRight * this.sensorDistance;
            const ry = y + sinRight * this.sensorDistance;

            // Sample trail at sensor positions
            const centerVal = this.sampleTrail(trailMap, cx, cy);
            const leftVal = this.sampleTrail(trailMap, lx, ly);
            const rightVal = this.sampleTrail(trailMap, rx, ry);

            // Steering logic based on sensor values
            let newTheta = theta;

            if (centerVal > leftVal && centerVal > rightVal) {
                // Center is strongest - continue straight
                // Add tiny random variation
                newTheta += (Math.random() - 0.5) * 0.1;
            } else if (centerVal < leftVal && centerVal < rightVal) {
                // Center is weakest - turn randomly left or right
                newTheta += (Math.random() < 0.5 ? -1 : 1) * this.turnAngle;
            } else if (leftVal < rightVal) {
                // Right is stronger - turn right
                newTheta += this.turnAngle;
            } else if (rightVal < leftVal) {
                // Left is stronger - turn left
                newTheta -= this.turnAngle;
            }

            // Normalize heading to [0, 2π]
            newTheta = ((newTheta % PI2) + PI2) % PI2;
            this.headings[i] = newTheta;

            // Move forward
            let newX = x + cos(newTheta) * this.moveSpeed;
            let newY = y + sin(newTheta) * this.moveSpeed;

            // Toroidal wrapping
            newX = ((newX % this.width) + this.width) % this.width;
            newY = ((newY % this.height) + this.height) % this.height;

            this.positionsX[i] = newX;
            this.positionsY[i] = newY;
        }
    }

    /**
     * Deposit pheromones on the trail map at agent positions
     */
    deposit(trailMap, amount) {
        for (let i = 0; i < this.agentCount; i++) {
            const x = Math.floor(this.positionsX[i]);
            const y = Math.floor(this.positionsY[i]);
            const idx = y * this.width + x;
            trailMap.data[idx] += amount;
        }
    }

    // Update parameters
    setSensorAngle(angle) {
        this.sensorAngle = angle;
    }

    setSensorDistance(distance) {
        this.sensorDistance = distance;
    }

    setMoveSpeed(speed) {
        this.moveSpeed = speed;
    }

    setTurnAngle(angle) {
        this.turnAngle = angle;
    }
}
