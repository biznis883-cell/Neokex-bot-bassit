const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const { createCanvas, loadImage } = require("canvas");

const TEMPLATE_URL = "https://postimg.cc/vDTWWMFH";

module.exports = {
	config: {
		name: "help",
		aliases: ["menu", "commands"],
		version: "5.0",
		author: "Bassit",
		countDown: 3,
		role: 0,
		shortDescription: {
			en: "Show all available commands"
		},
		longDescription: {
			en: "Display all available commands on a help image."
		},
		category: "system",
		guide: {
			en: "{pn}help [command name]"
		}
	},

	onStart: async function ({ message, args, prefix }) {

		// =========================================
		// COMMAND DETAILS
		// =========================================

		const allCommands = global.GoatBot.commands;

		if (args[0]) {

			const query = args[0].toLowerCase();

			const cmd =
				allCommands.get(query) ||
				[...allCommands.values()].find(
					c =>
						(c.config.aliases || [])
							.map(x => x.toLowerCase())
							.includes(query)
				);

			if (!cmd) {
				return message.reply(
					`𝘾𝙤𝙢𝙢𝙖𝙣𝙙 "${query}" 𝙬𝙖𝙨 𝙣𝙤𝙩 𝙛𝙤𝙪𝙣𝙙.`
				);
			}

			const {
				name,
				version,
				author,
				guide,
				category,
				shortDescription,
				longDescription,
				aliases,
				role
			} = cmd.config;

			const description =
				typeof longDescription === "string"
					? longDescription
					: longDescription?.en ||
					  shortDescription?.en ||
					  shortDescription ||
					  "No description";

			const usage =
				typeof guide === "string"
					? guide.replace(/{pn}/g, prefix)
					: guide?.en
						?.replace(/{pn}/g, prefix) ||
					  `${prefix}${name}`;

			return message.reply(
				`╭━━━〔 𝘾𝙊𝙈𝙈𝘼𝙉𝘿 𝙄𝙉𝙁𝙊 〕━━━╮\n\n` +
				`➥ 𝙉𝙖𝙢𝙚: ${name}\n` +
				`➥ 𝘾𝙖𝙩𝙚𝙜𝙤𝙧𝙮: ${category || "Other"}\n` +
				`➥ 𝘿𝙚𝙨𝙘𝙧𝙞𝙥𝙩𝙞𝙤𝙣: ${description}\n` +
				`➥ 𝘼𝙡𝙞𝙖𝙨𝙚𝙨: ${aliases?.length ? aliases.join(", ") : "None"}\n` +
				`➥ 𝙐𝙨𝙖𝙜𝙚: ${usage}\n` +
				`➥ 𝙋𝙚𝙧𝙢𝙞𝙨𝙨𝙞𝙤𝙣: ${role ?? 0}\n` +
				`➥ 𝘼𝙪𝙩𝙝𝙤𝙧: Bassit\n` +
				`➥ 𝙑𝙚𝙧𝙨𝙞𝙤𝙣: ${version || "1.0"}\n\n` +
				`╰━━━━━━━━━━━━━━━━━━━━╯`
			);
		}

		// =========================================
		// GROUP COMMANDS
		// =========================================

		const categories = {};

		function cleanCategory(category) {
			if (!category)
				return "others";

			return String(category)
				.normalize("NFKD")
				.replace(/[^\w\s-]/g, "")
				.replace(/\s+/g, " ")
				.trim()
				.toLowerCase();
		}

		for (const [, cmd] of allCommands) {

			if (!cmd?.config?.name)
				continue;

			const category =
				cleanCategory(
					cmd.config.category
				);

			if (!categories[category])
				categories[category] = [];

			categories[category].push(
				cmd.config.name
			);
		}

		// Sort commands
		for (const category of Object.keys(categories)) {
			categories[category].sort();
		}

		// =========================================
		// GET IMAGE FROM POSTIMG PAGE
		// =========================================

		const cacheDir =
			path.join(__dirname, "cache");

		await fs.ensureDir(cacheDir);

		const outputPath =
			path.join(
				cacheDir,
				`help_${Date.now()}.png`
			);

		let templateImage;

		try {

			/*
			 * Postimg URL is a webpage, not the direct
			 * image URL. We extract og:image from it.
			 */

			const page = await axios.get(
				TEMPLATE_URL,
				{
					timeout: 15000,
					headers: {
						"User-Agent":
							"Mozilla/5.0"
					}
				}
			);

			const html = page.data;

			const match =
				html.match(
					/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i
				) ||
				html.match(
					/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i
				);

			if (!match?.[1]) {
				throw new Error(
					"Could not find the Postimg image."
				);
			}

			const imageURL =
				match[1]
					.replace(/&amp;/g, "&");

			templateImage =
				await loadImage(imageURL);

		} catch (error) {

			console.error(
				"[HELP IMAGE ERROR]",
				error
			);

			return message.reply(
				"𝙁𝙖𝙞𝙡𝙚𝙙 𝙩𝙤 𝙡𝙤𝙖𝙙 𝙩𝙝𝙚 𝙝𝙚𝙡𝙥 𝙞𝙢𝙖𝙜𝙚."
			);
		}

		// =========================================
		// CREATE CANVAS
		// =========================================

		const width =
			templateImage.width;

		const height =
			templateImage.height;

		const canvas =
			createCanvas(
				width,
				height
			);

		const ctx =
			canvas.getContext("2d");

		// Background
		ctx.drawImage(
			templateImage,
			0,
			0,
			width,
			height
		);

		// =========================================
		// DARK TRANSPARENT PANEL
		// =========================================

		ctx.fillStyle =
			"rgba(0, 0, 0, 0.60)";

		ctx.roundRect(
			40,
			40,
			width - 80,
			height - 80,
			35
		);

		ctx.fill();

		// =========================================
		// TITLE
		// =========================================

		ctx.textAlign = "center";

		ctx.font =
			"bold 58px Arial";

		ctx.fillStyle =
			"#ffffff";

		ctx.fillText(
			"𝘽𝘼𝙎𝙎𝙄𝙏 𝘽𝙊𝙏",
			width / 2,
			115
		);

		ctx.font =
			"bold 34px Arial";

		ctx.fillStyle =
			"#dddddd";

		ctx.fillText(
			"𝘾𝙊𝙈𝙈𝘼𝙉𝘿 𝙈𝙀𝙉𝙐",
			width / 2,
			165
		);

		// =========================================
		// COMMAND LIST
		// =========================================

		let y = 225;

		const leftX = 95;

		const rightLimit =
			width - 95;

		const lineHeight = 42;

		ctx.textAlign = "left";

		ctx.font =
			"bold 27px Arial";

		const categoryNames =
			Object.keys(categories)
				.sort();

		for (const category of categoryNames) {

			// Category title
			ctx.fillStyle =
				"#ffffff";

			ctx.font =
				"bold 32px Arial";

			ctx.fillText(
				`╭─ ${category.toUpperCase()}`,
				leftX,
				y
			);

			y += 39;

			ctx.font =
				"bold 25px Arial";

			ctx.fillStyle =
				"#eeeeee";

			const commands =
				categories[category];

			let line = "";

			for (const command of commands) {

				const part =
					`${prefix}${command}  `;

				const testLine =
					line + part;

				const textWidth =
					ctx.measureText(
						testLine
					).width;

				if (
					textWidth >
						rightLimit - leftX &&
					line
				) {

					ctx.fillText(
						line,
						leftX + 25,
						y
					);

					y += lineHeight;

					line = part;

				} else {

					line = testLine;
				}

				// Avoid overflowing image
				if (y > height - 180) {
					break;
				}
			}

			if (
				line &&
				y < height - 180
			) {

				ctx.fillText(
					line,
					leftX + 25,
					y
				);

				y += lineHeight;
			}

			if (
				y < height - 150
			) {

				ctx.fillStyle =
					"rgba(255,255,255,0.35)";

				ctx.font =
					"22px Arial";

				ctx.fillText(
					"╰────────────",
					leftX,
					y
				);

				y += 38;
			}

			if (y > height - 180)
				break;
		}

		// =========================================
		// FOOTER
		// =========================================

		ctx.textAlign = "center";

		ctx.font =
			"bold 27px Arial";

		ctx.fillStyle =
			"#ffffff";

		ctx.fillText(
			`${prefix}help <command>  •  BASSIT`,
			width / 2,
			height - 85
		);

		// =========================================
		// SAVE IMAGE
		// =========================================

		const buffer =
			canvas.toBuffer("image/png");

		await fs.writeFile(
			outputPath,
			buffer
		);

		// =========================================
		// SEND IMAGE
		// =========================================

		return message.reply(
			{
				attachment:
					fs.createReadStream(
						outputPath
					)
			},
			() => {

				setTimeout(() => {

					if (
						fs.existsSync(
							outputPath
						)
					) {
						fs.unlink(
							outputPath,
							() => {}
						);
					}

				}, 5000);
			}
		);
	}
};
