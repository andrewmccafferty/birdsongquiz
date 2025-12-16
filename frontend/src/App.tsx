import React, { Component } from "react"
import ReactGA from "react-ga4"
import HeadToHeadSpeciesSelector from "./HeadToHeadSpeciesSelector"
import GameControls from "./GameControls"
import GameExplanationModal from "./GameExplanationModal"
import SuggestPresetListModal from "./SuggestPresetListModal"
import FeedbackModal from "./FeedbackModal"
import CopyPermalinkButton from "./CopyPermalinkButton"
import {
  faArrowsRotate,
  faInfoCircle,
  faClipboardCheck,
} from "@fortawesome/free-solid-svg-icons"
import "./App.css"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { SpeciesEntry, SoundType } from "./types"

interface PermalinkData {
  presetSpecies: SpeciesEntry[]
  soundType: SoundType | null
}

interface AppState {
  headToHeadSpeciesList: SpeciesEntry[]
  usedFreeSpeciesSelection: boolean
  soundType: SoundType | null
  gameExplanationOpen: boolean
  suggestPresetListModalOpen?: boolean
  feedbackModalOpen: boolean
  country?: string
  isFirstVisit: boolean
  showPresetPrompt: boolean
}

class App extends Component<unknown, AppState> {
  constructor(props: unknown) {
    super(props)
    ReactGA.initialize(process.env.GOOGLE_ANALYTICS_ID as string | undefined)
    ReactGA.send({ hitType: "pageview", page: window.location.pathname })

    const permalinkData = this.decodePermalink()
    const hasVisited = localStorage.getItem("hasVisitedBefore")
    this.state = {
      headToHeadSpeciesList: permalinkData ? permalinkData.presetSpecies : [],
      usedFreeSpeciesSelection: false,
      soundType: permalinkData ? permalinkData.soundType : null,
      gameExplanationOpen: false,
      suggestPresetListModalOpen: false,
      feedbackModalOpen: false,
      isFirstVisit: !hasVisited,
      showPresetPrompt: false,
    }
  }

  decodePermalink = (): PermalinkData | null => {
    try {
      const urlParams = new URLSearchParams(window.location.search)
      const permalinkDataBase64 = urlParams.get("presets")
      if (!permalinkDataBase64) {
        return null
      }
      ReactGA.event({
        category: "User",
        action: "Used permalink",
      })
      const permalinkData = JSON.parse(
        atob(permalinkDataBase64)
      ) as PermalinkData
      return permalinkData
    } catch (e) {
      console.error("error decoding permalink data", e)
      return null
    }
  }

  onHeadToHeadSpeciesSelected = (
    headToHeadSpeciesList: SpeciesEntry[],
    usedFreeSpeciesSelection: boolean,
    soundType: SoundType,
    country: string
  ) => {
    this.setState({
      headToHeadSpeciesList,
      usedFreeSpeciesSelection,
      soundType,
      country,
      showPresetPrompt: usedFreeSpeciesSelection,
    })
  }

  headToHeadSharingLink = () =>
    `${window.location.origin}?presets=${btoa(
      JSON.stringify({
        presetSpecies: this.state.headToHeadSpeciesList,
        soundType: this.state.soundType,
      })
    )}`

  gameActive = () =>
    this.state.headToHeadSpeciesList &&
    this.state.headToHeadSpeciesList.length > 0

  resetQuiz = () => {
    this.setState({
      headToHeadSpeciesList: [],
      soundType: null,
    })
  }

  closeGameExplanation = () => {
    this.setState({
      gameExplanationOpen: false,
    })
  }

  openSuggestPresetListModal = () => {
    this.setState({
      suggestPresetListModalOpen: true,
      showPresetPrompt: false,
    })
  }

  closeSuggestPresetListModal = () => {
    this.setState({
      suggestPresetListModalOpen: false,
    })
  }

  openGameExplanation = () => {
    if (this.state.isFirstVisit) {
      localStorage.setItem("hasVisitedBefore", "true")
    }
    ReactGA.event({
      category: "User",
      action: `Opened game explanation. FirstTime:+${this.state.isFirstVisit}`,
    })
    this.setState({
      gameExplanationOpen: true,
      isFirstVisit: false,
    })
  }

  dismissFirstVisitPrompt = () => {
    localStorage.setItem("hasVisitedBefore", "true")
    this.setState({
      isFirstVisit: false,
    })
  }

  dismissPresetPrompt = () => {
    this.setState({
      showPresetPrompt: false,
    })
  }

  openFeedbackModal = () => {
    this.setState({
      feedbackModalOpen: true,
    })
  }

  closeFeedbackModal = () => {
    this.setState({
      feedbackModalOpen: false,
    })
  }

  render() {
    return (
      <div className="quiz-container">
        <div className="quiz-header">
          Head-to-Head Birdsong Quiz
          <div className="info-icon-container">
            <FontAwesomeIcon
              className={`info-link ${this.state.isFirstVisit ? "pulse" : ""}`}
              icon={faInfoCircle}
              onClick={() => this.openGameExplanation()}
            />
            {this.state.isFirstVisit && (
              <div className="first-visit-prompt">
                <div className="first-visit-arrow"></div>
                <div className="first-visit-text">
                  First time? See how the game works here!
                </div>
                <button
                  className="first-visit-dismiss"
                  onClick={() => this.dismissFirstVisitPrompt()}
                  aria-label="Dismiss"
                >
                  ×
                </button>
              </div>
            )}
          </div>
        </div>
        {(!this.state.headToHeadSpeciesList ||
          this.state.headToHeadSpeciesList.length === 0) && (
          <HeadToHeadSpeciesSelector
            onSelectionComplete={(
              headToHeadSpeciesList,
              usedFreeSpeciesSelection,
              soundType,
              country
            ) =>
              this.onHeadToHeadSpeciesSelected(
                headToHeadSpeciesList,
                usedFreeSpeciesSelection,
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
            {this.state.usedFreeSpeciesSelection && (
              <div className="suggest-button-container">
                <button
                  className={`small-button ${this.state.showPresetPrompt ? "pulse" : ""}`}
                  id="suggest-preset-list"
                  onClick={() => this.openSuggestPresetListModal()}
                  title="Suggest this list of species as a preset"
                >
                  <FontAwesomeIcon icon={faClipboardCheck} />
                </button>
              </div>
            )}
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
        <FeedbackModal
          isOpen={this.state.feedbackModalOpen}
          onClose={() => this.closeFeedbackModal()}
        />
        <button
          className="feedback-trigger"
          onClick={() => this.openFeedbackModal()}
        >
          💬 Feedback
        </button>
      </div>
    )
  }
}

export default App
