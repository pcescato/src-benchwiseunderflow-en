#!/usr/bin/env node
import fs from "fs";
import path from "path";

const dir = "./src/content/blog";
const layoutPath = "../../layouts/Post.astro";

function process(file) {
  let content = fs.readFileSync(file, "utf-8");
  if (!/^---/.test(content)) return;

  // si "layout:" existe déjà, ne rien faire
  if (/^layout:/m.test(content)) return;

  // insérer la ligne après les premiers ---
  content = content.replace(/^---\n/, `---\nlayout: ${layoutPath}\n`);
  fs.writeFileSync(file, content);
  console.log(`✅ Ajouté layout à ${file}`);
}

function walk(dir) {
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) walk(full);
    else if (entry.endsWith(".mdx")) process(full);
  }
}

walk(dir);
console.log("🎉 Tous les fichiers .mdx sont à jour !");

