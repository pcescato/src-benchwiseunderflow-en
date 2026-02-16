// fix-raw-lang.js
import { readdir, readFile, writeFile } from 'fs/promises';
import { join } from 'path';

const blogDir = './src/content/blog';

async function fixRawLang() {
  const files = (await readdir(blogDir)).filter(f => f.endsWith('.mdx'));
  
  for (const file of files) {
    const filePath = join(blogDir, file);
    let content = await readFile(filePath, 'utf-8');
    
    if (content.includes('lang="raw"')) {
      content = content.replace(/lang="raw"/g, 'lang="txt"');
      await writeFile(filePath, content, 'utf-8');
      console.log(`✅ ${file} corrigé`);
    }
  }
  
  console.log('🎉 Terminé !');
}

fixRawLang();
