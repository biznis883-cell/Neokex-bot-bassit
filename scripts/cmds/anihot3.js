const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");

module.exports = {
  config: {
    name: "anihot3",
    version: "1.0",
    author: "Bassit",
    countDown: 5,
    role: 0,
    category: "fun",
    guide: {
      en: "Reply to someone's message and type: anihot3"
    }
  },

  onStart: async function ({ message, event, usersData }) {

    // لازم تكون راد على رسالة شخص
    if (!event.messageReply) {
      return message.reply(
        "❌ Reply to someone's message first.\n\n" +
        "Example:\nanihot3"
      );
    }

    const targetID = event.messageReply.senderID;
    const myID = event.senderID;

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
      `anihot3-my-${myID}.jpg`
    );

    const targetAvatarPath = path.join(
      cacheDir,
      `anihot3-target-${targetID}.jpg`
    );

    const outputPath = path.join(
      cacheDir,
      "anihot3-result.jpg"
    );

    try {

      // تحميل الصورة الأساسية
      const template = await axios.get(
        templateURL,
        {
          responseType: "arraybuffer"
        }
      );

      await fs.writeFile(
        templatePath,
        template.data
      );

      // صور البروفايل
      const myAvatarURL =
        await usersData.getAvatarUrl(myID);

      const targetAvatarURL =
        await usersData.getAvatarUrl(targetID);

      if (!myAvatarURL || !targetAvatarURL) {
        return message.reply(
          "❌ Couldn't get the profile pictures."
        );
      }

      // تحميل الصورتين
      const [myAvatar, targetAvatar] =
        await Promise.all([
          axios.get(myAvatarURL, {
            responseType: "arraybuffer"
          }),

          axios.get(targetAvatarURL, {
            responseType: "arraybuffer"
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

      // فتح الصور
      const base =
        await loadImage(templatePath);

      const myPhoto =
        await loadImage(myAvatarPath);

      const targetPhoto =
        await loadImage(targetAvatarPath);

      // إنشاء الصورة
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
        0
      );

      /*
       * صورة الشخص الذي رديتي عليه
       * فوق الشخصية الأولى
       */
      drawProfile(
        ctx,
        targetPhoto,
        300,
        90,
        120
      );

      /*
       * صورتك الشخصية
       * فوق الشخصية الثانية
       */
      drawProfile(
        ctx,
        myPhoto,
        850,
        80,
        120
      );

      // حفظ النتيجة
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
        "anihot3 error:",
        error
      );

      return message.reply(
        "❌ An error occurred while creating the image."
      );
    }
  }
};


// ================================
// رسم صورة البروفايل
// ================================

function drawProfile(
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

  // ضبط حجم الصورة
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

  ctx.lineWidth = 5;
  ctx.strokeStyle = "#ffffff";
  ctx.stroke();

  ctx.restore();
}
