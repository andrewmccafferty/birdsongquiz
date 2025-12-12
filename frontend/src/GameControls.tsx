import React, { Component } from "react";
import ReactGA from "react-ga4";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faTimes } from "@fortawesome/free-solid-svg-icons";
import { callApi } from "./api";
import { RecordingApiResponse, SpeciesEntry, SoundType } from "./types";

interface GameControlsProps {
  headToHeadSpecies: SpeciesEntry[];
  soundType: SoundType;
}

interface GameControlsState {
  headToHeadSpecies: SpeciesEntry[];
  soundType: SoundType;
  isInitialised: boolean;
  birdsongId: string;
  species: string;
  noRecordingFound: boolean;
  loading: boolean;
  showSpecies: boolean;
  speciesList: SpeciesEntry[];
  selectedSpeciesGuess: SpeciesEntry | null;
  counter: number;
  correctCount: number;
  livesLeft: number;
  errorLoading: boolean;
  guessCorrect: boolean;
  soundUrl?: string;
  recordist?: string;
  scientificName?: string;
}

class GameControls extends Component<GameControlsProps, GameControlsState> {
  constructor(props: GameControlsProps) {
    super(props);
    this.state = {
      headToHeadSpecies: props.headToHeadSpecies,
      soundType: props.soundType,
      isInitialised: false,
      birdsongId: "",
      species: "",
      noRecordingFound: false,
      loading: false,
      showSpecies: false,
      speciesList: [],
      selectedSpeciesGuess: null,
      counter: 0,
      correctCount: 0,
      livesLeft: 5,
      errorLoading: false,
      guessCorrect: false,
    };
  }

  componentDidMount() {
    this.getRandomBirdsong();
  }

  clearGuess = () => {
    if (this.state.selectedSpeciesGuess) {
      this.setState({
        selectedSpeciesGuess: null,
      });
    }
  };

  onSpeciesGuessMade = (guess: SpeciesEntry | null) => {
    if (this.state.selectedSpeciesGuess || !this.state.scientificName) {
      return;
    }

    const guessCorrect =
      !!guess &&
      guess.ScientificName.toLowerCase() ===
        this.state.scientificName.toLowerCase();

    this.setState((prevState) => {
      const correctCount = guessCorrect
        ? prevState.correctCount + 1
        : prevState.correctCount;
      const newCounter = prevState.counter + 1;
      const newLivesLeft = !guessCorrect
        ? prevState.livesLeft - 1
        : prevState.livesLeft;
      ReactGA.event({
        category: "User",
        action: `Got ${correctCount} out of ${newCounter} correct`,
      });
      return {
        selectedSpeciesGuess: guess,
        guessCorrect,
        correctCount,
        counter: newCounter,
        livesLeft: newLivesLeft,
      } as Partial<GameControlsState> as GameControlsState;
    });
  };

  getRandomSpecies = () => {
    const speciesList = this.state.headToHeadSpecies;
    const randomIndex = Math.floor(Math.random() * speciesList.length);
    return speciesList[randomIndex].ScientificName;
  };

  buildApiUrl = () => {
    let soundTypeUrlSegment = "";
    if (this.state.soundType && this.state.soundType !== "any") {
      soundTypeUrlSegment = `&soundType=${encodeURIComponent(
        this.state.soundType
      )}`;
    }
    return `recording?species=${encodeURIComponent(
      this.getRandomSpecies()
    )}${soundTypeUrlSegment}`;
  };

  getRandomBirdsong = async () => {
    this.clearGuess();
    this.setState({
      errorLoading: false,
      loading: true,
      guessCorrect: false,
    });
    const url = this.buildApiUrl();
    console.log("Calling API...", url);
    callApi<RecordingApiResponse>(url)
      .then((result) => {
        if (result.noRecordings) {
          this.setState({
            noRecordingFound: true,
            loading: false,
            showSpecies: false,
          });
          return;
        }
        const recording = result.recording;
        if (!recording) {
          this.setState({
            loading: false,
            errorLoading: true,
          });
          return;
        }
        this.setState({
          birdsongId: recording.id,
          soundUrl: result.soundUrl,
          species: recording.en,
          recordist: recording.rec,
          scientificName: `${recording.gen} ${recording.sp}`,
          loading: false,
          showSpecies: false,
          noRecordingFound: false,
        });
      })
      .catch((err) => {
        console.log("Error getting recording", err);
        this.setState({
          loading: false,
          errorLoading: true,
        });
      });
  };

  render() {
    return (
      <div>
        {/* Loading indicator */}
        <h3>
          {this.state.correctCount} out of {this.state.counter} correct (
          {this.state.livesLeft} lives left)
        </h3>
        {this.state.loading && <div>Loading...</div>}
        {/* Error indicator */}
        {this.state.errorLoading && (
          <div>
            Error loading data. Please{" "}
            <button
              onClick={() => {
                this.getRandomBirdsong();
              }}
            >
              try again
            </button>
          </div>
        )}

        {/* No data found indicator */}
        {!this.state.loading && this.state.noRecordingFound && (
          <span>No recording found</span>
        )}

        {!this.state.loading &&
          !this.state.errorLoading &&
          this.state.birdsongId &&
          !this.state.noRecordingFound && (
            <div className="audio-player">
              <audio autoPlay={true} controls src={this.state.soundUrl}>
                Your browser does not support the audio element.
              </audio>
            </div>
          )}

        {!this.state.loading && this.state.headToHeadSpecies && (
          <div className="options">
            {this.state.headToHeadSpecies.map((option) => {
              let backgroundColour = "gray";
              if (option === this.state.selectedSpeciesGuess) {
                backgroundColour = this.state.guessCorrect ? "green" : "red";
              }
              if (
                this.state.selectedSpeciesGuess &&
                !this.state.guessCorrect &&
                this.state.scientificName &&
                option.ScientificName.toLowerCase() ===
                  this.state.scientificName.toLowerCase()
              ) {
                backgroundColour = "green";
              }
              return (
                <button
                  key={option.Species}
                  style={{
                    backgroundColor: backgroundColour,
                  }}
                  className={"option-button"}
                  onClick={() => this.onSpeciesGuessMade(option)}
                >
                  {option.Species}
                  {backgroundColour === "green" && (
                    <FontAwesomeIcon
                      style={{ marginLeft: "5px" }}
                      icon={faCheck}
                    />
                  )}
                  {backgroundColour === "red" && (
                    <FontAwesomeIcon
                      style={{ marginLeft: "5px" }}
                      icon={faTimes}
                    />
                  )}
                </button>
              );
            })}
          </div>
        )}
        {this.state.selectedSpeciesGuess && (
          <div>
            <div
              style={{
                border: "solid 1px",
                width: "50%",
                marginLeft: "25%",
                marginTop: "10px",
                marginBottom: "5px",
              }}
            >
              Recording courtesy of {this.state.recordist} via{" "}
              <a
                target="_blank"
                rel="noreferrer"
                href={`http://xeno-canto.org/${this.state.birdsongId}`}
              >
                http://xeno-canto.org/{this.state.birdsongId}
              </a>
            </div>
            {this.state.livesLeft > 0 && (
              <button
                data-testid="next-clip"
                className="btn btn-info"
                onClick={() => this.getRandomBirdsong()}
              >
                Next -&gt;
              </button>
            )}
          </div>
        )}
      </div>
    );
  }
}

export default GameControls;
