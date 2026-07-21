// --- Supabase Configuration ---
const supabaseUrl = 'https://kjueneqrfkjvfryighxh.supabase.co';
const supabaseKey = 'sb_publishable_wjONHJwXDarPA7vr-WWe9g_Kg6ZClLd';
const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

// --- Envelope Opening Animation (GSAP + Confetti) ---
const envelopeContainer = document.getElementById('envelope-container');
const envelope = document.querySelector('.envelope');
const mainContent = document.getElementById('main-content');
const weddingMusic = document.getElementById('wedding-music');
const musicToggle = document.getElementById('music-toggle');
const musicIcon = musicToggle.querySelector('i');

// Track if music is playing
let isMusicPlaying = false;
let isFirstPlay = true;

const playMusic = () => {
    if (isFirstPlay) {
        weddingMusic.currentTime = 27;
        isFirstPlay = false;
    }
    weddingMusic.play().then(() => {
        isMusicPlaying = true;
        musicIcon.className = 'fa-solid fa-compact-disc fa-spin'; // Spin animation when playing
    }).catch(err => console.log("Music play blocked by browser:", err));
};

const pauseMusic = () => {
    weddingMusic.pause();
    isMusicPlaying = false;
    musicIcon.className = 'fa-solid fa-music';
};

// Open Envelope Trigger
const openEnvelope = () => {
    if (envelope.classList.contains('open')) return;

    envelope.classList.add('open');
    
    // Play Background Music
    playMusic();

    // Trigger Canvas Confetti
    if (typeof confetti === 'function') {
        // First burst
        confetti({
            particleCount: 150,
            spread: 80,
            origin: { y: 0.6 }
        });
        
        // Second burst slightly after
        setTimeout(() => {
            confetti({
                particleCount: 80,
                angle: 60,
                spread: 55,
                origin: { x: 0 }
            });
            confetti({
                particleCount: 80,
                angle: 120,
                spread: 55,
                origin: { x: 1 }
            });
        }, 400);
    }

    // GSAP Transition to Main Site
    gsap.timeline()
        .to(envelopeContainer, {
            opacity: 0,
            duration: 1.2,
            delay: 1.5,
            ease: "power2.out",
            onComplete: () => {
                envelopeContainer.style.display = 'none';
                mainContent.classList.add('visible');
                
                // Trigger Leaflet Map rendering fix (required since map was hidden)
                if (map) {
                    map.invalidateSize();
                }
                
                // Animate Hero Content
                gsap.from(".gs-fade-up", {
                    opacity: 0,
                    y: 40,
                    duration: 1.2,
                    stagger: 0.2,
                    ease: "power3.out"
                });
            }
        });
};

document.querySelector('.envelope-wrapper').addEventListener('click', openEnvelope);

// --- Music Toggle ---
musicToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    if (isMusicPlaying) {
        pauseMusic();
    } else {
        playMusic();
    }
});

// --- Theme Switcher (Dark/Light) ---
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = themeToggle.querySelector('i');
const htmlEl = document.documentElement;

themeToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    const currentTheme = htmlEl.getAttribute('data-theme');
    let newTheme = 'dark';
    
    if (currentTheme === 'dark') {
        newTheme = 'light';
        themeIcon.className = 'fa-solid fa-sun';
    } else {
        themeIcon.className = 'fa-solid fa-moon';
    }
    
    htmlEl.setAttribute('data-theme', newTheme);
    
    // Smoothly transition leaflet map tiles if initialized
    if (map) {
        updateMapTiles(newTheme);
    }
});

// --- Floating Rose Petals & Mouse Sparkles Canvas Effect ---
const canvas = document.getElementById('effects-canvas');
const ctx = canvas.getContext('2d');

let particles = [];
let sparkles = [];

// Resize Canvas
const resizeCanvas = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
};
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Rose Petal Particle Class
class RosePetalParticle {
    constructor() {
        this.reset();
        this.y = Math.random() * canvas.height; // scatter initially
    }

    reset() {
        this.x = Math.random() * canvas.width;
        this.y = -20;
        this.size = Math.random() * 12 + 8;
        this.speedY = Math.random() * 1 + 0.8;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.opacity = Math.random() * 0.6 + 0.3;
        this.rotation = Math.random() * 360;
        this.rotationSpeed = (Math.random() - 0.5) * 1.5;
        // Swing movement (organic drifting)
        this.swingAmount = Math.random() * 1.5 + 0.5;
        this.swingSpeed = Math.random() * 0.02 + 0.01;
        this.swingStep = Math.random() * 100;
        // Color variation (soft romantic rose shades)
        const roseColors = [
            'rgba(255, 183, 197, opacity)', // Soft Pink
            'rgba(255, 153, 172, opacity)', // Blush Pink
            'rgba(250, 218, 221, opacity)', // Pale Dogwood
            'rgba(255, 204, 213, opacity)'  // Lavender Rose
        ];
        this.colorTemplate = roseColors[Math.floor(Math.random() * roseColors.length)];
    }

    update() {
        this.y += this.speedY;
        this.swingStep += this.swingSpeed;
        this.x += this.speedX + Math.sin(this.swingStep) * this.swingAmount;
        this.rotation += this.rotationSpeed;
        
        if (this.y > canvas.height + 20) {
            this.reset();
        }
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate((this.rotation * Math.PI) / 180);
        
        // Draw realistic petal shape using curves
        ctx.fillStyle = this.colorTemplate.replace('opacity', this.opacity);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(-this.size, -this.size / 2, -this.size, this.size, 0, this.size);
        ctx.bezierCurveTo(this.size, this.size, this.size, -this.size / 2, 0, 0);
        ctx.fill();
        
        // Highlight line on petal
        ctx.strokeStyle = `rgba(255, 255, 255, ${this.opacity * 0.3})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(-this.size * 0.2, this.size * 0.5, 0, this.size);
        ctx.stroke();
        
        ctx.restore();
    }
}

// Sparkle Particle (Mouse Tail)
class SparkleParticle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 5 + 3;
        this.speedX = (Math.random() - 0.5) * 1.5;
        this.speedY = (Math.random() - 0.5) * 1.5;
        this.color = getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim();
        this.alpha = 1;
        this.decay = Math.random() * 0.025 + 0.015;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.alpha -= this.decay;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        // Draw 4-point star sparkle
        ctx.moveTo(this.x, this.y - this.size);
        ctx.quadraticCurveTo(this.x, this.y, this.x + this.size, this.y);
        ctx.quadraticCurveTo(this.x, this.y, this.x, this.y + this.size);
        ctx.quadraticCurveTo(this.x, this.y, this.x - this.size, this.y);
        ctx.quadraticCurveTo(this.x, this.y, this.x, this.y - this.size);
        ctx.fill();
        ctx.restore();
    }
}

// Populate Floating Particles
for (let i = 0; i < 30; i++) {
    particles.push(new RosePetalParticle());
}

// Track mouse movement
window.addEventListener('mousemove', (e) => {
    for (let i = 0; i < 2; i++) {
        sparkles.push(new SparkleParticle(e.clientX, e.clientY));
    }
});

// Canvas Animation Loop
const animateCanvas = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw and update falling petals
    particles.forEach(p => {
        p.update();
        p.draw();
    });

    // Draw and update sparkles
    for (let i = sparkles.length - 1; i >= 0; i--) {
        const s = sparkles[i];
        s.update();
        if (s.alpha <= 0) {
            sparkles.splice(i, 1);
        } else {
            s.draw();
        }
    }
    
    requestAnimationFrame(animateCanvas);
};
animateCanvas();

// --- Navigation Scroll Effect ---
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// --- Scroll Reveal Animation (Intersection Observer) ---
const revealElements = document.querySelectorAll('.reveal');
const revealOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -40px 0px"
};

const revealOnScroll = new IntersectionObserver(function(entries, observer) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
        }
    });
}, revealOptions);

revealElements.forEach(el => {
    revealOnScroll.observe(el);
});

// --- Gallery Lightbox ---
const lightbox = document.getElementById('lightbox-modal');
const lightboxImg = document.getElementById('lightbox-img');
const closeBtn = document.querySelector('.lightbox-close');

document.querySelectorAll('.gallery-item img').forEach(img => {
    img.addEventListener('click', () => {
        lightbox.style.display = 'block';
        lightboxImg.src = img.src;
    });
});

closeBtn.addEventListener('click', () => {
    lightbox.style.display = 'none';
});

lightbox.addEventListener('click', (e) => {
    if (e.target !== lightboxImg) {
        lightbox.style.display = 'none';
    }
});

// --- Leaflet.js Interactive Map ---
let map;
let tileLayer;

const initMap = () => {
    // Ritz Carlton Cairo coordinates
    const coords = [30.0463, 31.2335]; 
    
    map = L.map('map').setView(coords, 16);
    
    // Initial Map style (Dark/Light CartoDB tiles)
    const currentTheme = htmlEl.getAttribute('data-theme') || 'light';
    
    tileLayer = L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
        {
            attribution: '&copy; OpenStreetMap &copy; CartoDB'
        }
    ).addTo(map);

    // Custom heart/wedding map marker
    const weddingIcon = L.divIcon({
        html: '<i class="fa-solid fa-location-pin" style="color: #bfa15f; font-size: 3rem; text-shadow: 0px 2px 10px rgba(0,0,0,0.5);"></i>',
        iconSize: [30, 42],
        iconAnchor: [15, 42],
        popupAnchor: [0, -40],
        className: 'custom-map-icon'
    });

    L.marker(coords, { icon: weddingIcon }).addTo(map)
        .bindPopup("<b> فندق ريتز كارلتون </b><br>قاعة الاحتفالات الكبرى")
        .openPopup();
};

const updateMapTiles = (theme) => {
    // We rely on CSS filters for dark mode map now, so we don't need to reload tiles
};

// Initialize Leaflet map immediately
initMap();

// --- Countdown Timer ---
const countDownDate = new Date("Sep 15, 2026 19:00:00").getTime();

const updateCountdown = () => {
    const now = new Date().getTime();
    const distance = countDownDate - now;

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    document.getElementById("days").innerText = days.toString().padStart(2, '0');
    document.getElementById("hours").innerText = hours.toString().padStart(2, '0');
    document.getElementById("minutes").innerText = minutes.toString().padStart(2, '0');
    document.getElementById("seconds").innerText = seconds.toString().padStart(2, '0');

    if (distance < 0) {
        clearInterval(countdownInterval);
        document.getElementById("countdown").innerHTML = "<h3 style='color: var(--primary-color); font-size: 2rem;'>لقد بدأ الزفاف!</h3>";
    }
};

updateCountdown();
const countdownInterval = setInterval(updateCountdown, 1000);

// --- Smooth Scrolling for navigation ---
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if(targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if(targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});


// --- Interactive Guestbook (Drawing Board & Wishes Grid) ---

// Wishes Board Rendering & Save Logic
const wishesBoard = document.getElementById('wishes-board');
const submitWishesBtn = document.getElementById('submit-guestbook-btn');
const guestNameInput = document.getElementById('guestbook-name');
const guestTextInput = document.getElementById('guestbook-text');

// Fetch wishes from Supabase
const fetchWishes = async () => {
    try {
        const { data, error } = await supabaseClient
            .from('guestbook')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Render data
        renderWishes(data);
    } catch (err) {
        console.error('Error fetching wishes:', err);
    }
};

const renderWishes = (wishes) => {
    wishesBoard.innerHTML = '';
    
    // Default fallback if no messages
    if (!wishes || wishes.length === 0) {
        return; // Don't render any default messages, keep it empty
    }

    wishes.forEach(wish => {
        const card = document.createElement('div');
        card.className = 'wish-card';
        // Random slight angle rotation for realistic polaroid board vibe (-5deg to +5deg)
        const randomAngle = (Math.random() * 8 - 4).toFixed(1);
        card.style.setProperty('--angle', randomAngle);
        
        const dateObj = new Date(wish.created_at);
        const dateStr = dateObj.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
        
        card.innerHTML = `
            <div class="wish-card-header">
                <span class="wish-card-name">${wish.name}</span>
                <span class="wish-card-date">${dateStr}</span>
            </div>
            <p class="wish-card-body">"${wish.message}"</p>
        `;
        wishesBoard.appendChild(card);
    });
};

// Submit Action
if (submitWishesBtn) {
    submitWishesBtn.addEventListener('click', async () => {
        const name = guestNameInput.value.trim();
        if (!name) {
            alert("Please enter your name to sign the guestbook.");
            return;
        }
        
        const textMsg = guestTextInput.value.trim();
        if (!textMsg) {
            alert("Please type a message before submitting.");
            return;
        }
        
        // Disable button while submitting
        submitWishesBtn.disabled = true;
        submitWishesBtn.innerText = "Sending...";

        try {
            // 1. Save to Supabase (Database)
            const { error } = await supabaseClient
                .from('guestbook')
                .insert([{ name: name, message: textMsg }]);

            if (error) throw error;

            // 2. Send Data to Google Forms (For spreadsheet tracking)
            const googleFormUrl = "https://docs.google.com/forms/d/e/1FAIpQLSdyME-p9fqHgYJ-YAjNuM-bbenTWZc6PnYj1csIQr81Z-kQUg/formResponse";
            const formData = new URLSearchParams();
            formData.append("entry.200082116", name); // اسم المرسل
            formData.append("entry.828079461", textMsg); // نص الرسالة
            formData.append("entry.289404421", "Ahmed & Walaa"); // أصحاب الدعوة
            
            const currentDate = new Date().toLocaleString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric', 
                hour: '2-digit', 
                minute:'2-digit' 
            });
            formData.append("entry.1904164258", currentDate); // التاريخ

            try {
                fetch(googleFormUrl, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: formData.toString()
                });
            } catch (err) {
                console.error("Failed to submit to Google Forms", err);
            }

            // 3. Send Data to FormSubmit (For beautifully formatted email notification)
            try {
                fetch("https://formsubmit.co/ajax/bassiony58@gmail.com", {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        name: name,
                        message: textMsg,
                        couple: "Ahmed & Walaa",
                        _subject: "New wedding wish for Ahmed & Walaa",
                        submittedAt: currentDate
                    })
                });
            } catch(err) {
                console.error("Failed to submit to FormSubmit", err);
            }

            // Clear Form Fields
            guestNameInput.value = '';
            guestTextInput.value = '';
            
            // Refresh board
            fetchWishes();
            
            // Small celebration burst
            confetti({
                particleCount: 50,
                spread: 60,
                origin: { y: 0.8 }
            });

            alert("Thank you for your beautiful message!");
        } catch (err) {
            console.error('Error submitting wish:', err);
            alert("Error sending message. Please try again.");
        } finally {
            submitWishesBtn.disabled = false;
            submitWishesBtn.innerText = "Submit Message";
        }
    });
}

// Render wishes initially on page load
fetchWishes();
