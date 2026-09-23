const fs = require("fs");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");

module.exports = {
	config: {
		name: "uptime",
		aliases: ["up", "runtime"],
		version: "2.0",
		author: "Ismail Meddah",
		countDown: 5,
		role: 0,
		shortDescription: {
			en: "Show bot uptime"
		},
		longDescription: {
			en: "Show the bot uptime on the uptime card."
		},
		category: "system",
		guide: {
			en: "{pn}"
		}
	},

	onStart: async function ({ api, event }) {
		const templatePath = path.join(__dirname, "up.png");
		const outputPath = path.join(
			__dirname,
			`uptime_${event.threadID}_${Date.now()}.png`
		);

		try {
			if (!fs.existsSync(templatePath)) {
				return api.sendMessage(
					"𝙐𝙥𝙩𝙞𝙢𝙚 𝙘𝙖𝙧𝙙 𝙬𝙖𝙨 𝙣𝙤𝙩 𝙛𝙤𝙪𝙣𝙙.\n\n𝙋𝙡𝙚𝙖𝙨𝙚 𝙥𝙡𝙖𝙘𝙚 𝙪𝙥.𝙥𝙣𝙜 𝙞𝙣 𝙩𝙝𝙚 𝙨𝙖𝙢𝙚 𝙛𝙤𝙡𝙙𝙚𝙧.",
					event.threadID
				);
			}

			api.setMessageReaction(
				"📡",
				event.messageID,
				() => {},
				true
			);

			// =========================
			// CALCULATE BOT UPTIME
			// =========================

			const uptime = process.uptime();

			const days = Math.floor(uptime / 86400);
			const hours = Math.floor((uptime % 86400) / 3600);
			const minutes = Math.floor((uptime % 3600) / 60);
			const seconds = Math.floor(uptime % 60);

			const uptimeText =
				`${days}d ${hours}h ${minutes}m ${seconds}s`;

			// Short version for the lower card
			const shortUptime =
				`${days}d ${hours}h ${minutes}m`;

			// =========================
			// LOAD TEMPLATE
			// =========================

			const image = await loadImage(templatePath);

			const canvas = createCanvas(
				image.width,
				image.height
			);

			const ctx = canvas.getContext("2d");

			ctx.drawImage(
				image,
				0,
				0,
				image.width,
				image.height
			);

			// =========================
			// MAIN UPTIME NUMBER
			// =========================

			const mainX = 850;

			// This is the main empty UPTIME area.
			// The text is centered here.
			const mainY = 525;

			const maxWidth = 680;

			let fontSize = 78;

			ctx.textAlign = "center";
			ctx.textBaseline = "middle";

			// Automatically reduce font size
			// if uptime becomes very long.
			while (fontSize > 38) {
				ctx.font = `bold ${fontSize}px sans-serif`;

				const width = ctx.measureText(
					uptimeText
				).width;

				if (width <= maxWidth) {
					break;
				}

				fontSize -= 2;
			}

			// Text shadow
			ctx.shadowColor = "rgba(255, 0, 255, 0.65)";
			ctx.shadowBlur = 18;

			// Main uptime color
			ctx.fillStyle = "#ffffff";

			ctx.fillText(
				uptimeText,
				mainX,
				mainY
			);

			// Remove shadow
			ctx.shadowBlur = 0;

			// =========================
			// TOTAL UPTIME BOX
			// =========================

			const totalX = 260;
			const totalY = 770;

			let smallFontSize = 38;

			while (smallFontSize > 24) {
				ctx.font = `bold ${smallFontSize}px sans-serif`;

				const width = ctx.measureText(
					shortUptime
				).width;

				if (width <= 300) {
					break;
				}

				smallFontSize -= 2;
			}

			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			ctx.fillStyle = "#ffffff";

			ctx.shadowColor = "rgba(255, 0, 255, 0.45)";
			ctx.shadowBlur = 10;

			ctx.fillText(
				shortUptime,
				totalX,
				totalY
			);

			ctx.shadowBlur = 0;

			// =========================
			// SAVE IMAGE
			// =========================

			const output = fs.createWriteStream(outputPath);
			const stream = canvas.createPNGStream();

			stream.pipe(output);

			output.on("finish", () => {
				api.setMessageReaction(
					"✅",
					event.messageID,
					() => {},
					true
				);

				api.sendMessage(
					{
						attachment: fs.createReadStream(outputPath)
					},
					event.threadID,
					(err) => {
						if (fs.existsSync(outputPath)) {
							fs.unlinkSync(outputPath);
						}

						if (err) {
							console.error(
								"[UPTIME SEND ERROR]",
								err
							);
						}
					},
					event.messageID
				);
			});

		} catch (error) {
			console.error(
				"[UPTIME ERROR]",
				error
			);

			if (fs.existsSync(outputPath)) {
				fs.unlinkSync(outputPath);
			}

			api.setMessageReaction(
				"❌",
				event.messageID,
				() => {},
				true
			);

			return api.sendMessage(
				"𝙁𝙖𝙞𝙡𝙚𝙙 𝙩𝙤 𝙜𝙚𝙣𝙚𝙧𝙖𝙩𝙚 𝙩𝙝𝙚 𝙪𝙥𝙩𝙞𝙢𝙚 𝙘𝙖𝙧𝙙.",
				event.threadID
			);
		}
	}
};
