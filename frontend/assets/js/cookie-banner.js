/**
 * Cookie Banner Premium - Pablo Cabello
 * Sistema de gestión de cookies conforme a RGPD/GDPR
 * Estilo Premium integrado con la web
 */

class CookieBanner {
    constructor() {
        this.cookieName = 'pablo-cabello-cookies';
        this.cookieExpiry = 365; // días
        this.init();
    }

    init() {
        // Verificar si ya hay consentimiento
        if (!this.hasConsent()) {
            this.createBanner();
            this.showBanner();
        } else {
            // Si hay consentimiento, activar cookies
            this.enableCookies();
        }
    }

    hasConsent() {
        const consent = localStorage.getItem(this.cookieName);
        return consent !== null;
    }

    getConsent() {
        const consent = localStorage.getItem(this.cookieName);
        return consent ? JSON.parse(consent) : null;
    }

    createBanner() {
        const banner = document.createElement('div');
        banner.id = 'cookie-banner';
        banner.className = 'cookie-banner';
        banner.innerHTML = `
            <div class="cookie-banner-content">
                <div class="cookie-banner-left">
                    <div class="cookie-icon">🍪</div>
                    <div class="cookie-text">
                        <h4>Uso de Cookies</h4>
                        <p>Utilizamos cookies propias y de terceros para mejorar tu experiencia, analizar el tráfico web y personalizar el contenido. 
                        <a href="/politica-privacidad.html" class="cookie-link">Más información</a></p>
                    </div>
                </div>
                <div class="cookie-banner-actions">
                    <button id="cookie-reject" class="cookie-btn cookie-btn-secondary">Solo necesarias</button>
                    <button id="cookie-settings" class="cookie-btn cookie-btn-outline">Configurar</button>
                    <button id="cookie-accept" class="cookie-btn cookie-btn-primary">Aceptar todas</button>
                </div>
            </div>
        `;

        document.body.appendChild(banner);
        this.attachEvents();
    }

    attachEvents() {
        document.getElementById('cookie-accept').addEventListener('click', () => {
            this.saveConsent({
                necessary: true,
                analytics: true,
                marketing: true,
                preferences: true
            });
            this.hideBanner();
            this.enableCookies();
        });

        document.getElementById('cookie-reject').addEventListener('click', () => {
            this.saveConsent({
                necessary: true,
                analytics: false,
                marketing: false,
                preferences: false
            });
            this.hideBanner();
            this.enableNecessaryCookies();
        });

        document.getElementById('cookie-settings').addEventListener('click', () => {
            this.showSettings();
        });
    }

    showSettings() {
        const modal = document.createElement('div');
        modal.id = 'cookie-settings-modal';
        modal.className = 'cookie-modal-overlay';
        modal.innerHTML = `
            <div class="cookie-modal">
                <div class="cookie-modal-header">
                    <h3>Configuración de Cookies</h3>
                    <button id="cookie-modal-close" class="cookie-modal-close">×</button>
                </div>
                <div class="cookie-modal-content">
                    <div class="cookie-category">
                        <div class="cookie-category-header">
                            <input type="checkbox" id="necessary" checked disabled>
                            <label for="necessary">
                                <strong>Cookies Necesarias</strong>
                                <span class="cookie-required">(Obligatorias)</span>
                            </label>
                        </div>
                        <p>Estas cookies son esenciales para el funcionamiento de la web y no pueden desactivarse.</p>
                    </div>
                    
                    <div class="cookie-category">
                        <div class="cookie-category-header">
                            <input type="checkbox" id="analytics" checked>
                            <label for="analytics"><strong>Cookies de Análisis</strong></label>
                        </div>
                        <p>Nos ayudan a entender cómo los usuarios interactúan con el sitio web (Google Analytics, Hotjar).</p>
                    </div>
                    
                    <div class="cookie-category">
                        <div class="cookie-category-header">
                            <input type="checkbox" id="marketing">
                            <label for="marketing"><strong>Cookies de Marketing</strong></label>
                        </div>
                        <p>Se utilizan para mostrar anuncios personalizados y medir su efectividad.</p>
                    </div>
                    
                    <div class="cookie-category">
                        <div class="cookie-category-header">
                            <input type="checkbox" id="preferences" checked>
                            <label for="preferences"><strong>Cookies de Preferencias</strong></label>
                        </div>
                        <p>Permiten recordar tus preferencias como idioma o región.</p>
                    </div>
                </div>
                <div class="cookie-modal-actions">
                    <button id="cookie-save-settings" class="cookie-btn cookie-btn-primary">Guardar Configuración</button>
                    <button id="cookie-accept-all" class="cookie-btn cookie-btn-secondary">Aceptar Todas</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Event listeners para el modal
        document.getElementById('cookie-modal-close').addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        document.getElementById('cookie-save-settings').addEventListener('click', () => {
            const consent = {
                necessary: true,
                analytics: document.getElementById('analytics').checked,
                marketing: document.getElementById('marketing').checked,
                preferences: document.getElementById('preferences').checked
            };
            this.saveConsent(consent);
            this.hideBanner();
            document.body.removeChild(modal);
            this.enableCookiesBasedOnConsent(consent);
        });

        document.getElementById('cookie-accept-all').addEventListener('click', () => {
            this.saveConsent({
                necessary: true,
                analytics: true,
                marketing: true,
                preferences: true
            });
            this.hideBanner();
            document.body.removeChild(modal);
            this.enableCookies();
        });

        // Cerrar modal al hacer clic fuera
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }

    saveConsent(consent) {
        const consentData = {
            ...consent,
            timestamp: Date.now(),
            version: '1.0'
        };
        localStorage.setItem(this.cookieName, JSON.stringify(consentData));
        
        // Guardar también en cookie para backend
        const expiryDate = new Date();
        expiryDate.setTime(expiryDate.getTime() + (this.cookieExpiry * 24 * 60 * 60 * 1000));
        document.cookie = `${this.cookieName}=${JSON.stringify(consentData)}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Strict`;
    }

    showBanner() {
        const banner = document.getElementById('cookie-banner');
        if (banner) {
            setTimeout(() => {
                banner.classList.add('cookie-banner-show');
            }, 1000); // Mostrar después de 1 segundo
        }
    }

    hideBanner() {
        const banner = document.getElementById('cookie-banner');
        if (banner) {
            banner.classList.add('cookie-banner-hide');
            setTimeout(() => {
                if (banner.parentNode) {
                    banner.parentNode.removeChild(banner);
                }
            }, 500);
        }
    }

    enableCookies() {
        const consent = this.getConsent();
        if (consent && consent.analytics) {
            this.initGoogleAnalytics();
            this.initHotjar();
        }
    }

    enableNecessaryCookies() {
        // Solo cookies técnicas necesarias
        console.log('Solo cookies necesarias activadas');
    }

    enableCookiesBasedOnConsent(consent) {
        if (consent.analytics) {
            this.initGoogleAnalytics();
            this.initHotjar();
        }
    }

    initGoogleAnalytics() {
        // Solo inicializar si no está ya inicializado
        if (typeof gtag === 'undefined') {
            const script = document.createElement('script');
            script.async = true;
            script.src = 'https://www.googletagmanager.com/gtag/js?id=G-KE03XZJNV6';
            document.head.appendChild(script);

            script.onload = () => {
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', 'G-KE03XZJNV6', {
                    send_page_view: true,
                    anonymize_ip: true,
                    custom_map: {
                        'custom_parameter_1': 'lead_source',
                        'custom_parameter_2': 'project_type'
                    }
                });
                window.gtag = gtag;
            };
        }
    }

    initHotjar() {
        if (typeof hj === 'undefined') {
            (function(h,o,t,j,a,r){
                h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
                h._hjSettings={hjid:6500399,hjsv:6};
                a=o.getElementsByTagName('head')[0];
                r=o.createElement('script');r.async=1;
                r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
                a.appendChild(r);
            })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
        }
    }

    // Método para revocar consentimiento
    static revokeConsent() {
        localStorage.removeItem('pablo-cabello-cookies');
        document.cookie = 'pablo-cabello-cookies=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        location.reload();
    }

    // Método para mostrar configuración desde cualquier lugar
    static showCookieSettings() {
        const banner = new CookieBanner();
        banner.showSettings();
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new CookieBanner();
});

// Función global para revocar cookies
window.revokeCookies = CookieBanner.revokeConsent;
window.showCookieSettings = CookieBanner.showCookieSettings;
