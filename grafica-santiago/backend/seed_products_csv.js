const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const mongoose = require('mongoose');

// 👇 CONFIGURACIÓN
const MONGO_URI = 'mongodb://127.0.0.1:27017/grafica_santiago';

console.log("------------------------------------------------");
console.log("🚀 SEED V10 - MODO: ABREVIATURAS + ANTI-CACHÉ");
console.log("------------------------------------------------");

const Product = require('./models/product_model');

const fileBase = path.join(__dirname, 'PRODUCTOS Y PRECIOS(REPORTE DE PRODUCTOS).csv');
const filePrices = path.join(__dirname, 'PRODUCTOS Y PRECIOS(VENTANA CON PRECIOS).csv');

// 👇 DICCIONARIO OPTIMIZADO PARA TU CSV (Incluye abreviaturas)
const IMAGE_MAP = {
    // --- ESCRITURA (Abreviaturas Clave) ---
    'BOLIG': ['https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=500&q=80'], // Captura BOLIGRAFO y BOLIG
    'MARC': ['https://images.unsplash.com/photo-1568205612837-017257d2310a?w=500&q=80'],  // Captura MARCADOR y MARC
    'RESALT': ['https://images.unsplash.com/photo-1595133276686-2a7813a37313?w=500&q=80'], // RESALTADOR
    'LAPIZ': ['https://images.unsplash.com/photo-1519682577862-22b62b24e493?w=500&q=80'],
    'PORTAMIN': ['https://images.unsplash.com/photo-1598533036683-9b4227977461?w=500&q=80'],
    'BORR': ['https://images.unsplash.com/photo-1572721546566-3b749d80c1a3?w=500&q=80'],   // BORRADOR
    'SACAPUNTA': ['https://images.unsplash.com/photo-1596463989140-3b600bd7d95e?w=500&q=80'],

    // --- PAPELERÍA ---
    'CUAD': ['https://images.unsplash.com/photo-1544816155-12df9643f363?w=500&q=80'], // CUADERNO
    'LIBRETA': ['https://images.unsplash.com/photo-1517842645767-c639042777db?w=500&q=80'],
    'AGENDA': ['https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=500&q=80'],
    'CARPETA': ['https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=500&q=80'],
    'SOBRE': ['https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=500&q=80'],
    'PAPEL': ['https://images.unsplash.com/photo-1603484477846-c65423d10910?w=500&q=80'],
    'RESMA': ['https://images.unsplash.com/photo-1603484477846-c65423d10910?w=500&q=80'],
    'CARTULINA': ['https://images.unsplash.com/photo-1603484477846-c65423d10910?w=500&q=80'],
    'FOMIX': ['https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=500&q=80'],

    // --- FIESTAS (G3 y Nombres) ---
    'GLOBO': ['https://images.unsplash.com/photo-1530103862676-de3c9da59af7?w=500&q=80'],
    'BOUQUET': ['https://images.unsplash.com/photo-1530103862676-de3c9da59af7?w=500&q=80'], // Arreglos de globos
    'LETRERO': ['https://images.unsplash.com/photo-1513151233558-d860c5398176?w=500&q=80'],
    'CORTINA': ['https://images.unsplash.com/photo-1514525253440-b393452e23f9?w=500&q=80'],
    'GUIRNALDA': ['https://images.unsplash.com/photo-1513151233558-d860c5398176?w=500&q=80'],
    'VELA': ['https://images.unsplash.com/photo-1602523961358-f9f03dd557db?w=500&q=80'],
    'REGALO': ['https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500&q=80'],
    'FUNDA': ['https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=500&q=80'], // Fundas regalo
    'LAZO': ['https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=500&q=80'],

    // --- ACCESORIOS Y VARIOS ---
    'MOCHILA': ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&q=80'],
    'CARTUCHERA': ['https://images.unsplash.com/photo-1628153037233-a61f5b08c909?w=500&q=80'],
    'LLAVERO': ['https://images.unsplash.com/photo-1612196808214-b7e239e5f6b7?w=500&q=80'],
    'RELOJ': ['https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=500&q=80'],
    'GORRA': ['https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=500&q=80'],
    'BILLETERA': ['https://images.unsplash.com/photo-1627123424574-181ce5171c98?w=500&q=80'],
    'BOLSO': ['https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=500&q=80'],

    // --- ARTE Y PINTURA ---
    'PINTURA': ['https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=500&q=80'],
    'TEMPERA': ['https://images.unsplash.com/photo-1596548438137-d51ea5c9793e?w=500&q=80'],
    'ACUARELA': ['https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=500&q=80'],
    'PINCEL': ['https://images.unsplash.com/photo-1515462277126-2dd0c162007a?w=500&q=80'],
    
    // --- DEFAULT ---
    'General': ['https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=500&q=80'] 
};

function getImage(name, g3, g2, cod) {
    const clean = (s) => (s || '').trim().toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    
    const n = clean(name);
    const k3 = clean(g3);
    const k2 = clean(g2);
    
    // Generamos un número único por producto
    const seed = cod.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);

    // 1. ANÁLISIS DE NOMBRE (Prioridad Máxima)
    const words = n.split(/\s+/);
    for (const word of words) {
        if (word.length < 3) continue;
        for (const key in IMAGE_MAP) {
            // Buscamos si la palabra del nombre contiene la clave (ej: "BOLIG" en "BOLIGRAFO")
            if (word.includes(key) || key.includes(word)) {
                const list = IMAGE_MAP[key];
                return list[seed % list.length];
            }
        }
    }

    // 2. ANÁLISIS DE CATEGORÍA G3
    for (const key in IMAGE_MAP) {
        if (k3.includes(key)) return IMAGE_MAP[key][seed % IMAGE_MAP[key].length];
    }

    // 3. ANÁLISIS DE CATEGORÍA G2
    for (const key in IMAGE_MAP) {
        if (k2.includes(key)) return IMAGE_MAP[key][seed % IMAGE_MAP[key].length];
    }

    // 4. DEFAULT
    const generalList = IMAGE_MAP['General'];
    return generalList[seed % generalList.length];
}

// ... (Funciones de utilidad iguales) ...
function normCod(value) { return String(value ?? '').trim().replace(/\uFEFF/g, '').padStart(6, '0'); }
function parseDecimalComma(value) { return parseFloat(String(value || '0').replace(',', '.')) || 0; }
function parseIntSafe(value) { return parseInt(String(value || '0').trim()) || 0; }

function getCategoryData(r) {
    const g1 = (r.G1 || '').trim();
    const g2 = (r.G2 || '').trim();
    const g3 = (r.G3 || '').trim();
    let cat = 'General';
    if (g2 && g2.length > 1) cat = g2;
    else if (g1 && g1.length > 1) cat = g1;
    let sub = '';
    if (g3 && g3.length > 1) sub = g3;
    const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
    return { categoria: capitalize(cat), subcategoria: sub ? capitalize(sub) : '', rawG3: sub, rawG2: cat };
}

function readCsv(filePath, separator = ';') {
  return new Promise((resolve, reject) => {
    const rows = [];
    if (!fs.existsSync(filePath)) return reject(new Error(`No existe: ${filePath}`));
    fs.createReadStream(filePath)
      .pipe(csv({ separator, mapHeaders: ({ header }) => header.trim().replace(/^\uFEFF/, '') })) 
      .on('data', (row) => rows.push(row))
      .on('end', () => resolve(rows))
      .on('error', reject);
  });
}

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Conexión OK.');
  await Product.deleteMany({});
  console.log('🗑️  BD Limpia.');

  console.log('📖 Leyendo precios...');
  const priceRows = await readCsv(filePrices, ';');
  const pricesByCod = new Map();
  for (const r of priceRows) {
    const cod = normCod(r.COD);
    pricesByCod.set(cod, { stock: parseIntSafe(r.STK), pvp: parseDecimalComma(r.PVP), mayor: parseDecimalComma(r['PRECIO POR MAYOR']) });
  }

  console.log('📖 Procesando productos...');
  const baseRows = await readCsv(fileBase, ';');
  const ops = [];

  for (const r of baseRows) {
    const cod = normCod(r.COD);
    const p = pricesByCod.get(cod);
    if (!r.NOM) continue;

    const { categoria, subcategoria, rawG3, rawG2 } = getCategoryData(r);
    
    // Obtener URL base
    let imgUrl = getImage(r.NOM, rawG3, rawG2, cod);
    
    // 🔥 TRUCO ANTI-CACHÉ: Añadimos un parámetro random al final
    imgUrl = `${imgUrl}&cachebust=${Date.now()}`;

    const doc = {
      cod, nombre: r.NOM.trim(), descripcion: (r.DES || '').trim() || r.NOM.trim(),
      precio: { minorista: p ? p.pvp : 0, mayorista: p ? p.mayor : 0 },
      stock: p ? p.stock : 0,
      categoria, subcategoria, activo: true,
      imagenes: [{ url: imgUrl }]
    };

    ops.push({ updateOne: { filter: { cod }, update: { $set: doc }, upsert: true } });
  }

  if (ops.length) {
    console.log(`🚀 Guardando ${ops.length} productos...`);
    await Product.bulkWrite(ops);
    console.log(`✨ ¡LISTO! Refresca tu navegador con Ctrl + Shift + R`);
  }

  await mongoose.disconnect();
}

run().catch(console.error);