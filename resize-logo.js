const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [
  { name: 'mipmap-mdpi', size: 48 },
  { name: 'mipmap-hdpi', size: 72 },
  { name: 'mipmap-xhdpi', size: 96 },
  { name: 'mipmap-xxhdpi', size: 144 },
  { name: 'mipmap-xxxhdpi', size: 192 },
];

const logoPath = path.resolve(__dirname, 'vaishnava-logo.png');
if (!fs.existsSync(logoPath)) {
  console.error('ERROR: vaishnava-logo.png not found in project root.');
  process.exit(1);
}

sizes.forEach(({ name, size }) => {
  const dir = path.resolve(__dirname, `android/app/src/main/res/${name}`);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  sharp(logoPath)
    .resize(size, size)
    .toFile(path.join(dir, 'ic_launcher.png'))
    .then(() => console.log(`Created ${name} icon (${size}x${size})`))
    .catch(err => console.error(`Failed for ${name}:`, err));
});
