// ========================================
// MAIN JAVASCRIPT FILE
// ========================================

// Supabase client setup
const SUPABASE_URL = 'https://clpcskkoguomoihnisai.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNscGNza2tvZ3VvbW9paG5pc2FpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyMjYyMTIsImV4cCI6MjA3MDgwMjIxMn0.TpZQuKm0cVvl7lJbXt2Iw1_s3HlLLIIbRr7lIOyVsBo';
let supabase;
if (window.supabase) {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} else {
    // Dynamically load supabase-js if not present
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js';
    script.onload = () => {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    };
    document.head.appendChild(script);
}

document.addEventListener('DOMContentLoaded', function() {
    
    // ========================================
    // NAVIGATION FUNCTIONALITY
    // ========================================
    
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Mobile menu toggle
    navToggle.addEventListener('click', function() {
        navMenu.classList.toggle('active');
        navToggle.classList.toggle('active');
    });
    
    // Close mobile menu when clicking on a link
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
        });
    });
    
    // Navbar scroll effect
    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // ========================================
    // EMAIL SUBSCRIPTION MODAL FUNCTIONALITY
    // ========================================
    const subscribeBtn = document.getElementById('subscribeBtn');
    const emailModal = document.getElementById('emailModal');
    const closeModal = document.getElementById('closeModal');
    const emailForm = document.getElementById('emailForm');
    const modalMessage = document.getElementById('modalMessage');

    if (subscribeBtn && emailModal && closeModal && emailForm) {
        subscribeBtn.addEventListener('click', function() {
            emailModal.style.display = 'block';
        });
        closeModal.addEventListener('click', function() {
            emailModal.style.display = 'none';
            modalMessage.style.display = 'none';
            emailForm.style.display = 'block';
        });
        window.addEventListener('click', function(event) {
            if (event.target === emailModal) {
                emailModal.style.display = 'none';
                modalMessage.style.display = 'none';
                emailForm.style.display = 'block';
            }
        });
        emailForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const firstName = document.getElementById('subscriberFirstName').value;
            const lastName = document.getElementById('subscriberLastName').value;
            const email = document.getElementById('subscriberEmail').value;
            if (!supabase) {
                modalMessage.textContent = 'Loading... please try again in a moment.';
                modalMessage.style.display = 'block';
                return;
            }
            const { error } = await supabase
                .from('newsletter_subscribers')
                .insert([{ first_name: firstName, last_name: lastName, email }]);
            if (error) {
                modalMessage.textContent = 'There was an error subscribing. Please try again.';
                modalMessage.style.display = 'block';
            } else {
                emailForm.style.display = 'none';
                modalMessage.textContent = 'Thank you for subscribing! You will receive weekly updates.';
                modalMessage.style.display = 'block';
            }
        });

        // --- Auto-open modal after 20 seconds (if not already opened/closed) ---
        let modalOpened = false;
        function openModalAuto() {
            if (!modalOpened && emailModal.style.display !== 'block') {
                emailModal.style.display = 'block';
                modalOpened = true;
            }
        }
        setTimeout(openModalAuto, 20000); // 20 seconds

        // --- Auto-open modal when user scrolls past 50% of the page ---
        function checkScrollModal() {
            if (modalOpened) return;
            const scrollY = window.scrollY || window.pageYOffset;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            if (docHeight > 0 && scrollY / docHeight > 0.5) {
                openModalAuto();
                window.removeEventListener('scroll', checkScrollModal);
            }
        }
        window.addEventListener('scroll', checkScrollModal);

        // Mark as opened if user closes or submits
        emailModal.addEventListener('click', function(e) {
            if (e.target === closeModal) modalOpened = true;
        });
        emailForm.addEventListener('submit', function() {
            modalOpened = true;
        });
    }
    
    // ========================================
    // SMOOTH SCROLLING
    // ========================================
    
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offsetTop = target.offsetTop - 80; // Account for fixed navbar
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // ========================================
    // SCROLL ANIMATIONS
    // ========================================
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-on-scroll');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animateElements = document.querySelectorAll('.service-card, .case-card, .blog-card, .value-point, .team-member, .about-stat');
    animateElements.forEach(el => {
        observer.observe(el);
    });
    
    // ========================================
    // COUNTER ANIMATION
    // ========================================
    
    function animateCounter(element, start, end, duration) {
        if (isNaN(end) || end <= 0) {
            return; // Don't animate invalid numbers
        }
        
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const value = Math.floor(progress * (end - start) + start);
            const suffix = element.dataset.suffix || '';
            element.textContent = value + suffix;
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }
    
    // Animate counters when they come into view
    const counters = document.querySelectorAll('.stat-number, .metric-value, .about-stat h3');
    const counterObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const text = counter.textContent.trim();
                const numberMatch = text.match(/\d+/);
                const number = numberMatch ? parseInt(numberMatch[0]) : 0;
                const suffix = text.replace(/\d+/g, '');
                
                // Only animate if we have a valid number
                if (!isNaN(number) && number > 0) {
                    counter.dataset.suffix = suffix;
                    animateCounter(counter, 0, number, 2000);
                }
                counterObserver.unobserve(counter);
            }
        });
    }, observerOptions);
    
    counters.forEach(counter => {
        counterObserver.observe(counter);
    });
    
    // ========================================
    // FORM VALIDATION
    // ========================================
    
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    function showFormMessage(form, message, type = 'success') {
        const existingMessage = form.querySelector('.form-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `form-message ${type}`;
        messageDiv.textContent = message;
        messageDiv.style.cssText = `
            padding: 1rem;
            margin: 1rem 0;
            border-radius: 8px;
            text-align: center;
            font-weight: 600;
            ${type === 'success' ? 'background: #d4edda; color: #155724; border: 1px solid #c3e6cb;' : 'background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb;'}
        `;
        
        form.appendChild(messageDiv);
        
        // Remove message after 5 seconds
        setTimeout(() => {
            messageDiv.remove();
        }, 5000);
    }
    
    function validateForm(form) {
        const requiredFields = form.querySelectorAll('[required]');
        let isValid = true;
        
        requiredFields.forEach(field => {
            const value = field.value.trim();
            field.classList.remove('error');
            
            if (!value) {
                field.classList.add('error');
                isValid = false;
            } else if (field.type === 'email' && !validateEmail(value)) {
                field.classList.add('error');
                isValid = false;
            }
        });
        
        return isValid;
    }
    
    // ========================================
    // FLOATING CARDS ANIMATION
    // ========================================
    
    const floatingCards = document.querySelectorAll('.floating-cards .card');
    if (floatingCards.length > 0) {
        // Add random delays to floating animation
        floatingCards.forEach((card, index) => {
            card.style.animationDelay = `${index * 0.5}s`;
        });
    }
    
    // ========================================
    // PARALLAX EFFECT (OPTIONAL)
    // ========================================
    
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const parallaxElements = document.querySelectorAll('.hero-visual');
        
        parallaxElements.forEach(element => {
            const speed = 0.5;
            const yPos = -(scrolled * speed);
            element.style.transform = `translateY(${yPos}px)`;
        });
    });
    
    // ========================================
    // LAZY LOADING IMAGES
    // ========================================
    
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => {
        imageObserver.observe(img);
    });
    
    // ========================================
    // PERFORMANCE OPTIMIZATION
    // ========================================
    
    // Throttle scroll events
    let ticking = false;
    function updateScrollElements() {
        // Update scroll-dependent elements here
        ticking = false;
    }
    
    function requestTick() {
        if (!ticking) {
            requestAnimationFrame(updateScrollElements);
            ticking = true;
        }
    }
    
    window.addEventListener('scroll', requestTick);
    
    // ========================================
    // ACCESSIBILITY ENHANCEMENTS
    // ========================================
    
    // Skip link functionality
    const skipLink = document.querySelector('.skip-link');
    if (skipLink) {
        skipLink.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.focus();
                target.scrollIntoView();
            }
        });
    }
    
    // Keyboard navigation for mobile menu
    navToggle.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.click();
        }
    });
    
    // Focus management for modal/menu
    function trapFocus(element) {
        const focusableElements = element.querySelectorAll(
            'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select'
        );
        const firstFocusableElement = focusableElements[0];
        const lastFocusableElement = focusableElements[focusableElements.length - 1];
        
        element.addEventListener('keydown', function(e) {
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === firstFocusableElement) {
                        lastFocusableElement.focus();
                        e.preventDefault();
                    }
                } else {
                    if (document.activeElement === lastFocusableElement) {
                        firstFocusableElement.focus();
                        e.preventDefault();
                    }
                }
            }
            
            if (e.key === 'Escape') {
                // Close menu or modal
                if (navMenu.classList.contains('active')) {
                    navMenu.classList.remove('active');
                    navToggle.classList.remove('active');
                    navToggle.focus();
                }
            }
        });
    }
    
    // Apply focus trapping to mobile menu
    if (navMenu) {
        trapFocus(navMenu);
    }
    
    // ========================================
    // ERROR HANDLING
    // ========================================
    
    window.addEventListener('error', function(e) {
        console.error('JavaScript error:', e.error);
        // You can send error reports to your analytics service here
    });
    
    // ========================================
    // PAGE LOAD OPTIMIZATION
    // ========================================
    
    // Add loaded class when page is fully loaded
    window.addEventListener('load', function() {
        document.body.classList.add('loaded');
    });
    
    // ========================================
    // UTILITY FUNCTIONS
    // ========================================
    
    // Debounce function for performance
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // Throttle function for performance
    function throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
    
    // Add CSS for form error states
    const style = document.createElement('style');
    style.textContent = `
        .form-group input.error,
        .form-group select.error,
        .form-group textarea.error {
            border-color: #dc3545 !important;
            box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25) !important;
        }
        
        .form-group input.error:focus,
        .form-group select.error:focus,
        .form-group textarea.error:focus {
            border-color: #dc3545 !important;
            box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25) !important;
        }
        
        .lazy {
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        
        .lazy.loaded {
            opacity: 1;
        }
    `;
    document.head.appendChild(style);
    
});
