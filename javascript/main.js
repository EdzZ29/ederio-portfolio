document.addEventListener('DOMContentLoaded', () => {
    // 1. Scroll animations using Intersection Observer
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15 // Trigger when 15% of the element is visible
    };

    const animateObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Add the visible class to trigger the CSS transition
                entry.target.classList.add('visible');
                
                // Trigger typing animation for HELLO! text
                const typingElement = entry.target.querySelector('#typing-hello');
                if (typingElement && !typingElement.classList.contains('typed')) {
                    typingElement.classList.add('typed');
                    startTypingLoop(typingElement);
                }

                // Unobserve so the animation only happens once
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Typing effect function
    function typeWriter(element, text, i, callback) {
        if (i === 0) element.innerHTML = ''; // Start fresh
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            // Dynamic delay for realism
            const delay = Math.random() * 50 + 150; 
            setTimeout(() => typeWriter(element, text, i + 1, callback), delay);
        } else if (typeof callback === 'function') {
            // Wait 3 seconds before restarting
            setTimeout(callback, 3000);
        }
    }

    function startTypingLoop(element) {
        const text = element.getAttribute('data-text');
        function loop() {
            typeWriter(element, text, 0, loop);
        }
        loop();
    }

    // Select all elements that should animate on scroll
    const animatedElements = document.querySelectorAll('.observe-animate');
    animatedElements.forEach(element => {
        animateObserver.observe(element);
    });

    // 2. Kinetic Particle Animation for Hero Section
    const canvas = document.getElementById('kinetic-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width, height;
        let particles = [];
        const particleCount = 80;
        
        // Mouse interaction details
        const mouse = {
            x: -window.innerWidth,
            y: -window.innerHeight,
            radius: 150 // Area of kinetic effect
        };

        function initCanvas() {
            width = canvas.width = canvas.offsetWidth;
            height = canvas.height = canvas.offsetHeight;
        }

        window.addEventListener('resize', initCanvas);
        initCanvas();

        // Track mouse position over the canvas exactly
        window.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
        });

        // Reset mouse position when leaving window
        window.addEventListener('mouseout', () => {
            mouse.x = -window.innerWidth;
            mouse.y = -window.innerHeight;
        });

        class Particle {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.vx = (Math.random() - 0.5) * 1.5;
                this.vy = (Math.random() - 0.5) * 1.5;
                this.baseRadius = Math.random() * 2 + 1;
                this.radius = this.baseRadius;
                // Match the indigo-500 primary color
                this.color = 'rgba(99, 102, 241, 0.8)';
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;

                // Bounce off edges gracefully
                if (this.x < 0 || this.x > width) this.vx *= -1;
                if (this.y < 0 || this.y > height) this.vy *= -1;

                // Distance calculation for kinetic repulsion
                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < mouse.radius) {
                    let forceDirectionX = dx / distance;
                    let forceDirectionY = dy / distance;
                    // Proximity mapping
                    let force = (mouse.radius - distance) / mouse.radius;
                    let directionX = forceDirectionX * force * 0.6;
                    let directionY = forceDirectionY * force * 0.6;

                    // Repel interaction (push away)
                    this.vx -= directionX;
                    this.vy -= directionY;
                    
                    // Increase particle size near cursor
                    this.radius = this.baseRadius + (force * 3);
                } else if (this.radius > this.baseRadius) {
                    // Decay back to normal
                    this.radius -= 0.1;
                }
                
                // Keep speeds under a specific limit to avoid scattering to infinity
                const maxSpeed = 2.5;
                let speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
                if(speed > maxSpeed) {
                    this.vx = (this.vx / speed) * maxSpeed;
                    this.vy = (this.vy / speed) * maxSpeed;
                }
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.fill();
            }
        }

        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }

        function animate() {
            ctx.clearRect(0, 0, width, height);

            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
                particles[i].draw();

                // Draw connecting kinetic lines between particles
                for (let j = i; j < particles.length; j++) {
                    let dx = particles[i].x - particles[j].x;
                    let dy = particles[i].y - particles[j].y;
                    let distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 120) { // connection radius
                        ctx.beginPath();
                        // Opacity based on proximity between particles
                        ctx.strokeStyle = `rgba(99, 102, 241, ${0.4 - distance/300})`;
                        ctx.lineWidth = 0.8;
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }
            requestAnimationFrame(animate);
        }

        animate();
    }
});