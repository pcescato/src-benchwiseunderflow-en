#!/usr/bin/env node
/**
 * Renomme tous les fichiers .md en .mdx
 * dans src/content/ (et sous-dossiers)
 */

import fs from "fs";
import path from "path";

const baseDir = "./src/content";

function renameMdToMdx(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      renameMdToMdx(fullPath);
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      const newPath = fullPath.replace(/\.md$/, ".mdx");
      fs.renameSync(fullPath, newPath);
      console.log(`✅ Renommé : ${entry.name} → ${path.basename(newPath)}`);
    }
  }
}

renameMdToMdx(baseDir);
console.log("🎉 Tous les fichiers .md ont été renommés en .mdx !");

