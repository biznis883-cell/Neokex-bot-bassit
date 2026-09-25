const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");

module.exports = {
  config: {
    name: "anihot3",
    version: "2.0",
    author: "Bassit",
    countDown: 5,
    role: 0,
    category: "fun",
    guide: {
      en: "Reply to someone's message and type anihot3"
    }
  },

  onStart: async function ({ message, event, usersData }) {
    if (!event.messageReply) {
      return message.reply(
        "❌ Reply to someone's message first.\n\nExample:\nanihot3"
      );
    }

    const myID = event.senderID;
    const targetID = event.messageReply.senderID;

    // الصورة الأصلية من Postimages
    const templateURL =
      "https://i.postimg.cc/k7jHK7Rx/Screenshot-20260925-144144.jpg";

    const cacheDir = path.join(__dirname, "cache");
    await fs.ensureDir(cacheDir);

    const templatePath = path.join(
      cacheDir,
      "anihot3-template.jpg"
    );

    const myAvatarPath = path.join(
      cacheDir,
      "anihot3-my.jpg"
    );

    const targetAvatarPath = path.join(
      cacheDir,
      "anihot3-target.jpg"
    );

    const outputPath = path.join(
      cacheDir,
      `anihot3-${Date.now()}.jpg`
    );

    try {

      // ==============================
      // تحميل الصورة الأصلية
      // ==============================

      const template = await axios.get(
        templateURL,
        {
          responseType: "arraybuffer",
          timeout: 30000
        }
      );

      await fs.writeFile(
        templatePath,
        template.data
      );

      // ==============================
      // جلب صور البروفايل
      // ==============================

      const myAvatarURL =
        await usersData.getAvatarUrl(myID);

      const targetAvatarURL =
        await usersData.getAvatarUrl(targetID);

      if (!myAvatarURL || !targetAvatarURL) {
        return message.reply(
          "❌ Couldn't get both profile pictures."
        );
      }

      // ==============================
      // تحميل الصورتين
      // ==============================

      const [myAvatar, targetAvatar] =
        await Promise.all([
          axios.get(myAvatarURL, {
            responseType: "arraybuffer",
            timeout: 30000
          }),

          axios.get(targetAvatarURL, {
            responseType: "arraybuffer",
            timeout: 30000
          })
        ]);

      await fs.writeFile(
        myAvatarPath,
        myAvatar.data
      );

      await fs.writeFile(
        targetAvatarPath,
        targetAvatar.data
      );

      // ==============================
      // فتح الصور
      // ==============================

      const base =
        await loadImage(templatePath);

      const myPhoto =
        await loadImage(myAvatarPath);

      const targetPhoto =
        await loadImage(targetAvatarPath);

      // ==============================
      // إنشاء Canvas
      // ==============================

      const canvas =
        createCanvas(
          base.width,
          base.height
        );

      const ctx =
        canvas.getContext("2d");

      // الصورة الأصلية
      ctx.drawImage(
        base,
        0,
        0,
        base.width,
        base.height
      );

      // =================================
      // 👦 الولد = صورتك أنت
      // =================================

      drawAvatar(
        ctx,
        myPhoto,

        760,
        55,
        220
      );

      // =================================
      // 👧 البنت = صورة العضو
      // =================================

      drawAvatar(
        ctx,
        targetPhoto,

        300,
        105,
        220
      );

      // ==============================
      // حفظ الصورة
      // ==============================

      const buffer =
        canvas.toBuffer(
          "image/jpeg",
          {
            quality: 0.95
          }
        );

      await fs.writeFile(
        outputPath,
        buffer
      );

      // إرسال الصورة
      return message.reply({
        attachment:
          fs.createReadStream(outputPath)
      });

    } catch (error) {

      console.error(
        "ANIHOT3 ERROR:",
        error
      );

      return message.reply(
        "❌ Failed to create the image."
      );
    }
  }
};


// =======================================
// رسم صورة البروفايل بشكل دائري
// =======================================

function drawAvatar(
  ctx,
  image,
  x,
  y,
  size
) {

  ctx.save();

  // قص الصورة إلى دائرة
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

  // جعل الصورة تغطي الدائرة كاملة
  const scale =
    Math.max(
      size / image.width,
      size / image.height
    );

  const width =
    image.width * scale;

  const height =
    image.height * scale;

  const dx =
    x + (size - width) / 2;

  const dy =
    y + (size - height) / 2;

  ctx.drawImage(
    image,
    dx,
    dy,
    width,
    height
  );

  ctx.restore();

  // إطار أبيض
  ctx.save();

  ctx.beginPath();

  ctx.arc(
    x + size / 2,
    y + size / 2,
    size / 2,
    0,
    Math.PI * 2
  );

  ctx.lineWidth = 7;
  ctx.strokeStyle = "#ffffff";

  ctx.stroke();

  ctx.restore();
}
