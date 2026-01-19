const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const mongoose = require('mongoose');

// 👇 CONFIGURACIÓN BLINDADA (127.0.0.1)
const MONGO_URI = 'mongodb://127.0.0.1:27017/grafica_santiago';

console.log("------------------------------------------------");
console.log("🔌 SEED CONECTANDO A:", MONGO_URI);
console.log("------------------------------------------------");

const Product = require('./models/product_model');

// Archivos CSV
const fileBase = path.join(__dirname, 'PRODUCTOS Y PRECIOS(REPORTE DE PRODUCTOS).csv');
const filePrices = path.join(__dirname, 'PRODUCTOS Y PRECIOS(VENTANA CON PRECIOS).csv');

// --- UTILIDADES ---
function normCod(value) {
  const s = String(value ?? '').trim().replace(/\uFEFF/g, '');
  return /^\d+$/.test(s) ? s.padStart(6, '0') : s;
}

function parseDecimalComma(value) {
  if (value == null) return 0;
  const s = String(value).trim();
  if (!s) return 0;
  const n = Number(s.replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
}

function parseIntSafe(value) {
  const n = Number(String(value ?? '').trim());
  return Number.isFinite(n) ? n : 0;
}

// 👇 FUNCIÓN INTELIGENTE PARA ELEGIR CATEGORÍA
function pickCategory(r) {
    // 1. Busca en G3, si no hay, busca en G2, si no, en G1
    let rawCat = (r.G3 || r.G2 || r.G1 || 'General').trim();
    
    // 2. Si está vacío, pon 'General'
    if (!rawCat) rawCat = 'General';

    // 3. Formato bonito: "PAPELES" -> "Papeles"
    return rawCat.charAt(0).toUpperCase() + rawCat.slice(1).toLowerCase();
}

function readCsv(filePath, separator = ';') {
  return new Promise((resolve, reject) => {
    const rows = [];
    if (!fs.existsSync(filePath)) {
      return reject(new Error(`No existe el archivo: ${filePath}`));
    }
    fs.createReadStream(filePath)
      .pipe(csv({ separator })) // 👈 OJO: Asegúrate que tu CSV usa punto y coma (;), si usa comas pon ','
      .on('data', (row) => rows.push(row))
      .on('end', () => resolve(rows))
      .on('error', reject);
  });
}

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Conexión establecida.');

  // 1) Cargar precios
  const priceRows = await readCsv(filePrices, ';');
  const pricesByCod = new Map();

  for (const r of priceRows) {
    const cod = normCod(r.COD);
    pricesByCod.set(cod, {
      stock: parseIntSafe(r.STK),
      pvp: parseDecimalComma(r.PVP),
      mayor: parseDecimalComma(r['PRECIO POR MAYOR'])
    });
  }

  // 2) Cargar productos
  const baseRows = await readCsv(fileBase, ';');
  const ops = [];

  for (const r of baseRows) {
    const cod = normCod(r.COD);
    const p = pricesByCod.get(cod) || { stock: 0, pvp: 0, mayor: 0 };

    // Usamos la función inteligente aquí 👇
    const realCategory = pickCategory(r);

    const doc = {
      cod,
      nombre: (r.NOM || '').trim() || `Producto ${cod}`,
      descripcion: (r.DES || '').trim() || 'Sin descripción.',
      precio: {
        minorista: p.pvp,
        mayorista: p.mayor
      },
      stock: p.stock,
      
      categoria: realCategory, // ✅ AQUI VA LA CATEGORÍA REAL DEL EXCEL
      
      activo: true, // ✅ ESTO ES CRUCIAL (lo que agregamos antes)
      imagenes: [
        {
            public_id: `prod_${cod}`,
            url: "https://via.placeholder.com/300?text=Grafica+Santiago"
        }
      ]
    };

    ops.push({
      updateOne: {
        filter: { cod },
        update: { $set: doc },
        upsert: true
      }
    });
  }

  if (ops.length) {
    const result = await Product.bulkWrite(ops);
    console.log(`✅ Seed terminado. ${ops.length} productos procesados.`);
    console.log('   Modificados/Insertados:', result.modifiedCount + result.upsertedCount);
  } else {
    console.log('⚠️ No se encontraron filas en CSV.');
  }

  await mongoose.disconnect();
  console.log('✅ Desconectado.');
}

run().catch((e) => {
  console.error('❌ Error seed:', e);
  process.exit(1);
});