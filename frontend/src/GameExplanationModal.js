import React from "react";
import "./Modal.css";

const GameExplanationModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target.className === "modal") {
      onClose();
    }
  };

  const getCurrentAppVersion = () => {
    return process.env.CURRENT_APP_VERSION
  }

  return (
    <div className="modal" onClick={handleOverlayClick}>
      <div className="modal-box">
        <span className="close-btn" onClick={onClose}>
          &times;
        </span>
        <h2>How to Play</h2>
                    <p>This quiz is designed to test your ability to recognise birdsong.</p>
                    <p>You start by picking two or more species that you find difficult to distinguish</p>
                    <p>If you like, you can also specify you want songs or calls (e.g. try out Robin vs Hawfinch calls)</p>
                    <p>The quiz will then randomly select one of the species you select, and then randomly select examples of that species 
                        from <a href="http://www.xeno-canto.org">Xeno-Canto</a>, a worldwide website for birdsound sharing</p>
                    <p>You'll be asked which species you think it is, and the quiz will tell you if you're right. You get 5 "lives" and the quiz
                        will keep going until you run out of lives. See how far you can get!
                    </p>
                    <p>
                        If you don't want to go to the bitter end, you can hit the "Reset Quiz" button to start again.
                    </p>
                    <p>
                        The data on Xeno-Canto is user-generated, so will sometimes be tagged incorrectly (e.g. a sound type tagged as call when it's song or vice versa), or include poor-quality recordings!
                    </p>
                    <p>Quiz built by Andrew McCafferty. If you've got any feedback/suggestions, feel free to get in touch with me at <a href="mailto:feedback@birdsongquiz.co.uk">feedback@birdsongquiz.co.uk</a></p>
                    <p>(The current version running is {getCurrentAppVersion()})</p>
                    <button className="action-button" onClick={onClose}>OK</button>
                    
      </div>
    </div>
  );
};

export default GameExplanationModal;
