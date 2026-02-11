/**
 * Fractal Odyssey - Main Application
 * Interactive Julia Set Explorer
 */

// =============================================================================
// State & Configuration
// =============================================================================

const state = {
    // Julia Set c parameter
    cReal: -0.123,
    cImag: 0.745,

    // View parameters
    zoom: 200,
    panX: 0,
    panY: 0,

    // Render settings
    maxIterations: 256,
    palette: 'electric',
    previewScale: 0.25,

    // Interaction state
    isDragging: false,
    dragStart: { x: 0, y: 0 },
    panStart: { x: 0, y: 0 },
    isMorphing: false,
    morphAngle: 0,

    // Worker management
    renderQueue: 0,
    lastRender: 0
};

// Famous Julia Set presets
const presets = {
    rabbit: { cReal: -0.123, cImag: 0.745, name: 'The Rabbit' },
    sanmarco: { cReal: -0.75, cImag: 0, name: 'San Marco' },
    dendrite: { cReal: 0, cImag: 1, name: 'Dendrite' },
    spiral: { cReal: 0.285, cImag: 0.01, name: 'Spiral' },
    galaxy: { cReal: -0.4, cImag: 0.6, name: 'Galaxy' },
    lightning: { cReal: -0.7269, cImag: 0.1889, name: 'Lightning' }
};

// =============================================================================
// DOM Elements
// =============================================================================

let juliaCanvas, juliaCtx;
let mandelbrotCanvas, mandelbrotCtx;
let worker;

// UI elements
let sliderCReal, sliderCImag, sliderIterations;
let valueCReal, valueCImag, valueIterations;
let coordDisplay;
let loadingEl;

// =============================================================================
// Initialization
// =============================================================================

function init() {
    // Get canvas elements
    juliaCanvas = document.getElementById('juliaCanvas');
    juliaCtx = juliaCanvas.getContext('2d');

    mandelbrotCanvas = document.getElementById('mandelbrotCanvas');
    mandelbrotCtx = mandelbrotCanvas.getContext('2d');

    // Get UI elements
    sliderCReal = document.getElementById('cReal');
    sliderCImag = document.getElementById('cImag');
    sliderIterations = document.getElementById('iterations');

    valueCReal = document.getElementById('valueCReal');
    valueCImag = document.getElementById('valueCImag');
    valueIterations = document.getElementById('valueIterations');

    coordDisplay = document.getElementById('coordDisplay');
    loadingEl = document.getElementById('loading');

    // Initialize Web Worker
    worker = new Worker('worker.js');
    worker.onmessage = handleWorkerMessage;

    // Set up event listeners
    setupEventListeners();

    // Initial resize and render
    resize();
    window.addEventListener('resize', resize);

    // Render Mandelbrot navigator
    renderMandelbrot();
}

// =============================================================================
// Resize Handling
// =============================================================================

function resize() {
    juliaCanvas.width = window.innerWidth;
    juliaCanvas.height = window.innerHeight;

    // Mandelbrot navigator has fixed size
    const navRect = mandelbrotCanvas.getBoundingClientRect();
    mandelbrotCanvas.width = navRect.width * window.devicePixelRatio;
    mandelbrotCanvas.height = navRect.height * window.devicePixelRatio;

    renderJulia();
    renderMandelbrot();
}

// =============================================================================
// Rendering
// =============================================================================

function renderJulia(preview = false) {
    const scale = preview ? state.previewScale : 1;
    const width = Math.floor(juliaCanvas.width * scale);
    const height = Math.floor(juliaCanvas.height * scale);

    if (preview) {
        loadingEl.classList.remove('active');
    } else {
        loadingEl.classList.add('active');
    }

    state.renderQueue++;
    const renderId = state.renderQueue;

    // Calculate chunk size for progressive rendering
    const chunkHeight = Math.ceil(height / 4);

    for (let startRow = 0; startRow < height; startRow += chunkHeight) {
        const endRow = Math.min(startRow + chunkHeight, height);

        worker.postMessage({
            type: 'julia',
            id: renderId,
            params: {
                width,
                height,
                cReal: state.cReal,
                cImag: state.cImag,
                zoom: state.zoom * scale,
                panX: state.panX,
                panY: state.panY,
                maxIterations: preview ? Math.min(state.maxIterations, 64) : state.maxIterations,
                palette: state.palette,
                startRow,
                endRow,
                scale
            }
        });
    }
}

function renderMandelbrot() {
    const width = mandelbrotCanvas.width;
    const height = mandelbrotCanvas.height;

    worker.postMessage({
        type: 'mandelbrot',
        id: 'mandelbrot',
        params: {
            width,
            height,
            zoom: height / 3,
            panX: -0.5,
            panY: 0,
            maxIterations: 100,
            palette: state.palette
        }
    });
}

function handleWorkerMessage(e) {
    const { type, id, imageData, startRow, endRow, width, height } = e.data;

    if (type === 'julia') {
        // Only draw if this is the most recent render
        if (id === state.renderQueue) {
            const scale = (juliaCanvas.width / width);
            const chunkHeight = endRow - startRow;

            // Create ImageData and put pixels
            const imgData = new ImageData(
                new Uint8ClampedArray(imageData),
                width,
                chunkHeight
            );

            // Create temporary canvas for scaling
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = width;
            tempCanvas.height = chunkHeight;
            const tempCtx = tempCanvas.getContext('2d');
            tempCtx.putImageData(imgData, 0, 0);

            // Draw scaled to main canvas
            juliaCtx.imageSmoothingEnabled = scale > 1;
            juliaCtx.drawImage(
                tempCanvas,
                0, 0, width, chunkHeight,
                0, startRow * scale, juliaCanvas.width, chunkHeight * scale
            );

            // Hide loading when last chunk arrives
            if (endRow >= juliaCanvas.height * (width / juliaCanvas.width)) {
                loadingEl.classList.remove('active');
            }
        }
    } else if (type === 'mandelbrot') {
        const imgData = new ImageData(
            new Uint8ClampedArray(imageData),
            width,
            height
        );
        mandelbrotCtx.putImageData(imgData, 0, 0);

        // Draw crosshair for current c value
        drawMandelbrotCrosshair();
    }
}

function drawMandelbrotCrosshair() {
    const width = mandelbrotCanvas.width;
    const height = mandelbrotCanvas.height;
    const zoom = height / 3;
    const panX = -0.5;
    const panY = 0;

    // Convert c to pixel coordinates
    const x = (state.cReal - panX) * zoom + width / 2;
    const y = (state.cImag - panY) * zoom + height / 2;

    mandelbrotCtx.strokeStyle = '#ff00aa';
    mandelbrotCtx.lineWidth = 2;
    mandelbrotCtx.beginPath();
    mandelbrotCtx.arc(x, y, 6, 0, Math.PI * 2);
    mandelbrotCtx.stroke();

    mandelbrotCtx.beginPath();
    mandelbrotCtx.moveTo(x - 10, y);
    mandelbrotCtx.lineTo(x + 10, y);
    mandelbrotCtx.moveTo(x, y - 10);
    mandelbrotCtx.lineTo(x, y + 10);
    mandelbrotCtx.stroke();
}

// =============================================================================
// Event Listeners
// =============================================================================

function setupEventListeners() {
    // Slider controls
    sliderCReal.addEventListener('input', onSliderChange);
    sliderCImag.addEventListener('input', onSliderChange);
    sliderIterations.addEventListener('input', onIterationsChange);

    // Mouse controls on Julia canvas
    juliaCanvas.addEventListener('mousedown', onMouseDown);
    juliaCanvas.addEventListener('mousemove', onMouseMove);
    juliaCanvas.addEventListener('mouseup', onMouseUp);
    juliaCanvas.addEventListener('mouseleave', onMouseUp);
    juliaCanvas.addEventListener('wheel', onWheel, { passive: false });

    // Mandelbrot navigator click
    mandelbrotCanvas.addEventListener('click', onMandelbrotClick);

    // Preset buttons
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', onPresetClick);
    });

    // Palette selection
    document.querySelectorAll('.palette-swatch').forEach(swatch => {
        swatch.addEventListener('click', onPaletteClick);
    });

    // Action buttons
    document.getElementById('btnSave')?.addEventListener('click', saveImage);
    document.getElementById('btnMorph')?.addEventListener('click', toggleMorph);
    document.getElementById('btnReset')?.addEventListener('click', resetView);

    // Panel toggle
    document.getElementById('panelToggle')?.addEventListener('click', togglePanel);

    // Keyboard shortcuts
    document.addEventListener('keydown', onKeyDown);
}

// =============================================================================
// Control Handlers
// =============================================================================

function onSliderChange() {
    state.cReal = parseFloat(sliderCReal.value);
    state.cImag = parseFloat(sliderCImag.value);

    updateValueDisplays();
    renderJulia(true); // Preview mode
    scheduleHighResRender();
    renderMandelbrot(); // Update crosshair
}

function onIterationsChange() {
    state.maxIterations = parseInt(sliderIterations.value);
    valueIterations.textContent = state.maxIterations;
    renderJulia();
    renderMandelbrot();
}

function updateValueDisplays() {
    valueCReal.textContent = state.cReal.toFixed(4);
    valueCImag.textContent = state.cImag.toFixed(4);
}

function updateSliders() {
    sliderCReal.value = state.cReal;
    sliderCImag.value = state.cImag;
    updateValueDisplays();
}

// =============================================================================
// Mouse Handlers
// =============================================================================

function onMouseDown(e) {
    state.isDragging = true;
    state.dragStart = { x: e.clientX, y: e.clientY };
    state.panStart = { x: state.panX, y: state.panY };
    juliaCanvas.style.cursor = 'grabbing';
}

function onMouseMove(e) {
    // Update coordinate display
    const rect = juliaCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const real = (x - juliaCanvas.width / 2) / state.zoom + state.panX;
    const imag = (y - juliaCanvas.height / 2) / state.zoom + state.panY;

    coordDisplay.innerHTML = `z = <span>${real.toFixed(4)}</span> + <span>${imag.toFixed(4)}</span>i`;

    // Handle dragging
    if (state.isDragging) {
        const dx = (e.clientX - state.dragStart.x) / state.zoom;
        const dy = (e.clientY - state.dragStart.y) / state.zoom;

        state.panX = state.panStart.x - dx;
        state.panY = state.panStart.y - dy;

        renderJulia(true); // Preview mode while dragging
    }
}

function onMouseUp() {
    if (state.isDragging) {
        state.isDragging = false;
        juliaCanvas.style.cursor = 'crosshair';
        renderJulia(); // Full resolution render
    }
}

function onWheel(e) {
    e.preventDefault();

    const rect = juliaCanvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Get complex coordinate at mouse position before zoom
    const realBefore = (mouseX - juliaCanvas.width / 2) / state.zoom + state.panX;
    const imagBefore = (mouseY - juliaCanvas.height / 2) / state.zoom + state.panY;

    // Zoom factor
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    state.zoom *= zoomFactor;

    // Clamp zoom
    state.zoom = Math.max(50, Math.min(state.zoom, 100000));

    // Get complex coordinate at mouse position after zoom
    const realAfter = (mouseX - juliaCanvas.width / 2) / state.zoom + state.panX;
    const imagAfter = (mouseY - juliaCanvas.height / 2) / state.zoom + state.panY;

    // Adjust pan to keep mouse position fixed
    state.panX += realBefore - realAfter;
    state.panY += imagBefore - imagAfter;

    renderJulia(true); // Preview mode
    scheduleHighResRender();
}

// =============================================================================
// Mandelbrot Navigator
// =============================================================================

function onMandelbrotClick(e) {
    const rect = mandelbrotCanvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (mandelbrotCanvas.width / rect.width);
    const y = (e.clientY - rect.top) * (mandelbrotCanvas.height / rect.height);

    const width = mandelbrotCanvas.width;
    const height = mandelbrotCanvas.height;
    const zoom = height / 3;
    const panX = -0.5;
    const panY = 0;

    // Convert pixel to complex coordinate
    state.cReal = (x - width / 2) / zoom + panX;
    state.cImag = (y - height / 2) / zoom + panY;

    updateSliders();
    renderJulia();
    renderMandelbrot();
}

// =============================================================================
// Presets & Palettes
// =============================================================================

function onPresetClick(e) {
    const presetName = e.target.dataset.preset;
    const preset = presets[presetName];

    if (preset) {
        state.cReal = preset.cReal;
        state.cImag = preset.cImag;

        // Update active state
        document.querySelectorAll('.preset-btn').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');

        updateSliders();
        renderJulia();
        renderMandelbrot();
    }
}

function onPaletteClick(e) {
    const palette = e.target.dataset.palette;
    state.palette = palette;

    document.querySelectorAll('.palette-swatch').forEach(s => s.classList.remove('active'));
    e.target.classList.add('active');

    renderJulia();
    renderMandelbrot();
}

// =============================================================================
// Actions
// =============================================================================

function saveImage() {
    const link = document.createElement('a');
    link.download = `julia_${state.cReal.toFixed(3)}_${state.cImag.toFixed(3)}.png`;
    link.href = juliaCanvas.toDataURL('image/png');
    link.click();
}

function toggleMorph() {
    state.isMorphing = !state.isMorphing;
    const btn = document.getElementById('btnMorph');

    if (state.isMorphing) {
        btn.textContent = 'Stop';
        btn.classList.add('active');
        animateMorph();
    } else {
        btn.textContent = 'Morph';
        btn.classList.remove('active');
    }
}

function animateMorph() {
    if (!state.isMorphing) return;

    state.morphAngle += 0.02;
    const radius = 0.7885;

    state.cReal = radius * Math.cos(state.morphAngle);
    state.cImag = radius * Math.sin(state.morphAngle);

    updateSliders();
    renderJulia(true);
    renderMandelbrot();

    requestAnimationFrame(animateMorph);
}

function resetView() {
    state.zoom = 200;
    state.panX = 0;
    state.panY = 0;
    renderJulia();
}

function togglePanel() {
    const panel = document.querySelector('.control-panel');
    panel.classList.toggle('collapsed');
}

// =============================================================================
// Keyboard Shortcuts
// =============================================================================

function onKeyDown(e) {
    switch (e.key) {
        case 'r':
            resetView();
            break;
        case 's':
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                saveImage();
            }
            break;
        case 'm':
            toggleMorph();
            break;
        case 'Escape':
            state.isMorphing = false;
            break;
    }
}

// =============================================================================
// Utilities
// =============================================================================

let highResTimeout;
function scheduleHighResRender() {
    clearTimeout(highResTimeout);
    highResTimeout = setTimeout(() => {
        renderJulia(false);
    }, 150);
}

// =============================================================================
// Start Application
// =============================================================================

document.addEventListener('DOMContentLoaded', init);
