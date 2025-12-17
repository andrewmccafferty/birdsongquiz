import React, { Component } from "react"
import "./Modal.css"
import { postApi } from "./api"
import { SpeciesEntry } from "./types"

interface SuggestPresetListModalProps {
  isOpen: boolean
  onClose: () => void
  speciesList: SpeciesEntry[]
  country: string
}

interface SuggestPresetListModalState {
  listName: string
  name: string
  email: string
  comments: string
  submitted: boolean
  submitting?: boolean
}

class SuggestPresetListModal extends Component<
  SuggestPresetListModalProps,
  SuggestPresetListModalState
> {
  constructor(props: SuggestPresetListModalProps) {
    super(props)
    this.state = {
      listName: "",
      name: "",
      email: "",
      comments: "",
      submitted: false,
    }
  }

  handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLDivElement).className === "modal") {
      this.props.onClose()
    }
  }

  submitList = () => {
    this.setState({ submitting: true })
    postApi("presets/suggestion", {
      region: this.props.country,
      listName: this.state.listName,
      speciesList: this.props.speciesList,
      name: this.state.name || undefined,
      email: this.state.email || undefined,
      comments: this.state.comments || undefined,
    })
      .then((result) => {
        console.log("Got result", result)
        this.setState({ submitted: true, submitting: false })
      })
      .catch(() => {
        alert("Something went wrong submitting your list. Try again.")
        this.setState({ submitting: false })
      })
  }

  isReadyToSubmit() {
    return this.state.listName && this.state.listName.length > 5
  }

  shouldShowSubmittingSpinner() {
    return this.state.submitting
  }

  render() {
    const { isOpen, speciesList, country } = this.props
    const { listName } = this.state

    if (!isOpen) return null

    return (
      <div className="modal" onClick={this.handleOverlayClick}>
        <div className="modal-box">
          <h2>Suggest Species List</h2>
          {this.state.submitted && (
            <div className="info-notice" style={{ marginTop: "20px" }}>
              <span className="info-icon">ℹ️</span>
              <div className="info-text">
                Thanks for your list suggestion! It'll be reviewed by a human,
                and should appear in the list soon.
              </div>
            </div>
          )}
          {this.state.submitted && (
            <button
              className="action-button"
              onClick={this.props.onClose}
              style={{ marginTop: "20px", width: "100%" }}
            >
              OK
            </button>
          )}
          {!this.state.submitted && (
            <div style={{ position: "relative" }}>
              {this.shouldShowSubmittingSpinner() && (
                <div className="spinner-overlay">
                  <div className="spinner"></div>
                </div>
              )}
              <p
                style={{
                  marginTop: "10px",
                  marginBottom: "20px",
                  color: "#555",
                }}
              >
                Like this list of species? Want to suggest it as a preset for
                others to use?
              </p>

              <div className="form-group">
                <label
                  style={{
                    display: "block",
                    fontWeight: "bold",
                    marginBottom: "8px",
                    color: "#333",
                  }}
                >
                  Species ({speciesList.length}):
                </label>
                {speciesList && speciesList.length ? (
                  <div className="selected-species-list">
                    {speciesList.map((entry, i) => (
                      <span className="species-tag" key={entry.Species || i}>
                        {entry.Species}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p>No species available.</p>
                )}
              </div>

              <div className="form-group">
                <label
                  style={{
                    display: "block",
                    fontWeight: "bold",
                    marginBottom: "8px",
                    color: "#333",
                  }}
                >
                  Region:
                </label>
                <div
                  style={{
                    padding: "8px 12px",
                    background: "#f9f9f9",
                    border: "1px solid #e0e0e0",
                    borderRadius: "6px",
                  }}
                >
                  {country}
                </div>
              </div>

              <div className="form-group">
                <label
                  htmlFor="list-name"
                  style={{
                    display: "block",
                    fontWeight: "bold",
                    marginBottom: "8px",
                    color: "#333",
                  }}
                >
                  List Name:
                </label>
                <input
                  type="text"
                  id="list-name"
                  value={listName}
                  placeholder="e.g., Common Garden Birds"
                  onChange={(e) => this.setState({ listName: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    border: "1px solid #cccccc",
                    borderRadius: "6px",
                    fontSize: "1em",
                    boxSizing: "border-box",
                  }}
                />
                {listName && listName.length < 6 && (
                  <div
                    style={{
                      color: "#d9534f",
                      fontSize: "0.85em",
                      marginTop: "4px",
                    }}
                  >
                    Name must be at least 6 characters
                  </div>
                )}
              </div>

              <div className="form-group">
                <label
                  htmlFor="submitter-name"
                  style={{
                    display: "block",
                    fontWeight: "bold",
                    marginBottom: "8px",
                    color: "#333",
                  }}
                >
                  Your Name (optional):
                </label>
                <input
                  type="text"
                  id="submitter-name"
                  value={this.state.name}
                  placeholder="Your name"
                  onChange={(e) => this.setState({ name: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    border: "1px solid #cccccc",
                    borderRadius: "6px",
                    fontSize: "1em",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div className="form-group">
                <label
                  htmlFor="submitter-email"
                  style={{
                    display: "block",
                    fontWeight: "bold",
                    marginBottom: "8px",
                    color: "#333",
                  }}
                >
                  Your Email (optional):
                </label>
                <input
                  type="email"
                  id="submitter-email"
                  value={this.state.email}
                  placeholder="your@email.com"
                  onChange={(e) => this.setState({ email: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    border: "1px solid #cccccc",
                    borderRadius: "6px",
                    fontSize: "1em",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div className="form-group">
                <label
                  htmlFor="comments"
                  style={{
                    display: "block",
                    fontWeight: "bold",
                    marginBottom: "8px",
                    color: "#333",
                  }}
                >
                  Comments (optional):
                </label>
                <textarea
                  id="comments"
                  value={this.state.comments}
                  placeholder="Any additional context or suggestions..."
                  onChange={(e) => this.setState({ comments: e.target.value })}
                  rows={3}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    border: "1px solid #cccccc",
                    borderRadius: "6px",
                    fontSize: "1em",
                    boxSizing: "border-box",
                    resize: "vertical",
                    fontFamily: "inherit",
                  }}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  marginTop: "24px",
                }}
              >
                <button
                  className="action-button"
                  disabled={!this.isReadyToSubmit()}
                  onClick={this.submitList}
                  style={{ flex: 1 }}
                >
                  Submit
                </button>
                <button
                  className="action-button"
                  onClick={this.props.onClose}
                  style={{
                    flex: 1,
                    background: "#6c757d",
                  }}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.background = "#5a6268")
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.background = "#6c757d")
                  }
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }
}

export default SuggestPresetListModal
