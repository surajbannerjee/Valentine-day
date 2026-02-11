const canvas = document.getElementById('scene');
const ctx = canvas.getContext('2d');
const noBtn = document.getElementById('noBtn');
const yesBtn = document.getElementById('yesBtn');
const PARTICLE_COUNT = 3200; // slightly fewer → smoother on mobile
const HEART_SIZE = 15;

let width, height;
let particles = [];
let isCelebrated = false;
let time = 0;
let yesScale = 1;

const phrases = [
    "No", "Are you sure?", "Really?", "Think again!",
    "Last chance!", "Don't break my heart", "Pls?", "I have snacks!",
    "Look at the pretty button →", "Error 404: No not found"
];
let phraseIndex = 0;

window.onload = () => {
    resize();
    initParticles();
    animate();
};

window.addEventListener('resize', resize);
function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}

// Improved No button movement – stays in safer bounds
function moveNoButton() {
    if (isCelebrated) return;

    yesScale += 0.18;
    yesBtn.style.transform = `scale(${Math.min(yesScale, 2.2)})`;

    phraseIndex = (phraseIndex + 1) % phrases.length;
    noBtn.textContent = phrases[phraseIndex];

    const safeMargin = 120;
    const maxX = width - safeMargin * 2;
    const maxY = height - safeMargin * 2;

    const randomX = Math.random() * maxX - (maxX / 2);
    const randomY = Math.random() * maxY - (maxY / 2);

    noBtn.style.position = 'fixed';
    noBtn.style.left = '50%';
    noBtn.style.top = '50%';
    noBtn.style.transform = `translate(${randomX}px, ${randomY}px)`;
    noBtn.style.opacity = Math.max(0.4, 1 - phraseIndex * 0.09);
}

noBtn.addEventListener('mouseover', moveNoButton);
noBtn.addEventListener('click', moveNoButton);
noBtn.addEventListener('touchstart', e => {
    e.preventDefault();
    moveNoButton();
});

window.acceptProposal = () => {
    if (isCelebrated) return;
    isCelebrated = true;

    document.getElementById('mainUI').style.transition = 'opacity 1.4s ease';
    document.getElementById('mainUI').style.opacity = '0';
    document.getElementById('mainUI').style.pointerEvents = 'none';

    const success = document.getElementById('successScreen');
    success.style.opacity = '1';
    success.querySelector('h2').style.transform = 'scale(1)';

    createHeartRain();
    explodeParticles();
};

function createHeartRain() {
    const container = document.body;
    const hearts = ['❤️', '💖', '💕', '💗', '💞'];

    const interval = setInterval(() => {
        if (!isCelebrated) { clearInterval(interval); return; }

        const heart = document.createElement('div');
        heart.className = 'heart-rain';
        heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];

        heart.style.left = Math.random() * 100 + 'vw';
        heart.style.animationDuration = (Math.random() * 3 + 4) + 's';
        heart.style.opacity = Math.random() * 0.4 + 0.6;

        container.appendChild(heart);
        setTimeout(() => heart.remove(), 8000);
    }, 180);
}

function explodeParticles() {
    particles.forEach(p => {
        p.vx = (Math.random() - 0.5) * 18;
        p.vy = (Math.random() - 0.5) * 18;
        p.vz = (Math.random() - 0.5) * 14;
        p.friction = 0.965;
    });
}

// ─── Particle & Animation logic (mostly unchanged, just minor perf tweaks) ───
class Particle { /* ... same as your original ... */ }

function initParticles() { /* ... same ... */ }

let rotX = 0, rotY = 0;
let targetRotX = 0, targetRotY = 0;
let mouse = { x: 0, y: 0 };

document.addEventListener('mousemove', e => {
    mouse.x = (e.clientX - width / 2) * 0.0008;
    mouse.y = (e.clientY - height / 2) * 0.0008;
});

function animate() {
    requestAnimationFrame(animate);

    ctx.fillStyle = 'rgba(15, 2, 5, 0.35)';
    ctx.fillRect(0, 0, width, height);

    time += 0.018;

    let beat = Math.pow(Math.sin(time * 3.2), 80) * 0.4 + Math.sin(time * 3.2 + 0.6) * 0.12;

    targetRotY += 0.0025;
    rotY += (targetRotY + mouse.x - rotY) * 0.06;
    rotX += (mouse.y - rotX) * 0.06;

    ctx.globalCompositeOperation = 'lighter';
    particles.forEach(p => {
        p.update(beat);
        p.draw(ctx, rotX, rotY);
    });
    ctx.globalCompositeOperation = 'source-over';
}
