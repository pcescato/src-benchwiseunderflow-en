import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import expressiveCode from "astro-expressive-code";
import icon from "astro-icon";
import rehypeExternalLinks from "rehype-external-links";
import { fileURLToPath } from "url";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import yaml from "js-yaml";
import { USER_SITE } from "./src/config.ts";
import updateConfig from "./src/integration/updateConfig.ts";
import { remarkReadingTime } from "./src/plugins/remark-reading-time";
import rehypeMermaid from "rehype-mermaid";

const BLOG_DIR = path.resolve("src/content/blog");
const blogArticleUrls = new Set();
const blogLastmods = new Map();

if (existsSync(BLOG_DIR)) {
  for (const file of readdirSync(BLOG_DIR)) {
    if (!/\.(md|mdx)$/.test(file)) continue;
    const raw = readFileSync(path.join(BLOG_DIR, file), "utf8");
    const frontmatterMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!frontmatterMatch) continue;
    let frontmatter = {};
    try {
      frontmatter = yaml.load(frontmatterMatch[1]) ?? {};
    } catch {
      continue;
    }
    const slug = String(
      frontmatter.slug ?? file.replace(/\.(md|mdx)$/, "")
    ).replace(/\/+$/, "");
    const url = `${USER_SITE}/blog/${slug}/`;
    blogArticleUrls.add(url);
    const date = frontmatter.lastmod ?? frontmatter.pubDate;
    if (date) blogLastmods.set(url, new Date(date));
  }
}

export default defineConfig({
  site: USER_SITE,
  output: "static",

  style: {
    scss: {
      includePaths: ["./src/styles"],
    },
  },

  integrations: [
    updateConfig(),

    expressiveCode({
      themes: ["github-dark"],
      styleOverrides: { borderRadius: "0.75rem" },
    }),

    mdx({
      remarkPlugins: [remarkReadingTime],
      rehypePlugins: [
        rehypeMermaid,
        [
          rehypeExternalLinks,
          {
            content: { type: "text", value: "↗" },
          },
        ],
      ],
    }),

    icon(),
    sitemap({
      lastmod: new Date(),
      namespaces: { news: false, video: false },
      filter: (page) =>
        !/\/blog\/\d+\/|\/notes\/\d+\//.test(page) &&
        !page.includes("/tag/") &&
        !page.includes("/category/") &&
        !page.includes("/notes/") &&
        !page.includes("/search/") &&
        !page.includes("/archives/") &&
        !page.endsWith("/blog/tags/") &&
        !page.endsWith("/blog/") &&
        !page.endsWith("/blog/categories/") &&
        !page.endsWith("/confidentialite/") &&
        !page.endsWith("/mentions-legales/"),
      serialize: (item) => {
        const frontmatterDate = blogLastmods.get(item.url);
        if (frontmatterDate) item.lastmod = frontmatterDate.toISOString();
        return item;
      },
      chunks: {
        blog: (item) => (blogArticleUrls.has(item.url) ? item : undefined),
      },
    }),
    tailwind({ configFile: "./tailwind.config.mjs" }),
  ],

  markdown: {
    remarkPlugins: [remarkReadingTime],
    rehypePlugins: [
      rehypeMermaid,
      [
        rehypeExternalLinks,
        {
          content: { type: "text", value: "↗" },
        },
      ],
    ],
  },

  vite: {
    build: {
      minify: "esbuild", // rapide et sans saturation
    },

    resolve: {
      alias: {
        "@components": fileURLToPath(
          new URL("./src/components", import.meta.url)
        ),
      },
    },

    css: {
      preprocessorOptions: {
        scss: {
          api: "modern-compiler",
        },
      },
    },
  },
});
