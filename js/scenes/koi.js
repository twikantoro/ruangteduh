/**
 * Zen Koi Pond Scene
 * Hypnotic, organic swimming koi fish with procedural inverse kinematics,
 * water caustics, floating sakura petals, and interactive ripples.
 */
class KoiPondScene {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;

        this.ripples = [];
        this.petals = [];
        this.koiList = [];
        this.time = 0;

        this.init();
    }

    init() {
        this.resize();

        // Initialize Koi Fish
        const koiConfigs = [
            { primary: '#ff4d4d', secondary: '#ffffff', pattern: 'kohaku', scale: 1.15, speed: 1.0 },
            { primary: '#ff9900', secondary: '#ffffff', pattern: 'sanke', scale: 0.95, speed: 1.1 },
            { primary: '#f6d365', secondary: '#fda085', pattern: 'ogon', scale: 1.25, speed: 0.85 },
            { primary: '#ffffff', secondary: '#ff2a2a', pattern: 'tancho', scale: 1.05, speed: 0.95 },
            { primary: '#2d3436', secondary: '#ff7675', pattern: 'showa', scale: 1.1, speed: 1.05 }
        ];

        this.koiList = koiConfigs.map((cfg, i) => {
            return new KoiFish(
                this.width * (0.2 + 0.6 * Math.random()),
                this.height * (0.2 + 0.6 * Math.random()),
                cfg
            );
        });

        // Initialize Floating Sakura Petals
        this.petals = [];
        const petalCount = Math.floor(Math.min(this.width, this.height) / 25);
        for (let i = 0; i < petalCount; i++) {
            this.petals.push(new SakuraPetal(this.width, this.height));
        }
    }

    resize() {
        this.width = this.canvas.width = window.innerWidth;
        this.height = this.canvas.height = window.innerHeight;
    }

    onPointerMove(x, y) {
        // Very subtle ripple on move
        if (Math.random() < 0.15) {
            this.ripples.push(new WaterRipple(x, y, 0.4));
        }
    }

    onPointerDown(x, y) {
        // Gentle ripple ring on click
        this.ripples.push(new WaterRipple(x, y, 1.2));
        this.ripples.push(new WaterRipple(x, y, 0.7, 8));

        // Slightly stir the koi
        this.koiList.forEach(koi => {
            const dx = koi.x - x;
            const dy = koi.y - y;
            const dist = Math.hypot(dx, dy);
            if (dist < 220) {
                const angle = Math.atan2(dy, dx);
                koi.targetAngle = angle + (Math.random() * 0.4 - 0.2);
                koi.speed = Math.min(koi.maxSpeed * 1.6, koi.speed + 0.8);
            }
        });
    }

    update(dt) {
        this.time += dt;

        // Update ripples
        for (let i = this.ripples.length - 1; i >= 0; i--) {
            const r = this.ripples[i];
            r.update(dt);
            if (r.alpha <= 0.005) {
                this.ripples.splice(i, 1);
            }
        }

        // Update petals
        this.petals.forEach(p => p.update(dt, this.width, this.height, this.ripples));

        // Update Koi
        this.koiList.forEach(koi => koi.update(dt, this.width, this.height, this.koiList, this.petals));
    }

    render() {
        const ctx = this.ctx;
        const w = this.width;
        const h = this.height;

        // 1. Water Deep Gradient Background
        const grad = ctx.createRadialGradient(w * 0.5, h * 0.4, 80, w * 0.5, h * 0.5, Math.max(w, h));
        grad.addColorStop(0, '#0c2233');
        grad.addColorStop(0.5, '#081726');
        grad.addColorStop(1, '#040b12');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        // 2. Gentle Water Caustics / Ambient Shimmer
        this.drawCaustics(ctx, w, h);

        // 3. Koi Shadows (Drawn on pond floor)
        this.koiList.forEach(koi => koi.drawShadow(ctx));

        // 4. Underwater Ripples (Distortion rings)
        this.drawRipples(ctx);

        // 5. Koi Fish
        this.koiList.forEach(koi => koi.draw(ctx));

        // 6. Floating Sakura Petals & Leaves
        this.petals.forEach(p => p.draw(ctx));

        // 7. Surface Shimmer / Ambient Vignette
        this.drawSurfaceHighlights(ctx, w, h);
    }

    drawCaustics(ctx, w, h) {
        ctx.save();
        ctx.globalAlpha = 0.045;
        ctx.fillStyle = '#48cae4';
        const t = this.time * 0.6;

        // Gentle procedural wave caustics
        const step = 90;
        for (let x = 0; x < w; x += step) {
            for (let y = 0; y < h; y += step) {
                const s = Math.sin(x * 0.008 + t) + Math.cos(y * 0.008 + t * 0.8);
                if (s > 0.4) {
                    ctx.beginPath();
                    ctx.arc(x + Math.sin(y + t) * 15, y + Math.cos(x + t) * 15, 35 + s * 20, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }
        ctx.restore();
    }

    drawRipples(ctx) {
        ctx.save();
        this.ripples.forEach(r => {
            ctx.beginPath();
            ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(144, 224, 239, ${r.alpha * 0.45})`;
            ctx.lineWidth = r.width;
            ctx.stroke();

            // Inner subtle ring
            if (r.radius > 15) {
                ctx.beginPath();
                ctx.arc(r.x, r.y, r.radius * 0.75, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(255, 255, 255, ${r.alpha * 0.2})`;
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        });
        ctx.restore();
    }

    drawSurfaceHighlights(ctx, w, h) {
        // Soft vignette
        const vignette = ctx.createRadialGradient(w * 0.5, h * 0.5, Math.min(w, h) * 0.4, w * 0.5, h * 0.5, Math.max(w, h) * 0.75);
        vignette.addColorStop(0, 'rgba(0,0,0,0)');
        vignette.addColorStop(1, 'rgba(2, 6, 12, 0.65)');
        ctx.fillStyle = vignette;
        ctx.fillRect(0, 0, w, h);
    }
}

/**
 * Procedural Koi Fish with segmented spine kinematics
 */
class KoiFish {
    constructor(x, y, config) {
        this.x = x;
        this.y = y;
        this.config = config;
        this.scale = (config.scale || 1.0) * (window.innerWidth < 768 ? 0.75 : 1.0);
        this.angle = Math.random() * Math.PI * 2;
        this.targetAngle = this.angle;
        this.speed = 0.9 * (config.speed || 1.0);
        this.maxSpeed = 1.6 * (config.speed || 1.0);
        this.minSpeed = 0.6 * (config.speed || 1.0);

        // Segmented spine chain (Head to tail)
        this.numSegments = 10;
        this.segmentDist = 7.5 * this.scale;
        this.segments = [];
        for (let i = 0; i < this.numSegments; i++) {
            this.segments.push({
                x: this.x - Math.cos(this.angle) * i * this.segmentDist,
                y: this.y - Math.sin(this.angle) * i * this.segmentDist,
                angle: this.angle
            });
        }

        this.tailPhase = Math.random() * Math.PI * 2;
        this.finPhase = 0;
        this.turnTimer = 0;
    }

    update(dt, w, h, koiList, petals) {
        this.tailPhase += this.speed * 2.8 * dt;
        this.finPhase += 2.2 * dt;
        this.turnTimer -= dt;

        // Smooth wander AI
        if (this.turnTimer <= 0) {
            this.turnTimer = 2.5 + Math.random() * 3.5;
            this.targetAngle += (Math.random() * 1.2 - 0.6);
            this.speed = this.minSpeed + Math.random() * (this.maxSpeed - this.minSpeed);
        }

        // Screen boundary gentle bounce
        const margin = 120;
        if (this.x < margin) this.targetAngle = 0 + (Math.random() * 0.8 - 0.4);
        else if (this.x > w - margin) this.targetAngle = Math.PI + (Math.random() * 0.8 - 0.4);
        if (this.y < margin) this.targetAngle = Math.PI * 0.5 + (Math.random() * 0.8 - 0.4);
        else if (this.y > h - margin) this.targetAngle = -Math.PI * 0.5 + (Math.random() * 0.8 - 0.4);

        // Koi-Koi gentle avoidance
        koiList.forEach(other => {
            if (other === this) return;
            const dx = this.x - other.x;
            const dy = this.y - other.y;
            const dist = Math.hypot(dx, dy);
            if (dist < 90 * this.scale) {
                this.targetAngle += Math.atan2(dy, dx) * 0.05;
            }
        });

        // Smooth rotation interpolation
        let diff = this.targetAngle - this.angle;
        while (diff < -Math.PI) diff += Math.PI * 2;
        while (diff > Math.PI) diff -= Math.PI * 2;
        this.angle += diff * Math.min(1.0, 1.8 * dt);

        // Move head forward
        const vx = Math.cos(this.angle) * this.speed * 45 * dt;
        const vy = Math.sin(this.angle) * this.speed * 45 * dt;
        this.x += vx;
        this.y += vy;

        // Update segmented spine (Inverse Kinematics / Follow Chain)
        this.segments[0].x = this.x;
        this.segments[0].y = this.y;
        this.segments[0].angle = this.angle;

        for (let i = 1; i < this.numSegments; i++) {
            const prev = this.segments[i - 1];
            const curr = this.segments[i];

            // Natural swimming wiggle: lateral displacement increases toward the tail
            const wiggleAmp = (i / this.numSegments) * 3.6 * this.scale;
            const wiggle = Math.sin(this.tailPhase - i * 0.55) * wiggleAmp;

            // Heading of this segment pointing FORWARD towards prev
            const dx = prev.x - curr.x;
            const dy = prev.y - curr.y;
            curr.angle = Math.atan2(dy, dx);

            // Backward unit vector along segment heading
            const backX = -Math.cos(curr.angle);
            const backY = -Math.sin(curr.angle);
            // Lateral normal unit vector
            const normX = -Math.sin(curr.angle);
            const normY = Math.cos(curr.angle);

            // Desired position: trailing directly behind prev at segmentDist with subtle wiggle
            const targetX = prev.x + backX * this.segmentDist + normX * wiggle * 0.15;
            const targetY = prev.y + backY * this.segmentDist + normY * wiggle * 0.15;

            curr.x += (targetX - curr.x) * 0.65;
            curr.y += (targetY - curr.y) * 0.65;
        }
    }

    drawShadow(ctx) {
        ctx.save();
        ctx.translate(22 * this.scale, 28 * this.scale);
        ctx.fillStyle = 'rgba(2, 8, 14, 0.45)';
        ctx.filter = 'blur(6px)';
        this.drawBodyPath(ctx);
        ctx.fill();
        ctx.filter = 'none';
        ctx.restore();
    }

    draw(ctx) {
        ctx.save();

        // 1. Pectoral & Ventral Fins (Drawn under body)
        this.drawVentralFins(ctx);
        this.drawPectoralFins(ctx);

        // 2. Caudal Tail Fins (Drawn trailing behind)
        this.drawTailFins(ctx);

        // 3. Main Body & Dorsal Ridge
        this.drawBody(ctx);

        // 4. Head details (Eyes, Whiskers, Snout)
        this.drawHeadDetails(ctx);

        ctx.restore();
    }

    drawPectoralFins(ctx) {
        const seg = this.segments[2];
        const finFlap = Math.sin(this.finPhase) * 0.16;
        const finLen = 27 * this.scale;

        // Attachment points on left and right flanks of segment 2
        const flankR = 14 * this.scale;
        const baseL_X = seg.x + Math.cos(seg.angle + Math.PI * 0.5) * flankR;
        const baseL_Y = seg.y + Math.sin(seg.angle + Math.PI * 0.5) * flankR;
        const baseR_X = seg.x + Math.cos(seg.angle - Math.PI * 0.5) * flankR;
        const baseR_Y = seg.y + Math.sin(seg.angle - Math.PI * 0.5) * flankR;

        // Angles pointing backward-outward naturally
        const finAngleL = seg.angle + Math.PI - 0.72 + finFlap;
        const finAngleR = seg.angle + Math.PI + 0.72 - finFlap;

        ctx.save();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.lineWidth = 1;

        // Left Fin
        ctx.beginPath();
        ctx.moveTo(baseL_X, baseL_Y);
        const tipLX = baseL_X + Math.cos(finAngleL) * finLen;
        const tipLY = baseL_Y + Math.sin(finAngleL) * finLen;
        ctx.quadraticCurveTo(
            baseL_X + Math.cos(finAngleL - 0.38) * finLen * 0.9,
            baseL_Y + Math.sin(finAngleL - 0.38) * finLen * 0.9,
            tipLX, tipLY
        );
        ctx.quadraticCurveTo(
            baseL_X + Math.cos(finAngleL + 0.3) * finLen * 0.55,
            baseL_Y + Math.sin(finAngleL + 0.3) * finLen * 0.55,
            baseL_X, baseL_Y
        );
        ctx.fill();
        ctx.stroke();

        // Right Fin
        ctx.beginPath();
        ctx.moveTo(baseR_X, baseR_Y);
        const tipRX = baseR_X + Math.cos(finAngleR) * finLen;
        const tipRY = baseR_Y + Math.sin(finAngleR) * finLen;
        ctx.quadraticCurveTo(
            baseR_X + Math.cos(finAngleR + 0.38) * finLen * 0.9,
            baseR_Y + Math.sin(finAngleR + 0.38) * finLen * 0.9,
            tipRX, tipRY
        );
        ctx.quadraticCurveTo(
            baseR_X + Math.cos(finAngleR - 0.3) * finLen * 0.55,
            baseR_Y + Math.sin(finAngleR - 0.3) * finLen * 0.55,
            baseR_X, baseR_Y
        );
        ctx.fill();
        ctx.stroke();

        ctx.restore();
    }

    drawVentralFins(ctx) {
        const seg = this.segments[5];
        const finLen = 16 * this.scale;
        const flankR = 10 * this.scale;

        const baseL_X = seg.x + Math.cos(seg.angle + Math.PI * 0.5) * flankR;
        const baseL_Y = seg.y + Math.sin(seg.angle + Math.PI * 0.5) * flankR;
        const baseR_X = seg.x + Math.cos(seg.angle - Math.PI * 0.5) * flankR;
        const baseR_Y = seg.y + Math.sin(seg.angle - Math.PI * 0.5) * flankR;

        const finAngleL = seg.angle + Math.PI - 0.45;
        const finAngleR = seg.angle + Math.PI + 0.45;

        ctx.save();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.lineWidth = 0.8;

        // Left ventral fin
        ctx.beginPath();
        ctx.moveTo(baseL_X, baseL_Y);
        ctx.lineTo(baseL_X + Math.cos(finAngleL) * finLen, baseL_Y + Math.sin(finAngleL) * finLen);
        ctx.lineTo(baseL_X + Math.cos(finAngleL + 0.3) * (finLen * 0.5), baseL_Y + Math.sin(finAngleL + 0.3) * (finLen * 0.5));
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Right ventral fin
        ctx.beginPath();
        ctx.moveTo(baseR_X, baseR_Y);
        ctx.lineTo(baseR_X + Math.cos(finAngleR) * finLen, baseR_Y + Math.sin(finAngleR) * finLen);
        ctx.lineTo(baseR_X + Math.cos(finAngleR - 0.3) * (finLen * 0.5), baseR_Y + Math.sin(finAngleR - 0.3) * (finLen * 0.5));
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.restore();
    }

    drawTailFins(ctx) {
        const tailSeg = this.segments[this.numSegments - 1];
        // tailSeg.angle points FORWARD, so tail fin points BACKWARD
        const baseAngle = tailSeg.angle + Math.PI;
        const tailWiggle = Math.sin(this.tailPhase - 1.0) * 0.38;
        const finLen = 42 * this.scale;
        const finSpread = 0.52;

        ctx.save();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.lineWidth = 1;

        // Main Caudal Butterfly Fin (Two graceful lobes with central cleft)
        const lobeAngleL = baseAngle + tailWiggle - finSpread;
        const lobeAngleR = baseAngle + tailWiggle + finSpread;
        const centerAngle = baseAngle + tailWiggle;

        ctx.beginPath();
        ctx.moveTo(tailSeg.x, tailSeg.y);

        // Upper lobe
        const p1x = tailSeg.x + Math.cos(lobeAngleL) * finLen;
        const p1y = tailSeg.y + Math.sin(lobeAngleL) * finLen;
        ctx.quadraticCurveTo(
            tailSeg.x + Math.cos(lobeAngleL - 0.22) * finLen * 0.6,
            tailSeg.y + Math.sin(lobeAngleL - 0.22) * finLen * 0.6,
            p1x, p1y
        );

        // Center notch
        const midX = tailSeg.x + Math.cos(centerAngle) * (finLen * 0.65);
        const midY = tailSeg.y + Math.sin(centerAngle) * (finLen * 0.65);
        ctx.quadraticCurveTo(
            tailSeg.x + Math.cos(centerAngle - 0.18) * finLen * 0.85,
            tailSeg.y + Math.sin(centerAngle - 0.18) * finLen * 0.85,
            midX, midY
        );

        // Lower lobe
        const p2x = tailSeg.x + Math.cos(lobeAngleR) * finLen;
        const p2y = tailSeg.y + Math.sin(lobeAngleR) * finLen;
        ctx.quadraticCurveTo(
            tailSeg.x + Math.cos(centerAngle + 0.18) * finLen * 0.85,
            tailSeg.y + Math.sin(centerAngle + 0.18) * finLen * 0.85,
            p2x, p2y
        );

        // Back to tail base
        ctx.quadraticCurveTo(
            tailSeg.x + Math.cos(lobeAngleR + 0.22) * finLen * 0.6,
            tailSeg.y + Math.sin(lobeAngleR + 0.22) * finLen * 0.6,
            tailSeg.x, tailSeg.y
        );
        ctx.fill();
        ctx.stroke();

        // Delicate translucent rays inside caudal fin
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 0.8;
        for (let a = -finSpread * 0.8; a <= finSpread * 0.8; a += finSpread * 0.35) {
            const rayAngle = baseAngle + tailWiggle + a;
            const rayLen = finLen * (0.65 + 0.32 * Math.abs(a / finSpread));
            ctx.beginPath();
            ctx.moveTo(tailSeg.x, tailSeg.y);
            ctx.lineTo(
                tailSeg.x + Math.cos(rayAngle) * rayLen,
                tailSeg.y + Math.sin(rayAngle) * rayLen
            );
            ctx.stroke();
        }

        ctx.restore();
    }

    drawBodyPath(ctx) {
        const radii = [
            11.5, // 0: Forehead / Head Base
            14.2, // 1: Cranium & Gills (widest part of head)
            15.8, // 2: Shoulder (Pectoral fins)
            15.0, // 3: Upper Torso
            13.5, // 4: Mid Torso
            11.2, // 5: Lower Body (Ventral fins)
            8.8,  // 6: Fore-tail
            6.4,  // 7: Mid-tail
            4.2,  // 8: Rear-tail
            2.4   // 9: Caudal base
        ].map(r => r * this.scale);

        const leftPts = [];
        const rightPts = [];

        for (let i = 0; i < this.numSegments; i++) {
            const seg = this.segments[i];
            const r = radii[i];
            const normL = seg.angle + Math.PI * 0.5;
            const normR = seg.angle - Math.PI * 0.5;
            leftPts.push({ x: seg.x + Math.cos(normL) * r, y: seg.y + Math.sin(normL) * r });
            rightPts.push({ x: seg.x + Math.cos(normR) * r, y: seg.y + Math.sin(normR) * r });
        }

        // Snout Apex (rounded nose tip)
        const snoutDist = 11.5 * this.scale;
        const snoutX = this.x + Math.cos(this.angle) * snoutDist;
        const snoutY = this.y + Math.sin(this.angle) * snoutDist;

        ctx.beginPath();
        // Start at rounded snout apex
        ctx.moveTo(snoutX, snoutY);

        // Smooth curve to left cheek
        ctx.quadraticCurveTo(
            snoutX + Math.cos(this.angle + Math.PI * 0.45) * 8.5 * this.scale,
            snoutY + Math.sin(this.angle + Math.PI * 0.45) * 8.5 * this.scale,
            leftPts[0].x, leftPts[0].y
        );

        // Smooth left flank
        for (let i = 0; i < leftPts.length - 1; i++) {
            const xc = (leftPts[i].x + leftPts[i + 1].x) / 2;
            const yc = (leftPts[i].y + leftPts[i + 1].y) / 2;
            ctx.quadraticCurveTo(leftPts[i].x, leftPts[i].y, xc, yc);
        }
        ctx.lineTo(leftPts[leftPts.length - 1].x, leftPts[leftPts.length - 1].y);

        // Round around caudal peduncle tip
        const tailSeg = this.segments[this.numSegments - 1];
        const tailEnd = {
            x: tailSeg.x - Math.cos(tailSeg.angle) * 3 * this.scale,
            y: tailSeg.y - Math.sin(tailSeg.angle) * 3 * this.scale
        };
        ctx.quadraticCurveTo(tailEnd.x, tailEnd.y, rightPts[rightPts.length - 1].x, rightPts[rightPts.length - 1].y);

        // Smooth right flank backwards
        for (let i = rightPts.length - 1; i > 0; i--) {
            const xc = (rightPts[i].x + rightPts[i - 1].x) / 2;
            const yc = (rightPts[i].y + rightPts[i - 1].y) / 2;
            ctx.quadraticCurveTo(rightPts[i].x, rightPts[i].y, xc, yc);
        }
        ctx.lineTo(rightPts[0].x, rightPts[0].y);

        // Smooth curve back to snout apex
        ctx.quadraticCurveTo(
            snoutX + Math.cos(this.angle - Math.PI * 0.45) * 8.5 * this.scale,
            snoutY + Math.sin(this.angle - Math.PI * 0.45) * 8.5 * this.scale,
            snoutX, snoutY
        );
        ctx.closePath();
    }

    drawBody(ctx) {
        ctx.save();

        // Base fish color gradient
        this.drawBodyPath(ctx);
        const grad = ctx.createLinearGradient(
            this.x, this.y,
            this.segments[this.numSegments - 1].x,
            this.segments[this.numSegments - 1].y
        );
        grad.addColorStop(0, this.config.secondary || '#ffffff');
        grad.addColorStop(1, '#e2e8f0');
        ctx.fillStyle = grad;
        ctx.fill();

        // Pattern overlays (Kohaku, Tancho, etc.)
        ctx.clip(); // Clip inside fish body

        if (this.config.pattern === 'tancho') {
            // Iconic red circle on crown of head
            ctx.beginPath();
            ctx.arc(this.x + Math.cos(this.angle) * 2.5 * this.scale, this.y + Math.sin(this.angle) * 2.5 * this.scale, 7.8 * this.scale, 0, Math.PI * 2);
            ctx.fillStyle = this.config.primary;
            ctx.fill();
        } else if (this.config.pattern === 'kohaku' || this.config.pattern === 'sanke' || this.config.pattern === 'showa') {
            // Elegant organic red/orange/black koi blotches
            ctx.fillStyle = this.config.primary;
            [0, 2, 4, 6].forEach((segIdx, idx) => {
                if (idx % 2 === 0) {
                    const s = this.segments[segIdx];
                    ctx.beginPath();
                    ctx.arc(s.x, s.y, (12.5 - idx * 2) * this.scale, 0, Math.PI * 2);
                    ctx.fill();
                }
            });
        } else if (this.config.pattern === 'ogon') {
            // Metallic golden sheen
            const goldGrad = ctx.createRadialGradient(this.x, this.y, 4, this.x, this.y, 45 * this.scale);
            goldGrad.addColorStop(0, '#fff3b0');
            goldGrad.addColorStop(0.6, '#e09f3e');
            goldGrad.addColorStop(1, '#9e2a2b');
            ctx.fillStyle = goldGrad;
            ctx.fill();
        }

        // Cranium 3D dome highlight (gives rounded head shape)
        const headDomeGrad = ctx.createRadialGradient(
            this.x + Math.cos(this.angle) * 4 * this.scale,
            this.y + Math.sin(this.angle) * 4 * this.scale,
            1,
            this.x + Math.cos(this.angle) * 3 * this.scale,
            this.y + Math.sin(this.angle) * 3 * this.scale,
            14 * this.scale
        );
        headDomeGrad.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
        headDomeGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.12)');
        headDomeGrad.addColorStop(1, 'rgba(0, 0, 0, 0.15)');
        ctx.fillStyle = headDomeGrad;
        ctx.beginPath();
        ctx.arc(this.x + Math.cos(this.angle) * 3 * this.scale, this.y + Math.sin(this.angle) * 3 * this.scale, 14 * this.scale, 0, Math.PI * 2);
        ctx.fill();

        // Spine highlight / Dorsal ridge
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.lineWidth = 2 * this.scale;
        ctx.beginPath();
        ctx.moveTo(this.x + Math.cos(this.angle) * 4 * this.scale, this.y + Math.sin(this.angle) * 4 * this.scale);
        for (let i = 1; i < 7; i++) {
            ctx.lineTo(this.segments[i].x, this.segments[i].y);
        }
        ctx.stroke();

        ctx.restore();
    }

    drawHeadDetails(ctx) {
        ctx.save();

        // 1. Whiskers (Barbels) - preserved and refined as requested
        const noseX = this.x + Math.cos(this.angle) * 9.5 * this.scale;
        const noseY = this.y + Math.sin(this.angle) * 9.5 * this.scale;
        const whiskerAngleL = this.angle + 0.65;
        const whiskerAngleR = this.angle - 0.65;
        const whiskerLen = 10 * this.scale;

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.lineWidth = 1.1;

        ctx.beginPath();
        ctx.moveTo(noseX, noseY);
        ctx.lineTo(noseX + Math.cos(whiskerAngleL) * whiskerLen, noseY + Math.sin(whiskerAngleL) * whiskerLen);
        ctx.moveTo(noseX, noseY);
        ctx.lineTo(noseX + Math.cos(whiskerAngleR) * whiskerLen, noseY + Math.sin(whiskerAngleR) * whiskerLen);
        ctx.stroke();

        // 2. Eyes (Natural dorsolateral placement with glossy socket & specular highlight)
        const eyeCenterDist = 3.5 * this.scale;
        const headMidX = this.x + Math.cos(this.angle) * eyeCenterDist;
        const headMidY = this.y + Math.sin(this.angle) * eyeCenterDist;
        const eyeSideDist = 9.2 * this.scale;

        const eyeNormL = this.angle + Math.PI * 0.48;
        const eyeNormR = this.angle - Math.PI * 0.48;
        const eyeL = { x: headMidX + Math.cos(eyeNormL) * eyeSideDist, y: headMidY + Math.sin(eyeNormL) * eyeSideDist };
        const eyeR = { x: headMidX + Math.cos(eyeNormR) * eyeSideDist, y: headMidY + Math.sin(eyeNormR) * eyeSideDist };

        // Eye socket rims
        ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
        ctx.beginPath();
        ctx.ellipse(eyeL.x, eyeL.y, 2.5 * this.scale, 1.8 * this.scale, this.angle, 0, Math.PI * 2);
        ctx.ellipse(eyeR.x, eyeR.y, 2.5 * this.scale, 1.8 * this.scale, this.angle, 0, Math.PI * 2);
        ctx.fill();

        // Dark obsidian pupils
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.ellipse(eyeL.x, eyeL.y, 1.9 * this.scale, 1.3 * this.scale, this.angle, 0, Math.PI * 2);
        ctx.ellipse(eyeR.x, eyeR.y, 1.9 * this.scale, 1.3 * this.scale, this.angle, 0, Math.PI * 2);
        ctx.fill();

        // Pinpoint specular reflections (gives lively, wet, organic look)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        const specOffset = 0.6 * this.scale;
        ctx.beginPath();
        ctx.arc(eyeL.x + Math.cos(this.angle - 0.5) * specOffset, eyeL.y + Math.sin(this.angle - 0.5) * specOffset, 0.65 * this.scale, 0, Math.PI * 2);
        ctx.arc(eyeR.x + Math.cos(this.angle + 0.5) * specOffset, eyeR.y + Math.sin(this.angle + 0.5) * specOffset, 0.65 * this.scale, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}

/**
 * Water Ripple effect on click or movement
 */
class WaterRipple {
    constructor(x, y, intensity = 1.0, initialRadius = 0) {
        this.x = x;
        this.y = y;
        this.radius = initialRadius;
        this.maxRadius = (100 + Math.random() * 80) * intensity;
        this.speed = 45 * intensity;
        this.alpha = 0.8;
        this.width = 1.5 * intensity;
    }

    update(dt) {
        this.radius += this.speed * dt;
        this.alpha *= Math.pow(0.2, dt); // Smooth fade
    }
}

/**
 * Floating Sakura Blossom Petal
 */
class SakuraPetal {
    constructor(w, h) {
        this.reset(w, h);
        this.x = Math.random() * w;
        this.y = Math.random() * h;
    }

    reset(w, h) {
        this.x = Math.random() * w;
        this.y = -20;
        this.vx = 8 + Math.random() * 12;
        this.vy = 12 + Math.random() * 16;
        this.size = 6 + Math.random() * 5;
        this.angle = Math.random() * Math.PI * 2;
        this.rotSpeed = (Math.random() - 0.5) * 0.8;
        this.phase = Math.random() * Math.PI * 2;
        this.alpha = 0.75 + Math.random() * 0.2;
    }

    update(dt, w, h, ripples) {
        this.phase += dt * 1.5;
        this.angle += this.rotSpeed * dt;

        this.x += (this.vx + Math.sin(this.phase) * 10) * dt;
        this.y += (this.vy + Math.cos(this.phase) * 5) * dt;

        // Ripples push petals slightly
        ripples.forEach(r => {
            const dx = this.x - r.x;
            const dy = this.y - r.y;
            const dist = Math.hypot(dx, dy);
            if (dist < r.radius + 20 && dist > r.radius - 20) {
                const angle = Math.atan2(dy, dx);
                this.x += Math.cos(angle) * 15 * dt;
                this.y += Math.sin(angle) * 15 * dt;
            }
        });

        if (this.y > h + 30 || this.x > w + 40) {
            this.reset(w, h);
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        // Soft petal shadow
        ctx.fillStyle = 'rgba(2, 10, 18, 0.3)';
        ctx.beginPath();
        ctx.ellipse(3, 4, this.size, this.size * 0.55, 0, 0, Math.PI * 2);
        ctx.fill();

        // Petal shape
        const grad = ctx.createLinearGradient(-this.size, 0, this.size, 0);
        grad.addColorStop(0, '#ffd1dc');
        grad.addColorStop(0.5, '#ffb7c5');
        grad.addColorStop(1, '#ff8fa3');
        ctx.fillStyle = grad;
        ctx.globalAlpha = this.alpha;

        ctx.beginPath();
        ctx.moveTo(0, -this.size * 0.5);
        ctx.bezierCurveTo(this.size, -this.size, this.size, this.size, 0, this.size * 0.6);
        ctx.bezierCurveTo(-this.size, this.size, -this.size, -this.size, 0, -this.size * 0.5);
        ctx.fill();

        ctx.restore();
    }
}

window.KoiPondScene = KoiPondScene;
