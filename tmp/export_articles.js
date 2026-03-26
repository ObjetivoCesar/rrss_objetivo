const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: 'c:/Users/Cesar/Documents/GRUPO EMPRESARIAL REYES/PROYECTOS/RRSS_objetivo/apps/rrss-objetivo/.env.local' });

async function exportToCsv() {
  let pool;
  try {
    pool = mysql.createPool({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      connectTimeout: 10000
    });

    const [rows] = await pool.query('SELECT id, title, slug, hub_url, parent_silo, category_id, published_at FROM articles');
    
    // Create CSV content
    const header = 'ID,Título,Slug,Hub URL,Silo,Categoría,Fecha Publicación\n';
    const csvContent = rows.map(row => {
      // Escape commas and quotes for CSV
      const escape = (val) => {
        if (val === null || val === undefined) return '';
        let s = String(val).replace(/"/g, '""');
        if (s.includes(',') || s.includes('\n') || s.includes('"')) {
          return `"${s}"`;
        }
        return s;
      };
      
      return [
        row.id,
        escape(row.title),
        escape(row.slug),
        escape(row.hub_url),
        escape(row.parent_silo),
        row.category_id,
        row.published_at
      ].join(',');
    }).join('\n');

    const filePath = 'c:/Users/Cesar/Documents/GRUPO EMPRESARIAL REYES/PROYECTOS/RRSS_objetivo/blog_audit_export.csv';
    fs.writeFileSync(filePath, '\ufeff' + header + csvContent); // Added BOM for Excel UTF-8
    console.log(`EXPORT_SUCCESS:${rows.length}`);
  } catch (error) {
    console.error('EXPORT_ERROR:', error);
  } finally {
    if (pool) await pool.end();
  }
}

exportToCsv();
