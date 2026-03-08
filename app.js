// Cargar configuración desde precios.js
const config = window.BARBER_CONFIG;

// Elementos del DOM
const tiendaNombre = document.getElementById('tienda-nombre');
const tiendaHorarios = document.getElementById('tienda-horarios');
const tiendaDireccion = document.getElementById('tienda-direccion');
const serviciosContainer = document.getElementById('servicios-container');
const extrasGrid = document.getElementById('extras-grid');
const resumenLista = document.getElementById('resumen-lista');
const totalSpan = document.getElementById('total-precio');
const btnEnviar = document.getElementById('enviar-whatsapp');
const form = document.getElementById('pedido-form');
const nombreInput = document.getElementById('nombre');
const movilInput = document.getElementById('movil');
// Inputs ocultos originales (ahora ocultos)
const fechaInput = document.getElementById('fecha');
const horaInput = document.getElementById('hora');
const notaInput = document.getElementById('nota');
const datetimeGroup = document.getElementById('datetime-group');
const domicilioZonaContainer = document.getElementById('domicilio-zona-container');
const zonaSelect = document.getElementById('zona-domicilio');

// Nuevos elementos para pickers personalizados
const customFecha = document.getElementById('custom-fecha');
const customHora = document.getElementById('custom-hora');
const datePicker = document.getElementById('date-picker');
const timePicker = document.getElementById('time-picker');

// Estado de la aplicación
let serviciosSeleccionados = [];
let domicilioSeleccionado = false;
let reservaSeleccionada = false;
let zonaSeleccionadaId = null;

// ===== PERSISTENCIA LOCAL =====
const STORAGE_KEYS = {
  nombre: 'barber_nombre',
  movil: 'barber_movil'
};

function cargarDatosPersistidos() {
  const nombreGuardado = localStorage.getItem(STORAGE_KEYS.nombre);
  const movilGuardado = localStorage.getItem(STORAGE_KEYS.movil);
  if (nombreGuardado) nombreInput.value = nombreGuardado;
  if (movilGuardado) movilInput.value = movilGuardado;
}

function guardarNombre() {
  localStorage.setItem(STORAGE_KEYS.nombre, nombreInput.value.trim());
}

function guardarMovil() {
  localStorage.setItem(STORAGE_KEYS.movil, movilInput.value.trim());
}

// ===== FUNCIONES DE LA APLICACIÓN =====
function initTienda() {
  tiendaNombre.textContent = config.tienda.nombre;
  tiendaHorarios.textContent = config.tienda.horarios;
  tiendaDireccion.textContent = config.tienda.direccion;
}

function renderServicios() {
  config.servicios.forEach(serv => {
    const div = document.createElement('div');
    div.className = 'servicio-item';
    div.dataset.id = serv.id;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `serv-${serv.id}`;
    checkbox.value = serv.id;

    const infoDiv = document.createElement('div');
    infoDiv.className = 'servicio-info';
    infoDiv.innerHTML = `
      <label for="serv-${serv.id}">${serv.nombre}</label>
      <span class="servicio-precio">$${serv.precio}</span>
    `;

    div.appendChild(checkbox);
    div.appendChild(infoDiv);

    checkbox.addEventListener('change', (e) => {
      if (e.target.checked) {
        serviciosSeleccionados.push(serv.id);
        div.classList.add('seleccionado');
      } else {
        serviciosSeleccionados = serviciosSeleccionados.filter(id => id !== serv.id);
        div.classList.remove('seleccionado');
      }
      actualizarResumen();
    });

    serviciosContainer.appendChild(div);
  });
}

function renderExtras() {
  extrasGrid.innerHTML = '';

  // Domicilio
  if (config.domicilio.habilitado) {
    const div = document.createElement('div');
    div.className = 'extra-item';
    div.id = 'domicilio-item';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = 'domicilio-check';

    let precioDom = 0;
    if (config.domicilio.zonas.length > 0) {
      zonaSeleccionadaId = config.domicilio.zonas[0].id;
      precioDom = config.domicilio.zonas[0].precio;
    }

    const infoDiv = document.createElement('div');
    infoDiv.className = 'extra-info';
    infoDiv.innerHTML = `
      <label for="domicilio-check">Domicilio</label>
      <span class="extra-precio" id="domicilio-precio">$${precioDom}</span>
    `;

    div.appendChild(checkbox);
    div.appendChild(infoDiv);

    checkbox.addEventListener('change', (e) => {
      domicilioSeleccionado = e.target.checked;
      if (domicilioSeleccionado) {
        div.classList.add('seleccionado');
        if (config.domicilio.zonas.length > 1) {
          domicilioZonaContainer.classList.remove('hidden');
        } else if (config.domicilio.zonas.length === 1) {
          zonaSeleccionadaId = config.domicilio.zonas[0].id;
          actualizarPrecioDomicilio();
        }
      } else {
        div.classList.remove('seleccionado');
        domicilioZonaContainer.classList.add('hidden');
        zonaSeleccionadaId = null;
      }
      actualizarResumen();
      actualizarVisibilidadDateTime();
    });

    extrasGrid.appendChild(div);

    // Rellenar selector de zonas
    if (config.domicilio.zonas.length > 0) {
      config.domicilio.zonas.forEach(zona => {
        const option = document.createElement('option');
        option.value = zona.id;
        option.textContent = `${zona.nombre} - $${zona.precio}`;
        if (zona.id === zonaSeleccionadaId) option.selected = true;
        zonaSelect.appendChild(option);
      });

      zonaSelect.addEventListener('change', (e) => {
        zonaSeleccionadaId = e.target.value;
        actualizarPrecioDomicilio();
        actualizarResumen();
      });
    }
  }

  // Reserva
  if (config.reserva.habilitado) {
    const div = document.createElement('div');
    div.className = 'extra-item';
    div.id = 'reserva-item';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = 'reserva-check';

    const infoDiv = document.createElement('div');
    infoDiv.className = 'extra-info';
    infoDiv.innerHTML = `
      <label for="reserva-check">Reserva</label>
      <span class="extra-precio">$${config.reserva.precio}</span>
    `;

    div.appendChild(checkbox);
    div.appendChild(infoDiv);

    checkbox.addEventListener('change', (e) => {
      reservaSeleccionada = e.target.checked;
      if (reservaSeleccionada) {
        div.classList.add('seleccionado');
      } else {
        div.classList.remove('seleccionado');
      }
      actualizarResumen();
      actualizarVisibilidadDateTime();
    });

    extrasGrid.appendChild(div);
  }
}

function actualizarPrecioDomicilio() {
  const precioSpan = document.getElementById('domicilio-precio');
  if (!precioSpan) return;
  const zona = config.domicilio.zonas.find(z => z.id === zonaSeleccionadaId);
  if (zona) {
    precioSpan.textContent = `$${zona.precio}`;
  }
}

function getPrecioDomicilio() {
  if (!domicilioSeleccionado || !config.domicilio.habilitado) return 0;
  const zona = config.domicilio.zonas.find(z => z.id === zonaSeleccionadaId);
  return zona ? zona.precio : 0;
}

function actualizarResumen() {
  resumenLista.innerHTML = '';

  let subtotal = 0;
  const serviciosData = config.servicios.filter(s => serviciosSeleccionados.includes(s.id));

  serviciosData.forEach(s => {
    const item = document.createElement('div');
    item.className = 'resumen-item';
    item.innerHTML = `
      <span>${s.nombre}</span>
      <span>$${s.precio}</span>
    `;
    resumenLista.appendChild(item);
    subtotal += s.precio;
  });

  if (domicilioSeleccionado && config.domicilio.habilitado) {
    const precioDom = getPrecioDomicilio();
    const zona = config.domicilio.zonas.find(z => z.id === zonaSeleccionadaId);
    const nombreZona = zona ? zona.nombre : 'Domicilio';
    const item = document.createElement('div');
    item.className = 'resumen-item';
    item.innerHTML = `
      <span>${nombreZona}</span>
      <span>$${precioDom}</span>
    `;
    resumenLista.appendChild(item);
    subtotal += precioDom;
  }

  if (reservaSeleccionada && config.reserva.habilitado) {
    const item = document.createElement('div');
    item.className = 'resumen-item';
    item.innerHTML = `
      <span>Reserva</span>
      <span>$${config.reserva.precio}</span>
    `;
    resumenLista.appendChild(item);
    subtotal += config.reserva.precio;
  }

  totalSpan.textContent = `$${subtotal}`;
}

function actualizarVisibilidadDateTime() {
  if (domicilioSeleccionado || reservaSeleccionada) {
    datetimeGroup.classList.remove('hidden');
    // Si no hay fecha seleccionada, poner por defecto hoy
    if (!fechaInput.value) {
      setDefaultDate();
    }
    // Si no hay hora seleccionada, poner por defecto la actual
    if (!horaInput.value) {
      setDefaultTime();
    }
    actualizarCustomFields();
  } else {
    datetimeGroup.classList.add('hidden');
    // Limpiar valores y cerrar pickers
    fechaInput.value = '';
    horaInput.value = '';
    customFecha.textContent = 'Seleccionar fecha';
    customHora.textContent = 'Seleccionar hora';
    // Cerrar pickers si están abiertos
    datePicker.classList.add('hidden');
    timePicker.classList.add('hidden');
    customFecha.classList.remove('active');
    customHora.classList.remove('active');
  }
}

function setDefaultDate() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  fechaInput.value = `${yyyy}-${mm}-${dd}`;
}

function setDefaultTime() {
  const today = new Date();
  const hours = String(today.getHours()).padStart(2, '0');
  const minutes = String(today.getMinutes()).padStart(2, '0');
  horaInput.value = `${hours}:${minutes}`;
}

function actualizarCustomFields() {
  if (fechaInput.value) {
    // Formatear fecha para mostrar: DD/MM/YYYY
    const [yyyy, mm, dd] = fechaInput.value.split('-');
    customFecha.textContent = `${dd}/${mm}/${yyyy}`;
  } else {
    customFecha.textContent = 'Seleccionar fecha';
  }

  if (horaInput.value) {
    customHora.textContent = horaInput.value;
  } else {
    customHora.textContent = 'Seleccionar hora';
  }
}

// ===== PICKERS PERSONALIZADOS =====

// Variables para el calendario
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

function generarCalendario(year, month) {
  const firstDay = new Date(year, month, 1).getDay(); // 0 = domingo
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Ajustar para que la semana empiece en lunes (si se desea)
  let startOffset = firstDay === 0 ? 6 : firstDay - 1; // Si 0 (domingo) offset 6, si no, desplazar

  let html = `
    <div class="calendar-header">
      <span class="calendar-month">${new Intl.DateTimeFormat('es', { month: 'long', year: 'numeric' }).format(new Date(year, month))}</span>
      <div class="calendar-nav">
        <button id="prev-month">◀</button>
        <button id="next-month">▶</button>
      </div>
    </div>
    <div class="calendar-weekdays">
      <span>L</span><span>M</span><span>M</span><span>J</span><span>V</span><span>S</span><span>D</span>
    </div>
    <div class="calendar-days">
  `;

  // Celdas vacías antes del primer día
  for (let i = 0; i < startOffset; i++) {
    html += '<div class="calendar-day empty"></div>';
  }

  // Días del mes
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const selectedClass = fechaInput.value === dateStr ? 'selected' : '';
    html += `<div class="calendar-day ${selectedClass}" data-date="${dateStr}">${d}</div>`;
  }

  html += '</div>';
  datePicker.innerHTML = html;

  // Eventos de navegación
  document.getElementById('prev-month').addEventListener('click', () => {
    currentMonth--;
    if (currentMonth < 0) {
      currentMonth = 11;
      currentYear--;
    }
    generarCalendario(currentYear, currentMonth);
  });

  document.getElementById('next-month').addEventListener('click', () => {
    currentMonth++;
    if (currentMonth > 11) {
      currentMonth = 0;
      currentYear++;
    }
    generarCalendario(currentYear, currentMonth);
  });

  // Eventos de selección de día
  document.querySelectorAll('.calendar-day[data-date]').forEach(day => {
    day.addEventListener('click', (e) => {
      const selectedDate = e.target.dataset.date;
      fechaInput.value = selectedDate;
      actualizarCustomFields();
      datePicker.classList.add('hidden');
      customFecha.classList.remove('active');
    });
  });
}

function generarSelectorHora() {
  const horas = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      const horaStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      horas.push(horaStr);
    }
  }

  let html = '';
  horas.forEach(hora => {
    const selectedClass = horaInput.value === hora ? 'selected' : '';
    html += `<div class="time-option ${selectedClass}" data-time="${hora}">${hora}</div>`;
  });
  timePicker.innerHTML = html;

  document.querySelectorAll('.time-option').forEach(opt => {
    opt.addEventListener('click', (e) => {
      const selectedTime = e.target.dataset.time;
      horaInput.value = selectedTime;
      actualizarCustomFields();
      timePicker.classList.add('hidden');
      customHora.classList.remove('active');
    });
  });
}

// Mostrar/ocultar pickers
customFecha.addEventListener('click', (e) => {
  e.stopPropagation();
  // Si el grupo está oculto, no hacer nada
  if (datetimeGroup.classList.contains('hidden')) return;

  // Cerrar el otro picker si está abierto
  timePicker.classList.add('hidden');
  customHora.classList.remove('active');

  // Alternar visibilidad
  if (datePicker.classList.contains('hidden')) {
    // Posicionar el calendario (ya está en posición absoluta)
    datePicker.classList.remove('hidden');
    customFecha.classList.add('active');
    // Regenerar calendario con la fecha actual si existe
    if (fechaInput.value) {
      const [yyyy, mm] = fechaInput.value.split('-');
      currentYear = parseInt(yyyy);
      currentMonth = parseInt(mm) - 1;
    } else {
      currentYear = new Date().getFullYear();
      currentMonth = new Date().getMonth();
    }
    generarCalendario(currentYear, currentMonth);
  } else {
    datePicker.classList.add('hidden');
    customFecha.classList.remove('active');
  }
});

customHora.addEventListener('click', (e) => {
  e.stopPropagation();
  if (datetimeGroup.classList.contains('hidden')) return;

  datePicker.classList.add('hidden');
  customFecha.classList.remove('active');

  if (timePicker.classList.contains('hidden')) {
    timePicker.classList.remove('hidden');
    customHora.classList.add('active');
    generarSelectorHora();
  } else {
    timePicker.classList.add('hidden');
    customHora.classList.remove('active');
  }
});

// Cerrar pickers al hacer clic fuera
document.addEventListener('click', (e) => {
  if (!customFecha.contains(e.target) && !datePicker.contains(e.target)) {
    datePicker.classList.add('hidden');
    customFecha.classList.remove('active');
  }
  if (!customHora.contains(e.target) && !timePicker.contains(e.target)) {
    timePicker.classList.add('hidden');
    customHora.classList.remove('active');
  }
});

// ===== GENERAR MENSAJE (con negritas) =====
function generarMensaje() {
  const nombre = nombreInput.value.trim();
  const movil = movilInput.value.trim();
  const nota = notaInput.value.trim();

  if (!nombre || !movil) {
    alert('Por favor completa nombre y móvil');
    return null;
  }

  const fechaHoraRequerida = domicilioSeleccionado || reservaSeleccionada;
  if (fechaHoraRequerida) {
    const fecha = fechaInput.value;
    const hora = horaInput.value;
    if (!fecha || !hora) {
      alert('Debes indicar fecha y hora para la cita');
      return null;
    }
  }

  if (serviciosSeleccionados.length === 0) {
    alert('Debes seleccionar al menos un servicio');
    return null;
  }

  const tipoPedido = reservaSeleccionada ? 'Reserva' : 'Normal';

  let mensaje = `*Cliente:* ${nombre}\n`;
  mensaje += `*Teléfono:* ${movil}\n`;
  mensaje += `*Tipo Pedido:* ${tipoPedido}\n`;

  if (fechaHoraRequerida) {
    // Formatear fecha para mostrarla como DD/MM/YYYY
    if (fechaInput.value) {
      const [yyyy, mm, dd] = fechaInput.value.split('-');
      mensaje += `*Fecha:* ${dd}/${mm}/${yyyy} - ${horaInput.value}\n`;
    }
  }

  mensaje += `\n*Pedido:*\n`;

  const serviciosData = config.servicios.filter(s => serviciosSeleccionados.includes(s.id));
  serviciosData.forEach(s => {
    mensaje += `${s.nombre}: $${s.precio}\n`;
  });

  if (nota) {
    mensaje += `\n*Notas:* ${nota}\n`;
  }

  mensaje += `\n`;

  if (domicilioSeleccionado && config.domicilio.habilitado) {
    const zona = config.domicilio.zonas.find(z => z.id === zonaSeleccionadaId);
    const nombreZona = zona ? zona.nombre : 'Domicilio';
    mensaje += `*${nombreZona}:* $${getPrecioDomicilio()}\n`;
  }
  if (reservaSeleccionada && config.reserva.habilitado) {
    mensaje += `*Reserva:* $${config.reserva.precio}\n`;
  }

  const total = serviciosData.reduce((acc, s) => acc + s.precio, 0) +
                (domicilioSeleccionado ? getPrecioDomicilio() : 0) +
                (reservaSeleccionada ? config.reserva.precio : 0);
  mensaje += `*Total:* $${total}`;

  return mensaje;
}

function enviarWhatsApp() {
  const mensaje = generarMensaje();
  if (!mensaje) return;

  const telefonoTienda = config.tienda.telefono.replace(/\D/g, '');
  const url = `https://wa.me/${telefonoTienda}?text=${encodeURIComponent(mensaje)}`;
  window.open(url, '_blank');
}

// ===== INICIALIZACIÓN =====
function init() {
  initTienda();
  renderServicios();
  renderExtras();
  datetimeGroup.classList.add('hidden');
  actualizarResumen();

  cargarDatosPersistidos();

  nombreInput.addEventListener('input', guardarNombre);
  movilInput.addEventListener('input', guardarMovil);

  // Inicializar campos personalizados
  actualizarCustomFields();
}

btnEnviar.addEventListener('click', enviarWhatsApp);

init();