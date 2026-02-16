import { readdir, readFile, writeFile } from 'fs/promises';
import { join } from 'path';

const blogDir = './src/content/blog';

async function cleanMDXFiles() {
  const files = await readdir(blogDir);
  const mdxFiles = files.filter(f => f.endsWith('.mdx'));
  
  let modifiedCount = 0;
  
  for (const file of mdxFiles) {
    const filePath = join(blogDir, file);
    let content = await readFile(filePath, 'utf-8');
    let modified = false;
    
    // Supprime la ligne layout
    if (content.includes('layout:')) {
      content = content.replace(/^layout:\s*.*$/gm, '');
      modified = true;
    }
    
    // Remplace /images/ par /image/ dans les balises OptImg
    if (content.includes('<OptImg') && content.includes('/images/')) {
      content = content.replace(/(<OptImg[^>]*src=["'])\/images\//g, '$1/image/');
      modified = true;
    }
    
    // Nettoie les lignes vides multiples dans le frontmatter
    content = content.replace(/(---[\s\S]*?---)/g, (match) => {
      return match.replace(/\n{3,}/g, '\n\n');
    });
    
    if (modified) {
      await writeFile(filePath, content, 'utf-8');
      console.log(`✅ ${file} modifié`);
      modifiedCount++;
    } else {
      console.log(`⏭️  ${file} inchangé`);
    }
  }
  
  console.log(`\n🎉 Terminé ! ${modifiedCount} fichier(s) modifié(s)`);
}

cleanMDXFiles();
