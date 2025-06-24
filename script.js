const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let width, height;
let particles = [];
const PARTICLE_COUNT = 120;
const PARTICLE_RADIUS = 3;
const LINK_DISTANCE = 120;

function random(min, max) {
  return Math.random() * (max - min) + min;
}

function Particle() {
  this.x = random(0, width);
  this.y = random(0, height);
  this.vx = random(-0.4, 0.4);
  this.vy = random(-0.4, 0.4);
  this.radius = PARTICLE_RADIUS;
  this.opacity = random(0.3, 0.8);
}

Particle.prototype.draw = function() {
  ctx.beginPath();
  ctx.fillStyle = `rgba(127,133,255,${this.opacity})`;
  ctx.shadowColor = `rgba(127,133,255,${this.opacity})`;
  ctx.shadowBlur = 5;
  ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2);
  ctx.fill();
};

Particle.prototype.update = function() {
  this.x += this.vx;
  this.y += this.vy;

  if(this.x < 0 || this.x > width) this.vx = -this.vx;
  if(this.y < 0 || this.y > height) this.vy = -this.vy;
};

function connectParticles() {
  for(let a = 0; a < particles.length; a++) {
    for(let b = a + 1; b < particles.length; b++) {
      let dx = particles[a].x - particles[b].x;
      let dy = particles[a].y - particles[b].y;
      let dist = Math.sqrt(dx*dx + dy*dy);
      if(dist < LINK_DISTANCE) {
        let opacityLine = (LINK_DISTANCE - dist) / LINK_DISTANCE * 0.4;
        ctx.strokeStyle = `rgba(127,133,255,${opacityLine})`;
        ctx.lineWidth = 1;
        ctx.shadowColor = `rgba(127,133,255,${opacityLine})`;
        ctx.shadowBlur = 2;
        ctx.beginPath();
        ctx.moveTo(particles[a].x, particles[a].y);
        ctx.lineTo(particles[b].x, particles[b].y);
        ctx.stroke();
      }
    }
  }
}

// Mouse interaction
const mouse = {
  x: null,
  y: null,
  radius: 120
};

window.addEventListener('mousemove', e => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

function handleParticlesInteraction() {
  particles.forEach(p => {
    let dx = p.x - mouse.x;
    let dy = p.y - mouse.y;
    let dist = Math.sqrt(dx*dx + dy*dy);

    if(dist < mouse.radius) {
      let angle = Math.atan2(dy, dx);
      let force = (mouse.radius - dist) / mouse.radius * 0.7;

      p.vx += Math.cos(angle) * force;
      p.vy += Math.sin(angle) * force;
    }

    // Slow down velocity gradually
    p.vx *= 0.92;
    p.vy *= 0.92;
  });
}

function animate() {
  ctx.clearRect(0, 0, width, height);
  particles.forEach(p => {
    p.update();
    p.draw();
  });
  connectParticles();
  handleParticlesInteraction();
  requestAnimationFrame(animate);
}

function init() {
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width;
  canvas.height = height;

  particles = [];
  for(let i=0; i < PARTICLE_COUNT; i++) {
    particles.push(new Particle());
  }
  animate();
}

window.addEventListener('resize', init);
init();


// --- Tension form logic ---

const form = document.getElementById('tensionForm');
const resultDiv = document.getElementById('result');

form.addEventListener('submit', e => {
  e.preventDefault();

  const R = parseFloat(form.resistance.value);
  const I = parseFloat(form.intensite.value);

  if(isNaN(R) || isNaN(I) || R < 0 || I < 0) {
    resultDiv.textContent = '⚠️ Entrez des valeurs valides et positives.';
    resultDiv.classList.add('visible');
    return;
  }

  // Animation numérique pour le résultat
  const tension = R * I;
  let current = 0;
  const duration = 1200; // ms
  const startTime = performance.now();

  function animateResult(time) {
    const elapsed = time - startTime;
    if(elapsed < duration) {
      current = (elapsed / duration) * tension;
      resultDiv.textContent = `U = ${current.toFixed(2)} Volt`;
      resultDiv.classList.add('visible');
      requestAnimationFrame(animateResult);
    } else {
      resultDiv.textContent = `U = ${tension.toFixed(2)} Volt`;
      resultDiv.classList.add('visible');
    }
  }

  requestAnimationFrame(animateResult);
});
