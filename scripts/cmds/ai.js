const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const BASE_URL = "https://meta.nkx.lol";

const DATA_DIR = path.join(__dirname, "data");
const CONV_FILE = path.join(DATA_DIR, "aiConversations.json");

const conversations = {};

/*
 * Available AI models
 * Change the model names if your API uses different names.
 */
const MODELS = {
	gpt: "gpt-5.5",
	claude: "claude-opus-5.5",
	gemini: "gemini-3.1-pro"
};

// ==============================
// LOAD CONVERSATIONS
// ==============================

function loadConversations() {
	try {
		fs.ensureDirSync(DATA_DIR);

		if (!fs.existsSync(CONV_FILE)) {
			fs.writeJsonSync(CONV_FILE, {});
			return;
		}

		const data = fs.readJsonSync(CONV_FILE);

		if (data && typeof data === "object") {
			Object.assign(conversations, data);
		}
	} catch (error) {
		console.error("[AI] Load error:", error);
	}
}

function saveConversations() {
	try {
		fs.ensureDirSync(DATA_DIR);

		fs.writeJsonSync(
			CONV_FILE,
			conversations,
			{ spaces: 2 }
		);
	} catch (error) {
		console.error("[AI] Save error:", error);
	}
}

loadConversations();

// ==============================
// EXTRACT TEXT
// ==============================

function extractText(data) {
	if (!data)
		return null;

	if (typeof data === "string")
		return data.trim();

	const keys = [
		"reply",
		"response",
		"message",
		"content",
		"answer",
		"output",
		"text",
		"result"
	];

	const search = (obj, depth = 0) => {
		if (!obj || depth > 8)
			return null;

		if (typeof obj !== "object")
			return null;

		if (Array.isArray(obj)) {
			for (const item of obj) {
				const result = search(
					item,
					depth + 1
				);

				if (result)
					return result;
			}

			return null;
		}

		for (const [key, value] of Object.entries(obj)) {
			if (
				keys.includes(
					String(key).toLowerCase()
				) &&
				typeof value === "string" &&
				value.trim()
			) {
				return value.trim();
			}

			if (
				value &&
				typeof value === "object"
			) {
				const result = search(
					value,
					depth + 1
				);

				if (result)
					return result;
			}
		}

		return null;
	};

	return search(data);
}

// ==============================
// EXTRACT CONVERSATION ID
// ==============================

function extractConversationId(data) {
	if (!data)
		return null;

	const keys = [
		"conversation_id",
		"conversationId",
		"conversationID"
	];

	const search = (obj, depth = 0) => {
		if (!obj || depth > 8)
			return null;

		if (typeof obj !== "object")
			return null;

		if (Array.isArray(obj)) {
			for (const item of obj) {
				const result = search(
					item,
					depth + 1
				);

				if (result)
					return result;
			}

			return null;
		}

		for (const [key, value] of Object.entries(obj)) {
			if (
				keys.includes(String(key))
			) {
				return String(value);
			}

			if (
				value &&
				typeof value === "object"
			) {
				const result = search(
					value,
					depth + 1
				);

				if (result)
					return result;
			}
		}

		return null;
	};

	return search(data);
}

// ==============================
// CALL AI
// ==============================

async function askAI(
	userMessage,
	conversationId,
	model
) {
	const body = {
		message: userMessage,
		model: model,
		timeout: 60
	};

	if (conversationId) {
		body.conversation_id = conversationId;
		body.new_conversation = false;
	} else {
		body.new_conversation = true;
	}

	return axios.post(
		`${BASE_URL}/v1/chat`,
		body,
		{
			timeout: 70000,
			validateStatus: () => true,
			headers: {
				"Content-Type":
					"application/json",
				"Accept":
					"application/json"
			}
		}
	);
}

// ==============================
// REPLY CHAIN
// ==============================

function saveReply(
	info,
	userID,
	conversationId,
	model
) {
	if (!info?.messageID)
		return;

	global.GoatBot.onReply.set(
		info.messageID,
		{
			commandName: "ai",
			author: userID,
			conversationId,
			model
		}
	);
}

// ==============================
// SEND AI RESPONSE
// ==============================

async function sendAI({
	message,
	event,
	text,
	conversationId,
	model
}) {
	try {
		const response = await askAI(
			text,
			conversationId,
			model
		);

		if (
			!response ||
			response.status >= 400
		) {
			console.error(
				"[AI ERROR]",
				response?.status,
				response?.data
			);

			return message.reply(
				"𝘼𝙄 𝙨𝙚𝙧𝙫𝙚𝙧 𝙚𝙧𝙧𝙤𝙧."
			);
		}

		const reply =
			extractText(response.data);

		const newConversationId =
			extractConversationId(
				response.data
			) || conversationId;

		if (!reply) {
			return message.reply(
				"𝙏𝙝𝙚 𝘼𝙄 𝙙𝙞𝙙 𝙣𝙤𝙩 𝙧𝙚𝙩𝙪𝙧𝙣 𝙖 𝙧𝙚𝙨𝙥𝙤𝙣𝙨𝙚."
			);
		}

		if (newConversationId) {
			conversations[event.threadID] = {
				id: newConversationId,
				model
			};

			saveConversations();
		}

		return message.reply(
			reply,
			(error, info) => {
				if (error) {
					console.error(
						"[AI REPLY ERROR]",
						error
					);

					return;
				}

				saveReply(
					info,
					event.senderID,
					newConversationId,
					model
				);
			}
		);

	} catch (error) {
		console.error(
			"[AI REQUEST ERROR]",
			error?.response?.data ||
			error?.message ||
			error
		);

		return message.reply(
			"𝙁𝙖𝙞𝙡𝙚𝙙 𝙩𝙤 𝙘𝙤𝙣𝙣𝙚𝙘𝙩 𝙩𝙤 𝙩𝙝𝙚 𝘼𝙄."
		);
	}
}

// ==============================
// COMMAND
// ==============================

module.exports = {

	config: {
		name: "ai",

		aliases: [
			"chat",
			"gpt"
		],

		version: "3.0",

		author: "Ismail Meddah",

		countDown: 3,

		role: 0,

		shortDescription: {
			en: "Multi AI assistant"
		},

		longDescription: {
			en:
				"Chat with multiple AI models and continue conversations by replying."
		},

		category: "ai",

		guide: {
			en:
				"{pn} <message>\n" +
				"{pn} gpt <message>\n" +
				"{pn} claude <message>\n" +
				"{pn} gemini <message>\n" +
				"{pn} new"
		}
	},

	// ==========================
	// START
	// ==========================

	onStart: async function ({
		message,
		args,
		event
	}) {
		if (!args.length) {
			return message.reply(
				"𝙐𝙨𝙖𝙜𝙚:\n\n" +
				"𝙖𝙞 𝙜𝙥𝙩 𝙝𝙚𝙡𝙡𝙤\n" +
				"𝙖𝙞 𝙘𝙡𝙖𝙪𝙙𝙚 𝙝𝙚𝙡𝙡𝙤\n" +
				"𝙖𝙞 𝙜𝙚𝙢𝙞𝙣𝙞 𝙝𝙚𝙡𝙡𝙤\n\n" +
				"𝙖𝙞 𝙣𝙚𝙬"
			);
		}

		const first =
			args[0].toLowerCase();

		// NEW CONVERSATION
		if (first === "new") {
			delete conversations[
				event.threadID
			];

			saveConversations();

			return message.reply(
				"𝙉𝙚𝙬 𝘼𝙄 𝙘𝙤𝙣𝙫𝙚𝙧𝙨𝙖𝙩𝙞𝙤𝙣 𝙨𝙩𝙖𝙧𝙩𝙚𝙙. 🤖"
			);
		}

		let model;
		let text;

		if (MODELS[first]) {
			model = MODELS[first];
			text = args.slice(1).join(" ").trim();
		} else {
			model = MODELS.gpt;
			text = args.join(" ").trim();
		}

		if (!text) {
			return message.reply(
				"𝙋𝙡𝙚𝙖𝙨𝙚 𝙚𝙣𝙩𝙚𝙧 𝙖 𝙢𝙚𝙨𝙨𝙖𝙜𝙚."
			);
		}

		const saved =
			conversations[
				event.threadID
			];

		const conversationId =
			saved?.id || null;

		return sendAI({
			message,
			event,
			text,
			conversationId,
			model
		});
	},

	// ==========================
	// REPLY
	// ==========================

	onReply: async function ({
		message,
		event,
		Reply
	}) {
		if (
			String(event.senderID) !==
			String(Reply.author)
		) {
			return;
		}

		const text =
			(event.body || "").trim();

		if (!text)
			return;

		return sendAI({
			message,
			event,
			text,
			conversationId:
				Reply.conversationId,
			model:
				Reply.model ||
				MODELS.gpt
		});
	}
};
