import React, { Component } from 'react';
import HeadToHeadSpeciesSelector from './HeadToHeadSpeciesSelector';
import GameControls from './GameControls';
import './App.css';

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
        `Head to head species: ${this.state.headToHeadSpeciesList.map(species => species.Species).join(", ")}`

    headToHeadSharingLink = () => `${window.location.origin}?presetSpecies=${btoa(JSON.stringify(this.state.headToHeadSpeciesList))}`

    render() {
        return <div><h1>Head-to-Head Birdsong quiz</h1>
            {(!this.state.headToHeadSpeciesList || this.state.headToHeadSpeciesList.length === 0) &&
                <HeadToHeadSpeciesSelector onSelectionComplete={headToHeadSpeciesList => this.onHeadToHeadSpeciesSelected(headToHeadSpeciesList)} />
            }
            {
                this.state.headToHeadSpeciesList && this.state.headToHeadSpeciesList.length > 0 &&
                <h2>{this.headToHeadLabel()}</h2>
            }
            {this.state.headToHeadSpeciesList && this.state.headToHeadSpeciesList.length > 0 &&
                <GameControls headToHeadSpecies={this.state.headToHeadSpeciesList} />}
            {
                this.state.headToHeadSpeciesList && this.state.headToHeadSpeciesList.length > 0 &&
                <a href={this.headToHeadSharingLink()} style={{ 'margin-left': '5px' }}>permalink</a>
            }
        </div>
    }
}

export default App