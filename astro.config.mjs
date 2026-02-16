import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import expressiveCode from "astro-expressive-code";
import icon from "astro-icon";
import rehypeExternalLinks from "rehype-external-links";
import { fileURLToPath } from "url";
import { USER_SITE } from "./src/config.ts";
import updateConfig from "./src/integration/updateConfig.ts";
import { remarkReadingTime } from "./src/plugins/remark-reading-time";
import rehypeMermaid from "rehype-mermaid";

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
    sitemap(),
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
