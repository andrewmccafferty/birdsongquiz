import React, { Component } from 'react';
import HeadToHeadSpeciesSelector from './HeadToHeadSpeciesSelector';
import GameControls from './GameControls';
import './App.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons'
class App extends Component {
    constructor(props) {
        super(props);
        const presetSpecies = this.decodePresetSpecies()
        this.state = {
            headToHeadSpeciesList: presetSpecies ? presetSpecies : []
        }
    }

    decodePresetSpecies = () => {
        try {
            const urlParams = new URLSearchParams(window.location.search)
            const presetSpeciesBase64 = urlParams.get('presetSpecies')
            if (!presetSpeciesBase64) {
                return null
            }
            const presetSpecies = JSON.parse(atob(presetSpeciesBase64))
            return presetSpecies
        } catch (e) {
            console.error("error decoding preset species", e)
            return null
        }
    }

    onHeadToHeadSpeciesSelected = headToHeadSpeciesList => {
        this.setState((prevState, props) => {
            return {
                ...props,
                headToHeadSpeciesList
            }
        })
    }

    headToHeadLabel = () =>
        `Species: ${this.state.headToHeadSpeciesList.map(species => species.Species).join(", ")}`

    headToHeadSharingLink = () => `${window.location.origin}?presetSpecies=${btoa(JSON.stringify(this.state.headToHeadSpeciesList))}`

    gameActive = () => this.state.headToHeadSpeciesList && this.state.headToHeadSpeciesList.length > 0

    resetQuiz = () => {
        this.setState((prevState, props) => {
            return {
                ...props,
                headToHeadSpeciesList: []
            }
        })
    }

    closeGameExplanation = () => {
        this.setState((prevState, props) => {
            return {
                ...props,
                gameExplanationOpen: false
            }
        })
    }

    openGameExplanation = () => { 
        this.setState((prevState, props) => {
            return {
                ...props,
                gameExplanationOpen: true
            }
        })
    }

    render() {
        return <div className="quiz-container">
            <div className="quiz-header">Head-to-Head Birdsong Quiz

            <FontAwesomeIcon className="info-link" icon={faInfoCircle} onClick={() => this.openGameExplanation()}/>
            </div>
            {(!this.state.headToHeadSpeciesList || this.state.headToHeadSpeciesList.length === 0) &&
                <HeadToHeadSpeciesSelector onSelectionComplete={headToHeadSpeciesList => this.onHeadToHeadSpeciesSelected(headToHeadSpeciesList)} />
            }
            {
                this.state.headToHeadSpeciesList && this.state.headToHeadSpeciesList.length > 0 &&
                <div className="quiz-subheader">{this.headToHeadLabel()}</div>
            }
            {
                this.gameActive() &&
                <GameControls headToHeadSpecies={this.state.headToHeadSpeciesList} />
            }
            {
                this.gameActive() &&
                <div>
                    <button className="reset-button" onClick={() => this.resetQuiz()}>Reset Quiz</button>
                </div>
            }
            {
                this.gameActive() &&
                <a className="permalink" href={this.headToHeadSharingLink()}>permalink</a>
            }
            
            <div className="modal" id="gameExplanation" style={this.state.gameExplanationOpen ? { display: 'flex' } : { display: 'none' }}>
                <div className="modal-content">
                    <h2>How to Play</h2>
                    <p>This quiz is designed to test your ability to recognise birdsong.</p>
                    <p>You start by picking two or more species that you find difficult to distinguish</p>
                    <p>The quiz will then randomly select one of the species you select, and then randomly select examples of that species from <a href="http://www.xeno-canto.org">Xeno-Canto</a>, a worldwide website for birdsound sharing</p>
                    <p>You'll be asked which species you think it is, and the quiz will tell you if you're right. You get 5 "lives" and the quiz
                        will keep going until you run out of lives. See how far you can get!
                    </p>
                    <p>
                        If you don't want to go to the bitter end, you can hit the "Reset Quiz" button to start again.
                    </p>
                    <p>Quiz built by Andrew McCafferty. If you've got any feedback/suggestions, feel free to get in touch with me at <a href="mailto:feedback@birdsongquiz.co.uk">feedback@birdsongquiz.co.uk</a></p>
                    <button className="close-button" onClick={() => this.closeGameExplanation()}>Close</button>
                </div>
            </div>

        </div>
    }
}

export default App