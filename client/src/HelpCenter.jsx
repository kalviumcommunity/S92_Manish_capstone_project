import React from "react";

function HelpCenter({ onClose }) {
  return (
    <div className="help-overlay" onClick={onClose}>

      <div
        className="help-modal"
        onClick={(e) => e.stopPropagation()}
      >

        {/* HEADER */}
        <div className="help-header">

          <div className="help-title">

            <div className="help-icon">
              ?
            </div>

            <div>
              <h2>Help Center</h2>
              <p>How can we help you?</p>
            </div>

          </div>

          <button
            className="help-close"
            onClick={onClose}
          >
            ×
          </button>

        </div>


        {/* DESCRIPTION */}
        <p className="help-description">
          Find helpful information about using Community Connect.
        </p>


        {/* HELP OPTIONS */}
        <div className="help-options">

          <div className="help-option">
            <div className="option-icon">
              🏠
            </div>

            <div>
              <h3>Getting Started</h3>
              <p>
                Learn how to use the Community Connect dashboard.
              </p>
            </div>
          </div>


          <div className="help-option">
            <div className="option-icon">
              📊
            </div>

            <div>
              <h3>Understanding Analytics</h3>
              <p>
                Learn how engagement scores and analytics work.
              </p>
            </div>
          </div>


          <div className="help-option">
            <div className="option-icon">
              📋
            </div>

            <div>
              <h3>Managing Programs</h3>
              <p>
                Learn how to add, edit and delete community programs.
              </p>
            </div>
          </div>


          <div className="help-option">
            <div className="option-icon">
              📤
            </div>

            <div>
              <h3>Uploading Data</h3>
              <p>
                Learn how to upload CSV and Excel files.
              </p>
            </div>
          </div>


          <div className="help-option">
            <div className="option-icon">
              ❓
            </div>

            <div>
              <h3>Frequently Asked Questions</h3>
              <p>
                Find answers to common questions about the system.
              </p>
            </div>
          </div>

        </div>


        {/* FOOTER */}
        <div className="help-footer">

          <div>
            <strong>Still need help?</strong>
            <p>Contact your administrator for additional support.</p>
          </div>

          <button onClick={onClose}>
            Got it
          </button>

        </div>

      </div>

    </div>
  );
}

export default HelpCenter;