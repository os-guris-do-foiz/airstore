import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dirs = ['auth', 'admin', 'fields', 'ads', 'user', 'teams', 'info'];
const replacements = [
  { from: '\\.\\./components', to: '../../components' },
  { from: '\\.\\./data', to: '../../data' },
  { from: '\\.\\./types', to: '../../types' }
];

dirs.forEach(dir => {
  const dirPath = path.join(__dirname, 'frontend/pages', dir);
  if (fs.existsSync(dirPath)) {
    fs.readdirSync(dirPath).forEach(file => {
      if (file.endsWith('.tsx')) {
        const filePath = path.join(dirPath, file);
        let content = fs.readFileSync(filePath, 'utf8');
        replacements.forEach(rep => {
          content = content.replace(new RegExp(rep.from, 'g'), rep.to);
        });
        fs.writeFileSync(filePath, content);
        console.log(`Updated ${filePath}`);
      }
    });
  }
});
