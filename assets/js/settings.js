/**
 * Created by nanne on 05/02/2017.
 */
import React from 'react';
import ReactDOM from 'react-dom';
import Location from './location.jsx';
import {Form, FormGroup, FormControl, ControlLabel} from 'react-bootstrap';

import DatePicker from "react-bootstrap-date-picker";
import moment from 'moment';


class SettingsForm extends React.Component {
    constructor(props) {
        super(props);
        let start = moment({hour: 8}).add(2 + 60, 'days').toISOString();
        let end = moment({hour: 22}).add(16 + 60, 'days').toISOString();

        this.state = {
            id: 1,
            origin: 'EIN',
            adults: 1,
            locations: [
                {id: 1, value: ''},
            ],
            submitting: false,
            start: start,
            min_days: 4,
            end: end
        };
        if(location.hash != "") {
            try {
                this.state = Object.assign(this.state, JSON.parse(location.hash.slice(1)))
            } catch(err) {
                console.log(err);
            }
        }
        this.onClick = this.onClick.bind(this);
        this.changeStart = this.changeStart.bind(this);
        this.changeEnd = this.changeEnd.bind(this);
        this.submit = this.submit.bind(this);
        this.changeOrigin = this.changeOrigin.bind(this);
        this.changeLocation = this.changeLocation.bind(this);
        this.changeAdults = this.changeAdults.bind(this);
        this.changeMinDays = this.changeMinDays.bind(this);
    }

    onClick(e) {
        e.preventDefault();

        if (this.state.id < 6) {
            this.setState((prevState) => ({
                id: prevState.id + 1,
                locations: prevState.locations.concat([{
                    id: prevState.id + 1,
                    value: ''
                }])
            }));
        }
    }

    changeStart(value, formattedValue) {
        this.setState((prevState) => {
            let e = moment(prevState.end);
            let s = moment(prevState.start);
            let v = moment(value);

            let dif = -s.diff(v, 'days');

            return {
                start: value,
                end: moment(prevState.end).add(dif, 'days').toISOString()
            }
        });
    }

    changeEnd(value, formattedValue) {
        this.setState({
            end: value
        });
    }

    changeOrigin(value) {
        if (value != null) {
            value = value.value;
        }
        this.setState({
            origin: value
        })
    }

    changeLocation(id, value) {
        if (value != null) {
            value = value.value;
        }
        this.setState((prev) => ({
            locations: prev.locations.map((item) => item.id == id ? {id: id, value: value} : item)
        }));
    }

    changeAdults(e) {
        let value = e.target.value;
        console.log(value);
        if(value > 0)
        this.setState({
            adults: value
        })
    }
    changeMinDays(e) {
        let value = e.target.value;
        if(value >= 3 && value <= 7)
            this.setState({
                min_days: value
            });
    }

    submit(e) {
        e.preventDefault();
        this.setState({ submitting: true });
        location.hash = JSON.stringify(this.state);
        this.props.submit(
            this.state.origin,
            this.state.locations,
            moment(this.state.start).format("YYYY-MM-DD"),
            moment(this.state.end).format("YYYY-MM-DD"),
            this.state.adults,
            this.state.min_days
        ).then(() => this.setState({ submitting: false }))
            .catch((er) => this.setState({ submitting: false }));
    }

    calc() {
        let s = moment(this.state.start);
        let e = moment(this.state.end);

        return -s.diff(e, 'days');
    }

    render() {
        return <div>
            <Form inline>
                <FormGroup style={{marginRight: 5}}>
                    <ControlLabel>Beginning date</ControlLabel><br />
                    <DatePicker value={this.state.start} onChange={this.changeStart}/>
                </FormGroup>
                <FormGroup style={{marginRight: 5}}>
                    <ControlLabel>Ending date</ControlLabel><br />
                    <DatePicker value={this.state.end} onChange={this.changeEnd}/>
                </FormGroup>
                <FormGroup style={{marginRight: 5}}>
                    <ControlLabel>Adults</ControlLabel><br />
                    <FormControl
                        style={{width: 50}}
                        type="number"
                        value={this.state.adults}
                        onChange={this.changeAdults} />
                </FormGroup>
                <FormGroup style={{marginRight: 5}}>
                    <ControlLabel>Min days</ControlLabel><br />
                    <FormControl
                        style={{width: 50}}
                        type="number"
                        value={this.state.min_days}
                        onChange={this.changeMinDays} />
                </FormGroup>
                <FormGroup>
                    <div>
                        Max days: {this.calc()}
                    </div>
                </FormGroup>


            </Form>
            <Form inline>
                <FormGroup>
                    <ControlLabel>Origin</ControlLabel>
                    <Location onChange={ this.changeOrigin } location={ this.state.origin }/>
                </FormGroup>
                {' '}
                { this.state.locations.map((x) =>
                    <FormGroup key={x.id}>
                        <ControlLabel>Stay</ControlLabel>
                        <Location location={ x.value } onChange={ (val) => this.changeLocation(x.id, val) }/>
                        {' '}
                    </FormGroup>
                )}
                <FormGroup>
                    {' '}
                    <br />
                    <button className="btn btn-default" onClick={this.onClick}>+</button>
                </FormGroup>
                <FormGroup>
                    {' '}
                    <br />
                    <button type="submit" disabled={ this.state.submitting } onClick={ this.submit } className="btn btn-default btn-primary">Submit
                    </button>
                </FormGroup>


            </Form>
        </div>;
    }
}
export default SettingsForm;