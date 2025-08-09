// ========================================
// ANALYTICS & TRACKING
// ========================================

// ========================================
// GOOGLE ANALYTICS 4 SETUP
// ========================================

// Initialize Google Analytics
function initializeGA4() {
    // Replace 'GA_MEASUREMENT_ID' with your actual GA4 measurement ID
    const measurementId = 'GA_MEASUREMENT_ID';
    
    // Load gtag script if not already loaded
    if (!window.gtag) {
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
        document.head.appendChild(script);
        
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        window.gtag = gtag;
        gtag('js', new Date());
        gtag('config', measurementId, {
            page_title: document.title,
            page_location: window.location.href
        });
    }
}

// ========================================
// FACEBOOK PIXEL SETUP
// ========================================

function initializeFacebookPixel() {
    // Replace with your Facebook Pixel ID
    const pixelId = 'YOUR_FACEBOOK_PIXEL_ID';
    
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    
    fbq('init', pixelId);
    fbq('track', 'PageView');
}

// ========================================
// LINKEDIN INSIGHT TAG
// ========================================

function initializeLinkedInInsight() {
    // Replace with your LinkedIn Partner ID
    const partnerId = 'YOUR_LINKEDIN_PARTNER_ID';
    
    _linkedin_partner_id = partnerId;
    window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
    window._linkedin_data_partner_ids.push(_linkedin_partner_id);
    
    (function(l) {
        if (!l){window.lintrk = function(a,b){window.lintrk.q.push([a,b])};
        window.lintrk.q=[]}
        var s = document.getElementsByTagName("script")[0];
        var b = document.createElement("script");
        b.type = "text/javascript";b.async = true;
        b.src = "https://snap.licdn.com/li.lms-analytics/insight.min.js";
        s.parentNode.insertBefore(b, s);})(window.lintrk);
}

// ========================================
// CUSTOM EVENT TRACKING
// ========================================

function trackEvent(eventName, parameters = {}) {
    // Add timestamp and page info
    const eventData = {
        ...parameters,
        timestamp: new Date().toISOString(),
        page_url: window.location.href,
        page_title: document.title,
        user_agent: navigator.userAgent,
        referrer: document.referrer
    };
    
    // Google Analytics 4
    if (typeof gtag !== 'undefined') {
        gtag('event', eventName, eventData);
    }
    
    // Facebook Pixel
    if (typeof fbq !== 'undefined') {
        fbq('track', eventName, eventData);
    }
    
    // LinkedIn Insight
    if (typeof lintrk !== 'undefined') {
        lintrk('track', { conversion_id: eventName });
    }
    
    // Custom analytics endpoint
    sendCustomAnalytics(eventName, eventData);
    
    // Console log for debugging
    console.log('📊 Event tracked:', eventName, eventData);
}

// ========================================
// CUSTOM ANALYTICS ENDPOINT
// ========================================

function sendCustomAnalytics(eventName, data) {
    // Send to your custom analytics service
    const analyticsData = {
        event: eventName,
        data: data,
        session_id: getSessionId(),
        user_id: getUserId()
    };
    
    // Use fetch to send data (replace with your endpoint)
    fetch('/api/analytics', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(analyticsData)
    }).catch(error => {
        console.warn('Failed to send custom analytics:', error);
    });
}

// ========================================
// USER IDENTIFICATION
// ========================================

function getUserId() {
    let userId = localStorage.getItem('user_id');
    if (!userId) {
        userId = 'user_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
        localStorage.setItem('user_id', userId);
    }
    return userId;
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
// GDPR COMPLIANCE
// ========================================

function initializeGDPRCompliance() {
    // Check for consent before initializing tracking
    const hasConsent = localStorage.getItem('analytics_consent');
    
    if (hasConsent === 'true') {
        initializeAllTracking();
    } else {
        showConsentBanner();
    }
}

function showConsentBanner() {
    const banner = document.createElement('div');
    banner.id = 'consent-banner';
    banner.innerHTML = `
        <div class="consent-content">
            <p>We use cookies and analytics to improve your experience. By using our site, you consent to our use of cookies.</p>
            <div class="consent-actions">
                <button id="accept-consent" class="btn btn-primary">Accept</button>
                <button id="decline-consent" class="btn btn-secondary">Decline</button>
                <a href="/privacy-policy" class="privacy-link">Privacy Policy</a>
            </div>
        </div>
    `;
    
    // Add banner styles
    const style = document.createElement('style');
    style.textContent = `
        #consent-banner {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: #1a1a1a;
            color: white;
            padding: 1rem;
            z-index: 10000;
            box-shadow: 0 -4px 20px rgba(0,0,0,0.3);
        }
        .consent-content {
            max-width: 1200px;
            margin: 0 auto;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 1rem;
        }
        .consent-actions {
            display: flex;
            gap: 1rem;
            align-items: center;
        }
        .privacy-link {
            color: #ccc;
            text-decoration: underline;
        }
        @media (max-width: 768px) {
            .consent-content {
                flex-direction: column;
                text-align: center;
            }
        }
    `;
    document.head.appendChild(style);
    document.body.appendChild(banner);
    
    // Handle consent actions
    document.getElementById('accept-consent').addEventListener('click', function() {
        localStorage.setItem('analytics_consent', 'true');
        banner.remove();
        style.remove();
        initializeAllTracking();
    });
    
    document.getElementById('decline-consent').addEventListener('click', function() {
        localStorage.setItem('analytics_consent', 'false');
        banner.remove();
        style.remove();
    });
}

// ========================================
// INITIALIZE ALL TRACKING
// ========================================

function initializeAllTracking() {
    // Core analytics platforms
    initializeGA4();
    // initializeFacebookPixel(); // Uncomment when you have pixel ID
    // initializeLinkedInInsight(); // Uncomment when you have partner ID
    
    // Event tracking
    initializeScrollTracking();
    initializeTimeTracking();
    initializeClickTracking();
    initializeFormTracking();
    
    // Performance and error tracking
    trackPerformance();
    initializeErrorTracking();
    
    // Heat maps (uncomment when you have IDs)
    // initializeHeatMap();
    
    console.log('📈 Analytics initialized successfully');
}

// ========================================
// INITIALIZATION
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    // Initialize GDPR compliance check
    initializeGDPRCompliance();
    
    // Track page view
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
