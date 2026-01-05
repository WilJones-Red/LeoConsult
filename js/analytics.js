// ========================================
// ANALYTICS & TRACKING
// Enhanced Google Analytics tracking for Leo Consult
// Works with cookie-consent.js
// ========================================

// ========================================
// CUSTOM EVENT TRACKING
// ========================================

function trackEvent(eventName, parameters = {}) {
    // Only track if GA is loaded (user accepted cookies)
    if (typeof gtag === 'undefined') {
        console.log('📊 Event not tracked (no consent):', eventName);
        return;
    }
    
    // Add timestamp and page info
    const eventData = {
        ...parameters,
        timestamp: new Date().toISOString(),
        page_url: window.location.href,
        page_title: document.title,
        referrer: document.referrer
    };
    
    // Google Analytics 4
    gtag('event', eventName, eventData);
    
    // Console log for debugging
    console.log('📊 Event tracked:', eventName, eventData);
}

function getSessionId() {
    let sessionId = sessionStorage.getItem('session_id');
    if (!sessionId) {
        sessionId = 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
        sessionStorage.setItem('session_id', sessionId);
    }
    return sessionId;
}

// ========================================
// SCROLL TRACKING
// ========================================

function initializeScrollTracking() {
    let scrollDepths = [25, 50, 75, 90, 100];
    let trackedDepths = [];
    
    function trackScrollDepth() {
        const scrollTop = window.pageYOffset;
        const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = Math.round((scrollTop / documentHeight) * 100);
        
        scrollDepths.forEach(depth => {
            if (scrollPercent >= depth && !trackedDepths.includes(depth)) {
                trackedDepths.push(depth);
                trackEvent('scroll_depth', {
                    scroll_depth: depth,
                    page_url: window.location.href
                });
            }
        });
    }
    
    // Throttle scroll events
    let scrollTimeout;
    window.addEventListener('scroll', function() {
        if (scrollTimeout) {
            clearTimeout(scrollTimeout);
        }
        scrollTimeout = setTimeout(trackScrollDepth, 100);
    });
}

// ========================================
// TIME ON PAGE TRACKING
// ========================================

function initializeTimeTracking() {
    const startTime = Date.now();
    let timeIntervals = [10, 30, 60, 120, 300]; // seconds
    let trackedIntervals = [];
    
    setInterval(function() {
        const timeOnPage = Math.floor((Date.now() - startTime) / 1000);
        
        timeIntervals.forEach(interval => {
            if (timeOnPage >= interval && !trackedIntervals.includes(interval)) {
                trackedIntervals.push(interval);
                trackEvent('time_on_page', {
                    time_seconds: interval,
                    page_url: window.location.href
                });
            }
        });
    }, 5000);
    
    // Track time on page when user leaves
    window.addEventListener('beforeunload', function() {
        const totalTime = Math.floor((Date.now() - startTime) / 1000);
        trackEvent('page_exit', {
            total_time_seconds: totalTime,
            page_url: window.location.href
        });
    });
}

// ========================================
// CLICK TRACKING
// ========================================

function initializeClickTracking() {
    // Track CTA button clicks
    document.querySelectorAll('.btn, .cta-btn, .service-link, .case-link, .blog-link').forEach(button => {
        button.addEventListener('click', function(e) {
            const buttonText = this.textContent.trim();
            const buttonClass = this.className;
            const destination = this.href || this.getAttribute('data-href') || '';
            
            trackEvent('cta_click', {
                button_text: buttonText,
                button_class: buttonClass,
                destination: destination,
                element_id: this.id || 'no-id'
            });
        });
    });
    
    // Track navigation clicks
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            trackEvent('navigation_click', {
                link_text: this.textContent.trim(),
                destination: this.href || this.getAttribute('href'),
                nav_type: 'main_nav'
            });
        });
    });
    
    // Track service card clicks
    document.querySelectorAll('.service-card').forEach(card => {
        card.addEventListener('click', function(e) {
            const serviceTitle = this.querySelector('.service-title')?.textContent || 'Unknown Service';
            trackEvent('service_card_click', {
                service_name: serviceTitle
            });
        });
    });
    
    // Track case study clicks
    document.querySelectorAll('.case-card').forEach(card => {
        card.addEventListener('click', function(e) {
            const caseTitle = this.querySelector('.case-title')?.textContent || 'Unknown Case';
            const caseCategory = this.querySelector('.case-category')?.textContent || 'Unknown Category';
            trackEvent('case_study_click', {
                case_title: caseTitle,
                case_category: caseCategory
            });
        });
    });
}

// ========================================
// FORM TRACKING
// ========================================

function initializeFormTracking() {
    // Track form starts
    document.querySelectorAll('form').forEach(form => {
        const inputs = form.querySelectorAll('input, select, textarea');
        let hasStarted = false;
        
        inputs.forEach(input => {
            input.addEventListener('focus', function() {
                if (!hasStarted) {
                    hasStarted = true;
                    trackEvent('form_start', {
                        form_id: form.id || 'unknown_form',
                        form_type: getFormType(form)
                    });
                }
            });
        });
        
        // Track form submissions
        form.addEventListener('submit', function(e) {
            trackEvent('form_submit', {
                form_id: this.id || 'unknown_form',
                form_type: getFormType(this)
            });
        });
    });
}

function getFormType(form) {
    if (form.id.includes('contact')) return 'contact';
    if (form.id.includes('audit')) return 'audit';
    if (form.id.includes('newsletter')) return 'newsletter';
    return 'other';
}

// ========================================
// CONVERSION TRACKING
// ========================================

function trackConversion(conversionType, value = 0, currency = 'USD') {
    const conversionData = {
        conversion_type: conversionType,
        value: value,
        currency: currency,
        timestamp: new Date().toISOString()
    };
    
    // Google Analytics Enhanced Ecommerce
    if (typeof gtag !== 'undefined') {
        gtag('event', 'conversion', {
            'send_to': 'GA_MEASUREMENT_ID/CONVERSION_LABEL', // Replace with your conversion label
            'value': value,
            'currency': currency,
            'transaction_id': generateTransactionId()
        });
    }
    
    // Facebook Pixel Conversion
    if (typeof fbq !== 'undefined') {
        fbq('track', 'Lead', {
            value: value,
            currency: currency,
            content_name: conversionType
        });
    }
    
    // LinkedIn Conversion
    if (typeof lintrk !== 'undefined') {
        lintrk('track', { conversion_id: 'LINKEDIN_CONVERSION_ID' }); // Replace with your conversion ID
    }
    
    trackEvent('conversion', conversionData);
}

function generateTransactionId() {
    return 'txn_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
}

// ========================================
// HEAT MAP INTEGRATION
// ========================================

function initializeHeatMap() {
    // Hotjar
    (function(h,o,t,j,a,r){
        h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
        h._hjSettings={hjid:YOUR_HOTJAR_ID,hjsv:6}; // Replace with your Hotjar ID
        a=o.getElementsByTagName('head')[0];
        r=o.createElement('script');r.async=1;
        r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
        a.appendChild(r);
    })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
    
    // Microsoft Clarity
    (function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", "YOUR_CLARITY_ID"); // Replace with your Clarity ID
}

// ========================================
// PERFORMANCE TRACKING
// ========================================

function trackPerformance() {
    // Track page load time
    window.addEventListener('load', function() {
        setTimeout(function() {
            const perfData = performance.timing;
            const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
            const domReadyTime = perfData.domContentLoadedEventEnd - perfData.navigationStart;
            
            trackEvent('performance', {
                page_load_time: pageLoadTime,
                dom_ready_time: domReadyTime,
                page_url: window.location.href
            });
        }, 0);
    });
    
    // Track Core Web Vitals
    if ('web-vitals' in window) {
        import('https://unpkg.com/web-vitals@3/dist/web-vitals.js').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
            getCLS(metric => trackEvent('core_web_vital', { metric: 'CLS', value: metric.value }));
            getFID(metric => trackEvent('core_web_vital', { metric: 'FID', value: metric.value }));
            getFCP(metric => trackEvent('core_web_vital', { metric: 'FCP', value: metric.value }));
            getLCP(metric => trackEvent('core_web_vital', { metric: 'LCP', value: metric.value }));
            getTTFB(metric => trackEvent('core_web_vital', { metric: 'TTFB', value: metric.value }));
        });
    }
}

// ========================================
// ERROR TRACKING
// ========================================

function initializeErrorTracking() {
    // JavaScript errors
    window.addEventListener('error', function(e) {
        trackEvent('javascript_error', {
            error_message: e.message,
            error_source: e.filename,
            error_line: e.lineno,
            error_column: e.colno,
            stack_trace: e.error ? e.error.stack : 'No stack trace'
        });
    });
    
    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', function(e) {
        trackEvent('promise_rejection', {
            error_message: e.reason.toString(),
            stack_trace: e.reason.stack || 'No stack trace'
        });
    });
}

// ========================================
// INITIALIZATION
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    // Event tracking (only works if GA is loaded via cookie consent)
    initializeScrollTracking();
    initializeTimeTracking();
    initializeClickTracking();
    initializeFormTracking();
    initializeErrorTracking();
    
    // Track page view if GA is available
    if (typeof gtag !== 'undefined') {
        trackEvent('page_view', {
            page_url: window.location.href,
            page_title: document.title,
        user_id: getUserId(),
        session_id: getSessionId()
    });
    
    // Track user engagement
    let isEngaged = false;
    const engagementEvents = ['click', 'scroll', 'keydown', 'mousemove'];
    
    function markEngaged() {
        if (!isEngaged) {
            isEngaged = true;
            trackEvent('user_engaged', {
                time_to_engagement: Date.now() - performance.timing.navigationStart
            });
            
            // Remove event listeners after engagement is tracked
            engagementEvents.forEach(event => {
                document.removeEventListener(event, markEngaged);
            });
        }
    }
    
    // Add engagement tracking
    engagementEvents.forEach(event => {
        document.addEventListener(event, markEngaged, { once: false });
    });
    
    // Auto-remove engagement listeners after 30 seconds
    setTimeout(() => {
        engagementEvents.forEach(event => {
            document.removeEventListener(event, markEngaged);
        });
    }, 30000);
});

// Export functions for use in other scripts
window.trackEvent = trackEvent;
window.trackConversion = trackConversion;
