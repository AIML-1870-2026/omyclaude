/**
 * Physarum Transport Engine - Trail Map (Pheromone Field)
 * Handles diffusion, decay, and visualization of the chemical trail
 */

class TrailMap {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.size = width * height;

        // Main trail data (pheromone concentrations)
        this.data = new Float32Array(this.size);

        // Temporary buffer for diffusion
        this.tempBuffer = new Float32Array(this.size);

        // ImageData for rendering
        this.imageData = null;

        // Parameters
        this.decayRate = CONFIG.trail.decayRate;
        this.depositAmount = CONFIG.trail.depositAmount;
    }

    // Clear the entire trail map
    clear() {
        this.data.fill(0);
    }

    /**
     * Apply 3x3 box blur diffusion
     * This spreads the pheromones to neighboring cells
     */
    diffuse() {
        const w = this.width;
        const h = this.height;
        const data = this.data;
        const temp = this.tempBuffer;

        // Clear temp buffer
        temp.fill(0);

        // Apply 3x3 box blur with toroidal wrapping
        for (let y = 0; y < h; y++) {
            const yPrev = (y - 1 + h) % h;
            const yNext = (y + 1) % h;

            for (let x = 0; x < w; x++) {
                const xPrev = (x - 1 + w) % w;
                const xNext = (x + 1) % w;

                // Sum of 3x3 neighborhood
                const sum =
                    data[yPrev * w + xPrev] + data[yPrev * w + x] + data[yPrev * w + xNext] +
                    data[y * w + xPrev] + data[y * w + x] + data[y * w + xNext] +
                    data[yNext * w + xPrev] + data[yNext * w + x] + data[yNext * w + xNext];

                temp[y * w + x] = sum / 9;
            }
        }

        // Copy back to main buffer
        this.data.set(temp);
    }

    /**
     * Optimized diffusion using separable convolution
     * First horizontal pass, then vertical pass
     * This is O(2n) instead of O(n*9) for 3x3 kernel
     */
    diffuseFast() {
        const w = this.width;
        const h = this.height;
        const data = this.data;
        const temp = this.tempBuffer;

        // Horizontal pass (blur along x)
        for (let y = 0; y < h; y++) {
            const yOffset = y * w;
            for (let x = 0; x < w; x++) {
                const xPrev = (x - 1 + w) % w;
                const xNext = (x + 1) % w;
                temp[yOffset + x] = (
                    data[yOffset + xPrev] +
                    data[yOffset + x] +
                    data[yOffset + xNext]
                ) / 3;
            }
        }

        // Vertical pass (blur along y)
        for (let y = 0; y < h; y++) {
            const yPrev = ((y - 1 + h) % h) * w;
            const yCurr = y * w;
            const yNext = ((y + 1) % h) * w;

            for (let x = 0; x < w; x++) {
                data[yCurr + x] = (
                    temp[yPrev + x] +
                    temp[yCurr + x] +
                    temp[yNext + x]
                ) / 3;
            }
        }
    }

    /**
     * Apply exponential decay to all pheromones
     */
    decay() {
        const factor = 1 - this.decayRate;
        for (let i = 0; i < this.size; i++) {
            this.data[i] *= factor;
        }
    }

    /**
     * Combined diffuse + decay step (called each frame)
     */
    update() {
        this.diffuseFast();
        this.decay();
    }

    /**
     * Generate ImageData for canvas rendering
     * Maps trail intensity to color gradient
     */
    getImageData(ctx) {
        if (!this.imageData) {
            this.imageData = ctx.createImageData(this.width, this.height);
        }

        const pixels = this.imageData.data;
        const data = this.data;

        // Find max value for normalization
        let maxVal = 0;
        for (let i = 0; i < this.size; i++) {
            if (data[i] > maxVal) maxVal = data[i];
        }

        // Normalize factor (avoid division by zero)
        const normFactor = maxVal > 0 ? 1 / maxVal : 1;

        // Map trail values to colors
        for (let i = 0; i < this.size; i++) {
            const intensity = data[i] * normFactor;
            const color = getTrailColor(intensity);

            const pixelIdx = i * 4;
            pixels[pixelIdx] = color[0];     // R
            pixels[pixelIdx + 1] = color[1]; // G
            pixels[pixelIdx + 2] = color[2]; // B
            pixels[pixelIdx + 3] = 255;      // A
        }

        return this.imageData;
    }

    /**
     * Alternative: Direct canvas rendering without ImageData
     * Uses putImageData which can be faster for large canvases
     */
    render(ctx) {
        const imageData = this.getImageData(ctx);
        ctx.putImageData(imageData, 0, 0);
    }

    // Parameter setters
    setDecayRate(rate) {
        this.decayRate = rate;
    }

    setDepositAmount(amount) {
        this.depositAmount = amount;
    }

    /**
     * Clear a circular region (for testing dynamic rerouting)
     */
    clearRegion(centerX, centerY, radius) {
        const radiusSq = radius * radius;
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const dx = x - centerX;
                const dy = y - centerY;
                if (dx * dx + dy * dy < radiusSq) {
                    this.data[y * this.width + x] = 0;
                }
            }
        }
    }
}
