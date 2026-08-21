document.addEventListener('DOMContentLoaded', () => {
    // 1. Mobile Menu Toggle
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');

            // Prevent body scroll when menu is open
            if (navMenu.classList.contains('active')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        });
    }

    // Close menu when a link is clicked
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    });

    // 2. Sticky Header & Scroll Active Link
    const header = document.getElementById('header');
    const sections = document.querySelectorAll('section[id]');

    function scrollHeader() {
        if (window.scrollY >= 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }

    // scrollHeader now handled in batched rAF onScroll handler


    let isScrolling = false;

    // Cache the sections to avoid repeated DOM queries and layout reads
    // which cause layout thrashing
    const sectionData = [];

    function cacheSectionData() {
        sectionData.length = 0; // clear
        sections.forEach(current => {
            sectionData.push({
                id: current.getAttribute('id'),
                height: current.offsetHeight,
                top: current.offsetTop - 100,
                // cache the DOM element to avoid repeated querySelector
                link: document.querySelector(`.nav-menu a[href*=${current.getAttribute('id')}]`)
            });
        });
    }

    // Cache initially and on resize
    cacheSectionData();
    let resizeTimer;
    window.addEventListener('resize', () => {
        // debounce resize to avoid excessive calculations
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(cacheSectionData, 250);
    });

    function scrollActive() {
        const scrollY = window.pageYOffset;

        sectionData.forEach(data => {
            if(data.link) {
                if (scrollY > data.top && scrollY <= data.top + data.height) {
                    data.link.classList.add('active');
                } else {
                    data.link.classList.remove('active');
                }
            }
        });
    }

    function onScroll() {
        if (!isScrolling) {
            window.requestAnimationFrame(() => {
                scrollHeader();
                scrollActive();
                isScrolling = false;
            });
            isScrolling = true;
        }
    }

    window.removeEventListener('scroll', scrollHeader);
    window.addEventListener('scroll', onScroll, { passive: true });

    // Trigger once on load
    scrollHeader();
    scrollActive();

    // 3. Set Current Year in Footer
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // 4. Smooth Scrolling for anchor links (fallback for Safari mostly, as scroll-behavior: smooth is in CSS)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');

            // Skip if href is just "#"
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();

                // Calculate offset (header height)
                const headerHeight = document.querySelector('.header').offsetHeight;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerHeight;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            }
        });
    });

    // 5. Entrance Animations (Intersection Observer)
    const fadeUpElements = document.querySelectorAll('.fade-up');

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15 // Trigger when 15% of element is visible
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    fadeUpElements.forEach(element => {
        observer.observe(element);
    });
});
