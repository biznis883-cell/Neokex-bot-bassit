const fs = require("fs");
const path = require("path");

module.exports = {
	config: {
		name: "welcome",
		version: "3.0",
		author: "Bassit",
		category: "events"
	},

	onStart: async function ({ api, event }) {
		try {
			// Only handle when the bot is added
			if (event.logMessageType !== "log:subscribe")
				return;

			const threadID = event.threadID;
			const addedParticipants =
				event.logMessageData?.addedParticipants;

			if (
				!addedParticipants ||
				addedParticipants.length === 0
			) {
				return;
			}

			const botID =
				String(api.getCurrentUserID());

			const botWasAdded =
				addedParticipants.some(
					user =>
						String(user.userFbId) === botID
				);

			// Only send the video when the bot joins
			if (!botWasAdded)
				return;

			// Keep your original video filename
			const videoPath = path.join(
				__dirname,
				"Mohamed Ayman - في قلوبهم مرض فزادهم الله مرضاً_ - الشيخ مشاري راشد.mp4"
			);

			if (!fs.existsSync(videoPath)) {
				console.error(
					"[WELCOME] Video not found:",
					videoPath
				);
				return;
			}

			const videoStream =
				fs.createReadStream(videoPath);

			videoStream.on("error", error => {
				console.error(
					"[WELCOME] Video stream error:",
					error
				);
			});

			await api.sendMessage(
				{
					attachment: videoStream
				},
				threadID
			);

			console.log(
				"[WELCOME] Welcome video sent successfully."
			);

		} catch (error) {
			console.error(
				"[WELCOME VIDEO ERROR]:",
				error?.stack ||
				error?.message ||
				error
			);
		}
	}
};
