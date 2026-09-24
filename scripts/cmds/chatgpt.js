const OpenAI = require("openai");
const fs = require("fs-extra");
const path = require("path");

const client = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY
});

const DATA_DIR = path.join(__dirname, "data");
const MEMORY_FILE = path.join(
	DATA_DIR,
	"chatgpt_memory.json"
);

fs.ensureDirSync(DATA_DIR);

let conversations = {};

try {
	if (fs.existsSync(MEMORY_FILE)) {
		conversations =
			fs.readJsonSync(MEMORY_FILE);
	}
} catch {
	conversations = {};
}

function saveMemory() {
	fs.writeJsonSync(
		MEMORY_FILE,
		conversations,
		{ spaces: 2 }
	);
}

function getConversation(threadID) {
	return conversations[String(threadID)] || [];
}

function saveConversation(threadID, messages) {
	conversations[String(threadID)] =
		messages.slice(-20);

	saveMemory();
}

function cleanText(text) {
	if (!text) return "";

	return String(text)
		.replace(/\r/g, "")
		.trim();
}

module.exports = {
	config: {
		name: "chatgpt",
		aliases: ["gpt", "ai", "chat"],
		version: "3.0",
		author: "Bassit",
		countDown: 3,
		role: 0,

		shortDescription: {
			en: "Chat with an advanced AI"
		},

		longDescription: {
			en:
				"Chat with an advanced AI assistant for questions, coding, explanations and more."
		},

		category: "ai",

		guide: {
			en:
				"{pn} <message>\n" +
				"{pn} new\n" +
				"Reply to the AI message to continue the conversation."
		}
	},

	onStart: async function ({
		message,
		args,
		event
	}) {

		// =========================
		// CHECK API KEY
		// =========================

		if (!process.env.OPENAI_API_KEY) {
			return message.reply(
				"❌ OPENAI_API_KEY is not configured."
			);
		}

		// =========================
		// NEW CHAT
		// =========================

		if (
			args[0] &&
			args[0].toLowerCase() === "new"
		) {

			delete conversations[
				String(event.threadID)
			];

			saveMemory();

			return message.reply(
				"𝙉𝙚𝙬 𝘾𝙝𝙖𝙩𝙂𝙋𝙏 𝙘𝙤𝙣𝙫𝙚𝙧𝙨𝙖𝙩𝙞𝙤𝙣 𝙨𝙩𝙖𝙧𝙩𝙚𝙙. 🤖"
			);
		}

		const prompt =
			cleanText(args.join(" "));

		if (!prompt) {
			return message.reply(
				"𝙐𝙨𝙖𝙜𝙚:\n" +
				"𝙘𝙝𝙖𝙩𝙜𝙥𝙩 <𝙮𝙤𝙪𝙧 𝙦𝙪𝙚𝙨𝙩𝙞𝙤𝙣>\n\n" +
				"𝙀𝙭𝙖𝙢𝙥𝙡𝙚:\n" +
				"𝙘𝙝𝙖𝙩𝙜𝙥𝙩 𝙬𝙧𝙞𝙩𝙚 𝙖 𝙅𝙖𝙫𝙖𝙎𝙘𝙧𝙞𝙥𝙩 𝙘𝙤𝙢𝙢𝙖𝙣𝙙"
			);
		}

		const threadID =
			String(event.threadID);

		const oldMessages =
			getConversation(threadID);

		try {

			const messages = [
				{
					role: "system",
					content:
						"You are Bassit AI, an advanced helpful assistant. " +
						"Answer clearly and accurately. " +
						"Help with programming, GoatBot commands, explanations, " +
						"writing, translation and general questions. " +
						"Use English unless the user speaks another language."
				},

				...oldMessages,

				{
					role: "user",
					content: prompt
				}
			];

			const response =
				await client.responses.create({
					model: "gpt-5.6-sol",
					input: messages,
					max_output_tokens: 4000
				});

			const answer =
				cleanText(
					response.output_text
				);

			if (!answer) {
				return message.reply(
					"❌ The AI returned an empty response."
				);
			}

			// Save conversation
			saveConversation(
				threadID,
				[
					...oldMessages,
					{
						role: "user",
						content: prompt
					},
					{
						role: "assistant",
						content: answer
					}
				]
			);

			return message.reply(
				`🤖 𝘽𝙖𝙨𝙨𝙞𝙩 𝘼𝙄\n\n${answer}`,
				(error, info) => {

					if (error || !info?.messageID)
						return;

					if (
						!global.GoatBot ||
						!global.GoatBot.onReply
					) {
						return;
					}

					global.GoatBot.onReply.set(
						info.messageID,
						{
							commandName: "chatgpt",
							author:
								event.senderID,
							threadID,
							prompt
						}
					);
				}
			);

		} catch (error) {

			console.error(
				"[CHATGPT ERROR]",
				error?.response?.data ||
				error?.message ||
				error
			);

			return message.reply(
				"❌ 𝘾𝙝𝙖𝙩𝙂𝙋𝙏 𝙘𝙤𝙪𝙡𝙙 𝙣𝙤𝙩 𝙖𝙣𝙨𝙬𝙚𝙧.\n\n" +
				"𝘾𝙝𝙚𝙘𝙠 𝙮𝙤𝙪𝙧 𝘼𝙋𝙄 𝙠𝙚𝙮 𝙖𝙣𝙙 𝘼𝙋𝙄 𝙖𝙘𝙘𝙤𝙪𝙣𝙩."
			);
		}
	},

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

		if (!process.env.OPENAI_API_KEY)
			return;

		const prompt =
			cleanText(event.body);

		if (!prompt)
			return;

		const threadID =
			String(event.threadID);

		try {

			const oldMessages =
				getConversation(threadID);

			const messages = [
				{
					role: "system",
					content:
						"You are Bassit AI, an advanced helpful assistant. " +
						"Continue the conversation naturally. " +
						"Give accurate and useful answers."
				},

				...oldMessages,

				{
					role: "user",
					content: prompt
				}
			];

			const response =
				await client.responses.create({
					model: "gpt-5.6-sol",
					input: messages,
					max_output_tokens: 4000
				});

			const answer =
				cleanText(
					response.output_text
				);

			if (!answer)
				return;

			saveConversation(
				threadID,
				[
					...oldMessages,
					{
						role: "user",
						content: prompt
					},
					{
						role: "assistant",
						content: answer
					}
				]
			);

			return message.reply(
				`🤖 𝘽𝙖𝙨𝙨𝙞𝙩 𝘼𝙄\n\n${answer}`,
				(error, info) => {

					if (
						error ||
						!info?.messageID
					) {
						return;
					}

					global.GoatBot.onReply.set(
						info.messageID,
						{
							commandName:
								"chatgpt",
							author:
								event.senderID,
							threadID
						}
					);
				}
			);

		} catch (error) {

			console.error(
				"[CHATGPT REPLY ERROR]",
				error?.response?.data ||
				error?.message ||
				error
			);

			return message.reply(
				"❌ 𝘼𝙄 𝙚𝙧𝙧𝙤𝙧 𝙤𝙘𝙘𝙪𝙧𝙧𝙚𝙙."
			);
		}
	}
};
