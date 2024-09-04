
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

// Command handler for /help
bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Hello! Use /get_posts to get the latest poker freeroll passwords.');
});

// Command handler for /get_posts
bot.onText(/\/get_posts/, async (msg) => {
  const chatId = msg.chat.id;

  try {
    const posts = await getLatestPosts();
    if (posts.length > 0) {
      for (const post of posts) {
        await bot.sendMessage(chatId, post);
      }
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
      if (posts.length == 2) return posts;
      console.log(index)

      const title = $(element).find('.h2div.title a').text().trim() || '[Not Provided]';
      const date = $(element).find('.submitted').text().trim() || '[Not Provided]';
      const prize = $(element).find('.field-field-buyin:contains("Призы:")').text().replace('Призы:', '').trim() || '[Not Provided]';
      const name = $(element).find('.field-field-buyin:contains("Название турнира:")').text().replace('Название турнира:', '').trim() || '[Not Provided]';
      const id = $(element).find('.field-field-buyin:contains("ID:")').text().replace('ID:', '').trim() || '[Not Provided]';
      const buyin = $(element).find('.field-field-buyin:contains("Бай-ин:")').text().replace('Бай-ин:', '').trim() || '[Not Provided]';
      
      // Extract time, filtering out unwanted whitespace and non-text nodes
      const timeElement = $(element).find('.field-field-time');
      const time = timeElement.contents().filter(function() {
        return this.nodeType === 3; // Node.TEXT_NODE
      }).text().trim() || '[Not Provided]';
      // Extract the text from the field-password element by filtering out unwanted whitespace
      const passwordElement = $(element).find('.field-field-buyin.field-password');
      const password = passwordElement.contents().filter(function() {
        return this.nodeType === 3; // Node.TEXT_NODE
      }).text().trim() || '[Not Provided]';

      posts.push(
        `Title: ${title}\n` +
        `Date: ${date}\n` +
        `Time: ${time}\n` +
        `Prize: ${prize}\n` +
        `Name: ${name}\n` +
        `ID: ${id}\n` +
        `Buy-in: ${buyin}\n` +
        `Password: ${password}`
      );
    });

    return posts;

  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
}

console.log('Bot is running...');

