import React, { Component } from 'react';
import HeadToHeadSpeciesSelector from './HeadToHeadSpeciesSelector';
import GameControls from './GameControls';
import GameExplanationModal from './GameExplanationModal';
import SuggestPresetListModal from './SuggestPresetListModal';
import CopyPermalinkButton from './CopyPermalinkButton';
import { faArrowsRotate, faInfoCircle, faClipboardCheck } from "@fortawesome/free-solid-svg-icons";
import './App.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
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

    onHeadToHeadSpeciesSelected = (headToHeadSpeciesList, soundType, country) => {
        this.setState((prevState, props) => {
            return {
                ...props,
                headToHeadSpeciesList,
                soundType,
                country
            }
        })
    }

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
    
    openSuggestPresetListModal = () => {
        this.setState((prevState, props) => {
            return {
                ...props,
                suggestPresetListModalOpen: true
            }
        })
    }

    closeSuggestPresetListModal = () => {
        this.setState((prevState, props) => {
            return {
                ...props,
                suggestPresetListModalOpen: false
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
                <HeadToHeadSpeciesSelector onSelectionComplete={(headToHeadSpeciesList, soundType, country) => this.onHeadToHeadSpeciesSelected(headToHeadSpeciesList, soundType, country)} />
            }
            {
                this.gameActive() && (
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
                        <button className="small-button"
                        onClick={ () => this.openSuggestPresetListModal()}
                        title="Suggest this list of species as a preset">
                            <FontAwesomeIcon icon={faClipboardCheck}/>
                        </button>
                    </div>
                )
            }
            {
                this.gameActive() &&
                <div>
                    <GameControls headToHeadSpecies={this.state.headToHeadSpeciesList} soundType={this.state.soundType} />
                    <SuggestPresetListModal isOpen={this.state.suggestPresetListModalOpen} 
                        onClose={() => this.closeSuggestPresetListModal() } 
                        speciesList={this.state.headToHeadSpeciesList}
                        country={this.state.country}/>
                </div>
            }
            <GameExplanationModal isOpen={this.state.gameExplanationOpen} onClose={() => this.closeGameExplanation()} />

        </div>
    }
}

export default App