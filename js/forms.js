// ========================================
// FORM HANDLING & SUBMISSION
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    
    // ========================================
    // CONTACT FORM HANDLING
    // ========================================
    
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            // Don't prevent default - let it submit to Formspree
            
            // Validate form
            if (!validateForm(this)) {
                e.preventDefault(); // Only prevent if validation fails
                showFormMessage(this, 'Please fill in all required fields correctly.', 'error');
                return;
            }
            
            // Show loading state
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            submitBtn.disabled = true;
            submitBtn.classList.add('loading');
            
            // Track conversion event
            const formData = new FormData(this);
            const data = Object.fromEntries(formData);
            
            trackEvent('contact_form_submission', {
                service: data.service,
                company: data.company
            });
            
            // Form will now submit naturally to Formspree
                // window.location.href = '/thank-you.html';
                
            }, 2000);
        });
    }
    
    // ========================================
    // AUDIT FORM HANDLING
    // ========================================
    
    const auditForm = document.getElementById('audit-form');
    if (auditForm) {
        auditForm.addEventListener('submit', function(e) {
            // Don't prevent default - let it submit to Formspree
            
            // Validate form
            if (!validateForm(this)) {
                e.preventDefault(); // Only prevent if validation fails
                showFormMessage(this, 'Please fill in all required fields correctly.', 'error');
                return;
            }
            
            // Show loading state
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
            submitBtn.disabled = true;
            submitBtn.classList.add('loading');
            
            // Track conversion event
            const formData = new FormData(this);
            const data = Object.fromEntries(formData);
            
            trackEvent('audit_form_submission', {
                company_size: data['company-size'],
                company: data.company
            });
            
            // Form will now submit naturally to Formspree
        });
    }
    
    // ========================================
    // NEWSLETTER SIGNUP
    // ========================================
    
    const newsletterForms = document.querySelectorAll('.newsletter-form');
    newsletterForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const emailInput = this.querySelector('input[type="email"]');
            const email = emailInput.value.trim();
            
            if (!validateEmail(email)) {
                showFormMessage(this, 'Please enter a valid email address.', 'error');
                return;
            }
            
            // Show loading state
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            submitBtn.disabled = true;
            
            // Simulate subscription
            setTimeout(() => {
                showFormMessage(this, 'Thank you for subscribing! Check your email for confirmation.', 'success');
                this.reset();
                
                // Track subscription
                trackEvent('newsletter_signup', { email: email });
                
                // Reset button
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
                
            }, 1500);
        });
    });
    
    // ========================================
    // LEAD SCORING & QUALIFICATION
    // ========================================
    
    function calculateLeadScore(formData) {
        let score = 0;
        
        // Company size scoring
        const companySize = formData['company-size'] || formData.companySize;
        switch(companySize) {
            case '1-10': score += 10; break;
            case '11-50': score += 20; break;
            case '51-200': score += 30; break;
            case '201-1000': score += 40; break;
            case '1000+': score += 50; break;
        }
        
        // Service interest scoring
        const service = formData.service;
        if (service === 'data-analytics') score += 30;
        if (service === 'business-consulting') score += 25;
        if (service === 'implementation') score += 20;
        
        // Email domain scoring (business domains score higher)
        const email = formData.email;
        if (email) {
            const domain = email.split('@')[1];
            if (!['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'].includes(domain)) {
                score += 20; // Business email
            }
        }
        
        return score;
    }
    
    function qualifyLead(score) {
        if (score >= 70) return 'hot';
        if (score >= 40) return 'warm';
        return 'cold';
    }
    
    // ========================================
    // SUCCESS MODALS
    // ========================================
    
    function showAuditSuccessModal() {
        const modal = document.createElement('div');
        modal.className = 'success-modal';
        modal.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>🎉 Audit Request Received!</h3>
                        <button class="modal-close">&times;</button>
                    </div>
                    <div class="modal-body">
                        <p>Thank you for requesting a free data analytics audit!</p>
                        <div class="next-steps">
                            <h4>What happens next:</h4>
                            <ol>
                                <li>We'll review your information within 24 hours</li>
                                <li>Schedule a brief discovery call</li>
                                <li>Deliver your custom audit report</li>
                                <li>Discuss implementation strategies</li>
                            </ol>
                        </div>
                        <div class="modal-actions">
                            <a href="#services" class="btn btn-primary">Explore Our Services</a>
                            <a href="resources/calculator.html" class="btn btn-secondary">Try ROI Calculator</a>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add modal styles
        const style = document.createElement('style');
        style.textContent = `
            .success-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .modal-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                backdrop-filter: blur(5px);
            }
            
            .modal-content {
                position: relative;
                background: white;
                border-radius: 12px;
                max-width: 500px;
                margin: 2rem;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                animation: modalSlideIn 0.3s ease-out;
            }
            
            @keyframes modalSlideIn {
                from {
                    opacity: 0;
                    transform: translateY(-50px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            .modal-header {
                padding: 2rem 2rem 1rem;
                border-bottom: 1px solid #eee;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .modal-header h3 {
                margin: 0;
                color: #1a1a1a;
            }
            
            .modal-close {
                background: none;
                border: none;
                font-size: 2rem;
                cursor: pointer;
                color: #666;
                padding: 0;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .modal-body {
                padding: 2rem;
            }
            
            .next-steps {
                margin: 1.5rem 0;
                padding: 1.5rem;
                background: #f8f9fa;
                border-radius: 8px;
            }
            
            .next-steps h4 {
                margin-bottom: 1rem;
                color: #1a1a1a;
            }
            
            .next-steps ol {
                margin: 0;
                padding-left: 1.5rem;
            }
            
            .next-steps li {
                margin-bottom: 0.5rem;
                color: #666;
            }
            
            .modal-actions {
                display: flex;
                gap: 1rem;
                margin-top: 2rem;
                flex-wrap: wrap;
            }
            
            .modal-actions .btn {
                flex: 1;
                text-align: center;
                min-width: 150px;
            }
            
            @media (max-width: 768px) {
                .modal-content {
                    margin: 1rem;
                    max-width: none;
                }
                
                .modal-header,
                .modal-body {
                    padding: 1.5rem;
                }
                
                .modal-actions {
                    flex-direction: column;
                }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(modal);
        
        // Close modal functionality
        const closeBtn = modal.querySelector('.modal-close');
        const overlay = modal.querySelector('.modal-overlay');
        
        function closeModal() {
            modal.remove();
            style.remove();
        }
        
        closeBtn.addEventListener('click', closeModal);
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) {
                closeModal();
            }
        });
        
        // Escape key to close
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeModal();
            }
        });
        
        // Auto-close after 30 seconds
        setTimeout(closeModal, 30000);
    }
    
    // ========================================
    // FORM UTILITIES
    // ========================================
    
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
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
    
    // ========================================
    // REAL-TIME FORM VALIDATION
    // ========================================
    
    const formInputs = document.querySelectorAll('input, select, textarea');
    formInputs.forEach(input => {
        input.addEventListener('blur', function() {
            if (this.hasAttribute('required')) {
                const value = this.value.trim();
                this.classList.remove('error');
                
                if (!value) {
                    this.classList.add('error');
                } else if (this.type === 'email' && !validateEmail(value)) {
                    this.classList.add('error');
                }
            }
        });
        
        // Remove error class on input
        input.addEventListener('input', function() {
            if (this.classList.contains('error')) {
                this.classList.remove('error');
            }
        });
    });
    
    // ========================================
    // FORM DATA PERSISTENCE
    // ========================================
    
    // Save form data to localStorage as user types
    function saveFormData(form) {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        const formId = form.id || 'default-form';
        localStorage.setItem(`form-data-${formId}`, JSON.stringify(data));
    }
    
    // Restore form data from localStorage
    function restoreFormData(form) {
        const formId = form.id || 'default-form';
        const savedData = localStorage.getItem(`form-data-${formId}`);
        
        if (savedData) {
            const data = JSON.parse(savedData);
            Object.keys(data).forEach(key => {
                const field = form.querySelector(`[name="${key}"]`);
                if (field && data[key]) {
                    field.value = data[key];
                }
            });
        }
    }
    
    // Clear saved form data
    function clearFormData(form) {
        const formId = form.id || 'default-form';
        localStorage.removeItem(`form-data-${formId}`);
    }
    
    // Apply form data persistence to main forms
    const persistentForms = document.querySelectorAll('#contact-form, #audit-form');
    persistentForms.forEach(form => {
        // Restore data on page load
        restoreFormData(form);
        
        // Save data as user types
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('input', () => saveFormData(form));
        });
        
        // Clear data on successful submission
        form.addEventListener('submit', function(e) {
            setTimeout(() => {
                if (!this.querySelector('.form-message.error')) {
                    clearFormData(this);
                }
            }, 3000);
        });
    });
    
    // ========================================
    // A/B TESTING FOR FORMS
    // ========================================
    
    function initFormABTest() {
        const variant = Math.random() < 0.5 ? 'A' : 'B';
        
        // Store variant in session
        sessionStorage.setItem('form-variant', variant);
        
        // Apply variant-specific changes
        if (variant === 'B') {
            // Example: Change button text for variant B
            const submitBtns = document.querySelectorAll('button[type="submit"]');
            submitBtns.forEach(btn => {
                if (btn.textContent.includes('Get Free')) {
                    btn.innerHTML = btn.innerHTML.replace('Get Free', 'Start Your Free');
                }
            });
        }
        
        // Track variant view
        trackEvent('form_variant_view', { variant: variant });
    }
    
    // Initialize A/B test
    initFormABTest();
    
    // ========================================
    // FORM ANALYTICS TRACKING
    // ========================================
    
    function trackEvent(eventName, parameters = {}) {
        // Google Analytics 4
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, parameters);
        }
        
        // Facebook Pixel
        if (typeof fbq !== 'undefined') {
            fbq('track', eventName, parameters);
        }
        
        // Custom analytics
        console.log('Event tracked:', eventName, parameters);
    }
    
    // Track form interactions
    document.querySelectorAll('form').forEach(form => {
        // Track form start
        const inputs = form.querySelectorAll('input, select, textarea');
        let hasStarted = false;
        
        inputs.forEach(input => {
            input.addEventListener('focus', function() {
                if (!hasStarted) {
                    hasStarted = true;
                    trackEvent('form_start', { form_id: form.id });
                }
            });
        });
        
        // Track form abandonment
        let isSubmitting = false;
        form.addEventListener('submit', () => isSubmitting = true);
        
        window.addEventListener('beforeunload', function() {
            if (hasStarted && !isSubmitting) {
                trackEvent('form_abandon', { form_id: form.id });
            }
        });
    });
    
});
