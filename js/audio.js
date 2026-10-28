/**
 * Web Audio API Procedural Relaxation Soundscape Synthesizer
 * 100% generated in real-time. No external audio files or internet connection required.
 */
class SoundscapeEngine {
    constructor() {
        this.ctx = null;
        this.isMuted = true;
        this.masterVolume = 0.6;
        
        // Track states
        this.channels = {
            drone: { active: true, volume: 0.35, node: null, gainNode: null },
            rain: { active: true, volume: 0.25, node: null, gainNode: null },
            ocean: { active: true, volume: 0.3, node: null, gainNode: null },
            chimes: { active: true, volume: 0.4, timer: null }
        };

        this.initialized = false;
    }

    init() {
        if (this.initialized) return;
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioContext();

        // Master Gain
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.masterVolume, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);

        // Sub-bus for reverb / space
        this.createReverbBus();

        // Start synthesizers
        this.startDrone();
        this.startRain();
        this.startOcean();
        this.startChimeLoop();

        this.initialized = true;
    }

    resume() {
        if (!this.initialized) {
            this.init();
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    createReverbBus() {
        // Simple synthetic delay/reverb network for spaciousness
        this.reverbSend = this.ctx.createGain();
        this.reverbSend.gain.setValueAtTime(0.3, this.ctx.currentTime);

        const delay1 = this.ctx.createDelay();
        delay1.delayTime.value = 0.35;
        const delay2 = this.ctx.createDelay();
        delay2.delayTime.value = 0.52;

        const feedback = this.ctx.createGain();
        feedback.gain.value = 0.35;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 1800;

        this.reverbSend.connect(delay1);
        delay1.connect(delay2);
        delay2.connect(filter);
        filter.connect(feedback);
        feedback.connect(delay1);
        filter.connect(this.masterGain);
    }

    // --- 1. Warm Ambient Drone (Pentatonic chord, calm 432Hz tuning) ---
    startDrone() {
        const chan = this.channels.drone;
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(chan.active ? chan.volume : 0, this.ctx.currentTime);
        gain.connect(this.masterGain);
        gain.connect(this.reverbSend);
        chan.gainNode = gain;

        // Frequencies for a soothing D-major 9th / Pentatonic chord (D3, A3, E4, F#4, A4)
        const baseFreqs = [144, 216, 324, 364, 432];

        baseFreqs.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

            // Subtle slow vibrato / detuning
            const lfo = this.ctx.createOscillator();
            lfo.frequency.setValueAtTime(0.08 + idx * 0.03, this.ctx.currentTime);
            const lfoGain = this.ctx.createGain();
            lfoGain.gain.setValueAtTime(0.8, this.ctx.currentTime);
            lfo.connect(lfoGain);
            lfoGain.connect(osc.frequency);
            lfo.start();

            // Panning
            const panner = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;
            if (panner) {
                panner.pan.setValueAtTime((idx / (baseFreqs.length - 1)) * 1.4 - 0.7, this.ctx.currentTime);
            }

            const oscGain = this.ctx.createGain();
            oscGain.gain.setValueAtTime(0.12 / baseFreqs.length, this.ctx.currentTime);

            if (panner) {
                osc.connect(panner);
                panner.connect(gain);
            } else {
                osc.connect(gain);
            }

            osc.start();
        });
    }

    // --- 2. Gentle Pink Rain & Subtle Drop Patter ---
    startRain() {
        const chan = this.channels.rain;
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(chan.active ? chan.volume : 0, this.ctx.currentTime);
        gain.connect(this.masterGain);
        chan.gainNode = gain;

        // Generate 3 seconds of pinkish noise
        const bufferSize = this.ctx.sampleRate * 3;
        const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            b0 = 0.99886 * b0 + white * 0.0555179;
            b1 = 0.99332 * b1 + white * 0.0750759;
            b2 = 0.96900 * b2 + white * 0.1538520;
            b3 = 0.86650 * b3 + white * 0.3104856;
            b4 = 0.55000 * b4 + white * 0.5329522;
            b5 = -0.7616 * b5 - white * 0.0168980;
            output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.08;
            b6 = white * 0.115926;
        }

        const whiteNoise = this.ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        // Filter rain to sound like soft rainfall outside a window
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1400, this.ctx.currentTime);

        const highpass = this.ctx.createBiquadFilter();
        highpass.type = 'highpass';
        highpass.frequency.setValueAtTime(250, this.ctx.currentTime);

        whiteNoise.connect(highpass);
        highpass.connect(filter);
        filter.connect(gain);
        whiteNoise.start();

        // Random subtle rain drop taps
        const dropLoop = () => {
            if (this.ctx && chan.active && !this.isMuted) {
                this.triggerRainDrop(gain);
            }
            const nextDropDelay = 120 + Math.random() * 380;
            setTimeout(dropLoop, nextDropDelay);
        };
        dropLoop();
    }

    triggerRainDrop(targetGain) {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const dropGain = this.ctx.createGain();
        const now = this.ctx.currentTime;

        const freq = 1200 + Math.random() * 1600;
        osc.frequency.setValueAtTime(freq, now);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.6, now + 0.04);

        dropGain.gain.setValueAtTime(0.03 * Math.random(), now);
        dropGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);

        osc.connect(dropGain);
        dropGain.connect(targetGain);

        osc.start(now);
        osc.stop(now + 0.05);
    }

    // --- 3. Ocean Waves / Wind Breathe (Modulated Brown Noise) ---
    startOcean() {
        const chan = this.channels.ocean;
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(chan.active ? chan.volume : 0, this.ctx.currentTime);
        gain.connect(this.masterGain);
        chan.gainNode = gain;

        // Generate Brown noise
        const bufferSize = this.ctx.sampleRate * 4;
        const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            output[i] = (lastOut + (0.02 * white)) / 1.02;
            lastOut = output[i];
            output[i] *= 2.5; // Gain compensation
        }

        const brownNoise = this.ctx.createBufferSource();
        brownNoise.buffer = noiseBuffer;
        brownNoise.loop = true;

        // Dynamic filter modulated by slow wave rhythm (0.08 Hz = ~12s wave cycle)
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(320, this.ctx.currentTime);

        const waveLfo = this.ctx.createOscillator();
        waveLfo.frequency.setValueAtTime(0.075, this.ctx.currentTime); // ~13 sec breathing cycle

        const waveGain = this.ctx.createGain();
        waveGain.gain.setValueAtTime(380, this.ctx.currentTime);

        waveLfo.connect(waveGain);
        waveGain.connect(filter.frequency);
        waveLfo.start();

        brownNoise.connect(filter);
        filter.connect(gain);
        brownNoise.start();
    }

    // --- 4. Singing Bowl / Zen Bell (Harmonic additive synthesis) ---
    startChimeLoop() {
        const scheduleNext = () => {
            const delay = 16000 + Math.random() * 12000; // Every 16-28 seconds
            this.channels.chimes.timer = setTimeout(() => {
                if (this.channels.chimes.active && !this.isMuted) {
                    this.playZenBowl();
                }
                scheduleNext();
            }, delay);
        };
        scheduleNext();
    }

    playZenBowl(customFreq = null) {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const pentatonicBells = [216, 243, 288, 324, 384, 432];
        const root = customFreq || pentatonicBells[Math.floor(Math.random() * pentatonicBells.length)];

        // Overtone structure of singing bowls / bronze bells
        const harmonics = [
            { mult: 1.0, gain: 0.25, decay: 7.5 },
            { mult: 2.76, gain: 0.12, decay: 5.5 },
            { mult: 5.40, gain: 0.05, decay: 3.5 },
            { mult: 8.93, gain: 0.02, decay: 2.0 }
        ];

        const bowlGain = this.ctx.createGain();
        bowlGain.gain.setValueAtTime(this.channels.chimes.volume, now);
        bowlGain.connect(this.masterGain);
        bowlGain.connect(this.reverbSend);

        harmonics.forEach(h => {
            const osc = this.ctx.createOscillator();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(root * h.mult, now);

            // Subtle slow wobble
            const lfo = this.ctx.createOscillator();
            lfo.frequency.value = 1.2 + Math.random() * 0.8;
            const lfoAmp = this.ctx.createGain();
            lfoAmp.gain.value = 0.6;
            lfo.connect(lfoAmp);
            lfoAmp.connect(osc.frequency);
            lfo.start(now);

            const g = this.ctx.createGain();
            g.gain.setValueAtTime(0.0001, now);
            g.gain.linearRampToValueAtTime(h.gain, now + 0.08); // Soft strike
            g.gain.exponentialRampToValueAtTime(0.0001, now + h.decay);

            osc.connect(g);
            g.connect(bowlGain);

            osc.start(now);
            osc.stop(now + h.decay + 0.1);
            lfo.stop(now + h.decay + 0.1);
        });
    }

    // --- Master Controls ---
    toggleMute() {
        this.resume();
        this.isMuted = !this.isMuted;
        if (this.masterGain) {
            const targetVal = this.isMuted ? 0 : this.masterVolume;
            this.masterGain.gain.setTargetAtTime(targetVal, this.ctx.currentTime, 0.15);
        }
        return this.isMuted;
    }

    setMasterVolume(val) {
        this.masterVolume = Math.max(0, Math.min(1, val));
        if (!this.isMuted && this.masterGain) {
            this.masterGain.gain.setTargetAtTime(this.masterVolume, this.ctx.currentTime, 0.05);
        }
    }

    setChannelVolume(channelName, val) {
        const chan = this.channels[channelName];
        if (!chan) return;
        chan.volume = Math.max(0, Math.min(1, val));
        if (chan.gainNode && this.ctx) {
            const target = chan.active ? chan.volume : 0;
            chan.gainNode.gain.setTargetAtTime(target, this.ctx.currentTime, 0.08);
        }
    }

    toggleChannel(channelName) {
        const chan = this.channels[channelName];
        if (!chan) return;
        chan.active = !chan.active;
        if (chan.gainNode && this.ctx) {
            const target = chan.active ? chan.volume : 0;
            chan.gainNode.gain.setTargetAtTime(target, this.ctx.currentTime, 0.08);
        }
        return chan.active;
    }
}

window.soundEngine = new SoundscapeEngine();
