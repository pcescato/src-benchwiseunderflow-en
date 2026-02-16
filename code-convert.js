// convert-code-blocks.js
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const blogDir = './src/content/blog';

async function convertCodeBlocks() {
  const files = await readdir(blogDir).then(l => l.filter(f => f.endsWith('.mdx')));

  for (const file of files) {
    const filePath = join(blogDir, file);
    let content = await readFile(filePath, 'utf-8');
    let modified = false; // Pour suivre si on a fait des modifs

    // 1. import manquant
    if (!/import\s+{\s*Code\s*}/.test(content)) {
      const fmEnd = content.indexOf('---', 3) + 3;
      if (fmEnd > 3) { // S'assurer qu'on a bien trouvé le frontmatter
        content =
          content.slice(0, fmEnd) +
          `\n\nimport { Code } from 'astro-expressive-code/components';\n` +
          content.slice(fmEnd);
        modified = true;
      }
    }

    // 2. Convertir tous les blocs ```lang (sauf mermaid) en <Code ... />
    const originalContent = content; // Garder une copie avant remplacement
    content = content.replace(
      // LA CORRECTION EST ICI : [^\n]* a été ajouté
      /(^|[ \t]*)```(?!mermaid\b)(\w+)[^\n]*\n([\s\S]*?)\n[ \t]*```/gm,
      (_, leading, lang, code) => {
        const escaped = code
          .replace(/\\/g, '\\\\') // Échapper les backslashes
          .replace(/`/g, '\\`')   // Échapper les backticks
          .replace(/\$/g, '\\$');  // Échapper les $ (pour les template literals)
        
        // Assure-toi que le 'leading' (indentation) est bien reporté
        return `${leading}<Code code={\`${escaped}\`} lang="${lang}" />`;
      }
    );

    // Vérifier si le remplacement a changé quelque chose
    if (originalContent !== content) {
      modified = true;
    }

    // N'écrire le fichier que s'il a été modifié
    if (modified) {
      await writeFile(filePath, content, 'utf-8');
      console.log(`? ${file} converti`);
    } else {
      console.log(`?? ${file} (inchangé)`);
    }
  }
  console.log('?? Terminé !');
}

convertCodeBlocks().catch(console.error);