import React, {Component} from 'react';
import { Table }  from 'react-bootstrap';
import SettingsForm from './settings';
// If you use React Router, make this component
// render <Router> with your routes. Currently,
// only synchronous routes are hot reloaded, and
// you will see a warning from <Router> on every reload.
// You can ignore this warning. For details, see:
// https://github.com/reactjs/react-router/issues/2182

import BigCalendar from 'react-big-calendar';
import moment from 'moment';
import AirportCache from './Airports'


// Setup the localizer by providing the moment (or globalize) Object
// to the correct localizer.
BigCalendar.momentLocalizer(moment); // or globalizeLocalizer

import 'whatwg-fetch';

export default class App extends Component {

    constructor(props) {
        super(props);
        this.state = {result: "No result yet"};
        this.submit = this.submit.bind(this);
    }


    submit(se, locations, begin, end, adults, min_days) {
        this.setState({adults: adults, start: begin, origin: se});
        return AirportCache.getNames().then((list) => {
            this.setState({names: list});

            let airports = locations.map((el) => el.value);
            return jQuery.post('/search', {
                origin: se,
                locations: airports,
                cities: airports.reduce((obj, x) => Object.assign(obj, {[x]: list[x]}), {}),
                begin: begin,
                end: end,
                adults: adults,
                min_days: min_days
            }, 'json').promise().then((data) =>
                this.setState({ result: data })
            );
        });
    }

    render() {
        let result = <div><span>{JSON.stringify(this.state.result)}</span></div>;
        if(this.state.result.route && this.state.names) {
            let route = this.state.result.route;

            let myEventsList = route.reduce((arr, cur, index) => {
                if(index == 0) return arr;
                let start = moment(route[index - 1].date);
                let end = moment(cur.date);
                return arr.concat([{
                    'title': this.state.names[cur.from],
                    'start': start,
                    'end': end.add(1, 'day').subtract(1, 'hour')
                }]);
            }, []);

            result = <div>
                <Table responsive>
                    <thead>
                      <tr>
                        <th>From</th>
                        <th>To</th>
                        <th>Date</th>
                          <th>Price</th>
                          <th>P.P.</th>
                          <th>Link</th>
                      </tr>
                    </thead>
                    <tbody>
                    { route.map(edge => <tr key={ edge.date }>
                        <td>{this.state.names[edge.from]}</td>
                        <td>{this.state.names[edge.to]}</td>
                        <td>{edge.date}</td>
                        <td>&euro; {edge.price}</td>
                        <td>&euro; {edge.price/ this.state.adults}</td>
                        <td><a href={edge.url} target="_blank">Link</a></td>
                      </tr>)}
                        <tr>
                            <th/>
                            <th/>
                            <th>{ Math.abs(moment(route[0].date).diff(moment(route.slice(-1)[0].date), 'days')) } days</th>
                            <th>&euro; {this.state.result.price}</th>
                            <th>&euro; {this.state.result.price / this.state.adults}</th>
                        </tr>
                    </tbody>
                  </Table>
                  <div>
                      <hr />
                      <Table condensed={{true}} responsive={{false}} bsClass="table tb-small">
                      <thead>
                      <tr>
                        <th>City</th>
                        <th>Estimated night price for AirBnB</th>
                      </tr>
                      </thead>
                      <tbody>
                      { this.state.result.cities.map(city => <tr><td>{city.name}</td><td>&euro; {city.price}</td></tr> )}
                      </tbody>
                      </Table>
                      <hr />
                  </div>
                  <div style={{ height: 450}}>
                    <BigCalendar
                        events={myEventsList}
                        defaultDate={moment(route[0].date).toDate()}
                    />
                  </div>
            </div>;

        }
        return (
            <div>
                <SettingsForm submit={this.submit}/>
                <div>
                    {result}
                </div>
            </div>
        );
    }
}
