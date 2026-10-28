/**
 * Soothing Idle Space - Main Application Controller
 */
(function() {
    'use strict';

    // State
    let canvas, ctx;
    let currentScene = null;
    let currentSceneKey = 'koi';
    let scenes = {};
    let lastTime = 0;
    let idleTimer = null;
    let isUiHidden = false;
    let breakStartTime = Date.now();
    let clockMode = 'timer'; // 'timer' or 'realtime'

    // UI Elements
    let uiContainer, sceneButtons, audioToggleBtn, audioMixerModal, audioModalClose;
    let timerDisplay, fullscreenBtn, infoBtn, infoModal, infoModalClose;

    function init() {
        canvas = document.getElementById('scene-canvas');
        uiContainer = document.getElementById('ui-container');
        timerDisplay = document.getElementById('break-timer');
        audioToggleBtn = document.getElementById('btn-audio-toggle');
        fullscreenBtn = document.getElementById('btn-fullscreen');
        infoBtn = document.getElementById('btn-info');
        audioMixerModal = document.getElementById('audio-modal');
        audioModalClose = document.getElementById('btn-close-audio-modal');
        infoModal = document.getElementById('info-modal');
        infoModalClose = document.getElementById('btn-close-info-modal');
        sceneButtons = document.querySelectorAll('.scene-tab');

        // Setup Scenes
        scenes = {
            koi: new KoiPondScene(canvas),
            aurora: new AuroraScene(canvas),
            rain: new RainWindowScene(canvas),
            breath: new BreathSanctuaryScene(canvas)
        };

        // Default scene
        currentSceneKey = 'koi';
        currentScene = scenes.koi;

        // Start Mindful Quotes
        const quoteMgr = new QuoteManager('mindful-quote-box');
        quoteMgr.start();

        // Bind Events
        bindEvents();

        // Start Break Timer
        startTimerLoop();

        // Reset Idle UI timer
        resetIdleTimer();

        // Start Animation Loop
        lastTime = performance.now();
        requestAnimationFrame(renderLoop);
    }

    function switchScene(key) {
        if (!scenes[key] || currentSceneKey === key) return;

        currentSceneKey = key;
        currentScene = scenes[key];
        currentScene.resize();

        // Update active tab UI
        sceneButtons.forEach(btn => {
            if (btn.dataset.scene === key) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // Trigger gentle sound chime
        if (window.soundEngine && !window.soundEngine.isMuted) {
            window.soundEngine.playZenBowl();
        }
    }

    function renderLoop(now) {
        const dt = Math.min((now - lastTime) / 1000, 0.1); // Cap delta time to prevent jumps
        lastTime = now;

        if (currentScene) {
            currentScene.update(dt);
            currentScene.render();
        }

        requestAnimationFrame(renderLoop);
    }

    function bindEvents() {
        // Window Resize
        window.addEventListener('resize', () => {
            if (currentScene) currentScene.resize();
        });

        // Pointer Events (Mouse & Touch)
        window.addEventListener('pointermove', (e) => {
            resetIdleTimer();
            if (currentScene && currentScene.onPointerMove) {
                currentScene.onPointerMove(e.clientX, e.clientY);
            }
        });

        window.addEventListener('pointerdown', (e) => {
            resetIdleTimer();
            // Don't trigger canvas ripple if clicking on interactive UI
            if (e.target.closest('button, .glass-panel, input, a')) return;

            // Auto-resume Web Audio context on user gesture
            if (window.soundEngine) {
                window.soundEngine.resume();
            }

            if (currentScene && currentScene.onPointerDown) {
                currentScene.onPointerDown(e.clientX, e.clientY);
            }
        });

        // Scene Navigation Tabs
        sceneButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const targetScene = btn.dataset.scene;
                switchScene(targetScene);
            });
        });

        // Audio Toggle Button
        if (audioToggleBtn) {
            audioToggleBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleAudio();
            });
        }

        // Audio Mixer Sliders & Toggles
        setupAudioMixer();

        // Fullscreen Toggle
        if (fullscreenBtn) {
            fullscreenBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleFullscreen();
            });
        }

        // Info / Panduan Modal
        if (infoBtn && infoModal) {
            infoBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                infoModal.classList.toggle('active');
            });
        }
        if (infoModalClose) {
            infoModalClose.addEventListener('click', () => {
                infoModal.classList.remove('active');
            });
        }

        // Audio Modal Open/Close
        const btnOpenMixer = document.getElementById('btn-open-mixer');
        if (btnOpenMixer && audioMixerModal) {
            btnOpenMixer.addEventListener('click', (e) => {
                e.stopPropagation();
                audioMixerModal.classList.toggle('active');
            });
        }
        if (audioModalClose) {
            audioModalClose.addEventListener('click', () => {
                audioMixerModal.classList.remove('active');
            });
        }

        // Click timer to toggle between Break Duration and Real-Time Clock
        if (timerDisplay) {
            timerDisplay.addEventListener('click', (e) => {
                e.stopPropagation();
                clockMode = clockMode === 'timer' ? 'realtime' : 'timer';
                updateTimerText();
            });
        }

        // Keyboard Shortcuts
        window.addEventListener('keydown', (e) => {
            // Ignore if typing in an input
            if (e.target.tagName === 'INPUT') return;

            resetIdleTimer();

            switch (e.key.toLowerCase()) {
                case '1':
                    switchScene('koi');
                    break;
                case '2':
                    switchScene('aurora');
                    break;
                case '3':
                    switchScene('rain');
                    break;
                case '4':
                    switchScene('breath');
                    break;
                case 'm':
                    toggleAudio();
                    break;
                case 'f':
                    toggleFullscreen();
                    break;
                case ' ':
                    // Spacebar triggers zen chime
                    e.preventDefault();
                    if (window.soundEngine) {
                        window.soundEngine.resume();
                        window.soundEngine.playZenBowl();
                    }
                    break;
                case 'h':
                    // Manually toggle UI hide
                    toggleUiHide();
                    break;
                case 'escape':
                    if (audioMixerModal) audioMixerModal.classList.remove('active');
                    if (infoModal) infoModal.classList.remove('active');
                    break;
            }
        });
    }

    function toggleAudio() {
        if (!window.soundEngine) return;
        const isMuted = window.soundEngine.toggleMute();
        updateAudioButtonState(isMuted);
    }

    function updateAudioButtonState(isMuted) {
        if (!audioToggleBtn) return;
        const icon = audioToggleBtn.querySelector('.icon');
        const text = audioToggleBtn.querySelector('.label');

        if (isMuted) {
            audioToggleBtn.classList.remove('active');
            if (icon) icon.textContent = '🔇';
            if (text) text.textContent = 'Suara Senyap';
        } else {
            audioToggleBtn.classList.add('active');
            if (icon) icon.textContent = '🔊';
            if (text) text.textContent = 'Suara Alami';
        }
    }

    function setupAudioMixer() {
        const engine = window.soundEngine;
        if (!engine) return;

        const masterSlider = document.getElementById('master-vol');
        if (masterSlider) {
            masterSlider.addEventListener('input', (e) => {
                engine.setMasterVolume(parseFloat(e.target.value));
            });
        }

        const channelNames = ['drone', 'rain', 'ocean', 'chimes'];
        channelNames.forEach(name => {
            const slider = document.getElementById(`vol-${name}`);
            const checkbox = document.getElementById(`toggle-${name}`);

            if (slider) {
                slider.addEventListener('input', (e) => {
                    engine.setChannelVolume(name, parseFloat(e.target.value));
                });
            }

            if (checkbox) {
                checkbox.addEventListener('change', (e) => {
                    engine.toggleChannel(name);
                });
            }
        });
    }

    function toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
            if (fullscreenBtn) fullscreenBtn.classList.add('active');
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen().catch(() => {});
            }
            if (fullscreenBtn) fullscreenBtn.classList.remove('active');
        }
    }

    function resetIdleTimer() {
        if (isUiHidden) {
            document.body.classList.remove('idle-hidden');
            isUiHidden = false;
        }

        clearTimeout(idleTimer);
        // Hide UI after 3.8 seconds of complete stillness
        idleTimer = setTimeout(() => {
            // Don't auto-hide if a modal is open
            if ((audioMixerModal && audioMixerModal.classList.contains('active')) ||
                (infoModal && infoModal.classList.contains('active'))) {
                return;
            }
            document.body.classList.add('idle-hidden');
            isUiHidden = true;
        }, 3800);
    }

    function toggleUiHide() {
        isUiHidden = !isUiHidden;
        document.body.classList.toggle('idle-hidden', isUiHidden);
    }

    function startTimerLoop() {
        setInterval(() => {
            updateTimerText();
        }, 1000);
        updateTimerText();
    }

    function updateTimerText() {
        if (!timerDisplay) return;

        if (clockMode === 'timer') {
            const elapsedMs = Date.now() - breakStartTime;
            const totalSec = Math.floor(elapsedMs / 1000);
            const m = Math.floor(totalSec / 60);
            const s = totalSec % 60;
            const strM = m < 10 ? '0' + m : m;
            const strS = s < 10 ? '0' + s : s;
            timerDisplay.innerHTML = `<span class="timer-tag">Istirahat</span> <span class="timer-digits">${strM}:${strS}</span>`;
        } else {
            const now = new Date();
            const h = String(now.getHours()).padStart(2, '0');
            const m = String(now.getMinutes()).padStart(2, '0');
            const s = String(now.getSeconds()).padStart(2, '0');
            timerDisplay.innerHTML = `<span class="timer-tag">Waktu</span> <span class="timer-digits">${h}:${m}:${s}</span>`;
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
