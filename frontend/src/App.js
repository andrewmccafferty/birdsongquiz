import React, { Component } from 'react';
import HeadToHeadSpeciesSelector from './HeadToHeadSpeciesSelector';
import GameControls from './GameControls';
import GameExplanationModal from './GameExplanationModal'
import './App.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons'
class App extends Component {
    constructor(props) {
        super(props);
        const permalinkData = this.decodePermalink()
        this.state = {
            headToHeadSpeciesList: permalinkData ? permalinkData.presetSpecies : [],
            soundType: permalinkData ? permalinkData.soundType : null,
            gameExplanationOpen: false
        }
    }

    decodePermalink = () => {
        try {
            const urlParams = new URLSearchParams(window.location.search)
            const permalinkDataBase64 = urlParams.get('presets')
            if (!permalinkDataBase64) {
                return null
            }
            const permalinkData = JSON.parse(atob(permalinkDataBase64))
            return permalinkData
        } catch (e) {
            console.error("error decoding permalink data", e)
            return null
        }
    }

    onHeadToHeadSpeciesSelected = (headToHeadSpeciesList, soundType) => {
        this.setState((prevState, props) => {
            return {
                ...props,
                headToHeadSpeciesList,
                soundType
            }
        })
    }

    headToHeadLabel = () =>
        `Species: ${this.state.headToHeadSpeciesList.map(species => species.Species).join(", ")} ${this.state.soundType ? `(${this.state.soundType})` : ""}`

    headToHeadSharingLink = () => `${window.location.origin}?presets=${btoa(JSON.stringify({
        presetSpecies: this.state.headToHeadSpeciesList,
        soundType: this.state.soundType
    }))}`

    gameActive = () => this.state.headToHeadSpeciesList && this.state.headToHeadSpeciesList.length > 0

    resetQuiz = () => {
        this.setState((prevState, props) => {
            return {
                ...props,
                headToHeadSpeciesList: [],
                soundType: null
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
                <HeadToHeadSpeciesSelector onSelectionComplete={(headToHeadSpeciesList, soundType) => this.onHeadToHeadSpeciesSelected(headToHeadSpeciesList, soundType)} />
            }
            {
                this.state.headToHeadSpeciesList && this.state.headToHeadSpeciesList.length > 0 &&
                <div className="quiz-subheader">{this.headToHeadLabel()}</div>
            }
            {
                this.gameActive() &&
                <GameControls headToHeadSpecies={this.state.headToHeadSpeciesList} soundType={this.state.soundType} />
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
            
            <GameExplanationModal isOpen={this.state.gameExplanationOpen} onClose={() => this.closeGameExplanation()} />

        </div>
    }
}

export default App