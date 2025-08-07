// Importar módulos
import { guardarEstado, cargarEstadoGuardado, limpiarEstado } from './storage.js';

// Constantes
const LISTA_MOTIVOS = [
    "Feriado", "Día administrativo", "Licencia Médica", 
    "Primer patrullaje", "Segundo patrullaje", "Primera guardia", "Segunda guardia", 
    "Saliente servicio nocturno", "Permiso Especial Digcar", "Allanamiento", "Vigilancia", "Práctica de tiro", 
    "Monitoreo", "Capacitación", "Otro"
];

// Cargar motivos personalizados del localStorage
let motivosPersonalizados = JSON.parse(localStorage.getItem('motivosPersonalizados')) || [];

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
    
    // Combinar motivos predefinidos con personalizados
    const todosLosMotivos = [...new Set([...LISTA_MOTIVOS, ...motivosPersonalizados])];
    
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
                ${todosLosMotivos.map(m => `<option>${m}</option>`).join('')}
            </select>
            <div id="motivo-otro-container-${f.id}" class="motivo-otro-container" style="display: none; margin-top: 5px;">
                <input type="text" id="motivo-otro-${f.id}" class="motivo-otro-input" placeholder="Especificar motivo...">
                <button class="btn-guardar-motivo" data-funcionario-id="${f.id}">Guardar</button>
            </div>
        `;
        container.appendChild(div);
    });
    
    // Agregar manejador de eventos para el botón de guardar motivo personalizado
    document.querySelectorAll('.btn-guardar-motivo').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const funcionarioId = e.target.dataset.funcionarioId;
            guardarMotivoPersonalizado(funcionarioId);
        });
    });
    
    // Agregar manejador de eventos para el cambio en el select de motivos
    document.querySelectorAll('.motivo-select').forEach(select => {
        select.addEventListener('change', (e) => {
            const funcionarioId = e.target.dataset.funcionarioId;
            const motivoOtroContainer = document.getElementById(`motivo-otro-container-${funcionarioId}`);
            if (motivoOtroContainer) {
                motivoOtroContainer.style.display = (e.target.value === 'Otro') ? 'block' : 'none';
            }
        });
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
    const motivoOtroContainer = document.getElementById(`motivo-otro-container-${funcionarioId}`);

    if (estadoSelect && motivoSelect) {
        const estado = estadoSelect.value;
        const mostrarMotivo = estado === "falta";
        
        motivoSelect.style.display = mostrarMotivo ? "inline-block" : "none";
        estadoSelect.className = estado === "formando" ? "estado-formando" : "estado-falta";
        
        // Mostrar/ocultar contenedor de motivo personalizado
        if (motivoOtroContainer) {
            motivoOtroContainer.style.display = (mostrarMotivo && motivoSelect.value === 'Otro') ? 'block' : 'none';
        }
    }
}

/**
 * Guarda un nuevo motivo personalizado y lo agrega a todos los menús desplegables
 * @param {string} funcionarioId - ID del funcionario que está agregando el motivo
 */
function guardarMotivoPersonalizado(funcionarioId) {
    const motivoInput = document.getElementById(`motivo-otro-${funcionarioId}`);
    
    if (motivoInput && motivoInput.value.trim() !== '') {
        const nuevoMotivo = motivoInput.value.trim();
        
        // Verificar si el motivo ya existe en la lista de personalizados
        if (motivosPersonalizados.includes(nuevoMotivo)) {
            mostrarNotificacion('Este motivo ya existe', 'info');
            return;
        }
        
        // Agregar a la lista de motivos personalizados
        motivosPersonalizados.push(nuevoMotivo);
        // Guardar en localStorage
        localStorage.setItem('motivosPersonalizados', JSON.stringify(motivosPersonalizados));
        
        // Actualizar todos los selects de motivos
        actualizarTodosLosSelectsDeMotivos(nuevoMotivo);
        
        // Seleccionar el motivo recién agregado en el select actual
        const motivoSelect = document.getElementById(`motivo-${funcionarioId}`);
        if (motivoSelect) {
            motivoSelect.value = nuevoMotivo;
        }
        
        // Limpiar y ocultar el input de motivo personalizado
        motivoInput.value = '';
        const motivoOtroContainer = document.getElementById(`motivo-otro-container-${funcionarioId}`);
        if (motivoOtroContainer) {
            motivoOtroContainer.style.display = 'none';
        }
        
        mostrarNotificacion('Motivo guardado correctamente');
    } else {
        mostrarNotificacion('Por favor ingrese un motivo', 'error');
    }
}

/**
 * Actualiza todos los menús desplegables de motivos con un nuevo motivo
 * @param {string} nuevoMotivo - El nuevo motivo a agregar
 */
function actualizarTodosLosSelectsDeMotivos(nuevoMotivo) {
    // Obtener todos los selects de motivos
    const todosLosSelects = document.querySelectorAll('.motivo-select');
    
    todosLosSelects.forEach(select => {
        // Verificar si el motivo ya existe en este select
        const opcionExistente = Array.from(select.options).find(opt => opt.text === nuevoMotivo);
        
        if (!opcionExistente) {
            // Crear la nueva opción
            const option = document.createElement('option');
            option.value = nuevoMotivo;
            option.textContent = nuevoMotivo;
            
            // Insertar antes de la opción "Otro" si existe, de lo contrario al final
            const otroOption = Array.from(select.options).find(opt => opt.text === 'Otro');
            if (otroOption) {
                select.insertBefore(option, otroOption);
            } else {
                select.appendChild(option);
            }
        }
    });
}

function generarCuenta() {
    const fecha = new Date().toLocaleDateString('es-CL', {
        weekday: 'long', 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric'
    });

    // Combinar motivos predefinidos con personalizados
    const todosLosMotivos = [...new Set([...LISTA_MOTIVOS, ...motivosPersonalizados])];
    
    const motivos = todosLosMotivos.reduce((acc, m) => {
        acc[m] = [];
        return acc;
    }, {});
    
    const forman = [];

    funcionarios.forEach(f => {
        const estadoSelect = document.getElementById(`estado-${f.id}`);
        const motivoSelect = document.getElementById(`motivo-${f.id}`);
        const motivoOtroInput = document.getElementById(`motivo-otro-${f.id}`);

        if (estadoSelect && motivoSelect) {
            const estado = estadoSelect.value;
            let motivo = motivoSelect.value;
            
            // Si es "Otro" y hay texto en el input, usar ese texto
            if (motivo === 'Otro' && motivoOtroInput && motivoOtroInput.value.trim() !== '') {
                motivo = motivoOtroInput.value.trim();
                // Si el motivo no existe, agregarlo
                if (!motivosPersonalizados.includes(motivo)) {
                    motivosPersonalizados.push(motivo);
                    localStorage.setItem('motivosPersonalizados', JSON.stringify(motivosPersonalizados));
                }
            }

            if (estado === "formando") {
                forman.push(f.nombre);
            } else if (estado === "falta" && motivo) {
                // Si el motivo no está en la lista, agregarlo al objeto de motivos
                if (!motivos[motivo]) {
                    motivos[motivo] = [];
                }
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
