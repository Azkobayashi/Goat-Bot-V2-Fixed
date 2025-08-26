const axios = require("axios");
const fs = require("fs");
const path = require("path");

// Ensure cache folder exists
const cacheDir = path.join(__dirname, "cache");
if (!fs.existsSync(cacheDir)) {
  fs.mkdirSync(cacheDir, { recursive: true });
}

module.exports = {
  config: {
    name: "aipic",
    aliases: ["aiimage", "aigenpic", "aidraw"],
    version: "1.1",
    author: "eran_hossain",
    countDown: 10,
    role: 0,
    shortDescription: "Generate AI images",
    longDescription: "Generate pictures from text using an AI image generator.",
    category: "ai",
    guide: "{pn} [your prompt]\n\nExample:\n{pn} a cyberpunk city at night"
  },

  onStart: async function ({ message, args }) {
    const prompt = args.join(" ");
    if (!prompt) {
      return message.reply("⚠️ Please provide a description.\nExample: aipic a cute cat astronaut");
    }

    try {
      await message.reply("⏳ Generating your AI image... Please wait.");

      // Free AI image API (Pollinations)
      const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`;

      // File path
      const imgPath = path.join(cacheDir, `aipic_${Date.now()}.jpg`);

      const response = await axios({
        url,
        method: "GET",
        responseType: "stream",
        timeout: 60000 // 60s timeout
      });

      const writer = fs.createWriteStream(imgPath);
      response.data.pipe(writer);

      writer.on("finish", () => {
        message.reply(
          {
            body: `✨ AI Image Generated!\n📌 Prompt: "${prompt}"`,
            attachment: fs.createReadStream(imgPath)
          },
          () => {
            if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
          }
        );
      });

      writer.on("error", () => {
        if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
        message.reply("❌ Failed while saving the image.");
      });

    } catch (err) {
      console.error("AI Image Error:", err.message || err);
      message.reply("❌ Failed to generate image. Please try again later.");
    }
  }
};
