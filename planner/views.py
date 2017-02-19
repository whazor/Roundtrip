
import urllib
from copy import copy
from itertools import permutations

from typing import Union

from urllib.request import urlopen

import moment
from django.http import JsonResponse
from django.shortcuts import render
from django.views.decorators.csrf import ensure_csrf_cookie, csrf_exempt
from django.views.defaults import server_error
# from z3 import *
from splinter import Browser
from math import ceil

from planner.search import Searcher


@ensure_csrf_cookie
def index(request):
    return render(request, 'planner.html', {})


@csrf_exempt
def search(request):
    # parse all POST data
    print(request.POST)
    origin = request.POST['origin']
    locations = request.POST.getlist('locations[]')
    locations = [l for l in locations if l != ""]
    cities = {l: request.POST['cities[' + l + ']'] for l in locations}
    begin = request.POST['begin']
    end = request.POST['end']
    adults = request.POST['adults']
    min_trip = int(request.POST['min_days'])
    max_trip = 8
    # do not support more than 6 locations
    if len(locations) > 7:
        return server_error(request)

    # for storing the routes
    graph = dict()

    # hashing mechanism for dates
    def mhash(m):
        return m.strftime("%Y-%m-%d")

    # first find all possible connections between the locations
    s = Searcher()
    total = locations + [origin]
    routes = permutations(total, 2)
    for (fr, to) in routes:
        entries = list(s.months(fr, to, begin, adults)) + list((s.months(fr, to, end, adults)))
        for e in entries:
            graph[(fr, to, mhash(moment.date(e.date)))] = e.price

    # date init
    mb = moment.date(begin)
    me = moment.date(end)

    #  Find all prices or airbnb
    airbnbdata = dict()
    for (air, city) in cities.items():
        airbnbdata[city] = s.airbnb(air, city, adults)
    s.quit()

    #  calculate average price (with a factor of 4/5 for accuracy)
    def average_price_airbnb(c):
        return ceil(airbnbdata[c]['metadata']['price_histogram']['average_price'] * 4/5)

    prices = {c: average_price_airbnb(c) for air, c in cities.items()}

    # airbnb prices for a given path
    def price(path):
        rooms = 0
        for i, (f1, t1, d1) in enumerate(path[0:-1]):
            (f2, t2, d2) = path[i+1]
            rooms += (abs(moment.date(d1).add(hours=5).diff(moment.date(d2).add(hours=5)).days) - 1) * prices[cities[t1]]

        return flightPrice(path) + rooms

    # price of flight for a given path
    def flightPrice(path):
        return sum([graph[i] for i in path])

    # abstract function for finding best option in array via function find
    def opt(array, find):
        min_path = 10000000000000
        best_path = False

        for a in array:
            p = find(*a)
            if p:
                pr = price(p)
                if pr < min_path:
                    best_path = p
                    min_path = pr
        return best_path

    # calculate how many days the trip can last at most
    total_max_trip = abs(mb.diff(me).days)

    # this function limits the amount of possibilities of being checked
    def max_length(x):
        return min(x, ceil(total_max_trip / min_trip))

    # motherload function which finds all possible routes
    def recursion(path=tuple(), options=set(locations), date=mb) -> Union[bool, set]:
        # last edge in path
        if len(path) > 0:
            start = path[-1][1]
        else:
            start = origin

        # if the path is not complete, recursively search all flights
        if len(path) < len(locations):
            array = []
            # check all options where we can go since latest path
            for towards in options:
                edge = (start, towards, mhash(date))
                if edge in graph:
                    # for the next stop recursively try all dates
                    for dur in range(min_trip - 1, max_length(abs(date.diff(me).days)) + 1):
                        s = copy(options)
                        s.remove(towards)
                        nd = copy(date).add(days=dur)
                        if nd <= me:
                            array.append([path + (edge,), s, nd])
            return opt(array, recursion)
        # otherwise try to go back to origin
        else:
            # if date.diff(me) > 0:
            #     return False
            towards = origin
            edge = (start, towards, mhash(date))
            if edge in graph:
                return path + (edge,)
            else:
                return False

    # start of recursion, try out all dates.. later then given start date might be cheaper
    array = [[tuple(), set(locations), copy(mb).add(days=i)] for i in range(abs(mb.diff(me).days) + 1)]
    route = opt(array, recursion)
    # bring result to browser
    if route:
        return JsonResponse({
            "price": flightPrice(route),
            "route": [{
                          "from": edge[0],
                          "to": edge[1],
                          "date": edge[2],
                          "price": graph[edge],
                          "url": "https://www.google.nl/flights/#search;f=" + edge[0] + ";t=" + edge[1] + ";d=" + edge[
                              2] + ";tt=o;ti=t0800-2000;px=" + adults + ";s=0"
                      } for edge in sorted(route, key=lambda x: x[2])],
            "cities": [{
                "name": city,
                "price": average_price_airbnb(city)
            } for air, city in cities.items()

            ]
        })
    else:
        return JsonResponse({'error': "Could not find a route"})
