import React, { Component } from "react";
import { Typeahead } from "react-bootstrap-typeahead";
import "react-bootstrap-typeahead/css/Typeahead.css";
import "react-bootstrap-typeahead/css/Typeahead.bs5.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { callApi } from "./api.js";
const speciesList = require("./species_list.js");
import PresetSpeciesSelector from "./PresetSpeciesSelector.js";
import { presetListsForCountry } from "./presets.js";
class HeadToHeadSpeciesSelector extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedSpeciesList: [],
      speciesList: speciesList,
      typeaheadRef: null,
      soundType: "any",
    };
  }
  componentDidMount() {
	this.loadPresetListsForCountry("GB")
  }
  
  onSelectionComplete = () => {
    if (this.state.selectedSpeciesList.length < 2) {
      this.setState({ showValidationMessage: true });
      return;
    } else {
      this.setState({ showValidationMessage: false });
    }
    this.props.onSelectionComplete(
      this.state.selectedSpeciesList,
      this.state.soundType
    );
  };
  onSoundTypeChanged = (soundType) => {
    this.setState({ soundType: soundType });
  };
  loadSpeciesForCountry = (country) => {
    this.setState({
      speciesListLoading: true,
      errorLoadingSpecies: false,
    });
    callApi(`species?region=${country}`)
      .catch((err) => {
        this.setState({
          speciesListLoading: false,
          errorLoadingSpecies: true,
        });
      })
      .then((result) => {
        this.setState({
          speciesList: result.species,
          speciesListLoading: false,
        });
      });
  };
  loadPresetListsForCountry = (country) => {
    const presetLists = presetListsForCountry(country);
    this.setState({ presetLists });
  };
  onCountryChanged = (country) => {
    if (this.state.country == country) {
      return;
    }
    this.setState({ country: country });
    this.loadSpeciesForCountry(country);
    this.loadPresetListsForCountry(country);
  };
  render() {
    return (
      <div>
        <div className="quiz-subheader">
          Select some species to go head to head
        </div>
        <div className="quiz-subheader">
          <label htmlFor="sound-type" className="form-label">
            Sound type:
          </label>
          <select
            id="sound-type"
            onChange={(e) => this.onSoundTypeChanged(e.target.value)}
          >
            <option value="any">Any sound type</option>
            <option value="song">Song</option>
            <option value="call">Call</option>
          </select>
        </div>
        <div className="quiz-subheader">
          <label htmlFor="sound-type" className="form-label">
            Country:
          </label>
          <select
            data-testid="country"
            id="country"
            onChange={(e) => this.onCountryChanged(e.target.value)}
          >
            <option value="AU">Australia</option>
            <option value="MY">Malaysia</option>
            <option value="GB" selected>
              UK
            </option>
            <option value="US">USA</option>
          </select>
        </div>
        {!this.state.speciesListLoading && (
          <div>
            <div className="input-container">
              <Typeahead
                multiple
                id="species-selection"
                data-testid="species-selection"
                className={"Species-Selection"}
                labelKey="Species"
                options={this.state.speciesList}
                placeholder="Start typing to choose a species"
                minLength={1}
                clearButton={true}
                onChange={(selected) => {
                  this.setState({ selectedSpeciesList: selected });
                }}
                selected={this.state.selectedSpeciesList}
                ref={(ref) => (this._typeahead = ref)}
              />
              <button
                data-testid="finish-selection"
                className="action-button"
                onClick={() => this.onSelectionComplete()}
              >
                <FontAwesomeIcon icon={faCheck} />
              </button>
            </div>
			{this.state.presetLists && <div className="input-container">
				<PresetSpeciesSelector presetLists={this.state.presetLists}></PresetSpeciesSelector>
			</div>}
          </div>
        )}
        {this.state.speciesListLoading && <div>Species list loading...</div>}
        {this.state.showValidationMessage && (
          <div className="validation-message">
            Please select at least two species to compare
          </div>
        )}
      </div>
    );
  }
}

export default HeadToHeadSpeciesSelector;
