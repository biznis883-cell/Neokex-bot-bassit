const fs = require("fs");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");

module.exports = {
	config: {
		name: "uptime",
		aliases: ["up", "runtime"],
		version: "2.1",
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
		const templatePath = path.join(
			__dirname,
			"file_0000000097648243b1697918f32a45c2.png"
		);

		const outputPath = path.join(
			__dirname,
			`uptime_${Date.now()}.png`
		);

		try {
			if (!fs.existsSync(templatePath)) {
				return api.sendMessage(
					"𝙐𝙥𝙩𝙞𝙢𝙚 𝙞𝙢𝙖𝙜𝙚 𝙬𝙖𝙨 𝙣𝙤𝙩 𝙛𝙤𝙪𝙣𝙙.",
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
			// BOT UPTIME
			// =========================

			const uptime = process.uptime();

			const days = Math.floor(uptime / 86400);
			const hours = Math.floor((uptime % 86400) / 3600);
			const minutes = Math.floor((uptime % 3600) / 60);
			const seconds = Math.floor(uptime % 60);

			const uptimeText =
				`${days}d ${hours}h ${minutes}m ${seconds}s`;

			const shortUptime =
				`${days}d ${hours}h ${minutes}m`;

			// =========================
			// LOAD IMAGE
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
			// MAIN UPTIME
			// =========================

			const mainX = 850;
			const mainY = 510;
			const maxWidth = 650;

			let fontSize = 82;

			ctx.textAlign = "center";
			ctx.textBaseline = "middle";

			while (fontSize > 35) {
				ctx.font = `bold ${fontSize}px Arial`;

				if (
					ctx.measureText(uptimeText).width <= maxWidth
				) {
					break;
				}

				fontSize -= 2;
			}

			// Glow
			ctx.shadowColor = "#ff00ff";
			ctx.shadowBlur = 18;

			ctx.fillStyle = "#ffffff";

			ctx.fillText(
				uptimeText,
				mainX,
				mainY
			);

			ctx.shadowBlur = 0;

			// =========================
			// TOTAL UPTIME
			// =========================

			const totalX = 260;
			const totalY = 870;

			let smallFontSize = 38;

			while (smallFontSize > 22) {
				ctx.font = `bold ${smallFontSize}px Arial`;

				if (
					ctx.measureText(shortUptime).width <= 300
				) {
					break;
				}

				smallFontSize -= 2;
			}

			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			ctx.fillStyle = "#ffffff";

			ctx.shadowColor = "#ff00ff";
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

			const output = fs.createWriteStream(
				outputPath
			);

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
						attachment: fs.createReadStream(
							outputPath
						)
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
