// // bot.js
// require('dotenv').config();
// const TelegramBot = require('node-telegram-bot-api');
// const axios = require('axios');

// // Replace with your own bot token
// const token = process.env.TELEGRAM_BOT_TOKEN;
// const bot = new TelegramBot(token, { polling: true });

// // Command handler for /start
// bot.onText(/\/start/, (msg) => {
//   const chatId = msg.chat.id;
//   bot.sendMessage(chatId, 'Hello! I will provide you with the latest poker freeroll passwords.');
// });

// // Command handler for /get_posts
// bot.onText(/\/get_posts/, async (msg) => {
//   const chatId = msg.chat.id;
  
//   try {
//     const posts = await getLatestPosts();
//     if (posts.length > 0) {
//       posts.forEach(post => bot.sendMessage(chatId, post));
//     } else {
//       bot.sendMessage(chatId, 'No posts found.');
//     }
//   } catch (error) {
//     bot.sendMessage(chatId, 'Error fetching posts.');
//   }
// });

// // Function to fetch the latest posts
// async function getLatestPosts() {
//   const url = 'https://www.uapoker.info/paroli-na-frirolly-pokerstars';
//   try {
//     const response = await axios.get(url);
//     const html = response.data;
//     const posts = parseHtmlForPosts(html); // Implement this function based on your HTML structure
//     return posts;
//   } catch (error) {
//     console.error('Error fetching posts:', error);
//     return [];
//   }
// }

// // Function to parse HTML and extract posts (customize based on actual HTML structure)
// function parseHtmlForPosts(html) {
//   const posts = [];
//   // Example parsing code (adjust to your HTML structure)
//   const regex = /<tr>.*?<td>(.*?)<\/td>.*?<td>(.*?)<\/td>.*?<td>(.*?)<\/td>/gs;
//   let match;
//   while ((match = regex.exec(html)) !== null) {
//     const [, tourId, name, password] = match;
//     posts.push(`Tour ID: ${tourId}\nName: ${name}\nPassword: ${password}`);
//   }
//   return posts;
// }

// console.log('Bot is running...');



//--------------------------------- NEW

require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const cheerio = require('cheerio');

// Initialize the bot
const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

// Command handler for /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Hello! Use /get_posts to get the latest poker freeroll passwords.');
});

// Command handler for /get_posts
bot.onText(/\/get_posts/, async (msg) => {
  const chatId = msg.chat.id;

  try {
    const posts = await getLatestPosts();
    if (posts.length > 0) {
      posts.forEach(post => bot.sendMessage(chatId, post));
    } else {
      bot.sendMessage(chatId, 'No posts found.');
    }
  } catch (error) {
    bot.sendMessage(chatId, 'Error fetching posts.');
  }
});

// Function to fetch and parse the latest posts
async function getLatestPosts() {
  const url = 'https://www.uapoker.info/paroli-na-frirolly-pokerstars';

  try {
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);

    const posts = [];

    $('.view-content .nodepass').each((index, element) => {
      const title = $(element).find('.h2div.title a').text().trim();
      const date = $(element).find('.submitted').text().trim();
      const time = $(element).find('.field-field-time').text().trim();
      const prize = $(element).find('.field-field-buyin:contains("Призы:")').text().replace('Призы:', '').trim();
      const name = $(element).find('.field-field-buyin:contains("Название турнира:")').text().replace('Название турнира:', '').trim();
      const id = $(element).find('.field-field-buyin:contains("ID:")').text().replace('ID:', '').trim();
      const buyin = $(element).find('.field-field-buyin:contains("Бай-ин:")').text().replace('Бай-ин:', '').trim();
      const password = $(element).find('.field-field-buyin.field-password').text().replace('Пароль:', '').trim();

      posts.push(`Title: ${title}\nDate: ${date}\nTime: ${time}\nPrize: ${prize}\nName: ${name}\nID: ${id}\nBuy-in: ${buyin}\nPassword: ${password}`);
    });

    return posts;

  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
}

console.log('Bot is running...');

