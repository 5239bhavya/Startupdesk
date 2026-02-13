/**
 * Cursor-Reactive Background Animation
 * Canvas-based particle system with parallax depth layers, blending effects, and performance optimization
 */

interface AnimationConfig {
  maxParticles?: number;
  layerCount?: number;
  colors?: string[];
  particleSize?: number;
  blur?: number;
  opacity?: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  life: number;
  layer: number;
  opacity: number;
}

interface AnimationState {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  particles: Particle[];
  mouseX: number;
  mouseY: number;
  cursorActive: boolean;
  idleTimer: number;
  animationFrameId: number | null;
  isVisible: boolean;
  config: Required<AnimationConfig>;
}

let animationState: AnimationState | null = null;

const DEFAULT_CONFIG: Required<AnimationConfig> = {
  maxParticles: 16,
  layerCount: 3,
  colors: ["#7C5CFF", "#B76BFF", "#FF7A6B"],
  particleSize: 60,
  blur: 40,
  opacity: 0.15,
};

function prepareCanvas(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();

  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;

  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) throw new Error("Could not get canvas context");

  ctx.scale(dpr, dpr);
  ctx.filter = `blur(${animationState?.config.blur || 40}px)`;

  return ctx;
}

function createParticle(mouseX: number, mouseY: number, layer: number): Particle {
  const config = animationState!.config;
  const angle = Math.random() * Math.PI * 2;
  const speed = 0.5 + Math.random() * 1.5;
  const parallaxFactor = layer === 0 ? 1.2 : layer === 1 ? 0.8 : 0.5;

  return {
    x: mouseX + (Math.random() - 0.5) * 100,
    y: mouseY + (Math.random() - 0.5) * 100,
    vx: Math.cos(angle) * speed * parallaxFactor,
    vy: Math.sin(angle) * speed * parallaxFactor,
    size: config.particleSize * (0.6 + Math.random() * 0.8),
    color: config.colors[Math.floor(Math.random() * config.colors.length)],
    life: 1,
    layer: layer,
    opacity: config.opacity,
  };
}

function updateParticles(mouseX: number, mouseY: number): void {
  const config = animationState!.config;
  const gravity = 0.98;

  // Add new particles on cursor movement
  if (animationState!.particles.length < config.maxParticles) {
    for (let i = 0; i < 2; i++) {
      const layer = Math.floor(Math.random() * config.layerCount);
      animationState!.particles.push(createParticle(mouseX, mouseY, layer));
    }
  }

  // Update existing particles
  animationState!.particles = animationState!.particles.filter((p) => {
    p.life -= 0.02;

    if (p.life <= 0) return false;

    // Apply velocity with cursor pull effect
    const dx = mouseX - p.x;
    const dy = mouseY - p.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Gentle cursor pull (inverse function of distance)
    if (distance < 400) {
      const pull = (1 - distance / 400) * 0.05;
      p.vx += (dx / distance) * pull;
      p.vy += (dy / distance) * pull;
    }

    // Apply velocity
    p.x += p.vx;
    p.y += p.vy;
    p.vy *= gravity;

    // Idle drift when cursor inactive
    if (!animationState!.cursorActive) {
      p.vx += (Math.random() - 0.5) * 0.02;
      p.vy += (Math.random() - 0.5) * 0.02;
    }

    return true;
  });
}

function drawParticles(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): void {
  const particles = animationState!.particles;

  // Draw background
  ctx.fillStyle = "rgba(38, 39, 44, 0)";
  ctx.fillRect(0, 0, width, height);

  // Set blending mode to screen/additive
  ctx.globalCompositeOperation = "screen";

  // Sort particles by layer for proper depth ordering
  particles.sort((a, b) => a.layer - b.layer);

  // Draw particles
  for (const p of particles) {
    ctx.globalAlpha = p.opacity * p.life;
    ctx.fillStyle = p.color;

    // Radial gradient for soft blob effect
    const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
    gradient.addColorStop(0, `${p.color}80`);
    gradient.addColorStop(0.7, `${p.color}40`);
    gradient.addColorStop(1, `${p.color}00`);

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "source-over";
}

function animate(mouseX: number, mouseY: number): void {
  if (!animationState || !animationState.isVisible) return;

  const canvas = animationState.canvas;
  const ctx = animationState.ctx;
  const rect = canvas.getBoundingClientRect();

  updateParticles(mouseX, mouseY);
  drawParticles(ctx, rect.width, rect.height);

  animationState.animationFrameId = requestAnimationFrame(() => {
    animate(mouseX, mouseY);
  });
}

function onMouseMove(e: MouseEvent): void {
  if (!animationState) return;

  const rect = animationState.canvas.getBoundingClientRect();
  animationState.mouseX = e.clientX - rect.left;
  animationState.mouseY = e.clientY - rect.top;
  animationState.cursorActive = true;

  // Reset idle timer
  clearTimeout(animationState.idleTimer);
  animationState.idleTimer = window.setTimeout(() => {
    animationState!.cursorActive = false;
  }, 3000);

  // Start animation if not running
  if (animationState.animationFrameId === null) {
    animate(animationState.mouseX, animationState.mouseY);
  }
}

function onPageVisibilityChange(): void {
  if (!animationState) return;

  animationState.isVisible = document.visibilityState === "visible";

  if (!animationState.isVisible && animationState.animationFrameId !== null) {
    cancelAnimationFrame(animationState.animationFrameId);
    animationState.animationFrameId = null;
  }
}

function checkReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function initializeCursorReactive(
  containerId: string,
  config: AnimationConfig = DEFAULT_CONFIG
): void {
  // Check for reduced motion preference
  if (checkReducedMotion()) {
    console.log("Cursor-reactive animation disabled (prefers-reduced-motion)");
    return;
  }

  const container = document.getElementById(containerId);
  if (!container) {
    console.warn(`Container ${containerId} not found`);
    return;
  }

  const canvas = document.createElement("canvas");
  canvas.style.display = "block";
  canvas.style.width = "100%";
  canvas.style.height = "100vh";
  canvas.style.position = "fixed";
  canvas.style.top = "0";
  canvas.style.left = "0";
  canvas.style.zIndex = "-1";
  canvas.style.pointerEvents = "none";

  container.appendChild(canvas);

  const ctx = prepareCanvas(canvas);

  animationState = {
    canvas,
    ctx,
    particles: [],
    mouseX: window.innerWidth / 2,
    mouseY: window.innerHeight / 2,
    cursorActive: false,
    idleTimer: 0,
    animationFrameId: null,
    isVisible: document.visibilityState === "visible",
    config: { ...DEFAULT_CONFIG, ...config },
  };

  // Event listeners
  document.addEventListener("mousemove", onMouseMove);
  document.addEventListener("visibilitychange", onPageVisibilityChange);

  // Start animation
  animate(animationState.mouseX, animationState.mouseY);
}

export function destroyCursorReactive(): void {
  if (!animationState) return;

  // Remove event listeners
  document.removeEventListener("mousemove", onMouseMove);
  document.removeEventListener("visibilitychange", onPageVisibilityChange);

  // Cancel animation frame
  if (animationState.animationFrameId !== null) {
    cancelAnimationFrame(animationState.animationFrameId);
  }

  // Clear idle timer
  clearTimeout(animationState.idleTimer);

  // Remove canvas
  animationState.canvas.remove();

  animationState = null;
}
