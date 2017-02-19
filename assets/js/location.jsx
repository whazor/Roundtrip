import React, {Component} from 'react';
import {Dropdown, Input, Button, MenuItem} from 'react-bootstrap';
import Select from 'react-select';
// import fetch from 'fetch';
import AirportCache from './Airports'


class Location extends Component {
    constructor(props) {
        super(props);

        this.onChange = this.onChange.bind(this);

    }

    onChange(val) {
        this.props.onChange(val);
    }

    render() {
        return <Select.Async value={ this.props.location } style={ {minWidth: 160} } onChange={this.onChange}
                             loadOptions={AirportCache.getOptions}/>
    }
}

export default Location;