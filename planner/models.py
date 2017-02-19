from django.db import models

class NoFlights(models.Model):
    origin = models.CharField(max_length=100)
    destination = models.CharField(max_length=100)

    def __str__(self):
        return "from " + self.origin + " to " + self.destination

class FlightPrice(models.Model):
    origin = models.CharField(max_length=100)
    destination = models.CharField(max_length=100)
    adults = models.IntegerField()

    date = models.DateField()
    price = models.IntegerField()

    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return str(self.date) + " from "+ self.origin + " to " + self.destination + " for €" + str(self.price) + " with " + str(self.adults) + " people"

# Create your models here.
class Flight(models.Model):
    origin = models.CharField(max_length=3)
    destination = models.CharField(max_length=3)
    date = models.DateField()
    adults = models.IntegerField()

    # result
    updated_at = models.DateTimeField(auto_now=True)
    price = models.IntegerField()
    time = models.CharField(max_length=200)
    duration = models.CharField(max_length=200)
    info = models.CharField(max_length=200)
    company = models.CharField(max_length=200)
    url = models.URLField()


class AirBNB(models.Model):
    airports = models.CharField(max_length=100)
    city = models.CharField(max_length=200)
    adults = models.IntegerField()

    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.city
    data = models.TextField()
