// Script para converter o ícone SVG para PNG
// Para usar este script:
// 1. Instale as dependências: npm install sharp
// 2. Execute: node scripts/convert-icon.js

import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

// Obter o diretório atual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function convertSvgToPng() {
  try {
    // Certifique-se de que o diretório existe
    const iconsDir = path.join(__dirname, '..', 'public', 'icons');
    if (!fs.existsSync(iconsDir)) {
      fs.mkdirSync(iconsDir, { recursive: true });
    }

    // Caminho do arquivo SVG
    const svgPath = path.join(__dirname, '..', 'public', 'icone-fertilisolo.svg');
    
    // Caminho para o arquivo PNG
    const pngPath = path.join(iconsDir, 'icon-512x512.png');
    
    // Ler o SVG
    const svgBuffer = fs.readFileSync(svgPath);
    
    // Converter para PNG
    await sharp(svgBuffer)
      .resize(512, 512)
      .toFile(pngPath);
      
    console.log(`Ícone convertido com sucesso e salvo em ${pngPath}`);
  } catch (error) {
    console.error('Erro ao converter o ícone:', error);
  }
}

convertSvgToPng(); 