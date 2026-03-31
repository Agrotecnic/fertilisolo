import fs from 'fs';
import sharp from 'sharp';

// Caminho para o SVG
const svgPath = 'public/icone-fertilisolo.svg';
const svgContent = fs.readFileSync(svgPath, 'utf8');

// Tamanhos necessários para ícones de PWA
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Gerar os ícones PNG para todos os tamanhos
sizes.forEach(size => {
  sharp(Buffer.from(svgContent))
    .resize(size, size)
    .toFile(`public/pwa-${size}x${size}.png`, (err) => {
      if (err) {
        console.error(`Erro ao gerar ícone ${size}x${size}:`, err);
        return;
      }
      console.log(`Ícone ${size}x${size} gerado com sucesso!`);
    });
}); 