/**
 * Physarum Transport Engine - Configuration
 * Physical constants and default parameters for reproducibility
 */

const CONFIG = {
    // Canvas settings
    canvas: {
        width: 800,
        height: 800,
        backgroundColor: '#0a0a0f'
    },

    // Agent parameters
    agents: {
        count: 50000,
        minCount: 1000,
        maxCount: 100000,
        speed: 1.5,
        minSpeed: 0.5,
        maxSpeed: 5.0
    },

    // Sensor parameters
    sensor: {
        angle: Math.PI / 4,      // 45 degrees
        minAngle: Math.PI / 18,  // 10 degrees
        maxAngle: Math.PI / 2,   // 90 degrees
        distance: 20,
        minDistance: 5,
        maxDistance: 50
    },

    // Trail map parameters
    trail: {
        decayRate: 0.02,
        minDecay: 0.001,
        maxDecay: 0.1,
        depositAmount: 5,
        minDeposit: 1,
        maxDeposit: 20,
        diffusionKernel: [
            1/9, 1/9, 1/9,
            1/9, 1/9, 1/9,
            1/9, 1/9, 1/9
        ]
    },

    // Steering behavior
    steering: {
        turnAngle: Math.PI / 4,  // How much to turn when sensing
        randomness: 0.1          // Random jitter in heading
    },

    // Color gradient for trail visualization (bio-fluorescence)
    colorMap: {
        stops: [
            { pos: 0.0, color: [0, 0, 0] },        // Black
            { pos: 0.2, color: [0, 30, 0] },       // Very dark green
            { pos: 0.4, color: [0, 100, 20] },     // Dark green
            { pos: 0.6, color: [0, 200, 50] },     // Bright green
            { pos: 0.8, color: [100, 255, 100] },  // Light green
            { pos: 1.0, color: [200, 255, 200] }   // White-green
        ]
    },

    // Performance settings
    performance: {
        targetFPS: 60,
        updateInterval: 1  // Update every frame
    }
};

// Utility function to interpolate color from the gradient
function getTrailColor(intensity) {
    const stops = CONFIG.colorMap.stops;
    const clamped = Math.max(0, Math.min(1, intensity));

    for (let i = 0; i < stops.length - 1; i++) {
        if (clamped >= stops[i].pos && clamped <= stops[i + 1].pos) {
            const t = (clamped - stops[i].pos) / (stops[i + 1].pos - stops[i].pos);
            const c1 = stops[i].color;
            const c2 = stops[i + 1].color;
            return [
                Math.floor(c1[0] + t * (c2[0] - c1[0])),
                Math.floor(c1[1] + t * (c2[1] - c1[1])),
                Math.floor(c1[2] + t * (c2[2] - c1[2]))
            ];
        }
    }
    return stops[stops.length - 1].color;
}
