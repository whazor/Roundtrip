from django.contrib import admin

# Register your models here.
from planner.models import Flight, FlightPrice, NoFlights, AirBNB

admin.site.register(Flight)
admin.site.register(FlightPrice)
admin.site.register(NoFlights)
admin.site.register(AirBNB)
