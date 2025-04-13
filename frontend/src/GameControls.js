import React, { Component } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faTimes, faCrow } from '@fortawesome/free-solid-svg-icons'

class GameControls extends Component {
    constructor(props) {
        super(props);
        this.state = {
            headToHeadSpecies: props.headToHeadSpecies,
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
            guessCorrect: false
        };
    }

    componentDidMount() {
        this.getRandomBirdsong();
    }


    callApi = async (path) => {
        // TODO: if this API remains stable, switch back to the domain name
        //const API_ROOT = "https://api.birdsongquiz.co.uk"
        const API_ROOT = "https://asry9syqi9.execute-api.eu-west-2.amazonaws.com/prod"
        console.log("Calling API with path: ", path);
        const response = await fetch(`${API_ROOT}/${path}`);
        const body = await response.json();

        if (response.status !== 200) throw Error(body.message);

        return body;
    };

    clearGuess = () => {
        if (this.state.selectedSpeciesGuess) {
            this.setState((prevState, props) => {
                return {
                    ...props,
                    selectedSpeciesGuess: null
                }
            });
        }
    }

    onSpeciesGuessMade = (guess) => {
        if (this.state.selectedSpeciesGuess) {
            return
        }
        const guessCorrect = guess != null && guess.ScientificName.toLowerCase() === this.state.scientificName.toLowerCase();
        this.setState((prevState, props) => {
            let correctCount = guessCorrect ? prevState.correctCount + 1 : prevState.correctCount;
            const newCounter = prevState.counter + 1
            const newLivesLeft = !guessCorrect ? prevState.livesLeft - 1 : prevState.livesLeft
            return {
                ...props,
                selectedSpeciesGuess: guess,
                guessCorrect: guessCorrect,
                correctCount: correctCount,
                counter: newCounter,
                livesLeft: newLivesLeft
            }
        });
    };

    getRandomSpecies = () => {
        const speciesList = this.state.headToHeadSpecies
        const randomIndex = Math.floor(Math.random() * speciesList.length);
        return speciesList[randomIndex].ScientificName;
    }

    getRandomBirdsong = async () => {
        this.clearGuess();
        this.setState((prevState, props) => {
            return {
                ...props,
                errorLoading: false,
                loading: true,
                guessCorrect: false
            }
        });
        const url = `recording?species=${encodeURIComponent(this.getRandomSpecies())}`
        console.log("Calling API...", url),
            this.callApi(url).then(result => {
                this.setState((prevState, props) => {
                    if (result.noRecordings) {
                        return {
                            ...props,
                            noRecordingFound: true,
                            loading: false,
                            showSpecies: false
                        }
                    }
                    const recording = result.recording
                    const state = {
                        ...props,
                        birdsongId: recording.id,
                        species: recording.en,
                        recordist: recording.rec,
                        scientificName: recording.gen + ' ' + recording.sp,
                        loading: false,
                        showSpecies: false
                    }
                    console.log("Got recording and setting state: ", state);
                    return state
                });
            }).catch((err) => {
                console.log("Error getting recording", err);
                this.setState((prevState, props) => {
                    return {
                        ...props,
                        loading: false,
                        errorLoading: true
                    }
                })
            });
    }

    render() {
        return <div>
            {/* Loading indicator */}
            <h3>{this.state.correctCount} out of {this.state.counter} correct ({this.state.livesLeft} lives left)</h3>
            {this.state.loading && <div>Loading...</div>}
            {/* Error indicator */}
            {this.state.errorLoading && <div>Error loading data. Please <button href="#" onClick={() => { this.getRandomBirdsong(); }}>try again</button></div>}

            {/* No data found indicator */}
            {!this.state.loading && this.state.noRecordingFound && <span>No recording found</span>}

            {!this.state.loading &&
                !this.state.errorLoading &&
                this.state.birdsongId &&
                !this.state.noRecordingFound &&
                
                    <div className="audio-player">
                        <audio autoPlay={true} controls src={`https://www.xeno-canto.org/${this.state.birdsongId}/download`}>
                        Your browser does not support the audio element.
                        </audio>
                    </div>
            }

            {!this.state.loading &&
                this.state.headToHeadSpecies &&
                <div className="options">
                    {this.state.headToHeadSpecies.map(option => {
                        let backgroundColour = 'gray'
                        if (option === this.state.selectedSpeciesGuess) {
                            backgroundColour = this.state.guessCorrect ? 'green' : 'red'
                        }
                        if (this.state.selectedSpeciesGuess && !this.state.guessCorrect &&
                            option.ScientificName.toLowerCase() === this.state.scientificName.toLowerCase()) {
                            backgroundColour = 'green'
                        }
                        return <button key={option.Species} style={{
                            'backgroundColor': backgroundColour
                        }}
                            className={'option-button'}
                            onClick={() => this.onSpeciesGuessMade(option)}>{option.Species}
                            {backgroundColour === 'green' && <FontAwesomeIcon style={{ 'marginLeft': '5px' }} icon={faCheck} />}
                            {backgroundColour === 'red' && <FontAwesomeIcon style={{ 'marginLeft': '5px' }} icon={faTimes} />}
                        </button>
                    })
                    }
                </div>
            }
            {
                this.state.selectedSpeciesGuess &&
                <div>
                    <div style={{
                        'border': 'solid 1px',
                        'width': '50%',
                        'marginLeft': '25%',
                        'marginTop': '10px',
                        'marginBottom': '5px'
                    }}>
                        Recording courtesy of {this.state.recordist} via <a target="_blank" href={`http://xeno-canto.org/${this.state.birdsongId}`}>http://xeno-canto.org/{this.state.birdsongId}</a>
                    </div>
                    {this.state.livesLeft > 0 && <button className="btn btn-info" onClick={() => this.getRandomBirdsong()}>Next -></button>}
                </div>
            }
        </div>
    }
}

export default GameControls