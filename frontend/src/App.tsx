import React, { Component } from "react";
import ReactGA from "react-ga4";
import HeadToHeadSpeciesSelector from "./HeadToHeadSpeciesSelector";
import GameControls from "./GameControls";
import GameExplanationModal from "./GameExplanationModal";
import SuggestPresetListModal from "./SuggestPresetListModal";
import CopyPermalinkButton from "./CopyPermalinkButton";
import {
  faArrowsRotate,
  faInfoCircle,
  faClipboardCheck,
} from "@fortawesome/free-solid-svg-icons";
import "./App.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { SpeciesEntry, SoundType } from "./types";

interface PermalinkData {
  presetSpecies: SpeciesEntry[];
  soundType: SoundType | null;
}

interface AppState {
  headToHeadSpeciesList: SpeciesEntry[];
  soundType: SoundType | null;
  gameExplanationOpen: boolean;
  suggestPresetListModalOpen?: boolean;
  country?: string;
}

class App extends Component<unknown, AppState> {
  constructor(props: unknown) {
    super(props);
    ReactGA.initialize(process.env.GOOGLE_ANALYTICS_ID as string | undefined);
    ReactGA.send({ hitType: "pageview", page: window.location.pathname });

    const permalinkData = this.decodePermalink();
    this.state = {
      headToHeadSpeciesList: permalinkData ? permalinkData.presetSpecies : [],
      soundType: permalinkData ? permalinkData.soundType : null,
      gameExplanationOpen: false,
      suggestPresetListModalOpen: false,
    };
  }

  decodePermalink = (): PermalinkData | null => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const permalinkDataBase64 = urlParams.get("presets");
      if (!permalinkDataBase64) {
        return null;
      }
      ReactGA.event({
        category: "User",
        action: "Used permalink",
      });
      const permalinkData = JSON.parse(
        atob(permalinkDataBase64)
      ) as PermalinkData;
      return permalinkData;
    } catch (e) {
      console.error("error decoding permalink data", e);
      return null;
    }
  };

  onHeadToHeadSpeciesSelected = (
    headToHeadSpeciesList: SpeciesEntry[],
    soundType: SoundType,
    country: string
  ) => {
    this.setState({
      headToHeadSpeciesList,
      soundType,
      country,
    });
  };

  headToHeadSharingLink = () =>
    `${window.location.origin}?presets=${btoa(
      JSON.stringify({
        presetSpecies: this.state.headToHeadSpeciesList,
        soundType: this.state.soundType,
      })
    )}`;

  gameActive = () =>
    this.state.headToHeadSpeciesList &&
    this.state.headToHeadSpeciesList.length > 0;

  resetQuiz = () => {
    this.setState({
      headToHeadSpeciesList: [],
      soundType: null,
    });
  };

  closeGameExplanation = () => {
    this.setState({
      gameExplanationOpen: false,
    });
  };

  openSuggestPresetListModal = () => {
    this.setState({
      suggestPresetListModalOpen: true,
    });
  };

  closeSuggestPresetListModal = () => {
    this.setState({
      suggestPresetListModalOpen: false,
    });
  };

  openGameExplanation = () => {
    this.setState({
      gameExplanationOpen: true,
    });
  };

  render() {
    return (
      <div className="quiz-container">
        <div className="quiz-header">
          Head-to-Head Birdsong Quiz
          <FontAwesomeIcon
            className="info-link"
            icon={faInfoCircle}
            onClick={() => this.openGameExplanation()}
          />
        </div>
        {(!this.state.headToHeadSpeciesList ||
          this.state.headToHeadSpeciesList.length === 0) && (
          <HeadToHeadSpeciesSelector
            onSelectionComplete={(headToHeadSpeciesList, soundType, country) =>
              this.onHeadToHeadSpeciesSelected(
                headToHeadSpeciesList,
                soundType,
                country
              )
            }
          />
        )}
        {this.gameActive() && (
          <div>
            <button
              data-testid="reset"
              id="reset"
              onClick={() => this.resetQuiz()}
              className="small-button"
              title="Reset"
            >
              <FontAwesomeIcon icon={faArrowsRotate} />
            </button>
            <CopyPermalinkButton permalink={this.headToHeadSharingLink()} />
            <button
              className="small-button"
              onClick={() => this.openSuggestPresetListModal()}
              title="Suggest this list of species as a preset"
            >
              <FontAwesomeIcon icon={faClipboardCheck} />
            </button>
          </div>
        )}
        {this.gameActive() && (
          <div>
            <GameControls
              headToHeadSpecies={this.state.headToHeadSpeciesList}
              soundType={this.state.soundType || "any"}
            />
            <SuggestPresetListModal
              isOpen={!!this.state.suggestPresetListModalOpen}
              onClose={() => this.closeSuggestPresetListModal()}
              speciesList={this.state.headToHeadSpeciesList}
              country={this.state.country || "GB"}
            />
          </div>
        )}
        <GameExplanationModal
          isOpen={this.state.gameExplanationOpen}
          onClose={() => this.closeGameExplanation()}
        />
      </div>
    );
  }
}

export default App;
