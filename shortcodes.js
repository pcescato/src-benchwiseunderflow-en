#!/usr/bin/env node
import fs from "fs";
import path from "path";

const folder = "./src/content/blog";

const regex = /\{\{<\s*optimg\s+([^>]+)\s*>\}\}/g;

function parseAttributes(str) {
  const attrs = {};
  str.replace(/(\w+)="([^"]*)"/g, (_, key, value) => (attrs[key] = value));
  return attrs;
}

function convert(filePath) {
  let content = fs.readFileSync(filePath, "utf-8");
  const matches = [...content.matchAll(regex)];

  if (matches.length === 0) return;

  for (const match of matches) {
    const attrs = parseAttributes(match[1]);
    const mdx = `<OptImg src="${attrs.src}" alt="${attrs.alt}" caption="${attrs.caption}" align="${attrs.align}" />`;
    content = content.replace(match[0], mdx);
  }

  fs.writeFileSync(filePath, content);
  console.log(`✅ Converti : ${filePath}`);
}

function walk(dir) {
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) walk(full);
    else if (f.endsWith(".md") || f.endsWith(".mdx")) convert(full);
  }
}

walk(folder);

