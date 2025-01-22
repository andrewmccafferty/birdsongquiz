import React, {Component} from "react";
import {Typeahead} from 'react-bootstrap-typeahead';
import 'react-bootstrap-typeahead/css/Typeahead.css';
import 'react-bootstrap-typeahead/css/Typeahead.bs5.css';
const speciesList = require('./species_list.js');

class HeadToHeadSpeciesSelector extends Component {
	// callApi = async (path) => {
	// 	const response = await fetch(`${API_ROOT}/${path}`);
	// 	const body = await response.json();

	// 	if (response.status !== 200) throw Error(body.message);

	// 	return body;
	// };

	constructor(props) {
		super(props)
		this.state = {
			selectedSpeciesList: [],
			speciesList: speciesList,
			typeaheadRef: null
		}
		// this.callApi('species').then((result) => {
		// 	this.setState((prevState, props) => {
		// 		return {
		// 			...props,
		// 			speciesList: result.species
		// 		}
		// 	})
		// })
	}

	onSelectionComplete =() => {
		this.props.onSelectionComplete(this.state.selectedSpeciesList)
	}

	render() {
		return (
			<div>
				<h2>Select some species to go head to head</h2>
				<Typeahead
					multiple
				id="species-selection"
				className={'Species-Selection'}
				labelKey="Species"
				options={this.state.speciesList}
				placeholder="Start typing to choose a species"
				minLength={1}
				clearButton={true}
				onChange={(selected) => {
					this.setState({selectedSpeciesList: selected});
				}}
				selected={this.state.selectedSpeciesList}
				ref={(ref) => this._typeahead = ref}
			/>
				<div>
					<button disabled={!this.state.selectedSpeciesList || this.state.selectedSpeciesList.length < 2} onClick={() => this.onSelectionComplete()}>Finish selection</button>
				</div>
			</div>
		)
	}
}

export default HeadToHeadSpeciesSelector