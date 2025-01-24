import React, {Component} from "react";
import {Typeahead} from 'react-bootstrap-typeahead';
import 'react-bootstrap-typeahead/css/Typeahead.css';
import 'react-bootstrap-typeahead/css/Typeahead.bs5.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
const speciesList = require('./species_list.js');

class HeadToHeadSpeciesSelector extends Component {
	constructor(props) {
		super(props)
		this.state = {
			selectedSpeciesList: [],
			speciesList: speciesList,
			typeaheadRef: null
		}
	}

	onSelectionComplete =() => {
		if (this.state.selectedSpeciesList.length < 2) {
			this.setState({showValidationMessage: true})
			return
		} else {
			this.setState({showValidationMessage: false})
		}
		this.props.onSelectionComplete(this.state.selectedSpeciesList)
	}

	render() {
		return (
			<div>
				<div className="quiz-subheader">Select some species to go head to head</div>
				<div className="input-container">
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
					<button className="action-button" onClick={() => this.onSelectionComplete()}>
						<FontAwesomeIcon icon={faCheck} />
					</button>
				</div>
				{this.state.showValidationMessage && <div className="validation-message">
					Please select at least two species to compare
					</div>}
			</div>
		)
	}
}

export default HeadToHeadSpeciesSelector