// fix-https-links.js
import { readdir, readFile, writeFile } from 'fs/promises';
import { join } from 'path';

const blogDir = './src/content/blog';

async function fixHttpsLinks() {
  const files = (await readdir(blogDir)).filter(f => f.endsWith('.mdx'));
  
  for (const file of files) {
    const filePath = join(blogDir, file);
    let content = await readFile(filePath, 'utf-8');
    let modified = false;
    
    // Corriger https:///article-slug en /blog/article-slug
    if (content.includes('https:///')) {
      content = content.replace(/https?:\/\/\/([a-z0-9-]+)\/?/gi, '/blog/$1/');
      modified = true;
    }
    
    // Corriger aussi http:///
    if (content.includes('http:///')) {
      content = content.replace(/http:\/\/\/([a-z0-9-]+)\/?/gi, '/blog/$1/');
      modified = true;
    }
    
    if (modified) {
      await writeFile(filePath, content, 'utf-8');
      console.log(`✅ ${file} corrigé`);
    }
  }
  
  console.log('🎉 Terminé !');
}

fixHttpsLinks();
