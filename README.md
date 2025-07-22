# Cuenta SIAE

Aplicación web progresiva (PWA) para el control de asistencia de personal, con generación de reportes y envío por WhatsApp.

## Características

- Interfaz de usuario intuitiva y responsiva
- Almacenamiento local para persistencia de datos
- Funcionalidad offline completa
- Generación de reportes de asistencia
- Envío directo de reportes por WhatsApp
- Instalable en dispositivos móviles y de escritorio

## Estructura del Proyecto

```
Cuenta SIAE/
├── assets/               # Recursos estáticos
│   ├── icons/           # Íconos de la aplicación
│   └── images/          # Imágenes adicionales
├── css/                 # Estilos CSS
│   └── styles.css
├── js/                  # Código JavaScript
│   ├── app.js           # Lógica principal
│   ├── pwa.js           # Configuración PWA
│   └── storage.js       # Manejo del almacenamiento
├── .gitignore          # Archivos ignorados por Git
├── funcionarios.json    # Datos de los funcionarios
├── index.html          # Página principal
├── manifest.json       # Configuración de la PWA
└── sw.js               # Service Worker
```

## Cómo Usar

1. **Instalación**:
   - Clona este repositorio o descarga los archivos
   - Abre `index.html` en tu navegador

2. **Uso Básico**:
   - Selecciona el estado de cada funcionario (Formando/Falta)
   - Si corresponde, selecciona el motivo de la falta
   - Haz clic en "Generar Cuenta" para ver el reporte
   - Usa "Enviar por WhatsApp" para compartir el reporte

3. **Instalación en Dispositivos Móviles**:
   - Abre la aplicación en Chrome o Safari
   - Toca el ícono de compartir
   - Selecciona "Agregar a la pantalla de inicio"

## Requisitos

- Navegador web moderno (Chrome, Firefox, Safari, Edge)
- Conexión a Internet (solo para la primera carga y actualizaciones)

## Personalización

- **Funcionarios**: Edita `funcionarios.json` para actualizar la lista
- **Estilos**: Modifica los archivos en `css/` para cambiar la apariencia
- **Configuración PWA**: Ajusta `manifest.json` según sea necesario

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.
