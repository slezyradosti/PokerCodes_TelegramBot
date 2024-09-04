import requests
from bs4 import BeautifulSoup

def get_latest_posts():
    url = "https://www.uapoker.info/paroli-na-frirolly-pokerstars"
    response = requests.get(url)
    soup = BeautifulSoup(response.content, 'html.parser')

    posts = []
    for row in soup.select('table tr'):
        columns = row.find_all('td')
        if len(columns) >= 3:
            tour_id = columns[0].text.strip()
            name = columns[1].text.strip()
            password = columns[2].text.strip()

            post = f"Tour ID: {tour_id}\nName: {name}\nPassword: {password}"
            posts.append(post)
    
    return posts
