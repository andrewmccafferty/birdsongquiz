import React from "react";
import "./Modal.css";

const SuggestPresetListModal = ({ isOpen, onClose, speciesList, country }) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target.className === "modal") {
      onClose();
    }
  };

  const submitList = () => {
    const input = document.getElementById("list-name");
    const listName = input ? input.value.trim() : "";
    console.log(listName);
    onClose();
  }

  return (
    <div className="modal" onClick={handleOverlayClick}>
            <div className="modal-box">
                <span className="close-btn" onClick={onClose}>
                    &times;
                </span>
                <h2>Suggest species list</h2>
                <p>Like this list of species? Want to suggest it as a preset for others to use?</p>
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
                  <label for="list-name">Give your list a name:</label><input type="text" id="list-name"/>
                </div>
                <div>
                  <button onClick={submitList}>Submit</button>
                </div>
            </div>
        </div>
  );
};

export default SuggestPresetListModal;
