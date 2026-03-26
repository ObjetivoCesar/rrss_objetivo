
const mysql = require('mysql2/promise');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Credentials from .env.local (manually extracted for this one-off script)
const mysqlConfig = {
  host: "mysql.us.stackcp.com",
  port: 42903,
  user: "paginaweb-cesarreyes-353039368e3b",
  password: "ZSAfOvstk2ID",
  database: "paginaweb-cesarreyes-353039368e3b",
};

const supabaseUrl = "https://fcfsexddgupnvbvntgyz.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjZnNleGRkZ3VwbnZidm50Z3l6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTE1NzkwOSwiZXhwIjoyMDc2NzMzOTA5fQ.4ipX_DaVdz1qAKoLi1z5pb7p9UT5W7pDzgZOIs5NGuc";

async function audit() {
  console.log("Starting Content Audit Data Extraction...");
  
  let mysqlArticles = [];
  let strategyNodes = [];

  // 1. MySQL Articles
  try {
    const connection = await mysql.createConnection(mysqlConfig);
    const [rows] = await connection.execute('SELECT id, title, slug FROM articles');
    mysqlArticles = rows;
    await connection.end();
    console.log(`Found ${mysqlArticles.length} articles in MySQL.`);
  } catch (err) {
    console.error("MySQL Error:", err.message);
  }

  // 2. Supabase Strategy
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data: sessions, error } = await supabase
      .from('strategy_sessions')
      .select('id, name, nodes');
    
    if (error) throw error;

    sessions.forEach(session => {
      const nodes = Array.isArray(session.nodes) ? session.nodes : [];
      nodes.forEach(node => {
        if (node.type === 'articleNode') {
          strategyNodes.push({
            id: node.id,
            label: node.data?.label,
            sessionId: session.id,
            sessionName: session.name
          });
        }
      });
    });
    console.log(`Found ${strategyNodes.length} article nodes in Strategy Map.`);
  } catch (err) {
    console.error("Supabase Error:", err.message);
  }

  // 3. Save to JSON
  const result = {
    mysqlArticles,
    strategyNodes,
    timestamp: new Date().toISOString()
  };

  fs.writeFileSync('/tmp/content_audit_data.json', JSON.stringify(result, null, 2));
  console.log("Data saved to /tmp/content_audit_data.json");
}

audit();
