from telegram.ext import Updater
from bot.config import BOT_TOKEN
from bot.handlers import start, send_posts

def main():
    updater = Updater(BOT_TOKEN, use_context=True)
    dp = updater.dispatcher

    # Command handlers
    dp.add_handler(CommandHandler("start", start))
    dp.add_handler(CommandHandler("get_posts", send_posts))

    updater.start_polling()
    updater.idle()

if __name__ == '__main__':
    main()
