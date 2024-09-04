from apscheduler.schedulers.blocking import BlockingScheduler
from bot.scraper import get_latest_posts
from telegram import Bot
from bot.config import BOT_TOKEN, CHAT_ID

bot = Bot(token=BOT_TOKEN)

def scheduled_job():
    posts = get_latest_posts()
    if posts:
        for post in posts:
            bot.send_message(chat_id=CHAT_ID, text=post)

scheduler = BlockingScheduler()
scheduler.add_job(scheduled_job, 'interval', minutes=30)
scheduler.start()
