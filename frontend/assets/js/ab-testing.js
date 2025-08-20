/**
 * A/B Testing Framework
 * Testing de variantes para optimización de conversión
 * Pablo Cabello - Aparejador Premium
 */

class ABTestingFramework {
    constructor() {
        this.tests = new Map();
        this.userSegment = this.getUserSegment();
        this.init();
    }

    init() {
        this.setupTests();
        this.applyTests();
        this.trackTestPerformance();
    }

    setupTests() {
        // Test 1: Hero Headlines
        this.createTest('hero_headline', {
            description: 'Testing different hero headlines for conversion',
            variants: [
                {
                    name: 'original',
                    weight: 34,
                    changes: {
                        '#hero h1': 'Reduzco un <span class="highlight">40% los costes</span> de construcción mientras garantizo entregas puntuales en retail'
                    }
                },
                {
                    name: 'urgency',
                    weight: 33,
                    changes: {
                        '#hero h1': 'Últimas 3 plazas disponibles: <span class="highlight">40% menos costes</span> y entregas garantizadas en retail'
                    }
                },
                {
                    name: 'social_proof',
                    weight: 33,
                    changes: {
                        '#hero h1': '<span class="highlight">+20 franquicias</span> confían en mi metodología que reduce 40% costes en retail'
                    }
                }
            ]
        });

        // Test 2: CTA Principal
        this.createTest('main_cta', {
            description: 'Testing different CTA copy for better conversion',
            variants: [
                {
                    name: 'original',
                    weight: 25,
                    changes: {
                        '#hero .cta-button span': '¡Hablemos de tu proyecto!'
                    }
                },
                {
                    name: 'value_focused',
                    weight: 25,
                    changes: {
                        '#hero .cta-button span': 'Calcula tu ahorro en 5 min'
                    }
                },
                {
                    name: 'urgency_driven',
                    weight: 25,
                    changes: {
                        '#hero .cta-button span': 'Reserva tu consultoría gratuita'
                    }
                },
                {
                    name: 'risk_reversal',
                    weight: 25,
                    changes: {
                        '#hero .cta-button span': 'Análisis gratuito sin compromiso'
                    }
                }
            ]
        });

        // Test 3: Testimonial Position
        this.createTest('testimonial_position', {
            description: 'Testing testimonial placement for credibility',
            variants: [
                {
                    name: 'after_trust',
                    weight: 50,
                    changes: {} // Current position
                },
                {
                    name: 'after_hero',
                    weight: 50,
                    changes: {
                        'move_testimonial': 'after_hero'
                    }
                }
            ]
        });

        // Test 4: Form Length
        this.createTest('form_complexity', {
            description: 'Testing form complexity vs conversion rate',
            variants: [
                {
                    name: 'full_form',
                    weight: 50,
                    changes: {} // Current detailed form
                },
                {
                    name: 'minimal_form',
                    weight: 50,
                    changes: {
                        'hide_fields': ['company', 'phone', 'project-type', 'budget', 'timeline']
                    }
                }
            ]
        });
    }

    createTest(testName, config) {
        this.tests.set(testName, {
            ...config,
            startDate: new Date(),
            isActive: true
        });
    }

    applyTests() {
        this.tests.forEach((test, testName) => {
            if (!test.isActive) return;
            
            const selectedVariant = this.selectVariant(testName, test.variants);
            this.applyVariant(testName, selectedVariant);
            
            // Track test assignment
            gtag('event', 'ab_test_assigned', {
                event_category: 'ab_testing',
                event_label: `${testName}_${selectedVariant.name}`,
                custom_parameter_1: testName,
                custom_parameter_2: selectedVariant.name
            });
        });
    }

    selectVariant(testName, variants) {
        const userId = this.getUserId();
        const hash = this.hashCode(userId + testName);
        
        // Weighted selection
        let totalWeight = variants.reduce((sum, variant) => sum + variant.weight, 0);
        let random = (hash % totalWeight);
        
        let cumulativeWeight = 0;
        for (const variant of variants) {
            cumulativeWeight += variant.weight;
            if (random < cumulativeWeight) {
                return variant;
            }
        }
        
        return variants[0]; // Fallback
    }

    applyVariant(testName, variant) {
        // Store selected variant for tracking
        localStorage.setItem(`ab_test_${testName}`, variant.name);
        
        // Apply changes
        Object.entries(variant.changes).forEach(([selector, content]) => {
            if (selector === 'move_testimonial') {
                this.moveTestimonial(content);
            } else if (selector === 'hide_fields') {
                this.hideFormFields(content);
            } else {
                const element = document.querySelector(selector);
                if (element) {
                    element.innerHTML = content;
                }
            }
        });
    }

    moveTestimonial(position) {
        const testimonial = document.querySelector('.testimonial-featured');
        if (!testimonial) return;
        
        if (position === 'after_hero') {
            const hero = document.querySelector('#hero');
            if (hero && hero.nextElementSibling) {
                hero.parentNode.insertBefore(testimonial.cloneNode(true), hero.nextElementSibling);
                testimonial.remove();
            }
        }
    }

    hideFormFields(fieldsToHide) {
        fieldsToHide.forEach(fieldName => {
            const field = document.querySelector(`#${fieldName}`);
            if (field) {
                const formGroup = field.closest('.form-group');
                if (formGroup) {
                    formGroup.style.display = 'none';
                }
            }
        });
    }

    trackTestPerformance() {
        // Track conversions by test variant
        document.addEventListener('submit', (e) => {
            if (e.target.id === 'contact-form') {
                this.tests.forEach((test, testName) => {
                    const variant = localStorage.getItem(`ab_test_${testName}`);
                    if (variant) {
                        gtag('event', 'ab_test_conversion', {
                            event_category: 'ab_testing',
                            event_label: `${testName}_${variant}`,
                            value: 1,
                            custom_parameter_1: testName,
                            custom_parameter_2: variant
                        });
                    }
                });
            }
        });

        // Track micro-conversions (CTA clicks)
        document.querySelectorAll('.cta-button, .cta-button-secondary').forEach(button => {
            button.addEventListener('click', () => {
                this.tests.forEach((test, testName) => {
                    const variant = localStorage.getItem(`ab_test_${testName}`);
                    if (variant) {
                        gtag('event', 'ab_test_cta_click', {
                            event_category: 'ab_testing',
                            event_label: `${testName}_${variant}`,
                            value: 1,
                            custom_parameter_1: testName,
                            custom_parameter_2: variant
                        });
                    }
                });
            });
        });
    }

    getUserSegment() {
        // Determine user segment based on various factors
        const userAgent = navigator.userAgent;
        const referrer = document.referrer;
        const timeOfDay = new Date().getHours();
        
        let segment = 'default';
        
        // Mobile vs Desktop
        if (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
            segment = 'mobile';
        } else {
            segment = 'desktop';
        }
        
        // Traffic source
        if (referrer.includes('google')) {
            segment += '_google';
        } else if (referrer.includes('linkedin')) {
            segment += '_linkedin';
        } else if (referrer === '') {
            segment += '_direct';
        }
        
        // Time-based segmentation
        if (timeOfDay >= 9 && timeOfDay <= 17) {
            segment += '_business_hours';
        } else {
            segment += '_after_hours';
        }
        
        return segment;
    }

    getUserId() {
        let userId = localStorage.getItem('ab_test_user_id');
        if (!userId) {
            userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('ab_test_user_id', userId);
        }
        return userId;
    }

    hashCode(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash);
    }

    // Method to manually end a test
    endTest(testName) {
        const test = this.tests.get(testName);
        if (test) {
            test.isActive = false;
            test.endDate = new Date();
            
            gtag('event', 'ab_test_ended', {
                event_category: 'ab_testing',
                event_label: testName,
                custom_parameter_1: testName
            });
        }
    }

    // Method to get test results
    getTestResults(testName) {
        // This would typically fetch results from analytics
        // For now, just return the test configuration
        return this.tests.get(testName);
    }
}

// TEMPORARILY DISABLED: A/B Testing causing H1 content conflicts
// This was causing different H1 content to appear across devices/browsers
document.addEventListener('DOMContentLoaded', () => {
    // A/B Testing DISABLED - was modifying H1 content
    console.log('A/B Testing temporalmente desactivado - conflictaba con caché');
    
    // Uncomment to re-enable when needed:
    // const isProduction = window.location.hostname !== 'localhost';
    // const abTestingEnabled = localStorage.getItem('enable_ab_testing') === 'true';
    // if (isProduction || abTestingEnabled) {
    //     window.abTesting = new ABTestingFramework();
    // }
});