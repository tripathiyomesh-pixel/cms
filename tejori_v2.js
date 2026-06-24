process.env.DB_HOST = '127.0.0.1';
const { Pool } = require('pg');
const fs = require('fs');
const pool = new Pool({ host:'127.0.0.1', port:5432, database:'jewellery_cms', user:'cmsuser', password:'CmsPass@2026' });
const slg = s => s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');

function parseCSV(fp) {
  const content = fs.readFileSync(fp,'utf8');
  const lines = content.split('\n');
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g,''));
  const rows = [];
  let i = 1;
  while (i < lines.length) {
    let line = lines[i];
    while (i + 1 < lines.length) {
      if (((line.match(/"/g)||[]).length % 2) === 0) break;
      i++; line += '\n' + lines[i];
    }
    if (line.trim()) {
      const vals = []; let cur = '', inQ = false;
      for (let c = 0; c < line.length; c++) {
        const ch = line[c];
        if (ch === '"') { if (inQ && line[c+1] === '"') { cur += '"'; c++; } else inQ = !inQ; }
        else if (ch === ',' && !inQ) { vals.push(cur); cur = ''; }
        else cur += ch;
      }
      vals.push(cur);
      if (vals.length >= 2) {
        const row = {};
        headers.forEach((h,idx) => { row[h] = (vals[idx]||'').trim(); });
        rows.push(row);
      }
    }
    i++;
  }
  return rows;
}

async function main() {
  const c = await pool.connect();
  try {

    // STEP 1
    console.log('\n-- STEP 1: Collections --');
    const COLS = [
      ['Adamas','Lab-grown diamond jewellery.'],
      ['Classics','Timeless everyday gold jewellery.'],
      ['Farashat','Delicate floral-inspired pieces.'],
      ['Frost','Icy white diamond contemporary pieces.'],
      ['High Jewellery','One-of-a-kind masterpieces with exceptional stones.'],
      ['Ice Deco','Art Deco geometric white gold designs.'],
      ['Luluaat','Pearl-accented romantic jewellery.'],
      ['Mallika','Floral yellow gold motifs.'],
      ['Vivid Deco','Bold geometric coloured gemstone designs.'],
      ['Vivid Pendant Sets','Coordinated pendant and earring sets.'],
    ];
    const colMap = {};
    for (const [name, desc] of COLS) {
      const s = slg(name);
      const ex = await c.query('SELECT id FROM collections WHERE slug=$1', [s]);
      if (ex.rows.length) { colMap[name] = ex.rows[0].id; console.log('  SKIP: ' + name); }
      else {
        const r = await c.query('INSERT INTO collections(name,slug,description,is_active,is_featured,sort_order) VALUES($1,$2,$3,true,false,0) RETURNING id', [name,s,desc]);
        colMap[name] = r.rows[0].id; console.log('  CREATED: ' + name);
      }
    }

    // STEP 2
    console.log('\n-- STEP 2: Categories --');
    const CATS = ['Rings','Necklaces','Bracelets','Sets','Earrings','Pendants'];
    const catMap = {};
    for (const cat of CATS) {
      const s = slg(cat);
      const ex = await c.query('SELECT id FROM categories WHERE slug=$1', [s]);
      if (ex.rows.length) { catMap[cat] = ex.rows[0].id; console.log('  SKIP: ' + cat); }
      else {
        const r = await c.query('INSERT INTO categories(name,slug,is_active,sort_order) VALUES($1,$2,true,0) RETURNING id', [cat,s]);
        catMap[cat] = r.rows[0].id; console.log('  CREATED: ' + cat);
      }
    }

    // STEP 3
    console.log('\n-- STEP 3: Import products --');
    const rows = parseCSV('C:/Users/yomes/Downloads/tejori_products_import.csv');
    console.log('  Parsed: ' + rows.length + ' rows');
    let imported = 0, skipped = 0, errors = 0;

    for (const row of rows) {
      let pSlug = row.slug || slg(row.name);
      const pSku = row.sku || row.sku_raw || ('TJ-' + Math.random().toString(36).slice(2,8).toUpperCase());
      // Ensure unique slug by appending counter if needed
      let slugCheck = await c.query('SELECT id FROM products WHERE slug=$1', [pSlug]);
      let slugCounter = 1;
      while (slugCheck.rows.length) {
        pSlug = (row.slug || slg(row.name)) + '-' + (++slugCounter);
        slugCheck = await c.query('SELECT id FROM products WHERE slug=$1', [pSlug]);
      }
      const skuDup = await c.query('SELECT id FROM products WHERE sku=$1', [pSku]);
      if (skuDup.rows.length) { skipped++; continue; }

      const catId = catMap[row.category] || null;
      const colId = colMap[row.collection] || null;
      const price = parseFloat(row.price) || 0;
      const qty = parseInt(row.quantity) || 1;
      const isFeat = (row.featured||'').toLowerCase() === 'true';
      const isLab = (row.diamond_type||'').toLowerCase().includes('lab');
      const invType = isLab ? 'LAB_GROWN_DIAMOND' : 'JEWELLERY';
      const metal = (row.metal_type||'').trim().substring(0,30) || null;
      const weight = parseFloat(row.weight) || null;
      let tags = '[]';
      if (row.tags) { try { JSON.parse(row.tags); tags = row.tags; } catch(e) { tags = JSON.stringify(row.tags.split(',').map(t=>t.trim()).filter(Boolean)); } }

      try {
        const res = await c.query(
          'INSERT INTO products(name,slug,sku,description,base_price,final_price,metal_type,gross_weight,category_id,collection_id,is_featured,is_lab_grown,inventory_type,stock_quantity,status,tags,currency,created_at,updated_at) VALUES($1,$2,$3,$4,$5,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,NOW(),NOW()) RETURNING id',
          [row.name, pSlug, pSku, row.description||null, price, metal, weight, catId, colId, isFeat, isLab, invType, qty, 'active', tags, 'AED']
        );
        const pid = res.rows[0].id;
        if (colId) await c.query('INSERT INTO product_collections(product_id,collection_id) VALUES($1,$2) ON CONFLICT DO NOTHING', [pid,colId]);
        if (row.primary_image) await c.query('INSERT INTO product_images(product_id,url,is_primary,sort_order) VALUES($1,$2,true,0)', [pid,row.primary_image]);
        imported++;
      } catch(e) {
        errors++;
        if (errors <= 2) console.log('  ERR: ' + row.name + ': ' + e.message.split('\n')[0]);
      }
    }
    console.log('  Imported: ' + imported + ' | Skipped: ' + skipped + ' | Errors: ' + errors);

    // STEP 4
    console.log('\n-- STEP 4: Settings --');
    const SETT = [
      ['store_whatsapp','971508509747','WhatsApp Number'],
      ['whatsapp_number','971508509747','WhatsApp Legacy'],
      ['store_name','Tejori Gems','Store Name'],
      ['store_tagline','Since 1964','Tagline'],
      ['store_address','Dubai, United Arab Emirates','Address'],
    ];
    for (const [key, val, label] of SETT) {
      await c.query(
        'INSERT INTO settings(key,value,label,group_name,type,is_public) VALUES($1,$2::jsonb,$3,$4,$5,true) ON CONFLICT(key) DO UPDATE SET value=EXCLUDED.value,updated_at=NOW()',
        [key, JSON.stringify(val), label, 'general', 'text']
      );
      console.log('  SET ' + key + ' = ' + val);
    }

    // STEP 5
    console.log('\n-- STEP 5: Featured --');
    for (const n of ['High Jewellery','Frost']) {
      const cid = colMap[n]; if (!cid) continue;
      const r = await c.query('UPDATE products SET is_featured=true WHERE collection_id=$1 AND deleted_at IS NULL RETURNING id', [cid]);
      console.log('  ' + n + ': ' + r.rowCount + ' featured');
    }
    const malId = colMap['Mallika'];
    if (malId) {
      const r = await c.query(
        'UPDATE products SET is_featured=true WHERE id IN(SELECT id FROM products WHERE collection_id=$1 AND deleted_at IS NULL AND base_price>0 ORDER BY base_price DESC LIMIT 3) RETURNING name,base_price',
        [malId]
      );
      console.log('  Mallika top-3: ' + r.rowCount + ' featured');
      r.rows.forEach(p => console.log('    -> ' + p.name + ' AED ' + Number(p.base_price).toLocaleString()));
    }

    // REPORT
    console.log('\n== IMPORT REPORT ==');
    const rpt = await c.query(
      'SELECT col.name, COUNT(p.id)::int AS products, SUM(CASE WHEN p.is_featured THEN 1 ELSE 0 END)::int AS featured FROM collections col LEFT JOIN products p ON p.collection_id=col.id AND p.deleted_at IS NULL GROUP BY col.name ORDER BY col.name'
    );
    let tot=0, ftot=0;
    console.log('\n  Collection              Products   Featured');
    console.log('  ' + '-'.repeat(42));
    rpt.rows.forEach(r => {
      tot += r.products; ftot += r.featured;
      console.log('  ' + r.name.padEnd(24) + String(r.products).padEnd(11) + r.featured);
    });
    console.log('  ' + '-'.repeat(42));
    console.log('  ' + 'TOTAL'.padEnd(24) + String(tot).padEnd(11) + ftot);

    const sv = await c.query('SELECT key,value FROM settings WHERE key IN($1,$2,$3,$4) ORDER BY key', ['store_name','store_whatsapp','store_tagline','store_address']);
    console.log('\n  Settings:');
    sv.rows.forEach(r => console.log('    ' + r.key + ' = ' + r.value));
    console.log('\nDone.\n');

  } finally { c.release(); await pool.end(); }
}
main().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
