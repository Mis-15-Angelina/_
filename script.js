// script.js
const revealElements = document.querySelectorAll('.reveal');

const revealOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px"
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
const targetDate = new Date("Sep 11, 2026 21:00:00").getTime();

const updateCountdown = () => {
    const now = new Date().getTime();
    const distance = targetDate - now;

    if (distance < 0) {
        document.getElementById("days").innerText = "00";
        document.getElementById("hours").innerText = "00";
        document.getElementById("minutes").innerText = "00";
        document.getElementById("seconds").innerText = "00";
        return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    document.getElementById("days").innerText = days.toString().padStart(2, '0');
    document.getElementById("hours").innerText = hours.toString().padStart(2, '0');
    document.getElementById("minutes").innerText = minutes.toString().padStart(2, '0');
    document.getElementById("seconds").innerText = seconds.toString().padStart(2, '0');
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
        audioEl.play().catch(e => console.log("Audio play failed:", e));
        audioBtn.classList.add('playing');
        audioBtn.innerHTML = '<i class="fas fa-pause"></i>';
    }
    isPlaying = !isPlaying;
});

// Particles - Círculos "caminantes" de diferentes escalas
const canvas = document.getElementById('particles-canvas');
const ctx = canvas.getContext('2d');

let width, height, particles;

const initCanvas = () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    
    // Altura total del documento para generar partículas en todo el scroll
    const docHeight = Math.max(
        document.body.scrollHeight, document.documentElement.scrollHeight,
        document.body.offsetHeight, document.documentElement.offsetHeight,
        document.body.clientHeight, document.documentElement.clientHeight
    );
    window.docHeight = docHeight;
    
    particles = [];
    
    // Mantenemos una densidad constante basada en el tamaño de la pantalla y el alto total
    const density = 0.000012; 
    const numParticles = Math.floor(width * docHeight * density);
    
    for(let i = 0; i < numParticles; i++) {
        // 1. Aumentar ligeramente el tamaño
        const size = Math.random() * Math.random() * 120 + 50; 
        
        particles.push({
            worldX: Math.random() * width,
            worldY: Math.random() * docHeight, // Posición absoluta en el documento
            size: size,
            // 2. Incrementar ligeramente la velocidad
            speedY: (Math.random() - 0.5) * 0.7, 
            speedX: (Math.random() - 0.5) * 0.7,
            opacity: size > 25 ? (Math.random() * 0.05 + 0.02) : (Math.random() * 0.15 + 0.05)
        });
    }
};

const drawParticles = () => {
    ctx.clearRect(0, 0, width, height);
    
    // Obtenemos el nivel de scroll actual
    const scrollY = window.scrollY || window.pageYOffset;
    
    particles.forEach(p => {
        p.worldY -= p.speedY; 
        p.worldX += p.speedX;
        
        // Bucle continuo en todo el espacio del documento
        if (p.worldY < -p.size * 2) p.worldY = window.docHeight + p.size * 2;
        if (p.worldY > window.docHeight + p.size * 2) p.worldY = -p.size * 2;
        if (p.worldX < -p.size * 2) p.worldX = width + p.size * 2;
        if (p.worldX > width + p.size * 2) p.worldX = -p.size * 2;
        
        // 3. Transformación del mundo a la pantalla según el scroll
        const screenY = p.worldY - scrollY;
        
        // Solo renderizar si está dentro de la pantalla actual visible
        if (screenY > -p.size * 2 && screenY < height + p.size * 2) {
            ctx.beginPath();
            ctx.arc(p.worldX, screenY, p.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(130, 135, 140, ${p.opacity})`;
            ctx.fill();
        }
    });
    
    requestAnimationFrame(drawParticles);
};

window.addEventListener('resize', () => {
    initCanvas();
});

window.addEventListener('load', () => {
    initCanvas();
});

initCanvas();
drawParticles();
