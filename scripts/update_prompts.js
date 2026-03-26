const fs = require('fs');
const path = require('path');

const dir = 'C:\\Users\\Cesar\\.gemini\\antigravity\\brain\\dcd02b8d-cc21-4998-a81d-9f400a49676d';

// List of files to update
const files = [
  'PROMPT_CARRUSEL_FINAL_CON_LOGO.md',
  'PROMPT_CARRUSEL_PILAR_2_REINGENIERIA.md',
  'PROMPT_CARRUSEL_PILAR_3_VENTAS.md',
  'PROMPT_CARRUSEL_PILAR_4_SEO.md',
  'PROMPT_CARRUSEL_PILAR_5_WHATSAPP.md',
  'PROMPT_CARRUSEL_PILAR_6_LIDERAZGO.md'
];

const rule6 = `5. **Layout Consistente**: Todo slide debe tener espacio limpio (negative space) para superponer textos fácilmente. No satures los bordes.
6. **FORMATO Y RATIO (CRÍTICO)**: Las imágenes DEBEN generarse OBLIGATORIAMENTE en formato Retrato/Vertical (Aspect Ratio 4:5 o 9:16) o Cuadrado (1:1). ESTÁ ESTRICTAMENTE PROHIBIDO generar imágenes horizontales (Landscape 16:9). ¡Las publicaremos en Instagram/LinkedIn!`;

const strictTextRule = `### ✍️ REGLAS DE TEXTO (CERO ALUCINACIONES Y CERO OMISIONES):
1. **NO ME ENTREGUES IMÁGENES VACÍAS MUDAS**: Está ESTRICTAMENTE PROHIBIDO entregar las imágenes "vacías de texto" o usar la excusa de "dejar espacio negativo para añadir el texto luego". TU DEBER ES RENDERIZAR EL TEXTO DIRECTAMENTE SOBRE LAS IMÁGENES.
2. DEBES renderizar el "Texto a incluir (Grande)" y el "Texto Secundario" indicados en CADA LÁMINA, encajándolos estéticamente.
3. No inventes texto adicional ni modifiques las frases. Renderiza los píxeles exactos de las palabras proporcionadas.`;

files.forEach(filename => {
  const filePath = path.join(dir, filename);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace Rule 5 to include Rule 6
    content = content.replace(
        /5\. \*\*Layout Consistente\*\*: Todo slide debe tener espacio limpio \(negative space\) para superponer textos fácilmente\. No satures los bordes\./g,
        rule6
    );

    // Replace the TEXT rules segment
    const regex = /### ✍️ REGLAS DE TEXTO \(CERO ALUCINACIONES\):[\s\S]*?(?=### 📂 ESTRUCTURA Y CONTENIDO EXACTO A GENERAR)/g;
    content = content.replace(regex, strictTextRule + '\n\n');

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filename}`);
  } else {
    console.log(`Not found: ${filename}`);
  }
});
