#!/usr/bin/env node
/**
 * Script de normalisation des dates dans les fichiers Markdown pour Astro
 * - Corrige `date:` ou `pubDate:` au format ISO (YYYY-MM-DD)
 * - Crée un backup .bak avant toute modification
 */

import fs from "fs";
import path from "path";
import matter from "gray-matter";

const contentDir = "./src/content/blog"; // adapte selon ton projet

function normalizeDate(dateValue) {
  if (!dateValue) return null;

  // Si c’est déjà une date valide
  if (dateValue instanceof Date && !isNaN(dateValue)) {
    return dateValue.toISOString().slice(0, 10);
  }

  // Essaye de parser des chaînes type "2025-10-19", "Oct 19 2025", etc.
  const parsed = new Date(dateValue);
  if (!isNaN(parsed)) {
    return parsed.toISOString().slice(0, 10);
  }

  // Sinon, on renvoie null
  return null;
}

function processMarkdownFile(filePath) {
  const raw = fs.readFileSync(filePath, "utf-8");
  const parsed = matter(raw);
  const data = parsed.data;

  let modified = false;

  // Si `date` existe, on le transforme en `pubDate`
  if (data.date && !data.pubDate) {
    const normalized = normalizeDate(data.date);
    if (normalized) {
      data.pubDate = normalized;
      delete data.date;
      modified = true;
    }
  }

  // Si `pubDate` existe mais pas au bon format
  if (data.pubDate && typeof data.pubDate === "string") {
    const normalized = normalizeDate(data.pubDate);
    if (normalized && normalized !== data.pubDate) {
      data.pubDate = normalized;
      modified = true;
    }
  }

  if (modified) {
    const backupPath = `${filePath}.bak`;
    fs.writeFileSync(backupPath, raw);
    const newContent = matter.stringify(parsed.content, data);
    fs.writeFileSync(filePath, newContent);
    console.log(`✅ Fixé : ${filePath}`);
  }
}

function walk(dir) {
  for (const entry of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, entry);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) walk(fullPath);
    else if (entry.endsWith(".md")) processMarkdownFile(fullPath);
  }
}

walk(contentDir);
console.log("🎉 Vérification terminée !");

