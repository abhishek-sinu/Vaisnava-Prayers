const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [
  { name: 'drawable-port-mdpi', size: 48 },
  { name: 'drawable-port-hdpi', size: 72 },
  { name: 'drawable-port-xhdpi', size: 96 },
  { name: 'drawable-port-xxhdpi', size: 144 },
  { name: 'drawable-port-xxxhdpi', size: 192 },
];

// Use the image from src/assets/vaishnava-logo.png
const logoPath = path.resolve(__dirname, 'src/assets/vaishnava-logo.png');
if (!fs.existsSync(logoPath)) {
  console.error('ERROR: src/assets/vaishnava-logo.png not found.');
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
