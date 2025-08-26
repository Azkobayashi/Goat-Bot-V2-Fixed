const axios = require("axios");

module.exports = {
  config: {
    name: "upscale",
    aliases: ["8k", "8hd", "8kupscale"],
    version: "1.6",
    role: 0, // anyone can use it now
    author: "Eran",
    countDown: 20,
    shortDescription: "📸 Upscale images to 4K or 8K",
    longDescription: "✨ Enhances and upscales an image to 4K or 8K resolution using an external API.",
    category: "image",
    guide: {
      en: "💡 {pn} [4k|8k] (reply to an image)"
    }
  },

  onStart: async function ({ message, event, args }) {
    try {
      // Validate replied image
      if (
        !event.messageReply ||
        !event.messageReply.attachments ||
        event.messageReply.attachments.length === 0 ||
        event.messageReply.attachments[0].type !== "photo"
      ) {
        return message.reply("⚠️ Please reply to a **valid image** 🖼️ to upscale it.");
      }

      // Check quality argument
      const quality = (args[0] || "4k").toLowerCase();
      if (!["4k", "8k"].includes(quality)) {
        return message.reply("⚠️ Invalid quality! Use `4k` or `8k` 🎯.");
      }

      const imgUrl = encodeURIComponent(event.messageReply.attachments[0].url);
      const apiDomain = "smfahim.xyz"; // Your API base domain
      const upscaleUrl = `https://${apiDomain}/${quality}?url=${imgUrl}`;

      // Notify processing
      const processingMsg = await message.reply(`⏳ Upscaling your image to **${quality.toUpperCase()}**... Please wait 🖌️`);

      // Call API
      const { data } = await axios.get(upscaleUrl);

      if (!data || !data.image) {
        return message.reply("❌ Failed to upscale image. API did not return an image 😔");
      }

      // Send upscaled image
      const attachment = await global.utils.getStreamFromURL(data.image, `${quality}-upscaled.png`);
      await message.reply({
        body: `✅ **Done!**\n📸 Here’s your **${quality.toUpperCase()}** upscaled image! 🏆`,
        attachment
      });

      // Remove "processing" message
      message.unsend(processingMsg.messageID);

    } catch (error) {
      console.error("❌ Upscale Error:", error.message);
      message.reply("💥 Oops! Something went wrong while upscaling your image. Please try again later 🚑");
    }
  }
};
