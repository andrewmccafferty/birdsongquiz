import React, { Component } from "react";
import "./Modal.css";
import { postApi } from "./api";
import { SpeciesEntry } from "./types";

interface SuggestPresetListModalProps {
  isOpen: boolean;
  onClose: () => void;
  speciesList: SpeciesEntry[];
  country: string;
}

interface SuggestPresetListModalState {
  listName: string;
  submitted: boolean;
  submitting?: boolean;
}

class SuggestPresetListModal extends Component<
  SuggestPresetListModalProps,
  SuggestPresetListModalState
> {
  constructor(props: SuggestPresetListModalProps) {
    super(props);
    this.state = {
      listName: "",
      submitted: false,
    };
  }

  handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLDivElement).className === "modal") {
      this.props.onClose();
    }
  };

  submitList = () => {
    this.setState({ submitting: true });
    postApi("presets/suggestion", {
      region: this.props.country,
      listName: this.state.listName,
      speciesList: this.props.speciesList,
    })
      .then((result) => {
        console.log("Got result", result);
        this.setState({ submitted: true, submitting: false });
      })
      .catch(() => {
        alert("Something went wrong submitting your list. Try again.");
        this.setState({ submitting: false });
      });
  };

  isReadyToSubmit() {
    return this.state.listName && this.state.listName.length > 5;
  }

  shouldShowSubmittingSpinner() {
    return this.state.submitting;
  }

  render() {
    const { isOpen, onClose, speciesList, country } = this.props;
    const { listName } = this.state;

    if (!isOpen) return null;

    return (
      <div className="modal" onClick={this.handleOverlayClick}>
        <div className="modal-box">
          <span className="close-btn" onClick={onClose}>
            &times;
          </span>

          <h2>Suggest species list</h2>
          {this.state.submitted && (
            <div className="info-notice">
              <span className="info-icon">ℹ️</span>
              <div className="info-text">
                Thanks for your list suggestion! It'll be reviewed by a human,
                and should appear in the list soon.
                <button className="action-button" onClick={this.props.onClose}>
                  OK
                </button>
              </div>
            </div>
          )}
          {!this.state.submitted && (
            <div>
              {this.shouldShowSubmittingSpinner() && (
                <div className="spinner-overlay">
                  <div className="spinner"></div>
                </div>
              )}
              <p>
                Like this list of species? Want to suggest it as a preset for
                others to use?
              </p>

              <div>Species:</div>
              {speciesList && speciesList.length ? (
                <ul>
                  {speciesList.map((entry, i) => (
                    <li key={entry.Species || i}>{entry.Species}</li>
                  ))}
                </ul>
              ) : (
                <p>No species available.</p>
              )}

              <div>Region: {country}</div>

              <div className="input-container">
                <label htmlFor="list-name">Give your list a name:</label>
                <input
                  type="text"
                  id="list-name"
                  value={listName}
                  onChange={(e) => this.setState({ listName: e.target.value })}
                />
              </div>

              <div className="input-container">
                <button
                  className="action-button"
                  disabled={!this.isReadyToSubmit()}
                  onClick={this.submitList}
                >
                  Submit
                </button>
                <button className="action-button" onClick={this.props.onClose}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default SuggestPresetListModal;
