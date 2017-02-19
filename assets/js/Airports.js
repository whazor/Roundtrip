/**
 * Created by nanne on 07/02/2017.
 */
import 'whatwg-fetch';

Array.prototype.flatMap = function (lambda) {
    return Array.prototype.concat.apply([], this.map(lambda));
};

let cities = fetch('/static/cities.json')
                .then((r) => r.json().then((data) => data.Continents.filter(x => x.Name == "Europe")
                    .flatMap(x => x.Countries)
                    .flatMap(x => x.Cities
                        .map(ci => Object.assign({"Country": x.Name}, ci)))
                    // .flatMap(x => x.Airports
                    //     .map(ci => Object.assign({"Country": x.Country, "City": x.Name, "CityId": x.Id}, ci)))
                    .map(x => {
                        let airports = x.Airports.map(a => a.Id).sort().join(",");

                        return {
                            value: airports,
                            label: x.Name + " - " + x.Country
                        }
                    })
                ));

let AirportCache = {
    getOptions: () => {
        return cities.then((json) => ({options: json, complete: true}));
    },
    getNames: () => {
        return cities.then((airports) => airports.reduce((cur, next) => Object.assign(cur, {[next.value]: next.label.split(" - ")[0]}), {}));
    }
};

export default AirportCache;