import React, { Component } from 'react';
import HeadToHeadSpeciesSelector from './HeadToHeadSpeciesSelector';
import GameControls from './GameControls';
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
            
            <div className="modal" id="gameExplanation" style={this.state.gameExplanationOpen ? { display: 'flex' } : { display: 'none' }}>
                <div className="modal-content">
                    <h2>How to Play</h2>
                    <p>This quiz is designed to test your ability to recognise birdsong.</p>
                    <p>You start by picking two or more species that you find difficult to distinguish</p>
                    <p>If you like, you can also specify you want songs or calls (e.g. try out Robin vs Hawfinch calls)</p>
                    <p>The quiz will then randomly select one of the species you select, and then randomly select examples of that species 
                        from <a href="http://www.xeno-canto.org">Xeno-Canto</a>, a worldwide website for birdsound sharing</p>
                    <p>You'll be asked which species you think it is, and the quiz will tell you if you're right. You get 5 "lives" and the quiz
                        will keep going until you run out of lives. See how far you can get!
                    </p>
                    <p>
                        If you don't want to go to the bitter end, you can hit the "Reset Quiz" button to start again.
                    </p>
                    <p>
                        The data on Xeno-Canto is user-generated, so will sometimes be tagged incorrectly (e.g. a sound type tagged as call when it's song or vice versa), or include poor-quality recordings!
                    </p>
                    <p>Quiz built by Andrew McCafferty. If you've got any feedback/suggestions, feel free to get in touch with me at <a href="mailto:feedback@birdsongquiz.co.uk">feedback@birdsongquiz.co.uk</a></p>
                    <button className="close-button" onClick={() => this.closeGameExplanation()}>Close</button>
                </div>
            </div>

        </div>
    }
}

export default App