const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

// 👇 Las categorías de la web que queremos escanear
const URLS = [
    'https://santiagopapeleria.com/categoria-producto/escolar/',
    'https://santiagopapeleria.com/categoria-producto/oficina/',
    'https://santiagopapeleria.com/categoria-producto/arte/',
    'https://santiagopapeleria.com/categoria-producto/tecnologia/',
    'https://santiagopapeleria.com/categoria-producto/papeleria/',
    'https://santiagopapeleria.com/categoria-producto/bazar/'
];

const PRODUCTS_DB = [];

async function scrapeCategory(baseUrl) {
    let page = 1;
    let hasMore = true;

    while (hasMore) {
        try {
            // Construir URL (ej: .../page/2/)
            const url = page === 1 ? baseUrl : `${baseUrl}page/${page}/`;
            console.log(`📡 Escaneando: ${url}...`);

            const { data } = await axios.get(url, {
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
            });
            
            const $ = cheerio.load(data);
            const productsOnPage = $('.product'); // Selector de producto de WooCommerce

            if (productsOnPage.length === 0) {
                hasMore = false;
                break;
            }

            productsOnPage.each((i, el) => {
                // Extraer Nombre
                const name = $(el).find('.woocommerce-loop-product__title').text().trim();
                
                // Extraer Imagen (Buscamos la imagen principal)
                let img = $(el).find('img').attr('data-lazy-src') || $(el).find('img').attr('src');
                
                // Limpieza de URL (a veces vienen con tamaños pequeños tipo 300x300, queremos la grande)
                if (img) {
                    // Quitamos el "-300x300" del final para tener la full HD
                    // img = img.replace(/-\d+x\d+(?=\.(jpg|png|jpeg))/i, '');
                    
                    if (name && img) {
                        PRODUCTS_DB.push({ 
                            name: name.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""), // Normalizar para buscar fácil luego
                            img: img 
                        });
                    }
                }
            });

            page++;
            // Pausa pequeña para no saturar su servidor
            await new Promise(r => setTimeout(r, 500));

        } catch (error) {
            // Si da error 404 es que se acabaron las páginas
            hasMore = false;
        }
    }
}

async function run() {
    console.log("🚀 INICIANDO EL ROBOT RECOLECTOR...");
    
    for (const url of URLS) {
        await scrapeCategory(url);
    }

    // Guardar resultados
    fs.writeFileSync('fotos_reales.json', JSON.stringify(PRODUCTS_DB, null, 2));
    console.log(`\n✅ ¡LISTO! Se han recolectado ${PRODUCTS_DB.length} fotos reales.`);
    console.log("📁 Guardado en: backend/fotos_reales.json");
}

run();