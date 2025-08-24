/**
 * SW Update Checker - Detecta y maneja actualizaciones del Service Worker
 * Se ejecuta automáticamente al cargar la página
 */

class ServiceWorkerUpdateManager {
    constructor() {
        this.swRegistration = null;
        this.updateAvailable = false;
        this.init();
    }

    async init() {
        if ('serviceWorker' in navigator) {
            try {
                this.swRegistration = await navigator.serviceWorker.register('/sw.js');
                this.setupUpdateListeners();
                this.checkForUpdates();
                console.log('SW Update Manager initialized');
            } catch (error) {
                console.error('SW Update Manager failed to initialize:', error);
            }
        }
    }

    setupUpdateListeners() {
        // Escuchar cuando hay un nuevo SW esperando
        this.swRegistration.addEventListener('updatefound', () => {
            const newWorker = this.swRegistration.installing;
            
            newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    // Hay una actualización disponible
                    this.updateAvailable = true;
                    this.notifyUpdateAvailable();
                }
            });
        });

        // Escuchar mensajes del SW
        navigator.serviceWorker.addEventListener('message', (event) => {
            if (event.data.type === 'SW_UPDATED') {
                this.handleSwUpdated();
            }
        });

        // Verificar si hay un SW esperando al cargar la página
        if (this.swRegistration.waiting) {
            this.updateAvailable = true;
            this.notifyUpdateAvailable();
        }
    }

    checkForUpdates() {
        // Verificar actualizaciones cada 10 minutos
        setInterval(() => {
            if (this.swRegistration) {
                this.swRegistration.update();
            }
        }, 10 * 60 * 1000);

        // Verificar al recuperar el foco de la ventana
        window.addEventListener('focus', () => {
            if (this.swRegistration) {
                this.swRegistration.update();
            }
        });
    }

    notifyUpdateAvailable() {
        // Notificación discreta al usuario
        this.showUpdateNotification();
    }

    showUpdateNotification() {
        // Crear notificación no intrusiva
        const notification = document.createElement('div');
        notification.id = 'sw-update-notification';
        notification.innerHTML = `
            <div style="
                position: fixed;
                top: 20px;
                right: 20px;
                background: #4CAF50;
                color: white;
                padding: 15px 20px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                z-index: 10000;
                font-family: Arial, sans-serif;
                font-size: 14px;
                max-width: 300px;
                display: flex;
                align-items: center;
                gap: 10px;
            ">
                <span>Nueva versión disponible</span>
                <button onclick="window.swUpdateManager.activateUpdate()" style="
                    background: transparent;
                    border: 1px solid white;
                    color: white;
                    padding: 5px 10px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 12px;
                ">Actualizar</button>
                <button onclick="this.parentElement.parentElement.remove()" style="
                    background: transparent;
                    border: none;
                    color: white;
                    cursor: pointer;
                    font-size: 16px;
                    padding: 0 5px;
                ">&times;</button>
            </div>
        `;
        
        document.body.appendChild(notification);

        // Auto-remover después de 30 segundos
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 30000);
    }

    activateUpdate() {
        if (this.swRegistration && this.swRegistration.waiting) {
            // Enviar mensaje al SW para que se active
            this.swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
            
            // Remover notificación
            const notification = document.getElementById('sw-update-notification');
            if (notification) {
                notification.remove();
            }

            // Mostrar mensaje de recarga
            this.showReloadMessage();
        }
    }

    showReloadMessage() {
        const message = document.createElement('div');
        message.innerHTML = `
            <div style="
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: white;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                z-index: 10001;
                text-align: center;
                font-family: Arial, sans-serif;
            ">
                <h3 style="margin-top: 0; color: #333;">Actualizando...</h3>
                <p style="margin-bottom: 15px; color: #666;">La página se recargará automáticamente</p>
                <div style="
                    width: 30px;
                    height: 30px;
                    border: 3px solid #f3f3f3;
                    border-top: 3px solid #4CAF50;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin: 0 auto;
                "></div>
            </div>
            <style>
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            </style>
        `;
        
        document.body.appendChild(message);
    }

    handleSwUpdated() {
        // Recargar la página para usar la nueva versión
        setTimeout(() => {
            window.location.reload();
        }, 1500);
    }
}

// Inicializar automáticamente
window.swUpdateManager = new ServiceWorkerUpdateManager();