// Live Microgravity Flame & Prominent Cabin Airflow Physics Simulation
// Upgrades: Interactive Temperature Sensor HUD, Click-to-Ignite Spark Shockwave,
// Audio Integration, and Dynamic Cabin Telemetry Overlays

(function () {
  const canvas = document.getElementById("flameAirflowCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  const airflowSlider = document.getElementById("airflowSlider");
  const flowAngleSlider = document.getElementById("flowAngleSlider");
  const oxygenSlider = document.getElementById("oxygenSlider");
  const gravitySelect = document.getElementById("gravitySelect");
  const showStreamlines = document.getElementById("showStreamlines");
  const showTempField = document.getElementById("showTempField");

  const airflowParticles = [];
  const o2Particles = [];
  const sootParticles = [];
  const ignitionSparks = [];
  const shockwaves = [];

  const NUM_STREAM_LANES = 11;
  const PARTICLES_PER_LANE = 6;

  for (let lane = 0; lane < NUM_STREAM_LANES; lane++) {
    for (let i = 0; i < PARTICLES_PER_LANE; i++) {
      airflowParticles.push({
        lane,
        progress: (i / PARTICLES_PER_LANE) * canvas.width,
        speedOffset: 0.92 + Math.random() * 0.16
      });
    }
  }

  for (let i = 0; i < 70; i++) {
    o2Particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: 1 + Math.random() * 1.5,
      vy: (Math.random() - 0.5) * 0.5,
      r: 2 + Math.random() * 1.6
    });
  }

  for (let i = 0; i < 60; i++) {
    sootParticles.push({
      x: 410,
      y: 255,
      vx: 0,
      vy: 0,
      life: Math.random(),
      size: 2 + Math.random() * 3.5
    });
  }

  // Interactive Mouse Probe on Canvas
  const canvasMouse = { x: -100, y: -100, isOver: false };

  canvas.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    canvasMouse.x = (e.clientX - rect.left) * scaleX;
    canvasMouse.y = (e.clientY - rect.top) * scaleY;
    canvasMouse.isOver = true;
  });

  canvas.addEventListener("mouseleave", () => {
    canvasMouse.isOver = false;
  });

  // Interactive Click-to-Ignite / Perturb Shockwave
  canvas.addEventListener("mousedown", (e) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    // Shockwave ring
    shockwaves.push({
      x: clickX,
      y: clickY,
      r: 4,
      maxR: 90,
      alpha: 1.0
    });

    // Spark cluster
    for (let i = 0; i < 28; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 6.5;
      ignitionSparks.push({
        x: clickX,
        y: clickY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1.0,
        decay: 0.02 + Math.random() * 0.03,
        color: Math.random() > 0.4 ? "#00f5ff" : "#ffaa00",
        size: 2 + Math.random() * 2.5
      });
    }

    if (window.spaceAudio) window.spaceAudio.playSpark();
  });

  function getSimParams() {
    const vAir = parseFloat(airflowSlider.value);
    const angleDeg = parseFloat(flowAngleSlider.value);
    const o2 = parseFloat(oxygenSlider.value);
    const grav = parseFloat(gravitySelect.value);
    return {
      vAir,
      angleRad: (angleDeg * Math.PI) / 180,
      angleDeg,
      o2,
      grav
    };
  }

  function updateUIReadouts(p) {
    document.getElementById("airflowVal").textContent = `${p.vAir} cm/s`;
    const dirLabel = p.angleDeg === 0 ? "Left → Right" : p.angleDeg > 0 ? "Downward Tilt" : "Upward Tilt";
    document.getElementById("flowAngleVal").textContent = `${p.angleDeg}° (${dirLabel})`;
    document.getElementById("oxygenVal").textContent = `${p.o2}% O₂`;

    const re = ((p.vAir / 100) * 0.05 / 1.5e-5).toFixed(1);
    document.getElementById("reynoldsIndicator").textContent = `Re: ${re}`;

    let regime = "PURE DIFFUSION SPHERE";
    let shape = "Symmetric Sphere";
    if (p.grav >= 0.8) {
      regime = "1g BUOYANT PLUME";
      shape = "Teardrop Buoyant";
    } else if (p.vAir === 0) {
      regime = "STAGNANT 0g DIFFUSION";
      shape = "Spherical Flamelet";
    } else if (p.vAir <= 25) {
      regime = "NOMINAL CABIN FLOW";
      shape = "Wake-Elongated Ovoid";
    } else {
      regime = "HIGH FORCED CONVECTION";
      shape = "Stretched Wake Tail";
    }
    document.getElementById("regimeIndicator").textContent = `REGIME: ${regime}`;
    document.getElementById("readoutShape").textContent = shape;

    const baseTemp = p.grav > 0.5 ? 1920 : 1280;
    const flowBoost = Math.min(360, p.vAir * 8.5);
    const o2Boost = (p.o2 - 21) * 26;
    const peakTemp = Math.round(Math.max(620, baseTemp + flowBoost + o2Boost));
    document.getElementById("readoutTemp").textContent = `${peakTemp.toLocaleString()} K`;

    const sootFactor = p.grav > 0.5 ? 1.0 : Math.max(1.4, (6.2 - p.vAir * 0.075)).toFixed(1);
    document.getElementById("readoutSoot").textContent =
      p.grav > 0.5 ? "1.0× (Baseline 1g)" : `High (${sootFactor}× 1g)`;

    let spread = 0;
    if (p.vAir === 0 && p.grav === 0) {
      spread = 0.05;
    } else {
      const flowFactor = Math.exp(-Math.pow((p.vAir - 18) / 26, 2)) * 1.85;
      const o2Mult = Math.pow(p.o2 / 21, 1.8);
      spread = (flowFactor + p.grav * 1.1) * o2Mult;
    }
    document.getElementById("readoutSpread").textContent = `${spread.toFixed(2)} mm/s`;

    return { peakTemp, spread };
  }

  function getDeflectedY(x, baseY, burnerX, burnerY, flameRadius, vAir) {
    const dx = x - burnerX;
    const dy = baseY - burnerY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const influenceRadius = flameRadius * 2.35;
    if (dist < influenceRadius && vAir > 0) {
      const push = (1 - dist / influenceRadius) * (flameRadius * 0.68);
      return baseY + (dy >= 0 ? push : -push);
    }
    return baseY;
  }

  function drawCabinStructure(p) {
    ctx.fillStyle = "#050914";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle cabin grid lines
    ctx.strokeStyle = "rgba(0, 229, 255, 0.06)";
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Top and bottom module walls with aerospace gradient
    const wallGradTop = ctx.createLinearGradient(0, 0, 0, 36);
    wallGradTop.addColorStop(0, "#111c34");
    wallGradTop.addColorStop(1, "#070c18");
    ctx.fillStyle = wallGradTop;
    ctx.fillRect(0, 0, canvas.width, 36);

    const wallGradBot = ctx.createLinearGradient(0, canvas.height - 36, 0, canvas.height);
    wallGradBot.addColorStop(0, "#070c18");
    wallGradBot.addColorStop(1, "#111c34");
    ctx.fillStyle = wallGradBot;
    ctx.fillRect(0, canvas.height - 36, canvas.width, 36);

    // Wall structural rivets
    ctx.fillStyle = "rgba(0, 245, 255, 0.4)";
    for (let x = 40; x < canvas.width; x += 70) {
      ctx.beginPath();
      ctx.arc(x, 18, 2, 0, Math.PI * 2);
      ctx.arc(x, canvas.height - 18, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Left ECLSS Supply Diffuser Louvers (Prominent Airflow Origin)
    ctx.fillStyle = "rgba(0, 245, 255, 0.08)";
    ctx.fillRect(0, 36, 28, canvas.height - 72);
    ctx.strokeStyle = "#00f5ff";
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 37, 26, canvas.height - 74);

    for (let y = 56; y < canvas.height - 56; y += 26) {
      ctx.beginPath();
      ctx.moveTo(6, y);
      ctx.lineTo(24, y + Math.tan(p.angleRad) * 14);
      ctx.stroke();
    }

    // Right ECLSS Return Exhaust Grille
    ctx.fillStyle = "rgba(71, 85, 105, 0.25)";
    ctx.fillRect(canvas.width - 26, 36, 26, canvas.height - 72);
    ctx.strokeStyle = "#475569";
    ctx.strokeRect(canvas.width - 25, 37, 24, canvas.height - 74);

    ctx.fillStyle = "#00f5ff";
    ctx.font = "bold 11px -apple-system, sans-serif";
    ctx.fillText("ECLSS SUPPLY DIFFUSER (INLET)", 36, 23);
    ctx.fillStyle = "#94a3b8";
    ctx.fillText("CABIN EXHAUST / RECIRCULATION DUCT", canvas.width - 245, 23);
    ctx.fillText(`MICROGRAVITY: ${p.grav}g  |  AIRFLOW: ${p.vAir} cm/s  |  O₂: ${p.o2}%`, 36, canvas.height - 13);
  }

  function drawProminentAirflow(p, burnerX, burnerY, flameRadius) {
    if (!showStreamlines.checked) return;

    const speedPx = p.vAir * 0.14;
    const alpha = p.vAir === 0 ? 0.18 : Math.min(0.95, 0.35 + (p.vAir / 60) * 0.6);

    for (let lane = 0; lane < NUM_STREAM_LANES; lane++) {
      const startY = 58 + (lane / (NUM_STREAM_LANES - 1)) * (canvas.height - 116);

      ctx.beginPath();
      ctx.strokeStyle =
        p.vAir === 0
          ? "rgba(0, 229, 255, 0.14)"
          : `rgba(0, 245, 255, ${alpha * 0.42})`;
      ctx.lineWidth = p.vAir > 30 ? 2.4 : 1.8;

      for (let x = 28; x <= canvas.width - 26; x += 14) {
        const rawY = startY + (x - 28) * Math.tan(p.angleRad) * 0.35;
        const clampedRawY = Math.max(46, Math.min(canvas.height - 46, rawY));
        const y = getDeflectedY(x, clampedRawY, burnerX, burnerY, flameRadius, p.vAir);
        if (x === 28) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    if (p.vAir > 0) {
      airflowParticles.forEach((pt) => {
        pt.progress += speedPx * pt.speedOffset;
        if (pt.progress > canvas.width - 34) {
          pt.progress = 30;
        }
        const x = pt.progress;
        const startY = 58 + (pt.lane / (NUM_STREAM_LANES - 1)) * (canvas.height - 116);
        const rawY = Math.max(46, Math.min(canvas.height - 46, startY + (x - 28) * Math.tan(p.angleRad) * 0.35));
        const y = getDeflectedY(x, rawY, burnerX, burnerY, flameRadius, p.vAir);

        const nextX = x + 8;
        const nextRawY = Math.max(46, Math.min(canvas.height - 46, startY + (nextX - 28) * Math.tan(p.angleRad) * 0.35));
        const nextY = getDeflectedY(nextX, nextRawY, burnerX, burnerY, flameRadius, p.vAir);
        const theta = Math.atan2(nextY - y, nextX - x);

        const arrowLen = 14 + (p.vAir / 60) * 14;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(theta);

        ctx.strokeStyle = "#00f5ff";
        ctx.lineWidth = 2.4;
        ctx.shadowColor = "#00f5ff";
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.moveTo(-arrowLen * 0.5, 0);
        ctx.lineTo(arrowLen * 0.5, 0);
        ctx.stroke();

        ctx.fillStyle = "#e0faff";
        ctx.beginPath();
        ctx.moveTo(arrowLen * 0.5 + 5, 0);
        ctx.lineTo(arrowLen * 0.5 - 4, -4.5);
        ctx.lineTo(arrowLen * 0.5 - 4, 4.5);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
      });
    } else {
      ctx.fillStyle = "rgba(0, 245, 255, 0.85)";
      ctx.font = "bold 12px sans-serif";
      ctx.fillText("VENTILATION INACTIVE (0 cm/s) — PURE MOLECULAR DIFFUSION REGIME", 230, 68);
    }
  }

  function drawFlameAndPlume(p, burnerX, burnerY, flameRadius, time) {
    const pulse = Math.sin(time * 0.006) * 2.5;
    const r = flameRadius + pulse;

    const wakeStretch = p.vAir * 1.45;
    const wakeShiftX = Math.cos(p.angleRad) * wakeStretch * 0.55;
    const wakeShiftY = Math.sin(p.angleRad) * wakeStretch * 0.35 - p.grav * 85;

    // Soot plume
    sootParticles.forEach((sp) => {
      sp.life += 0.012 + (p.vAir / 60) * 0.018;
      if (sp.life >= 1) {
        sp.life = 0;
        sp.x = burnerX + (Math.random() - 0.5) * r * 0.6;
        sp.y = burnerY + (Math.random() - 0.5) * r * 0.6;
      }
      const advX = (p.vAir * 0.085) * Math.cos(p.angleRad) + (Math.random() - 0.5) * 0.6;
      const advY = (p.vAir * 0.05) * Math.sin(p.angleRad) - p.grav * 2.8 + (Math.random() - 0.5) * 0.6;
      sp.x += advX;
      sp.y += advY;

      const alpha = (1 - sp.life) * (p.grav > 0.5 ? 0.25 : 0.52);
      ctx.fillStyle = `rgba(148, 163, 184, ${alpha})`;
      ctx.beginPath();
      ctx.arc(sp.x, sp.y, sp.size * (0.6 + sp.life), 0, Math.PI * 2);
      ctx.fill();
    });

    // Thermal Halo Field
    if (showTempField.checked) {
      const haloGrad = ctx.createRadialGradient(
        burnerX + wakeShiftX * 0.4,
        burnerY + wakeShiftY * 0.4,
        r * 0.3,
        burnerX + wakeShiftX * 0.6,
        burnerY + wakeShiftY * 0.6,
        r * 2.4
      );
      haloGrad.addColorStop(0, "rgba(255, 140, 0, 0.32)");
      haloGrad.addColorStop(0.55, "rgba(239, 68, 68, 0.12)");
      haloGrad.addColorStop(1, "rgba(239, 68, 68, 0)");
      ctx.fillStyle = haloGrad;
      ctx.beginPath();
      ctx.arc(burnerX + wakeShiftX * 0.5, burnerY + wakeShiftY * 0.5, r * 2.4, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.save();
    ctx.translate(burnerX, burnerY);

    // Luminous Flame Body Gradient
    const flameGrad = ctx.createRadialGradient(
      wakeShiftX * 0.25,
      wakeShiftY * 0.25,
      4,
      wakeShiftX * 0.5,
      wakeShiftY * 0.5,
      r * 1.45
    );

    if (p.o2 >= 28) {
      flameGrad.addColorStop(0, "rgba(255, 255, 255, 0.98)");
      flameGrad.addColorStop(0.35, "rgba(253, 224, 71, 0.94)");
      flameGrad.addColorStop(0.7, "rgba(249, 115, 22, 0.72)");
      flameGrad.addColorStop(1, "rgba(56, 189, 248, 0)");
    } else if (p.vAir === 0 && p.grav === 0) {
      // Classic 0g cool/blue spherical flamelet
      flameGrad.addColorStop(0, "rgba(224, 242, 254, 0.95)");
      flameGrad.addColorStop(0.45, "rgba(56, 189, 248, 0.78)");
      flameGrad.addColorStop(0.78, "rgba(251, 146, 60, 0.45)");
      flameGrad.addColorStop(1, "rgba(56, 189, 248, 0)");
    } else {
      flameGrad.addColorStop(0, "rgba(254, 249, 195, 0.96)");
      flameGrad.addColorStop(0.4, "rgba(251, 146, 60, 0.88)");
      flameGrad.addColorStop(0.75, "rgba(234, 88, 12, 0.58)");
      flameGrad.addColorStop(1, "rgba(59, 130, 246, 0)");
    }

    ctx.fillStyle = flameGrad;
    ctx.beginPath();
    const steps = 54;
    for (let i = 0; i <= steps; i++) {
      const a = (i / steps) * Math.PI * 2;
      const cosA = Math.cos(a);
      const sinA = Math.sin(a);

      const flowAlign = Math.max(0, Math.cos(a - p.angleRad));
      const buoyAlign = Math.max(0, -sinA);

      const localR =
        r +
        Math.pow(flowAlign, 2) * wakeStretch +
        Math.pow(buoyAlign, 2) * (p.grav * 95);

      const px = cosA * localR;
      const py = sinA * localR;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();

    // Reaction Zone Boundary Ring
    ctx.strokeStyle = "rgba(56, 189, 248, 0.85)";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.arc(wakeShiftX * 0.12, wakeShiftY * 0.12, r * 0.56, 0, Math.PI * 2);
    ctx.stroke();

    // Fuel Burner / Sample Holder
    ctx.fillStyle = "#334155";
    ctx.strokeStyle = "#00f5ff";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(0, 0, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Burner mount rod
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(-3, 11, 6, 95);

    ctx.restore();
  }

  function drawO2Molecules(p, burnerX, burnerY, flameRadius) {
    o2Particles.forEach((m) => {
      const speed = 0.5 + p.vAir * 0.08;
      m.x += Math.cos(p.angleRad) * speed;
      m.y += Math.sin(p.angleRad) * speed * 0.45 + Math.sin(m.x * 0.03) * 0.35;

      const dx = burnerX - m.x;
      const dy = burnerY - m.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < flameRadius * 2.2 && dist > flameRadius * 0.6) {
        m.x += (dx / dist) * 0.55;
        m.y += (dy / dist) * 0.55;
      }

      if (m.x > canvas.width - 28 || dist <= flameRadius * 0.6) {
        m.x = 32 + Math.random() * 20;
        m.y = 48 + Math.random() * (canvas.height - 96);
      }

      ctx.fillStyle = "rgba(125, 211, 252, 0.78)";
      ctx.beginPath();
      ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  // Draw Interactive Shockwaves & Ignition Sparks
  function drawInteractiveSparks() {
    // Shockwaves
    for (let i = shockwaves.length - 1; i >= 0; i--) {
      const sw = shockwaves[i];
      sw.r += 3.2;
      sw.alpha -= 0.035;

      if (sw.alpha <= 0 || sw.r >= sw.maxR) {
        shockwaves.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.strokeStyle = `rgba(0, 245, 255, ${sw.alpha})`;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(sw.x, sw.y, sw.r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Sparks
    for (let i = ignitionSparks.length - 1; i >= 0; i--) {
      const sp = ignitionSparks[i];
      sp.x += sp.vx;
      sp.y += sp.vy;
      sp.vx *= 0.94;
      sp.vy *= 0.94;
      sp.life -= sp.decay;

      if (sp.life <= 0) {
        ignitionSparks.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.fillStyle = sp.color;
      ctx.shadowColor = sp.color;
      ctx.shadowBlur = 8;
      ctx.globalAlpha = sp.life;
      ctx.beginPath();
      ctx.arc(sp.x, sp.y, sp.size * sp.life, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // Draw Interactive Temperature Probe HUD
  function drawTemperatureProbeHUD(p, burnerX, burnerY, flameRadius, peakTemp) {
    if (!canvasMouse.isOver) return;

    const mx = canvasMouse.x;
    const my = canvasMouse.y;

    const dx = mx - burnerX;
    const dy = my - burnerY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Compute local physical temperature at probe
    let localTemp = 295; // ambient K
    const ambientK = 295;
    if (dist < flameRadius * 0.95) {
      localTemp = peakTemp;
    } else {
      // Exponential decay outwards
      const decayFactor = Math.exp(-(dist - flameRadius * 0.95) / (flameRadius * 1.2));
      // Thermal wake enhancement in flow direction
      const flowDot = (dx * Math.cos(p.angleRad) + dy * Math.sin(p.angleRad)) / (dist || 1);
      const wakeBoost = Math.max(0, flowDot) * (p.vAir / 60) * 0.45;
      localTemp = Math.round(ambientK + (peakTemp - ambientK) * decayFactor * (1 + wakeBoost));
    }

    const localCelsius = (localTemp - 273.15).toFixed(0);

    // 1. Crosshair Target Reticle
    ctx.save();
    ctx.strokeStyle = "#00f5ff";
    ctx.lineWidth = 1.4;
    ctx.shadowColor = "#00f5ff";
    ctx.shadowBlur = 6;

    // Outer crosshair circle
    ctx.beginPath();
    ctx.arc(mx, my, 14, 0, Math.PI * 2);
    ctx.stroke();

    // Center dot
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(mx, my, 2, 0, Math.PI * 2);
    ctx.fill();

    // Corner brackets
    const arm = 18;
    ctx.beginPath();
    ctx.moveTo(mx - arm, my);
    ctx.lineTo(mx - 6, my);
    ctx.moveTo(mx + 6, my);
    ctx.lineTo(mx + arm, my);
    ctx.moveTo(mx, my - arm);
    ctx.lineTo(mx, my - 6);
    ctx.moveTo(mx, my + 6);
    ctx.lineTo(mx, my + arm);
    ctx.stroke();

    // 2. Translucent Telemetry Box
    const boxW = 155;
    const boxH = 68;
    let boxX = mx + 24;
    let boxY = my - 34;

    if (boxX + boxW > canvas.width - 10) boxX = mx - boxW - 24;
    if (boxY + boxH > canvas.height - 10) boxY = canvas.height - boxH - 12;
    if (boxY < 10) boxY = 12;

    ctx.fillStyle = "rgba(10, 17, 34, 0.88)";
    ctx.strokeStyle = "rgba(0, 245, 255, 0.6)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(boxX, boxY, boxW, boxH, 6);
    } else {
      ctx.rect(boxX, boxY, boxW, boxH);
    }
    ctx.fill();
    ctx.stroke();

    // Telemetry text
    ctx.fillStyle = "#00f5ff";
    ctx.font = "bold 10px monospace";
    ctx.fillText("THERMAL PROBE // HUD", boxX + 10, boxY + 16);

    ctx.fillStyle = localTemp > 800 ? "#ff9e00" : "#e2e8f0";
    ctx.font = "bold 13px sans-serif";
    ctx.fillText(`${localTemp} K (${localCelsius}°C)`, boxX + 10, boxY + 34);

    ctx.fillStyle = "#94a3b8";
    ctx.font = "10.5px sans-serif";
    ctx.fillText(`Local Flow: ${p.vAir} cm/s`, boxX + 10, boxY + 48);
    ctx.fillText(`O₂ Transport: ${p.o2}%`, boxX + 10, boxY + 61);

    ctx.restore();
  }

  function renderLoop(time) {
    const p = getSimParams();
    const { peakTemp } = updateUIReadouts(p);

    const burnerX = 355;
    const burnerY = p.grav >= 0.8 ? 310 : 252;
    const flameRadius = 38 + (p.o2 - 14) * 1.4;

    drawCabinStructure(p);
    drawProminentAirflow(p, burnerX, burnerY, flameRadius);
    drawO2Molecules(p, burnerX, burnerY, flameRadius);
    drawFlameAndPlume(p, burnerX, burnerY, flameRadius, time);
    drawInteractiveSparks();
    drawTemperatureProbeHUD(p, burnerX, burnerY, flameRadius, peakTemp);

    requestAnimationFrame(renderLoop);
  }

  window.applySimPreset = function (preset) {
    if (window.spaceAudio) window.spaceAudio.playClick();

    if (preset === "stagnant") {
      airflowSlider.value = 0;
      flowAngleSlider.value = 0;
      oxygenSlider.value = 21;
      gravitySelect.value = "0";
    } else if (preset === "iss") {
      airflowSlider.value = 18;
      flowAngleSlider.value = 0;
      oxygenSlider.value = 21;
      gravitySelect.value = "0";
    } else if (preset === "gateway") {
      airflowSlider.value = 24;
      flowAngleSlider.value = 5;
      oxygenSlider.value = 34;
      gravitySelect.value = "0.16";
    } else if (preset === "suppress") {
      if (window.spaceAudio) window.spaceAudio.playAlert();
      airflowSlider.value = 0;
      flowAngleSlider.value = 0;
      oxygenSlider.value = 14;
      gravitySelect.value = "0";
    }
  };

  requestAnimationFrame(renderLoop);
})();
