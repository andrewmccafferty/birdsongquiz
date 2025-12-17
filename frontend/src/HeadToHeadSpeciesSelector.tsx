import React, { Component } from "react"
import ReactGA from "react-ga4"
import { Typeahead } from "react-bootstrap-typeahead"
import "react-bootstrap-typeahead/css/Typeahead.css"
import "react-bootstrap-typeahead/css/Typeahead.bs5.css"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCircleExclamation } from "@fortawesome/free-solid-svg-icons"
import { callApi } from "./api"
import PresetSpeciesSelector from "./PresetSpeciesSelector"
import CountrySelector from "./CountrySelector"
import LoadingSpinner from "./LoadingSpinner"
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
    usedFreeSpeciesSelection: boolean,
    soundType: SoundType,
    country: string
  ) => void
}

interface HeadToHeadSpeciesSelectorState {
  frontendConfiguration: FrontendConfiguration | null
  selectedSpeciesList: SpeciesEntry[]
  usedFreeSpeciesSelection: boolean
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
  selectionMode: "preset" | "free"
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
      usedFreeSpeciesSelection: false,
      speciesList: [],
      soundType: "any",
      selectionMode: "preset",
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
      this.state.usedFreeSpeciesSelection,
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
          usedFreeSpeciesSelection: false,
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
      presetLists: undefined,
    })
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
          selectionMode: result.presets.length > 0 ? "preset" : "free",
          selectedSpeciesList: [],
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
      selectedSpeciesList: [],
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
          <label htmlFor="country" className="form-label">
            Country:
          </label>
          <CountrySelector
            onChange={(countryCode) => this.onCountryChanged(countryCode)}
          ></CountrySelector>
        </div>
        <div className="species-selection-container">
          <div style={{ marginBottom: "8px" }}>
            <label
              htmlFor="species-list"
              className="form-label"
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: 800,
                color: "#333333",
                fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
                fontSize: "1em",
              }}
            >
              Species:
            </label>
            <div style={{ display: "flex", gap: "16px" }}>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  cursor:
                    this.state.presetLists && this.state.presetLists.length > 0
                      ? "pointer"
                      : "not-allowed",
                  opacity:
                    this.state.presetLists && this.state.presetLists.length > 0
                      ? 1
                      : 0.5,
                }}
                title={
                  !this.state.presetLists || this.state.presetLists.length === 0
                    ? "No preset lists available for this country"
                    : ""
                }
              >
                <input
                  type="radio"
                  value="preset"
                  checked={this.state.selectionMode === "preset"}
                  disabled={
                    !this.state.presetLists ||
                    this.state.presetLists.length === 0
                  }
                  onChange={(e) =>
                    this.setState({
                      selectionMode: e.target.value as "preset" | "free",
                      selectedSpeciesList: [],
                      usedFreeSpeciesSelection: false,
                    })
                  }
                  style={{ marginRight: "6px" }}
                />
                Choose preset
              </label>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  cursor: "pointer",
                }}
              >
                <input
                  type="radio"
                  value="free"
                  checked={this.state.selectionMode === "free"}
                  onChange={(e) =>
                    this.setState({
                      selectionMode: e.target.value as "preset" | "free",
                      selectedSpeciesList: [],
                      usedFreeSpeciesSelection: true,
                    })
                  }
                  style={{ marginRight: "6px" }}
                />
                Pick your own
              </label>
            </div>
          </div>
          {this.state.selectionMode === "preset" &&
            this.state.presetLists &&
            this.state.presetLists.length > 0 && (
              <div className="quiz-subheader" style={{ position: "relative" }}>
                <PresetSpeciesSelector
                  presetLists={this.state.presetLists}
                  onSpeciesListChanged={(listId) => {
                    this.loadSpeciesForListId(listId)
                  }}
                ></PresetSpeciesSelector>
                <LoadingSpinner
                  isLoading={
                    this.shouldShowLoaderInPresetListsSelector() ||
                    !!this.state.loadingPresetList
                  }
                />
              </div>
            )}
          {this.state.selectionMode === "preset" &&
            this.state.presetLists &&
            this.state.presetLists.length > 0 &&
            this.state.selectedSpeciesList.length > 0 && (
              <div className="selected-species-display">
                <div className="selected-species-label">
                  Selected species ({this.state.selectedSpeciesList.length}):
                </div>
                <div className="selected-species-list">
                  {this.state.selectedSpeciesList.map((species, index) => (
                    <span key={index} className="species-tag">
                      {species.Species}
                    </span>
                  ))}
                </div>
              </div>
            )}
          {this.state.selectionMode === "free" && (
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
              <LoadingSpinner
                isLoading={this.shouldShowLoaderInSpeciesSelector()}
              />
            </div>
          )}
        </div>
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

        {this.state.showValidationMessage && (
          <div className="validation-message">
            Please select at least two species to compare
          </div>
        )}

        <div className="quiz-subheader" style={{ marginTop: "16px" }}>
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

        <button
          disabled={
            this.shouldShowLoaderInSpeciesSelector() ||
            this.state.selectedSpeciesList.length < 2
          }
          title={
            this.state.selectedSpeciesList.length < 2
              ? this.state.selectionMode === "preset"
                ? "Please pick a preset"
                : "Please choose at least two species"
              : ""
          }
          data-testid="finish-selection"
          className="action-button"
          onClick={() => this.onSelectionComplete()}
          style={{ marginTop: "16px", width: "100%" }}
        >
          Start Quiz
        </button>
      </div>
    )
  }
}

export default HeadToHeadSpeciesSelector
