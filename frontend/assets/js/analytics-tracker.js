/**
 * Analytics Tracker Premium
 * Tracking avanzado para conversiones y micro-interacciones
 * Pablo Cabello - Aparejador Premium
 */

class AnalyticsTracker {
    constructor() {
        this.init();
        this.setupScrollTracking();
        this.setupClickTracking();
        this.setupFormTracking();
        this.setupTimeOnPage();
    }

    init() {
        console.log('Analytics Tracker Premium inicializado');
        
        // Track page load performance
        window.addEventListener('load', () => {
            const navigationTiming = performance.getEntriesByType('navigation')[0];
            if (navigationTiming) {
                gtag('event', 'page_load_time', {
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
            const scrollPercent = Math.round(
                (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
            );
            
            scrollPoints.forEach(point => {
                if (scrollPercent >= point && !scrolledPoints.includes(point)) {
                    scrolledPoints.push(point);
                    gtag('event', 'scroll_depth', {
                        event_category: 'engagement',
                        event_label: `${point}%`,
                        value: point
                    });
                }
            });
        });
    }

    setupClickTracking() {
        // Track CTA clicks
        document.querySelectorAll('.cta-button, .cta-button-secondary').forEach(button => {
            button.addEventListener('click', (e) => {
                const buttonText = e.target.textContent || e.target.innerText;
                gtag('event', 'cta_click', {
                    event_category: 'conversion',
                    event_label: buttonText.trim(),
                    value: this.getCTAValue(buttonText)
                });
            });
        });

        // Track service item clicks
        document.querySelectorAll('.service-item').forEach(service => {
            service.addEventListener('click', () => {
                const serviceName = service.querySelector('h3').textContent;
                gtag('event', 'service_interest', {
                    event_category: 'engagement',
                    event_label: serviceName
                });
            });
        });

        // Track case study interactions
        document.querySelectorAll('.case-study').forEach(caseStudy => {
            caseStudy.addEventListener('click', () => {
                const caseTitle = caseStudy.querySelector('h3').textContent;
                gtag('event', 'case_study_view', {
                    event_category: 'engagement',
                    event_label: caseTitle
                });
            });
        });

        // Track navigation clicks
        document.querySelectorAll('.main-nav a').forEach(link => {
            link.addEventListener('click', (e) => {
                const linkText = e.target.textContent;
                gtag('event', 'navigation_click', {
                    event_category: 'navigation',
                    event_label: linkText
                });
            });
        });
    }

    setupFormTracking() {
        const form = document.getElementById('contact-form');
        if (!form) return;

        const inputs = form.querySelectorAll('input, textarea, select');
        let formStarted = false;
        let fieldsCompleted = new Set();

        // Track form start
        inputs.forEach(input => {
            input.addEventListener('focus', () => {
                if (!formStarted) {
                    formStarted = true;
                    gtag('event', 'form_start', {
                        event_category: 'form',
                        event_label: 'contact_form'
                    });
                }
            });

            // Track field completion
            input.addEventListener('blur', () => {
                if (input.value.trim() && !fieldsCompleted.has(input.name)) {
                    fieldsCompleted.add(input.name);
                    gtag('event', 'form_field_complete', {
                        event_category: 'form',
                        event_label: input.name,
                        value: (fieldsCompleted.size / inputs.length) * 100
                    });
                }
            });
        });

        // Track form submission
        form.addEventListener('submit', (e) => {
            // Collect form data for tracking
            const formData = new FormData(form);
            const projectType = formData.get('project_type') || 'no_especificado';
            const budget = formData.get('budget') || 'no_especificado';
            const timeline = formData.get('timeline') || 'no_especificado';

            gtag('event', 'form_submit', {
                event_category: 'conversion',
                event_label: 'contact_form',
                custom_parameter_1: projectType,
                custom_parameter_2: budget,
                value: this.getLeadValue(budget)
            });

            // Track high-value leads
            if (this.isHighValueLead(budget, projectType)) {
                gtag('event', 'high_value_lead', {
                    event_category: 'conversion',
                    event_label: `${projectType}_${budget}`,
                    value: this.getLeadValue(budget)
                });
            }
        });
    }

    setupTimeOnPage() {
        let startTime = Date.now();
        let maxTime = 0;
        let intervals = [30, 60, 120, 300]; // 30s, 1m, 2m, 5m
        let trackedIntervals = [];

        setInterval(() => {
            const timeOnPage = Math.round((Date.now() - startTime) / 1000);
            maxTime = Math.max(maxTime, timeOnPage);

            intervals.forEach(interval => {
                if (timeOnPage >= interval && !trackedIntervals.includes(interval)) {
                    trackedIntervals.push(interval);
                    gtag('event', 'time_on_page', {
                        event_category: 'engagement',
                        event_label: `${interval}s`,
                        value: interval
                    });
                }
            });
        }, 5000);

        // Track exit intent
        document.addEventListener('mouseleave', (e) => {
            if (e.clientY <= 0) {
                gtag('event', 'exit_intent', {
                    event_category: 'engagement',
                    event_label: 'mouse_leave',
                    value: maxTime
                });
            }
        });
    }

    getCTAValue(buttonText) {
        const highValueCTAs = {
            'hablemos de tu proyecto': 100,
            'solicitar consultoría gratuita': 150,
            'calculemos tu ahorro potencial': 125,
            'ver proyectos reales': 75
        };
        
        const normalizedText = buttonText.toLowerCase().trim();
        return highValueCTAs[normalizedText] || 50;
    }

    getLeadValue(budget) {
        const budgetValues = {
            '20k-50k': 200,
            '50k-100k': 400,
            '100k-200k': 600,
            '200k+': 800
        };
        return budgetValues[budget] || 100;
    }

    isHighValueLead(budget, projectType) {
        const highValueBudgets = ['100k-200k', '200k+'];
        const highValueProjects = ['nueva-apertura', 'reforma-integral'];
        
        return highValueBudgets.includes(budget) || 
               (highValueProjects.includes(projectType) && budget !== '20k-50k');
    }

    // A/B Testing utilities
    setupABTest(testName, variants) {
        const userId = this.getUserId();
        const variantIndex = this.hashCode(userId + testName) % variants.length;
        const selectedVariant = variants[variantIndex];
        
        gtag('event', 'ab_test_assignment', {
            event_category: 'ab_test',
            event_label: `${testName}_${selectedVariant.name}`,
            custom_parameter_1: testName,
            custom_parameter_2: selectedVariant.name
        });

        return selectedVariant;
    }

    getUserId() {
        let userId = localStorage.getItem('user_id');
        if (!userId) {
            userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('user_id', userId);
        }
        return userId;
    }

    hashCode(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return Math.abs(hash);
    }
}

// Error tracking
window.addEventListener('error', (e) => {
    gtag('event', 'javascript_error', {
        event_category: 'error',
        event_label: e.message,
        value: 1
    });
});

// Unhandled promise rejections
window.addEventListener('unhandledrejection', (e) => {
    gtag('event', 'promise_rejection', {
        event_category: 'error',
        event_label: e.reason.toString(),
        value: 1
    });
});

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.analyticsTracker = new AnalyticsTracker();
    
    // A/B Test for hero headline
    const heroVariants = [
        {
            name: 'original',
            headline: 'Reduzco un 40% los costes de construcción mientras garantizo entregas puntuales en retail'
        },
        {
            name: 'urgency',
            headline: 'Último mes con disponibilidad: Reduzco 40% costes y garantizo entregas puntuales'
        },
        {
            name: 'social_proof',
            headline: '+20 franquicias confían en mi metodología que reduce 40% costes de construcción'
        }
    ];
    
    const selectedVariant = window.analyticsTracker.setupABTest('hero_headline', heroVariants);
    
    // Apply the selected variant (commented out to maintain current design)
    // const heroHeadline = document.querySelector('#hero h1');
    // if (heroHeadline && selectedVariant.name !== 'original') {
    //     heroHeadline.innerHTML = selectedVariant.headline.replace('40%', '<span class="highlight">40%</span>');
    // }
});