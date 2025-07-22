// Importar módulos
import { guardarEstado, cargarEstadoGuardado, limpiarEstado } from './storage.js';

// Constantes
const LISTA_MOTIVOS = [
    "Feriado", "Permiso Especial", "Día administrativo", "Licencia Médica", 
    "Primer patrullaje", "Segundo patrullaje", "Primera guardia", "Segunda guardia", 
    "Saliente servicio nocturno", "Allanamiento", "Vigilancia", "Práctica de tiro", 
    "Monitoreo", "Capacitación"
];

// Variables globales
let funcionarios = [];

// Inicialización
document.addEventListener('DOMContentLoaded', inicializarApp);

/**
 * Función principal de inicialización
 */
async function inicializarApp() {
    try {
        // Cargar datos de funcionarios
        await cargarFuncionarios();
        
        // Cargar el formulario
        cargarFormulario();
        
        // Configurar manejadores de eventos
        configurarEventos();
        
        // Cargar estado guardado
        cargarEstadoGuardado(funcionarios);
        
    } catch (error) {
        console.error('Error al inicializar la aplicación:', error);
        const loader = document.getElementById('loader');
        if (loader) {
            loader.textContent = 'Error al cargar la aplicación.';
            loader.style.color = '#e74c3c';
        }
    }
}

/**
 * Carga los datos de los funcionarios desde el archivo JSON
 */
async function cargarFuncionarios() {
    const response = await fetch('funcionarios.json');
    if (!response.ok) {
        throw new Error(`Error al cargar: ${response.statusText}`);
    }
    funcionarios = await response.json();
}

/**
 * Carga el formulario con los datos de los funcionarios
 */
function cargarFormulario() {
    const container = document.getElementById("formulario");
    const loader = document.getElementById('loader');
    
    if (loader) loader.style.display = 'none';
    if (!container) return;
    
    container.innerHTML = ''; // Limpiar contenedor
    
    funcionarios.forEach(f => {
        const div = document.createElement("div");
        div.className = "funcionario";
        div.innerHTML = `
            <label>${f.nombre}</label>
            <select id="estado-${f.id}" class="estado-formando" data-funcionario-id="${f.id}">
                <option value="formando">Formando</option>
                <option value="falta">Falta</option>
            </select>
            <select id="motivo-${f.id}" class="motivo-select" style="display:none;" data-funcionario-id="${f.id}">
                <option value="">-- Motivo --</option>
                ${LISTA_MOTIVOS.map(m => `<option>${m}</option>`).join('')}
            </select>
        `;
        container.appendChild(div);
    });
}

/**
 * Configura los manejadores de eventos
 */
function configurarEventos() {
    // Delegación de eventos para los selectores de estado
    document.addEventListener('change', (e) => {
        if (e.target.matches('select[data-funcionario-id]')) {
            const funcionarioId = e.target.dataset.funcionarioId;
            if (e.target.id.startsWith('estado-')) {
                toggleMotivo(funcionarioId);
            }
            guardarEstado(funcionarios);
        }
    });
    
    // Botones de acción
    document.getElementById('generar-cuenta')?.addEventListener('click', () => generarCuenta());
    document.getElementById('enviar-whatsapp')?.addEventListener('click', enviarPorWhatsApp);
    document.getElementById('limpiar-formulario')?.addEventListener('click', limpiarFormulario);
}

/**
 * Muestra/oculta el selector de motivo según el estado seleccionado
 * @param {string} funcionarioId - ID del funcionario
 */
function toggleMotivo(funcionarioId) {
    const estadoSelect = document.getElementById(`estado-${funcionarioId}`);
    const motivoSelect = document.getElementById(`motivo-${funcionarioId}`);

    if (estadoSelect && motivoSelect) {
        const estado = estadoSelect.value;
        motivoSelect.style.display = estado === "falta" ? "inline-block" : "none";
        estadoSelect.className = estado === "formando" ? "estado-formando" : "estado-falta";
    }
}

/**
 * Genera el texto de la cuenta SIAE
 * @returns {string} El texto generado de la cuenta
 */
function generarCuenta() {
    const fecha = new Date().toLocaleDateString('es-CL', {
        weekday: 'long', 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric'
    });

    const motivos = LISTA_MOTIVOS.reduce((acc, m) => {
        acc[m] = [];
        return acc;
    }, {});
    
    const forman = [];

    funcionarios.forEach(f => {
        const estadoSelect = document.getElementById(`estado-${f.id}`);
        const motivoSelect = document.getElementById(`motivo-${f.id}`);

        if (estadoSelect && motivoSelect) {
            const estado = estadoSelect.value;
            const motivo = motivoSelect.value;

            if (estado === "formando") {
                forman.push(f.nombre);
            } else if (estado === "falta" && motivo) {
                motivos[motivo].push(f.nombre);
            }
        }
    });

    const total = funcionarios.length;
    const texto = [
        `*Cuenta S.I.A.E. ${fecha}*`,
        `\n*Dotación:* ${total}.`,
        `*Forman:* ${forman.length}.`,
        `*Faltan:* ${total - forman.length}.\n`,
        `*Motivos:*`
    ];

    Object.entries(motivos).forEach(([motivo, nombres]) => {
        if (nombres.length > 0) {
            texto.push(`\n*${motivo}:*`);
            nombres.forEach((n, i) => texto.push(`${i + 1}. ${n}`));
        }
    });

    texto.push(`\n*Personal que forma:*`);
    forman.forEach((n, i) => texto.push(`${i + 1}. ${n}`));

    const textoCompleto = texto.join('\n');
    const resultado = document.getElementById("resultado");
    
    if (resultado) {
        resultado.value = textoCompleto;
    }
    
    return textoCompleto;
}

/**
 * Copia el resultado al portapapeles
 */
async function copiarResultado() {
    const resultado = document.getElementById('resultado');
    if (resultado?.value) {
        try {
            await navigator.clipboard.writeText(resultado.value);
            mostrarNotificacion('¡Copiado!');
        } catch (err) {
            console.error('Error al copiar: ', err);
            mostrarNotificacion('Error al copiar', 'error');
        }
    }
}

/**
 * Envía el resultado actual por WhatsApp
 */
function enviarPorWhatsApp() {
    try {
        // Generar el texto de la cuenta
        const texto = generarCuenta();
        
        // Codificar el texto para la URL de WhatsApp
        const textoCodificado = encodeURIComponent(texto);
        
        // Crear la URL de WhatsApp
        const urlWhatsApp = `https://wa.me/?text=${textoCodificado}`;
        
        // Abrir WhatsApp en una nueva pestaña
        window.open(urlWhatsApp, '_blank');
        
        // Mostrar notificación de éxito
        mostrarNotificacion('Abriendo WhatsApp...');
    } catch (error) {
        console.error('Error al enviar por WhatsApp:', error);
        mostrarNotificacion('Error al abrir WhatsApp', 'error');
    }
}

/**
 * Muestra una notificación al usuario
 * @param {string} mensaje - Mensaje a mostrar
 * @param {string} tipo - Tipo de notificación (éxito, error, etc.)
 */
function mostrarNotificacion(mensaje, tipo = 'exito') {
    const notificacion = document.createElement('div');
    notificacion.className = `notificacion ${tipo}`;
    notificacion.textContent = mensaje;
    
    document.body.appendChild(notificacion);
    
    // Eliminar la notificación después de 3 segundos
    setTimeout(() => {
        notificacion.classList.add('mostrar');
        
        setTimeout(() => {
            notificacion.classList.remove('mostrar');
            setTimeout(() => notificacion.remove(), 300);
        }, 2700);
    }, 10);
}

/**
 * Limpia el formulario
 */
function limpiarFormulario() {
    if (confirm('¿Estás seguro de que deseas limpiar el formulario?')) {
        funcionarios.forEach(f => {
            const estadoSelect = document.getElementById(`estado-${f.id}`);
            const motivoSelect = document.getElementById(`motivo-${f.id}`);

            if (estadoSelect) {
                estadoSelect.value = 'formando';
                estadoSelect.className = 'estado-formando';
            }
            if (motivoSelect) {
                motivoSelect.value = '';
                motivoSelect.style.display = 'none';
            }
        });

        const resultado = document.getElementById('resultado');
        if (resultado) resultado.value = '';
        
        limpiarEstado();
        mostrarNotificacion('Formulario limpiado');
    }
}
