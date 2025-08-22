
document.addEventListener('DOMContentLoaded', () => {
    const langButtons = {
        es: document.getElementById('lang-es'),
        en: document.getElementById('lang-en')
    };

    // Función para cambiar los textos de la página
    const setLanguage = (lang) => {
        // 1. Encontrar todos los elementos que tienen traducciones
        const elementsToTranslate = document.querySelectorAll('[data-lang-es]');

        // 2. Recorrer cada elemento y cambiar su texto al idioma seleccionado
        elementsToTranslate.forEach(element => {
            const text = element.getAttribute(`data-lang-${lang}`);
            if (text) {
                element.textContent = text;
            }
        });

        // 3. Actualizar el estilo del botón activo
        Object.values(langButtons).forEach(button => button.classList.remove('active'));
        if (langButtons[lang]) {
            langButtons[lang].classList.add('active');
        }

        // 4. Guardar la preferencia de idioma en el almacenamiento local
        localStorage.setItem('language', lang);
    };

    // Añadir listeners a los botones
    if (langButtons.es) {
        langButtons.es.addEventListener('click', () => setLanguage('es'));
    }
    if (langButtons.en) {
        langButtons.en.addEventListener('click', () => setLanguage('en'));
    }

    // Al cargar la página, comprobar si hay un idioma guardado o usar 'es' por defecto
    const savedLang = localStorage.getItem('language') || 'es';
    setLanguage(savedLang);
});
