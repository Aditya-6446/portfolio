(() => {
  "use strict";
  const menuButton = document.querySelector(".menu-toggle");
  const menu = document.querySelector("#main-nav");
  const closeMenu = () => {
    menu.classList.remove("is-open");
    menuButton.setAttribute("aria-expanded", "false");
  };
  menuButton.addEventListener("click", () => {
    const open = menuButton.getAttribute("aria-expanded") !== "true";
    menuButton.setAttribute("aria-expanded", String(open));
    menu.classList.toggle("is-open", open);
  });
  menu.addEventListener("click", (event) => {
    if (event.target.closest("a")) closeMenu();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menu.classList.contains("is-open")) {
      closeMenu();
      menuButton.focus();
    }
  });
  document.addEventListener("click", (event) => {
    if (!event.target.closest(".site-header")) closeMenu();
  });
  document.querySelector("#year").textContent = new Date().getFullYear();

  const canvas = document.querySelector("#network");
  const context = canvas.getContext("2d");
  if (!context) return;
  const motionButton = document.querySelector("#motion-toggle");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let manualPause = false;
  try {
    manualPause = localStorage.getItem("portfolio-motion-paused") === "true";
  } catch (_) {
    /* Storage is optional. */
  }
  let width = 0,
    height = 0,
    nodes = [],
    edges = [],
    sections = [],
    frame = 0,
    lastTime = 0,
    elapsed = 0,
    layoutPending = false;
  const paused = () => reducedMotion.matches || manualPause;
  const random = (seed) => {
    const v = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
    return v - Math.floor(v);
  };
  const tones = { dark: [161, 182, 198, 0.23], light: [61, 86, 105, 0.16] };
  const mix = (a, b, amount) =>
    a.map((value, i) => value + (b[i] - value) * amount);
  function toneAt(y) {
    let index = sections.findIndex((section) => y < section.bottom);
    if (index < 0) index = sections.length - 1;
    if (index < 0) return tones.dark;
    const current = sections[index];
    const blend = 65;
    if (index > 0 && y < current.top + blend)
      return mix(
        tones[sections[index - 1].theme],
        tones[current.theme],
        Math.min(1, (y - current.top + blend) / (blend * 2)),
      );
    if (index < sections.length - 1 && y > current.bottom - blend)
      return mix(
        tones[current.theme],
        tones[sections[index + 1].theme],
        Math.max(0, (y - current.bottom + blend) / (blend * 2)),
      );
    return tones[current.theme];
  }
  const rgba = (tone, factor = 1) =>
    `rgba(${tone[0].toFixed(0)},${tone[1].toFixed(0)},${tone[2].toFixed(0)},${Math.min(0.65, tone[3] * factor).toFixed(3)})`;
  function measure() {
    layoutPending = false;
    width = window.innerWidth;
    height = window.innerHeight;
    const ratio = Math.min(window.devicePixelRatio || 1, 1.75);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    sections = [...document.querySelectorAll("[data-theme]")].map((element) => {
      const rect = element.getBoundingClientRect();
      return {
        top: rect.top + window.scrollY,
        bottom: rect.bottom + window.scrollY,
        theme: element.dataset.theme,
      };
    });
    const columns = Math.max(2, Math.round(width / 245));
    const cellWidth = width / columns,
      cellHeight = width < 600 ? 235 : 245;
    const rows =
      Math.ceil(document.documentElement.scrollHeight / cellHeight) + 2;
    nodes = [];
    edges = [];
    for (let row = 0; row < rows; row++)
      for (let column = 0; column <= columns; column++) {
        const seed = row * 97 + column * 17 + 23;
        nodes.push({
          x: column * cellWidth + (random(seed) - 0.5) * cellWidth * 0.75,
          y: row * cellHeight + (random(seed + 1) - 0.5) * cellHeight * 0.75,
          phase: random(seed + 2) * Math.PI * 2,
          size: 0.9 + random(seed + 3) * 1.1,
        });
      }
    nodes.forEach((node, index) => {
      [index + 1, index + columns + 1, index + columns + 2].forEach((next) => {
        if (
          next < nodes.length &&
          Math.hypot(node.x - nodes[next].x, node.y - nodes[next].y) < 340 &&
          random(index * 7 + next) > 0.26
        )
          edges.push([index, next]);
      });
    });
    draw();
  }
  function draw() {
    context.clearRect(0, 0, width, height);
    const scroll = window.scrollY;
    const positions = nodes.map((node) => ({
      x: node.x + Math.sin(elapsed * 0.16 + node.phase) * 9,
      y: node.y - scroll + Math.cos(elapsed * 0.12 + node.phase) * 11,
    }));
    context.lineWidth = 0.65;
    for (const [from, to] of edges) {
      const a = positions[from],
        b = positions[to];
      if (Math.max(a.y, b.y) < -30 || Math.min(a.y, b.y) > height + 30)
        continue;
      const gradient = context.createLinearGradient(a.x, a.y, b.x, b.y);
      gradient.addColorStop(0, rgba(toneAt(a.y + scroll)));
      gradient.addColorStop(1, rgba(toneAt(b.y + scroll)));
      context.strokeStyle = gradient;
      context.beginPath();
      context.moveTo(a.x, a.y);
      context.lineTo(b.x, b.y);
      context.stroke();
    }
    positions.forEach((point, index) => {
      if (point.y < -20 || point.y > height + 20) return;
      context.fillStyle = rgba(toneAt(point.y + scroll), 2.1);
      context.beginPath();
      context.arc(point.x, point.y, nodes[index].size, 0, Math.PI * 2);
      context.fill();
    });
  }
  function animate(time) {
    if (paused() || document.hidden) {
      frame = 0;
      lastTime = 0;
      return;
    }
    if (lastTime) elapsed += Math.min((time - lastTime) / 1000, 0.05);
    lastTime = time;
    draw();
    frame = requestAnimationFrame(animate);
  }
  function syncMotion() {
    cancelAnimationFrame(frame);
    frame = 0;
    lastTime = 0;
    motionButton.setAttribute("aria-pressed", String(paused()));
    motionButton.textContent = reducedMotion.matches
      ? "Reduced motion enabled"
      : manualPause
        ? "Resume background motion"
        : "Pause background motion";
    motionButton.disabled = reducedMotion.matches;
    draw();
    if (!paused() && !document.hidden) frame = requestAnimationFrame(animate);
  }
  motionButton.addEventListener("click", () => {
    manualPause = !manualPause;
    try {
      localStorage.setItem("portfolio-motion-paused", String(manualPause));
    } catch (_) {}
    syncMotion();
  });
  reducedMotion.addEventListener("change", syncMotion);
  document.addEventListener("visibilitychange", syncMotion);
  window.addEventListener(
    "scroll",
    () => {
      if (paused() || !frame) draw();
    },
    { passive: true },
  );
  const queueMeasure = () => {
    if (!layoutPending) {
      layoutPending = true;
      requestAnimationFrame(measure);
    }
  };
  window.addEventListener("resize", queueMeasure, { passive: true });
  new ResizeObserver(queueMeasure).observe(document.querySelector("main"));
  document.fonts.ready.then(queueMeasure);
  measure();
  syncMotion();
})();
