/**
 * Módulo para la configuración de PWA
 */

// Verificar si el navegador soporta service workers
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Usar ruta relativa a la raíz del sitio para GitHub Pages
        const basePath = window.location.pathname.split('/').slice(0, -1).join('/');
        navigator.serviceWorker.register(`${basePath ? basePath + '/' : ''}sw.js`)
            .then(registration => {
                console.log('ServiceWorker registrado con éxito:', registration.scope);
                // Verificar si hay una nueva versión disponible
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // Nueva versión disponible
                            console.log('Nueva versión disponible. Por favor, actualiza la página.');
                        }
                    });
                });
            })
            .catch(error => {
                console.error('Error al registrar el ServiceWorker:', error);
            });
    });
}

// Detectar si la aplicación se está ejecutando como PWA
window.addEventListener('appinstalled', (evt) => {
    console.log('Aplicación instalada con éxito');
});

// Mostrar el botón de instalación en navegadores compatibles
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    // Prevenir que el navegador muestre el mensaje de instalación automático
    e.preventDefault();
    // Guardar el evento para usarlo más tarde
    deferredPrompt = e;
    // Mostrar el botón de instalación
    mostrarBotonInstalacion();
});

/**
 * Muestra el botón de instalación
 */
function mostrarBotonInstalacion() {
    const installButton = document.getElementById('install-button');
    if (installButton) {
        installButton.style.display = 'block';
        installButton.addEventListener('click', instalarApp);
    }
}

/**
 * Maneja la instalación de la aplicación
 */
async function instalarApp() {
    if (!deferredPrompt) return;
    
    // Mostrar el mensaje de instalación
    deferredPrompt.prompt();
    
    // Esperar a que el usuario responda
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`Usuario ${outcome} la instalación`);
    
    // Limpiar la referencia
    deferredPrompt = null;
    
    // Ocultar el botón de instalación
    const installButton = document.getElementById('install-button');
    if (installButton) {
        installButton.style.display = 'none';
    }
}
