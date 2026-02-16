import { readdir, readFile, writeFile } from 'fs/promises';
import { join } from 'path';

const blogDir = './src/content/blog';

async function addImportToMDX() {
  const files = await readdir(blogDir);
  const mdxFiles = files.filter(f => f.endsWith('.mdx'));
  
  for (const file of mdxFiles) {
    const filePath = join(blogDir, file);
    let content = await readFile(filePath, 'utf-8');
    
    // Si l'import n'existe pas déjà
    if (!content.includes("import OptImg from '@components/OptImg.astro'")) {
      // Trouve la fin du frontmatter
      const frontmatterEnd = content.indexOf('---', 3) + 3;
      const before = content.slice(0, frontmatterEnd);
      const after = content.slice(frontmatterEnd);
      
      // Ajoute l'import juste après le frontmatter
      const newContent = before + "\n\nimport OptImg from '../../components/OptImg.astro'\n" + after;
      
      await writeFile(filePath, newContent, 'utf-8');
      console.log(`✅ ${file} mis à jour`);
    } else {
      console.log(`⏭️  ${file} déjà à jour`);
    }
  }
  
  console.log('🎉 Terminé !');
}

addImportToMDX();
