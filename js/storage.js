/**
 * Módulo para manejar el almacenamiento local
 */

/**
 * Guarda el estado actual del formulario en localStorage
 * @param {Array} funcionarios - Lista de funcionarios
 */
export function guardarEstado(funcionarios) {
    const estadoActual = {};
    funcionarios.forEach(f => {
        const estadoSelect = document.getElementById(`estado-${f.id}`);
        const motivoSelect = document.getElementById(`motivo-${f.id}`);
        if (estadoSelect && motivoSelect) {
            estadoActual[f.id] = {
                estado: estadoSelect.value,
                motivo: motivoSelect.value
            };
        }
    });
    localStorage.setItem('cuentaSIAEState', JSON.stringify(estadoActual));
}

/**
 * Carga el estado guardado desde localStorage
 * @param {Array} funcionarios - Lista de funcionarios
 */
export function cargarEstadoGuardado(funcionarios) {
    const estadoGuardado = JSON.parse(localStorage.getItem('cuentaSIAEState'));
    if (estadoGuardado) {
        funcionarios.forEach(f => {
            if (estadoGuardado[f.id]) {
                const estadoSelect = document.getElementById(`estado-${f.id}`);
                const motivoSelect = document.getElementById(`motivo-${f.id}`);
                if (estadoSelect) estadoSelect.value = estadoGuardado[f.id].estado;
                if (motivoSelect) motivoSelect.value = estadoGuardado[f.id].motivo;
            }
        });
    }
}

/**
 * Limpia el estado guardado
 */
export function limpiarEstado() {
    localStorage.removeItem('cuentaSIAEState');
}
