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

    window.addEventListener('scroll', scrollHeader);
    // Trigger once on load
    scrollHeader();

    function scrollActive() {
        const scrollY = window.pageYOffset;

        sections.forEach(current => {
            const sectionHeight = current.offsetHeight;
            const sectionTop = current.offsetTop - 100; // Offset for header
            const sectionId = current.getAttribute('id');
            const activeLink = document.querySelector(`.nav-menu a[href*=${sectionId}]`);

            if(activeLink) {
                if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                    activeLink.classList.add('active');
                } else {
                    activeLink.classList.remove('active');
                }
            }
        });
    }
    window.addEventListener('scroll', scrollActive);
    // Trigger once on load
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
                // Optional: Stop observing once animated
                // observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    fadeUpElements.forEach(element => {
        observer.observe(element);
    });

    // 6. Contact Form Handling
    const contactForm = document.getElementById('contactForm');
    const formMessages = document.getElementById('formMessages');
    const submitButton = document.getElementById('submitButton');

    // Replace with actual Google Apps Script Web App URL when available
    const scriptURL = 'YOUR_GOOGLE_SCRIPT_WEB_APP_URL';

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Clear previous messages
            formMessages.className = 'form-messages';
            formMessages.textContent = '';

            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const message = document.getElementById('message').value.trim();

            // Basic validation (browser already handles basic HTML5 required & email format, but just in case)
            if (!name || !email || !message) {
                showMessage('error', 'Please fill out all fields.');
                return;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showMessage('error', 'Please enter a valid email address.');
                return;
            }

            // Set Loading State
            const originalButtonText = submitButton.textContent;
            submitButton.disabled = true;
            submitButton.textContent = 'Sending...';

            try {
                // Prepare form data
                const formData = new FormData();
                formData.append('name', name);
                formData.append('email', email);
                formData.append('message', message);
                formData.append('sourcePage', 'Portfolio Website');

                // If testing locally and URL is placeholder, mock success
                if (scriptURL === 'YOUR_GOOGLE_SCRIPT_WEB_APP_URL') {
                    console.log('Mocking submission. Data:', {name, email, message, sourcePage: 'Portfolio Website'});
                    await new Promise(resolve => setTimeout(resolve, 1000)); // simulate delay
                    showMessage('success', 'Message sent successfully! (Mocked)');
                    contactForm.reset();
                } else {
                    const response = await fetch(scriptURL, {
                        method: 'POST',
                        body: formData
                    });

                    if (response.ok) {
                        showMessage('success', 'Message sent successfully!');
                        contactForm.reset();
                    } else {
                        throw new Error('Network response was not ok.');
                    }
                }
            } catch (error) {
                console.error('Error submitting form:', error);
                showMessage('error', 'Oops! Something went wrong. Please try again later.');
            } finally {
                // Restore button state
                submitButton.disabled = false;
                submitButton.textContent = originalButtonText;
            }
        });
    }

    function showMessage(type, text) {
        formMessages.textContent = text;
        formMessages.className = `form-messages show ${type}`;

        // Ensure opacity transition happens after display block is set
        setTimeout(() => {
            formMessages.style.opacity = '1';
        }, 10);

        // Hide message after 5 seconds
        if (type === 'success') {
            setTimeout(() => {
                formMessages.style.opacity = '0';
                setTimeout(() => {
                    formMessages.className = 'form-messages';
                    formMessages.textContent = '';
                }, 300); // Wait for transition
            }, 5000);
        }
    }
});
