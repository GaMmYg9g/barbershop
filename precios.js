const BARBER_CONFIG = {
  tienda: {
    nombre: "BarberShop 💈",
    telefono: "5356502201",
    horarios: "Horario Abierto",
    direccion: "Calle Futura 1||2 #106 Rpto. Ortíz"
  },
  servicios: [
    {id: "sencillo", nombre: "Pelado sensillo", precio: 300},
    { id: "corte", nombre: "Pelado de Estilo", precio: 400 },
    { id: "cejas", nombre: "Cejas", precio: 50 },
    { id: "barba", nombre: "Barba", precio: 100 },
    { id: "corte+barba", nombre: "Todo (Combo)", precio: 450 }
  ],
  domicilio: {
    habilitado: true,
    zonas: [
      { id: "centro", nombre: "Centro del Pueblo", precio: 200 },
      { id: "ortiz", nombre: "Ortíz", precio: 150 },
      {id: "vistherm", nombre: "Vista Hermosa", precio: 200}
    ]
  },
  reserva: {
    habilitado: true,
    precio: 100
  }
};

window.BARBER_CONFIG = BARBER_CONFIG;