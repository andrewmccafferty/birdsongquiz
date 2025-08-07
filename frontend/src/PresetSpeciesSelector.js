import React, { Component } from "react";
import { presetListsForCountry } from "./presets";
class PresetSpeciesSelector extends Component {
  constructor(props) {
    super(props);
    this.state = {
      presetLists: props.presetLists,
    };
  }
  
  onSpeciesListChanged = (speciesListId) => {
    this.props.onSpeciesListChanged(speciesListId)
  }

  render() {
    return (
      <div>
        {this.state.presetLists && (
          <div>
            <div className="input-container">
              <select
                data-testid="preset-species-list"
                className="species-selection"
                onChange = { (e) => this.onSpeciesListChanged(e.target.value)}
              >
                <option key="" value="">(Please select)</option>
                {this.state.presetLists.map((item) => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default PresetSpeciesSelector;
