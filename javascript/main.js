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
                // Unobserve so the animation only happens once
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Select all elements that should animate on scroll
    const animatedElements = document.querySelectorAll('.observe-animate');
    animatedElements.forEach(element => {
        animateObserver.observe(element);
    });
});

// 2. Carousel Logic for Services Section
let currentSlide = 0;
let slideInterval;
const slides = document.querySelectorAll('.slide-item');
const dots = document.querySelectorAll('.slide-dot');

function updateSliders() {
    slides.forEach((slide, index) => {
        if (index === currentSlide) {
            slide.classList.remove('opacity-0', 'z-0');
            slide.classList.add('opacity-100', 'z-10');
        } else {
            slide.classList.add('opacity-0', 'z-0');
            // Give z-index transition time to finish fade
            setTimeout(() => {
                if (index !== currentSlide) {
                    slide.classList.remove('opacity-100', 'z-10');
                }
            }, 700); 
        }
    });

    dots.forEach((dot, index) => {
        if (index === currentSlide) {
            dot.classList.remove('bg-[#3a3a3a]');
            dot.classList.add('bg-[#d5d5d5]');
        } else {
            dot.classList.remove('bg-[#d5d5d5]');
            dot.classList.add('bg-[#3a3a3a]');
        }
    });
}

function nextSlide() {
    currentSlide = (currentSlide + 1) % slides.length;
    updateSliders();
    resetInterval();
}

function prevSlide() {
    currentSlide = (currentSlide - 1 + slides.length) % slides.length;
    updateSliders();
    resetInterval();
}

function goToSlide(index) {
    currentSlide = index;
    updateSliders();
    resetInterval();
}

function startInterval() {
    slideInterval = setInterval(nextSlide, 3000);
}

function resetInterval() {
    clearInterval(slideInterval);
    startInterval();
}

// Ensure interval only starts if slides are present on the page
if (slides.length > 0) {
    startInterval();
}