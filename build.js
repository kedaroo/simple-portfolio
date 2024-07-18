const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { minify } = require('html-minifier');

const inputFilePath = path.join(__dirname, 'src', 'index.html');
const outputFilePath = path.join(__dirname, 'dist', 'index.html');
const assetsSrcDir = path.join(__dirname, 'src', 'assets');
const assetsDestDir = path.join(__dirname, 'dist', 'assets');

const outputDir = path.dirname(outputFilePath);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Function to copy assets recursively
function copyAssets(src, dest) {
  const entries = fs.readdirSync(src, { withFileTypes: true });

  fs.mkdirSync(dest, { recursive: true });

  entries.forEach(entry => {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyAssets(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  });
}


function minifyHTML() {
  fs.readFile(inputFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading the input file:', err);
      return;
    }

    const minified = minify(data, {
      // removeAttributeQuotes: true,
      collapseWhitespace: true,
      removeComments: true,
      html5: true,
    });

    fs.writeFile(outputFilePath, minified, 'utf8', (err) => {
      if (err) {
        console.error('Error writing the output file:', err);
        return;
      }

      console.log('HTML minification complete.');
    });
  });
}

function buildTailwindCSS() {
  exec('npx tailwindcss -i ./src/index.css -o ./dist/styles.css --minify', (err, stdout, stderr) => {
    if (err) {
      console.error('Error building TailwindCSS:', err);
      return;
    }
    if (stderr) {
      console.error('TailwindCSS build stderr:', stderr);
      return;
    }
    console.log('TailwindCSS build stdout:', stdout);
  });
}

function init() {
  minifyHTML()
  buildTailwindCSS()
  copyAssets(assetsSrcDir, assetsDestDir)
}

init()
