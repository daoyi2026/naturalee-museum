/**
     * SILVER CLOCK — THE BIRDS OF TIME (V3.0 Star-Sand & Cross-Starburst Poetic Edition)
     * Key Upgrades per User Feedback:
     * 1. Shortened initial clock movement phase to 4.0 seconds (`0.0s - 4.0s`).
     * 2. Shortened and accelerated bird-to-dial return & reconstruction (`14.5s - 17.3s`),
     *    using C1 velocity-tangent-continuous Hermite curves so birds sweep smoothly and rapidly
     *    into their dial sockets with zero sharp hook kinks.
     * 3. Three-Layer Poetic Trail System (渐变 + 星沙 + 十字星芒):
     *    - Layer A (丝滑羽化渐变光带): Continuous tapered polygon quad-strip with gradient alpha &
     *      color transition (Pure White -> Ice Blue -> Klein Blue transparent), completely eliminating
     *      the beaded joint dots caused by per-segment `lineCap = 'round'`.
     *    - Layer B (飘散微光星沙 Star-Sand): Weightless silver-white & sky-blue dust particles shed
     *      from the bird's tail and wingtips that drift with gentle air turbulence and twinkle.
     *    - Layer C (十字星芒 4-Point Cross Starbursts ✦): Delicate four-pointed diamond starbursts
     *      blooming along the trail wake and wingtips during downstrokes and high-speed turns.
     */

    class SeededRNG {
      constructor(seed = 20261118) {
        this.initialSeed = seed >>> 0;
        this.state = this.initialSeed;
      }
      reset() {
        this.state = this.initialSeed;
      }
      next() {
        let t = (this.state += 0x6D2B79F5);
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      }
      range(min, max) {
        return min + (max - min) * this.next();
      }
      pick(arr) {
        return arr[Math.floor(this.next() * arr.length)];
      }
    }

    const MathUtil = {
      clamp(v, lo, hi) {
        return Math.max(lo, Math.min(hi, v));
      },
      lerp(a, b, t) {
        return a + (b - a) * t;
      },
      smoothstep(edge0, edge1, x) {
        const t = MathUtil.clamp((x - edge0) / (edge1 - edge0 || 1e-6), 0, 1);
        return t * t * (3 - 2 * t);
      },
      smootherstep(edge0, edge1, x) {
        const t = MathUtil.clamp((x - edge0) / (edge1 - edge0 || 1e-6), 0, 1);
        return t * t * t * (t * (t * 6 - 15) + 10);
      },
      angleLerp(a, b, t) {
        let diff = ((b - a + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
        return a + diff * t;
      }
    };

    // =========================================================================
    // MODULE 4: BirdGeometry — 6 Distinct Calligraphic Key Poses & 5 Archetypes
    // =========================================================================
    class BirdGeometry {
      constructor() {
        this.archetypes = [
          { code: 'A', name: '修长型', bodyLen: 1.20, wingSpan: 1.16, wingChord: 0.86, tipCurve: 1.18, tailFork: 1.30, flapRate: 1.02 },
          { code: 'B', name: '宽翼型', bodyLen: 1.02, wingSpan: 1.28, wingChord: 1.14, tipCurve: 0.96, tailFork: 0.96, flapRate: 0.92 },
          { code: 'C', name: '短身型', bodyLen: 0.85, wingSpan: 0.94, wingChord: 0.95, tipCurve: 1.08, tailFork: 0.84, flapRate: 1.28 },
          { code: 'D', name: '弧翼型', bodyLen: 1.06, wingSpan: 1.14, wingChord: 0.92, tipCurve: 1.44, tailFork: 1.14, flapRate: 1.08 },
          { code: 'E', name: '滑翔型', bodyLen: 1.16, wingSpan: 1.24, wingChord: 0.90, tipCurve: 1.10, tailFork: 1.20, flapRate: 0.86 }
        ];

        this.keyPoses = [
          {
            name: 'K1 高举',
            headY: 16.8, neckW: 2.2, chestW: 3.9, hipW: 1.8,
            wingShoulder: { x: 3.1, y: 5.6 },
            wingMidLead:  { x: 11.8, y: 15.0 },
            wingTip:      { x: 20.2, y: 21.8 },
            wingOuterTrail:{ x: 15.6, y: 10.8 },
            wingInnerTrail:{ x: 6.6, y: 1.2 },
            tailSpread: 3.3, tailLen: 14.8, tailNotch: 9.2, bodyRise: 2.4
          },
          {
            name: 'K2 展翼过渡',
            headY: 16.2, neckW: 2.3, chestW: 4.2, hipW: 1.9,
            wingShoulder: { x: 3.5, y: 5.1 },
            wingMidLead:  { x: 17.8, y: 11.5 },
            wingTip:      { x: 29.2, y: 13.2 },
            wingOuterTrail:{ x: 20.8, y: 3.8 },
            wingInnerTrail:{ x: 8.0, y: -1.2 },
            tailSpread: 4.2, tailLen: 15.0, tailNotch: 9.5, bodyRise: 1.2
          },
          {
            name: 'K3 平展',
            headY: 15.8, neckW: 2.3, chestW: 4.4, hipW: 2.0,
            wingShoulder: { x: 3.7, y: 4.6 },
            wingMidLead:  { x: 19.8, y: 6.5 },
            wingTip:      { x: 33.4, y: 2.2 },
            wingOuterTrail:{ x: 22.4, y: -3.4 },
            wingInnerTrail:{ x: 8.6, y: -3.1 },
            tailSpread: 4.9, tailLen: 15.5, tailNotch: 9.8, bodyRise: 0.0
          },
          {
            name: 'K4 下压过渡',
            headY: 16.4, neckW: 2.4, chestW: 4.3, hipW: 1.9,
            wingShoulder: { x: 3.5, y: 4.0 },
            wingMidLead:  { x: 17.2, y: 0.6 },
            wingTip:      { x: 27.2, y: -9.2 },
            wingOuterTrail:{ x: 17.6, y: -10.2 },
            wingInnerTrail:{ x: 7.4, y: -4.9 },
            tailSpread: 4.3, tailLen: 15.8, tailNotch: 10.2, bodyRise: -1.2
          },
          {
            name: 'K5 下压',
            headY: 17.0, neckW: 2.2, chestW: 4.0, hipW: 1.8,
            wingShoulder: { x: 3.1, y: 3.2 },
            wingMidLead:  { x: 12.0, y: -3.8 },
            wingTip:      { x: 18.0, y: -16.2 },
            wingOuterTrail:{ x: 11.6, y: -13.6 },
            wingInnerTrail:{ x: 5.6, y: -6.4 },
            tailSpread: 3.1, tailLen: 16.5, tailNotch: 10.8, bodyRise: -2.2
          },
          {
            name: 'K6 回升',
            headY: 16.4, neckW: 2.2, chestW: 3.8, hipW: 1.8,
            wingShoulder: { x: 2.9, y: 4.8 },
            wingMidLead:  { x: 10.2, y: 7.8 },
            wingTip:      { x: 15.6, y: 9.2 },
            wingOuterTrail:{ x: 12.2, y: 1.6 },
            wingInnerTrail:{ x: 5.5, y: -2.2 },
            tailSpread: 3.5, tailLen: 14.8, tailNotch: 9.4, bodyRise: 0.9
          }
        ];
      }

      interpolatePoseParams(poseFloat, archIndex, individualParams) {
        const n = this.keyPoses.length;
        const wrapped = ((poseFloat % n) + n) % n;
        const i0 = Math.floor(wrapped);
        const i1 = (i0 + 1) % n;
        const rawT = wrapped - i0;
        const t = 0.5 - 0.5 * Math.cos(rawT * Math.PI);

        const p0 = this.keyPoses[i0];
        const p1 = this.keyPoses[i1];
        const arch = this.archetypes[archIndex % this.archetypes.length];

        const lerpPt = (a, b, f) => ({
          x: MathUtil.lerp(a.x, b.x, f),
          y: MathUtil.lerp(a.y, b.y, f)
        });

        const asym = individualParams?.asymmetry ?? 0.14;
        const wrappedL = ((poseFloat - asym + n) % n);
        const i0L = Math.floor(wrappedL);
        const i1L = (i0L + 1) % n;
        const tL = 0.5 - 0.5 * Math.cos((wrappedL - i0L) * Math.PI);
        const p0L = this.keyPoses[i0L];
        const p1L = this.keyPoses[i1L];

        const bScale = arch.bodyLen * (individualParams?.bodyScale ?? 1.0);
        const wScale = arch.wingSpan * (individualParams?.wingScale ?? 1.0);
        const cScale = arch.wingChord;
        const curveBoost = arch.tipCurve * (individualParams?.tipCurve ?? 1.0);
        const forkBoost = arch.tailFork * (individualParams?.tailScale ?? 1.0);

        const rShoulder = lerpPt(p0.wingShoulder, p1.wingShoulder, t);
        const rMidLead  = lerpPt(p0.wingMidLead, p1.wingMidLead, t);
        const rTip      = lerpPt(p0.wingTip, p1.wingTip, t);
        const rOuterTr  = lerpPt(p0.wingOuterTrail, p1.wingOuterTrail, t);
        const rInnerTr  = lerpPt(p0.wingInnerTrail, p1.wingInnerTrail, t);

        const lShoulder = lerpPt(p0L.wingShoulder, p1L.wingShoulder, tL);
        const lMidLead  = lerpPt(p0L.wingMidLead, p1L.wingMidLead, tL);
        const lTip      = lerpPt(p0L.wingTip, p1L.wingTip, tL);
        const lOuterTr  = lerpPt(p0L.wingOuterTrail, p1L.wingOuterTrail, tL);
        const lInnerTr  = lerpPt(p0L.wingInnerTrail, p1L.wingInnerTrail, tL);

        const bank = individualParams?.bankAngle ?? 0;
        const pitch = individualParams?.pitchFactor ?? 1.0;
        const rightSpanMult = wScale * MathUtil.clamp(1 + bank * 0.28, 0.58, 1.35);
        const leftSpanMult  = wScale * MathUtil.clamp(1 - bank * 0.28, 0.58, 1.35) * (1 - asym * 0.16);
        const spineCurveX = bank * 2.4;

        return {
          headY: MathUtil.lerp(p0.headY, p1.headY, t) * bScale * pitch,
          neckW: MathUtil.lerp(p0.neckW, p1.neckW, t),
          chestW: MathUtil.lerp(p0.chestW, p1.chestW, t),
          hipW: MathUtil.lerp(p0.hipW, p1.hipW, t),
          bodyRise: MathUtil.lerp(p0.bodyRise, p1.bodyRise, t),
          spineCurveX,
          tailSpread: MathUtil.lerp(p0.tailSpread, p1.tailSpread, t) * forkBoost,
          tailLen: MathUtil.lerp(p0.tailLen, p1.tailLen, t) * bScale * forkBoost * pitch,
          tailNotch: MathUtil.lerp(p0.tailNotch, p1.tailNotch, t) * bScale * pitch,
          rightWing: {
            shoulder: { x: rShoulder.x + spineCurveX * 0.4, y: rShoulder.y * bScale },
            midLead:  { x: rMidLead.x * rightSpanMult + spineCurveX * 0.3, y: rMidLead.y * cScale },
            tip:      { x: rTip.x * rightSpanMult, y: rTip.y * curveBoost },
            outerTr:  { x: rOuterTr.x * rightSpanMult, y: rOuterTr.y * cScale },
            innerTr:  { x: rInnerTr.x + spineCurveX * 0.3, y: rInnerTr.y * bScale }
          },
          leftWing: {
            shoulder: { x: -lShoulder.x + spineCurveX * 0.4, y: lShoulder.y * bScale },
            midLead:  { x: -lMidLead.x * leftSpanMult + spineCurveX * 0.3, y: lMidLead.y * cScale },
            tip:      { x: -lTip.x * leftSpanMult, y: lTip.y * curveBoost + asym * 2.4 },
            outerTr:  { x: -lOuterTr.x * leftSpanMult, y: lOuterTr.y * cScale },
            innerTr:  { x: -lInnerTr.x + spineCurveX * 0.3, y: lInnerTr.y * bScale }
          }
        };
      }

      buildContourPoints(poseParams, numPoints = 48) {
        const P = poseParams;
        const rw = P.rightWing;
        const lw = P.leftWing;
        const ry = P.bodyRise * 0.4;
        const sx = P.spineCurveX || 0;

        const cubic = (p0, p1, p2, p3, t) => {
          const u = 1 - t;
          return {
            x: u*u*u*p0.x + 3*u*u*t*p1.x + 3*u*t*t*p2.x + t*t*t*p3.x,
            y: u*u*u*p0.y + 3*u*u*t*p1.y + 3*u*t*t*p2.y + t*t*t*p3.y + ry
          };
        };

        const beak       = { x: sx * 0.85, y: P.headY };
        const rNeck      = { x: P.neckW + sx * 0.6, y: P.headY * 0.56 };
        const rShoulder  = rw.shoulder;
        const rWrist     = rw.midLead;
        const rTip       = rw.tip;
        const rOuterTr   = rw.outerTr;
        const rInnerTr   = rw.innerTr;
        const rHip       = { x: P.hipW + sx * 0.2, y: -P.tailNotch * 0.45 };
        const rTailTip   = { x: P.tailSpread - sx * 0.4, y: -P.tailLen };
        const tailCenter = { x: -sx * 0.35, y: -P.tailNotch };
        const lTailTip   = { x: -P.tailSpread * 0.92 - sx * 0.4, y: -P.tailLen * 0.96 };
        const lHip       = { x: -P.hipW + sx * 0.2, y: -P.tailNotch * 0.45 };
        const lInnerTr   = lw.innerTr;
        const lOuterTr   = lw.outerTr;
        const lTip       = lw.tip;
        const lWrist     = lw.midLead;
        const lShoulder  = lw.shoulder;
        const lNeck      = { x: -P.neckW + sx * 0.6, y: P.headY * 0.56 };

        const segments = [
          [beak, { x: P.neckW * 0.7 + sx * 0.7, y: P.headY * 0.85 }, rNeck, rShoulder],
          [rShoulder, { x: MathUtil.lerp(rShoulder.x, rWrist.x, 0.4), y: rShoulder.y + 2.5 }, { x: rWrist.x * 0.82, y: rWrist.y + 1.2 }, rWrist],
          [rWrist, { x: MathUtil.lerp(rWrist.x, rTip.x, 0.5), y: MathUtil.lerp(rWrist.y, rTip.y, 0.35) + 1.5 }, { x: rTip.x * 0.95, y: rTip.y + 0.8 }, rTip],
          [rTip, { x: rTip.x * 0.92, y: MathUtil.lerp(rTip.y, rOuterTr.y, 0.4) }, { x: rOuterTr.x * 1.08, y: rOuterTr.y + 1.0 }, rOuterTr],
          [rOuterTr, { x: MathUtil.lerp(rOuterTr.x, rInnerTr.x, 0.55), y: rOuterTr.y - 0.6 }, rInnerTr, rHip],
          [rHip, { x: P.tailSpread * 0.8, y: -P.tailNotch * 0.8 }, rTailTip, tailCenter],
          [tailCenter, lTailTip, { x: -P.tailSpread * 0.78, y: -P.tailNotch * 0.8 }, lHip],
          [lHip, lInnerTr, { x: MathUtil.lerp(lInnerTr.x, lOuterTr.x, 0.45), y: lOuterTr.y - 0.6 }, lOuterTr],
          [lOuterTr, { x: lOuterTr.x * 1.08, y: lOuterTr.y + 1.0 }, { x: lTip.x * 0.92, y: MathUtil.lerp(lTip.y, lOuterTr.y, 0.4) }, lTip],
          [lTip, { x: lTip.x * 0.95, y: lTip.y + 0.8 }, { x: MathUtil.lerp(lWrist.x, lTip.x, 0.5), y: MathUtil.lerp(lWrist.y, lTip.y, 0.35) + 1.5 }, lWrist],
          [lWrist, { x: lWrist.x * 0.82, y: lWrist.y + 1.2 }, { x: MathUtil.lerp(lShoulder.x, lWrist.x, 0.4), y: lShoulder.y + 2.5 }, lShoulder],
          [lShoulder, lNeck, { x: -P.neckW * 0.7 + sx * 0.7, y: P.headY * 0.85 }, beak]
        ];

        const pts = [];
        const samplesPerSeg = Math.floor(numPoints / segments.length);
        for (let s = 0; s < segments.length; s++) {
          const seg = segments[s];
          for (let k = 0; k < samplesPerSeg; k++) {
            const t = k / samplesPerSeg;
            pts.push(cubic(seg[0], seg[1], seg[2], seg[3], t));
          }
        }
        return pts;
      }
    }

    // =========================================================================
    // MODULE 5: BirdAnimation — Brisk Wingbeats & 2.5D Banking State Machine
    // =========================================================================
    class BirdAnimation {
      constructor(id, rng, birdGeo) {
        this.id = id;
        this.birdGeo = birdGeo;
        this.archetypeIndex = id % 5;
        this.posePhase = rng.range(0, 6);
        this.baseFlapSpeed = rng.range(16.8, 22.5) * birdGeo.archetypes[this.archetypeIndex].flapRate;

        this.individualParams = {
          bodyScale: rng.range(0.92, 1.12),
          wingScale: rng.range(0.92, 1.14),
          tipCurve: rng.range(0.94, 1.14),
          tailScale: rng.range(0.92, 1.16),
          asymmetry: rng.range(0.11, 0.25),
          bankAngle: 0,
          pitchFactor: 1.0
        };

        this.flightState = 'FLAP_FAST';
        this.stateTimer = rng.range(0.65, 1.8);
      }

      update(dt, turnRate = 0, verticalVel = 0, forceGlide = false) {
        this.individualParams.bankAngle = MathUtil.lerp(
          this.individualParams.bankAngle,
          MathUtil.clamp(turnRate * 3.8, -1.1, 1.1),
          Math.min(1, dt * 8)
        );
        const pitchTarget = MathUtil.clamp(1.0 - Math.abs(verticalVel) * 0.0006, 0.86, 1.08);
        this.individualParams.pitchFactor = MathUtil.lerp(this.individualParams.pitchFactor, pitchTarget, Math.min(1, dt * 6));

        if (forceGlide) {
          this.flightState = 'GLIDE';
          const targetPose = 2.05;
          let diff = ((targetPose - (this.posePhase % 6) + 9) % 6) - 3;
          this.posePhase = (this.posePhase + diff * Math.min(1, dt * 8.5) + 6) % 6;
          return;
        }

        this.stateTimer -= dt;
        if (this.stateTimer <= 0) {
          if (this.flightState !== 'GLIDE' && Math.abs((this.posePhase % 6) - 2.0) < 0.75) {
            this.flightState = 'GLIDE';
            this.stateTimer = 0.45 + (this.id % 4) * 0.18;
          } else {
            const modes = ['FLAP_FAST', 'FLAP_NORMAL', 'CLIMB', 'DIVE'];
            this.flightState = modes[(this.id + Math.floor(this.posePhase * 3)) % modes.length];
            this.stateTimer = 0.85 + (this.id % 5) * 0.24;
          }
        }

        if (this.flightState === 'GLIDE') {
          const target = 2.0 + Math.sin(this.stateTimer * 5.5 + this.id) * 0.16;
          let diff = ((target - (this.posePhase % 6) + 9) % 6) - 3;
          this.posePhase = (this.posePhase + diff * Math.min(1, dt * 7.5) + 6) % 6;
        } else {
          let speedMult = 1.0;
          if (this.flightState === 'FLAP_FAST' || this.flightState === 'CLIMB') speedMult = 1.32;
          if (this.flightState === 'DIVE') speedMult = 0.82;
          const curPose = this.posePhase % 6;
          const strokeMod = (curPose >= 2.0 && curPose <= 4.5) ? 1.24 : 0.88;
          this.posePhase = (this.posePhase + dt * this.baseFlapSpeed * speedMult * strokeMod) % 6;
        }
      }

      getContour(numPoints = 48) {
        const params = this.birdGeo.interpolatePoseParams(
          this.posePhase,
          this.archetypeIndex,
          this.individualParams
        );
        return this.birdGeo.buildContourPoints(params, numPoints);
      }
    }

    // =========================================================================
    // MODULE 7: Morph — Traveling-Wave Contour Unfurling (Shard <-> Bird)
    // =========================================================================
    class Morph {
      static computeMorphedContour(shardContour48, birdContour48, morphT) {
        const m = MathUtil.clamp(morphT, 0, 1);
        if (m <= 0.001) return shardContour48;
        if (m >= 0.999) return birdContour48;

        const bodyGrow = MathUtil.smootherstep(0.06, 0.42, m);
        const tailGrow = MathUtil.smootherstep(0.58, 0.94, m);

        const out = new Array(shardContour48.length);
        const N = shardContour48.length;

        for (let i = 0; i < N; i++) {
          const sPt = shardContour48[i];
          const bPt = birdContour48[i];

          let regionProgress = bodyGrow;
          let lateralScale = 1.0;
          let arcSweepY = 0;

          if (i >= 4 && i <= 19) {
            const spanDist = 1.0 - Math.abs(i - 11.5) / 8.0;
            const waveStart = 0.24 + spanDist * 0.22;
            const waveEnd = 0.68 + spanDist * 0.20;
            regionProgress = MathUtil.smootherstep(waveStart, waveEnd, m);
            lateralScale = MathUtil.lerp(0.16, 1.0, regionProgress);
            arcSweepY = Math.sin(regionProgress * Math.PI) * 5.5 * spanDist;
          } else if (i >= 28 && i <= 43) {
            const spanDist = 1.0 - Math.abs(i - 35.5) / 8.0;
            const waveStart = 0.26 + spanDist * 0.22;
            const waveEnd = 0.70 + spanDist * 0.20;
            regionProgress = MathUtil.smootherstep(waveStart, waveEnd, m);
            lateralScale = MathUtil.lerp(0.16, 1.0, regionProgress);
            arcSweepY = Math.sin(regionProgress * Math.PI) * 5.5 * spanDist;
          } else if (i >= 20 && i <= 27) {
            regionProgress = MathUtil.lerp(bodyGrow * 0.68, 1.0, tailGrow);
            lateralScale = MathUtil.lerp(0.24, 1.0, tailGrow);
          }

          const stagedBirdX = bPt.x * lateralScale;
          const stagedBirdY = MathUtil.lerp(sPt.y * 1.18, bPt.y + arcSweepY, bodyGrow);

          out[i] = {
            x: MathUtil.lerp(sPt.x, stagedBirdX, regionProgress),
            y: MathUtil.lerp(sPt.y, stagedBirdY, Math.max(bodyGrow, regionProgress))
          };
        }
        return out;
      }
    }

    // =========================================================================
    // MODULE 2 & 3: Fracture & Shard — Nail-Impact Glass Shatter & Fast Return
    // =========================================================================
    class FractureSystem {
      constructor(clockSpec, rng, birdGeo) {
        this.clock = clockSpec;
        this.rng = rng;
        this.birdGeo = birdGeo;

        // Off-center nail impact point in local un-tilted ellipse coordinates
        this.impactLocal = { x: 42, y: -26 };
        this.cracks = [];
        this.largeShards = [];
        this.smallShards = [];

        this.generateFractureNetwork();
      }

      localToWorld(lx, ly) {
        const cosT = Math.cos(this.clock.tilt);
        const sinT = Math.sin(this.clock.tilt);
        return {
          x: this.clock.cx + lx * cosT - ly * sinT,
          y: this.clock.cy + lx * sinT + ly * cosT
        };
      }

      intersectEllipse(ix, iy, dx, dy) {
        const rx = this.clock.rx;
        const ry = this.clock.ry;
        const A = (dx * dx) / (rx * rx) + (dy * dy) / (ry * ry);
        const B = 2 * ((ix * dx) / (rx * rx) + (iy * dy) / (ry * ry));
        const C = (ix * ix) / (rx * rx) + (iy * iy) / (ry * ry) - 1;
        const disc = Math.max(0, B * B - 4 * A * C);
        return (-B + Math.sqrt(disc)) / (2 * A);
      }

      generateFractureNetwork() {
        this.cracks = [];
        this.largeShards = [];
        this.smallShards = [];

        const NUM_RAYS = 16;
        const baseWeights = [
          0.52, 0.78, 1.25, 0.64, 0.92, 1.48, 0.58, 1.15,
          0.72, 1.36, 0.60, 1.08, 1.42, 0.66, 0.95, 1.18
        ];
        const weights = baseWeights.map(w => w * this.rng.range(0.84, 1.18));
        const totalW = weights.reduce((a, b) => a + b, 0);

        const rayAngles = [];
        let accA = -0.62;
        for (let i = 0; i < NUM_RAYS; i++) {
          rayAngles.push(accA);
          accA += (weights[i] / totalW) * Math.PI * 2;
        }

        const ix = this.impactLocal.x;
        const iy = this.impactLocal.y;

        const rays = [];
        for (let i = 0; i < NUM_RAYS; i++) {
          const a0 = rayAngles[i];
          const a1 = a0 + this.rng.range(-0.035, 0.035);
          const a2 = a1 + this.rng.range(-0.045, 0.045);
          const a3 = a2 + this.rng.range(-0.040, 0.040);

          const maxR0 = this.intersectEllipse(ix, iy, Math.cos(a0), Math.sin(a0));
          const maxR1 = this.intersectEllipse(ix, iy, Math.cos(a1), Math.sin(a1));
          const maxR2 = this.intersectEllipse(ix, iy, Math.cos(a2), Math.sin(a2));
          const maxR3 = this.intersectEllipse(ix, iy, Math.cos(a3), Math.sin(a3));

          const fCrush = this.rng.range(0.11, 0.17);
          const fInner = this.rng.range(0.31, 0.44);
          const fMid   = this.rng.range(0.60, 0.76);

          const pCenter = { x: ix, y: iy };
          const pCrush  = { x: ix + Math.cos(a0) * (maxR0 * fCrush), y: iy + Math.sin(a0) * (maxR0 * fCrush) };
          const pInner  = { x: ix + Math.cos(a1) * (maxR1 * fInner), y: iy + Math.sin(a1) * (maxR1 * fInner) };
          const pMid    = { x: ix + Math.cos(a2) * (maxR2 * fMid),   y: iy + Math.sin(a2) * (maxR2 * fMid) };
          const pRim    = { x: ix + Math.cos(a3) * maxR3,            y: iy + Math.sin(a3) * maxR3 };

          const rimAngle = Math.atan2(pRim.y / this.clock.ry, pRim.x / this.clock.rx);
          rays.push({
            pts: [pCenter, pCrush, pInner, pMid, pRim],
            rimAngle,
            maxR: maxR3
          });

          const w0 = this.localToWorld(pCenter.x, pCenter.y);
          const w1 = this.localToWorld(pCrush.x, pCrush.y);
          const w2 = this.localToWorld(pInner.x, pInner.y);
          const w3 = this.localToWorld(pMid.x, pMid.y);
          const w4 = this.localToWorld(pRim.x, pRim.y);

          this.cracks.push({ a: w0, b: w1, tier: 1, delay: 0.00, span: 0.12, radialOrder: 0.10 });
          this.cracks.push({ a: w1, b: w2, tier: 1, delay: 0.08, span: 0.18, radialOrder: 0.32 });
          this.cracks.push({ a: w2, b: w3, tier: 1, delay: 0.20, span: 0.22, radialOrder: 0.62 });
          this.cracks.push({ a: w3, b: w4, tier: 1, delay: 0.36, span: 0.25, radialOrder: 0.92 });
        }

        let largeId = 0;
        let smallId = 0;

        for (let i = 0; i < NUM_RAYS; i++) {
          const next = (i + 1) % NUM_RAYS;
          const rA = rays[i].pts;
          const rB = rays[next].pts;

          const stepCrushA = rA[1];
          const stepCrushB = rB[1];

          const innerT = this.rng.range(0.85, 1.12);
          const pInA = {
            x: MathUtil.lerp(rA[1].x, rA[2].x, MathUtil.clamp(innerT, 0.4, 1.0)),
            y: MathUtil.lerp(rA[1].y, rA[2].y, MathUtil.clamp(innerT, 0.4, 1.0))
          };
          const pInB = {
            x: MathUtil.lerp(rB[1].x, rB[2].x, MathUtil.clamp(innerT * this.rng.range(0.88, 1.12), 0.4, 1.0)),
            y: MathUtil.lerp(rB[1].y, rB[2].y, MathUtil.clamp(innerT * this.rng.range(0.88, 1.12), 0.4, 1.0))
          };

          const midT = this.rng.range(0.82, 1.10);
          const pMidA = {
            x: MathUtil.lerp(rA[2].x, rA[3].x, MathUtil.clamp(midT, 0.45, 1.0)),
            y: MathUtil.lerp(rA[2].y, rA[3].y, MathUtil.clamp(midT, 0.45, 1.0))
          };
          const pMidB = {
            x: MathUtil.lerp(rB[2].x, rB[3].x, MathUtil.clamp(midT * this.rng.range(0.86, 1.14), 0.45, 1.0)),
            y: MathUtil.lerp(rB[2].y, rB[3].y, MathUtil.clamp(midT * this.rng.range(0.86, 1.14), 0.45, 1.0))
          };

          this.cracks.push({
            a: this.localToWorld(stepCrushA.x, stepCrushA.y),
            b: this.localToWorld(stepCrushB.x, stepCrushB.y),
            tier: 2, delay: 0.09 + (i % 3) * 0.02, span: 0.14, radialOrder: 0.16
          });
          this.cracks.push({
            a: this.localToWorld(pInA.x, pInA.y),
            b: this.localToWorld(pInB.x, pInB.y),
            tier: 2, delay: 0.22 + (i % 4) * 0.03, span: 0.16, radialOrder: 0.40
          });
          this.cracks.push({
            a: this.localToWorld(pMidA.x, pMidA.y),
            b: this.localToWorld(pMidB.x, pMidB.y),
            tier: 2, delay: 0.38 + (i % 4) * 0.03, span: 0.18, radialOrder: 0.70
          });

          const hasFork = (i % 2 === 0);
          const forkMidIn = {
            x: (pInA.x + pInB.x) * 0.5,
            y: (pInA.y + pInB.y) * 0.5
          };
          const forkMidOut = {
            x: MathUtil.lerp(pMidA.x, pMidB.x, this.rng.range(0.38, 0.62)),
            y: MathUtil.lerp(pMidA.y, pMidB.y, this.rng.range(0.38, 0.62))
          };
          if (hasFork) {
            this.cracks.push({
              a: this.localToWorld(forkMidIn.x, forkMidIn.y),
              b: this.localToWorld(forkMidOut.x, forkMidOut.y),
              tier: 2, delay: 0.28 + (i % 3) * 0.03, span: 0.18, radialOrder: 0.55
            });
          }

          this.createSmallShard(smallId++, [rA[0], stepCrushA, stepCrushB], true);
          this.createSmallShard(smallId++, [
            stepCrushA,
            { x: (stepCrushA.x + pInA.x) * 0.5, y: (stepCrushA.y + pInA.y) * 0.5 },
            { x: (stepCrushB.x + pInB.x) * 0.5, y: (stepCrushB.y + pInB.y) * 0.5 },
            stepCrushB
          ], true);

          if (i % 2 === 0) {
            // 8 inner ring large shards + 16 mid + 16 outer = exact 40 bird-morphing shards!
            this.createLargeShard(largeId++, [stepCrushA, pInA, pInB, stepCrushB], 0, null);
          } else {
            const diagMid = { x: (stepCrushA.x + pInB.x) * 0.5, y: (stepCrushA.y + pInB.y) * 0.5 };
            this.createSmallShard(smallId++, [stepCrushA, pInA, diagMid], false);
            this.createSmallShard(smallId++, [diagMid, pInA, pInB, stepCrushB], false);
          }

          this.createLargeShard(largeId++, [pInA, pMidA, pMidB, pInB], 1, null);

          let aStart = rays[i].rimAngle;
          let aEnd = rays[next].rimAngle;
          while (aEnd < aStart) aEnd += Math.PI * 2;

          const arcM1 = aStart + (aEnd - aStart) * 0.33;
          const arcM2 = aStart + (aEnd - aStart) * 0.67;
          const rimPt1 = { x: Math.cos(arcM1) * this.clock.rx, y: Math.sin(arcM1) * this.clock.ry };
          const rimPt2 = { x: Math.cos(arcM2) * this.clock.rx, y: Math.sin(arcM2) * this.clock.ry };

          this.createLargeShard(
            largeId++,
            [pMidA, rA[4], rimPt1, rimPt2, rB[4], pMidB],
            2,
            { aStart, aEnd }
          );

          this.createSmallShard(smallId++, [
            pMidA,
            { x: pMidA.x + this.rng.range(-6, 6), y: pMidA.y + this.rng.range(4, 11) },
            { x: (pMidA.x + pMidB.x) * 0.35, y: (pMidA.y + pMidB.y) * 0.35 }
          ], true);
        }
      }

      resamplePolygonTo48(localVertices) {
        const edges = [];
        let totalLen = 0;
        for (let i = 0; i < localVertices.length; i++) {
          const a = localVertices[i];
          const b = localVertices[(i + 1) % localVertices.length];
          const len = Math.hypot(b.x - a.x, b.y - a.y);
          edges.push({ a, b, len });
          totalLen += len;
        }
        const pts = [];
        const N = 48;
        for (let k = 0; k < N; k++) {
          const targetD = (k / N) * totalLen;
          let acc = 0;
          let chosen = edges[edges.length - 1];
          let localT = 0;
          for (let e of edges) {
            if (acc + e.len >= targetD) {
              chosen = e;
              localT = (targetD - acc) / (e.len || 1e-6);
              break;
            }
            acc += e.len;
          }
          pts.push({
            x: MathUtil.lerp(chosen.a.x, chosen.b.x, localT),
            y: MathUtil.lerp(chosen.a.y, chosen.b.y, localT)
          });
        }
        return pts;
      }

      createLargeShard(id, polyLocal, ringTier, rimArcRange) {
        const worldPts = polyLocal.map(p => this.localToWorld(p.x, p.y));
        let cx = 0, cy = 0;
        for (let p of worldPts) { cx += p.x; cy += p.y; }
        cx /= worldPts.length;
        cy /= worldPts.length;

        const localVerts = worldPts.map(p => ({ x: p.x - cx, y: p.y - cy }));
        const contour48 = this.resamplePolygonTo48(localVerts);

        const attachedTicks = [];
        if (rimArcRange) {
          for (let tIdx = 0; tIdx < 60; tIdx++) {
            const tickAngle = (tIdx / 60) * Math.PI * 2 - Math.PI / 2;
            let normA = tickAngle;
            while (normA < rimArcRange.aStart) normA += Math.PI * 2;
            while (normA >= rimArcRange.aStart + Math.PI * 2) normA -= Math.PI * 2;

            if (normA >= rimArcRange.aStart - 0.015 && normA <= rimArcRange.aEnd + 0.015) {
              const isMajor = (tIdx % 5 === 0);
              const outerFrac = 0.945;
              const innerFrac = isMajor ? 0.805 : 0.868;
              const pOuterW = this.localToWorld(
                Math.cos(tickAngle) * this.clock.rx * outerFrac,
                Math.sin(tickAngle) * this.clock.ry * outerFrac
              );
              const pInnerW = this.localToWorld(
                Math.cos(tickAngle) * this.clock.rx * innerFrac,
                Math.sin(tickAngle) * this.clock.ry * innerFrac
              );
              attachedTicks.push({
                x1: pOuterW.x - cx,
                y1: pOuterW.y - cy,
                x2: pInnerW.x - cx,
                y2: pInnerW.y - cy,
                isMajor
              });
            }
          }
        }

        const impactW = this.localToWorld(this.impactLocal.x, this.impactLocal.y);
        const distFromImpact = Math.hypot(cx - impactW.x, cy - impactW.y);
        const normDist = MathUtil.clamp(distFromImpact / 215, 0, 1);

        // Requirement 1: Fracture now starts at 4.0s (instead of 8.8s)!
        const detachTime = 4.06 + normDist * 0.90 + this.rng.range(-0.10, 0.42);

        const isDirectMorph = (this.rng.next() < 0.36);
        const fallDuration = isDirectMorph
          ? this.rng.range(0.15, 0.42)
          : this.rng.range(0.65, 1.55);
        const morphStartTime = detachTime + fallDuration;
        const morphDuration = this.rng.range(1.10, 1.80);

        const outAngle = Math.atan2(cy - impactW.y, cx - impactW.x) + this.rng.range(-0.30, 0.30);

        // Slower, strongly staggered return (12.80s..15.70s start, 2.2s..2.8s duration)
        // Outer & inner birds return in clear waves rather than all at once
        const waveOrder = (id * 0.6180339887) % 1.0; // Golden-ratio stagger across all 40 birds
        const returnStart = 12.80 + waveOrder * 2.85 + this.rng.range(-0.12, 0.18);
        const returnDuration = this.rng.range(2.20, 2.85);
        const returnEnd = returnStart + returnDuration;

        const birdAnim = new BirdAnimation(id, this.rng, this.birdGeo);

        this.largeShards.push({
          id,
          ringTier,
          isDirectMorph,
          originX: cx,
          originY: cy,
          polyVertices: localVerts,
          contour48,
          attachedTicks,
          detachTime,
          morphStartTime,
          morphDuration,
          returnStart,
          returnEnd,
          outAngle,
          outSpeed: isDirectMorph ? this.rng.range(52, 95) : this.rng.range(24, 58),
          gravityAccel: isDirectMorph ? this.rng.range(35, 70) : this.rng.range(145, 255),
          shardSpinSpeed: this.rng.range(-2.1, 2.1),
          specularSeed: this.rng.range(0, Math.PI * 2),
          depthScale: this.rng.range(0.78, 1.18),
          glowIntensity: this.rng.range(0.82, 1.25),
          birdAnim,
          // Runtime state
          x: cx,
          y: cy,
          vx: 0,
          vy: 0,
          heading: outAngle,
          shardRot: 0,
          morphT: 0,
          detached: false,
          trail: [],
          returnAnchor: null,
          seamFlash: 0
        });
      }

      createSmallShard(id, polyLocal, isFineGrain = false) {
        const worldPts = polyLocal.map(p => this.localToWorld(p.x, p.y));
        let cx = 0, cy = 0;
        for (let p of worldPts) { cx += p.x; cy += p.y; }
        cx /= worldPts.length;
        cy /= worldPts.length;

        const scale = isFineGrain ? this.rng.range(0.45, 0.72) : this.rng.range(0.75, 0.92);
        const localVerts = worldPts.map(p => ({ x: (p.x - cx) * scale, y: (p.y - cy) * scale }));
        const impactW = this.localToWorld(this.impactLocal.x, this.impactLocal.y);
        const dist = Math.hypot(cx - impactW.x, cy - impactW.y);
        const outAngle = Math.atan2(cy - impactW.y, cx - impactW.x) + this.rng.range(-0.45, 0.45);

        this.smallShards.push({
          id,
          isFineGrain,
          originX: cx,
          originY: cy,
          polyVertices: localVerts,
          detachTime: 4.04 + (dist / 220) * 0.90 + this.rng.range(0, 0.30),
          gravity: this.rng.range(115, 235),
          driftVx: Math.cos(outAngle) * this.rng.range(12, 42),
          driftVy: Math.sin(outAngle) * this.rng.range(8, 28) + this.rng.range(10, 32),
          rotSpeed: this.rng.range(-4.5, 4.5),
          fadeRate: this.rng.range(0.22, 0.40),
          glintPhase: this.rng.range(0, Math.PI * 2)
        });
      }
    }

    // =========================================================================
    // MODULE 6: Flock — High-Agility Boids + Star-Sand & Cross-Starburst Emitter
    // =========================================================================
    class FlockSystem {
      constructor(width, height, rng) {
        this.width = width;
        this.height = height;
        this.rng = rng;
        this.sepWeight = 1.45;
        this.aliWeight = 0.78;
        this.cohWeight = 0.54;
        this.wanWeight = 1.35;
        this.speedMultiplier = 1.0;

        this.waypoints = [
          { x: 95,  y: 120 },
          { x: 360, y: 110 },
          { x: 80,  y: 460 },
          { x: 375, y: 475 },
          { x: 225, y: 75  },
          { x: 225, y: 525 }
        ];

        // Global poetic particle pools for Star-Sand (星沙) and Cross-Starbursts (十字星芒 ✦)
        this.starSand = [];
        this.crossStars = [];
      }

      clearParticles() {
        this.starSand.length = 0;
        this.crossStars.length = 0;
      }

      // Prominent Star-Sand Waterfall & Sparkling Starbursts during Clock Shatter & Reconstruction
      emitClockEventStarSand(fracture, t, dt) {
        if (this.starSand.length >= 3400) return;

        // Right-biased spatial filter: highest waterfall density & height on the RIGHT of dial, tapering off toward the LEFT
        const rightBiasWeight = (x) => {
          const normX = MathUtil.clamp((x - 75) / 300, 0, 1); // 0 = left edge of dial, 1 = right edge
          return 0.08 + 0.92 * Math.pow(normX, 1.85);
        };

        // A. Clock Shatter Waterfall (4.00s - 6.30s): Right-heavy asymmetric cascade
        if (t >= 4.00 && t <= 6.30) {
          const burstRate = (t < 6.00 ? 780 : 340) * dt;
          const count = Math.floor(burstRate) + (this.rng.next() < (burstRate % 1) ? 1 : 0);
          for (let i = 0; i < count; i++) {
            if (this.starSand.length >= 4200) break;
            let sx, sy;
            if (i % 2 === 0) {
              const c = this.rng.pick(fracture.cracks);
              const u = this.rng.next();
              sx = MathUtil.lerp(c.a.x, c.b.x, u) + this.rng.range(-6, 6);
              sy = MathUtil.lerp(c.a.y, c.b.y, u) + this.rng.range(-6, 6);
            } else {
              const sh = this.rng.pick(fracture.largeShards);
              const v = this.rng.pick(sh.polyVertices);
              sx = sh.x + v.x + this.rng.range(-6, 6);
              sy = sh.y + v.y + this.rng.range(-6, 6);
            }
            const rb = rightBiasWeight(sx);
            if (this.rng.next() > rb) continue;

            const rRand = this.rng.next();
            const pSize = rRand < 0.62 ? this.rng.range(0.42, 1.05) : this.rng.range(1.20, 2.65);
            this.starSand.push({
              x: sx,
              y: sy,
              vx: this.rng.range(-18, 22),
              vy: this.rng.range(45, 138) * (0.55 + 0.55 * rb),
              gravity: this.rng.range(52, 98),
              size: pSize,
              age: 0,
              maxLife: this.rng.range(2.15, 3.95) * (0.55 + 0.55 * rb),
              twinklePhase: this.rng.range(0, Math.PI * 2),
              twinkleSpeed: this.rng.range(12.0, 26.0),
              hasMicroSpike: pSize > 1.25 && this.rng.next() < 0.72,
              isIceBlue: this.rng.next() < 0.24,
              alphaBoost: 1.45
            });
          }
          const starBurstProb = 120 * dt;
          const starCount = Math.floor(starBurstProb) + (this.rng.next() < (starBurstProb % 1) ? 1 : 0);
          for (let sIdx = 0; sIdx < starCount; sIdx++) {
            if (this.crossStars.length >= 245) break;
            const c = this.rng.pick(fracture.cracks);
            const sx = MathUtil.lerp(c.a.x, c.b.x, this.rng.next()) + this.rng.range(-16, 16);
            const rb = rightBiasWeight(sx);
            if (this.rng.next() > rb) continue;
            const dropOffset = this.rng.range(0, 155 * rb);
            this.crossStars.push({
              x: sx,
              y: MathUtil.lerp(c.a.y, c.b.y, this.rng.next()) + dropOffset,
              vx: this.rng.range(-8, 8),
              vy: this.rng.range(48, 118) * (0.6 + 0.5 * rb),
              radius: (this.rng.next() < 0.12 ? this.rng.range(24.0, 34.0) : (this.rng.next() < 0.72 ? this.rng.range(5.8, 12.2) : this.rng.range(13.5, 22.0))),
              isHero: this.rng.next() < 0.12,
              twinklePhase: this.rng.range(0, Math.PI * 2),
              age: 0,
              maxLife: this.rng.range(0.70, 1.45),
              rot: this.rng.range(-0.55, 0.55)
            });
          }
        }

        // B. Clock Reconstruction Waterfall (13.8s - 19.2s): Right-heavy asymmetric cascade reaching bottom
        if (t >= 13.80 && t <= 19.20) {
          const healRate = (t < 18.40 ? 760 : 320) * dt;
          const count = Math.floor(healRate) + (this.rng.next() < (healRate % 1) ? 1 : 0);
          for (let i = 0; i < count; i++) {
            if (this.starSand.length >= 4200) break;
            const sh = this.rng.pick(fracture.largeShards);
            const v = this.rng.pick(sh.polyVertices);
            const sx = sh.x + v.x * 0.9 + this.rng.range(-10, 10);
            const sy = sh.y + v.y * 0.9 + this.rng.range(-10, 10);
            const rb = rightBiasWeight(sx);
            if (this.rng.next() > rb) continue;

            const rRand = this.rng.next();
            const pSize = rRand < 0.60 ? this.rng.range(0.42, 1.05) : this.rng.range(1.20, 2.65);
            this.starSand.push({
              x: sx,
              y: sy,
              vx: this.rng.range(-15, 18),
              vy: this.rng.range(46, 136) * (0.55 + 0.55 * rb),
              gravity: this.rng.range(52, 96),
              size: pSize,
              age: 0,
              maxLife: this.rng.range(2.25, 4.10) * (0.55 + 0.55 * rb),
              twinklePhase: this.rng.range(0, Math.PI * 2),
              twinkleSpeed: this.rng.range(12.0, 26.0),
              hasMicroSpike: pSize > 1.25 && this.rng.next() < 0.72,
              isIceBlue: this.rng.next() < 0.24,
              alphaBoost: 1.48
            });
          }
          const healStarProb = 125 * dt;
          const healStarCount = Math.floor(healStarProb) + (this.rng.next() < (healStarProb % 1) ? 1 : 0);
          for (let sIdx = 0; sIdx < healStarCount; sIdx++) {
            if (this.crossStars.length >= 245) break;
            const sh = this.rng.pick(fracture.largeShards);
            const sx = sh.x + this.rng.range(-18, 18);
            const rb = rightBiasWeight(sx);
            if (this.rng.next() > rb) continue;
            this.crossStars.push({
              x: sx,
              y: sh.y + this.rng.range(0, 180 * rb),
              vx: this.rng.range(-7, 7),
              vy: this.rng.range(45, 115) * (0.6 + 0.5 * rb),
              radius: (this.rng.next() < 0.12 ? this.rng.range(24.0, 34.0) : (this.rng.next() < 0.72 ? this.rng.range(5.8, 12.2) : this.rng.range(13.5, 22.0))),
              isHero: this.rng.next() < 0.12,
              twinklePhase: this.rng.range(0, Math.PI * 2),
              age: 0,
              maxLife: this.rng.range(0.70, 1.45),
              rot: this.rng.range(-0.55, 0.55)
            });
          }
        }
      }

      emitTrailParticles(agent, dt) {
        if (agent.morphT < 0.35) return;

        // Abundant, softer, ultra-fine falling Star-Sand micro-particles behind every flying bird
        const emitProb = 175.0 * dt * Math.max(0.4, agent.morphT);
        const count = Math.floor(emitProb) + (this.rng.next() < (emitProb % 1) ? 1 : 0);
        for (let k = 0; k < count; k++) {
          if (this.starSand.length >= 4200) break;

          const u = Math.pow(this.rng.next(), 2.1);
          const tailDist = (3 + u * 26) * agent.depthScale;
          const perpA = agent.heading + Math.PI / 2;
          const r1 = this.rng.next() + this.rng.next() - 1.0;
          const spread = r1 * (9.0 + u * 20.0) * agent.depthScale;

          const sx = agent.x - Math.cos(agent.heading) * tailDist + Math.cos(perpA) * spread + this.rng.range(-2.5, 2.5);
          const sy = agent.y - Math.sin(agent.heading) * tailDist + Math.sin(perpA) * spread + this.rng.range(-2.5, 2.5);

          // 84% ultra-fine delicate dust (0.24-0.68px), 13% soft pearls (0.72-1.25px), 3% bright specks (1.3-1.85px)
          const pRoll = this.rng.next();
          let pSize;
          if (pRoll < 0.84) pSize = this.rng.range(0.24, 0.68);
          else if (pRoll < 0.97) pSize = this.rng.range(0.72, 1.25);
          else pSize = this.rng.range(1.30, 1.85);

          this.starSand.push({
            x: sx,
            y: sy,
            vx: -Math.cos(agent.heading) * this.rng.range(2, 11) + this.rng.range(-11, 11),
            vy: -Math.sin(agent.heading) * this.rng.range(2, 11) + this.rng.range(12, 38),
            gravity: this.rng.range(20, 46),
            size: pSize * agent.depthScale,
            age: 0,
            maxLife: this.rng.range(0.90, 1.95),
            twinklePhase: this.rng.range(0, Math.PI * 2),
            twinkleSpeed: this.rng.range(14.0, 30.0),
            hasMicroSpike: pSize > 1.25 && this.rng.next() < 0.14,
            isIceBlue: this.rng.next() < 0.34,
            alphaBoost: 1.0
          });
        }

        // Restrained bird-tail Cross-Starbursts (reduced to 30% frequency!)
        const poseP = agent.birdAnim.posePhase % 6;
        const isDownstrokePeak = (poseP >= 2.8 && poseP <= 4.6);
        const starProb = (isDownstrokePeak ? 2.6 : 0.85) * dt * agent.morphT;
        if (this.rng.next() < starProb && this.crossStars.length < 165) {
          const offsetBack = this.rng.range(6, 30) * agent.depthScale;
          const perpA = agent.heading + Math.PI / 2;
          const lat = (this.rng.next() - 0.5) * 20.0 * agent.depthScale;
          this.crossStars.push({
            x: agent.x - Math.cos(agent.heading) * offsetBack + Math.cos(perpA) * lat,
            y: agent.y - Math.sin(agent.heading) * offsetBack + Math.sin(perpA) * lat,
            vx: this.rng.range(-6, 6),
            vy: this.rng.range(10, 28),
            radius: (this.rng.next() < 0.12 ? this.rng.range(20.0, 29.0) : (this.rng.next() < 0.72 ? this.rng.range(5.0, 10.8) : this.rng.range(11.8, 18.5))) * agent.depthScale,
            isHero: this.rng.next() < 0.12,
            twinklePhase: this.rng.range(0, Math.PI * 2),
            age: 0,
            maxLife: this.rng.range(0.42, 0.88),
            rot: this.rng.range(-0.65, 0.65)
          });
        }
      }

      updateParticles(dt) {
        for (let i = this.starSand.length - 1; i >= 0; i--) {
          const p = this.starSand[i];
          p.age += dt;
          if (p.age >= p.maxLife) {
            this.starSand.splice(i, 1);
            continue;
          }
          // Apply gentle gravity while falling and fading out
          p.vy += (p.gravity || 24) * dt;
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.vx *= (1 - 1.2 * dt);
        }

        for (let i = this.crossStars.length - 1; i >= 0; i--) {
          const st = this.crossStars[i];
          st.age += dt;
          if (st.age >= st.maxLife) {
            this.crossStars.splice(i, 1);
            continue;
          }
          st.x += st.vx * dt;
          st.y += st.vy * dt;
        }
      }

      updateWaypoints(dt, timeSec) {
        for (let i = 0; i < this.waypoints.length; i++) {
          const wp = this.waypoints[i];
          wp.x += Math.sin(timeSec * 0.95 + i * 1.7) * 52 * dt;
          wp.y += Math.cos(timeSec * 0.82 + i * 2.3) * 44 * dt;
          wp.x = MathUtil.clamp(wp.x, 45, this.width - 45);
          wp.y = MathUtil.clamp(wp.y, 45, this.height - 45);
        }
      }

      stepAgent(agent, allAgents, dt, timeSec) {
        let sepX = 0, sepY = 0, sepCount = 0;
        let aliX = 0, aliY = 0, aliCount = 0;
        let cohX = 0, cohY = 0, cohCount = 0;

        const desiredSep = 44;
        const neighborDist = 96;

        for (let other of allAgents) {
          if (other.id === agent.id || other.morphT < 0.25) continue;
          const dx = agent.x - other.x;
          const dy = agent.y - other.y;
          const d = Math.hypot(dx, dy);
          if (d > 0.001 && d < desiredSep) {
            sepX += (dx / d) / d;
            sepY += (dy / d) / d;
            sepCount++;
          }
          if (d > 0.001 && d < neighborDist) {
            aliX += other.vx;
            aliY += other.vy;
            aliCount++;
            cohX += other.x;
            cohY += other.y;
            cohCount++;
          }
        }

        let ax = 0, ay = 0;
        if (sepCount > 0) {
          ax += (sepX / sepCount) * 2800 * this.sepWeight;
          ay += (sepY / sepCount) * 2800 * this.sepWeight;
        }
        if (aliCount > 0) {
          ax += ((aliX / aliCount) - agent.vx) * 1.45 * this.aliWeight;
          ay += ((aliY / aliCount) - agent.vy) * 1.45 * this.aliWeight;
        }
        if (cohCount > 0) {
          const centerX = cohX / cohCount;
          const centerY = cohY / cohCount;
          ax += (centerX - agent.x) * 0.48 * this.cohWeight;
          ay += (centerY - agent.y) * 0.48 * this.cohWeight;
        }

        const wanderAngle =
          Math.sin(timeSec * 2.1 + agent.id * 2.17) * 1.75 +
          Math.cos(timeSec * 1.35 - agent.id * 1.43) * 1.35;
        ax += Math.cos(agent.heading + wanderAngle) * 115 * this.wanWeight;
        ay += Math.sin(agent.heading + wanderAngle) * 115 * this.wanWeight;

        const wpIdx = (agent.id + Math.floor(timeSec * 0.45)) % this.waypoints.length;
        const wp = this.waypoints[wpIdx];
        ax += (wp.x - agent.x) * 0.52;
        ay += (wp.y - agent.y) * 0.52;

        const pad = 32;
        const turnForce = 4.2;
        if (agent.x < pad) ax += (pad - agent.x) * turnForce;
        if (agent.x > this.width - pad) ax -= (agent.x - (this.width - pad)) * turnForce;
        if (agent.y < pad) ay += (pad - agent.y) * turnForce;
        if (agent.y > this.height - pad) ay -= (agent.y - (this.height - pad)) * turnForce;

        agent.vx += ax * dt;
        agent.vy += ay * dt;

        const speed = Math.hypot(agent.vx, agent.vy);
        const stateBoost = agent.birdAnim.flightState === 'DIVE' ? 1.22 : 1.0;
        const minSpeed = 118 * agent.depthScale * this.speedMultiplier;
        const maxSpeed = 215 * agent.depthScale * stateBoost * this.speedMultiplier;
        if (speed > maxSpeed) {
          agent.vx = (agent.vx / speed) * maxSpeed;
          agent.vy = (agent.vy / speed) * maxSpeed;
        } else if (speed < minSpeed && speed > 0.001) {
          agent.vx = (agent.vx / speed) * minSpeed;
          agent.vy = (agent.vy / speed) * minSpeed;
        }

        const prevHeading = agent.heading;
        const newHeading = Math.atan2(agent.vy, agent.vx);
        agent.heading = MathUtil.angleLerp(prevHeading, newHeading, Math.min(1, dt * 11.0));
        const turnRate = ((agent.heading - prevHeading + Math.PI * 3) % (Math.PI * 2)) - Math.PI;

        agent.x += agent.vx * dt;
        agent.y += agent.vy * dt;

        agent.birdAnim.update(dt, turnRate, agent.vy, false);
      }
    }

    // =========================================================================
    // MODULE 1 & 8: Clock & Lighting — Feathered Gradient Ribbon + Star-Sand + Cross-Stars
    // =========================================================================
    class ClockAndLightingRenderer {
      constructor(p, clockSpec) {
        this.p = p;
        this.clock = clockSpec;
      }

      drawKleinBlueBackground() {
        const ctx = this.p.drawingContext;
        const grad = ctx.createRadialGradient(
          this.clock.cx, this.clock.cy - 15, 20,
          this.clock.cx, this.clock.cy, 410
        );
        grad.addColorStop(0.0, '#0943CE');
        grad.addColorStop(0.42, '#002FA7');
        grad.addColorStop(0.82, '#002182');
        grad.addColorStop(1.0, '#00155C');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, this.p.width, this.p.height);
      }

      drawClockBaseAndTicks(dialIntegrity = 1.0, crackProgress = 0.0, cracks = [], isReconstructing = false, climaxPulse = 0.0, nailImpactWorld = null) {
        const p = this.p;
        const ctx = p.drawingContext;
        const { cx, cy, rx, ry, tilt } = this.clock;

        if (dialIntegrity > 0.001) {
          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate(tilt);

          ctx.save();
          ctx.globalAlpha = dialIntegrity;
          ctx.shadowColor = 'rgba(220, 238, 255, 0.95)';
          ctx.shadowBlur = 32 + climaxPulse * 34;
          const surfGrad = ctx.createLinearGradient(-rx * 0.8, -ry * 0.9, rx * 0.85, ry * 0.9);
          surfGrad.addColorStop(0.0, '#FFFFFF');
          surfGrad.addColorStop(0.52, '#F2F7FF');
          surfGrad.addColorStop(1.0, '#DAE8FF');

          ctx.beginPath();
          ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
          ctx.fillStyle = surfGrad;
          ctx.fill();
          ctx.restore();

          ctx.save();
          ctx.globalAlpha = dialIntegrity;
          ctx.beginPath();
          ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
          ctx.lineWidth = 3.2 + climaxPulse * 1.8;
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.98)';
          ctx.stroke();

          ctx.beginPath();
          ctx.ellipse(0, 0, rx - 3.2, ry - 2.6, 0, 0, Math.PI * 2);
          ctx.lineWidth = 1.2;
          ctx.strokeStyle = 'rgba(120, 166, 235, 0.62)';
          ctx.stroke();

          for (let i = 0; i < 60; i++) {
            const a = (i / 60) * Math.PI * 2 - Math.PI / 2;
            const isMajor = (i % 5 === 0);
            const outerFrac = 0.945;
            const innerFrac = isMajor ? 0.805 : 0.868;

            const x1 = Math.cos(a) * rx * outerFrac;
            const y1 = Math.sin(a) * ry * outerFrac;
            const x2 = Math.cos(a) * rx * innerFrac;
            const y2 = Math.sin(a) * ry * innerFrac;

            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.lineCap = 'round';
            ctx.lineWidth = isMajor ? 3.2 : 1.35;
            ctx.strokeStyle = isMajor ? '#0038A8' : 'rgba(12, 68, 184, 0.78)';
            ctx.stroke();
          }
          ctx.restore();
          ctx.restore();
        }

        if (crackProgress > 0.005 && cracks.length > 0 && dialIntegrity > 0.02) {
          ctx.save();

          if (nailImpactWorld && !isReconstructing) {
            const starAlpha = Math.min(1, crackProgress * 3.0) * dialIntegrity;
            ctx.beginPath();
            ctx.arc(nailImpactWorld.x, nailImpactWorld.y, 2.6, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0, 42, 160, ${0.85 * starAlpha})`;
            ctx.fill();
            ctx.lineWidth = 1.2;
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.95 * starAlpha})`;
            ctx.stroke();
          }

          for (let c of cracks) {
            let localP = 0;
            if (!isReconstructing) {
              localP = MathUtil.clamp((crackProgress - c.delay) / (c.span || 0.25), 0, 1);
            } else {
              const revTrigger = (1.0 - c.radialOrder) * 0.45;
              localP = MathUtil.clamp((crackProgress - revTrigger) / 0.55, 0, 1);
            }
            if (localP <= 0) continue;

            const ex = MathUtil.lerp(c.a.x, c.b.x, localP);
            const ey = MathUtil.lerp(c.a.y, c.b.y, localP);

            ctx.beginPath();
            ctx.moveTo(c.a.x, c.a.y);
            ctx.lineTo(ex, ey);
            ctx.lineWidth = c.tier === 1 ? 1.55 : 0.95;
            ctx.strokeStyle = `rgba(12, 62, 182, ${0.72 * dialIntegrity})`;
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(c.a.x + 0.7, c.a.y - 0.7);
            ctx.lineTo(ex + 0.7, ey - 0.7);
            ctx.lineWidth = c.tier === 1 ? 1.15 : 0.75;
            ctx.strokeStyle = `rgba(255, 255, 255, ${(0.95 + climaxPulse * 0.4) * dialIntegrity})`;
            ctx.stroke();
          }
          ctx.restore();
        }
      }

      drawClockHands(hourAngle, minuteAngle, speedMult = 1.0, climaxPulse = 0.0, handOpts = {}) {
        const ctx = this.p.drawingContext;
        const { cx, cy, rx, ry, tilt } = this.clock;
        const colorMode = handOpts.colorMode || 'iceblue';
        const glowMult = handOpts.glowMult ?? 1.0;
        const sweepMult = handOpts.sweepMult ?? 0.65;

        let fillColor = 'rgba(130, 182, 255, 0.78)';
        if (colorMode === 'klein') fillColor = 'rgba(12, 74, 212, 0.88)';
        else if (colorMode === 'silver') fillColor = 'rgba(240, 248, 255, 0.92)';

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(tilt);



        const drawStyledHand = (angle, lengthRx, lengthRy, capsuleWidth) => {
          const tx = Math.cos(angle) * lengthRx;
          const ty = Math.sin(angle) * lengthRy;
          const bx = -Math.cos(angle) * (lengthRx * 0.12);
          const by = -Math.sin(angle) * (lengthRy * 0.12);

          // 1. White outer glow & crisp white capsule outline
          ctx.save();
          ctx.shadowColor = 'rgba(255, 255, 255, 0.98)';
          ctx.shadowBlur = (14 + (speedMult > 5 ? 10 : 0) + climaxPulse * 14) * glowMult;
          ctx.beginPath();
          ctx.moveTo(bx, by);
          ctx.lineTo(tx, ty);
          ctx.lineCap = 'round';
          ctx.lineWidth = capsuleWidth + 3.2;
          ctx.strokeStyle = '#FFFFFF';
          ctx.stroke();
          ctx.restore();

          // 2. Blue (or selected) inner capsule fill
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(bx, by);
          ctx.lineTo(tx, ty);
          ctx.lineCap = 'round';
          ctx.lineWidth = capsuleWidth - 0.6;
          ctx.strokeStyle = fillColor;
          ctx.stroke();
          ctx.restore();
        };

        drawStyledHand(hourAngle, rx * 0.48, ry * 0.52, 6.8);
        drawStyledHand(minuteAngle, rx * 0.72, ry * 0.74, 5.2);

        ctx.save();
        ctx.shadowColor = 'rgba(255, 255, 255, 0.98)';
        ctx.shadowBlur = 16 * glowMult;
        ctx.beginPath();
        ctx.arc(0, 0, 7.6, 0, Math.PI * 2);
        ctx.fillStyle = fillColor;
        ctx.fill();
        ctx.lineWidth = 2.0;
        ctx.strokeStyle = '#FFFFFF';
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(0, 0, 3.2, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
        ctx.restore();

        ctx.restore();
      }

      /**
       * Draw a Delicate Hair-Thin Needle Starburst (如参考视频中的细针微星芒 ✦)
       */
      drawCrossStar(x, y, radius, alpha, rot = 0) {
        if (alpha <= 0.01 || radius <= 0.5) return;
        const ctx = this.p.drawingContext;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rot);

        const drawTaperedNeedle = (len, halfW, peakAlpha, angleOffset) => {
          ctx.save();
          if (angleOffset !== 0) ctx.rotate(angleOffset);
          const grad = ctx.createLinearGradient(-len, 0, len, 0);
          grad.addColorStop(0.00, 'rgba(180, 224, 255, 0)');
          grad.addColorStop(0.28, `rgba(215, 238, 255, ${peakAlpha * 0.42})`);
          grad.addColorStop(0.50, `rgba(255, 255, 255, ${Math.min(1, peakAlpha)})`);
          grad.addColorStop(0.72, `rgba(215, 238, 255, ${peakAlpha * 0.42})`);
          grad.addColorStop(1.00, 'rgba(180, 224, 255, 0)');

          ctx.beginPath();
          ctx.moveTo(-len, 0);
          ctx.quadraticCurveTo(-len * 0.18, -halfW * 0.45, 0, -halfW);
          ctx.quadraticCurveTo(len * 0.18, -halfW * 0.45, len, 0);
          ctx.quadraticCurveTo(len * 0.18, halfW * 0.45, 0, halfW);
          ctx.quadraticCurveTo(-len * 0.18, halfW * 0.45, -len, 0);
          ctx.closePath();
          ctx.fillStyle = grad;
          ctx.fill();
          ctx.restore();
        };

        // Subtle center whisper glow
        const g = ctx.createRadialGradient(0, 0, 0, 0, 0, radius * 0.40);
        g.addColorStop(0, `rgba(255, 255, 255, ${Math.min(1, alpha * 0.28)})`);
        g.addColorStop(0.4, `rgba(205, 234, 255, ${alpha * 0.10})`);
        g.addColorStop(1, 'rgba(140, 195, 255, 0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(0, 0, radius * 0.40, 0, Math.PI * 2);
        ctx.fill();

        // Asymmetric primary tapered optical needles (vertical slightly longer than horizontal)
        const armV = radius * 1.45;
        const armH = radius * 1.12;
        const halfW = Math.max(0.32, Math.min(0.68, radius * 0.048));
        drawTaperedNeedle(armH, halfW, alpha * 0.95, 0);
        drawTaperedNeedle(armV, halfW, alpha * 1.00, Math.PI / 2);

        // Delicate short diagonal rays on larger hero sparkles
        if (radius > 6.5) {
          const diagR = radius * 0.36;
          drawTaperedNeedle(diagR, halfW * 0.65, alpha * 0.42, Math.PI / 4);
          drawTaperedNeedle(diagR, halfW * 0.65, alpha * 0.42, -Math.PI / 4);
        }

        // Tiny crisp optical center pinprick
        ctx.beginPath();
        ctx.arc(0, 0, 0.36, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(1, alpha * 1.05)})`;
        ctx.fill();

        ctx.restore();
      }

      /**
       * Draw Shimmering Pinprick Pearls & Micro-Starbursts (参考视频中附着在极淡光丝上的闪烁微粒)
       */
      drawTrailParticles(starSandList, crossStarList, timeSec) {
        const ctx = this.p.drawingContext;
        ctx.save();

        // 1. Organic falling Star-Sand pearls (dense bright near origin, fading gracefully as they fall)
        for (let p of starSandList) {
          const u = p.age / p.maxLife;
          const lifeRatio = 1.0 - u;
          // Quick birth, long smooth fade-out as it falls downward
          const fadeEnv = u < 0.10 ? (u / 0.10) : Math.pow(lifeRatio / 0.90, 1.45);
          const twinkle = 0.35 + 0.65 * Math.pow(0.5 + 0.5 * Math.sin(timeSec * (p.twinkleSpeed || 18.0) + p.twinklePhase), 2.2);
          // Overall softer/lighter opacity on flying sand; clock waterfall stays prominently visible
          const baseOpacity = 0.64 * (p.alphaBoost || 1.0);
          const alpha = Math.min(0.92, fadeEnv * twinkle * baseOpacity);
          if (alpha <= 0.02) continue;

          const r = p.size * (0.45 + 0.55 * lifeRatio);

          if (r > 1.05) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, r * 2.2, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(210, 235, 255, ${alpha * 0.18})`;
            ctx.fill();
          }

          ctx.beginPath();
          ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
          ctx.fillStyle = p.isIceBlue
            ? `rgba(195, 228, 255, ${alpha})`
            : `rgba(255, 255, 255, ${alpha})`;
          ctx.fill();

          // Soft tapered micro-glint on bright pearls when at peak twinkle
          if (p.hasMicroSpike && twinkle > 0.74) {
            this.drawCrossStar(p.x, p.y, r * 2.6, alpha * 0.78, (p.twinklePhase || 0) * 0.5);
          }
        }

        // 2. Pronounced, sharp twinkling optical needle starbursts (✦) with distinct size contrast
        for (let st of crossStarList) {
          const u = st.age / st.maxLife;
          const env = Math.sin(Math.pow(u, 0.65) * Math.PI);
          const isBig = st.isHero || st.radius > 20.0;
          const wave = 0.5 + 0.5 * Math.sin(timeSec * (isBig ? 26.0 : 20.0) + (st.twinklePhase || 0));
          // Deep contrast between dim trough and brilliant peak for unmistakable twinkling
          const shimmer = 0.18 + 0.95 * Math.pow(wave, 2.2);
          const alphaOut = Math.min(1.0, env * shimmer * (isBig ? 1.15 : 0.95));
          const radOut = st.radius * (0.32 + 0.68 * env) * (0.76 + 0.36 * shimmer);
          this.drawCrossStar(st.x, st.y, radOut, alphaOut, st.rot);
        }

        ctx.restore();
      }

      /**
       * Draw Ultra-Faint Gossamer Silk Filaments + Embedded Twinkling Glints
       * (参考视频风格：极淡、极细的半透明银白游丝簇，无粗白线感，光丝上自带细小闪烁星点)
       */
      /**
       * Draw Wide, Short Translucent Gossamer Veil Trail with Sparkling Starlight Specks
       * (大片有一定宽度的半透明轻纱，短而飘逸，纱面上点缀闪烁星点)
       */
      drawFeatheredRibbonTrail(trailPts, depthScale, trailAlpha) {
        if (!trailPts || trailPts.length < 4 || trailAlpha <= 0.01) return;
        const ctx = this.p.drawingContext;
        const len = trailPts.length;

        // Two-pass smoothing for liquid-silk veil curvature
        let pass1 = new Array(len);
        pass1[0] = trailPts[0];
        pass1[len - 1] = trailPts[len - 1];
        for (let i = 1; i < len - 1; i++) {
          pass1[i] = {
            x: trailPts[i - 1].x * 0.25 + trailPts[i].x * 0.5 + trailPts[i + 1].x * 0.25,
            y: trailPts[i - 1].y * 0.25 + trailPts[i].y * 0.5 + trailPts[i + 1].y * 0.25
          };
        }
        const smoothPts = new Array(len);
        smoothPts[0] = pass1[0];
        smoothPts[len - 1] = pass1[len - 1];
        for (let i = 1; i < len - 1; i++) {
          smoothPts[i] = {
            x: pass1[i - 1].x * 0.25 + pass1[i].x * 0.5 + pass1[i + 1].x * 0.25,
            y: pass1[i - 1].y * 0.25 + pass1[i].y * 0.5 + pass1[i + 1].y * 0.25
          };
        }

        const normals = new Array(len);
        for (let i = 0; i < len; i++) {
          const pNext = smoothPts[Math.min(len - 1, i + 1)];
          const pPrev = smoothPts[Math.max(0, i - 1)];
          const dx = pNext.x - pPrev.x;
          const dy = pNext.y - pPrev.y;
          const d = Math.hypot(dx, dy) || 1;
          normals[i] = { x: -dy / d, y: dx / d };
        }

        const pTailTip = smoothPts[0];
        const pBirdRoot = smoothPts[len - 1];
        const nowSec = this.p.millis() * 0.001;

        ctx.save();

        // Layer 1: Ultra-faint whisper veil (极淡极淡半透明轻纱，仅作星沙底衬，max alpha 0.055)
        const outerGrad = ctx.createLinearGradient(pTailTip.x, pTailTip.y, pBirdRoot.x, pBirdRoot.y);
        outerGrad.addColorStop(0.0, 'rgba(130, 195, 255, 0)');
        outerGrad.addColorStop(0.42, `rgba(175, 220, 255, ${0.024 * trailAlpha})`);
        outerGrad.addColorStop(0.78, `rgba(225, 244, 255, ${0.016 * trailAlpha})`);
        outerGrad.addColorStop(1.0, `rgba(255, 255, 255, ${0.024 * trailAlpha})`);

        ctx.beginPath();
        ctx.moveTo(smoothPts[0].x, smoothPts[0].y);
        for (let i = 1; i < len; i++) {
          const frac = i / (len - 1);
          // Veil starts narrow at tail root (frac=1 -> ~3.5px), billows wide in mid-veil (~11.5px), tapers to 0 at tip
          const billow = (3.4 + 9.2 * Math.sin(frac * Math.PI)) * Math.pow(frac, 0.55) * depthScale;
          const flutter = Math.sin(nowSec * 5.0 + i * 0.45) * 1.1 * (1 - frac);
          ctx.lineTo(smoothPts[i].x + normals[i].x * (billow + flutter), smoothPts[i].y + normals[i].y * (billow + flutter));
        }
        for (let i = len - 1; i >= 1; i--) {
          const frac = i / (len - 1);
          const billow = (3.4 + 9.2 * Math.sin(frac * Math.PI)) * Math.pow(frac, 0.55) * depthScale;
          const flutter = Math.sin(nowSec * 5.0 + i * 0.45) * 1.1 * (1 - frac);
          ctx.lineTo(smoothPts[i].x - normals[i].x * (billow - flutter), smoothPts[i].y - normals[i].y * (billow - flutter));
        }
        ctx.closePath();
        ctx.fillStyle = outerGrad;
        ctx.fill();

        // Layer 2: Ultra-faint inner mist core (极淡柔雾芯，max alpha 0.085)
        const innerGrad = ctx.createLinearGradient(pTailTip.x, pTailTip.y, pBirdRoot.x, pBirdRoot.y);
        innerGrad.addColorStop(0.0, 'rgba(180, 224, 255, 0)');
        innerGrad.addColorStop(0.50, `rgba(220, 240, 255, ${0.024 * trailAlpha})`);
        innerGrad.addColorStop(1.0, `rgba(255, 255, 255, ${0.030 * trailAlpha})`);

        ctx.beginPath();
        ctx.moveTo(smoothPts[0].x, smoothPts[0].y);
        for (let i = 1; i < len; i++) {
          const frac = i / (len - 1);
          const w = (1.6 + 3.8 * Math.sin(frac * Math.PI)) * Math.pow(frac, 0.8) * depthScale;
          ctx.lineTo(smoothPts[i].x + normals[i].x * w, smoothPts[i].y + normals[i].y * w);
        }
        for (let i = len - 1; i >= 1; i--) {
          const frac = i / (len - 1);
          const w = (1.6 + 3.8 * Math.sin(frac * Math.PI)) * Math.pow(frac, 0.8) * depthScale;
          ctx.lineTo(smoothPts[i].x - normals[i].x * w, smoothPts[i].y - normals[i].y * w);
        }
        ctx.closePath();
        ctx.fillStyle = innerGrad;
        ctx.fill();

        // All stars & stardust are emitted organically via FlockSystem (zero deterministic grid symmetry)

        ctx.restore();
      }

      drawMorphingEntity(entity, showTrail = true, debugWireframe = false) {
        const ctx = this.p.drawingContext;
        const m = MathUtil.clamp(entity.morphT, 0, 1);

        // 1. Feathered Gradient Ribbon Trail (Zero Joint Dots!)
        if (showTrail && m > 0.25 && entity.trail && entity.trail.length >= 4) {
          const trailAlpha = MathUtil.smoothstep(0.25, 0.75, m);
          this.drawFeatheredRibbonTrail(entity.trail, entity.depthScale, trailAlpha);
        }

        const birdContour = entity.birdAnim.getContour(48);
        const scale = entity.depthScale;
        const scaledBird = birdContour.map(pt => ({ x: pt.x * scale, y: pt.y * scale }));
        const contour = Morph.computeMorphedContour(entity.contour48, scaledBird, m);

        ctx.save();
        ctx.translate(entity.x, entity.y);

        const rot = MathUtil.angleLerp(
          entity.shardRot || 0,
          entity.heading - Math.PI / 2,
          MathUtil.smoothstep(0.06, 0.56, m)
        );
        ctx.rotate(rot);

        const tiltPhase = (entity.shardRot || 0) * 2.6 + entity.heading * 1.4 + entity.specularSeed;
        const angleReflect = 0.5 + 0.5 * Math.sin(tiltPhase);
        const flashBoost = entity.seamFlash || 0;

        ctx.shadowColor = m > 0.45
          ? `rgba(222, 240, 255, ${0.80 * entity.glowIntensity})`
          : `rgba(195, 226, 255, ${0.38 + angleReflect * 0.25 + flashBoost * 0.5})`;
        ctx.shadowBlur = MathUtil.lerp(7, 20 * entity.glowIntensity, m) + flashBoost * 20;

        const gx = Math.cos(entity.specularSeed) * 24 * scale;
        const gy = Math.sin(entity.specularSeed) * 24 * scale;
        const grad = ctx.createLinearGradient(-gx, -gy, gx, gy);

        if (m < 0.52) {
          const baseA = MathUtil.lerp(0.54 + angleReflect * 0.32, 0.94, m);
          grad.addColorStop(0.0, `rgba(255, 255, 255, ${Math.min(1, baseA + 0.16 + flashBoost * 0.3)})`);
          grad.addColorStop(0.45, `rgba(222, 238, 255, ${baseA * 0.78})`);
          grad.addColorStop(1.0, `rgba(162, 202, 255, ${baseA * 0.52})`);
        } else {
          grad.addColorStop(0.0, '#FFFFFF');
          grad.addColorStop(0.65, '#F2F8FF');
          grad.addColorStop(1.0, '#D4E6FF');
        }

        ctx.beginPath();
        for (let i = 0; i < contour.length; i++) {
          const pt = contour[i];
          if (i === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        }
        ctx.closePath();
        ctx.fillStyle = grad;
        ctx.fill();

        ctx.lineWidth = MathUtil.lerp(1.15, 0.85, m) + flashBoost * 1.2;
        ctx.strokeStyle = m < 0.65
          ? `rgba(245, 250, 255, ${Math.min(1, 0.68 + angleReflect * 0.30 + flashBoost)})`
          : 'rgba(255, 255, 255, 0.96)';
        ctx.stroke();

        if (m < 0.60 && contour.length >= 20) {
          ctx.beginPath();
          for (let i = 0; i <= 14; i++) {
            const pt = contour[i];
            if (i === 0) ctx.moveTo(pt.x, pt.y);
            else ctx.lineTo(pt.x, pt.y);
          }
          ctx.lineWidth = 1.75;
          ctx.strokeStyle = `rgba(255, 255, 255, ${(1 - m / 0.60) * (0.65 + angleReflect * 0.35)})`;
          ctx.stroke();
        }

        if (m < 0.58 && entity.attachedTicks && entity.attachedTicks.length > 0) {
          const tickAlpha = (1.0 - m / 0.58) * 0.92;
          ctx.save();
          for (let tk of entity.attachedTicks) {
            ctx.beginPath();
            ctx.moveTo(tk.x1, tk.y1);
            ctx.lineTo(tk.x2, tk.y2);
            ctx.lineCap = 'round';
            ctx.lineWidth = tk.isMajor ? 3.1 : 1.35;
            ctx.strokeStyle = tk.isMajor
              ? `rgba(0, 56, 168, ${tickAlpha})`
              : `rgba(12, 68, 184, ${tickAlpha * 0.82})`;
            ctx.stroke();
          }
          ctx.restore();
        }

        if (debugWireframe) {
          ctx.fillStyle = '#38BDF8';
          for (let i = 0; i < contour.length; i += 2) {
            ctx.beginPath();
            ctx.arc(contour[i].x, contour[i].y, 1.7, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        ctx.restore();
      }

      drawSmallShard(shard, x, y, rot, alpha, glintVal) {
        if (alpha <= 0.01) return;
        const ctx = this.p.drawingContext;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rot);

        const fillA = alpha * (0.38 + glintVal * 0.46);
        ctx.beginPath();
        const verts = shard.polyVertices;
        for (let i = 0; i < verts.length; i++) {
          if (i === 0) ctx.moveTo(verts[i].x, verts[i].y);
          else ctx.lineTo(verts[i].x, verts[i].y);
        }
        ctx.closePath();
        ctx.fillStyle = `rgba(225, 240, 255, ${fillA})`;
        ctx.fill();

        ctx.lineWidth = shard.isFineGrain ? 0.9 : 1.15;
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * (0.62 + glintVal * 0.38)})`;
        ctx.stroke();
        ctx.restore();
      }
    }

    // =========================================================================
    // MODULE 9: Master Application & p5.js Instance Mode Controller
    // =========================================================================
    const sketch = (p) => {
      // Total loop shortened to 20.0s:
      // 0.0-4.0s: Clock moves calmly (4s as requested)
      // 4.0-6.5s: Nail-impact glass fracture & falling grains
      // 4.6-8.2s: Shards morph to birds (direct & fall-then-morph)
      // 8.2-14.5s: Free flock flight with gradient ribbons, star-sand & cross-stars
      // 14.5-16.2s: Fast C1-continuous bird return
      // 16.2-17.4s: Fast clock reconstruction
      // 17.4-20.0s: Restored clock flows calmly
      const DURATION = 22.0;
      const rng = new SeededRNG(20261118);

      const clockSpec = {
        cx: 225,
        cy: 300,
        rx: 156,
        ry: 106,
        tilt: -21 * (Math.PI / 180)
      };

      const birdGeo = new BirdGeometry();
      const fracture = new FractureSystem(clockSpec, rng, birdGeo);
      const flock = new FlockSystem(450, 600, rng);
      let renderer = null;

      let currentMode = 'M5';
      let isPlaying = true;
      let masterTime = 0.0;
      let showTrails = true;
      let activeBirdLimit = 40;
      const handOpts = {
        colorMode: 'iceblue',
        glowMult: 1.0,
        sweepMult: 0
      };

      // M1 Lab State
      let m1AutoCycle = true;
      let m1PoseFloat = 0.0;
      let m1ArchIndex = 0;
      let m1Asymmetry = 0.18;
      let m1PreviewTrail = [];

      // M2 Lab State
      let m2AutoPlay = true;
      let m2MorphValue = 0.58;
      let m2ShowWireframe = false;
      let m2SampleIndex = 3;

      p.setup = () => {
        const canvas = p.createCanvas(450, 600);
        canvas.parent('p5-stage-container');
        p.pixelDensity(Math.min(2, window.devicePixelRatio || 1));
        renderer = new ClockAndLightingRenderer(p, clockSpec);

        const largeStat = document.getElementById('stat-large-shards');
        if (largeStat) largeStat.textContent = `${fracture.largeShards.length} 块 · 错峰坠落化鸟`;

        resetSimulationToTime(0);
      };

      function resetSimulationToTime(targetTime) {
        rng.reset();
        fracture.generateFractureNetwork();
        flock.clearParticles();
        masterTime = ((targetTime % DURATION) + DURATION) % DURATION;

        if (masterTime > 4.0) {
          const simStart = 4.0;
          const step = 1 / 60;
          for (let t = simStart; t < masterTime; t += step) {
            advanceNarrativePhysics(step, t);
          }
        }
      }

      function getClockHandAngles(t) {
        const baseHour = -1.32;
        const baseMin = -0.52;
        const v1 = 0.05;
        let revProgress = 0;

        // Post-morph rotation speed increased by 1.6x (7.5 -> 12.0 revolutions during 7.0s-14.2s)
        // Exact integer loop closure at t = 22.0s:
        // Minute hand completes EXACTLY 16.000 revolutions, Hour hand completes EXACTLY 2.000 revolutions!
        if (t <= 4.0) {
          revProgress = t * v1; // 0.000 -> 0.200
        } else if (t <= 5.2) {
          revProgress = 0.200 + (t - 4.0) * v1 * 0.35; // 0.200 -> 0.221
        } else if (t <= 7.0) {
          const u = (t - 5.2) / 1.8;
          revProgress = 0.221 + u * u * 1.279; // 0.221 -> 1.500
        } else if (t <= 14.2) {
          const u = (t - 7.0) / 7.2;
          revProgress = 1.500 + u * 12.000; // 1.500 -> 13.500 (exact 1.6x faster!)
        } else if (t <= 18.8) {
          const u = (t - 14.2) / 4.6;
          const decel = 1 - Math.pow(1 - u, 3);
          revProgress = 13.500 + decel * 2.340; // 13.500 -> 15.840
        } else {
          revProgress = 15.840 + (t - 18.8) * v1; // 15.840 -> 16.000 (exact seamless loop at t=22.0!)
        }

        const minAngle = baseMin + revProgress * Math.PI * 2;
        const hourAngle = baseHour + (revProgress / 16.0) * (Math.PI * 4);

        let speedMult = 1.0;
        if (t > 5.2 && t < 7.0) speedMult = MathUtil.lerp(1.0, 154.0, (t - 5.2) / 1.8);
        else if (t >= 7.0 && t <= 14.2) speedMult = 154.0;
        else if (t > 14.2 && t < 18.8) speedMult = MathUtil.lerp(154.0, 1.0, (t - 14.2) / 4.6);

        return { hourAngle, minAngle, speedMult };
      }

      function advanceNarrativePhysics(dt, t) {
        flock.updateWaypoints(dt, t);
        flock.updateParticles(dt);
        if (showTrails) {
          flock.emitClockEventStarSand(fracture, t, dt);
        }

        for (let idx = 0; idx < fracture.largeShards.length; idx++) {
          const s = fracture.largeShards[idx];
          const canBecomeBird = idx < activeBirdLimit;
          if (t < s.detachTime) {
            s.x = s.originX;
            s.y = s.originY;
            s.shardRot = 0;
            s.morphT = 0;
            s.detached = false;
            s.trail.length = 0;
            s.returnAnchor = null;
            s.seamFlash = 0;
            continue;
          }

          if (!s.detached) {
            s.detached = true;
            s.x = s.originX;
            s.y = s.originY;
            s.vx = Math.cos(s.outAngle) * s.outSpeed;
            s.vy = Math.sin(s.outAngle) * s.outSpeed + (s.isDirectMorph ? 0 : 28);
            s.heading = Math.atan2(s.vy, s.vx);
            s.shardRot = 0;
          }

          // Morph progress (respecting activeBirdLimit slider)
          if (t < s.returnStart) {
            if (!canBecomeBird || t < s.morphStartTime) {
              s.morphT = 0;
            } else {
              s.morphT = MathUtil.clamp((t - s.morphStartTime) / s.morphDuration, 0, 1);
            }
            s.seamFlash = 0;
          } else {
            const retFrac = MathUtil.clamp((t - s.returnStart) / (s.returnEnd - s.returnStart), 0, 1);
            // Fast contraction into shard during the final 55% of the brisk return arc
            s.morphT = 1.0 - MathUtil.smootherstep(0.50, 0.96, retFrac);
          }

          // Spatial motion
          if (t < s.returnStart) {
            if (s.morphT < 0.35) {
              const gravFactor = 1.0 - (s.morphT / 0.35);
              s.vy += s.gravityAccel * gravFactor * dt;
              s.vx *= (1.0 - 0.35 * dt);

              if (s.morphT > 0.08) {
                const pullUp = MathUtil.smoothstep(0.08, 0.35, s.morphT);
                s.vy -= 260 * pullUp * dt;
                s.vx += Math.cos(s.outAngle) * 140 * pullUp * dt;
              }

              s.x += s.vx * dt;
              s.y += s.vy * dt;

              if (s.y > 505) {
                s.vy = MathUtil.lerp(s.vy, -18, Math.min(1, dt * 5.0));
              }

              s.heading = Math.atan2(s.vy, s.vx);
              s.shardRot += s.shardSpinSpeed * dt * (1 - s.morphT * 2.4);
              s.birdAnim.update(dt, 0, s.vy, false);
            } else {
              s.shardRot = MathUtil.lerp(s.shardRot, 0, Math.min(1, dt * 8));
              flock.stepAgent(s, fracture.largeShards, dt, t);
            }
            // Emit Star-Sand & 4-Point Cross Starbursts while flying
            if (showTrails) {
              flock.emitTrailParticles(s, dt);
            }
          } else if (t <= s.returnEnd) {
            // Smooth, non-stopping tangential sweep back into the dial socket:
            // Uses a sweeping arc that preserves forward momentum (zero mid-air stop or sharp U-turn!)
            if (!s.returnAnchor) {
              const dur = s.returnEnd - s.returnStart;
              const p0x = s.x;
              const p0y = s.y;
              // P1 carries forward momentum smoothly along current flight vector
              const speedNow = Math.hypot(s.vx, s.vy) || 140;
              const dirX = s.vx / speedNow;
              const dirY = s.vy / speedNow;
              const distToHome = Math.hypot(s.originX - p0x, s.originY - p0y);
              const leadLen = Math.max(45, Math.min(140, distToHome * 0.55));
              const p1x = p0x + dirX * leadLen;
              const p1y = p0y + dirY * leadLen;

              // P2 glides in tangentially along the dial's tilted elliptical flow (no sudden stop!)
              const homeRadial = Math.atan2(s.originY - clockSpec.cy, s.originX - clockSpec.cx);
              const tangentA = homeRadial + 1.15;
              const p2x = s.originX + Math.cos(tangentA) * 58;
              const p2y = s.originY + Math.sin(tangentA) * 58;

              s.returnAnchor = { p0x, p0y, p1x, p1y, p2x, p2y };
            }

            const rawU = MathUtil.clamp((t - s.returnStart) / (s.returnEnd - s.returnStart), 0, 1);
            // Constant-flow cubic curve (slight ease-in only at the very end) so birds never stall in mid-air
            const u = 0.35 * rawU + 0.65 * (rawU * rawU * (3 - 2 * rawU));
            const inv = 1 - u;
            const ra = s.returnAnchor;

            const nextX =
              inv * inv * inv * ra.p0x +
              3 * inv * inv * u * ra.p1x +
              3 * inv * u * u * ra.p2x +
              u * u * u * s.originX;
            const nextY =
              inv * inv * inv * ra.p0y +
              3 * inv * inv * u * ra.p1y +
              3 * inv * u * u * ra.p2y +
              u * u * u * s.originY;

            const dx = nextX - s.x;
            const dy = nextY - s.y;
            const prevH = s.heading;
            if (Math.hypot(dx, dy) > 0.04) {
              s.heading = MathUtil.angleLerp(s.heading, Math.atan2(dy, dx), Math.min(1, dt * 16));
            }
            const turnRate = ((s.heading - prevH + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
            s.x = nextX;
            s.y = nextY;
            s.shardRot = MathUtil.lerp(s.shardRot, 0, Math.min(1, dt * 12));

            // Keep flapping naturally through the first 45% of the curve, then fold into glide as it nears dial
            s.birdAnim.update(dt, turnRate * 1.4, dy, rawU > 0.45);

            if (showTrails && rawU < 0.94) {
              flock.emitTrailParticles(s, dt * 1.35);
            }

            if (rawU > 0.85) {
              s.seamFlash = Math.sin(((rawU - 0.85) / 0.15) * Math.PI);
            }
          } else {
            s.x = s.originX;
            s.y = s.originY;
            s.shardRot = 0;
            s.morphT = 0;
            const overT = t - s.returnEnd;
            s.seamFlash = Math.max(0, 1.0 - overT * 3.2) * 0.75;
            s.trail.length = 0;
          }

          // Update smooth ribbon spine history (34 points -> graceful curved ribbon without crisscrossing screen)
          if (s.morphT > 0.25 && t < s.returnEnd - 0.10) {
            const tailDist = 11 * s.depthScale;
            const tx = s.x - Math.cos(s.heading) * tailDist;
            const ty = s.y - Math.sin(s.heading) * tailDist;
            s.trail.push({ x: tx, y: ty });
            if (s.trail.length > 20) s.trail.shift();
          } else if (s.trail.length > 0) {
            s.trail.shift();
            if (s.trail.length > 0) s.trail.shift();
          }
        }
      }

      function renderMasterNarrative(dt) {
        const t = masterTime;
        renderer.drawKleinBlueBackground();

        let dialIntegrity = 1.0;
        let crackProg = 0.0;
        let isReconstructing = false;
        let climaxPulse = 0.0;

        if (t < 4.0) {
          // 0.0 - 4.0s: Intact clock phase shortened to 4 seconds!
          dialIntegrity = 1.0;
          crackProg = 0.0;
        } else if (t < 5.75) {
          crackProg = MathUtil.clamp((t - 4.0) / 0.65, 0, 1);
          dialIntegrity = 1.0 - MathUtil.smoothstep(4.25, 5.45, t);
        } else if (t < 18.10) {
          // Keep underlying base dial completely invisible while birds are still flying & landing!
          // Only individual returned shards occupy the dial until all waves arrive.
          dialIntegrity = 0.0;
          crackProg = 0.0;
        } else if (t < 19.35) {
          // All birds have landed as glass shards -> now seal & heal the dial seamlessly
          isReconstructing = true;
          dialIntegrity = MathUtil.smoothstep(18.10, 18.95, t);
          crackProg = 1.0 - MathUtil.smootherstep(18.35, 19.30, t);
          if (t >= 18.20 && t <= 19.25) {
            climaxPulse = Math.sin(((t - 18.20) / 1.05) * Math.PI);
          }
        } else {
          dialIntegrity = 1.0;
          crackProg = 0.0;
        }

        const nailImpactWorld = fracture.localToWorld(fracture.impactLocal.x, fracture.impactLocal.y);
        renderer.drawClockBaseAndTicks(dialIntegrity, crackProg, fracture.cracks, isReconstructing, climaxPulse, nailImpactWorld);

        // 2. Render 68 falling glass grains & small splinters under gravity
        if (t >= 4.04 && t <= 17.1) {
          for (let sm of fracture.smallShards) {
            if (t < sm.detachTime) {
              if (dialIntegrity < 0.98) {
                renderer.drawSmallShard(sm, sm.originX, sm.originY, 0, 1 - dialIntegrity, 0.5);
              }
              continue;
            }
            if (t < 14.5) {
              const dtFall = t - sm.detachTime;
              const sx = sm.originX + sm.driftVx * dtFall + Math.sin(dtFall * 5 + sm.id) * 4;
              const sy = sm.originY + sm.driftVy * dtFall + 0.5 * sm.gravity * dtFall * dtFall;
              const rot = dtFall * sm.rotSpeed;
              const alpha = Math.max(0, 1.0 - dtFall * sm.fadeRate);
              const glint = 0.5 + 0.5 * Math.sin(t * 9.5 + sm.glintPhase);
              renderer.drawSmallShard(sm, sx, sy, rot, alpha, glint);
            } else if (t > 17.35 && t < 18.85) {
              const u = MathUtil.smootherstep(17.35, 18.80, t);
              const sx = MathUtil.lerp(sm.originX + sm.driftVx * 1.2, sm.originX, u);
              const sy = MathUtil.lerp(sm.originY + 65, sm.originY, u);
              const alpha = Math.sin(u * Math.PI) * 0.82;
              renderer.drawSmallShard(sm, sx, sy, (1 - u) * 1.4, alpha, 0.85);
            }
          }
        }

        // 3. Render Star-Sand & Cross-Starburst particles (also visible while settling after reconstruction)
        let activeBirdCount = 0;
        if (t >= 4.00 && t <= 21.80 && showTrails) {
          renderer.drawTrailParticles(flock.starSand, flock.crossStars, t);
        }
        if (t >= 4.04 && t <= 19.35) {
          const sorted = [...fracture.largeShards].sort((a, b) => a.depthScale - b.depthScale);
          for (let s of sorted) {
            if (s.morphT > 0.5) activeBirdCount++;
            if (t > 18.85 && dialIntegrity > 0.94 && s.morphT < 0.02 && s.seamFlash < 0.05) continue;
            renderer.drawMorphingEntity(s, showTrails, false);
          }
        }

        // 4. Draw Pure White Glowing Clock Hands & Center Point on top
        const { hourAngle, minAngle, speedMult } = getClockHandAngles(t);
        renderer.drawClockHands(hourAngle, minAngle, speedMult, climaxPulse, handOpts);

        updateMasterHUD(t, speedMult, activeBirdCount);
      }

      // =====================================================================
      // M1 Verification Panel
      // =====================================================================
      function renderM1Lab(dt) {
        renderer.drawKleinBlueBackground();
        const ctx = p.drawingContext;

        if (m1AutoCycle) {
          const flapRate = birdGeo.archetypes[m1ArchIndex].flapRate;
          m1PoseFloat = (m1PoseFloat + dt * 7.5 * flapRate) % 6;
          const slider = document.getElementById('m1-phase-slider');
          if (slider) slider.value = m1PoseFloat.toFixed(2);
        }

        const kIdx = Math.floor(m1PoseFloat) % 6;
        const nextIdx = (kIdx + 1) % 6;
        const phaseValEl = document.getElementById('m1-phase-val');
        if (phaseValEl) {
          phaseValEl.textContent = `${birdGeo.keyPoses[kIdx].name} → K${nextIdx + 1}`;
        }

        const heroParams = birdGeo.interpolatePoseParams(m1PoseFloat, m1ArchIndex, {
          bodyScale: 1.0,
          wingScale: 1.0,
          tipCurve: 1.0,
          tailScale: 1.0,
          asymmetry: m1Asymmetry,
          bankAngle: Math.sin(p.millis() * 0.0024) * 0.35
        });
        const heroContour = birdGeo.buildContourPoints(heroParams, 48);

        ctx.save();
        ctx.translate(225, 215);
        ctx.strokeStyle = 'rgba(160, 205, 255, 0.16)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(0, 0, 118, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, 0, 76, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        // Build vertical preview ribbon + star-sand for hero bird
        m1PreviewTrail.push({
          x: 225 + Math.sin(p.millis() * 0.004) * 10,
          y: 255
        });
        if (m1PreviewTrail.length > 32) m1PreviewTrail.shift();
        const shiftedPreview = m1PreviewTrail.map((pt, idx) => ({
          x: pt.x,
          y: pt.y + (m1PreviewTrail.length - 1 - idx) * 3.5
        }));
        renderer.drawFeatheredRibbonTrail(shiftedPreview, 1.8, 0.9);
        renderer.drawCrossStar(225 - 12, 295, 6.5, 0.65 + 0.35 * Math.sin(p.millis() * 0.008), 0);
        renderer.drawCrossStar(225 + 16, 330, 5.0, 0.55 + 0.45 * Math.cos(p.millis() * 0.007), Math.PI / 4);

        ctx.save();
        ctx.translate(225, 215);
        const scale = 2.95;
        ctx.shadowColor = 'rgba(225, 242, 255, 0.95)';
        ctx.shadowBlur = 26;
        ctx.beginPath();
        for (let i = 0; i < heroContour.length; i++) {
          const pt = heroContour[i];
          if (i === 0) ctx.moveTo(pt.x * scale, -pt.y * scale);
          else ctx.lineTo(pt.x * scale, -pt.y * scale);
        }
        ctx.closePath();
        const grad = ctx.createLinearGradient(-80, -60, 80, 70);
        grad.addColorStop(0, '#FFFFFF');
        grad.addColorStop(0.6, '#EFF6FF');
        grad.addColorStop(1, '#CFE2FF');
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = '#FFFFFF';
        ctx.stroke();
        ctx.restore();

        const cols = 3;
        const startX = 85, spanX = 140;
        const startY = 415, spanY = 92;

        for (let k = 0; k < 6; k++) {
          const col = k % cols;
          const row = Math.floor(k / cols);
          const gx = startX + col * spanX;
          const gy = startY + row * spanY;
          const isCurrent = Math.floor(m1PoseFloat) % 6 === k;

          ctx.save();
          ctx.translate(gx, gy);

          ctx.fillStyle = isCurrent ? 'rgba(235, 246, 255, 0.18)' : 'rgba(0, 22, 88, 0.42)';
          ctx.strokeStyle = isCurrent ? 'rgba(255, 255, 255, 0.85)' : 'rgba(160, 205, 255, 0.22)';
          ctx.lineWidth = isCurrent ? 1.5 : 1;
          ctx.beginPath();
          ctx.roundRect(-56, -36, 112, 74, 10);
          ctx.fill();
          ctx.stroke();

          const pParams = birdGeo.interpolatePoseParams(k, m1ArchIndex, { asymmetry: m1Asymmetry });
          const pPts = birdGeo.buildContourPoints(pParams, 48);
          const miniScale = 1.18;
          ctx.shadowColor = 'rgba(225, 242, 255, 0.75)';
          ctx.shadowBlur = isCurrent ? 14 : 6;
          ctx.beginPath();
          for (let i = 0; i < pPts.length; i++) {
            const pt = pPts[i];
            if (i === 0) ctx.moveTo(pt.x * miniScale, -pt.y * miniScale - 3);
            else ctx.lineTo(pt.x * miniScale, -pt.y * miniScale - 3);
          }
          ctx.closePath();
          ctx.fillStyle = '#F8FBFF';
          ctx.fill();

          ctx.shadowBlur = 0;
          ctx.fillStyle = isCurrent ? '#FFFFFF' : 'rgba(205, 228, 255, 0.8)';
          ctx.font = '500 10px Inter, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(birdGeo.keyPoses[k].name, 0, 28);
          ctx.restore();
        }
      }

      // =====================================================================
      // M2 Verification Panel
      // =====================================================================
      function renderM2Lab(dt) {
        renderer.drawKleinBlueBackground();
        const ctx = p.drawingContext;

        if (m2AutoPlay) {
          m2MorphValue = (m2MorphValue + dt * 0.28) % 1.0;
          const slider = document.getElementById('m2-morph-slider');
          if (slider) slider.value = m2MorphValue.toFixed(3);
        }

        const shardSample = fracture.largeShards[m2SampleIndex % fracture.largeShards.length];
        shardSample.birdAnim.update(dt, 0, 0, m2MorphValue < 0.82);

        const stageNames = [
          '1. 碎片脱离 (纯净半透明玻璃质感与侧棱高光)',
          '2. 身体拉长 (沿飞行中轴延伸出鸟首与脊线)',
          '3. 行波展翼 (从肩肘向锐利翼尖抽丝展开)',
          '4. 燕尾分叉 (后端分叉收束，玻璃折光化为银辉)',
          '5. 振翅飞行 (完成形态转换，进入六关键姿态循环)'
        ];
        const sIdx = Math.min(4, Math.floor(m2MorphValue * 5));
        const lbl = document.getElementById('m2-stage-label');
        const pct = document.getElementById('m2-progress-readout');
        if (lbl) lbl.textContent = `当前阶段：${stageNames[sIdx]}`;
        if (pct) pct.textContent = `${Math.round(m2MorphValue * 100)}%`;

        for (let k = 0; k < 5; k++) {
          const sampleM = k / 4;
          const gx = 55 + k * 85;
          const gy = 105;
          const active = sIdx === k;

          ctx.save();
          ctx.translate(gx, gy);
          ctx.fillStyle = active ? 'rgba(235, 246, 255, 0.18)' : 'rgba(0, 22, 88, 0.38)';
          ctx.strokeStyle = active ? '#FFFFFF' : 'rgba(160, 205, 255, 0.2)';
          ctx.beginPath();
          ctx.roundRect(-36, -34, 72, 68, 8);
          ctx.fill();
          ctx.stroke();

          const bPts = shardSample.birdAnim.getContour(48);
          const mPts = Morph.computeMorphedContour(shardSample.contour48, bPts, sampleM);
          ctx.beginPath();
          for (let i = 0; i < mPts.length; i++) {
            const pt = mPts[i];
            if (i === 0) ctx.moveTo(pt.x * 0.9, -pt.y * 0.9 - 2);
            else ctx.lineTo(pt.x * 0.9, -pt.y * 0.9 - 2);
          }
          ctx.closePath();
          ctx.fillStyle = sampleM < 0.5 ? 'rgba(210, 232, 255, 0.78)' : '#F8FBFF';
          ctx.fill();
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 0.9;
          ctx.stroke();

          ctx.fillStyle = '#DCEBFF';
          ctx.font = '10px Inter, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(`${Math.round(sampleM * 100)}%`, 0, 26);
          ctx.restore();
        }

        const heroEntity = {
          x: 225,
          y: 350,
          heading: -Math.PI / 2,
          shardRot: 0,
          morphT: m2MorphValue,
          depthScale: 3.1,
          glowIntensity: 1.2,
          specularSeed: shardSample.specularSeed,
          attachedTicks: shardSample.attachedTicks.map(tk => ({
            x1: tk.x1 * 2.8, y1: tk.y1 * 2.8,
            x2: tk.x2 * 2.8, y2: tk.y2 * 2.8,
            isMajor: tk.isMajor
          })),
          contour48: shardSample.contour48.map(pt => ({ x: pt.x * 2.8, y: pt.y * 2.8 })),
          birdAnim: shardSample.birdAnim,
          trail: []
        };
        renderer.drawMorphingEntity(heroEntity, false, m2ShowWireframe);
      }

      // =====================================================================
      // M3 Verification Panel (Feathered Gradient Ribbon + Star-Sand + Cross-Stars)
      // =====================================================================
      function renderM3Lab(dt) {
        const nowSec = p.millis() * 0.001;
        renderer.drawKleinBlueBackground();
        flock.updateWaypoints(dt, nowSec);
        flock.updateParticles(dt);

        if (showTrails) {
          renderer.drawTrailParticles(flock.starSand, flock.crossStars, nowSec);
        }

        const subset = fracture.largeShards.slice(0, activeBirdLimit);
        const sorted = [...subset].sort((a, b) => a.depthScale - b.depthScale);
        for (let s of sorted) {
          s.morphT = 1.0;
          s.detached = true;
          flock.stepAgent(s, fracture.largeShards, dt, nowSec);
          if (showTrails) {
            flock.emitTrailParticles(s, dt);
          }
          const tailDist = 11 * s.depthScale;
          s.trail.push({
            x: s.x - Math.cos(s.heading) * tailDist,
            y: s.y - Math.sin(s.heading) * tailDist
          });
          if (s.trail.length > 20) s.trail.shift();

          renderer.drawMorphingEntity(s, showTrails, false);
        }
      }

      p.draw = () => {
        const dt = Math.min(0.05, p.deltaTime / 1000 || 1 / 60);

        if (currentMode === 'M5' || currentMode === 'M4') {
          if (isPlaying) {
            const prevTime = masterTime;
            masterTime = (masterTime + dt) % DURATION;
            if (masterTime < prevTime) {
              resetSimulationToTime(0);
            } else if (masterTime >= 4.0 && masterTime <= 21.8) {
              advanceNarrativePhysics(dt, masterTime);
            }
          }
          renderMasterNarrative(dt);
        } else if (currentMode === 'M1') {
          renderM1Lab(dt);
        } else if (currentMode === 'M2') {
          renderM2Lab(dt);
        } else if (currentMode === 'M3') {
          renderM3Lab(dt);
        }
      };

      function updateMasterHUD(t, speedMult, activeBirds) {
        const slider = document.getElementById('timeline-slider');
        const curLbl = document.getElementById('timeline-current-label');
        const spdLbl = document.getElementById('timeline-speed-label');
        const birdStat = document.getElementById('stat-active-birds');
        const smallStat = document.getElementById('stat-small-shards');

        if (slider && document.activeElement !== slider) slider.value = t.toFixed(2);
        if (curLbl) curLbl.textContent = `当前时间：${t.toFixed(2)}s`;
        if (spdLbl) {
          spdLbl.textContent = speedMult > 5
            ? `指针角速度：${speedMult.toFixed(0)}x (三圈疾速飞旋)`
            : `指针角速度：${speedMult.toFixed(1)}x (静谧常速)`;
        }
        if (birdStat) birdStat.textContent = `${activeBirds} / ${activeBirdLimit} 只`;
        if (smallStat) smallStat.textContent = `星沙 ${flock.starSand.length} · 星芒 ${flock.crossStars.length}`;

        let title = '阶段 I · 时间流动 (0.0–4.0s)';
        let poem = '“银色钟表悬浮在克莱因蓝空间中，纯白双针稳步流转，画面宁静而克制。”';
        let activeJumpIdx = 0;

        if (t >= 4.0 && t < 5.0) {
          title = '阶段 II · 钉击玻璃碎裂 (4.0–6.5s)';
          poem = '“表盘如受钉击般放射开裂，细小玻璃颗粒率先坠落，大块玻璃错峰剥离。”';
          activeJumpIdx = 1;
        } else if (t >= 5.0 && t < 8.2) {
          title = '阶段 III · 坠落与错峰化鸟 (4.6–8.2s)';
          poem = '“有的玻璃碎片直接展翼，有的先下坠翻滚再凌空苏醒，洒下微光星沙飞起。”';
          activeJumpIdx = 2;
        } else if (t >= 8.2 && t < 14.5) {
          title = '阶段 IV · 鸟群自由飞行 (8.2–14.5s)';
          poem = '“银鸟曳着羽化渐变光带、飘散星沙与十字星芒（✦）在克莱因蓝天宇自由翱翔。”';
          activeJumpIdx = 3;
        } else if (t >= 14.5 && t < 16.2) {
          title = '阶段 V · 鸟群疾速归航 (14.5–16.2s)';
          poem = '“群鸟沿平滑弧线疾速俯冲归航，星芒闪烁间收翼化回银色玻璃碎片。”';
          activeJumpIdx = 4;
        } else if (t >= 16.2) {
          title = '阶段 VI · 瞬间重组与新生 (16.2–20.0s)';
          poem = '“碎片磁吸归位、裂纹向冲击点逆向弥合，时间的银钟再次完好如初。”';
          activeJumpIdx = 5;
        }


        const pills = document.querySelectorAll('.phase-pill');
        pills.forEach((btn, idx) => {
          btn.classList.toggle('active', idx === activeJumpIdx);
        });
      }

      window.SilverClockController = {
        setMode(mode) {
          currentMode = mode;
          if (mode === 'M1') {
            // Pure canvas without overlay text
          } else if (mode === 'M2') {
            // Pure canvas without overlay text
          } else if (mode === 'M3') {
            flock.clearParticles();
            fracture.largeShards.forEach((s, idx) => {
              s.x = 65 + (idx % 7) * 52 + (idx % 3) * 11;
              s.y = 85 + Math.floor(idx / 7) * 135 + (idx % 4) * 18;
              s.heading = (idx * 0.85) % (Math.PI * 2);
              s.vx = Math.cos(s.heading) * 155;
              s.vy = Math.sin(s.heading) * 155;
              s.morphT = 1.0;
              s.trail = [];
            });
          } else if (mode === 'M4') {
            resetSimulationToTime(4.05);
            isPlaying = true;
          } else {
            resetSimulationToTime(masterTime);
          }
        },
        jumpToTime(t) {
          resetSimulationToTime(t);
        },
        togglePlay() {
          isPlaying = !isPlaying;
          return isPlaying;
        },
        setPlaying(val) {
          isPlaying = val;
        },
        setShowTrails(val) {
          showTrails = val;
        },
        setM1Pose(poseIdx) {
          m1AutoCycle = false;
          m1PoseFloat = poseIdx;
          const btn = document.getElementById('m1-toggle-cycle');
          if (btn) btn.textContent = '连续插值飞行：暂停 (定格检视)';
        },
        toggleM1Cycle() {
          m1AutoCycle = !m1AutoCycle;
          return m1AutoCycle;
        },
        setM1Arch(idx) {
          m1ArchIndex = idx;
        },
        setM1PhaseFloat(val) {
          m1AutoCycle = false;
          m1PoseFloat = val;
          const btn = document.getElementById('m1-toggle-cycle');
          if (btn) btn.textContent = '连续插值飞行：暂停 (手动相位)';
        },
        setM1Asym(val) {
          m1Asymmetry = val;
        },
        setM2Morph(val) {
          m2AutoPlay = false;
          m2MorphValue = val;
          const btn = document.getElementById('m2-auto-btn');
          if (btn) btn.textContent = '自动循环演示：暂停';
        },
        toggleM2Auto() {
          m2AutoPlay = !m2AutoPlay;
          return m2AutoPlay;
        },
        toggleM2Wireframe() {
          m2ShowWireframe = !m2ShowWireframe;
          return m2ShowWireframe;
        },
        nextM2Shard() {
          m2SampleIndex = (m2SampleIndex + 1) % fracture.largeShards.length;
          return m2SampleIndex + 1;
        },
        setBoidsParams(sep, wan) {
          flock.sepWeight = sep;
          flock.wanWeight = wan;
        },
        scatterFlock() {
          this.setMode('M3');
        },
        setHandColor(mode) {
          handOpts.colorMode = mode;
        },
        setHandGlow(val) {
          handOpts.glowMult = val;
        },
        setBirdCount(n) {
          activeBirdLimit = MathUtil.clamp(n, 1, fracture.largeShards.length);
        },
        setBirdSpeed(mult) {
          flock.speedMultiplier = mult;
        }
      };
    };

    window.addEventListener('DOMContentLoaded', () => {
      new p5(sketch);
    });
