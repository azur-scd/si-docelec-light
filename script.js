// Script à placer à la racine du projet et à lancer avec node
// Usage: node convert-ejs-scripts-to-modules.js

const fs = require('fs');
const path = require('path');

const VIEWS_DIR = path.join(__dirname, 'views');

function processFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');

  // Remplacement simple de <script src="..."> en <script type="module" src="...">
  // Ne touche pas aux balises qui ont déjà type="module"
  const regexScript = /<script\s+(?![^>]*type\s*=\s*["']module["'])([^>]*)src=(["'][^"']+["'])\s*([^>]*)>(\s*)<\/script>/gi;
  let replaced = false;

  const newContent = content.replace(regexScript, (match, before, src, after, space) => {
    replaced = true;
    return `<script type="module" ${before.trim()} src=${src} ${after.trim()}>${space}</script><!-- [convert-ejs-scripts-to-modules] -->`;
  });

  if (replaced) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    return true;
  }
  return false;
}

function walkDir(dir, callback) {
  fs.readdirSync(dir, { withFileTypes: true }).forEach((dirent) => {
    const fullPath = path.join(dir, dirent.name);
    if (dirent.isDirectory()) {
      walkDir(fullPath, callback);
    } else if (dirent.isFile() && fullPath.endsWith('.ejs')) {
      callback(fullPath);
    }
  });
}

let modifiedCount = 0;
walkDir(VIEWS_DIR, (filePath) => {
  if (processFile(filePath)) {
    console.log('Modifié:', filePath);
    modifiedCount++;
  }
});

console.log(`\nConversion terminée. ${modifiedCount} fichier(s) EJS modifié(s).`);
