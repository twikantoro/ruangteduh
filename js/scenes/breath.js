/**
 * Breathing Sanctuary Scene
 * Visual guided box breathing (4s Inhale, 4s Hold, 4s Exhale, 4s Rest)
 * with a sacred geometry mandala, glowing aura, and particle vortex.
 */
class BreathSanctuaryScene {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;

        this.time = 0;
        this.particles = [];

        // Box Breathing: 4s inhale, 4s hold, 4s exhale, 4s hold = 16s cycle
        this.cycleDuration = 16;
        this.phaseText = 'Tarik Napas';
        this.breathScale = 0; // 0 (deflated) to 1 (fully inflated)

        this.init();
    }

    init() {
        this.resize();

        // Ambient particles drifting around the center
        this.particles = [];
        const count = 90;
        for (let i = 0; i < count; i++) {
            this.particles.push({
                angle: Math.random() * Math.PI * 2,
                distance: 60 + Math.random() * 260,
                speed: (0.15 + Math.random() * 0.4) * (Math.random() > 0.5 ? 1 : -1),
                size: 1.2 + Math.random() * 2.2,
                alpha: 0.2 + Math.random() * 0.6,
                colorShift: Math.random()
            });
        }
    }

    resize() {
        this.width = this.canvas.width = window.innerWidth;
        this.height = this.canvas.height = window.innerHeight;
    }

    onPointerMove(x, y) {}

    onPointerDown(x, y) {
        // Trigger a resonant chime if sound engine is available
        if (window.soundEngine && !window.soundEngine.isMuted) {
            window.soundEngine.playZenBowl();
        }
    }

    update(dt) {
        this.time += dt;

        // Calculate Breath Phase & Scale
        const cycleTime = this.time % this.cycleDuration;
        const segment = this.cycleDuration / 4; // 4 seconds each

        if (cycleTime < segment) {
            // Inhale (0 -> 1)
            const t = cycleTime / segment;
            // Smooth ease in-out
            this.breathScale = 0.5 - 0.5 * Math.cos(t * Math.PI);
            this.phaseText = 'Tarik Napas...';
        } else if (cycleTime < segment * 2) {
            // Hold Inhale (1)
            this.breathScale = 1.0;
            this.phaseText = 'Tahan napas...';
        } else if (cycleTime < segment * 3) {
            // Exhale (1 -> 0)
            const t = (cycleTime - segment * 2) / segment;
            this.breathScale = 0.5 + 0.5 * Math.cos(t * Math.PI);
            this.phaseText = 'Hembuskan perlahan...';
        } else {
            // Rest / Hold Exhale (0)
            this.breathScale = 0.0;
            this.phaseText = 'Lepaskan & rileks...';
        }

        // Update orbiting particles
        this.particles.forEach(p => {
            p.angle += p.speed * dt;
        });
    }

    render() {
        const ctx = this.ctx;
        const w = this.width;
        const h = this.height;
        const cx = w * 0.5;
        const cy = h * 0.5;

        // 1. Deep Serene Background
        const bgGrad = ctx.createRadialGradient(cx, cy, 50, cx, cy, Math.max(w, h) * 0.8);
        bgGrad.addColorStop(0, '#0f172a');
        bgGrad.addColorStop(0.5, '#090d16');
        bgGrad.addColorStop(1, '#030508');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, w, h);

        // 2. Ambient Floating Particles
        this.drawParticles(ctx, cx, cy);

        // 3. Central Breathing Mandala / Sacred Geometry
        this.drawMandala(ctx, cx, cy);

        // 4. Central Text Guide
        this.drawGuideText(ctx, cx, cy);
    }

    drawParticles(ctx, cx, cy) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        this.particles.forEach(p => {
            // Radius pulses gently with breath
            const currentDist = p.distance * (0.8 + this.breathScale * 0.4);
            const x = cx + Math.cos(p.angle) * currentDist;
            const y = cy + Math.sin(p.angle) * currentDist;

            ctx.fillStyle = `rgba(167, 139, 250, ${p.alpha * 0.7})`;
            ctx.beginPath();
            ctx.arc(x, y, p.size, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.restore();
    }

    drawMandala(ctx, cx, cy) {
        ctx.save();

        const baseRadius = Math.min(this.width, this.height) * 0.16;
        const radius = baseRadius * (0.75 + this.breathScale * 0.45);
        const rot = this.time * 0.08;

        // Soft outer glowing aura
        const auraGrad = ctx.createRadialGradient(cx, cy, radius * 0.3, cx, cy, radius * 1.8);
        auraGrad.addColorStop(0, 'rgba(129, 140, 248, 0.25)');
        auraGrad.addColorStop(0.5, 'rgba(167, 139, 250, 0.12)');
        auraGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, radius * 1.8, 0, Math.PI * 2);
        ctx.fill();

        // Outer pulsing ring
        ctx.strokeStyle = `rgba(192, 132, 252, ${0.3 + this.breathScale * 0.4})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.stroke();

        // Inner harmonic flower of life petals
        const petals = 8;
        ctx.strokeStyle = `rgba(147, 197, 253, ${0.2 + this.breathScale * 0.35})`;
        ctx.lineWidth = 1.2;

        for (let i = 0; i < petals; i++) {
            const angle = (i * Math.PI * 2) / petals + rot;
            const px = cx + Math.cos(angle) * (radius * 0.5);
            const py = cy + Math.sin(angle) * (radius * 0.5);

            ctx.beginPath();
            ctx.arc(px, py, radius * 0.5, 0, Math.PI * 2);
            ctx.stroke();
        }

        // Secondary counter-rotating petals
        for (let i = 0; i < petals; i++) {
            const angle = (i * Math.PI * 2) / petals - rot * 0.7;
            const px = cx + Math.cos(angle) * (radius * 0.28);
            const py = cy + Math.sin(angle) * (radius * 0.28);

            ctx.beginPath();
            ctx.arc(px, py, radius * 0.28, 0, Math.PI * 2);
            ctx.stroke();
        }

        // Inner core glow
        const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius * 0.4);
        coreGrad.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
        coreGrad.addColorStop(0.6, 'rgba(196, 181, 253, 0.2)');
        coreGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = coreGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, radius * 0.4, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    drawGuideText(ctx, cx, cy) {
        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Breath Guide Message inside the circle
        ctx.font = '300 20px "Outfit", "Inter", -apple-system, sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fillText(this.phaseText, cx, cy);

        // Subtitle box breathing counter
        const cycleTime = this.time % this.cycleDuration;
        const segment = this.cycleDuration / 4;
        const countdown = (segment - (cycleTime % segment)).toFixed(0);
        ctx.font = '200 13px "Outfit", "Inter", sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.fillText(`${countdown}s`, cx, cy + 28);

        ctx.restore();
    }
}

window.BreathSanctuaryScene = BreathSanctuaryScene;
