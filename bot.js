require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const cheerio = require('cheerio');
const cron = require('node-cron');

// Initialize the bot
const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

// Store chatId for sending updates
let chatId = null;
const seenPosts = new Map(); // Use Map to keep track of posts with insertion order

// Command handler for /start
bot.onText(/\/start/, (msg) => {
  chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Hello! Use /get_posts to get the latest poker freeroll passwords.');
});

// Command handler for /help
bot.onText(/\/help/, (msg) => {
  chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Hello! Use /get_posts to get the latest poker freeroll passwords.');
});

// Command handler for /get_posts
bot.onText(/\/get_posts/, async (msg) => {
  chatId = msg.chat.id;

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
      if (index >= 3) return false; // Break the loop when 3 posts are added

      const title = $(element).find('.h2div.title a').text().trim() || '[Not Provided]';
      const date = $(element).find('.submitted').text().trim() || '[Not Provided]';
      const prize = $(element).find('.field-field-buyin:contains("Призы:")').text().replace('Призы:', '').trim() || '[Not Provided]';
      const name = $(element).find('.field-field-buyin:contains("Название турнира:")').text().replace('Название турнира:', '').trim() || '[Not Provided]';
      const id = $(element).find('.field-field-buyin:contains("ID:")').text().replace('ID:', '').trim() || '[Not Provided]';
      const buyin = $(element).find('.field-field-buyin:contains("Бай-ин:")').text().replace('Бай-ин:', '').trim() || '[Not Provided]';

      const timeElement = $(element).find('.field-field-time');
      const time = timeElement.contents().filter(function() {
        return this.nodeType === 3; // Node.TEXT_NODE
      }).text().trim() || '[Not Provided]';

      const passwordElement = $(element).find('.field-field-buyin.field-password');
      const password = passwordElement.contents().filter(function() {
        return this.nodeType === 3; // Node.TEXT_NODE
      }).text().trim() || '[Not Provided]';

      const postString = `Title: ${title}\nDate: ${date}\nTime: ${time}\nPrize: ${prize}\nName: ${name}\nID: ${id}\nBuy-in: ${buyin}\nPassword: ${password}`;

      posts.push(postString);
    });

    // Reverse the posts before returning
    return posts.reverse();
  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
}

// Function to fetch and parse the latest posts
async function getUnseenLatestPost() {
  const url = 'https://www.uapoker.info/paroli-na-frirolly-pokerstars';

  try {
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);

    const posts = [];

    $('.view-content .nodepass').each((index, element) => {
      if (index >= 3) return false; // Break the loop when 3 posts are added

      const title = $(element).find('.h2div.title a').text().trim() || '[Not Provided]';
      const date = $(element).find('.submitted').text().trim() || '[Not Provided]';
      const prize = $(element).find('.field-field-buyin:contains("Призы:")').text().replace('Призы:', '').trim() || '[Not Provided]';
      const name = $(element).find('.field-field-buyin:contains("Название турнира:")').text().replace('Название турнира:', '').trim() || '[Not Provided]';
      const id = $(element).find('.field-field-buyin:contains("ID:")').text().replace('ID:', '').trim() || '[Not Provided]';
      const buyin = $(element).find('.field-field-buyin:contains("Бай-ин:")').text().replace('Бай-ин:', '').trim() || '[Not Provided]';

      const timeElement = $(element).find('.field-field-time');
      const time = timeElement.contents().filter(function() {
        return this.nodeType === 3; // Node.TEXT_NODE
      }).text().trim() || '[Not Provided]';

      const passwordElement = $(element).find('.field-field-buyin.field-password');
      const password = passwordElement.contents().filter(function() {
        return this.nodeType === 3; // Node.TEXT_NODE
      }).text().trim() || '[Not Provided]';

      const postString = `Title: ${title}\nDate: ${date}\nTime: ${time}\nPrize: ${prize}\nName: ${name}\nID: ${id}\nBuy-in: ${buyin}\nPassword: ${password}`;
      // Only push new posts
      if (!seenPosts.has(postString)) {
        seenPosts.set(postString, true);

        // Remove the oldest post if there are more than 4
        if (seenPosts.size > 4) {
          // Map maintains insertion order, so we can get the first key
          const oldestPost = seenPosts.keys().next().value;
          seenPosts.delete(oldestPost);
        }

        posts.push(postString);
      }
    });

    // Reverse the posts before returning
    return posts.reverse();
  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
}

// Schedule task to run every 30 minutes
cron.schedule('*/20 12-23 * * *', async () => {
  if (chatId) {
    try {
      const posts = await getUnseenLatestPost();
      if (posts.length > 0) {
        for (const post of posts) {
          await bot.sendMessage(chatId, post);
        }
      }
    } catch (error) {
      console.error('Error sending posts:', error);
    }
  }
});

console.log('Bot is running...');
