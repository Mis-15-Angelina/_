// script.js
const revealElements = document.querySelectorAll('.reveal');

const revealOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('active');
        observer.unobserve(entry.target);
    });
}, revealOptions);

revealElements.forEach(el => revealObserver.observe(el));

// Countdown
const targetDate = new Date('2026-09-11T21:00:00').getTime();
const countdownElements = {
    days: document.getElementById('days'),
    hours: document.getElementById('hours'),
    minutes: document.getElementById('minutes'),
    seconds: document.getElementById('seconds')
};

const updateCountdown = () => {
    const now = new Date().getTime();
    const distance = targetDate - now;

    if (distance < 0) {
        Object.entries(countdownElements).forEach(([_, el]) => {
            el.innerText = '00';
        });
        return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    const values = {
        days: days.toString().padStart(2, '0'),
        hours: hours.toString().padStart(2, '0'),
        minutes: minutes.toString().padStart(2, '0'),
        seconds: seconds.toString().padStart(2, '0')
    };

    Object.entries(values).forEach(([key, value]) => {
        const el = countdownElements[key];
        if (el.innerText !== value) {
            el.classList.remove('is-changing');
            void el.offsetWidth;
            el.classList.add('is-changing');
            el.innerText = value;
        }
    });
};

setInterval(updateCountdown, 1000);
updateCountdown();

// Audio
const audioBtn = document.getElementById('audio-toggle');
const audioEl = document.getElementById('bg-music');
let isPlaying = false;

audioBtn.addEventListener('click', () => {
    if (isPlaying) {
        audioEl.pause();
        audioBtn.classList.remove('playing');
        audioBtn.innerHTML = '<i class="fas fa-play"></i>';
    } else {
        audioEl.play().catch(() => {});
        audioBtn.classList.add('playing');
        audioBtn.innerHTML = '<i class="fas fa-pause"></i>';
    }
    isPlaying = !isPlaying;
});


// Particles background with continuous motion
const canvas = document.getElementById('particles-canvas');
const ctx = canvas.getContext('2d');

let width = 0;
let height = 0;
let particles = [];
let animationFrameId = null;
let lastTime = 0;

const createParticle = () => {
    const size = Math.random() * Math.random() * 110 + 24;
    return {
        x: Math.random() * width,
        y: Math.random() * height,
        size,
        speedX: (Math.random() - 0.5) * 0.35,
        speedY: (Math.random() - 0.5) * 0.35,
        opacity: size > 45 ? Math.random() * 0.04 + 0.02 : Math.random() * 0.1 + 0.04,
        drift: Math.random() * Math.PI * 2,
        // Nuevo atributo: 50% de probabilidad de ser true o false
        isStroke: Math.random() > 0.5 
    };
};

const initCanvas = () => {
    const dpr = window.devicePixelRatio || 1;
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const desiredCount = Math.max(20, Math.floor((width * height) / 18000));
    if (particles.length < desiredCount) {
        while (particles.length < desiredCount) {
            particles.push(createParticle());
        }
    } else {
        // Solo limitamos la cantidad máxima, sin sobreescribir sus posiciones actuales
        particles.length = desiredCount;
    }
};

const drawParticles = (now) => {
    if (!lastTime) lastTime = now;
    const delta = Math.min(32, now - lastTime);
    lastTime = now;

    ctx.clearRect(0, 0, width, height);

    particles.forEach(particle => {
        particle.x += particle.speedX * delta * 0.06;
        particle.y += particle.speedY * delta * 0.06;
        particle.x += Math.sin(now * 0.0004 + particle.drift) * 0.15;
        particle.y += Math.cos(now * 0.00035 + particle.drift) * 0.15;

        if (particle.x < -particle.size * 2) particle.x = width + particle.size * 2;
        if (particle.x > width + particle.size * 2) particle.x = -particle.size * 2;
        if (particle.y < -particle.size * 2) particle.y = height + particle.size * 2;
        if (particle.y > height + particle.size * 2) particle.y = -particle.size * 2;

        const alpha = particle.opacity * (2 + 0.5 * Math.sin(now * 0.0006 + particle.drift));
        
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        
        // Guardamos el color en una variable para no repetirlo
        const color = `rgba(188, 210, 232, ${alpha.toFixed(4)})`;

        // Evaluamos el atributo de la partícula
        if (particle.isStroke) {
            ctx.strokeStyle = color;
            ctx.lineWidth = 1.5; // Puedes ajustar el grosor de la línea aquí
            ctx.stroke();
        } else {
            ctx.fillStyle = color;
            ctx.fill();
        }
    });

    animationFrameId = requestAnimationFrame(drawParticles);
};

const startParticles = () => {
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    initCanvas();
    lastTime = 0;
    animationFrameId = requestAnimationFrame(drawParticles);
};

let currentWidth = window.innerWidth;
window.addEventListener('resize', () => {
    if (window.innerWidth !== currentWidth) {
        currentWidth = window.innerWidth;
        startParticles();
    }
});
window.addEventListener('load', startParticles);

startParticles();
