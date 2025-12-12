import React, { Component } from "react"
import ReactGA from "react-ga4"
import { PresetList } from "./types"

interface PresetSpeciesSelectorProps {
  presetLists: PresetList[]
  onSpeciesListChanged: (speciesListId: string) => void
}

interface PresetSpeciesSelectorState {
  presetLists: PresetList[]
}

class PresetSpeciesSelector extends Component<
  PresetSpeciesSelectorProps,
  PresetSpeciesSelectorState
> {
  constructor(props: PresetSpeciesSelectorProps) {
    super(props)
    this.state = {
      presetLists: props.presetLists,
    }
  }

  onSpeciesListChanged = (speciesListId: string) => {
    ReactGA.event({
      category: "User",
      action: `Used preset list:+${speciesListId}`,
    })
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
                onChange={(e) => this.onSpeciesListChanged(e.target.value)}
              >
                <option key="" value="">
                  (Please select)
                </option>
                {this.state.presetLists.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>
    )
  }
}

export default PresetSpeciesSelector
