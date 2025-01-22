import React, { Component } from 'react';
import HeadToHeadSpeciesSelector from './HeadToHeadSpeciesSelector';
import GameControls from './GameControls';
import './App.css';

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            headToHeadSpeciesList: []
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

    render() {
        return <div><h1>Head-to-Head Birdsong quiz</h1>
         { (!this.state.headToHeadSpeciesList || this.state.headToHeadSpeciesList.length === 0) &&
                <HeadToHeadSpeciesSelector onSelectionComplete={headToHeadSpeciesList => this.onHeadToHeadSpeciesSelected(headToHeadSpeciesList)}/>
            }
        {
            this.state.headToHeadSpeciesList && this.state.headToHeadSpeciesList.length > 0 &&
                <h2>{this.headToHeadLabel()}</h2>
        }
        { this.state.headToHeadSpeciesList && this.state.headToHeadSpeciesList.length > 0 &&
                    <GameControls headToHeadSpecies={this.state.headToHeadSpeciesList}/>}
        </div>
    }
}

export default App