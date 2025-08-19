document.addEventListener('DOMContentLoaded', () => {
    console.log('⚪️ Events.js: Script cargado y listo.');

    // --- LÓGICA PARA EL SCROLL SUAVE DE LA NAVEGACIÓN ---
    const navLinks = document.querySelectorAll('.main-nav a[href^="#"]');
    console.log(`🔵 Events.js: Encontrados ${navLinks.length} enlaces de navegación para scroll.`);

    navLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                console.log(`🔵 Events.js: Navegando suavemente hacia ${targetId}`);
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            } else {
                console.warn(`🟠 Events.js: No se encontró el elemento de destino para el ancla ${targetId}`);
            }
        });
    });

    // --- AQUÍ SE PUEDEN AÑADIR OTROS EVENTOS DE LA LANDING ---
});