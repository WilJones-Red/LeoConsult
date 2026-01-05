/**
 * Cookie Consent Manager for Leo Consult
 * GDPR/CCPA compliant cookie consent system
 */

const CookieConsent = {
    COOKIE_NAME: 'leo_cookie_consent',
    COOKIE_EXPIRY_DAYS: 365,
    GA_ID: 'G-BPKJS0RX47',

    init() {
        // Check if user has already made a choice
        const consent = this.getConsent();
        
        if (consent === null) {
            // No choice made yet, show banner
            this.showBanner();
        } else if (consent === 'accepted') {
            // User accepted, load analytics
            this.loadGoogleAnalytics();
        }
        // If rejected, do nothing (no tracking)
    },

    getConsent() {
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            const [name, value] = cookie.trim().split('=');
            if (name === this.COOKIE_NAME) {
                return value;
            }
        }
        return null;
    },

    setConsent(value) {
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + this.COOKIE_EXPIRY_DAYS);
        document.cookie = `${this.COOKIE_NAME}=${value};expires=${expiryDate.toUTCString()};path=/;SameSite=Lax`;
    },

    showBanner() {
        const banner = document.createElement('div');
        banner.id = 'cookie-consent-banner';
        banner.innerHTML = `
            <div class="cookie-consent-content">
                <div class="cookie-consent-text">
                    <p>We use cookies to improve your experience and analyze site traffic. You can choose to accept or decline.</p>
                </div>
                <div class="cookie-consent-actions">
                    <button id="cookie-accept" class="cookie-btn cookie-btn-accept">Accept</button>
                    <button id="cookie-reject" class="cookie-btn cookie-btn-reject">Essential Only</button>
                    <a href="privacy-policy.html" class="cookie-link">Privacy Policy</a>
                </div>
            </div>
        `;
        document.body.appendChild(banner);

        // Add event listeners
        document.getElementById('cookie-accept').addEventListener('click', () => this.accept());
        document.getElementById('cookie-reject').addEventListener('click', () => this.reject());

        // Fade in animation
        setTimeout(() => banner.classList.add('show'), 100);
    },

    hideBanner() {
        const banner = document.getElementById('cookie-consent-banner');
        if (banner) {
            banner.classList.remove('show');
            setTimeout(() => banner.remove(), 300);
        }
    },

    accept() {
        this.setConsent('accepted');
        this.hideBanner();
        this.loadGoogleAnalytics();
        
        // Track consent acceptance
        if (typeof gtag !== 'undefined') {
            gtag('event', 'cookie_consent', {
                'event_category': 'consent',
                'event_label': 'accepted'
            });
        }
    },

    reject() {
        this.setConsent('rejected');
        this.hideBanner();
        
        // Optional: Send rejection event without tracking user
        console.log('Analytics cookies rejected');
    },

    loadGoogleAnalytics() {
        // Create and inject Google Analytics script
        if (!window.dataLayer) {
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            window.gtag = gtag;
            
            gtag('js', new Date());
            gtag('config', this.GA_ID, {
                'anonymize_ip': true, // GDPR compliance
                'cookie_flags': 'SameSite=None;Secure'
            });

            // Load GA script
            const script = document.createElement('script');
            script.async = true;
            script.src = `https://www.googletagmanager.com/gtag/js?id=${this.GA_ID}`;
            document.head.appendChild(script);
        }
    }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => CookieConsent.init());
} else {
    CookieConsent.init();
}
