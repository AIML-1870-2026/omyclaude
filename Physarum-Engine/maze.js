/**
 * Physarum Transport Engine - Procedural Maze Generator
 * Creates perfect mazes using iterative recursive backtracking
 * Outputs binary collision mask for physics simulation
 */

class MazeMap {
    constructor(cols, rows, wallThickness = 10) {
        this.cols = cols;
        this.rows = rows;
        this.wallThickness = wallThickness;

        // Logical grid: each cell stores which walls are present
        // walls: { top, right, bottom, left }
        this.grid = [];

        // High-resolution mask (cached)
        this.mask = null;
        this.maskWidth = 0;
        this.maskHeight = 0;

        // Start and end positions (in pixel coordinates)
        this.startPos = { x: 0, y: 0 };
        this.endPos = { x: 0, y: 0 };

        // Enabled flag
        this.enabled = false;
    }

    /**
     * Initialize grid with all walls active
     */
    initGrid() {
        this.grid = [];
        for (let row = 0; row < this.rows; row++) {
            const rowCells = [];
            for (let col = 0; col < this.cols; col++) {
                rowCells.push({
                    visited: false,
                    walls: {
                        top: true,
                        right: true,
                        bottom: true,
                        left: true
                    }
                });
            }
            this.grid.push(rowCells);
        }
    }

    /**
     * Get valid unvisited neighbors of a cell
     */
    getUnvisitedNeighbors(row, col) {
        const neighbors = [];

        // Top
        if (row > 0 && !this.grid[row - 1][col].visited) {
            neighbors.push({ row: row - 1, col: col, direction: 'top' });
        }
        // Right
        if (col < this.cols - 1 && !this.grid[row][col + 1].visited) {
            neighbors.push({ row: row, col: col + 1, direction: 'right' });
        }
        // Bottom
        if (row < this.rows - 1 && !this.grid[row + 1][col].visited) {
            neighbors.push({ row: row + 1, col: col, direction: 'bottom' });
        }
        // Left
        if (col > 0 && !this.grid[row][col - 1].visited) {
            neighbors.push({ row: row, col: col - 1, direction: 'left' });
        }

        return neighbors;
    }

    /**
     * Remove wall between two cells
     */
    removeWall(row1, col1, row2, col2, direction) {
        switch (direction) {
            case 'top':
                this.grid[row1][col1].walls.top = false;
                this.grid[row2][col2].walls.bottom = false;
                break;
            case 'right':
                this.grid[row1][col1].walls.right = false;
                this.grid[row2][col2].walls.left = false;
                break;
            case 'bottom':
                this.grid[row1][col1].walls.bottom = false;
                this.grid[row2][col2].walls.top = false;
                break;
            case 'left':
                this.grid[row1][col1].walls.left = false;
                this.grid[row2][col2].walls.right = false;
                break;
        }
    }

    /**
     * Generate maze using iterative recursive backtracking
     * Uses explicit stack to avoid recursion limit
     */
    generate() {
        // Initialize grid
        this.initGrid();

        // Clear cached mask
        this.mask = null;

        // Stack for backtracking (stores {row, col})
        const stack = [];

        // Start at random cell
        const startRow = Math.floor(Math.random() * this.rows);
        const startCol = Math.floor(Math.random() * this.cols);

        // Mark start cell as visited
        this.grid[startRow][startCol].visited = true;
        stack.push({ row: startRow, col: startCol });

        // Iterative backtracking
        while (stack.length > 0) {
            const current = stack[stack.length - 1];
            const neighbors = this.getUnvisitedNeighbors(current.row, current.col);

            if (neighbors.length > 0) {
                // Choose random unvisited neighbor
                const next = neighbors[Math.floor(Math.random() * neighbors.length)];

                // Remove wall between current and next
                this.removeWall(current.row, current.col, next.row, next.col, next.direction);

                // Mark next as visited
                this.grid[next.row][next.col].visited = true;

                // Push next to stack
                stack.push({ row: next.row, col: next.col });
            } else {
                // Backtrack
                stack.pop();
            }
        }

        // Open entrance (top-left) and exit (bottom-right)
        this.grid[0][0].walls.top = false;
        this.grid[this.rows - 1][this.cols - 1].walls.bottom = false;
    }

    /**
     * Create high-resolution collision mask
     * 0 = wall (blocked), 1 = path (open)
     * @param {number} width - Target width in pixels
     * @param {number} height - Target height in pixels
     * @returns {Uint8Array} - Flattened mask array
     */
    getMask(width, height) {
        // Return cached mask if dimensions match
        if (this.mask && this.maskWidth === width && this.maskHeight === height) {
            return this.mask;
        }

        this.maskWidth = width;
        this.maskHeight = height;

        // Create mask filled with 1s (open space)
        this.mask = new Uint8Array(width * height);
        this.mask.fill(1);

        // Calculate cell dimensions
        const cellWidth = width / this.cols;
        const cellHeight = height / this.rows;
        const halfThick = Math.floor(this.wallThickness / 2);

        // Draw walls as 0s
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const cell = this.grid[row][col];
                const x = Math.floor(col * cellWidth);
                const y = Math.floor(row * cellHeight);
                const x2 = Math.floor((col + 1) * cellWidth);
                const y2 = Math.floor((row + 1) * cellHeight);

                // Draw top wall
                if (cell.walls.top) {
                    this.drawHorizontalWall(x, y, x2, halfThick);
                }

                // Draw right wall
                if (cell.walls.right) {
                    this.drawVerticalWall(x2, y, y2, halfThick);
                }

                // Draw bottom wall
                if (cell.walls.bottom) {
                    this.drawHorizontalWall(x, y2, x2, halfThick);
                }

                // Draw left wall
                if (cell.walls.left) {
                    this.drawVerticalWall(x, y, y2, halfThick);
                }
            }
        }

        // Draw outer boundary
        this.drawBoundary(halfThick);

        // Calculate start/end positions (center of first/last cells)
        this.startPos = {
            x: Math.floor(cellWidth / 2),
            y: Math.floor(cellHeight / 2)
        };
        this.endPos = {
            x: Math.floor((this.cols - 0.5) * cellWidth),
            y: Math.floor((this.rows - 0.5) * cellHeight)
        };

        return this.mask;
    }

    /**
     * Draw horizontal wall segment
     */
    drawHorizontalWall(x1, y, x2, halfThick) {
        const w = this.maskWidth;
        const h = this.maskHeight;

        for (let py = Math.max(0, y - halfThick); py <= Math.min(h - 1, y + halfThick); py++) {
            for (let px = x1; px < x2; px++) {
                if (px >= 0 && px < w) {
                    this.mask[py * w + px] = 0;
                }
            }
        }
    }

    /**
     * Draw vertical wall segment
     */
    drawVerticalWall(x, y1, y2, halfThick) {
        const w = this.maskWidth;
        const h = this.maskHeight;

        for (let py = y1; py < y2; py++) {
            if (py >= 0 && py < h) {
                for (let px = Math.max(0, x - halfThick); px <= Math.min(w - 1, x + halfThick); px++) {
                    this.mask[py * w + px] = 0;
                }
            }
        }
    }

    /**
     * Draw outer boundary walls
     */
    drawBoundary(halfThick) {
        const w = this.maskWidth;
        const h = this.maskHeight;

        // Top and bottom boundaries
        for (let x = 0; x < w; x++) {
            for (let t = 0; t <= halfThick; t++) {
                if (t < h) this.mask[t * w + x] = 0;
                if (h - 1 - t >= 0) this.mask[(h - 1 - t) * w + x] = 0;
            }
        }

        // Left and right boundaries
        for (let y = 0; y < h; y++) {
            for (let t = 0; t <= halfThick; t++) {
                if (t < w) this.mask[y * w + t] = 0;
                if (w - 1 - t >= 0) this.mask[y * w + (w - 1 - t)] = 0;
            }
        }
    }

    /**
     * Reset and generate new maze
     */
    reset() {
        this.generate();
        this.mask = null; // Force mask regeneration
    }

    /**
     * Check if position is blocked by wall
     * @returns {boolean} true if blocked (wall), false if open
     */
    isBlocked(x, y) {
        if (!this.enabled || !this.mask) return false;

        const ix = Math.floor(x);
        const iy = Math.floor(y);

        if (ix < 0 || ix >= this.maskWidth || iy < 0 || iy >= this.maskHeight) {
            return true; // Out of bounds = blocked
        }

        return this.mask[iy * this.maskWidth + ix] === 0;
    }

    /**
     * Render maze walls to canvas context
     */
    render(ctx) {
        if (!this.enabled || !this.mask) return;

        const w = this.maskWidth;
        const h = this.maskHeight;

        // Create ImageData from mask
        const imageData = ctx.createImageData(w, h);
        const pixels = imageData.data;

        for (let i = 0; i < this.mask.length; i++) {
            const pixelIdx = i * 4;
            if (this.mask[i] === 0) {
                // Wall - dark gray
                pixels[pixelIdx] = 30;
                pixels[pixelIdx + 1] = 30;
                pixels[pixelIdx + 2] = 40;
                pixels[pixelIdx + 3] = 255;
            } else {
                // Path - transparent (let trail show through)
                pixels[pixelIdx] = 0;
                pixels[pixelIdx + 1] = 0;
                pixels[pixelIdx + 2] = 0;
                pixels[pixelIdx + 3] = 0;
            }
        }

        ctx.putImageData(imageData, 0, 0);
    }

    /**
     * Toggle maze on/off
     */
    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }

    /**
     * Set maze dimensions and regenerate
     */
    setDimensions(cols, rows) {
        this.cols = cols;
        this.rows = rows;
        this.generate();
        this.mask = null;
    }

    /**
     * Set wall thickness and regenerate mask
     */
    setWallThickness(thickness) {
        this.wallThickness = thickness;
        this.mask = null;
    }
}
