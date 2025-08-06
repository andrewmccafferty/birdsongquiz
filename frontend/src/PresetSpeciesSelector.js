import React, { Component } from "react";
import { presetListsForCountry } from "./presets";
class PresetSpeciesSelector extends Component {
  constructor(props) {
    super(props);
    this.state = {
      presetLists: props.presetLists,
    };
  }

  render() {
    return (
      <div>
        {this.state.presetLists && (
          <div>
            <div className="quiz-subheader">
              ...or select one of these presets
            </div>
            <div className="input-container">
              <select
                data-testid="preset-species-list"
                className="species-selection"
              >
                <option key="">(Please select)</option>
                {this.state.presetLists.map((item) => (
                  <option key={item.id}>{item.name}</option>
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
