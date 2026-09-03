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
});