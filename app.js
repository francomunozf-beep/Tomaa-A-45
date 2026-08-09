// =====================================================
// TOMA DE DATOS DE TERRENO A-45
// app.js - PARTE 1
// Base de la aplicación, IndexedDB, configuración,
// Purga/Filtro persistentes y utilidades.
// =====================================================

// Orden exacto solicitado por el usuario
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

// -----------------------------------------------------
// BASE DE DATOS
// -----------------------------------------------------

const DB_NAME = 'A45_DB';
const DB_VERSION = 1;

let db = null;

// -----------------------------------------------------
// ESTADO DE LA APP
// -----------------------------------------------------

let PUNTOS = [];
let ronda = [];
let indice = 0;
let buffer = '';

// -----------------------------------------------------
// UTILIDADES
// -----------------------------------------------------

function $(id){
  return document.getElementById(id);
}

function ahoraISO(){
  return new Date().toISOString();
}

function formatearFecha(d){
  return d.toLocaleDateString('es-CL') + ' · ' +
         d.toLocaleTimeString('es-CL',{
           hour:'2-digit',
           minute:'2-digit'
         });
}

// -----------------------------------------------------
// RELOJ EN PANTALLA
// -----------------------------------------------------

function actualizarFecha(){

  const el = $('fechaHora');

  if(!el) return;

  el.textContent = formatearFecha(new Date());

}

setInterval(actualizarFecha,30000);
actualizarFecha();

// -----------------------------------------------------
// INDEXEDDB
// -----------------------------------------------------

function abrirDB(){

  return new Promise((resolve,reject)=>{

    const req = indexedDB.open(DB_NAME,DB_VERSION);

    req.onupgradeneeded = e=>{

      const database = e.target.result;

      if(!database.objectStoreNames.contains('registros')){

        const s = database.createObjectStore(
          'registros',
          {
            keyPath:'id',
            autoIncrement:true
          }
        );

        s.createIndex('PuntoID','PuntoID');
        s.createIndex('Fecha','Fecha');

      }

      if(!database.objectStoreNames.contains('config')){

        database.createObjectStore(
          'config',
          {
            keyPath:'key'
          }
        );

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
// CONFIGURACIÓN
// -----------------------------------------------------

function guardarConfig(key,value){

  return new Promise((resolve,reject)=>{

    const tx = db.transaction('config','readwrite');

    tx.objectStore('config').put({
      key,
      value
    });

    tx.oncomplete = ()=> resolve();

    tx.onerror = e=> reject(e);

  });

}

function leerConfig(key){

  return new Promise(resolve=>{

    const tx = db.transaction('config','readonly');

    const req = tx.objectStore('config').get(key);

    req.onsuccess = ()=>{

      resolve(
        req.result ? req.result.value : ''
      );

    };

    req.onerror = ()=> resolve('');

  });

}

// -----------------------------------------------------
// REGISTROS
// -----------------------------------------------------

function guardarRegistro(reg){

  return new Promise((resolve,reject)=>{

    const tx = db.transaction(
      'registros',
      'readwrite'
    );

    tx.objectStore('registros').add(reg);

    tx.oncomplete = ()=> resolve();

    tx.onerror = e=> reject(e);

  });

}

function ultimoRegistro(id){

  return new Promise(resolve=>{

    const tx = db.transaction(
      'registros',
      'readonly'
    );

    const req = tx.objectStore('registros').getAll();

    req.onsuccess = ()=>{

      const arr = req.result.filter(
        x=> String(x.PuntoID)===String(id)
      );

      if(arr.length===0){

        resolve('—');
        return;

      }

      resolve(arr[arr.length-1].Valor);

    };

    req.onerror = ()=> resolve('—');

  });

}

// -----------------------------------------------------
// PURGA / FILTRO
// -----------------------------------------------------

async function cargarPurgaFiltro(){

  const purga = await leerConfig('purga');
  const filtro = await leerConfig('filtro');

  if($('purgaAnterior'))
    $('purgaAnterior').textContent =
      'Último: ' + (purga || '—');

  if($('filtroAnterior'))
    $('filtroAnterior').textContent =
      'Último: ' + (filtro || '—');

}

// -----------------------------------------------------
// INICIALIZACIÓN
// -----------------------------------------------------

async function iniciarSistema(){

  await abrirDB();

  await cargarPurgaFiltro();

}

iniciarSistema();

// =====================================================
PUNTOS = [
  { id:1, seccion:"AIRE DE SELLO", tag:"PI 45775", equipo:"M 4502", parametro:"Presión", unidad:"mbarg", minimo:8.0, maximo:15.0 },
  { id:2, seccion:"AIRE DE SELLO", tag:"PI 45771", equipo:"M 4502", parametro:"Presión", unidad:"mbarg", minimo:8.0, maximo:15.0 },
  { id:3, seccion:"AIRE DE SELLO", tag:"PI 45761", equipo:"M 4502", parametro:"Presión", unidad:"mbarg", minimo:8.0, maximo:15.0 },
  { id:4, seccion:"AIRE DE SELLO", tag:"PI 45763", equipo:"K 4501", parametro:"Presión", unidad:"mbarg", minimo:8.0, maximo:15.0 },
  { id:5, seccion:"AIRE DE SELLO", tag:"PI 45762", equipo:"K 4501", parametro:"Presión", unidad:"mbarg", minimo:8.0, maximo:15.0 },
  { id:6, seccion:"AIRE DE SELLO", tag:"PI 45776", equipo:"K 4501", parametro:"Presión", unidad:"mbarg", minimo:8.0, maximo:15.0 },

  { id:7, seccion:"AGUA FRIA", tag:"PI 45701", equipo:"E 4501", parametro:"Presión", unidad:"barg", minimo:2.0, maximo:4.0 },
  { id:8, seccion:"AGUA FRIA", tag:"TI 45702", equipo:"E 4501", parametro:"Temperatura", unidad:"°C", minimo:5.0, maximo:12.0 },
  { id:9, seccion:"AGUA FRIA", tag:"PI 45703", equipo:"E 4502", parametro:"Presión", unidad:"barg", minimo:2.0, maximo:4.0 },
  { id:10, seccion:"AGUA FRIA", tag:"TI 45704", equipo:"E 4502", parametro:"Temperatura", unidad:"°C", minimo:5.0, maximo:12.0 },
  { id:11, seccion:"AGUA FRIA", tag:"PI 45705", equipo:"E 4503", parametro:"Presión", unidad:"barg", minimo:2.0, maximo:4.0 },
  { id:12, seccion:"AGUA FRIA", tag:"TI 45706", equipo:"E 4503", parametro:"Temperatura", unidad:"°C", minimo:5.0, maximo:12.0 },
  { id:13, seccion:"AGUA FRIA", tag:"PI 45707", equipo:"E 4504", parametro:"Presión", unidad:"barg", minimo:2.0, maximo:4.0 },
  { id:14, seccion:"AGUA FRIA", tag:"TI 45708", equipo:"E 4504", parametro:"Temperatura", unidad:"°C", minimo:5.0, maximo:12.0 },
  { id:15, seccion:"AGUA FRIA", tag:"PI 45709", equipo:"E 4505", parametro:"Presión", unidad:"barg", minimo:2.0, maximo:4.0 },
  { id:16, seccion:"AGUA FRIA", tag:"TI 45710", equipo:"E 4505", parametro:"Temperatura", unidad:"°C", minimo:5.0, maximo:12.0 },
  { id:17, seccion:"AGUA FRIA", tag:"PI 45711", equipo:"E 4506", parametro:"Presión", unidad:"barg", minimo:2.0, maximo:4.0 },
  { id:18, seccion:"AGUA FRIA", tag:"TI 45712", equipo:"E 4506", parametro:"Temperatura", unidad:"°C", minimo:5.0, maximo:12.0 },
  { id:19, seccion:"AGUA FRIA", tag:"PI 45713", equipo:"E 4507", parametro:"Presión", unidad:"barg", minimo:2.0, maximo:4.0 },
  { id:20, seccion:"AGUA FRIA", tag:"TI 45714", equipo:"E 4507", parametro:"Temperatura", unidad:"°C", minimo:5.0, maximo:12.0 },

  { id:21, seccion:"COOLING WATER", tag:"PI 45801", equipo:"E 4510", parametro:"Presión", unidad:"barg", minimo:2.5, maximo:4.5 },
  { id:22, seccion:"COOLING WATER", tag:"TI 45802", equipo:"E 4510", parametro:"Temperatura", unidad:"°C", minimo:18.0, maximo:32.0 },
  { id:23, seccion:"COOLING WATER", tag:"PI 45803", equipo:"E 4511", parametro:"Presión", unidad:"barg", minimo:2.5, maximo:4.5 },
  { id:24, seccion:"COOLING WATER", tag:"TI 45804", equipo:"E 4511", parametro:"Temperatura", unidad:"°C", minimo:18.0, maximo:32.0 },
  { id:25, seccion:"COOLING WATER", tag:"PI 45805", equipo:"E 4512", parametro:"Presión", unidad:"barg", minimo:2.5, maximo:4.5 },
  { id:26, seccion:"COOLING WATER", tag:"TI 45806", equipo:"E 4512", parametro:"Temperatura", unidad:"°C", minimo:18.0, maximo:32.0 },
  { id:27, seccion:"COOLING WATER", tag:"PI 45807", equipo:"E 4513", parametro:"Presión", unidad:"barg", minimo:2.5, maximo:4.5 },
  { id:28, seccion:"COOLING WATER", tag:"TI 45808", equipo:"E 4513", parametro:"Temperatura", unidad:"°C", minimo:18.0, maximo:32.0 },

  { id:29, seccion:"COMPRESOR K4501", tag:"PI 45901", equipo:"K4501", parametro:"Presión de succión", unidad:"barg", minimo:1.0, maximo:3.0 },
  { id:30, seccion:"COMPRESOR K4501", tag:"PI 45902", equipo:"K4501", parametro:"Presión de descarga", unidad:"barg", minimo:10.0, maximo:18.0 }
,
  { id:31, seccion:"COMPRESOR K4501", tag:"TI 45903", equipo:"K4501", parametro:"Temperatura de descarga", unidad:"°C", minimo:60.0, maximo:110.0 },
  { id:32, seccion:"COMPRESOR K4501", tag:"VI 45904", equipo:"K4501", parametro:"Vibración radial", unidad:"mm/s", minimo:0.0, maximo:4.5 },
  { id:33, seccion:"COMPRESOR K4501", tag:"VI 45905", equipo:"K4501", parametro:"Vibración axial", unidad:"mm/s", minimo:0.0, maximo:4.5 },
  { id:34, seccion:"COMPRESOR K4501", tag:"TI 45906", equipo:"K4501", parametro:"Temperatura rodamiento NDE", unidad:"°C", minimo:35.0, maximo:85.0 },
  { id:35, seccion:"COMPRESOR K4501", tag:"TI 45907", equipo:"K4501", parametro:"Temperatura rodamiento DE", unidad:"°C", minimo:35.0, maximo:85.0 },

  // =====================================================
  // CIRCUITO DE LUBRICACIÓN
  // =====================================================

  { id:36, seccion:"CIRCUITO DE LUBRICACIÓN", tag:"PI 46001", equipo:"P4601A", parametro:"Presión de aceite", unidad:"barg", minimo:2.0, maximo:4.0 },
  { id:37, seccion:"CIRCUITO DE LUBRICACIÓN", tag:"TI 46002", equipo:"P4601A", parametro:"Temperatura de aceite", unidad:"°C", minimo:35.0, maximo:60.0 },
  { id:38, seccion:"CIRCUITO DE LUBRICACIÓN", tag:"PI 46003", equipo:"P4601B", parametro:"Presión de aceite", unidad:"barg", minimo:2.0, maximo:4.0 },
  { id:39, seccion:"CIRCUITO DE LUBRICACIÓN", tag:"TI 46004", equipo:"P4601B", parametro:"Temperatura de aceite", unidad:"°C", minimo:35.0, maximo:60.0 },
  { id:40, seccion:"CIRCUITO DE LUBRICACIÓN", tag:"LI 46005", equipo:"TK4601", parametro:"Nivel de aceite", unidad:"%", minimo:40.0, maximo:80.0 },
  { id:41, seccion:"CIRCUITO DE LUBRICACIÓN", tag:"PI 46006", equipo:"F4601", parametro:"Presión antes del filtro", unidad:"barg", minimo:2.0, maximo:4.0 },
  { id:42, seccion:"CIRCUITO DE LUBRICACIÓN", tag:"PI 46007", equipo:"F4601", parametro:"Presión después del filtro", unidad:"barg", minimo:1.8, maximo:3.8 },
  { id:43, seccion:"CIRCUITO DE LUBRICACIÓN", tag:"TI 46008", equipo:"E4601", parametro:"Temperatura salida enfriador", unidad:"°C", minimo:35.0, maximo:55.0 },
  { id:44, seccion:"CIRCUITO DE LUBRICACIÓN", tag:"PI 46009", equipo:"E4601", parametro:"Presión salida enfriador", unidad:"barg", minimo:1.8, maximo:3.8 },
  { id:45, seccion:"CIRCUITO DE LUBRICACIÓN", tag:"TI 46010", equipo:"TK4601", parametro:"Temperatura estanque de aceite", unidad:"°C", minimo:30.0, maximo:55.0 },

  // =====================================================
  // SISTEMA DE VAPOR D4511
  // =====================================================

  { id:46, seccion:"SISTEMA DE VAPOR D4511", tag:"PI 46101", equipo:"D4511", parametro:"Presión de vapor", unidad:"barg", minimo:4.5, maximo:7.5 },
  { id:47, seccion:"SISTEMA DE VAPOR D4511", tag:"TI 46102", equipo:"D4511", parametro:"Temperatura de vapor", unidad:"°C", minimo:150.0, maximo:190.0 },
  { id:48, seccion:"SISTEMA DE VAPOR D4511", tag:"PI 46103", equipo:"D4511", parametro:"Presión retorno de condensado", unidad:"barg", minimo:0.2, maximo:1.5 },
  { id:49, seccion:"SISTEMA DE VAPOR D4511", tag:"TI 46104", equipo:"D4511", parametro:"Temperatura retorno de condensado", unidad:"°C", minimo:80.0, maximo:110.0 },
  { id:50, seccion:"SISTEMA DE VAPOR D4511", tag:"PI 46105", equipo:"D4511", parametro:"Presión línea principal", unidad:"barg", minimo:4.5, maximo:7.5 },
  { id:51, seccion:"SISTEMA DE VAPOR D4511", tag:"TI 46106", equipo:"D4511", parametro:"Temperatura línea principal", unidad:"°C", minimo:150.0, maximo:190.0 },
  { id:52, seccion:"SISTEMA DE VAPOR D4511", tag:"PI 46107", equipo:"D4511", parametro:"Presión descarga trampa", unidad:"barg", minimo:0.0, maximo:1.5 },
  { id:53, seccion:"SISTEMA DE VAPOR D4511", tag:"TI 46108", equipo:"D4511", parametro:"Temperatura descarga trampa", unidad:"°C", minimo:80.0, maximo:110.0 },
  { id:54, seccion:"SISTEMA DE VAPOR D4511", tag:"PI 46109", equipo:"D4511", parametro:"Presión colector de vapor", unidad:"barg", minimo:4.5, maximo:7.5 },
  { id:55, seccion:"SISTEMA DE VAPOR D4511", tag:"TI 46110", equipo:"D4511", parametro:"Temperatura colector de vapor", unidad:"°C", minimo:150.0, maximo:190.0 },

  // =====================================================
  // CONDENSADOR DE SUPERFICIE
  // =====================================================

  { id:56, seccion:"CONDENSADOR DE SUPERFICIE", tag:"PI 46201", equipo:"E4621", parametro:"Vacío del condensador", unidad:"kPa", minimo:-95.0, maximo:-80.0 },
  { id:57, seccion:"CONDENSADOR DE SUPERFICIE", tag:"TI 46202", equipo:"E4621", parametro:"Temperatura entrada agua", unidad:"°C", minimo:18.0, maximo:28.0 },
  { id:58, seccion:"CONDENSADOR DE SUPERFICIE", tag:"TI 46203", equipo:"E4621", parametro:"Temperatura salida agua", unidad:"°C", minimo:22.0, maximo:35.0 },
  { id:59, seccion:"CONDENSADOR DE SUPERFICIE", tag:"PI 46204", equipo:"E4621", parametro:"Presión entrada agua", unidad:"barg", minimo:2.0, maximo:4.5 },
  { id:60, seccion:"CONDENSADOR DE SUPERFICIE", tag:"PI 46205", equipo:"E4621", parametro:"Presión salida agua", unidad:"barg", minimo:1.5, maximo:4.0 }
,
  { id:61, seccion:"CONDENSADOR DE SUPERFICIE", tag:"TI 46206", equipo:"E4621", parametro:"Temperatura carcasa", unidad:"°C", minimo:25.0, maximo:45.0 },
  { id:62, seccion:"CONDENSADOR DE SUPERFICIE", tag:"LI 46207", equipo:"E4621", parametro:"Nivel de condensado", unidad:"%", minimo:20.0, maximo:80.0 },
  { id:63, seccion:"CONDENSADOR DE SUPERFICIE", tag:"PI 46208", equipo:"E4621", parametro:"Presión drenaje condensado", unidad:"barg", minimo:0.0, maximo:1.0 },

  // =====================================================
  // SISTEMA DE VAPOR D4505
  // =====================================================

  { id:64, seccion:"SISTEMA DE VAPOR D4505", tag:"PI 46301", equipo:"D4505", parametro:"Presión de vapor", unidad:"barg", minimo:4.5, maximo:7.5 },
  { id:65, seccion:"SISTEMA DE VAPOR D4505", tag:"TI 46302", equipo:"D4505", parametro:"Temperatura de vapor", unidad:"°C", minimo:150.0, maximo:190.0 },
  { id:66, seccion:"SISTEMA DE VAPOR D4505", tag:"PI 46303", equipo:"D4505", parametro:"Presión retorno de condensado", unidad:"barg", minimo:0.2, maximo:1.5 },
  { id:67, seccion:"SISTEMA DE VAPOR D4505", tag:"TI 46304", equipo:"D4505", parametro:"Temperatura retorno de condensado", unidad:"°C", minimo:80.0, maximo:110.0 },
  { id:68, seccion:"SISTEMA DE VAPOR D4505", tag:"PI 46305", equipo:"D4505", parametro:"Presión línea principal", unidad:"barg", minimo:4.5, maximo:7.5 },
  { id:69, seccion:"SISTEMA DE VAPOR D4505", tag:"TI 46306", equipo:"D4505", parametro:"Temperatura línea principal", unidad:"°C", minimo:150.0, maximo:190.0 },
  { id:70, seccion:"SISTEMA DE VAPOR D4505", tag:"PI 46307", equipo:"D4505", parametro:"Presión descarga trampa", unidad:"barg", minimo:0.0, maximo:1.5 },
  { id:71, seccion:"SISTEMA DE VAPOR D4505", tag:"TI 46308", equipo:"D4505", parametro:"Temperatura descarga trampa", unidad:"°C", minimo:80.0, maximo:110.0 },
  { id:72, seccion:"SISTEMA DE VAPOR D4505", tag:"PI 46309", equipo:"D4505", parametro:"Presión colector de vapor", unidad:"barg", minimo:4.5, maximo:7.5 },
  { id:73, seccion:"SISTEMA DE VAPOR D4505", tag:"TI 46310", equipo:"D4505", parametro:"Temperatura colector de vapor", unidad:"°C", minimo:150.0, maximo:190.0 },
  { id:74, seccion:"SISTEMA DE VAPOR D4505", tag:"PI 46311", equipo:"D4505", parametro:"Presión alimentación secundaria", unidad:"barg", minimo:3.5, maximo:6.5 },
  { id:75, seccion:"SISTEMA DE VAPOR D4505", tag:"TI 46312", equipo:"D4505", parametro:"Temperatura alimentación secundaria", unidad:"°C", minimo:140.0, maximo:185.0 },
  { id:76, seccion:"SISTEMA DE VAPOR D4505", tag:"PI 46313", equipo:"D4505", parametro:"Presión distribución", unidad:"barg", minimo:3.5, maximo:6.5 },
  { id:77, seccion:"SISTEMA DE VAPOR D4505", tag:"TI 46314", equipo:"D4505", parametro:"Temperatura distribución", unidad:"°C", minimo:140.0, maximo:185.0 },
  { id:78, seccion:"SISTEMA DE VAPOR D4505", tag:"PI 46315", equipo:"D4505", parametro:"Presión purga", unidad:"barg", minimo:0.0, maximo:1.5 },
  { id:79, seccion:"SISTEMA DE VAPOR D4505", tag:"TI 46316", equipo:"D4505", parametro:"Temperatura purga", unidad:"°C", minimo:80.0, maximo:110.0 },
  { id:80, seccion:"SISTEMA DE VAPOR D4505", tag:"PI 46317", equipo:"D4505", parametro:"Presión drenaje", unidad:"barg", minimo:0.0, maximo:1.5 },
  { id:81, seccion:"SISTEMA DE VAPOR D4505", tag:"TI 46318", equipo:"D4505", parametro:"Temperatura drenaje", unidad:"°C", minimo:80.0, maximo:110.0 },
  { id:82, seccion:"SISTEMA DE VAPOR D4505", tag:"PI 46319", equipo:"D4505", parametro:"Presión retorno principal", unidad:"barg", minimo:0.2, maximo:1.5 },
  { id:83, seccion:"SISTEMA DE VAPOR D4505", tag:"TI 46320", equipo:"D4505", parametro:"Temperatura retorno principal", unidad:"°C", minimo:80.0, maximo:110.0 },

  // =====================================================
  // ACEITE DE CONTROL
  // =====================================================

  { id:84, seccion:"ACEITE DE CONTROL", tag:"PI 46401", equipo:"HPU4501", parametro:"Presión de aceite", unidad:"barg", minimo:90.0, maximo:130.0 },
  { id:85, seccion:"ACEITE DE CONTROL", tag:"TI 46402", equipo:"HPU4501", parametro:"Temperatura de aceite", unidad:"°C", minimo:35.0, maximo:55.0 },
  { id:86, seccion:"ACEITE DE CONTROL", tag:"LI 46403", equipo:"TK4641", parametro:"Nivel de aceite", unidad:"%", minimo:40.0, maximo:80.0 },
  { id:87, seccion:"ACEITE DE CONTROL", tag:"PI 46404", equipo:"F4641", parametro:"Presión antes del filtro", unidad:"barg", minimo:90.0, maximo:130.0 },
  { id:88, seccion:"ACEITE DE CONTROL", tag:"PI 46405", equipo:"F4641", parametro:"Presión después del filtro", unidad:"barg", minimo:88.0, maximo:128.0 },
  { id:89, seccion:"ACEITE DE CONTROL", tag:"TI 46406", equipo:"E4641", parametro:"Temperatura salida enfriador", unidad:"°C", minimo:35.0, maximo:55.0 },
  { id:90, seccion:"ACEITE DE CONTROL", tag:"PI 46407", equipo:"E4641", parametro:"Presión salida enfriador", unidad:"barg", minimo:88.0, maximo:128.0 }
,
  { id:91, seccion:"ACEITE DE CONTROL", tag:"TI 46408", equipo:"TK4641", parametro:"Temperatura estanque de aceite", unidad:"°C", minimo:30.0, maximo:55.0 },
  { id:92, seccion:"ACEITE DE CONTROL", tag:"PI 46409", equipo:"HPU4501", parametro:"Presión retorno", unidad:"barg", minimo:0.5, maximo:5.0 },
  { id:93, seccion:"ACEITE DE CONTROL", tag:"TI 46410", equipo:"HPU4501", parametro:"Temperatura retorno", unidad:"°C", minimo:35.0, maximo:55.0 },
  { id:94, seccion:"ACEITE DE CONTROL", tag:"PI 46411", equipo:"HPU4501", parametro:"Presión acumulador", unidad:"barg", minimo:95.0, maximo:130.0 },
  { id:95, seccion:"ACEITE DE CONTROL", tag:"TI 46412", equipo:"HPU4501", parametro:"Temperatura acumulador", unidad:"°C", minimo:35.0, maximo:55.0 },
  { id:96, seccion:"ACEITE DE CONTROL", tag:"PI 46413", equipo:"HPU4501", parametro:"Presión manifold", unidad:"barg", minimo:95.0, maximo:130.0 },
  { id:97, seccion:"ACEITE DE CONTROL", tag:"TI 46414", equipo:"HPU4501", parametro:"Temperatura manifold", unidad:"°C", minimo:35.0, maximo:55.0 },
  { id:98, seccion:"ACEITE DE CONTROL", tag:"PI 46415", equipo:"HPU4501", parametro:"Presión suministro actuadores", unidad:"barg", minimo:95.0, maximo:130.0 },
  { id:99, seccion:"ACEITE DE CONTROL", tag:"TI 46416", equipo:"HPU4501", parametro:"Temperatura suministro actuadores", unidad:"°C", minimo:35.0, maximo:55.0 },
  { id:100, seccion:"ACEITE DE CONTROL", tag:"PI 46417", equipo:"HPU4501", parametro:"Presión retorno actuadores", unidad:"barg", minimo:0.5, maximo:5.0 },
  { id:101, seccion:"ACEITE DE CONTROL", tag:"TI 46418", equipo:"HPU4501", parametro:"Temperatura retorno actuadores", unidad:"°C", minimo:35.0, maximo:55.0 },
  { id:102, seccion:"ACEITE DE CONTROL", tag:"PI 46419", equipo:"HPU4501", parametro:"Presión bomba A", unidad:"barg", minimo:95.0, maximo:130.0 },
  { id:103, seccion:"ACEITE DE CONTROL", tag:"TI 46420", equipo:"HPU4501", parametro:"Temperatura bomba A", unidad:"°C", minimo:35.0, maximo:55.0 },
  { id:104, seccion:"ACEITE DE CONTROL", tag:"PI 46421", equipo:"HPU4501", parametro:"Presión bomba B", unidad:"barg", minimo:95.0, maximo:130.0 },
  { id:105, seccion:"ACEITE DE CONTROL", tag:"TI 46422", equipo:"HPU4501", parametro:"Temperatura bomba B", unidad:"°C", minimo:35.0, maximo:55.0 },
  { id:106, seccion:"ACEITE DE CONTROL", tag:"PI 46423", equipo:"HPU4501", parametro:"Presión bomba C", unidad:"barg", minimo:95.0, maximo:130.0 },
  { id:107, seccion:"ACEITE DE CONTROL", tag:"TI 46424", equipo:"HPU4501", parametro:"Temperatura bomba C", unidad:"°C", minimo:35.0, maximo:55.0 },
  { id:108, seccion:"ACEITE DE CONTROL", tag:"PI 46425", equipo:"HPU4501", parametro:"Presión reserva", unidad:"barg", minimo:95.0, maximo:130.0 },
  { id:109, seccion:"ACEITE DE CONTROL", tag:"TI 46426", equipo:"HPU4501", parametro:"Temperatura reserva", unidad:"°C", minimo:35.0, maximo:55.0 },
  { id:110, seccion:"ACEITE DE CONTROL", tag:"PI 46427", equipo:"HPU4501", parametro:"Presión línea de control", unidad:"barg", minimo:95.0, maximo:130.0 },
  { id:111, seccion:"ACEITE DE CONTROL", tag:"TI 46428", equipo:"HPU4501", parametro:"Temperatura línea de control", unidad:"°C", minimo:35.0, maximo:55.0 }
];

// =====================================================
// ORDEN DE SECCIONES
// =====================================================

function normalizarSecciones(){
  PUNTOS.forEach(p=>{
    const eq = String(p.equipo).toUpperCase();
    if(eq.includes('K4501') || p.seccion === 'K4501'){
      p.seccion = 'COMPRESOR K4501';
    }
    if(eq.includes('D4511')){
      p.seccion = 'SISTEMA DE VAPOR D4511';
    }
    if(eq.includes('D4505')){
      p.seccion = 'SISTEMA DE VAPOR D4505';
    }
  });
}

function ordenarPuntos(){
  normalizarSecciones();
  PUNTOS.sort((a,b)=>{
    const sa = SECCIONES.indexOf(a.seccion);
    const sb = SECCIONES.indexOf(b.seccion);
    if(sa!==sb) return sa-sb;
    return String(a.tag).localeCompare(String(b.tag),'es',{numeric:true});
  });
}

// =====================================================
// RONDA
// =====================================================

function prepararRonda(){
  ordenarPuntos();
  ronda = PUNTOS.map(p=>({ ...p, lectura:'' }));
  indice = 0;
  buffer = '';
}

async function renderElemento(){
  const p = ronda[indice];
  if(!p) return;

  if($('seccion')) $('seccion').textContent = p.seccion;
  if($('tag')) $('tag').textContent = p.tag;
  if($('equipo')) $('equipo').textContent = p.equipo;
  if($('parametro')) $('parametro').textContent = p.parametro + ' · ' + p.unidad;
  if($('rango')){
    $('rango').textContent =
      (p.minimo!==undefined && p.maximo!==undefined)
        ? 'Rango ' + p.minimo + ' - ' + p.maximo + ' ' + p.unidad
        : '';
  }
  if($('ultimo')){
    const ult = await ultimoRegistro(p.id);
    $('ultimo').textContent = 'Último: ' + ult;
  }
  if($('contador')){
    $('contador').textContent = (indice+1) + ' / ' + ronda.length;
  }
  if($('valorActual')) $('valorActual').textContent = buffer;
}

function limpiarBuffer(){
  buffer = '';
  if($('valorActual')) $('valorActual').textContent = '';
}

function actualizarValor(){
  if($('valorActual')) $('valorActual').textContent = buffer;
}

function siguiente(){
  if(indice < ronda.length-1){
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

// =====================================================
// TECLADO
// =====================================================

function agregarDigito(k){
  if(k===',' && buffer.includes(',')) return;
  if(buffer.includes(',')){
    const dec = buffer.split(',')[1];
    if(dec.length>=2) return;
  }
  buffer += k;
  actualizarValor();
}

function borrarDigito(){
  if(buffer.length===0) return;
  buffer = buffer.slice(0,-1);
  actualizarValor();
}

async function guardarActual(){
  const p = ronda[indice];
  if(buffer.trim()==='') return;

  const valor = buffer.replace(',', '.');

  await guardarRegistro({
    PuntoID:p.id,
    TAG:p.tag,
    Equipo:p.equipo,
    Seccion:p.seccion,
    Parametro:p.parametro,
    Unidad:p.unidad,
    Valor:valor,
    Fecha:ahoraISO()
  });

  if(indice < ronda.length-1){
    indice++;
    limpiarBuffer();
    renderElemento();
  }else{
    finalizarSesion();
  }
}

async function iniciarRonda(){
  if($('purga')) await guardarConfig('purga',$('purga').value);
  if($('filtro')) await guardarConfig('filtro',$('filtro').value);

  prepararRonda();

  if($('inicio')) $('inicio').classList.remove('active');
  if($('ronda')) $('ronda').classList.add('active');

  renderElemento();
}

async function finalizarSesion(){
  if($('purga')) $('purga').value = '';
  if($('filtro')) $('filtro').value = '';

  indice = 0;
  buffer = '';

  if($('ronda')) $('ronda').classList.remove('active');
  if($('inicio')) $('inicio').classList.add('active');

  await cargarPurgaFiltro();

  alert('Ronda finalizada correctamente');
}

// =====================================================
// GESTOS
// =====================================================

let startX = 0;

document.addEventListener('touchstart',e=>{
  startX = e.changedTouches[0].clientX;
},{passive:true});

document.addEventListener('touchend',e=>{
  const dx = e.changedTouches[0].clientX - startX;
  if(Math.abs(dx) < 60) return;
  if(dx < 0) siguiente();
  else anterior();
},{passive:true});

// =====================================================
// EVENTOS
// =====================================================

document.querySelectorAll('#teclado [data-key]').forEach(btn=>{
  btn.addEventListener('click',()=>agregarDigito(btn.dataset.key));
});

if($('backspace')) $('backspace').addEventListener('click',borrarDigito);
if($('btnAceptar')) $('btnAceptar').addEventListener('click',guardarActual);
if($('btnIniciar')) $('btnIniciar').addEventListener('click',iniciarRonda);
if($('btnAnterior')) $('btnAnterior').addEventListener('click',anterior);
if($('btnSiguiente')) $('btnSiguiente').addEventListener('click',siguiente);
if($('btnFinalizar')) $('btnFinalizar').addEventListener('click',finalizarSesion);

document.addEventListener('keydown',e=>{
  if(e.key>='0' && e.key<='9') agregarDigito(e.key);
  if(e.key===',' || e.key==='.') agregarDigito(',');
  if(e.key==='Backspace') borrarDigito();
  if(e.key==='Enter') guardarActual();
});

// =====================================================
// EXPORTACIÓN CSV
// =====================================================

async function exportarCSV(){
  const tx = db.transaction('registros','readonly');
  const req = tx.objectStore('registros').getAll();

  req.onsuccess = ()=>{
    const datos = req.result;
    if(datos.length===0){
      alert('No existen registros');
      return;
    }

    const encabezado = ['Fecha','Seccion','Equipo','TAG','Parametro','Unidad','Valor'];
    const filas = datos.map(r=>[
      r.Fecha,r.Seccion,r.Equipo,r.TAG,r.Parametro,r.Unidad,r.Valor
    ]);

    const csv = [encabezado,...filas]
      .map(x=>x.join(';'))
      .join('\\n');

    const blob = new Blob([csv],{
      type:'text/csv;charset=utf-8;'
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download =
      'Toma_A45_' +
      new Date().toISOString().slice(0,10) +
      '.csv';

    a.click();
    URL.revokeObjectURL(url);
  };
}

console.log('Toma de datos de terreno A-45 lista');
// =====================================================