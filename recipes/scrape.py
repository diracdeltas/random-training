from recipe_scrapers import scrape_me
import random
import time
import json


n = 1276


def try_scrape():
    global n
    url = 'https://www.allrecipes.com/recipe/' + str(random.randint(10000, 247478))
    scraper = scrape_me(url)
    try:
        title = scraper.title()
    except NotImplementedError:
        return
    if 'Johnsonville' in title:
        return
    print(title)
    result = {
        "instructions": scraper.instructions(),
        "ingredients": scraper.ingredients(),
        "title": title,
        "image": scraper.image()
    }
    json_object = json.dumps(result, indent=2)
    with open(str(n) + '.json', 'w') as outfile:
        outfile.write(json_object)
    n = n + 1


while n < 10000:
    try_scrape()
    time.sleep(1)
