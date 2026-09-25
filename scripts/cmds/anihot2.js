const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");

module.exports = {
  config: {
    name: "anihot2",
    version: "1.0",
    author: "Bassit",
    countDown: 5,
    role: 0,
    category: "fun",
    guide: {
      en: "Reply to someone's message and type: anihot2"
    }
  },

  onStart: async function ({ message, event, usersData }) {

    // لازم Reply على شخص
    if (!event.messageReply) {
      return message.reply(
        "❌ Reply to someone's message first.\n\n" +
        "Example:\n" +
        "anihot2"
      );
    }

    const targetID = event.messageReply.senderID;
    const myID = event.senderID;

    // الصورة الأصلية من Postimages
    const templateURL =
      "https://i.postimg.cc/YMdLwPm1/Screenshot-20260925-144149.jpg";

    const cacheDir = path.join(__dirname, "cache");
    await fs.ensureDir(cacheDir);

    const templatePath = path.join(
      cacheDir,
      "anihot2-template.jpg"
    );

    const myAvatarPath = path.join(
      cacheDir,
      `anihot2-my-${myID}.jpg`
    );

    const targetAvatarPath = path.join(
      cacheDir,
      `anihot2-target-${targetID}.jpg`
    );

    const outputPath = path.join(
      cacheDir,
      "anihot2-result.jpg"
    );

    try {

      // تحميل الصورة الأساسية
      const templateResponse = await axios.get(
        templateURL,
        {
          responseType: "arraybuffer"
        }
      );

      await fs.writeFile(
        templatePath,
        templateResponse.data
      );

      // جلب صور البروفايل
      const myAvatarURL =
        await usersData.getAvatarUrl(myID);

      const targetAvatarURL =
        await usersData.getAvatarUrl(targetID);

      if (!myAvatarURL || !targetAvatarURL) {
        return message.reply(
          "❌ Couldn't get the profile pictures."
        );
      }

      // تحميل صور البروفايل
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

      // إنشاء Canvas بنفس حجم الصورة
      const canvas =
        createCanvas(
          base.width,
          base.height
        );

      const ctx =
        canvas.getContext("2d");

      // رسم الصورة الأصلية
      ctx.drawImage(
        base,
        0,
        0
      );

      /*
       * صورة الشخص اللي رديتي عليه
       * فوق رأس الشخصية اليسرى
       */
      drawProfile(
        ctx,
        targetPhoto,
        235,
        100,
        125
      );

      /*
       * صورتك الشخصية
       * فوق رأس الشخصية اليمنى
       */
      drawProfile(
        ctx,
        myPhoto,
        850,
        80,
        125
      );

      // تحويل الصورة
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

      // إرسال النتيجة
      return message.reply({
        attachment:
          fs.createReadStream(outputPath)
      });

    } catch (error) {

      console.error(
        "ANihot2 Error:",
        error
      );

      return message.reply(
        "❌ An error occurred while creating the image."
      );
    }
  }
};


// =====================================
// رسم صورة البروفايل بشكل دائري
// =====================================

function drawProfile(
  ctx,
  image,
  x,
  y,
  size
) {

  ctx.save();

  // الدائرة
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

  // تكبير/تصغير الصورة
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
