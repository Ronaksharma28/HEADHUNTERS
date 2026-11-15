// NASA Microgravity Fire Lab — Cosmic Space Engine
// Features: Dimmed Photorealistic 3D Rotating Earth in Background (High Text Readability),
// Subtle Twinkling Starfield, Nebula Atmosphere, Card Spotlight Parallax, and Mission Telemetry Clock.

(function () {
  "use strict";

  /* ========================================================
     1. BACKGROUND SPACE CANVAS (TWINKLING & REVOLVING)
     ======================================================== */
  const canvas = document.getElementById("spaceBackgroundCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener("resize", () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    initStars();
  });

  // Mouse tracking for subtle background parallax
  let mouse = { x: width * 0.5, y: height * 0.5, targetX: width * 0.5, targetY: height * 0.5 };
  window.addEventListener("mousemove", (e) => {
    mouse.targetX = e.clientX;
    mouse.targetY = e.clientY;
  });

  // Starfield Data (dimmed so foreground text is always crisp)
  const NUM_STARS = 300;
  let stars = [];

  const STAR_COLORS = [
    "rgba(255, 255, 255, ",
    "rgba(165, 243, 252, ",
    "rgba(56, 189, 248, ",
    "rgba(254, 240, 138, ",
    "rgba(253, 186, 116, "
  ];

  function initStars() {
    stars = [];
    for (let i = 0; i < NUM_STARS; i++) {
      const radius = Math.random() * Math.max(width, height) * 0.85;
      const angle = Math.random() * Math.PI * 2;
      const depth = 0.2 + Math.random() * 0.8;
      stars.push({
        origDist: radius,
        origAngle: angle,
        x: width * 0.5 + Math.cos(angle) * radius,
        y: height * 0.5 + Math.sin(angle) * radius * 0.65,
        z: depth,
        size: (0.4 + Math.random() * 1.2) * depth,
        colorBase: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
        baseAlpha: 0.14 + Math.random() * 0.36,
        twinkleSpeed: 0.0015 + Math.random() * 0.0035,
        twinklePhase: Math.random() * Math.PI * 2,
        revSpeed: (0.00006 + (1 - depth) * 0.00014) * (Math.random() > 0.5 ? 1 : 1.1)
      });
    }
  }
  initStars();

  /* ========================================================
     DIMMED EARTH PROCEDURAL RENDERING ENGINE (HIGH TEXT READABILITY)
     ======================================================== */
  let earthTexCanvas = null;
  let earthLightsCanvas = null;
  let earthCloudCanvas = null;

  function hash2D(ix, iy) {
    let n = ix * 374761393 + iy * 668265263;
    n = (n ^ (n >> 13)) * 1274126177;
    return ((n ^ (n >> 16)) >>> 0) / 4294967295;
  }

  function valueNoise2D(x, y, periodX) {
    const ix = Math.floor(x);
    const iy = Math.floor(y);
    const fx = x - ix;
    const fy = y - iy;
    const ux = fx * fx * (3 - 2 * fx);
    const uy = fy * fy * (3 - 2 * fy);

    const ix0 = periodX ? ((ix % periodX) + periodX) % periodX : ix;
    const ix1 = periodX ? (((ix + 1) % periodX) + periodX) % periodX : ix + 1;

    const a = hash2D(ix0, iy);
    const b = hash2D(ix1, iy);
    const c = hash2D(ix0, iy + 1);
    const d = hash2D(ix1, iy + 1);

    return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
  }

  function fbm2D(x, y, octaves, periodX) {
    let val = 0;
    let amp = 0.5;
    let freq = 1;
    let p = periodX;
    for (let i = 0; i < octaves; i++) {
      val += amp * valueNoise2D(x * freq, y * freq, p);
      freq *= 2;
      if (p) p *= 2;
      amp *= 0.5;
    }
    return val;
  }

  function initEarthTextures() {
    const tw = 1024;
    const th = 512;

    earthTexCanvas = document.createElement("canvas");
    earthTexCanvas.width = tw;
    earthTexCanvas.height = th;
    const tc = earthTexCanvas.getContext("2d");

    earthLightsCanvas = document.createElement("canvas");
    earthLightsCanvas.width = tw;
    earthLightsCanvas.height = th;
    const lc = earthLightsCanvas.getContext("2d");

    earthCloudCanvas = document.createElement("canvas");
    earthCloudCanvas.width = tw;
    earthCloudCanvas.height = th;
    const cc = earthCloudCanvas.getContext("2d");

    const terrainImg = tc.createImageData(tw, th);
    const tData = terrainImg.data;
    const cloudImg = cc.createImageData(tw, th);
    const cData = cloudImg.data;

    const blobs = [
      [0.18, 0.28, 0.09, 0.11, 1.1],
      [0.24, 0.36, 0.06, 0.08, 0.95],
      [0.12, 0.20, 0.07, 0.06, 0.85],
      [0.29, 0.58, 0.055, 0.10, 1.15],
      [0.31, 0.72, 0.04, 0.12, 1.0],
      [0.51, 0.27, 0.06, 0.07, 1.0],
      [0.55, 0.22, 0.05, 0.06, 0.9],
      [0.52, 0.46, 0.075, 0.11, 1.2],
      [0.56, 0.64, 0.05, 0.12, 1.1],
      [0.66, 0.26, 0.12, 0.09, 1.25],
      [0.76, 0.34, 0.09, 0.09, 1.15],
      [0.83, 0.25, 0.08, 0.07, 1.0],
      [0.69, 0.44, 0.045, 0.07, 0.95],
      [0.79, 0.50, 0.05, 0.07, 0.8],
      [0.86, 0.73, 0.06, 0.065, 1.05],
      [0.36, 0.14, 0.045, 0.05, 0.95]
    ];

    const basePeriod = 8;

    for (let y = 0; y < th; y++) {
      const v = y / th;
      const lat = Math.abs(v - 0.5) * 2;

      for (let x = 0; x < tw; x++) {
        const u = x / tw;
        const idx = (y * tw + x) * 4;

        const warpX = fbm2D(u * basePeriod + 3.1, v * 4 + 1.7, 3, basePeriod) * 0.08;
        const warpY = fbm2D(u * basePeriod + 8.3, v * 4 + 5.2, 3, basePeriod) * 0.08;

        let mask = 0;
        for (let b = 0; b < blobs.length; b++) {
          const [bu, bv, rx, ry, w] = blobs[b];
          let du = Math.abs(u + warpX - bu);
          if (du > 0.5) du = 1.0 - du;
          const dv = v + warpY - bv;
          const dist2 = (du * du) / (rx * rx) + (dv * dv) / (ry * ry);
          if (dist2 < 2.5) {
            mask += w * Math.exp(-dist2 * 1.45);
          }
        }

        const detail = fbm2D(u * basePeriod * 2, v * 8, 5, basePeriod * 2);
        const fine = fbm2D(u * basePeriod * 6, v * 24, 3, basePeriod * 6);
        const elevation = mask * 0.68 + detail * 0.48 + fine * 0.14 - 0.54;

        let r, g, bCol;

        if (lat > 0.90 - detail * 0.06) {
          r = 120;
          g = 140;
          bCol = 160;
        } else if (elevation < 0) {
          const depth = Math.min(1, Math.max(0, -elevation * 3.2));
          const shelf = Math.pow(1 - depth, 3);
          r = Math.round(4 + shelf * 10 + fine * 3);
          g = Math.round(13 + (1 - depth) * 16 + shelf * 28 + fine * 5);
          bCol = Math.round(28 + (1 - depth) * 32 + shelf * 38 + fine * 7);
        } else {
          const h = Math.min(1, elevation * 2.4);
          const moisture = fbm2D(u * basePeriod * 1.5 + 11.4, v * 6 + 4.1, 4, basePeriod * 1.5);
          const isDesertBelt = Math.abs(lat - 0.36) < 0.17 && moisture < 0.48;

          if (h > 0.70) {
            const snow = Math.min(1, (h - 0.70) * 3.0);
            r = Math.round(58 + snow * 65);
            g = Math.round(68 + snow * 65);
            bCol = Math.round(66 + snow * 70);
          } else if (isDesertBelt) {
            r = Math.round(86 + fine * 26 - h * 16);
            g = Math.round(62 + fine * 18 - h * 12);
            bCol = Math.round(38 + fine * 10 - h * 10);
          } else {
            r = Math.round(16 + h * 26 + (moisture - 0.5) * 10 + fine * 12);
            g = Math.round(38 + h * 36 + moisture * 18 + fine * 16);
            bCol = Math.round(22 + h * 18 + fine * 10);
          }
        }

        tData[idx] = Math.max(0, Math.min(255, r));
        tData[idx + 1] = Math.max(0, Math.min(255, g));
        tData[idx + 2] = Math.max(0, Math.min(255, bCol));
        tData[idx + 3] = 255;

        const cw1 = fbm2D(u * basePeriod * 1.5 + 2.5, v * 6 + 9.2, 4, basePeriod * 1.5);
        const cw2 = fbm2D(u * basePeriod * 1.5 + cw1 * 0.45, v * 6 + cw1 * 0.45, 5, basePeriod * 1.5);
        const bandBias = Math.cos((v - 0.5) * Math.PI * 3.2) * 0.06 + (1 - lat * 0.35) * 0.08;
        const cVal = cw2 + bandBias - 0.50;

        if (cVal > 0) {
          const cAlpha = Math.min(1, Math.pow(cVal * 2.2, 1.35));
          cData[idx] = 185;
          cData[idx + 1] = 205;
          cData[idx + 2] = 225;
          cData[idx + 3] = Math.round(cAlpha * 115);
        } else {
          cData[idx + 3] = 0;
        }
      }
    }

    tc.putImageData(terrainImg, 0, 0);
    cc.putImageData(cloudImg, 0, 0);

    const cityClusters = [
      [195, 165, 18], [235, 180, 22], [160, 190, 12],
      [510, 145, 24], [540, 155, 20], [495, 170, 14],
      [555, 225, 10], [610, 235, 14], [695, 240, 20],
      [785, 195, 22], [820, 210, 18], [860, 185, 16],
      [305, 355, 12], [555, 345, 10], [885, 385, 10]
    ];
    cityClusters.forEach(([cx, cy, count]) => {
      for (let i = 0; i < count; i++) {
        const lx = cx + (Math.random() - 0.5) * 32;
        const ly = cy + (Math.random() - 0.5) * 20;
        lc.fillStyle = Math.random() > 0.35 ? "rgba(254, 240, 138, 0.5)" : "rgba(251, 191, 36, 0.45)";
        lc.beginPath();
        lc.arc(lx, ly, 0.7 + Math.random() * 0.9, 0, Math.PI * 2);
        lc.fill();
      }
    });
  }
  initEarthTextures();

  function drawPhotorealisticEarth(ctx, timestamp, width, height, parallaxX, parallaxY) {
    if (!earthTexCanvas) return;

    const isMobile = width < 900;
    const earthRadius = isMobile
      ? Math.max(150, Math.min(width * 0.35, 210))
      : Math.max(250, Math.min(width * 0.24, height * 0.40));

    const earthX = isMobile
      ? width * 0.85 + parallaxX * 0.2
      : width * 0.80 + parallaxX * 0.35;

    const earthY = isMobile
      ? height * 0.36 + parallaxY * 0.2
      : height * 0.46 + parallaxY * 0.35;

    ctx.save();
    // Dim the overall background planet so text across every view is 100% readable
    ctx.globalAlpha = 0.58;

    // 1. Back Half of Subtle Tilted Orbital Ring
    const orbitTilt = -0.46;
    ctx.save();
    ctx.translate(earthX, earthY);
    ctx.rotate(orbitTilt);
    ctx.beginPath();
    ctx.ellipse(0, 0, earthRadius * 1.36, earthRadius * 0.36, 0, Math.PI, Math.PI * 2);
    ctx.strokeStyle = "rgba(148, 163, 184, 0.14)";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();

    // 2. Soft Dimmed Atmospheric Halo
    const outerCorona = ctx.createRadialGradient(
      earthX - earthRadius * 0.12,
      earthY - earthRadius * 0.12,
      earthRadius * 0.88,
      earthX,
      earthY,
      earthRadius * 1.28
    );
    outerCorona.addColorStop(0.0, "rgba(56, 189, 248, 0.16)");
    outerCorona.addColorStop(0.45, "rgba(34, 197, 94, 0.05)");
    outerCorona.addColorStop(1.0, "rgba(5, 7, 10, 0)");

    ctx.fillStyle = outerCorona;
    ctx.beginPath();
    ctx.arc(earthX, earthY, earthRadius * 1.28, 0, Math.PI * 2);
    ctx.fill();

    // 3. Globe Disk Clipping & 3D Spherical Projection
    ctx.save();
    ctx.beginPath();
    ctx.arc(earthX, earthY, earthRadius, 0, Math.PI * 2);
    ctx.clip();

    ctx.fillStyle = "#040d1a";
    ctx.fillRect(earthX - earthRadius, earthY - earthRadius, earthRadius * 2, earthRadius * 2);

    const numStrips = 84;
    const rotOffset = (timestamp * 0.000016) % 1.0;
    const cloudRotOffset = (timestamp * 0.000024) % 1.0;
    const tw = 1024;
    const th = 512;

    for (let i = 0; i < numStrips; i++) {
      const normX = (i / (numStrips - 1)) * 2 - 1;
      const theta = Math.asin(Math.max(-0.999, Math.min(0.999, normX)));
      const u = (((theta / Math.PI) + 0.5 + rotOffset) % 1.0 + 1.0) % 1.0;
      const cu = (((theta / Math.PI) + 0.5 + cloudRotOffset) % 1.0 + 1.0) % 1.0;

      const sx = earthX + normX * earthRadius;
      const halfH = Math.sqrt(Math.max(0, 1 - normX * normX)) * earthRadius;
      const sw = (earthRadius * 2) / numStrips + 1.8;

      const srcX = u * tw;
      ctx.drawImage(earthTexCanvas, srcX, 0, 2.5, th, sx, earthY - halfH, sw, halfH * 2);

      const cloudSrcX = cu * tw;
      ctx.drawImage(earthCloudCanvas, cloudSrcX, 0, 2.5, th, sx, earthY - halfH, sw, halfH * 2);
    }

    // 4. Day/Night 3D Terminator Shadow
    const shadowGrad = ctx.createLinearGradient(
      earthX - earthRadius * 0.65,
      earthY - earthRadius * 0.65,
      earthX + earthRadius * 0.65,
      earthY + earthRadius * 0.65
    );
    shadowGrad.addColorStop(0.0, "rgba(2, 5, 12, 0.25)");
    shadowGrad.addColorStop(0.36, "rgba(4, 9, 18, 0.42)");
    shadowGrad.addColorStop(0.56, "rgba(5, 8, 16, 0.78)");
    shadowGrad.addColorStop(0.76, "rgba(3, 5, 10, 0.95)");
    shadowGrad.addColorStop(1.0, "rgba(2, 4, 8, 0.99)");

    ctx.fillStyle = shadowGrad;
    ctx.fillRect(earthX - earthRadius, earthY - earthRadius, earthRadius * 2, earthRadius * 2);

    // Night-Side City Lights
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    for (let i = Math.floor(numStrips * 0.42); i < numStrips; i++) {
      const normX = (i / (numStrips - 1)) * 2 - 1;
      const theta = Math.asin(Math.max(-0.999, Math.min(0.999, normX)));
      const u = (((theta / Math.PI) + 0.5 + rotOffset) % 1.0 + 1.0) % 1.0;
      const sx = earthX + normX * earthRadius;
      const halfH = Math.sqrt(Math.max(0, 1 - normX * normX)) * earthRadius;
      const sw = (earthRadius * 2) / numStrips + 1.5;
      ctx.drawImage(earthLightsCanvas, u * tw, 0, 2, th, sx, earthY - halfH, sw, halfH * 2);
    }
    ctx.restore();

    // 5. Subtle Atmospheric Rim Crescent
    const innerLimb = ctx.createRadialGradient(
      earthX + earthRadius * 0.2,
      earthY + earthRadius * 0.2,
      earthRadius * 0.75,
      earthX,
      earthY,
      earthRadius
    );
    innerLimb.addColorStop(0.0, "rgba(56, 189, 248, 0)");
    innerLimb.addColorStop(0.88, "rgba(56, 189, 248, 0)");
    innerLimb.addColorStop(0.96, "rgba(56, 189, 248, 0.30)");
    innerLimb.addColorStop(1.0, "rgba(186, 230, 253, 0.55)");

    ctx.fillStyle = innerLimb;
    ctx.fillRect(earthX - earthRadius, earthY - earthRadius, earthRadius * 2, earthRadius * 2);

    ctx.restore();

    // 6. Front Half of Subtle Tilted Orbital Ring
    ctx.save();
    ctx.translate(earthX, earthY);
    ctx.rotate(orbitTilt);
    ctx.beginPath();
    ctx.ellipse(0, 0, earthRadius * 1.36, earthRadius * 0.36, 0, 0, Math.PI);
    ctx.strokeStyle = "rgba(226, 232, 240, 0.22)";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();

    ctx.restore();
  }

  // Background Rendering Loop
  function renderSpace(timestamp) {
    mouse.x += (mouse.targetX - mouse.x) * 0.04;
    mouse.y += (mouse.targetY - mouse.y) * 0.04;

    const parallaxX = (mouse.x - width * 0.5) * 0.02;
    const parallaxY = (mouse.y - height * 0.5) * 0.02;

    ctx.fillStyle = "#04060a";
    ctx.fillRect(0, 0, width, height);

    // 1. Twinkling & Revolving Stars
    for (let i = 0; i < stars.length; i++) {
      const s = stars[i];
      s.origAngle += s.revSpeed;
      const rawX = width * 0.5 + Math.cos(s.origAngle) * s.origDist;
      const rawY = height * 0.5 + Math.sin(s.origAngle) * s.origDist * 0.68;

      s.x = rawX - parallaxX * (s.z * 1.2);
      s.y = rawY - parallaxY * (s.z * 1.2);

      const twinkle = Math.sin(timestamp * s.twinkleSpeed + s.twinklePhase);
      const alpha = Math.min(0.65, Math.max(0.08, s.baseAlpha * (0.68 + 0.32 * twinkle)));

      ctx.fillStyle = s.colorBase + alpha.toFixed(3) + ")";
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      ctx.fill();
    }

    // 2. Dimmed Photorealistic 3D Earth in Background
    drawPhotorealisticEarth(ctx, timestamp, width, height, parallaxX, parallaxY);

    requestAnimationFrame(renderSpace);
  }
  requestAnimationFrame(renderSpace);

  /* ========================================================
     2. MISSION TIME & TELEMETRY CLOCK
     ======================================================== */
  function updateTelemetryClock() {
    const metEl = document.getElementById("hudMissionClock");
    if (!metEl) return;

    const startSec = 142 * 86400 + 18 * 3600 + 24 * 60 + 12;
    const nowSec = startSec + Math.floor(performance.now() / 1000);

    const d = Math.floor(nowSec / 86400);
    const h = Math.floor((nowSec % 86400) / 3600);
    const m = Math.floor((nowSec % 3600) / 60);
    const s = nowSec % 60;

    const pad = (n) => String(n).padStart(2, "0");
    metEl.textContent = `MET +${pad(d)}:${pad(h)}:${pad(m)}:${pad(s)}`;
  }
  setInterval(updateTelemetryClock, 1000);
  updateTelemetryClock();
})();
