// NASA Microgravity Fire Lab — Cosmic Space Engine & Interactive Cursor System
// Features: Twinkling & Revolving Starfield, Nebula Clouds, Meteors, Interactive Constellations,
// Dual Cosmic Cursor, Stardust Trail, and 3D Card Spotlight Parallax.

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

  // Mouse tracking for parallax & constellations
  let mouse = { x: width * 0.5, y: height * 0.5, targetX: width * 0.5, targetY: height * 0.5, isHovering: false };
  window.addEventListener("mousemove", (e) => {
    mouse.targetX = e.clientX;
    mouse.targetY = e.clientY;
    mouse.isHovering = true;
  });

  document.addEventListener("mouseleave", () => {
    mouse.isHovering = false;
  });

  // Starfield Data
  const NUM_STARS = 420;
  let stars = [];

  // Stellar colors: O (blue-white), B (cyan-white), A (pure white), G (solar yellow), M (warm red/amber)
  const STAR_COLORS = [
    "rgba(255, 255, 255, ",
    "rgba(165, 243, 252, ", // Cyan-white
    "rgba(56, 189, 248, ",  // Electric blue
    "rgba(254, 240, 138, ", // Solar gold
    "rgba(253, 186, 116, ", // Soft amber
    "rgba(244, 114, 182, "  // Magenta
  ];

  function initStars() {
    stars = [];
    for (let i = 0; i < NUM_STARS; i++) {
      // 3D polar/cartesian distribution for revolving celestial sphere
      const radius = Math.random() * Math.max(width, height) * 0.85;
      const angle = Math.random() * Math.PI * 2;
      const depth = 0.2 + Math.random() * 0.8; // 0.2 = far, 1.0 = close
      stars.push({
        origDist: radius,
        origAngle: angle,
        x: width * 0.5 + Math.cos(angle) * radius,
        y: height * 0.5 + Math.sin(angle) * radius * 0.65, // perspective elliptic tilt
        z: depth,
        size: (0.6 + Math.random() * 1.8) * depth,
        colorBase: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
        baseAlpha: 0.25 + Math.random() * 0.65,
        twinkleSpeed: 0.0015 + Math.random() * 0.004,
        twinklePhase: Math.random() * Math.PI * 2,
        revSpeed: (0.00008 + (1 - depth) * 0.00018) * (Math.random() > 0.5 ? 1 : 1.1)
      });
    }
  }
  initStars();

  // Revolving Celestial Orbit Nodes
  let celestialRevAngle = 0;
  const CELESTIAL_NODES = [
    { dist: 280, speed: 0.00035, size: 3.5, color: "#00f5ff", label: "ISS Destiny Lab" },
    { dist: 460, speed: 0.00022, size: 2.8, color: "#ff9e00", label: "Gateway Node 1" },
    { dist: 640, speed: 0.00015, size: 3.0, color: "#c084fc", label: "Cygnus Free-Flyer" }
  ];

  // Meteors / Shooting Stars
  const meteors = [];
  function maybeSpawnMeteor() {
    if (Math.random() < 0.015 && meteors.length < 3) {
      const startX = Math.random() * width * 1.1;
      const startY = Math.random() * height * 0.4;
      const angle = (Math.PI / 4) + (Math.random() - 0.5) * 0.35;
      const speed = 12 + Math.random() * 14;
      meteors.push({
        x: startX,
        y: startY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        length: 80 + Math.random() * 120,
        thickness: 1.5 + Math.random() * 1.5,
        life: 1.0,
        decay: 0.015 + Math.random() * 0.015,
        color: Math.random() > 0.4 ? "#00f5ff" : "#ffaa00"
      });
    }
  }

  // Background Rendering Loop
  function renderSpace(timestamp) {
    // Smooth mouse parallax lerp
    mouse.x += (mouse.targetX - mouse.x) * 0.04;
    mouse.y += (mouse.targetY - mouse.y) * 0.04;

    const parallaxX = (mouse.x - width * 0.5) * 0.025;
    const parallaxY = (mouse.y - height * 0.5) * 0.025;

    // Clear with cosmic dark void
    ctx.fillStyle = "#030713";
    ctx.fillRect(0, 0, width, height);

    // 1. Draw Deep Space Pulsing Nebula Clouds
    const t = timestamp * 0.0003;
    const neb1X = width * 0.25 + Math.sin(t * 0.7) * 80;
    const neb1Y = height * 0.3 + Math.cos(t * 0.5) * 60;
    const grad1 = ctx.createRadialGradient(neb1X, neb1Y, 10, neb1X, neb1Y, width * 0.45);
    grad1.addColorStop(0, "rgba(59, 130, 246, 0.08)");
    grad1.addColorStop(0.5, "rgba(139, 92, 246, 0.04)");
    grad1.addColorStop(1, "rgba(3, 7, 19, 0)");
    ctx.fillStyle = grad1;
    ctx.fillRect(0, 0, width, height);

    const neb2X = width * 0.78 + Math.cos(t * 0.8) * 100;
    const neb2Y = height * 0.65 + Math.sin(t * 0.6) * 80;
    const grad2 = ctx.createRadialGradient(neb2X, neb2Y, 10, neb2X, neb2Y, width * 0.5);
    grad2.addColorStop(0, "rgba(0, 245, 255, 0.06)");
    grad2.addColorStop(0.4, "rgba(236, 72, 153, 0.03)");
    grad2.addColorStop(1, "rgba(3, 7, 19, 0)");
    ctx.fillStyle = grad2;
    ctx.fillRect(0, 0, width, height);

    // 2. Revolving Celestial Orbital Rings
    celestialRevAngle += 0.00025;
    const centerX = width * 0.5 + parallaxX * 0.5;
    const centerY = height * 0.5 + parallaxY * 0.5;

    CELESTIAL_NODES.forEach((node) => {
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, node.dist, node.dist * 0.42, 0.2, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(0, 229, 255, 0.04)";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 12]);
      ctx.stroke();
      ctx.restore();

      // Node point revolving on orbit
      const curAngle = celestialRevAngle * (node.speed / 0.0002) + (node.dist * 0.01);
      const nx = centerX + Math.cos(curAngle) * node.dist;
      const ny = centerY + Math.sin(curAngle) * node.dist * 0.42;

      ctx.save();
      ctx.fillStyle = node.color;
      ctx.shadowColor = node.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(nx, ny, node.size, 0, Math.PI * 2);
      ctx.fill();

      // Subtle pulse ring
      const pulseSize = node.size + Math.sin(timestamp * 0.003 + node.dist) * 2;
      ctx.strokeStyle = node.color;
      ctx.lineWidth = 0.8;
      ctx.globalAlpha = 0.45;
      ctx.beginPath();
      ctx.arc(nx, ny, pulseSize + 4, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    });

    // 3. Twinkling & Revolving Stars
    for (let i = 0; i < stars.length; i++) {
      const s = stars[i];

      // Revolve star around cosmic center
      s.origAngle += s.revSpeed;
      const rawX = width * 0.5 + Math.cos(s.origAngle) * s.origDist;
      const rawY = height * 0.5 + Math.sin(s.origAngle) * s.origDist * 0.68;

      // Add mouse parallax proportional to star depth
      s.x = rawX - parallaxX * (s.z * 1.6);
      s.y = rawY - parallaxY * (s.z * 1.6);

      // Twinkle calculation
      const twinkle = Math.sin(timestamp * s.twinkleSpeed + s.twinklePhase);
      const alpha = Math.min(1, Math.max(0.1, s.baseAlpha * (0.68 + 0.32 * twinkle)));

      ctx.fillStyle = s.colorBase + alpha.toFixed(3) + ")";
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      ctx.fill();

      // Extra cross flare on very bright foreground stars
      if (s.size > 1.6 && alpha > 0.75) {
        ctx.strokeStyle = s.colorBase + (alpha * 0.35).toFixed(3) + ")";
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(s.x - s.size * 2.8, s.y);
        ctx.lineTo(s.x + s.size * 2.8, s.y);
        ctx.moveTo(s.x, s.y - s.size * 2.8);
        ctx.lineTo(s.x, s.y + s.size * 2.8);
        ctx.stroke();
      }
    }

    // 4. Interactive Constellation Lines Near Cursor
    if (mouse.isHovering) {
      const maxConnDist = 135;
      ctx.lineWidth = 0.75;
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        const dx = mouse.targetX - s.x;
        const dy = mouse.targetY - s.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < maxConnDist) {
          const strength = (1 - d / maxConnDist) * 0.38;
          ctx.strokeStyle = `rgba(0, 245, 255, ${strength})`;
          ctx.beginPath();
          ctx.moveTo(mouse.targetX, mouse.targetY);
          ctx.lineTo(s.x, s.y);
          ctx.stroke();
        }
      }
    }

    // 5. Meteors / Shooting Stars
    maybeSpawnMeteor();
    for (let i = meteors.length - 1; i >= 0; i--) {
      const m = meteors[i];
      m.x += m.vx;
      m.y += m.vy;
      m.life -= m.decay;

      if (m.life <= 0 || m.x > width + 100 || m.y > height + 100) {
        meteors.splice(i, 1);
        continue;
      }

      const tailX = m.x - (m.vx / Math.hypot(m.vx, m.vy)) * m.length;
      const tailY = m.y - (m.vy / Math.hypot(m.vx, m.vy)) * m.length;

      const meteorGrad = ctx.createLinearGradient(tailX, tailY, m.x, m.y);
      meteorGrad.addColorStop(0, "rgba(0, 229, 255, 0)");
      meteorGrad.addColorStop(0.7, m.color === "#00f5ff" ? "rgba(0, 245, 255, 0.4)" : "rgba(255, 170, 0, 0.4)");
      meteorGrad.addColorStop(1, `rgba(255, 255, 255, ${m.life})`);

      ctx.save();
      ctx.strokeStyle = meteorGrad;
      ctx.lineWidth = m.thickness * m.life;
      ctx.beginPath();
      ctx.moveTo(tailX, tailY);
      ctx.lineTo(m.x, m.y);
      ctx.stroke();

      // Leading head spark
      ctx.fillStyle = "#ffffff";
      ctx.shadowColor = m.color;
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(m.x, m.y, m.thickness * 1.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    requestAnimationFrame(renderSpace);
  }
  requestAnimationFrame(renderSpace);


  /* ========================================================
     2. DUAL COSMIC CURSOR & STARDUST TRAIL
     ======================================================== */
  const cursorDot = document.querySelector(".custom-cursor-dot");
  const cursorRing = document.querySelector(".custom-cursor-ring");

  let curX = -100;
  let curY = -100;
  let ringX = -100;
  let ringY = -100;
  let ringRotation = 0;
  let isCursorHovering = false;
  let isClicking = false;

  // Stardust Particles Container
  const stardustContainer = document.createElement("div");
  stardustContainer.className = "stardust-container";
  document.body.appendChild(stardustContainer);

  let lastSparkTime = 0;
  function spawnStardust(x, y) {
    const now = performance.now();
    if (now - lastSparkTime < 45) return; // limit spawn frequency
    lastSparkTime = now;

    const spark = document.createElement("div");
    spark.className = "stardust-spark";
    const size = 3 + Math.random() * 4;
    const colors = ["#00f5ff", "#a855f7", "#ffaa00", "#38bdf8", "#ffffff"];
    const col = colors[Math.floor(Math.random() * colors.length)];
    const driftX = (Math.random() - 0.5) * 22;
    const driftY = (Math.random() - 0.5) * 22 + 8;

    spark.style.width = `${size}px`;
    spark.style.height = `${size}px`;
    spark.style.left = `${x}px`;
    spark.style.top = `${y}px`;
    spark.style.background = col;
    spark.style.boxShadow = `0 0 8px ${col}`;
    spark.style.setProperty("--drift-x", `${driftX}px`);
    spark.style.setProperty("--drift-y", `${driftY}px`);

    stardustContainer.appendChild(spark);
    setTimeout(() => spark.remove(), 600);
  }

  window.addEventListener("mousemove", (e) => {
    curX = e.clientX;
    curY = e.clientY;
    if (cursorDot) {
      cursorDot.style.transform = `translate3d(${curX}px, ${curY}px, 0)`;
    }
    spawnStardust(curX, curY);
  });

  window.addEventListener("mousedown", () => {
    isClicking = true;
    if (cursorRing) cursorRing.classList.add("clicking");
    if (window.spaceAudio) window.spaceAudio.playClick();
  });

  window.addEventListener("mouseup", () => {
    isClicking = false;
    if (cursorRing) cursorRing.classList.remove("clicking");
  });

  // Smooth Ring Follower Loop
  function updateCursorRing() {
    ringX += (curX - ringX) * 0.18;
    ringY += (curY - ringY) * 0.18;
    ringRotation += isCursorHovering ? 3.5 : 1.2;

    if (cursorRing) {
      cursorRing.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) rotate(${ringRotation}deg) scale(${
        isClicking ? 0.8 : isCursorHovering ? 1.45 : 1
      })`;
    }
    requestAnimationFrame(updateCursorRing);
  }
  requestAnimationFrame(updateCursorRing);

  // Setup Hover States for Interactive Elements
  function bindInteractiveCursor() {
    const interactives = document.querySelectorAll(
      "button, a, input, select, .exp-card, .card, .chip, .nav-item, .btn-preset, .readout, .stat-card, canvas"
    );

    interactives.forEach((el) => {
      el.addEventListener("mouseenter", () => {
        isCursorHovering = true;
        if (cursorRing) cursorRing.classList.add("hover");
        if (cursorDot) cursorDot.classList.add("hover");
        if (window.spaceAudio) window.spaceAudio.playHover();
      });

      el.addEventListener("mouseleave", () => {
        isCursorHovering = false;
        if (cursorRing) cursorRing.classList.remove("hover");
        if (cursorDot) cursorDot.classList.remove("hover");
      });
    });
  }
  bindInteractiveCursor();

  // Re-bind when dynamic DOM elements are created
  const observer = new MutationObserver(() => bindInteractiveCursor());
  observer.observe(document.body, { childList: true, subtree: true });


  /* ========================================================
     3. TRANSLUCENT CARDS 3D TILT & SPECULAR SPOTLIGHT
     ======================================================== */
  function bindCardTiltAndSpotlight() {
    const cards = document.querySelectorAll(".card, .exp-card, .stat-card, .theory-card, .chart-box");

    cards.forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Set CSS variables for moving specular gradient highlight
        card.style.setProperty("--mouse-x", `${x}px`);
        card.style.setProperty("--mouse-y", `${y}px`);

        // Calculate 3D tilt
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = -((y - centerY) / centerY) * 6; // max 6 deg
        const rotateY = ((x - centerX) / centerX) * 6;

        card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(
          2
        )}deg) translateY(-4px)`;
      });

      card.addEventListener("mouseleave", () => {
        card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)`;
      });
    });
  }
  bindCardTiltAndSpotlight();
  setTimeout(bindCardTiltAndSpotlight, 500);

  /* ========================================================
     4. MISSION TIME & TELEMETRY CLOCK
     ======================================================== */
  function updateTelemetryClock() {
    const metEl = document.getElementById("hudMissionClock");
    if (!metEl) return;

    // Simulate elapsed mission time
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
