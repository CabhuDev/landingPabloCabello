/**
 * Performance Optimizer
 * Optimizaciones avanzadas para Core Web Vitals
 * Pablo Cabello - Web Premium
 */

class PerformanceOptimizer {
    constructor() {
        this.init();
    }

    init() {
        this.optimizeImages();
        this.optimizeAnimations();
        this.monitorCoreWebVitals();
        this.setupIntersectionObserver();
        this.preloadCriticalResources();
    }

    optimizeImages() {
        // Intersection Observer para lazy loading avanzado
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    
                    // Placeholder mientras carga
                    if (!img.dataset.loaded) {
                        img.style.filter = 'blur(5px)';
                        img.style.transition = 'filter 0.3s ease';
                        
                        const tempImg = new Image();
                        tempImg.onload = () => {
                            img.src = tempImg.src;
                            img.style.filter = 'none';
                            img.dataset.loaded = 'true';
                        };
                        tempImg.src = img.dataset.src || img.src;
                    }
                    
                    observer.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px 0px',
            threshold: 0.1
        });

        // Observar todas las imágenes
        document.querySelectorAll('img[loading="lazy"]').forEach(img => {
            imageObserver.observe(img);
        });
    }

    optimizeAnimations() {
        // Reducir animaciones si el usuario prefiere menos movimiento
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        
        if (prefersReducedMotion.matches) {
            document.documentElement.style.setProperty('--animation-duration', '0s');
            document.documentElement.style.setProperty('--transition-duration', '0s');
        }

        // Intersection Observer para animaciones on-scroll
        const animationObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        // Elementos que se animan al entrar en viewport
        document.querySelectorAll('.service-item, .case-study, .method-step').forEach(el => {
            el.classList.add('animate-on-scroll');
            animationObserver.observe(el);
        });
    }

    monitorCoreWebVitals() {
        // Largest Contentful Paint (LCP)
        new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            const lastEntry = entries[entries.length - 1];
            
            gtag('event', 'web_vitals', {
                event_category: 'performance',
                event_label: 'LCP',
                value: Math.round(lastEntry.startTime),
                custom_parameter_1: lastEntry.startTime < 2500 ? 'good' : 
                                   lastEntry.startTime < 4000 ? 'needs_improvement' : 'poor'
            });
        }).observe({entryTypes: ['largest-contentful-paint']});

        // First Input Delay (FID)
        new PerformanceObserver((entryList) => {
            entryList.getEntries().forEach(entry => {
                gtag('event', 'web_vitals', {
                    event_category: 'performance',
                    event_label: 'FID',
                    value: Math.round(entry.processingStart - entry.startTime),
                    custom_parameter_1: entry.processingStart - entry.startTime < 100 ? 'good' : 
                                       entry.processingStart - entry.startTime < 300 ? 'needs_improvement' : 'poor'
                });
            });
        }).observe({entryTypes: ['first-input']});

        // Cumulative Layout Shift (CLS)
        let clsValue = 0;
        new PerformanceObserver((entryList) => {
            entryList.getEntries().forEach(entry => {
                if (!entry.hadRecentInput) {
                    clsValue += entry.value;
                }
            });
            
            // Report CLS on page unload
            window.addEventListener('beforeunload', () => {
                gtag('event', 'web_vitals', {
                    event_category: 'performance',
                    event_label: 'CLS',
                    value: Math.round(clsValue * 1000),
                    custom_parameter_1: clsValue < 0.1 ? 'good' : 
                                       clsValue < 0.25 ? 'needs_improvement' : 'poor'
                });
            });
        }).observe({entryTypes: ['layout-shift']});
    }

    setupIntersectionObserver() {
        // Observer para elementos que necesitan tracking de visibilidad
        const visibilityObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    const elementType = element.dataset.trackType || 'unknown';
                    const elementName = element.dataset.trackName || element.id || 'unnamed';
                    
                    gtag('event', 'element_view', {
                        event_category: 'engagement',
                        event_label: `${elementType}_${elementName}`,
                        value: Math.round(entry.intersectionRatio * 100)
                    });
                }
            });
        }, {
            threshold: [0.25, 0.5, 0.75]
        });

        // Elementos importantes para tracking
        document.querySelectorAll('#hero, #confianza, #servicios, #proyectos, #contacto').forEach(section => {
            section.dataset.trackType = 'section';
            section.dataset.trackName = section.id;
            visibilityObserver.observe(section);
        });
    }

    preloadCriticalResources() {
        // Preload de recursos críticos cuando sean necesarios
        const criticalResources = [
            '/assets/css/style.css',
            '/assets/js/form-handler.js'
        ];

        // Preload con Intersection Observer para recursos no críticos
        const resourceObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const link = document.createElement('link');
                    link.rel = 'preload';
                    link.href = entry.target.dataset.preload;
                    link.as = entry.target.dataset.preloadAs || 'script';
                    document.head.appendChild(link);
                    
                    resourceObserver.unobserve(entry.target);
                }
            });
        });

        // Marcar elementos que necesitan preload
        document.querySelectorAll('[data-preload]').forEach(el => {
            resourceObserver.observe(el);
        });
    }

    // Método para reportar errores de performance
    reportPerformanceIssue(issue, details) {
        gtag('event', 'performance_issue', {
            event_category: 'error',
            event_label: issue,
            value: 1,
            custom_parameter_1: details
        });
    }

    // Método para optimizar formularios
    optimizeForms() {
        const forms = document.querySelectorAll('form');
        
        forms.forEach(form => {
            // Debounce para validación en tiempo real
            const inputs = form.querySelectorAll('input, textarea, select');
            
            inputs.forEach(input => {
                let timeoutId;
                input.addEventListener('input', () => {
                    clearTimeout(timeoutId);
                    timeoutId = setTimeout(() => {
                        this.validateField(input);
                    }, 300);
                });
            });
        });
    }

    validateField(field) {
        const feedback = field.parentNode.querySelector('.input-feedback');
        if (!feedback) return;

        // Validaciones básicas
        let isValid = true;
        let message = '';

        if (field.hasAttribute('required') && !field.value.trim()) {
            isValid = false;
            message = 'Este campo es obligatorio';
        } else if (field.type === 'email' && field.value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(field.value)) {
                isValid = false;
                message = 'Introduce un email válido';
            }
        } else if (field.type === 'tel' && field.value) {
            const phoneRegex = /^[+]?[0-9\s()-]{9,}$/;
            if (!phoneRegex.test(field.value)) {
                isValid = false;
                message = 'Introduce un teléfono válido';
            }
        }

        // Aplicar estilos de validación
        if (isValid && field.value) {
            field.style.borderColor = '#38A169';
            feedback.textContent = '✓ Correcto';
            feedback.className = 'input-feedback success';
        } else if (!isValid) {
            field.style.borderColor = '#e74c3c';
            feedback.textContent = message;
            feedback.className = 'input-feedback error';
        } else {
            field.style.borderColor = '#CBD5E0';
            feedback.textContent = '';
            feedback.className = 'input-feedback';
        }
    }
}

// Service Worker registration REMOVED - now handled in index.html
// This was causing conflicts with the main SW registration
// Service Worker is now properly managed in index.html with cache clearing

// Initialize Performance Optimizer
document.addEventListener('DOMContentLoaded', () => {
    window.performanceOptimizer = new PerformanceOptimizer();
});

// Monitor resource loading errors
window.addEventListener('error', (e) => {
    if (e.target !== window) {
        gtag('event', 'resource_error', {
            event_category: 'error',
            event_label: e.target.src || e.target.href || 'unknown',
            value: 1
        });
    }
});

// Monitor unhandled promise rejections
window.addEventListener('unhandledrejection', (e) => {
    gtag('event', 'promise_rejection', {
        event_category: 'error',
        event_label: e.reason.toString(),
        value: 1
    });
});