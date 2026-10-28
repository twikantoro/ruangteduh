/**
 * Cozy Rainy Window Scene
 * Realistic rain droplets on glass, blurred bokeh background,
 * sliding droplet physics, and interactive steam/fog clearing on touch.
 */
class RainWindowScene {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;

        this.time = 0;
        this.bokehLights = [];
        this.drops = [];
        this.maxDrops = 180;
        this.trails = []; // Water tracks left by sliding drops
        this.wipes = [];  // Cleared fog spots from user cursor

        this.init();
    }

    init() {
        this.resize();

        // 1. Cozy background Bokeh lights
        this.bokehLights = [];
        const bokehCount = Math.floor(Math.min(this.width, this.height) / 16);
        const colors = [
            '255, 180, 100', // Warm amber streetlamp
            '255, 215, 130', // Soft incandescent
            '120, 200, 255', // Distant cool teal neon
            '255, 120, 140', // Soft car taillight
            '180, 150, 255'  // Deep twilight purple
        ];

        for (let i = 0; i < bokehCount; i++) {
            this.bokehLights.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                radius: 35 + Math.random() * 85,
                color: colors[Math.floor(Math.random() * colors.length)],
                alpha: 0.12 + Math.random() * 0.28,
                pulseSpeed: 0.3 + Math.random() * 0.7,
                pulsePhase: Math.random() * Math.PI * 2,
                driftVx: (Math.random() - 0.5) * 4,
                driftVy: (Math.random() - 0.5) * 3
            });
        }

        // 2. Initial static raindrops on glass
        this.drops = [];
        for (let i = 0; i < this.maxDrops; i++) {
            this.drops.push(new RainDrop(this.width, this.height, true));
        }
    }

    resize() {
        this.width = this.canvas.width = window.innerWidth;
        this.height = this.canvas.height = window.innerHeight;
    }

    onPointerMove(x, y) {
        // Clear condensation on touch/move (wiping steamy glass)
        this.wipes.push({
            x: x,
            y: y,
            radius: 38,
            alpha: 1.0
        });

        // Add a droplet on interaction
        if (Math.random() < 0.2) {
            const drop = new RainDrop(this.width, this.height);
            drop.x = x + (Math.random() - 0.5) * 20;
            drop.y = y + (Math.random() - 0.5) * 20;
            drop.mass = 4.5;
            drop.sliding = true;
            this.drops.push(drop);
        }
    }

    onPointerDown(x, y) {
        this.onPointerMove(x, y);
        // Wipe larger area
        this.wipes.push({ x: x, y: y, radius: 65, alpha: 1.0 });
    }

    update(dt) {
        this.time += dt;

        // Update bokeh
        this.bokehLights.forEach(b => {
            b.x += b.driftVx * dt;
            b.y += b.driftVy * dt;
            if (b.x < -100) b.x = this.width + 100;
            if (b.x > this.width + 100) b.x = -100;
            if (b.y < -100) b.y = this.height + 100;
            if (b.y > this.height + 100) b.y = -100;
        });

        // Spawn new drops occasionally
        if (this.drops.length < this.maxDrops && Math.random() < 0.35) {
            this.drops.push(new RainDrop(this.width, this.height));
        }

        // Update drops & droplet collisions
        for (let i = this.drops.length - 1; i >= 0; i--) {
            const d = this.drops[i];
            d.update(dt, this.width, this.height, this.trails);

            if (d.y > this.height + 30) {
                this.drops.splice(i, 1);
                continue;
            }

            // If drop is sliding, check collision with other drops
            if (d.sliding) {
                for (let j = this.drops.length - 1; j >= 0; j--) {
                    if (i === j) continue;
                    const other = this.drops[j];
                    if (!other) continue;
                    const dx = d.x - other.x;
                    const dy = d.y - other.y;
                    const dist = Math.hypot(dx, dy);

                    if (dist < d.radius + other.radius) {
                        // Merge droplets
                        d.mass += other.mass * 0.7;
                        d.radius = Math.min(18, Math.sqrt(d.mass) * 2.2);
                        d.speed = Math.min(320, d.speed + 25);
                        this.drops.splice(j, 1);
                        if (j < i) i--;
                    }
                }
            }
        }

        // Fade wet trails
        for (let i = this.trails.length - 1; i >= 0; i--) {
            const tr = this.trails[i];
            tr.alpha -= 0.08 * dt;
            if (tr.alpha <= 0) this.trails.splice(i, 1);
        }

        // Fade wiped steam areas (steam slowly creeps back)
        for (let i = this.wipes.length - 1; i >= 0; i--) {
            const wp = this.wipes[i];
            wp.alpha -= 0.045 * dt;
            if (wp.alpha <= 0) this.wipes.splice(i, 1);
        }
    }

    render() {
        const ctx = this.ctx;
        const w = this.width;
        const h = this.height;

        // 1. Dark Rainy Ambience Base
        const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
        bgGrad.addColorStop(0, '#0a0d16');
        bgGrad.addColorStop(0.6, '#080c14');
        bgGrad.addColorStop(1, '#030508');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, w, h);

        // 2. Soft Blurred Bokeh Orbs
        this.drawBokeh(ctx);

        // 3. Fogged Glass Layer (with wiped areas)
        this.drawFog(ctx, w, h);

        // 4. Sliding Water Trails
        this.drawTrails(ctx);

        // 5. Rain Drops on Glass
        this.drops.forEach(d => d.draw(ctx));

        // 6. Window Vignette
        this.drawVignette(ctx, w, h);
    }

    drawBokeh(ctx) {
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        this.bokehLights.forEach(b => {
            const pulse = Math.sin(this.time * b.pulseSpeed + b.pulsePhase) * 0.15 + 0.85;
            const grad = ctx.createRadialGradient(b.x, b.y, b.radius * 0.1, b.x, b.y, b.radius * pulse);
            grad.addColorStop(0, `rgba(${b.color}, ${b.alpha * pulse})`);
            grad.addColorStop(0.6, `rgba(${b.color}, ${b.alpha * 0.4 * pulse})`);
            grad.addColorStop(1, 'rgba(0,0,0,0)');

            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(b.x, b.y, b.radius * pulse, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.restore();
    }

    drawFog(ctx, w, h) {
        ctx.save();
        // Base misty glass fog
        ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
        ctx.fillRect(0, 0, w, h);

        // Cleared steam areas
        if (this.wipes.length > 0) {
            ctx.save();
            ctx.globalCompositeOperation = 'destination-out';
            this.wipes.forEach(wp => {
                const grad = ctx.createRadialGradient(wp.x, wp.y, wp.radius * 0.2, wp.x, wp.y, wp.radius);
                grad.addColorStop(0, `rgba(0, 0, 0, ${wp.alpha * 0.8})`);
                grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(wp.x, wp.y, wp.radius, 0, Math.PI * 2);
                ctx.fill();
            });
            ctx.restore();
        }
        ctx.restore();
    }

    drawTrails(ctx) {
        ctx.save();
        this.trails.forEach(tr => {
            ctx.fillStyle = `rgba(255, 255, 255, ${tr.alpha * 0.12})`;
            ctx.beginPath();
            ctx.arc(tr.x, tr.y, tr.radius * 0.65, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.restore();
    }

    drawVignette(ctx, w, h) {
        const vig = ctx.createRadialGradient(w * 0.5, h * 0.5, Math.min(w, h) * 0.35, w * 0.5, h * 0.5, Math.max(w, h) * 0.75);
        vig.addColorStop(0, 'rgba(0,0,0,0)');
        vig.addColorStop(1, 'rgba(0, 3, 8, 0.7)');
        ctx.fillStyle = vig;
        ctx.fillRect(0, 0, w, h);
    }
}

/**
 * Individual Rain Drop on Window Pane
 */
class RainDrop {
    constructor(w, h, randomY = false) {
        this.x = Math.random() * w;
        this.y = randomY ? Math.random() * h : -10;
        this.mass = 0.5 + Math.random() * 2.8;
        this.radius = Math.sqrt(this.mass) * 2.2;
        this.sliding = false;
        this.speed = 0;
        this.slideDelay = 2 + Math.random() * 14; // Time until drop starts sliding down
        this.trailTimer = 0;
    }

    update(dt, w, h, trails) {
        this.slideDelay -= dt;

        // If mass is high enough or delay expires, drop starts sliding down
        if (!this.sliding && (this.mass > 3.0 || this.slideDelay <= 0)) {
            this.sliding = true;
            this.speed = 60 + this.mass * 35;
        }

        if (this.sliding) {
            // Drop slides downwards with subtle organic stutter and slight wobble
            this.speed += 80 * dt; // Gravity acceleration
            this.y += this.speed * dt;
            this.x += (Math.random() - 0.5) * 1.5;

            // Leave subtle wet trail on glass
            this.trailTimer += dt;
            if (this.trailTimer > 0.03) {
                this.trailTimer = 0;
                trails.push({
                    x: this.x,
                    y: this.y,
                    radius: this.radius,
                    alpha: 0.7
                });
            }
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);

        // Droplet shadow (gives refraction depth against background)
        ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.beginPath();
        ctx.arc(0.8, 1.2, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // Droplet body (glass refraction effect)
        const dropGrad = ctx.createRadialGradient(-this.radius * 0.25, -this.radius * 0.25, 1, 0, 0, this.radius);
        dropGrad.addColorStop(0, 'rgba(255, 255, 255, 0.65)');
        dropGrad.addColorStop(0.5, 'rgba(200, 225, 255, 0.25)');
        dropGrad.addColorStop(0.9, 'rgba(10, 20, 35, 0.5)');
        dropGrad.addColorStop(1, 'rgba(255, 255, 255, 0.8)');

        ctx.fillStyle = dropGrad;
        ctx.beginPath();
        if (this.sliding) {
            // Elongate slightly when sliding
            ctx.ellipse(0, 0, this.radius * 0.85, this.radius * 1.3, 0, 0, Math.PI * 2);
        } else {
            ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        }
        ctx.fill();

        // Bright pinpoint specular highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.beginPath();
        ctx.arc(-this.radius * 0.35, -this.radius * 0.35, Math.max(0.6, this.radius * 0.25), 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}

window.RainWindowScene = RainWindowScene;
