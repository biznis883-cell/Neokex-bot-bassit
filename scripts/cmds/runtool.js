const { execFile } = require("child_process");

module.exports = {
  config: {
    name: "runtool",
    aliases: ["tool"],
    version: "1.0.0",
    author: "Bassit",
    countDown: 10,
    role: 2,
    shortDescription: "Run my local tool",
    longDescription: "Run an approved local Python tool and return its output",
    category: "system"
  },

  onStart: async function ({ message, args }) {
    const script = "/data/data/com.termux/files/home/mytool/tool.py";

    execFile(
      "python",
      [script, ...args],
      {
        timeout: 60000,
        maxBuffer: 1024 * 1024
      },
      (error, stdout, stderr) => {
        if (error) {
          return message.reply(
            "❌ Tool error:\n\n" +
            (stderr || error.message).slice(0, 5000)
          );
        }

        const output = (stdout || "No output").trim();

        message.reply(
          "✅ Tool finished:\n\n" +
          output.slice(0, 5000)
        );
      }
    );
  }
};
