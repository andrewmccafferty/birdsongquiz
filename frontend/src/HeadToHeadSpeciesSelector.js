import React, { Component } from "react";
import { Typeahead } from "react-bootstrap-typeahead";
import "react-bootstrap-typeahead/css/Typeahead.css";
import "react-bootstrap-typeahead/css/Typeahead.bs5.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { callApi } from "./api.js";
import PresetSpeciesSelector from "./PresetSpeciesSelector.js";
import CountrySelector from "./CountrySelector.js";
class HeadToHeadSpeciesSelector extends Component {
  constructor(props) {
    super(props);
    this.state = {
      frontendConfiguration: null,
      selectedSpeciesList: [],
      speciesList: [],
      typeaheadRef: null,
      soundType: "any",
    };
  }

  loadFrontendConfiguration = async () => {
    try {
      const frontendConfiguration = await fetch("/frontend-configuration.json");
      this.setState({ frontendConfiguration })
    } catch (e) {
      console.error("Got error while trying to get frontend configuration", e);
    }
    
  }

  componentDidMount() {
    this.loadFrontendConfiguration().then(() => {
      this.onCountryChanged("GB");
    })
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
  loadSpeciesForListId = (listId) => {
    if (!listId || listId == "") {
      this.setState({ selectedSpeciesList: [] });
      return;
    }
    this.setState({
      loadingPresetList: true,
      errorLoadingPresetList: false,
    });
    callApi(`species?listId=${listId}`)
      .catch((err) => {
        this.setState({
          loadingPresetList: false,
          errorLoadingPresetList: true,
        });
      })
      .then((result) => {
        this.setState({
          selectedSpeciesList: result.species,
          loadingPresetList: false,
        });
      });
  };
  loadPresetListsForCountry = (country) => {
    this.setState({
      presetListsLoading: true,
      errorLoadingPresetLists: false,
    });
    callApi(`presets/${country}?v=${this.state.frontendConfiguration ? this.state.frontendConfiguration.presetsVersion : "default"}`)
      .catch((err) => {
        this.setState({
          presetListsLoading: false,
          errorLoadingPresetLists: true,
        });
      })
      .then((result) => {
        this.setState({
          presetLists: result.presets,
          presetListsLoading: false,
        });
      });
  };

  
  onCountryChanged = (country) => {
    if (this.state.country == country) {
      return;
    }
    this.setState({ country: country });
    this.loadSpeciesForCountry(country);
    this.loadPresetListsForCountry(country);
  };

  shouldShowLoaderInSpeciesSelector = () => {
    return this.state.loadingPresetList || this.state.speciesListLoading;
  };

  shouldShowLoaderInPresetListsSelector = () => {
    return this.state.presetListsLoading
  }

  render() {
    return (
      <div>
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
          <CountrySelector
            onChange={(countryCode) => this.onCountryChanged(countryCode)}
          ></CountrySelector>
        </div>
        <div
          style={{
            border: "solid black 1px",
            padding: "10px",
            borderRadius: "10px",
          }}
        >
          <div className="quiz-subheader">
            <b>Species selection</b>
          </div>
          <div>
            {this.state.presetLists &&
              "You can choose one of the presets below, or start typing in the box to make your own selection. "}
            {!this.state.presetLists &&
              "Start typing in the box below to make your selection. "}
            Once you're happy with your list, press the blue button to start the
            quiz.
          </div>
          {this.state.presetLists && this.state.presetLists.length > 0 && (
            <div className="input-container">
              <PresetSpeciesSelector
                presetLists={this.state.presetLists}
                onSpeciesListChanged={(listId) => {
                  this.loadSpeciesForListId(listId);
                }}
              ></PresetSpeciesSelector>
              {this.shouldShowLoaderInPresetListsSelector() && (
                <div className="spinner-overlay">
                  <div className="spinner"></div>
                </div>
              )}
            </div>
          )}
          <div className="input-container">
            <div className="species-selection-wrapper">
              <Typeahead
                disabled={this.shouldShowLoaderInSpeciesSelector()}
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
              {this.shouldShowLoaderInSpeciesSelector() && (
                <div className="spinner-overlay">
                  <div className="spinner"></div>
                </div>
              )}
            </div>
            <button
              disabled={ this.shouldShowLoaderInSpeciesSelector() }
              data-testid="finish-selection"
              className="action-button"
              onClick={() => this.onSelectionComplete()}
            >
              <FontAwesomeIcon icon={faCheck} />
            </button>
          </div>
        </div>
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
