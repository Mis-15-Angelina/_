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
let lastTime = 0;

const createParticle = () => {
    const size = Math.random() * Math.random() * 110 + 24;
    return {
        // Usamos (width || window.innerWidth) como respaldo seguro en la creación inicial
        x: Math.random() * (width || window.innerWidth),
        y: Math.random() * (height || window.innerHeight),
        size,
        speedX: (Math.random() - 0.5) * 0.35,
        speedY: (Math.random() - 0.5) * 0.35,
        opacity: size > 45 ? Math.random() * 0.04 + 0.02 : Math.random() * 0.1 + 0.04,
        drift: Math.random() * Math.PI * 2,
        isStroke: Math.random() > 0.5 
    };
};

// Nueva función que redimensiona el canvas de forma fluida sin reiniciar la animación
const resizeCanvas = () => {
    const dpr = window.devicePixelRatio || 1;
    const newWidth = canvas.clientWidth;
    const newHeight = canvas.clientHeight;

    // Solo actualizamos si las dimensiones realmente cambiaron
    if (width !== newWidth || height !== newHeight) {
        width = newWidth;
        height = newHeight;
        
        // Ajustamos la resolución interna del canvas
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        // Calculamos cuántas partículas necesitamos
        const desiredCount = Math.max(20, Math.floor((width * height) / 18000));
        
        // Si la pantalla se agrandó y faltan partículas, sumamos nuevas
        while (particles.length < desiredCount) {
            particles.push(createParticle());
        }
        // Nota: Si la pantalla se achica, no borramos las partículas sobrantes de golpe, 
        // dejamos que sigan flotando y se reacomoden solas al salir de los bordes.
    }
};

const drawParticles = (now) => {
    if (!lastTime) lastTime = now;
    const delta = Math.min(32, now - lastTime); // Limitamos el salto de tiempo
    lastTime = now;

    ctx.clearRect(0, 0, width, height);

    particles.forEach(particle => {
        particle.x += particle.speedX * delta * 0.06;
        particle.y += particle.speedY * delta * 0.06;
        particle.x += Math.sin(now * 0.0004 + particle.drift) * 0.15;
        particle.y += Math.cos(now * 0.00035 + particle.drift) * 0.15;

        // Si salen de la pantalla, las hacemos aparecer por el otro lado de manera fluida
        if (particle.x < -particle.size * 2) particle.x = width + particle.size * 2;
        if (particle.x > width + particle.size * 2) particle.x = -particle.size * 2;
        if (particle.y < -particle.size * 2) particle.y = height + particle.size * 2;
        if (particle.y > height + particle.size * 2) particle.y = -particle.size * 2;

        const alpha = particle.opacity * (2 + 0.5 * Math.sin(now * 0.0006 + particle.drift));
        
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        
        const color = `rgba(188, 210, 232, ${alpha.toFixed(4)})`;

        if (particle.isStroke) {
            ctx.strokeStyle = color;
            ctx.lineWidth = 1.5;
            ctx.stroke();
        } else {
            ctx.fillStyle = color;
            ctx.fill();
        }
    });

    // Continuamos el loop infinito sin frenarlo nunca
    requestAnimationFrame(drawParticles);
};

// Configuramos las medidas iniciales
resizeCanvas();

// Encendemos el motor de animación una sola vez y para siempre
requestAnimationFrame(drawParticles);

// Al cambiar el tamaño de pantalla, solo acomodamos el lienzo
window.addEventListener('resize', resizeCanvas);
window.addEventListener('load', startParticles);

startParticles();
