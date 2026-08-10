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
    unidad:'(70-90 cm)'
  },

  {
    id:2,
    seccion:'AMONIACO',
    tag:'PDI45008',
    equipo:'F4506',
    parametro:'Presión diferencial',
    unidad:'(<250 mbar)'
  },

  {
    id:3,
    seccion:'AMONIACO',
    tag:'PDI45003',
    equipo:'F4501 A/B',
    parametro:'Presión dif',
    unidad:'(<1280 mbar)'
  },

  {
    id:4,
    seccion:'AMONIACO',
    tag:'LI45021',
    equipo:'E4502',
    parametro:'Nivel',
    unidad:'(88-112 cm)'
  },

  {
    id:5,
    seccion:'AMONIACO',
    tag:'TI45006',
    equipo:'E4521',
    parametro:'Temperatura',
    unidad:'(95-100 °C)'
  },

  // =====================================================
  // AGUA DE CALDERAS
  // =====================================================

  {
    id:6,
    seccion:'AGUA DE CALDERAS',
    tag:'LG45025',
    equipo:'D4508 ELIMINOX',
    parametro:'Nivel',
    unidad:'(0-50 cm)'
  },

  {
    id:7,
    seccion:'AGUA DE CALDERAS',
    tag:'LG45040',
    equipo:'D4509 FOSFATO',
    parametro:'Nivel',
    unidad:'(0-50 cm)'
  },

  {
    id:8,
    seccion:'AGUA DE CALDERAS',
    tag:'PI45047',
    equipo:'P4506-A',
    parametro:'Presión',
    unidad:'(39-43 barg)'
  },

  {
    id:9,
    seccion:'AGUA DE CALDERAS',
    tag:'PI45048',
    equipo:'P4506-B',
    parametro:'Presión',
    unidad:'(39-43 barg)'
  },

  {
    id:10,
    seccion:'AGUA DE CALDERAS',
    tag:'AMPERAJE',
    equipo:'P4506-A',
    parametro:'Amperaje',
    unidad:'(150-180 Amp)'
  },

  {
    id:11,
    seccion:'AGUA DE CALDERAS',
    tag:'AMPERAJE',
    equipo:'P4506-B',
    parametro:'Amperaje',
    unidad:'(150-180 Amp)'
  },

  {
    id:12,
    seccion:'AGUA DE CALDERAS',
    tag:'PI45082',
    equipo:'D4506',
    parametro:'Presión',
    unidad:'(0.4-0.6 barg)'
  },

  {
    id:13,
    seccion:'AGUA DE CALDERAS',
    tag:'LG45026B',
    equipo:'D4506',
    parametro:'Nivel',
    unidad:'(40-90 %)'
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
    unidad:'(8.0-15 mbarg)'
  },

  {
    id:15,
    seccion:'AIRE DE SELLO',
    tag:'PI45771',
    equipo:'M4502',
    parametro:'Presión',
    unidad:'(8.0-15 mbarg)'
  },

  {
    id:16,
    seccion:'AIRE DE SELLO',
    tag:'PI45761',
    equipo:'M4502',
    parametro:'Presión',
    unidad:'(8.0-15 mbarg)'
  },

  {
    id:17,
    seccion:'AIRE DE SELLO',
    tag:'PI45763',
    equipo:'K4501',
    parametro:'Presión',
    unidad:'(8.0-15 mbarg)'
  },

  {
    id:18,
    seccion:'AIRE DE SELLO',
    tag:'PI45762',
    equipo:'K4501',
    parametro:'Presión',
    unidad:'(8.0-15 mbarg)'
  },

  {
    id:19,
    seccion:'AIRE DE SELLO',
    tag:'PI45782',
    equipo:'K4501-Z01',
    parametro:'Presión',
    unidad:'(8.0-15 mbarg)'
  },

  {
    id:20,
    seccion:'AIRE DE SELLO',
    tag:'PI45781',
    equipo:'K4501-Z01',
    parametro:'Presión',
    unidad:'(8.0-15 mbarg)'
  },

  {
    id:21,
    seccion:'AIRE DE SELLO',
    tag:'PI45751',
    equipo:'K4502',
    parametro:'Presión',
    unidad:'(8.0-15 mbarg)'
  },

 {
    id:22,
    seccion:'AIRE DE SELLO',
    tag:'PI45741',
    equipo:'M4501',
    parametro:'Presión',
    unidad:'(8.0-15 mbarg)'
  },

 {
    id:23,
    seccion:'AIRE DE SELLO',
    tag:'PI45746',
    equipo:'M4501',
    parametro:'Presión',
    unidad:'(8.0-15 mbarg)'
  },

 {
    id:24,
    seccion:'AIRE DE SELLO',
    tag:'PI45727',
    equipo:'G4501-Z01',
    parametro:'Presión',
    unidad:'(8.0-15 mbarg)'
  },

 {
    id:25,
    seccion:'AIRE DE SELLO',
    tag:'PI45728',
    equipo:'G4501-Z01',
    parametro:'Presión',
    unidad:'(8.0-15 mbarg)'
  },

 {
    id:26,
    seccion:'AIRE DE SELLO',
    tag:'PI45773',
    equipo:'M4502',
    parametro:'Presión',
    unidad:'(0.1-0.2 mbarg)'
  },

 {
    id:27,
    seccion:'AIRE DE SELLO',
    tag:'PI45774',
    equipo:'M4502',
    parametro:'Presión',
    unidad:'(0.5-1.0 mbarg)'
  },

 {
    id:28,
    seccion:'AIRE DE SELLO',
    tag:'PI45772',
    equipo:'M4502',
    parametro:'Presión',
    unidad:'(0.1-0.2 mbarg)'
  },

 {
    id:29,
    seccion:'AIRE DE SELLO',
    tag:'PDIT45750',
    equipo:'K4502',
    parametro:'Presión',
    unidad:'(250-350 mbarg)'
  },

 {
    id:30,
    seccion:'AIRE DE SELLO',
    tag:'PI45749A',
    equipo:'K4502',
    parametro:'Presión',
    unidad:'(2.5-4.0 barg)'
  },

 {
    id:31,
    seccion:'AIRE DE SELLO',
    tag:'PI45752',
    equipo:'K4502',
    parametro:'Presión',
    unidad:'(2.5-4.0 barg)'
  },

  // =====================================================
  // AGUA FRIA (TODOS)
  // =====================================================

  {
    id:32,
    seccion:'AGUA FRIA',
    tag:'PI45007A',
    equipo:'P4510-A',
    parametro:'Presión',
    unidad:'(6.0-7.0 barg)'
  },

  {
    id:33,
    seccion:'AGUA FRIA',
    tag:'PI45007B',
    equipo:'P4510-B',
    parametro:'Presión',
    unidad:'(6.0-7.0 barg)'
  },

  {
    id:34,
    seccion:'AGUA FRIA',
    tag:'AMPERAJE',
    equipo:'P4510-A',
    parametro:'Presión',
    unidad:'(60-80 Amp)'
  },

  {
    id:35,
    seccion:'AGUA FRIA',
    tag:'AMPERAJE',
    equipo:'P4510-B',
    parametro:'Presión',
    unidad:'(60-80 Amp)'
  },

  
  // =====================================================
  // COOLING WATER
  // =====================================================

  {
    id:36,
    seccion:'COOLING WATER',
    tag:'TI45036',
    equipo:'E4510',
    parametro:'Temperatura',
    unidad:'(40-55 °C)'
  },

  {
    id:37,
    seccion:'COOLING WATER',
    tag:'TI45042',
    equipo:'E4513',
    parametro:'Temperatura',
    unidad:'(25-40 °C)'
  },

  // =====================================================
  // SISTEMA DE VAPOR D4511
  // =====================================================

  {
    id:38,
    seccion:'SISTEMA DE VAPOR D4511',
    tag:'LI45011',
    equipo:'D4511',
    parametro:'Nivel',
    unidad:'(0-110 cm)'
  },

  // =====================================================
  // CONDENSADOR DE SUPERFICIE
  // =====================================================

  {
    id:39,
    seccion:'CONDENSADOR DE SUPERFICIE',
    tag:'PI45058',
    equipo:'E4516',
    parametro:'Presión',
    unidad:'(1.0-2.0 barg)'
  },

  {
    id:40,
    seccion:'CONDENSADOR DE SUPERFICIE',
    tag:'PI45059',
    equipo:'E4516',
    parametro:'Presión',
    unidad:'(0.5-2.0 barg)'
  },

  {
    id:41,
    seccion:'CONDENSADOR DE SUPERFICIE',
    tag:'TI45065',
    equipo:'E4516',
    parametro:'Temperatura',
    unidad:'(12-25 °C)'
  },

  {
    id:42,
    seccion:'CONDENSADOR DE SUPERFICIE',
    tag:'TI45066',
    equipo:'E4516',
    parametro:'Temperatura',
    unidad:'(18-31 °C)'
  },

  // =====================================================
  // ACEITE DE CONTROL
  // =====================================================

  {
    id:43,
    seccion:'ACEITE DE CONTROL',
    tag:'AMPERAJE',
    equipo:'P4517-A',
    parametro:'Amperaje',
    unidad:'(3-4 Amp)'
  },

  {
    id:44,
    seccion:'ACEITE DE CONTROL',
    tag:'AMPERAJE',
    equipo:'P4517-B',
    parametro:'Amperaje',
    unidad:'(3-4 Amp)'
  },

  {
    id:45,
    seccion:'ACEITE DE CONTROL',
    tag:'PI45649',
    equipo:'Descarga común',
    parametro:'Presión',
    unidad:'(145-175 barg)'
  },

  // =====================================================
  // PURGA (ÚLTIMO ELEMENTO)
  // =====================================================

  {
    id:46,
    seccion:'PURGA CONTINUA',
    tag:'PURGA',
    equipo:'D4505',
    parametro:'Apertura',
    unidad:'(0-100 %)'
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