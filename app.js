const SECCIONES = [
  'AMONÍACO',
  'AGUA DE CALDERAS',
  'AIRE DE SELLO',
  'AGUA FRIA',
  'COOLING WATER',
  'COMPRESOR K4501',
  'CIRCUITO DE LUBRICACIÓN',
  'SISTEMA DE VAPOR D4511',
  'CONDENSADOR DE SUPERFICIE',
  'SISTEMA DE VAPOR D4505',
  'ACEITE DE CONTROL'
];

const PUNTOS = [
  {
    seccion:'AMONÍACO',
    tag:'PI 45004',
    equipo:'E4501',
    parametro:'Presión',
    unidad:'barg',
    rango:'3.9 - 4.5'
  },
  {
    seccion:'AMONÍACO',
    tag:'TI 45003',
    equipo:'E4501',
    parametro:'Temperatura',
    unidad:'°C',
    rango:'8 - 12'
  },
  {
    seccion:'AGUA DE CALDERAS',
    tag:'PI 45045',
    equipo:'P4508A',
    parametro:'Presión',
    unidad:'barg',
    rango:'0.2 - 2.0'
  }
];

let indice = 0;
let buffer = '';

function $(id){
  return document.getElementById(id);
}

function actualizarFecha(){
  const d = new Date();
  $('fechaHora').textContent =
    d.toLocaleDateString('es-CL') + ' · ' +
    d.toLocaleTimeString('es-CL', {
      hour:'2-digit',
      minute:'2-digit'
    });
}

setInterval(actualizarFecha, 30000);
actualizarFecha();

function render(){

  const p = PUNTOS[indice];

  $('seccion').textContent = p.seccion;
  $('tag').textContent = p.tag;
  $('equipo').textContent = p.equipo;
  $('parametro').textContent =
    p.parametro + ' · ' + p.unidad;
  $('rango').textContent =
    'Rango ' + p.rango + ' ' + p.unidad;
  $('ultimo').textContent =
    'Último registro: —';

  $('contador').textContent =
    (indice + 1) + ' / ' + PUNTOS.length;

  $('valorActual').textContent = buffer;
}

function siguiente(){
  buffer = '';
  if(indice < PUNTOS.length - 1){
    indice++;
    render();
  }else{
    alert('Ronda finalizada');
    indice = 0;
    render();
  }
}

function anterior(){
  buffer = '';
  if(indice > 0){
    indice--;
    render();
  }
}

$('btnIniciar').onclick = () => {
  document
    .getElementById('inicio')
    .classList.remove('active');
  document
    .getElementById('ronda')
    .classList.add('active');
  render();
};

document
  .querySelectorAll('[data-key]')
  .forEach(btn => {
    btn.onclick = () => {
      const k = btn.dataset.key;

      if(k === ',' && buffer.includes(',')) return;

      buffer += k;
      render();
    };
  });

$('backspace').onclick = () => {
  buffer = buffer.slice(0, -1);
  render();
};

let startX = 0;

document.addEventListener(
  'touchstart',
  e => {
    startX = e.changedTouches[0].clientX;
  },
  { passive:true }
);

document.addEventListener(
  'touchend',
  e => {

    const dx =
      e.changedTouches[0].clientX - startX;

    if(Math.abs(dx) < 60) return;

    if(dx < 0){
      siguiente();
    }else{
      anterior();
    }

  },
  { passive:true }
);