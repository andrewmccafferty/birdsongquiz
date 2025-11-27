import React, { Component } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy } from "@fortawesome/free-solid-svg-icons";

class CopyPermalinkButton extends Component {
  constructor(props) {
    super(props);
    this.state = {
      copied: false
    };
  }

  handleCopy = async () => {
    const { permalink } = this.props;

    try {
      await navigator.clipboard.writeText(permalink);
      this.setState({ copied: true });

      setTimeout(() => this.setState({ copied: false }), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  render() {
    const { copied } = this.state;

    return (
      <button
        onClick={this.handleCopy}
        title={copied ? "Copied!" : "Copy permalink"}
        style={{
          padding: "0.4rem 0.6rem",
          cursor: "pointer",
          background: "transparent",
          border: "none",
          fontSize: "1.2rem"
        }}
      >
        <FontAwesomeIcon icon={faCopy} />
      </button>
    );
  }
}

export default CopyPermalinkButton;
