/**
 * Fractal Odyssey - Web Worker
 * Handles Julia Set and Mandelbrot Set calculations off the main thread
 */

// Smooth coloring using renormalization
function smoothColor(iterations, maxIterations, zReal, zImag) {
    if (iterations === maxIterations) return -1; // In the set

    const log2 = Math.log(2);
    const modulus = Math.sqrt(zReal * zReal + zImag * zImag);
    const smoothed = iterations + 1 - Math.log(Math.log(modulus)) / log2;
    return smoothed;
}

// Calculate Julia Set for a region
function calculateJulia(params) {
    const {
        width, height,
        cReal, cImag,
        zoom, panX, panY,
        maxIterations,
        startRow, endRow
    } = params;

    const iterations = new Float32Array((endRow - startRow) * width);
    const escapeZ = new Float32Array((endRow - startRow) * width * 2); // Store final z for smooth coloring

    let idx = 0;

    for (let y = startRow; y < endRow; y++) {
        for (let x = 0; x < width; x++) {
            // Map pixel to complex plane
            let zReal = (x - width / 2) / zoom + panX;
            let zImag = (y - height / 2) / zoom + panY;

            let iter = 0;

            // z = z² + c iteration
            while (iter < maxIterations && zReal * zReal + zImag * zImag <= 4) {
                const zRealNew = zReal * zReal - zImag * zImag + cReal;
                zImag = 2 * zReal * zImag + cImag;
                zReal = zRealNew;
                iter++;
            }

            iterations[idx] = iter;
            escapeZ[idx * 2] = zReal;
            escapeZ[idx * 2 + 1] = zImag;
            idx++;
        }
    }

    return { iterations, escapeZ, startRow, endRow };
}

// Calculate Mandelbrot Set for navigator
function calculateMandelbrot(params) {
    const {
        width, height,
        zoom, panX, panY,
        maxIterations
    } = params;

    const iterations = new Float32Array(width * height);
    const escapeZ = new Float32Array(width * height * 2);

    let idx = 0;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            // For Mandelbrot: c = pixel coordinate, z starts at 0
            const cReal = (x - width / 2) / zoom + panX;
            const cImag = (y - height / 2) / zoom + panY;

            let zReal = 0;
            let zImag = 0;
            let iter = 0;

            while (iter < maxIterations && zReal * zReal + zImag * zImag <= 4) {
                const zRealNew = zReal * zReal - zImag * zImag + cReal;
                zImag = 2 * zReal * zImag + cImag;
                zReal = zRealNew;
                iter++;
            }

            iterations[idx] = iter;
            escapeZ[idx * 2] = zReal;
            escapeZ[idx * 2 + 1] = zImag;
            idx++;
        }
    }

    return { iterations, escapeZ };
}

// Apply color palette to iteration data
function applyPalette(iterations, escapeZ, width, height, maxIterations, palette, startRow = 0) {
    const imageData = new Uint8ClampedArray(width * (height) * 4);

    for (let i = 0; i < iterations.length; i++) {
        const iter = iterations[i];
        const zReal = escapeZ[i * 2];
        const zImag = escapeZ[i * 2 + 1];

        const pixelIdx = i * 4;

        if (iter === maxIterations) {
            // Point is in the set - black
            imageData[pixelIdx] = 0;
            imageData[pixelIdx + 1] = 0;
            imageData[pixelIdx + 2] = 0;
            imageData[pixelIdx + 3] = 255;
        } else {
            // Smooth coloring
            const smoothed = smoothColor(iter, maxIterations, zReal, zImag);
            const color = getColor(smoothed, maxIterations, palette);

            imageData[pixelIdx] = color.r;
            imageData[pixelIdx + 1] = color.g;
            imageData[pixelIdx + 2] = color.b;
            imageData[pixelIdx + 3] = 255;
        }
    }

    return imageData;
}

// Color calculation based on palette
function getColor(smoothed, maxIterations, palette) {
    const t = smoothed / maxIterations;

    switch (palette) {
        case 'electric':
            return electricBlue(t);
        case 'inferno':
            return inferno(t);
        case 'deepspace':
            return deepSpace(t);
        case 'psychedelic':
            return psychedelic(t);
        default:
            return electricBlue(t);
    }
}

// Electric Blue palette (default)
function electricBlue(t) {
    const h = 0.55 + t * 0.15; // Blue-cyan range
    const s = 0.8 + Math.sin(t * Math.PI * 4) * 0.2;
    const l = 0.1 + t * 0.7;
    return hslToRgb(h, s, l);
}

// Inferno palette (red/orange)
function inferno(t) {
    const r = Math.min(255, Math.floor(t * 3 * 255));
    const g = Math.min(255, Math.floor(Math.pow(t, 2) * 255));
    const b = Math.min(255, Math.floor(Math.pow(t, 0.5) * 100));
    return { r, g, b };
}

// Deep Space (grayscale)
function deepSpace(t) {
    const v = Math.floor(Math.pow(t, 0.7) * 255);
    return { r: v, g: v, b: v };
}

// Psychedelic (rainbow)
function psychedelic(t) {
    const h = (t * 3) % 1; // Cycle through hues multiple times
    return hslToRgb(h, 1, 0.5);
}

// HSL to RGB conversion
function hslToRgb(h, s, l) {
    let r, g, b;

    if (s === 0) {
        r = g = b = l;
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    };
}

// Message handler
self.onmessage = function(e) {
    const { type, params, id } = e.data;

    switch (type) {
        case 'julia': {
            const result = calculateJulia(params);
            const imageData = applyPalette(
                result.iterations,
                result.escapeZ,
                params.width,
                params.endRow - params.startRow,
                params.maxIterations,
                params.palette,
                params.startRow
            );

            self.postMessage({
                type: 'julia',
                id,
                imageData,
                startRow: result.startRow,
                endRow: result.endRow,
                width: params.width
            }, [imageData.buffer]);
            break;
        }

        case 'mandelbrot': {
            const result = calculateMandelbrot(params);
            const imageData = applyPalette(
                result.iterations,
                result.escapeZ,
                params.width,
                params.height,
                params.maxIterations,
                params.palette
            );

            self.postMessage({
                type: 'mandelbrot',
                id,
                imageData,
                width: params.width,
                height: params.height
            }, [imageData.buffer]);
            break;
        }
    }
};
