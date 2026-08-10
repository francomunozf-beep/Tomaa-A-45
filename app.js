// =====================================================
// TOMA DE DATOS DE TERRENO A-45
// app.js - NUEVA VERSIÓN (Parte 1)
// Optimizada para iPhone 14 Pro
// =====================================================

// -----------------------------------------------------
// ORDEN FIJO DE SECCIONES
// -----------------------------------------------------

const SECCIONES = [
  'AMONIACO',
  'AGUA DE CALDERAS',
  'AIRE DE SELLO',
  'AGUA FRIA',
  'COOLING WATER',
  'SISTEMA DE VAPOR D4511',
  'CONDENSADOR DE SUPERFICIE',
  'ACEITE DE CONTROL',
  'PURGA'
];

// -----------------------------------------------------
// BASE DE DATOS
// -----------------------------------------------------

const DB_NAME = 'A45_DB';
const DB_VERSION = 2;

let db = null;

// -----------------------------------------------------
// ESTADO DE LA APP
// -----------------------------------------------------

let PUNTOS = [];
let ronda = [];
let indice = 0;
let buffer = '';
let sesionActual = null;

// -----------------------------------------------------
// UTILIDADES
// -----------------------------------------------------

function $(id){
  return document.getElementById(id);
}

function ahoraISO(){
  return new Date().toISOString();
}

function fechaChile(){

  const d = new Date();

  return d.toLocaleDateString('es-CL');

}

function horaChile(){

  const d = new Date();

  return d.toLocaleTimeString(
    'es-CL',
    {
      hour:'2-digit',
      minute:'2-digit'
    }
  );

}

function actualizarFecha(){

  if(!$('fechaHora')) return;

  $('fechaHora').textContent =
    fechaChile() + ' · ' + horaChile();

}

setInterval(actualizarFecha,30000);
actualizarFecha();

// -----------------------------------------------------
// INDEXEDDB
// -----------------------------------------------------

function abrirDB(){

  return new Promise((resolve,reject)=>{

    const req =
      indexedDB.open(DB_NAME,DB_VERSION);

    req.onupgradeneeded = e=>{

      const database = e.target.result;

      if(
        !database.objectStoreNames.contains('sesiones')
      ){

        const s =
          database.createObjectStore(
            'sesiones',
            {
              keyPath:'id',
              autoIncrement:true
            }
          );

        s.createIndex('fecha','fecha');

      }

    };

    req.onsuccess = e=>{

      db = e.target.result;

      resolve();

    };

    req.onerror = e=> reject(e);

  });

}

// -----------------------------------------------------
// HISTORIAL
// -----------------------------------------------------

function guardarSesion(){

  return new Promise((resolve,reject)=>{

    const tx =
      db.transaction('sesiones','readwrite');

    tx.objectStore('sesiones').add(sesionActual);

    tx.oncomplete = ()=> resolve();

    tx.onerror = e=> reject(e);

  });

}

function leerSesiones(){

  return new Promise(resolve=>{

    const tx =
      db.transaction('sesiones','readonly');

    const req =
      tx.objectStore('sesiones').getAll();

    req.onsuccess = ()=>{

      resolve(req.result || []);

    };

    req.onerror = ()=> resolve([]);

  });

}

// -----------------------------------------------------
// RONDA
// -----------------------------------------------------

function prepararRonda(){

  ronda = PUNTOS.map(p=>({

    ...p,

    lectura:''

  }));

  indice = 0;

  buffer = '';

  sesionActual = {

    fecha: fechaChile(),

    hora: horaChile(),

    creado: ahoraISO(),

    registros: []

  };

}

// -----------------------------------------------------
// LISTA DE INSTRUMENTOS (VERSIÓN REDUCIDA)
// -----------------------------------------------------

PUNTOS = [

  // =====================================================
  // AMONIACO
  // =====================================================

  {
    id:1,
    seccion:'AMONIACO',
    tag:'LI45001',
    equipo:'D4501',
    parametro:'Nivel',
    unidad:'%'
  },

  {
    id:2,
    seccion:'AMONIACO',
    tag:'PDI45008',
    equipo:'F4502',
    parametro:'Presión diferencial',
    unidad:'mbar'
  },

  {
    id:3,
    seccion:'AMONIACO',
    tag:'PDI45003',
    equipo:'F4501',
    parametro:'Presión diferencial',
    unidad:'mbar'
  },

  {
    id:4,
    seccion:'AMONIACO',
    tag:'LI45021',
    equipo:'D4502',
    parametro:'Nivel',
    unidad:'%'
  },

  {
    id:5,
    seccion:'AMONIACO',
    tag:'TI45006',
    equipo:'D4501',
    parametro:'Temperatura',
    unidad:'°C'
  },

  // =====================================================
  // AGUA DE CALDERAS
  // =====================================================

  {
    id:6,
    seccion:'AGUA DE CALDERAS',
    tag:'LG45025',
    equipo:'D4506',
    parametro:'Nivel',
    unidad:'%'
  },

  {
    id:7,
    seccion:'AGUA DE CALDERAS',
    tag:'LG45024',
    equipo:'D4506',
    parametro:'Nivel',
    unidad:'%'
  },

  {
    id:8,
    seccion:'AGUA DE CALDERAS',
    tag:'PI45047',
    equipo:'D4506',
    parametro:'Presión',
    unidad:'barg'
  },

  {
    id:9,
    seccion:'AGUA DE CALDERAS',
    tag:'PI45048',
    equipo:'D4506',
    parametro:'Presión',
    unidad:'barg'
  },

  {
    id:10,
    seccion:'AGUA DE CALDERAS',
    tag:'AMP_P4506A',
    equipo:'P4506A',
    parametro:'Amperaje',
    unidad:'A'
  },

  {
    id:11,
    seccion:'AGUA DE CALDERAS',
    tag:'AMP_P4506B',
    equipo:'P4506B',
    parametro:'Amperaje',
    unidad:'A'
  },

  {
    id:12,
    seccion:'AGUA DE CALDERAS',
    tag:'PI45082',
    equipo:'D4506',
    parametro:'Presión',
    unidad:'barg'
  },

  {
    id:13,
    seccion:'AGUA DE CALDERAS',
    tag:'LG45026B',
    equipo:'D4506',
    parametro:'Nivel',
    unidad:'%'
  },

  // =====================================================
  // AIRE DE SELLO (TODOS)
  // =====================================================

  {
    id:14,
    seccion:'AIRE DE SELLO',
    tag:'PI45775',
    equipo:'M4502',
    parametro:'Presión',
    unidad:'mbarg'
  },

  {
    id:15,
    seccion:'AIRE DE SELLO',
    tag:'PI45771',
    equipo:'M4502',
    parametro:'Presión',
    unidad:'mbarg'
  },

  {
    id:16,
    seccion:'AIRE DE SELLO',
    tag:'PI45761',
    equipo:'M4502',
    parametro:'Presión',
    unidad:'mbarg'
  },

  {
    id:17,
    seccion:'AIRE DE SELLO',
    tag:'PI45763',
    equipo:'K4501',
    parametro:'Presión',
    unidad:'mbarg'
  },

  {
    id:18,
    seccion:'AIRE DE SELLO',
    tag:'PI45762',
    equipo:'K4501',
    parametro:'Presión',
    unidad:'mbarg'
  },

  {
    id:19,
    seccion:'AIRE DE SELLO',
    tag:'PI45776',
    equipo:'K4501',
    parametro:'Presión',
    unidad:'mbarg'
  },

  // =====================================================
  // AGUA FRIA (TODOS)
  // =====================================================

  {
    id:20,
    seccion:'AGUA FRIA',
    tag:'PI45067',
    equipo:'E4501',
    parametro:'Presión',
    unidad:'barg'
  },

  {
    id:21,
    seccion:'AGUA FRIA',
    tag:'TI45008',
    equipo:'E4501',
    parametro:'Temperatura',
    unidad:'°C'
  },

  {
    id:22,
    seccion:'AGUA FRIA',
    tag:'PI45068',
    equipo:'E4502',
    parametro:'Presión',
    unidad:'barg'
  },

  {
    id:23,
    seccion:'AGUA FRIA',
    tag:'TI45010',
    equipo:'E4502',
    parametro:'Temperatura',
    unidad:'°C'
  },

  {
    id:24,
    seccion:'AGUA FRIA',
    tag:'PI45069',
    equipo:'E4503',
    parametro:'Presión',
    unidad:'barg'
  },

  {
    id:25,
    seccion:'AGUA FRIA',
    tag:'TI45012',
    equipo:'E4503',
    parametro:'Temperatura',
    unidad:'°C'
  },

  {
    id:26,
    seccion:'AGUA FRIA',
    tag:'PI45070',
    equipo:'E4504',
    parametro:'Presión',
    unidad:'barg'
  },

  {
    id:27,
    seccion:'AGUA FRIA',
    tag:'TI45014',
    equipo:'E4504',
    parametro:'Temperatura',
    unidad:'°C'
  },

  {
    id:28,
    seccion:'AGUA FRIA',
    tag:'PI45071',
    equipo:'E4505',
    parametro:'Presión',
    unidad:'barg'
  },

  {
    id:29,
    seccion:'AGUA FRIA',
    tag:'TI45016',
    equipo:'E4505',
    parametro:'Temperatura',
    unidad:'°C'
  },

  {
    id:30,
    seccion:'AGUA FRIA',
    tag:'PI45072',
    equipo:'E4506',
    parametro:'Presión',
    unidad:'barg'
  },

  {
    id:31,
    seccion:'AGUA FRIA',
    tag:'TI45018',
    equipo:'E4506',
    parametro:'Temperatura',
    unidad:'°C'
  },

  {
    id:32,
    seccion:'AGUA FRIA',
    tag:'PI45073',
    equipo:'E4507',
    parametro:'Presión',
    unidad:'barg'
  },

  {
    id:33,
    seccion:'AGUA FRIA',
    tag:'TI45020',
    equipo:'E4507',
    parametro:'Temperatura',
    unidad:'°C'
  },

  // =====================================================
  // COOLING WATER
  // =====================================================

  {
    id:34,
    seccion:'COOLING WATER',
    tag:'TI45036',
    equipo:'E4510',
    parametro:'Temperatura',
    unidad:'°C'
  },

  {
    id:35,
    seccion:'COOLING WATER',
    tag:'TI45042',
    equipo:'E4511',
    parametro:'Temperatura',
    unidad:'°C'
  },

  // =====================================================
  // SISTEMA DE VAPOR D4511
  // =====================================================

  {
    id:36,
    seccion:'SISTEMA DE VAPOR D4511',
    tag:'LI45011',
    equipo:'D4511',
    parametro:'Nivel',
    unidad:'%'
  },

  // =====================================================
  // CONDENSADOR DE SUPERFICIE
  // =====================================================

  {
    id:37,
    seccion:'CONDENSADOR DE SUPERFICIE',
    tag:'PI45058',
    equipo:'E4521',
    parametro:'Presión',
    unidad:'barg'
  },

  {
    id:38,
    seccion:'CONDENSADOR DE SUPERFICIE',
    tag:'PI45059',
    equipo:'E4521',
    parametro:'Presión',
    unidad:'barg'
  },

  {
    id:39,
    seccion:'CONDENSADOR DE SUPERFICIE',
    tag:'TI45065',
    equipo:'E4521',
    parametro:'Temperatura',
    unidad:'°C'
  },

  {
    id:40,
    seccion:'CONDENSADOR DE SUPERFICIE',
    tag:'TI45066',
    equipo:'E4521',
    parametro:'Temperatura',
    unidad:'°C'
  },

  // =====================================================
  // ACEITE DE CONTROL
  // =====================================================

  {
    id:41,
    seccion:'ACEITE DE CONTROL',
    tag:'AMP_P4517A',
    equipo:'P4517A',
    parametro:'Amperaje',
    unidad:'A'
  },

  {
    id:42,
    seccion:'ACEITE DE CONTROL',
    tag:'AMP_P4517B',
    equipo:'P4517B',
    parametro:'Amperaje',
    unidad:'A'
  },

  {
    id:43,
    seccion:'ACEITE DE CONTROL',
    tag:'PI45649',
    equipo:'D4517',
    parametro:'Presión',
    unidad:'barg'
  },

  // =====================================================
  // PURGA (ÚLTIMO ELEMENTO)
  // =====================================================

  {
    id:44,
    seccion:'PURGA',
    tag:'PURGA',
    equipo:'D4506',
    parametro:'Purga',
    unidad:'%'
  }

];

// -----------------------------------------------------
// ORDENAR SEGÚN EL ORDEN DEFINIDO
// -----------------------------------------------------

function ordenarPuntos(){

  PUNTOS.sort((a,b)=>{

    const sa = SECCIONES.indexOf(a.seccion);

    const sb = SECCIONES.indexOf(b.seccion);

    if(sa !== sb) return sa - sb;

    return a.id - b.id;

  });

}

// -----------------------------------------------------
// RENDER DE UN INSTRUMENTO
// -----------------------------------------------------

async function renderElemento(){

  const p = ronda[indice];

  if(!p) return;

  if($('seccion'))
    $('seccion').textContent = p.seccion;

  if($('tag'))
    $('tag').textContent = p.tag;

  if($('equipo'))
    $('equipo').textContent = p.equipo;

  if($('parametro'))
    $('parametro').textContent =
      p.parametro + ' · ' + p.unidad;

  // Rango y último registro en la misma línea
  if($('rango'))
    $('rango').textContent =
      p.minimo !== undefined && p.maximo !== undefined
        ? 'Rango ' + p.minimo + ' - ' + p.maximo + ' ' + p.unidad
        : '';

  if($('ultimo')){
    const ult = await ultimoValor(p.tag);
    $('ultimo').textContent = 'Último: ' + ult;
  }

  if($('contador'))
    $('contador').textContent =
      (indice + 1) + ' / ' + ronda.length;

  if($('valorActual'))
    $('valorActual').textContent = buffer;

}

// -----------------------------------------------------
// ÚLTIMO VALOR DE UN TAG
// -----------------------------------------------------

async function ultimoValor(tag){

  const sesiones = await leerSesiones();

  for(let i = sesiones.length - 1; i >= 0; i--){

    const s = sesiones[i];

    if(!s.registros) continue;

    const r =
      s.registros.find(x => x.tag === tag);

    if(r) return r.valor;

  }

  return '—';

}

// -----------------------------------------------------
// BUFFER DE ESCRITURA
// -----------------------------------------------------

function limpiarBuffer(){

  buffer = '';

  if($('valorActual'))
    $('valorActual').textContent = '';

}

function actualizarBuffer(){

  if($('valorActual'))
    $('valorActual').textContent = buffer;

}

// -----------------------------------------------------
// NAVEGACIÓN (SIN GESTOS)
// -----------------------------------------------------

function siguiente(){

  if(indice < ronda.length - 1){

    indice++;

    limpiarBuffer();

    renderElemento();

  }

}

function anterior(){

  if(indice > 0){

    indice--;

    limpiarBuffer();

    renderElemento();

  }

}

// -----------------------------------------------------
// TECLADO NUMÉRICO
// -----------------------------------------------------

function agregarDigito(k){

  if(k === ',' && buffer.includes(','))
    return;

  if(buffer.includes(',')){

    const dec = buffer.split(',')[1];

    if(dec.length >= 2)
      return;

  }

  buffer += k;

  actualizarBuffer();

}

function borrarDigito(){

  if(buffer.length === 0)
    return;

  buffer = buffer.slice(0,-1);

  actualizarBuffer();

}

document
  .querySelectorAll('#teclado [data-key]')
  .forEach(btn =>{

    btn.addEventListener(
      'click',
      () => agregarDigito(btn.dataset.key)
    );

  });

if($('backspace'))
  $('backspace').addEventListener(
    'click',
    borrarDigito
  );

// -----------------------------------------------------
// ATAJOS DE TECLADO FÍSICO
// -----------------------------------------------------

document.addEventListener(
  'keydown',
  e =>{

    if(e.key >= '0' && e.key <= '9')
      agregarDigito(e.key);

    if(e.key === ',' || e.key === '.')
      agregarDigito(',');

    if(e.key === 'Backspace')
      borrarDigito();

    if(e.key === 'Enter')
      guardarActual();

  }
);

// -----------------------------------------------------
// EVENTOS DE NAVEGACIÓN
// -----------------------------------------------------

if($('btnAnterior'))
  $('btnAnterior').addEventListener(
    'click',
    anterior
  );

if($('btnSiguiente'))
  $('btnSiguiente').addEventListener(
    'click',
    siguiente
  );

if($('btnAceptar'))
  $('btnAceptar').addEventListener(
    'click',
    guardarActual
  );

// NOTA:
// Se eliminaron completamente los eventos
// touchstart y touchend.
// Ya NO existe navegación por deslizamiento.

// -----------------------------------------------------
// GUARDAR LECTURA ACTUAL
// -----------------------------------------------------

async function guardarActual(){

  const p = ronda[indice];

  if(!p) return;

  const valor = buffer.trim();

  if(valor === '') return;

  ronda[indice].lectura = valor;

  sesionActual.registros.push({
    seccion: p.seccion,
    tag: p.tag,
    equipo: p.equipo,
    parametro: p.parametro,
    unidad: p.unidad,
    valor: valor
  });

  if(indice < ronda.length - 1){

    indice++;

    limpiarBuffer();

    renderElemento();

  }else{

    await finalizarRonda();

  }

}

// -----------------------------------------------------
// INICIAR RONDA
// -----------------------------------------------------

async function iniciarRonda(){

  prepararRonda();

  if($('inicio'))
    $('inicio').classList.remove('active');

  if($('historial'))
    $('historial').classList.remove('active');

  if($('ronda'))
    $('ronda').classList.add('active');

  renderElemento();

}

// -----------------------------------------------------
// FINALIZAR RONDA
// -----------------------------------------------------

async function finalizarRonda(){

  await guardarSesion();

  if($('ronda'))
    $('ronda').classList.remove('active');

  if($('historial'))
    $('historial').classList.add('active');

  await mostrarHistorial();

}

// -----------------------------------------------------
// HISTORIAL POR DÍA
// -----------------------------------------------------

async function mostrarHistorial(){

  const lista = $('listaHistorial');

  if(!lista) return;

  lista.innerHTML = '';

  const sesiones = await leerSesiones();

  if(sesiones.length === 0){

    lista.innerHTML =
      '<div class="historial-dia">No existen registros.</div>';

    return;

  }

  const grupos = {};

  sesiones.forEach(s=>{

    if(!grupos[s.fecha])
      grupos[s.fecha] = [];

    grupos[s.fecha].push(s);

  });

  Object.keys(grupos)
    .sort()
    .reverse()
    .forEach(fecha=>{

      const box = document.createElement('div');

      box.className = 'historial-dia';

      const h = document.createElement('h3');

      h.textContent = fecha;

      box.appendChild(h);

      grupos[fecha]
        .sort((a,b)=>
          b.creado.localeCompare(a.creado)
        )
        .forEach(s=>{

          const item = document.createElement('div');

          item.className = 'historial-item';

          const left =
            document.createElement('div');

          left.textContent =
            s.hora + ' (' + s.registros.length + ' datos)';

          const right =
            document.createElement('button');

          right.className = 'ghost';

          right.textContent = 'Ver';

          right.addEventListener(
            'click',
            ()=> verSesion(s)
          );

          item.appendChild(left);

          item.appendChild(right);

          box.appendChild(item);

        });

      lista.appendChild(box);

    });

}

// -----------------------------------------------------
// VER UNA SESIÓN
// -----------------------------------------------------

function verSesion(sesion){

  let texto =
    sesion.fecha + ' ' + sesion.hora + '\\n\\n';

  sesion.registros.forEach(r=>{

    texto +=
      r.seccion + ' - ' +
      r.tag + ' - ' +
      r.valor + ' ' +
      r.unidad + '\\n';

  });

  alert(texto);

}

// -----------------------------------------------------
// EXPORTAR CSV
// -----------------------------------------------------

async function exportarCSV(){

  const sesiones = await leerSesiones();

  if(sesiones.length === 0){

    alert('No existen registros');

    return;

  }

  const filas = [[
    'Fecha',
    'Hora',
    'Sección',
    'TAG',
    'Equipo',
    'Parámetro',
    'Unidad',
    'Valor'
  ]];

  sesiones.forEach(s=>{

    s.registros.forEach(r=>{

      filas.push([
        s.fecha,
        s.hora,
        r.seccion,
        r.tag,
        r.equipo,
        r.parametro,
        r.unidad,
        r.valor
      ]);

    });

  });

  const csv =
    filas
      .map(f=>f.join(';'))
      .join('\\n');

  const blob =
    new Blob(
      [csv],
      {type:'text/csv;charset=utf-8;'}
    );

  const url =
    URL.createObjectURL(blob);

  const a =
    document.createElement('a');

  a.href = url;

  a.download =
    'Toma_A45_' +
    fechaChile().replaceAll('/','-') +
    '.csv';

  a.click();

  URL.revokeObjectURL(url);

}

// -----------------------------------------------------
// NAVEGACIÓN ENTRE PANTALLAS
// -----------------------------------------------------

async function abrirHistorial(){

  if($('inicio'))
    $('inicio').classList.remove('active');

  if($('ronda'))
    $('ronda').classList.remove('active');

  if($('historial'))
    $('historial').classList.add('active');

  await mostrarHistorial();

}

function volverInicio(){

  if($('historial'))
    $('historial').classList.remove('active');

  if($('ronda'))
    $('ronda').classList.remove('active');

  if($('inicio'))
    $('inicio').classList.add('active');

}

// -----------------------------------------------------
// EVENTOS PRINCIPALES
// -----------------------------------------------------

if($('btnIniciar'))
  $('btnIniciar').addEventListener(
    'click',
    iniciarRonda
  );

if($('btnVerHistorial'))
  $('btnVerHistorial').addEventListener(
    'click',
    abrirHistorial
  );

if($('btnNuevaRonda'))
  $('btnNuevaRonda').addEventListener(
    'click',
    iniciarRonda
  );

if($('btnVolverInicio'))
  $('btnVolverInicio').addEventListener(
    'click',
    volverInicio
  );

if($('btnFinalizar'))
  $('btnFinalizar').addEventListener(
    'click',
    finalizarRonda
  );

// -----------------------------------------------------
// INICIALIZACIÓN
// -----------------------------------------------------

(async function(){

  await abrirDB();

  ordenarPuntos();

  actualizarFecha();

})();