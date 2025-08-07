# Cuenta SIAE

Aplicación web progresiva (PWA) para el control de asistencia del personal, con generación de reportes y envío por WhatsApp. Diseñada específicamente para el registro diario de la Cuenta SIAE.

## 🚀 Características

- ✅ Interfaz de usuario intuitiva y completamente responsiva
- 📱 Optimizada para dispositivos móviles y de escritorio
- 💾 Almacenamiento local para persistencia de datos
- 🌐 Funcionalidad offline completa (PWA)
- 📊 Generación automática de reportes de asistencia
- 📤 Envío directo de reportes por WhatsApp
- 🔄 Sincronización automática cuando hay conexión
- 🎨 Temas claros y oscuros según preferencias del sistema

## 🏗️ Estructura del Proyecto

```
Cuenta SIAE/
├── assets/               # Recursos estáticos
│   └── icons/            # Íconos para diferentes tamaños de pantalla
│       ├── favicon.ico   # Ícono del sitio
│       ├── icon-48x48.png
│       ├── icon-72x72.png
│       ├── icon-96x96.png
│       ├── icon-120x120.png
│       ├── icon-144x144.png
│       ├── icon-192x192.png
│       └── icon-512x512.png
├── css/                 # Estilos CSS
│   └── styles.css       # Estilos principales de la aplicación
├── js/                  # Código JavaScript
│   ├── app.js           # Lógica principal de la aplicación
│   ├── pwa.js           # Configuración de la Progressive Web App
│   └── storage.js       # Manejo del almacenamiento local
├── funcionarios.json    # Base de datos de funcionarios
├── index.html          # Punto de entrada de la aplicación
├── manifest.json       # Configuración de la PWA
├── sw.js              # Service Worker para funcionalidad offline
└── README.md          # Este archivo
```

## 🚀 Cómo Usar

### Instalación Local
1. Clona este repositorio:
   ```bash
   git clone [URL_DEL_REPOSITORIO]
   ```
2. Abre el archivo `index.html` en tu navegador web favorito.

### Uso Básico
1. **Selección de Estado**:
   - Para cada funcionario, selecciona "Formando" o "Falta"
   - En caso de falta, selecciona el motivo correspondiente

2. **Generación de Reporte**:
   - Haz clic en "Generar Cuenta" para crear el reporte
   - El reporte se mostrará en el área de resultados

3. **Compartir**:
   - Usa "Enviar por WhatsApp" para compartir el reporte
   - O copia el texto directamente con el botón de copiar

### Instalación como Aplicación
1. Abre la aplicación en Chrome, Edge o Safari
2. Haz clic en el ícono de compartir/instalar
3. Selecciona "Instalar" o "Agregar a la pantalla de inicio"

## 🔧 Personalización

### Agregar o Modificar Funcionarios
Edita el archivo `funcionarios.json` siguiendo este formato:
```json
[
  {
    "id": 1,
    "nombre": "Apellido Nombre",
    "cargo": "Grado - Especialidad"
  }
]
```

### Personalizar Estilos
Modifica los estilos en `css/styles.css`. La aplicación utiliza variables CSS para una fácil personalización:

```css
:root {
  --color-primary: #007ACC;
  --color-primary-dark: #0062a3;
  --color-danger: #dc3545;
  --color-success: #28a745;
  /* ... más variables ... */
}
```

### Configuración PWA
Ajusta `manifest.json` para personalizar:
- Nombre de la aplicación
- Colores del tema
- Íconos
- Pantalla de inicio

## 🌐 Compatibilidad

- Navegadores compatibles: Chrome 54+, Firefox 63+, Edge 79+, Safari 11.3+
- Dispositivos: Móviles, tablets y escritorio
- Requiere conexión a internet solo para la primera carga

## 📄 Licencia

Este proyecto está bajo la [Licencia MIT](LICENSE).

## ✨ Créditos

Desarrollado para facilitar el registro diario de la Cuenta SIAE.
