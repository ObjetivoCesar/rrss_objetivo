const fs = require('fs');
const path = require('path');

const logPath = 'c:\\Users\\Cesar\\Documents\\GRUPO EMPRESARIAL REYES\\PROYECTOS\\RRSS_objetivo\\apps\\rrss-objetivo\\scheduler_debug.log';
try {
  const content = fs.readFileSync(logPath, 'utf16le');
  console.log(content.split('\n').slice(-100).join('\n'));
} catch (e) {
  try {
    const content = fs.readFileSync(logPath, 'utf8');
    console.log(content.split('\n').slice(-100).join('\n'));
  } catch (e2) {
    console.error('Failed to read log:', e2);
  }
}
