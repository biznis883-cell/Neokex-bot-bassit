const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");

module.exports = {
  config: {
    name: "anihot1",
    version: "1.0",
    author: "Bassit",
    countDown: 5,
    role: 0,
    category: "fun"
  },

  onStart: async function ({ message, event, usersData }) {
    // لازم تكون راد على رسالة شخص
    if (!event.messageReply) {
      return message.reply(
        "❌ Reply to someone's message first.\n\nExample:\nanihot1"
      );
    }

    const targetID = event.messageReply.senderID;
    const myID = event.senderID;

    const templateURL =
      "https://i.postimg.cc/k7VGPgCd/Screenshot-20260925-144204.jpg";

    const cacheDir = path.join(__dirname, "cache");
    await fs.ensureDir(cacheDir);

    const templatePath = path.join(cacheDir, "anihot1-template.jpg");
    const myAvatarPath = path.join(cacheDir, `anihot1-my-${myID}.jpg`);
    const targetAvatarPath = path.join(
      cacheDir,
      `anihot1-target-${targetID}.jpg`
    );
    const outputPath = path.join(cacheDir, "anihot1-result.jpg");

    try {
      // تحميل الصورة الأساسية من Postimages
      const template = await axios.get(templateURL, {
        responseType: "arraybuffer"
      });

      await fs.writeFile(templatePath, template.data);

      // جلب صور البروفايل
      const myAvatarURL = await usersData.getAvatarUrl(myID);
      const targetAvatarURL = await usersData.getAvatarUrl(targetID);

      if (!myAvatarURL || !targetAvatarURL) {
        return message.reply("❌ Couldn't get the profile pictures.");
      }

      const [myAvatar, targetAvatar] = await Promise.all([
        axios.get(myAvatarURL, { responseType: "arraybuffer" }),
        axios.get(targetAvatarURL, { responseType: "arraybuffer" })
      ]);

      await fs.writeFile(myAvatarPath, myAvatar.data);
      await fs.writeFile(targetAvatarPath, targetAvatar.data);

      // فتح الصور
      const base = await loadImage(templatePath);
      const me = await loadImage(myAvatarPath);
      const target = await loadImage(targetAvatarPath);

      const canvas = createCanvas(base.width, base.height);
      const ctx = canvas.getContext("2d");

      // الصورة الأصلية
      ctx.drawImage(base, 0, 0);

      /*
       * أماكن صور البروفايل
       *
       * صورة العضو = فوق رأس الفتاة
       * صورة المرسل = فوق رأس الولد
       */

      const targetSize = 115;
      const mySize = 115;

      // صورة العضو فوق الفتاة
      drawCircleImage(
        ctx,
        target,
        390,
        205,
        targetSize
      );

      // صورتك فوق الولد
      drawCircleImage(
        ctx,
        me,
        935,
        175,
        mySize
      );

      // حفظ النتيجة
      const buffer = canvas.toBuffer("image/jpeg", {
        quality: 0.95
      });

      await fs.writeFile(outputPath, buffer);

      return message.reply({
        attachment: fs.createReadStream(outputPath)
      });

    } catch (error) {
      console.error(error);

      return message.reply(
        "❌ An error occurred while creating the image."
      );
    }
  }
};


// رسم صورة بروفايل دائرية
function drawCircleImage(ctx, image, x, y, size) {
  ctx.save();

  ctx.beginPath();
  ctx.arc(
    x + size / 2,
    y + size / 2,
    size / 2,
    0,
    Math.PI * 2
  );
  ctx.closePath();
  ctx.clip();

  // قص الصورة بشكل مربع ثم داخل الدائرة
  const scale = Math.max(
    size / image.width,
    size / image.height
  );

  const width = image.width * scale;
  const height = image.height * scale;

  const dx = x + (size - width) / 2;
  const dy = y + (size - height) / 2;

  ctx.drawImage(
    image,
    dx,
    dy,
    width,
    height
  );

  ctx.restore();

  // إطار أبيض خفيف
  ctx.save();

  ctx.beginPath();
  ctx.arc(
    x + size / 2,
    y + size / 2,
    size / 2,
    0,
    Math.PI * 2
  );

  ctx.lineWidth = 5;
  ctx.strokeStyle = "#ffffff";
  ctx.stroke();

  ctx.restore();
}
