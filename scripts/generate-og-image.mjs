import { readFileSync, writeFileSync } from 'fs';
import { Resvg } from '@resvg/resvg-js';

const svg = readFileSync('public/og-image.svg', 'utf-8');
const resvg = new Resvg(svg, {
  fitTo: { mode: 'width', value: 1200 },
});
const png = resvg.render().asPng();
writeFileSync('public/og-image.png', png);
console.log('✅ og-image.png generated (1200x630)');
