const fs = require("fs");
const path = require("path");

module.exports = {
	config: {
		name: "welcome",
		version: "2.0",
		author: "Ismail Meddah",
		category: "events"
	},

	onStart: async function ({ api, event }) {
		// Only handle when someone is added to the group
		if (event.logMessageType !== "log:subscribe")
			return;

		const { threadID } = event;
		const { addedParticipants } = event.logMessageData || {};

		if (!addedParticipants || addedParticipants.length === 0)
			return;

		const botID = String(api.getCurrentUserID());

		// Check if the bot itself was added
		const botWasAdded = addedParticipants.some(
			user => String(user.userFbId) === botID
		);

		// Only send the video when the bot joins
		if (!botWasAdded)
			return;

		// Video file in the same folder as this command
		const videoPath = path.join(
			__dirname,
			"Mohamed Ayman - في قلوبهم مرض فزادهم الله مرضاً_ - الشيخ مشاري راشد.mp4"
		);

		// Check if the video exists
		if (!fs.existsSync(videoPath)) {
			console.error(
				"[WELCOME] Video file not found:",
				videoPath
			);

			return api.sendMessage(
				"𝙒𝙚𝙡𝙘𝙤𝙢𝙚 𝙫𝙞𝙙𝙚𝙤 𝙛𝙞𝙡𝙚 𝙬𝙖𝙨 𝙣𝙤𝙩 𝙛𝙤𝙪𝙣𝙙.",
				threadID
			);
		}

		try {
			return api.sendMessage(
				{
					attachment: fs.createReadStream(videoPath)
				},
				threadID
			);
		} catch (error) {
			console.error(
				"[WELCOME VIDEO ERROR]",
				error
			);
		}
	}
};
