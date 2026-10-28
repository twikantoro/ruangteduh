/**
 * Celestial Aurora & Stardust Scene
 * Multi-layer flowing aurora curtains, twinkling starry cosmos,
 * floating glowing fireflies, shooting stars, and interactive stardust trails.
 */
class AuroraScene {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;

        this.time = 0;
        this.stars = [];
        this.fireflies = [];
        this.trail = [];
        this.meteors = [];
        this.nextMeteorTime = 4 + Math.random() * 8;

        this.init();
    }

    init() {
        this.resize();

        // 1. Generate Star Field
        this.stars = [];
        const starCount = Math.floor((this.width * this.height) / 3800);
        for (let i = 0; i < starCount; i++) {
            this.stars.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                radius: 0.5 + Math.random() * 1.5,
                alpha: 0.2 + Math.random() * 0.8,
                twinkleSpeed: 0.8 + Math.random() * 2.5,
                phase: Math.random() * Math.PI * 2,
                hue: Math.random() > 0.8 ? (Math.random() > 0.5 ? 200 : 280) : 50 // Soft blue/violet or warm white
            });
        }

        // 2. Generate Floating Luminescent Fireflies
        this.fireflies = [];
        const fireflyCount = Math.floor(Math.min(this.width, this.height) / 32);
        for (let i = 0; i < fireflyCount; i++) {
            this.fireflies.push(new Firefly(this.width, this.height));
        }
    }

    resize() {
        this.width = this.canvas.width = window.innerWidth;
        this.height = this.canvas.height = window.innerHeight;
    }

    onPointerMove(x, y) {
        // Spawn gentle stardust
        for (let i = 0; i < 2; i++) {
            this.trail.push(new StardustParticle(x + (Math.random() - 0.5) * 12, y + (Math.random() - 0.5) * 12));
        }
    }

    onPointerDown(x, y) {
        // Celestial burst
        for (let i = 0; i < 18; i++) {
            const angle = Math.random() * Math.PI * 2;
            const spd = 20 + Math.random() * 60;
            this.trail.push(new StardustParticle(x, y, Math.cos(angle) * spd, Math.sin(angle) * spd));
        }
        // Also trigger a shooting star
        this.spawnMeteor();
    }

    spawnMeteor() {
        this.meteors.push(new ShootingStar(this.width, this.height));
    }

    update(dt) {
        this.time += dt;

        // Meteor timer
        this.nextMeteorTime -= dt;
        if (this.nextMeteorTime <= 0) {
            this.spawnMeteor();
            this.nextMeteorTime = 12 + Math.random() * 18;
        }

        // Update shooting stars
        for (let i = this.meteors.length - 1; i >= 0; i--) {
            const m = this.meteors[i];
            m.update(dt);
            if (m.isDead) this.meteors.splice(i, 1);
        }

        // Update fireflies
        this.fireflies.forEach(f => f.update(dt, this.width, this.height));

        // Update stardust trail
        for (let i = this.trail.length - 1; i >= 0; i--) {
            const p = this.trail[i];
            p.update(dt);
            if (p.alpha <= 0.01) this.trail.splice(i, 1);
        }
    }

    render() {
        const ctx = this.ctx;
        const w = this.width;
        const h = this.height;

        // 1. Deep Midnight Cosmic Gradient
        const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
        skyGrad.addColorStop(0, '#030514');
        skyGrad.addColorStop(0.5, '#070f24');
        skyGrad.addColorStop(1, '#020b16');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, w, h);

        // 2. Stars Field
        this.drawStars(ctx);

        // 3. Flowing Aurora Curtains
        this.drawAurora(ctx, w, h);

        // 4. Shooting Stars
        this.meteors.forEach(m => m.draw(ctx));

        // 5. Fireflies
        this.fireflies.forEach(f => f.draw(ctx));

        // 6. Interactive Stardust
        this.trail.forEach(p => p.draw(ctx));

        // 7. Mountain Silhouette (Soft horizon depth)
        this.drawHorizon(ctx, w, h);
    }

    drawStars(ctx) {
        ctx.save();
        this.stars.forEach(s => {
            const twinkle = 0.45 + Math.sin(this.time * s.twinkleSpeed + s.phase) * 0.45;
            ctx.fillStyle = `hsla(${s.hue}, 80%, 90%, ${s.alpha * twinkle})`;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.radius * (0.8 + twinkle * 0.4), 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.restore();
    }

    drawAurora(ctx, w, h) {
        ctx.save();
        ctx.globalCompositeOperation = 'screen';

        const t = this.time * 0.4;
        const layers = [
            { color1: 'rgba(56, 239, 125, 0.45)', color2: 'rgba(17, 153, 142, 0.0)', baseY: h * 0.32, amp: 75, freq: 0.0032, speed: 0.8 },
            { color1: 'rgba(0, 242, 254, 0.4)', color2: 'rgba(79, 172, 254, 0.0)', baseY: h * 0.28, amp: 95, freq: 0.0025, speed: -0.6 },
            { color1: 'rgba(196, 113, 237, 0.35)', color2: 'rgba(18, 194, 233, 0.0)', baseY: h * 0.24, amp: 85, freq: 0.004, speed: 1.1 }
        ];

        layers.forEach((layer, lIdx) => {
            ctx.beginPath();
            ctx.moveTo(0, h);
            ctx.lineTo(0, layer.baseY);

            const step = 14;
            for (let x = 0; x <= w + step; x += step) {
                const wave1 = Math.sin(x * layer.freq + t * layer.speed) * layer.amp;
                const wave2 = Math.cos(x * layer.freq * 1.8 - t * 0.4) * (layer.amp * 0.45);
                const wave3 = Math.sin(x * 0.0008 + t * 0.2) * 35;
                const y = layer.baseY + wave1 + wave2 + wave3;
                ctx.lineTo(x, y);
            }

            ctx.lineTo(w, h);
            ctx.closePath();

            const curtainGrad = ctx.createLinearGradient(0, layer.baseY - layer.amp, 0, layer.baseY + h * 0.45);
            curtainGrad.addColorStop(0, layer.color1);
            curtainGrad.addColorStop(0.65, layer.color1);
            curtainGrad.addColorStop(1, layer.color2);

            ctx.fillStyle = curtainGrad;
            ctx.filter = 'blur(16px)';
            ctx.fill();
            ctx.filter = 'none';
        });

        ctx.restore();
    }

    drawHorizon(ctx, w, h) {
        ctx.save();
        // Distant gentle mountain ridges
        ctx.fillStyle = '#01050a';
        ctx.beginPath();
        ctx.moveTo(0, h);
        ctx.lineTo(0, h * 0.88);

        const step = 40;
        for (let x = 0; x <= w; x += step) {
            const my = h * 0.88 + Math.sin(x * 0.003) * 45 + Math.cos(x * 0.008) * 18;
            ctx.lineTo(x, my);
        }
        ctx.lineTo(w, h);
        ctx.closePath();
        ctx.fill();

        // Very soft mist over mountains
        const mistGrad = ctx.createLinearGradient(0, h * 0.82, 0, h);
        mistGrad.addColorStop(0, 'rgba(16, 37, 66, 0.0)');
        mistGrad.addColorStop(0.5, 'rgba(16, 37, 66, 0.2)');
        mistGrad.addColorStop(1, 'rgba(1, 5, 10, 0.7)');
        ctx.fillStyle = mistGrad;
        ctx.fillRect(0, h * 0.8, w, h * 0.2);
        ctx.restore();
    }
}

/**
 * Luminescent Firefly
 */
class Firefly {
    constructor(w, h) {
        this.w = w;
        this.h = h;
        this.reset();
        this.y = Math.random() * h;
    }

    reset() {
        this.x = Math.random() * this.w;
        this.y = this.h * (0.3 + 0.65 * Math.random());
        this.vx = (Math.random() - 0.5) * 14;
        this.vy = (Math.random() - 0.5) * 10;
        this.size = 1.6 + Math.random() * 2.2;
        this.pulseSpeed = 1.2 + Math.random() * 1.8;
        this.pulsePhase = Math.random() * Math.PI * 2;
        this.color = Math.random() > 0.4 ? '180, 255, 160' : '255, 230, 130';
    }

    update(dt, w, h) {
        this.w = w;
        this.h = h;
        this.pulsePhase += this.pulseSpeed * dt;

        // Gentle Brownian wander
        this.vx += (Math.random() - 0.5) * 20 * dt;
        this.vy += (Math.random() - 0.5) * 20 * dt;
        this.vx = Math.max(-25, Math.min(25, this.vx));
        this.vy = Math.max(-20, Math.min(20, this.vy));

        this.x += this.vx * dt;
        this.y += this.vy * dt;

        if (this.x < -20 || this.x > w + 20 || this.y < h * 0.2 || this.y > h + 20) {
            this.reset();
        }
    }

    draw(ctx) {
        const glow = Math.sin(this.pulsePhase) * 0.5 + 0.5;
        if (glow < 0.05) return;

        ctx.save();
        ctx.globalCompositeOperation = 'lighter';

        // Outer glow halo
        const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 6 * glow);
        grad.addColorStop(0, `rgba(${this.color}, ${0.8 * glow})`);
        grad.addColorStop(0.35, `rgba(${this.color}, ${0.25 * glow})`);
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 6 * glow, 0, Math.PI * 2);
        ctx.fill();

        // Sharp core
        ctx.fillStyle = `rgba(255, 255, 255, ${0.9 * glow})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 0.8, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}

/**
 * Shooting Star (Meteor)
 */
class ShootingStar {
    constructor(w, h) {
        this.x = Math.random() * w * 0.8;
        this.y = Math.random() * h * 0.35;
        this.length = 80 + Math.random() * 100;
        this.speed = 450 + Math.random() * 250;
        this.angle = Math.PI * 0.22 + (Math.random() - 0.5) * 0.15;
        this.alpha = 1.0;
        this.isDead = false;
    }

    update(dt) {
        this.x += Math.cos(this.angle) * this.speed * dt;
        this.y += Math.sin(this.angle) * this.speed * dt;
        this.alpha -= 1.1 * dt;
        if (this.alpha <= 0) this.isDead = true;
    }

    draw(ctx) {
        if (this.alpha <= 0) return;
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';

        const tailX = this.x - Math.cos(this.angle) * this.length;
        const tailY = this.y - Math.sin(this.angle) * this.length;

        const grad = ctx.createLinearGradient(tailX, tailY, this.x, this.y);
        grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
        grad.addColorStop(0.8, `rgba(180, 240, 255, ${this.alpha * 0.6})`);
        grad.addColorStop(1, `rgba(255, 255, 255, ${this.alpha})`);

        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(this.x, this.y);
        ctx.stroke();

        ctx.restore();
    }
}

/**
 * Interactive Stardust on pointer move/click
 */
class StardustParticle {
    constructor(x, y, vx = 0, vy = 0) {
        this.x = x;
        this.y = y;
        this.vx = vx + (Math.random() - 0.5) * 12;
        this.vy = vy + (Math.random() - 0.5) * 12 - 4;
        this.size = 1.5 + Math.random() * 2.5;
        this.alpha = 1.0;
        this.decay = 0.5 + Math.random() * 0.6;
        this.color = Math.random() > 0.5 ? '160, 230, 255' : '230, 190, 255';
    }

    update(dt) {
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.alpha -= this.decay * dt;
    }

    draw(ctx) {
        if (this.alpha <= 0) return;
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = `rgba(${this.color}, ${this.alpha * 0.8})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

window.AuroraScene = AuroraScene;
