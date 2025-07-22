const listaMotivos = [
  "Feriado", "Permiso Especial", "Día administrativo", "Licencia Médica", "Primer patrullaje",
  "Segundo patrullaje", "Primera guardia", "Segunda guardia", "Saliente servicio nocturno",
  "Allanamiento", "Vigilancia", "Práctica de tiro", "Monitoreo", "Capacitación"
];

let funcionarios = [];

document.addEventListener('DOMContentLoaded', () => {
  fetch('funcionarios.json')
    .then(response => {
      if (!response.ok) throw new Error(`Error al cargar: ${response.statusText}`);
      return response.json();
    })
    .then(data => {
      funcionarios = data;
      cargarFormulario();
    })
    .catch(error => {
      console.error(error);
      const loader = document.getElementById('loader');
      loader.textContent = 'Error al cargar funcionarios.';
      loader.style.color = '#e74c3c';
    });

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/sw.js");
    });
  }
});

function cargarFormulario() {
  const container = document.getElementById("formulario");
  const loader = document.getElementById('loader');
  loader.style.display = 'none';

  funcionarios.forEach(f => {
    const div = document.createElement("div");
    div.className = "funcionario";
    div.innerHTML = `
      <label>${f.nombre}</label>
      <select id="estado-${f.id}" onchange="toggleMotivo(${f.id})">
        <option value="formando">Formando</option>
        <option value="falta">Falta</option>
      </select>
      <select id="motivo-${f.id}" style="display:none;">
        <option value="">-- Motivo --</option>
        ${listaMotivos.map(m => `<option>${m}</option>`).join('')}
      </select>
    `;
    container.appendChild(div);
  });

  cargarEstadoGuardado();
}

function toggleMotivo(id) {
  const estadoSelect = document.getElementById(`estado-${id}`);
  const motivoSelect = document.getElementById(`motivo-${id}`);

  if (estadoSelect && motivoSelect) {
    const estado = estadoSelect.value;
    motivoSelect.style.display = estado === "falta" ? "inline-block" : "none";
    estadoSelect.className = estado === "formando" ? "estado-formando" : "estado-falta";
    guardarEstado();
  }
}

function generarCuenta() {
  const fecha = new Date().toLocaleDateString('es-CL', {
    weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric'
  });

  const motivos = listaMotivos.reduce((acc, m) => {
    acc[m] = [];
    return acc;
  }, {});
  const forman = [];

  funcionarios.forEach(f => {
    const estado = document.getElementById(`estado-${f.id}`).value;
    const motivo = document.getElementById(`motivo-${f.id}`).value;

    if (estado === "formando") {
      forman.push(f.nombre);
    } else if (estado === "falta" && motivo) {
      motivos[motivo].push(f.nombre);
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

  document.getElementById("resultado").value = texto.join('\n');
}

function copiarResultado() {
  const resultado = document.getElementById('resultado');
  if (resultado.value) {
    navigator.clipboard.writeText(resultado.value)
      .then(() => {
        const confirmacion = document.getElementById('copy-confirm');
        confirmacion.classList.remove('hidden');
        setTimeout(() => confirmacion.classList.add('hidden'), 2000);
      })
      .catch(err => console.error('Error al copiar: ', err));
  }
}

function limpiarFormulario() {
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

  document.getElementById('resultado').value = '';
  localStorage.removeItem('cuentaSIAEState');
}

function guardarEstado() {
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

function cargarEstadoGuardado() {
  const estadoGuardado = JSON.parse(localStorage.getItem('cuentaSIAEState'));
  if (estadoGuardado) {
    funcionarios.forEach(f => {
      if (estadoGuardado[f.id]) {
        const estadoSelect = document.getElementById(`estado-${f.id}`);
        const motivoSelect = document.getElementById(`motivo-${f.id}`);
        if (estadoSelect) estadoSelect.value = estadoGuardado[f.id].estado;
        if (motivoSelect) motivoSelect.value = estadoGuardado[f.id].motivo;
        toggleMotivo(f.id);
      }
    });
  }
}
