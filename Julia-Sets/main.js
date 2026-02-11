/**
 * Fractal Odyssey - GPU-Accelerated Julia Set Explorer
 * WebGL fragment shader rendering for real-time deep zoom
 */

// =============================================================================
// Shader Source Code
// =============================================================================

const vertexShaderSource = `
    attribute vec2 a_position;
    void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
    }
`;

const juliaShaderSource = `
    precision highp float;

    uniform vec2 u_resolution;
    uniform vec2 u_c;
    uniform vec2 u_pan;
    uniform float u_zoom;
    uniform int u_maxIter;
    uniform int u_palette;

    // HSL to RGB conversion
    vec3 hsl2rgb(float h, float s, float l) {
        vec3 rgb = clamp(abs(mod(h * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
        return l + s * (rgb - 0.5) * (1.0 - abs(2.0 * l - 1.0));
    }

    // Color palettes
    vec3 electricBlue(float t) {
        float h = 0.55 + t * 0.15;
        float s = 0.8 + sin(t * 12.566) * 0.2;
        float l = 0.1 + t * 0.7;
        return hsl2rgb(h, s, l);
    }

    vec3 inferno(float t) {
        return vec3(
            min(1.0, t * 3.0),
            t * t,
            pow(t, 0.5) * 0.4
        );
    }

    vec3 deepSpace(float t) {
        float v = pow(t, 0.7);
        return vec3(v, v, v);
    }

    vec3 psychedelic(float t) {
        float h = mod(t * 3.0, 1.0);
        return hsl2rgb(h, 1.0, 0.5);
    }

    vec3 getColor(float t, int palette) {
        if (palette == 0) return electricBlue(t);
        if (palette == 1) return inferno(t);
        if (palette == 2) return deepSpace(t);
        return psychedelic(t);
    }

    void main() {
        // Map pixel to complex plane
        vec2 uv = (gl_FragCoord.xy - u_resolution * 0.5) / u_zoom + u_pan;

        vec2 z = uv;
        vec2 c = u_c;

        int iter = 0;
        float zMag2 = 0.0;

        // Julia iteration: z = z² + c
        for (int i = 0; i < 10000; i++) {
            if (i >= u_maxIter) break;

            zMag2 = z.x * z.x + z.y * z.y;
            if (zMag2 > 4.0) break;

            float xNew = z.x * z.x - z.y * z.y + c.x;
            z.y = 2.0 * z.x * z.y + c.y;
            z.x = xNew;

            iter++;
        }

        if (iter >= u_maxIter) {
            gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
        } else {
            // Smooth coloring
            float smoothed = float(iter) + 1.0 - log(log(sqrt(zMag2))) / log(2.0);
            float t = smoothed / float(u_maxIter);
            vec3 color = getColor(t, u_palette);
            gl_FragColor = vec4(color, 1.0);
        }
    }
`;

const mandelbrotShaderSource = `
    precision highp float;

    uniform vec2 u_resolution;
    uniform vec2 u_pan;
    uniform float u_zoom;
    uniform int u_maxIter;
    uniform int u_palette;
    uniform vec2 u_marker;

    vec3 hsl2rgb(float h, float s, float l) {
        vec3 rgb = clamp(abs(mod(h * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
        return l + s * (rgb - 0.5) * (1.0 - abs(2.0 * l - 1.0));
    }

    vec3 electricBlue(float t) {
        float h = 0.55 + t * 0.15;
        float s = 0.8 + sin(t * 12.566) * 0.2;
        float l = 0.1 + t * 0.7;
        return hsl2rgb(h, s, l);
    }

    vec3 getColor(float t) {
        return electricBlue(t);
    }

    void main() {
        vec2 uv = (gl_FragCoord.xy - u_resolution * 0.5) / u_zoom + u_pan;

        vec2 z = vec2(0.0);
        vec2 c = uv;

        int iter = 0;
        float zMag2 = 0.0;

        for (int i = 0; i < 500; i++) {
            if (i >= u_maxIter) break;

            zMag2 = z.x * z.x + z.y * z.y;
            if (zMag2 > 4.0) break;

            float xNew = z.x * z.x - z.y * z.y + c.x;
            z.y = 2.0 * z.x * z.y + c.y;
            z.x = xNew;

            iter++;
        }

        // Draw marker for current c value
        vec2 markerUV = (u_marker - u_pan) * u_zoom + u_resolution * 0.5;
        float dist = length(gl_FragCoord.xy - markerUV);

        if (dist < 8.0 && dist > 5.0) {
            gl_FragColor = vec4(1.0, 0.0, 0.67, 1.0);
            return;
        }

        if (iter >= u_maxIter) {
            gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
        } else {
            float smoothed = float(iter) + 1.0 - log(log(sqrt(zMag2))) / log(2.0);
            float t = smoothed / float(u_maxIter);
            vec3 color = getColor(t);
            gl_FragColor = vec4(color, 1.0);
        }
    }
`;

// =============================================================================
// State & Configuration
// =============================================================================

const state = {
    // Julia Set c parameter
    cReal: -0.123,
    cImag: 0.745,

    // View parameters - use high precision for deep zoom
    zoom: 200,
    panX: 0,
    panY: 0,

    // Render settings
    maxIterations: 256,
    palette: 0, // 0=electric, 1=inferno, 2=deepspace, 3=psychedelic
    paletteNames: ['electric', 'inferno', 'deepspace', 'psychedelic'],

    // Interaction state
    isDragging: false,
    dragStart: { x: 0, y: 0 },
    panStart: { x: 0, y: 0 },
    isMorphing: false,
    morphAngle: 0,

    // Auto iteration scaling
    autoIterations: true
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
// WebGL Setup
// =============================================================================

let juliaCanvas, juliaGL, juliaProgram;
let mandelbrotCanvas, mandelbrotGL, mandelbrotProgram;

// UI elements
let sliderCReal, sliderCImag, sliderIterations;
let valueCReal, valueCImag, valueIterations;
let coordDisplay, zoomDisplay;

function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compile error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

function createProgram(gl, vertexSource, fragmentSource) {
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Program link error:', gl.getProgramInfoLog(program));
        return null;
    }
    return program;
}

function setupWebGL(canvas, fragmentSource) {
    const gl = canvas.getContext('webgl', {
        preserveDrawingBuffer: true,
        antialias: false
    });

    if (!gl) {
        console.error('WebGL not supported');
        return null;
    }

    const program = createProgram(gl, vertexShaderSource, fragmentSource);
    gl.useProgram(program);

    // Create full-screen quad
    const positions = new Float32Array([
        -1, -1,
         1, -1,
        -1,  1,
         1,  1
    ]);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    return { gl, program };
}

// =============================================================================
// Initialization
// =============================================================================

function init() {
    // Setup Julia canvas with WebGL
    juliaCanvas = document.getElementById('juliaCanvas');
    const juliaSetup = setupWebGL(juliaCanvas, juliaShaderSource);
    juliaGL = juliaSetup.gl;
    juliaProgram = juliaSetup.program;

    // Setup Mandelbrot canvas with WebGL
    mandelbrotCanvas = document.getElementById('mandelbrotCanvas');
    const mandelbrotSetup = setupWebGL(mandelbrotCanvas, mandelbrotShaderSource);
    mandelbrotGL = mandelbrotSetup.gl;
    mandelbrotProgram = mandelbrotSetup.program;

    // Get UI elements
    sliderCReal = document.getElementById('cReal');
    sliderCImag = document.getElementById('cImag');
    sliderIterations = document.getElementById('iterations');

    valueCReal = document.getElementById('valueCReal');
    valueCImag = document.getElementById('valueCImag');
    valueIterations = document.getElementById('valueIterations');

    coordDisplay = document.getElementById('coordDisplay');
    zoomDisplay = document.getElementById('zoomDisplay');

    // Setup event listeners
    setupEventListeners();

    // Initial resize and render
    resize();
    window.addEventListener('resize', resize);

    // Start render loop
    requestAnimationFrame(render);
}

// =============================================================================
// Resize Handling
// =============================================================================

function resize() {
    // Julia canvas - full screen
    juliaCanvas.width = window.innerWidth;
    juliaCanvas.height = window.innerHeight;
    juliaGL.viewport(0, 0, juliaCanvas.width, juliaCanvas.height);

    // Mandelbrot navigator - fixed aspect
    const navRect = mandelbrotCanvas.getBoundingClientRect();
    mandelbrotCanvas.width = navRect.width * window.devicePixelRatio;
    mandelbrotCanvas.height = navRect.height * window.devicePixelRatio;
    mandelbrotGL.viewport(0, 0, mandelbrotCanvas.width, mandelbrotCanvas.height);
}

// =============================================================================
// Rendering
// =============================================================================

function render() {
    renderJulia();
    renderMandelbrot();

    if (state.isMorphing) {
        requestAnimationFrame(render);
    }
}

function renderJulia() {
    const gl = juliaGL;
    const program = juliaProgram;

    gl.useProgram(program);

    // Calculate dynamic iterations based on zoom
    let iterations = state.maxIterations;
    if (state.autoIterations) {
        const zoomFactor = Math.log2(state.zoom / 200);
        iterations = Math.min(10000, Math.floor(state.maxIterations + zoomFactor * 100));
    }

    // Set uniforms
    gl.uniform2f(gl.getUniformLocation(program, 'u_resolution'), juliaCanvas.width, juliaCanvas.height);
    gl.uniform2f(gl.getUniformLocation(program, 'u_c'), state.cReal, state.cImag);
    gl.uniform2f(gl.getUniformLocation(program, 'u_pan'), state.panX, state.panY);
    gl.uniform1f(gl.getUniformLocation(program, 'u_zoom'), state.zoom);
    gl.uniform1i(gl.getUniformLocation(program, 'u_maxIter'), iterations);
    gl.uniform1i(gl.getUniformLocation(program, 'u_palette'), state.palette);

    // Draw
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    // Update zoom display
    if (zoomDisplay) {
        const zoomLevel = (state.zoom / 200).toExponential(2);
        zoomDisplay.textContent = `${zoomLevel}x`;
    }
}

function renderMandelbrot() {
    const gl = mandelbrotGL;
    const program = mandelbrotProgram;

    gl.useProgram(program);

    const zoom = mandelbrotCanvas.height / 3;

    gl.uniform2f(gl.getUniformLocation(program, 'u_resolution'), mandelbrotCanvas.width, mandelbrotCanvas.height);
    gl.uniform2f(gl.getUniformLocation(program, 'u_pan'), -0.5, 0);
    gl.uniform1f(gl.getUniformLocation(program, 'u_zoom'), zoom);
    gl.uniform1i(gl.getUniformLocation(program, 'u_maxIter'), 100);
    gl.uniform1i(gl.getUniformLocation(program, 'u_palette'), state.palette);
    gl.uniform2f(gl.getUniformLocation(program, 'u_marker'), state.cReal, state.cImag);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
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

    // Touch support
    juliaCanvas.addEventListener('touchstart', onTouchStart, { passive: false });
    juliaCanvas.addEventListener('touchmove', onTouchMove, { passive: false });
    juliaCanvas.addEventListener('touchend', onTouchEnd);

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
    render();
}

function onIterationsChange() {
    state.maxIterations = parseInt(sliderIterations.value);
    valueIterations.textContent = state.maxIterations;
    render();
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
    const rect = juliaCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Flip Y for WebGL coordinates
    const real = (x - juliaCanvas.width / 2) / state.zoom + state.panX;
    const imag = ((juliaCanvas.height - y) - juliaCanvas.height / 2) / state.zoom + state.panY;

    coordDisplay.innerHTML = `z = <span>${real.toFixed(6)}</span> + <span>${imag.toFixed(6)}</span>i`;

    if (state.isDragging) {
        const dx = (e.clientX - state.dragStart.x) / state.zoom;
        const dy = (e.clientY - state.dragStart.y) / state.zoom;

        state.panX = state.panStart.x - dx;
        state.panY = state.panStart.y + dy; // Flip Y

        render();
    }
}

function onMouseUp() {
    state.isDragging = false;
    juliaCanvas.style.cursor = 'crosshair';
}

function onWheel(e) {
    e.preventDefault();

    const rect = juliaCanvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = juliaCanvas.height - (e.clientY - rect.top); // Flip Y

    // Get complex coordinate before zoom
    const realBefore = (mouseX - juliaCanvas.width / 2) / state.zoom + state.panX;
    const imagBefore = (mouseY - juliaCanvas.height / 2) / state.zoom + state.panY;

    // Zoom factor - smoother zooming
    const zoomFactor = e.deltaY > 0 ? 0.85 : 1.18;
    state.zoom *= zoomFactor;

    // No upper limit for infinite zoom! Lower limit to prevent zooming out too far
    state.zoom = Math.max(50, state.zoom);

    // Get complex coordinate after zoom
    const realAfter = (mouseX - juliaCanvas.width / 2) / state.zoom + state.panX;
    const imagAfter = (mouseY - juliaCanvas.height / 2) / state.zoom + state.panY;

    // Adjust pan to keep mouse position fixed
    state.panX += realBefore - realAfter;
    state.panY += imagBefore - imagAfter;

    render();
}

// =============================================================================
// Touch Handlers
// =============================================================================

let lastTouchDistance = 0;

function onTouchStart(e) {
    e.preventDefault();

    if (e.touches.length === 1) {
        state.isDragging = true;
        state.dragStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        state.panStart = { x: state.panX, y: state.panY };
    } else if (e.touches.length === 2) {
        lastTouchDistance = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY
        );
    }
}

function onTouchMove(e) {
    e.preventDefault();

    if (e.touches.length === 1 && state.isDragging) {
        const dx = (e.touches[0].clientX - state.dragStart.x) / state.zoom;
        const dy = (e.touches[0].clientY - state.dragStart.y) / state.zoom;

        state.panX = state.panStart.x - dx;
        state.panY = state.panStart.y + dy;

        render();
    } else if (e.touches.length === 2) {
        const distance = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY
        );

        const zoomFactor = distance / lastTouchDistance;
        state.zoom *= zoomFactor;
        state.zoom = Math.max(50, state.zoom);

        lastTouchDistance = distance;
        render();
    }
}

function onTouchEnd() {
    state.isDragging = false;
}

// =============================================================================
// Mandelbrot Navigator
// =============================================================================

function onMandelbrotClick(e) {
    const rect = mandelbrotCanvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (mandelbrotCanvas.width / rect.width);
    const y = mandelbrotCanvas.height - (e.clientY - rect.top) * (mandelbrotCanvas.height / rect.height);

    const zoom = mandelbrotCanvas.height / 3;

    state.cReal = (x - mandelbrotCanvas.width / 2) / zoom + (-0.5);
    state.cImag = (y - mandelbrotCanvas.height / 2) / zoom;

    updateSliders();
    render();
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

        // Reset view when changing preset
        state.zoom = 200;
        state.panX = 0;
        state.panY = 0;

        document.querySelectorAll('.preset-btn').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');

        updateSliders();
        render();
    }
}

function onPaletteClick(e) {
    const paletteName = e.target.dataset.palette;
    state.palette = state.paletteNames.indexOf(paletteName);

    document.querySelectorAll('.palette-swatch').forEach(s => s.classList.remove('active'));
    e.target.classList.add('active');

    render();
}

// =============================================================================
// Actions
// =============================================================================

function saveImage() {
    const link = document.createElement('a');
    link.download = `julia_${state.cReal.toFixed(3)}_${state.cImag.toFixed(3)}_z${state.zoom.toExponential(2)}.png`;
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

    state.morphAngle += 0.015;
    const radius = 0.7885;

    state.cReal = radius * Math.cos(state.morphAngle);
    state.cImag = radius * Math.sin(state.morphAngle);

    updateSliders();
    render();

    requestAnimationFrame(animateMorph);
}

function resetView() {
    state.zoom = 200;
    state.panX = 0;
    state.panY = 0;
    render();
}

function togglePanel() {
    const panel = document.querySelector('.control-panel');
    panel.classList.toggle('collapsed');
    const btn = document.getElementById('panelToggle');
    btn.textContent = panel.classList.contains('collapsed') ? '+' : '−';
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
            document.getElementById('btnMorph').textContent = 'Morph';
            document.getElementById('btnMorph').classList.remove('active');
            break;
        case '+':
        case '=':
            state.zoom *= 1.5;
            render();
            break;
        case '-':
            state.zoom = Math.max(50, state.zoom / 1.5);
            render();
            break;
    }
}

// =============================================================================
// Start Application
// =============================================================================

document.addEventListener('DOMContentLoaded', init);
