import time

import moment
from splinter import Browser

from planner.models import Flight, FlightPrice, NoFlights
from planner.models import AirBNB

from urllib.parse import quote_plus
from math import ceil
import json

class Searcher:
    _browser = None

    def browser(self):
        if self._browser is None:
            self._browser = Browser("chrome")
        return self._browser

    def quit(self):
        if self._browser is not None:
            self._browser.quit()

    def airbnb(self, air, city, adults):
        def airbnburl(l):
            loc = quote_plus(l)
            return "https://api.airbnb.com/v2/search_results?" \
                   "client_id=3092nxybyb0otqw18e8nh5nty&locale=en-US&currency=EUR&_format=for_search_results&_limit=20&" \
                   "_offset=0&fetch_facets=true&guests=" + str(
                adults) + "&ib=false&ib_add_photo_flow=true&location=" + loc + "&min_bathrooms=0&" \
                                                                               "min_bedrooms=" + str(
                ceil(int(adults) / 2)) + "&min_beds=" + str(adults) + "&min_num_pic_urls=10&" \
                                                                      "price_max=210&price_min=30&sort=1&user_lat=52.370216&user_lng=4.895168"

        airbnbdata = dict()

        air, created = AirBNB.objects.get_or_create(
            city=city,
            airports=air,
            adults=adults
        )
        if created:
            browser = self.browser()
            browser.visit(airbnburl(city))
            air.data = browser.find_by_tag("pre").first.text
            air.save()

        return json.loads(air.data)

    def months(self, origin, destination, date, adults):
        if len(NoFlights.objects.filter(origin=origin, destination=destination)) > 0:
            return []
        entries = FlightPrice.objects.filter(
            origin=origin,
            destination=destination,
            date__year=moment.date(date).year,
            date__month=moment.date(date).month,
            adults=adults)
        if len(entries) == 0:
            browser = self.browser()
            browser.visit(
                'https://www.google.nl/flights/#search;f=' + origin + ';t=' + destination
                + ';d=' + date + ';tt=o;ti=t0800-2000;px=' + adults+";s=0")
            el = browser.find_by_css('.OMOBOQD-G-q')
            el.first.click()
            time.sleep(3)
            table = browser.find_by_css('.OMOBOQD-p-j').first
            trs = [tr for tr in table.find_by_css('tr')][1:6]
            count = 0
            for tr in trs:
                for td in tr.find_by_css('td'):
                    sp = td.text.split("\n")
                    if len(sp) == 2:
                        day = sp[0]
                        price = sp[1]
                        price = int(price.strip('€ ').replace('.', ''))
                        fdate = moment.date(date).replace(days=int(day)).strftime("%Y-%m-%d")

                        fp = FlightPrice(origin=origin, destination=destination, date=fdate, adults=adults, price=price)
                        fp.save()
                        count += 1

            fdate = moment.date(date).replace(days=1).add(months=1)
            table = browser.find_by_css('.OMOBOQD-p-o').first
            trs = [tr for tr in table.find_by_css('tr')][1:6]
            for tr in trs:
                for td in tr.find_by_css('td'):
                    sp = td.text.split("\n")
                    if len(sp) == 2:
                        day = sp[0]
                        price = sp[1]
                        price = int(price.strip('€ ').replace('.', ''))
                        fdate = moment.date(fdate).replace(days=int(day)).strftime("%Y-%m-%d")

                        fp = FlightPrice(origin=origin, destination=destination, date=fdate, adults=adults, price=price)
                        fp.save()
                        count += 1
            if count == 0:
                NoFlights(origin=origin, destination=destination).save()
            entries = FlightPrice.objects.filter(origin=origin, destination=destination, date=date, adults=adults)
        return entries
    #
    # def flight(self, origin, destination, date, adults):
    #     entries = Flight.objects.filter(origin=origin, destination=destination, date=date, adults=adults)
    #     flight = entries.first()
    #     if len(entries) == 0:
    #         browser = self.browser()
    #         browser.visit(
    #             'https://www.google.nl/flights/#search;f=' + origin + ';t=' + destination
    #             + ';d=' + date + ';tt=o;ti=t0800-2000;px=' + adults)
    #
    #         result = browser.find_by_css(".gwt-HTML a.EESPNGB-d-W.EESPNGB-d-s").first
    #         if result:
    #             url = result['href']
    #             data = result.text.split("\n")
    #             price = int(data[0].strip('€ '))
    #             time = data[2]
    #             company = data[3]
    #             duration = data[4]
    #             info = data[5]
    #             flight = Flight(
    #                 origin=origin,
    #                 destination=destination,
    #                 date=date, adults=adults,
    #                 price=price,
    #                 time=time,
    #                 company=company,
    #                 duration=duration,
    #                 info=info,
    #                 url=url
    #             )
    #             flight.save()
    #
    #         else:
    #             return None
    #     return flight
    #
