import React, {Component} from "react";
const speciesList = require('./species_list.js');
const presetSpeciesGroups = require('./preset_species_groups.js');
class PresetSpeciesSelector extends Component { 
    render() {
        return (
            <div>
                <div className="quiz-subheader">Select a preset species list</div>
                <div className="input-container">
                    <select className="species-selection" onChange={(e) => this.props.onSelectionComplete(e.target.value)}>
                        <option value="">Select a preset species list</option>
                        <option value="all">All species</option>
                        <option value="common">Common species</option>
                        <option value="rare">Rare species</option>
                    </select>
                </div>
            </div>
        )
    }
}