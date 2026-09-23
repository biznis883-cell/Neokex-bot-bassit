const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");

const TEMPLATE_URL = "https://postimg.cc/vDTWWMFH";

module.exports = {
	config: {
		name: "help",
		aliases: ["menu", "commands"],
		version: "6.0",
		author: "Bassit",
		countDown: 3,
		role: 0,
		shortDescription: {
			en: "Show all available commands"
		},
		longDescription: {
			en: "Show the command list with a help image."
		},
		category: "system",
		guide: {
			en: "{pn}help [command name]"
		}
	},

	onStart: async function ({ message, args, prefix }) {

		const allCommands = global.GoatBot.commands;

		// =========================================
		// COMMAND DETAILS
		// =========================================

		if (args[0]) {

			const query = args.join(" ").toLowerCase().trim();

			const cmd =
				allCommands.get(query) ||
				[...allCommands.values()].find(cmd =>
					(cmd.config.aliases || [])
						.map(alias => String(alias).toLowerCase())
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
		// CATEGORIES
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

			// Avoid duplicate commands
			if (!categories[category].includes(cmd.config.name)) {
				categories[category].push(
					cmd.config.name
				);
			}
		}

		for (const category of Object.keys(categories)) {
			categories[category].sort((a, b) =>
				a.localeCompare(b)
			);
		}

		// =========================================
		// CREATE TEXT HELP MENU
		// =========================================

		let helpText =
			`╭━━━〔 𝘽𝘼𝙎𝙎𝙄𝙏 𝘽𝙊𝙏 〕━━━╮\n` +
			`┃\n` +
			`┃  𝘾𝙊𝙈𝙈𝘼𝙉𝘿 𝙈𝙀𝙉𝙐\n` +
			`┃\n`;

		const sortedCategories =
			Object.keys(categories).sort();

		for (const category of sortedCategories) {

			helpText +=
				`┃\n` +
				`╭──〔 ${category.toUpperCase()} 〕\n`;

			for (const command of categories[category]) {

				helpText +=
					`│ ➥ ${prefix}${command}\n`;
			}

			helpText +=
				`╰──────────────\n`;
		}

		helpText +=
			`\n` +
			`╭──〔 𝙃𝙀𝙇𝙋 〕\n` +
			`│ ➥ ${prefix}help <command>\n` +
			`│ ➥ ${prefix}help ai\n` +
			`╰──────────────\n\n` +
			`𝘿𝙚𝙫𝙚𝙡𝙤𝙥𝙚𝙧: 𝘽𝙖𝙨𝙨𝙞𝙩`;

		// =========================================
		// DOWNLOAD IMAGE
		// =========================================

		const cacheDir =
			path.join(__dirname, "cache");

		await fs.ensureDir(cacheDir);

		const imagePath =
			path.join(
				cacheDir,
				`help_${Date.now()}.jpg`
			);

		try {

			const page =
				await axios.get(
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

			const matches = [
				html.match(
					/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i
				),

				html.match(
					/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i
				)
			];

			const match =
				matches.find(Boolean);

			if (!match?.[1]) {
				throw new Error(
					"Image URL not found."
				);
			}

			const imageURL =
				match[1]
					.replace(/&amp;/g, "&");

			const image =
				await axios.get(
					imageURL,
					{
						responseType: "arraybuffer",
						timeout: 20000
					}
				);

			await fs.writeFile(
				imagePath,
				image.data
			);

			// =========================================
			// SEND IMAGE + COPYABLE TEXT
			// =========================================

			return message.reply(
				{
					body: helpText,
					attachment:
						fs.createReadStream(
							imagePath
						)
				},
				() => {

					setTimeout(() => {

						if (
							fs.existsSync(imagePath)
						) {
							fs.unlink(
								imagePath,
								() => {}
							);
						}

					}, 10000);
				}
			);

		} catch (error) {

			console.error(
				"[HELP ERROR]",
				error
			);

			// If image fails, still send
			// the copyable command list.

			return message.reply(
				helpText
			);
		}
	}
};
