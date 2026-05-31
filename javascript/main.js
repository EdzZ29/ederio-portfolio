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