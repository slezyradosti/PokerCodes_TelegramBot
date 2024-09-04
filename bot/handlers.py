from telegram import Update
from telegram.ext import CallbackContext
from bot.scraper import get_latest_posts

def start(update: Update, context: CallbackContext):
    update.message.reply_text("Hello! I will provide you with the latest poker freeroll passwords.")

def send_posts(update: Update, context: CallbackContext):
    posts = get_latest_posts()
    if posts:
        for post in posts:
            update.message.reply_text(post)
    else:
        update.message.reply_text("No posts found.")
