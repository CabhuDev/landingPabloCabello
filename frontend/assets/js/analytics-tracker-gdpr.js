/**
 * Analytics Tracker Premium - GDPR Compliant
 * Tracking avanzado para conversiones y micro-interacciones
 * Pablo Cabello - Aparejador Premium
 * Compatible con sistema de gestión de cookies
 */

class AnalyticsTracker {
    constructor() {
        this.consentChecked = false;
        this.init();
        this.setupScrollTracking();
        this.setupClickTracking();
        this.setupFormTracking();
        this.setupTimeOnPage();
    }

    // Verificar consentimiento antes de cualquier tracking
    hasAnalyticsConsent() {
        const consent = localStorage.getItem('pablo-cabello-cookies');
        if (!consent) return false;
        
        try {
            const consentData = JSON.parse(consent);
            return consentData.analytics === true;
        } catch (e) {
            return false;
        }
    }

    // Track solo si hay consentimiento
    trackEvent(eventName, parameters = {}) {
        if (!this.hasAnalyticsConsent()) {
            console.log('Analytics tracking disabled - no consent');
            return;
        }

        if (typeof gtag === 'function') {
            gtag('event', eventName, parameters);
        } else {
            console.log('gtag not available, tracking:', eventName, parameters);
        }
    }

    init() {
        console.log('Analytics Tracker Premium inicializado (GDPR Compliant)');
        
        // Track page load performance solo con consentimiento
        window.addEventListener('load', () => {
            if (!this.hasAnalyticsConsent()) return;
            
            const navigationTiming = performance.getEntriesByType('navigation')[0];
            if (navigationTiming) {
                this.trackEvent('page_load_time', {
                    event_category: 'performance',
                    value: Math.round(navigationTiming.loadEventEnd - navigationTiming.loadEventStart),
                    event_label: 'load_complete'
                });
            }
        });
    }

    setupScrollTracking() {
        let scrollPoints = [25, 50, 75, 90, 100];
        let scrolledPoints = [];
        
        window.addEventListener('scroll', () => {
            if (!this.hasAnalyticsConsent()) return;
            
            const scrollPercent = Math.round(
                (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
            );
            
            scrollPoints.forEach(point => {
                if (scrollPercent >= point && !scrolledPoints.includes(point)) {
                    scrolledPoints.push(point);
                    this.trackEvent('scroll_depth', {
                        event_category: 'engagement',
                        event_label: `${point}%`,
                        value: point
                    });
                }
            });
        });
    }

    setupClickTracking() {
        document.addEventListener('click', (e) => {
            if (!this.hasAnalyticsConsent()) return;
            
            const target = e.target.closest('a, button');
            if (!target) return;

            let eventData = {
                event_category: 'interaction',
                event_label: window.location.pathname
            };

            // Track CTA buttons
            if (target.classList.contains('cta-button')) {
                eventData.event_category = 'cta_click';
                eventData.cta_text = target.textContent.trim();
            }

            // Track external links
            if (target.tagName === 'A' && target.href) {
                const isExternal = target.hostname !== window.location.hostname;
                if (isExternal) {
                    eventData.event_category = 'external_link';
                    eventData.destination = target.hostname;
                }
            }

            this.trackEvent('click', eventData);
        });
    }

    setupFormTracking() {
        const forms = document.querySelectorAll('form');
        
        forms.forEach(form => {
            // Track form start
            const inputs = form.querySelectorAll('input, textarea, select');
            inputs.forEach(input => {
                input.addEventListener('focus', () => {
                    if (!this.hasAnalyticsConsent()) return;
                    
                    this.trackEvent('form_start', {
                        event_category: 'form',
                        form_name: form.id || 'unnamed_form',
                        event_label: input.name || input.type
                    });
                }, { once: true });
            });

            // Track form submission
            form.addEventListener('submit', (e) => {
                if (!this.hasAnalyticsConsent()) return;
                
                this.trackEvent('form_submit', {
                    event_category: 'lead_generation',
                    form_name: form.id || 'unnamed_form',
                    event_label: window.location.pathname
                });
            });
        });
    }

    setupTimeOnPage() {
        let startTime = Date.now();
        let milestones = [30, 60, 120, 300]; // seconds
        let tracked = [];

        setInterval(() => {
            if (!this.hasAnalyticsConsent()) return;
            
            const timeOnPage = Math.floor((Date.now() - startTime) / 1000);
            
            milestones.forEach(milestone => {
                if (timeOnPage >= milestone && !tracked.includes(milestone)) {
                    tracked.push(milestone);
                    this.trackEvent('time_on_page', {
                        event_category: 'engagement',
                        event_label: `${milestone}s`,
                        value: milestone
                    });
                }
            });
        }, 10000); // Check every 10 seconds
    }

    // Funciones de conveniencia para tracking específico
    trackPageView(page_title = document.title) {
        this.trackEvent('page_view', {
            page_title: page_title,
            page_location: window.location.href
        });
    }

    trackConversion(value = 0, currency = 'EUR') {
        this.trackEvent('conversion', {
            event_category: 'lead_generation',
            value: value,
            currency: currency
        });
    }

    trackMicroConversion(action, category = 'engagement') {
        this.trackEvent(action, {
            event_category: category,
            event_label: window.location.pathname
        });
    }

    trackFormProgress(step, form_name = 'contact_form') {
        this.trackEvent('form_progress', {
            event_category: 'form',
            event_label: form_name,
            custom_parameter_1: step
        });
    }
}

// Funciones globales para mantener compatibilidad
function trackMicroConversion(action, category = 'engagement') {
    if (window.analyticsTracker) {
        window.analyticsTracker.trackMicroConversion(action, category);
    }
}

function trackFormProgress(step, form_name = 'contact_form') {
    if (window.analyticsTracker) {
        window.analyticsTracker.trackFormProgress(step, form_name);
    }
}

function trackConversion(value = 0, currency = 'EUR') {
    if (window.analyticsTracker) {
        window.analyticsTracker.trackConversion(value, currency);
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.analyticsTracker = new AnalyticsTracker();
    console.log('Analytics Tracker Premium initialized with GDPR compliance');
});
