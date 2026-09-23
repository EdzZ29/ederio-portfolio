document.addEventListener('DOMContentLoaded', () => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

    // Everything below is for the home page; works.html has its own menu script
    if (!document.getElementById('site-header')) return;

    // 2. Mobile menu (shadcn Sheet) - the button icon morphs between menu and close
    const menuBtn = document.getElementById('mobile-menu-btn');
    const menu = document.getElementById('mobile-menu');

    function setMenu(open) {
        menu.dataset.state = open ? 'open' : 'closed';
        menuBtn.setAttribute('aria-expanded', String(open));
        menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
        document.body.style.overflow = open ? 'hidden' : '';
        if (open) menu.querySelector('.mobile-link').focus({ preventScroll: true });
    }

    const menuIsOpen = () => menu.dataset.state === 'open';

    menuBtn.addEventListener('click', () => setMenu(!menuIsOpen()));
    menu.querySelector('[data-close]').addEventListener('click', () => setMenu(false));
    menu.querySelectorAll('.mobile-link').forEach(link => link.addEventListener('click', () => setMenu(false)));
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && menuIsOpen()) {
            setMenu(false);
            menuBtn.focus();
        }
    });

    // 3. Scroll behaviors: progress bar, hide-on-scroll header, back-to-top ring, hero parallax
    const header = document.getElementById('site-header');
    const progressBar = document.getElementById('scroll-progress');
    const backToTop = document.getElementById('back-to-top');
    const ring = backToTop.querySelector('.ring-progress');
    const heroTitle = document.getElementById('hero-title');
    const RING_LENGTH = 125.66;

    let lastY = window.scrollY;
    let ticking = false;

    function onScroll() {
        const y = window.scrollY;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const progress = max > 0 ? Math.min(y / max, 1) : 0;

        progressBar.style.setProperty('--progress', progress);

        header.dataset.scrolled = String(y > 8);
        // Hide when scrolling down past the hero fold, reveal on any scroll up
        if (!menuIsOpen() && Math.abs(y - lastY) > 4) {
            header.dataset.hidden = String(y > lastY && y > 400);
        }

        backToTop.dataset.visible = String(y > window.innerHeight * 0.8);
        backToTop.dataset.end = String(progress > 0.97);
        ring.style.strokeDashoffset = RING_LENGTH * (1 - progress);

        if (!reduceMotion && y < window.innerHeight) {
            const t = y / window.innerHeight;
            heroTitle.style.transform = `translateY(${y * 0.25}px)`;
            heroTitle.style.opacity = String(1 - t * 0.7);
        }

        lastY = y;
        ticking = false;
    }

    window.addEventListener('scroll', () => {
        if (!ticking) {
            ticking = true;
            requestAnimationFrame(onScroll);
        }
    }, { passive: true });
    onScroll();

    // Header always comes back when something inside it gets keyboard focus
    header.addEventListener('focusin', () => { header.dataset.hidden = 'false'; });

    // 4. Active-section nav: a pill slides behind the link for the section in view
    const nav = document.getElementById('desktop-nav');
    const indicator = document.getElementById('nav-indicator');
    const navLinks = [...nav.querySelectorAll('.nav-link')];
    let activeLink = null;

    function moveIndicator() {
        if (!activeLink) {
            indicator.style.opacity = '0';
            return;
        }
        indicator.style.width = `${activeLink.offsetWidth}px`;
        indicator.style.transform = `translateX(${activeLink.offsetLeft}px)`;
        indicator.style.opacity = '1';
    }

    function setActive(id) {
        activeLink = navLinks.find(link => link.getAttribute('href') === `#${id}`) || null;
        navLinks.forEach(link => {
            if (link === activeLink) link.setAttribute('aria-current', 'true');
            else link.removeAttribute('aria-current');
        });
        moveIndicator();
    }

    // A section counts as "active" when it crosses a band just above the middle of the viewport
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) setActive(entry.target.id);
        });
    }, { rootMargin: '-40% 0px -55% 0px' });

    document.querySelectorAll('section[id]').forEach(section => sectionObserver.observe(section));
    window.addEventListener('resize', moveIndicator);

    // 5. Copy email - the copy icon morphs into a check, and a toast confirms it
    const copyBtn = document.getElementById('copy-email');
    const toast = document.getElementById('toast');
    const toastText = document.getElementById('toast-text');
    let toastTimer;
    let copyTimer;

    function showToast(message) {
        toastText.textContent = message;
        toast.dataset.state = 'open';
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => { toast.dataset.state = 'closed'; }, 2400);
    }

    copyBtn.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(copyBtn.dataset.email);
            copyBtn.dataset.copied = 'true';
            showToast('Email copied to clipboard');
            clearTimeout(copyTimer);
            copyTimer = setTimeout(() => { copyBtn.dataset.copied = 'false'; }, 2000);
        } catch {
            showToast(`Couldn't copy - my email is ${copyBtn.dataset.email}`);
        }
    });
});
