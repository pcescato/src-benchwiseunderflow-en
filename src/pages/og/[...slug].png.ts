/* eslint-disable node/prefer-global/buffer */
import type { APIContext, GetStaticPaths } from "astro";
import type { CollectionEntry } from "astro:content";
import fs from "node:fs";
import {
	SITE_TAB,
	USER_AVATAR,
	USER_NAME,
} from "@config";
import { getCollection } from "astro:content";
import satori from "satori";
import sharp from "sharp";


type Weight = 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
type FontStyle = "normal" | "italic";
interface FontOptions {
	data: Buffer | ArrayBuffer;
	name: string;
	weight?: Weight;
	style?: FontStyle;
	lang?: string;
}
export const prerender = true;

// 🟣 Récupération des chemins statiques (blog + notes)
export const getStaticPaths: GetStaticPaths = async () => {
	const blogPosts = await getCollection("blog");
	const publishedBlogPosts = blogPosts.filter((post) => !post.data.draft);

	const notePosts = await getCollection("notes");
	const publishedNotePosts = notePosts.filter((post) => !post.data.draft);

	type PostEntry = CollectionEntry<"blog"> | CollectionEntry<"notes">;

	const allPublishedPosts: PostEntry[] = [
		...publishedBlogPosts,
		...publishedNotePosts,
	];

	return allPublishedPosts.map((post) => ({
		params: { slug: post.slug },
		props: { post },
	}));
};

let fontCache: { regular: Buffer | null; bold: Buffer | null } | null = null;

// 🟣 Téléchargement et mise en cache des polices Google Fonts
async function fetchNotoSansSCFonts() {
	if (fontCache) {
		return fontCache;
	}

	try {
		const cssResp = await fetch(
			"https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;700&display=swap",
		);
		if (!cssResp.ok) throw new Error("Failed to fetch Google Fonts CSS");

		const cssText = await cssResp.text();

		const getUrlForWeight = (weight: number) => {
			const blockRe = new RegExp(
				`@font-face\\s*{[^}]*font-weight:\\s*${weight}[^}]*}`,
				"g",
			);
			const match = cssText.match(blockRe);
			if (!match || match.length === 0) return null;
			const urlMatch = match[0].match(/url\((https:[^)]+)\)/);
			return urlMatch ? urlMatch[1] : null;
		};

		const regularUrl = getUrlForWeight(400);
		const boldUrl = getUrlForWeight(700);

		if (!regularUrl || !boldUrl) {
			console.warn("Could not find font urls in Google Fonts CSS; fallback.");
			fontCache = { regular: null, bold: null };
			return fontCache;
		}

		const [rResp, bResp] = await Promise.all([
			fetch(regularUrl),
			fetch(boldUrl),
		]);
		if (!rResp.ok || !bResp.ok) {
			console.warn("Failed to download font files; fallback.");
			fontCache = { regular: null, bold: null };
			return fontCache;
		}

		const rBuf = Buffer.from(await rResp.arrayBuffer());
		const bBuf = Buffer.from(await bResp.arrayBuffer());

		fontCache = { regular: rBuf, bold: bBuf };
		return fontCache;
	} catch (err) {
		console.warn("Error fetching fonts:", err);
		fontCache = { regular: null, bold: null };
		return fontCache;
	}
}

// 🟣 Génération de l'image OG
export async function GET({
	props,
}: APIContext<{ post: CollectionEntry<"blog" | "notes"> }>) {
	const { post } = props;

	const { regular: fontRegular, bold: fontBold } = await fetchNotoSansSCFonts();

	const avatarBuffer = fs.readFileSync(`./public/${USER_AVATAR}`);
	const avatarBase64 = `data:image/png;base64,${avatarBuffer.toString("base64")}`;

	// ✅ Couleurs de base
	const primaryColor = "#4F46E5";
	const textColor = "#1E293B";
	const subtleTextColor = "#64748B";
	const backgroundColor = "#FFFFFF";

	const pubDate = (post.data.pubDate || new Date()).toLocaleDateString("en-US", {
		year: "numeric",
		month: "short",
		day: "numeric",
	});

	const description = post.data.description;

	// ✅ Blocs Satori
	const titleBlock = {
		type: "div",
		props: {
			style: {
				display: "flex",
				alignItems: "flex-start",
			},
			children: [
				{
					type: "div",
					props: {
						style: {
							width: "10px",
							height: "68px",
							backgroundColor: primaryColor,
							borderRadius: "6px",
							marginTop: "14px",
						},
					},
				},
				{
					type: "div",
					props: {
						style: {
							fontSize: "72px",
							fontWeight: 700,
							lineHeight: 1.2,
							color: textColor,
							marginLeft: "25px",
							display: "-webkit-box",
							overflow: "hidden",
							textOverflow: "ellipsis",
							lineClamp: 3,
							WebkitLineClamp: 3,
							WebkitBoxOrient: "vertical",
						},
						children: post.data.title,
					},
				},
			],
		},
	};

	const descriptionBlock = description
		? {
				type: "div",
				props: {
					style: {
						fontSize: "32px",
						lineHeight: 1.5,
						color: subtleTextColor,
						paddingLeft: "35px",
						display: "-webkit-box",
						overflow: "hidden",
						textOverflow: "ellipsis",
						lineClamp: 2,
						WebkitLineClamp: 2,
						WebkitBoxOrient: "vertical",
					},
					children: description,
				},
		  }
		: null;

	const authorBlock = {
		type: "div",
		props: {
			style: {
				display: "flex",
				justifyContent: "space-between",
				alignItems: "center",
				width: "100%",
			},
			children: [
				{
					type: "div",
					props: {
						style: {
							display: "flex",
							alignItems: "center",
							gap: "20px",
						},
						children: [
							{
								type: "img",
								props: {
									src: avatarBase64,
									width: 60,
									height: 60,
									style: { borderRadius: "50%" },
								},
							},
							{
								type: "div",
								props: {
									style: {
										fontSize: "28px",
										fontWeight: 600,
										color: textColor,
									},
									children: USER_NAME,
								},
							},
						],
					},
				},
				{
					type: "div",
					props: {
						style: { fontSize: "28px", color: subtleTextColor },
						children: pubDate,
					},
				},
			],
		},
	};

	// ✅ Template principal
	const template = {
		type: "div",
		props: {
			style: {
				height: "100%",
				width: "100%",
				display: "flex",
				flexDirection: "column",
				backgroundColor,
				fontFamily:
					'"Noto Sans SC", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
				padding: "60px",
				paddingTop: "60px",
				paddingBottom: "80px",
			},
			children: [
				{
					type: "div",
					props: {
						style: {
							width: "100%",
							display: "flex",
							alignItems: "center",
							gap: "20px",
						},
						children: [
							{
								type: "div",
								props: {
									style: {
										fontSize: "36px",
										fontWeight: 600,
										color: subtleTextColor,
									},
									children: SITE_TAB,
								},
							},
						],
					},
				},

				{
					type: "div",
					props: {
						style: {
							display: "flex",
							flexDirection: "column",
							justifyContent: "center",
							flexGrow: 1,
							gap: "20px",
						},
						children: [
							titleBlock,
							...(descriptionBlock ? [descriptionBlock] : []),
						],
					},
				},

				authorBlock,
			],
		},
	};

	// ✅ Chargement des polices
	const fonts: FontOptions[] = [];
	if (fontRegular) {
		fonts.push({
			name: "Noto Sans SC",
			data: fontRegular,
			weight: 400,
			style: "normal",
		});
	}
	if (fontBold) {
		fonts.push({
			name: "Noto Sans SC",
			data: fontBold,
			weight: 700,
			style: "normal",
		});
	}

	// ✅ Génération de l'image
	const svg = await satori(template, {
		width: 1200,
		height: 630,
		fonts,
	});

	const png = await sharp(Buffer.from(svg)).png().toBuffer();

	return new Response(new Uint8Array(png), {
		headers: {
			"Content-Type": "image/png",
			"Cache-Control": "public, max-age=31536000, immutable",
		},
	});
}
