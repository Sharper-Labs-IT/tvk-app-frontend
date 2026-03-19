const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (/\.(js|jsx|ts|tsx)$/.test(file)) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      let newContent = content.replace(/console\.log\([\s\S]*?\)(;?)/g, '');
      
      if (content !== newContent) {
        fs.writeFileSync(fullPath, newContent, 'utf8');
        console.log('Updated ' + fullPath);
      }
    }
  }
}

processDir(path.join(__dirname, 'src'));
