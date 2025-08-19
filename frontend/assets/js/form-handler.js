document.addEventListener('DOMContentLoaded', () => {
    console.log('⚪️ Form-handler.js: Script cargado y listo.');

    const form = document.getElementById('contact-form');
    const statusDiv = document.getElementById('form-status');
    const submitButton = form.querySelector('button[type="submit"]');

    if (!form || !statusDiv || !submitButton) {
        console.error('🔴 Form-handler.js: No se encontraron los elementos críticos del formulario en el DOM.');
        return;
    }

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        console.log('🟡 Form-handler.js: Envío de formulario interceptado.');

        const originalButtonText = submitButton.textContent;
        submitButton.disabled = true;
        submitButton.textContent = 'Enviando...';
        statusDiv.textContent = '';
        statusDiv.style.color = '';

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        console.log('🔵 Form-handler.js: Datos del formulario recopilados:', data);

        try {
            console.log('🟠 Form-handler.js: Intentando enviar datos al endpoint /api/v1/contact...');
            const response = await fetch('/api/v1/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                console.log('🟢 Form-handler.js: El backend respondió con éxito (status 2xx).');
                statusDiv.textContent = '¡Mensaje enviado con éxito! Gracias por contactar.';
                statusDiv.style.color = 'var(--color-accent)';
                form.reset();
            } else {
                console.error(`🔴 Form-handler.js: El backend respondió con un error de estado: ${response.status}`)
                statusDiv.textContent = 'Error: No se pudo enviar el mensaje. Inténtalo más tarde.';
                statusDiv.style.color = 'red';
            }
        } catch (error) {
            console.error('🔴 Form-handler.js: Error de red al intentar la petición fetch:', error);
            statusDiv.textContent = 'Error de conexión. Por favor, revisa tu conexión a internet.';
            statusDiv.style.color = 'red';
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
            console.log('⚪️ Form-handler.js: Proceso de envío finalizado. Botón reactivado.');
        }
    });
});