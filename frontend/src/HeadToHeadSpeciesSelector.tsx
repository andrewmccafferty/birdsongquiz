import React, { Component } from "react"
import ReactGA from "react-ga4"
import { Typeahead } from "react-bootstrap-typeahead"
import "react-bootstrap-typeahead/css/Typeahead.css"
import "react-bootstrap-typeahead/css/Typeahead.bs5.css"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCheck, faCircleExclamation } from "@fortawesome/free-solid-svg-icons"
import { callApi } from "./api"
import PresetSpeciesSelector from "./PresetSpeciesSelector"
import CountrySelector from "./CountrySelector"
import {
  PresetsApiResponse,
  SpeciesEntry,
  SpeciesListResponse,
  SoundType,
} from "./types"

interface FrontendConfiguration {
  presetsVersion?: string
}

interface HeadToHeadSpeciesSelectorProps {
  onSelectionComplete: (
    selectedSpeciesList: SpeciesEntry[],
    soundType: SoundType,
    country: string
  ) => void
}

interface HeadToHeadSpeciesSelectorState {
  frontendConfiguration: FrontendConfiguration | null
  selectedSpeciesList: SpeciesEntry[]
  speciesList: SpeciesEntry[]
  soundType: SoundType
  speciesListLoading?: boolean
  errorLoadingSpecies?: boolean
  loadingPresetList?: boolean
  errorLoadingPresetList?: boolean
  presetListsLoading?: boolean
  errorLoadingPresetLists?: boolean
  presetLists?: PresetsApiResponse["presets"]
  showValidationMessage?: boolean
  country?: string
}

class HeadToHeadSpeciesSelector extends Component<
  HeadToHeadSpeciesSelectorProps,
  HeadToHeadSpeciesSelectorState
> {
  private _typeahead: Typeahead<SpeciesEntry> | null = null
  private frontendConfiguration?: FrontendConfiguration

  constructor(props: HeadToHeadSpeciesSelectorProps) {
    super(props)
    this.state = {
      frontendConfiguration: null,
      selectedSpeciesList: [],
      speciesList: [],
      soundType: "any",
    }
  }

  loadFrontendConfiguration = async () => {
    try {
      const response = await fetch("/frontend-configuration.json")
      const frontendConfiguration =
        (await response.json()) as FrontendConfiguration

      if (response.status !== 200) throw Error("Error loading config")
      console.log("Got frontend config", frontendConfiguration)
      this.frontendConfiguration = frontendConfiguration
      this.setState({ frontendConfiguration })
    } catch (e) {
      console.error("Got error while trying to get frontend configuration", e)
    }
  }

  componentDidMount() {
    this.loadFrontendConfiguration().then(() => {
      this.onCountryChanged("GB")
    })
  }

  onSelectionComplete = () => {
    if (this.state.selectedSpeciesList.length < 2) {
      this.setState({
        showValidationMessage: true,
      })
      return
    } else {
      this.setState({
        showValidationMessage: false,
      })
    }
    this.props.onSelectionComplete(
      this.state.selectedSpeciesList,
      this.state.soundType,
      this.state.country || "GB"
    )
  }

  onSoundTypeChanged = (soundType: SoundType) => {
    this.setState({ soundType })
  }

  loadSpeciesForCountry = (country: string) => {
    this.setState({
      speciesListLoading: true,
      errorLoadingSpecies: false,
    })
    callApi<SpeciesListResponse>(`species?region=${country}`)
      .then((result) => {
        this.setState({
          speciesList: result.species,
          speciesListLoading: false,
        })
      })
      .catch(() => {
        this.setState({
          speciesListLoading: false,
          errorLoadingSpecies: true,
        })
      })
  }

  loadSpeciesForListId = (listId: string) => {
    if (!listId || listId === "") {
      this.setState({
        selectedSpeciesList: [],
      })
      return
    }
    this.setState({
      loadingPresetList: true,
      errorLoadingPresetList: false,
    })
    callApi<SpeciesListResponse>(`species?listId=${listId}`)
      .then((result) => {
        this.setState({
          selectedSpeciesList: result.species,
          loadingPresetList: false,
        })
      })
      .catch(() => {
        this.setState({
          loadingPresetList: false,
          errorLoadingPresetList: true,
        })
      })
  }

  loadPresetListsForCountry = (country: string) => {
    this.setState({
      presetListsLoading: true,
      errorLoadingPresetLists: false,
    })
    console.log("frontend config", this.state.frontendConfiguration)
    callApi<PresetsApiResponse>(
      `presets/${country}?v=${
        this.frontendConfiguration
          ? this.frontendConfiguration.presetsVersion
          : "default"
      }`
    )
      .then((result) => {
        this.setState({
          presetLists: result.presets,
          presetListsLoading: false,
        })
      })
      .catch((err) => {
        console.error("Error loading presets", err)
        this.setState({
          presetListsLoading: false,
          errorLoadingPresetLists: true,
        })
      })
  }

  onCountryChanged = (country: string) => {
    if (this.state.country === country) {
      return
    }
    ReactGA.event({
      category: "User",
      action: `Selected country:+${country}`,
    })
    this.setState({
      country,
    })
    this.loadSpeciesForCountry(country)
    this.loadPresetListsForCountry(country)
  }

  shouldShowLoaderInSpeciesSelector = () => {
    return !!(this.state.loadingPresetList || this.state.speciesListLoading)
  }

  shouldShowLoaderInPresetListsSelector = () => {
    return !!this.state.presetListsLoading
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
            onChange={(e) =>
              this.onSoundTypeChanged(e.target.value as SoundType)
            }
          >
            <option value="any">Any sound type</option>
            <option value="song">Song</option>
            <option value="call">Call</option>
          </select>
        </div>
        <div className="quiz-subheader">
          <label htmlFor="country" className="form-label">
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
                  this.loadSpeciesForListId(listId)
                }}
              ></PresetSpeciesSelector>
              {this.shouldShowLoaderInPresetListsSelector() && (
                <div className="spinner-overlay">
                  <div className="spinner"></div>
                </div>
              )}
            </div>
          )}
          {this.state.errorLoadingPresetLists && (
            <div className="error-notice">
              <span className="error-icon">
                <FontAwesomeIcon icon={faCircleExclamation} />
              </span>
              <div className="error-text">Error loading preset lists</div>
            </div>
          )}
          {this.state.errorLoadingSpecies && (
            <div className="error-notice">
              <span className="error-icon">
                <FontAwesomeIcon icon={faCircleExclamation} />
              </span>
              <div className="error-text">Error loading species list</div>
            </div>
          )}
          <div className="input-container">
            <div className="species-selection-wrapper">
              <Typeahead
                disabled={
                  this.shouldShowLoaderInSpeciesSelector() ||
                  !!this.state.errorLoadingSpecies
                }
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
                  this.setState({
                    selectedSpeciesList: selected as SpeciesEntry[],
                  })
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
              disabled={this.shouldShowLoaderInSpeciesSelector()}
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
    )
  }
}

export default HeadToHeadSpeciesSelector
