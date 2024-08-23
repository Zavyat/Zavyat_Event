import React, { useState, useCallback, useRef, useEffect } from "react";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import {
  handleDragStart,
  handleDrop,
  handleDragOver,
  initializeEventHandlers,
} from "./script";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

function Event() {
  const [containerClass, setContainerClass] = useState("");
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [presetUndoStack, setPresetUndoStack] = useState([]);
  const [presetRedoStack, setPresetRedoStack] = useState([]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const containerRef = useRef(null);
  const sidebarRef = useRef(null);
  const [presets, setPresets] = useState([]);

  useEffect(
    () => {
      if (sidebarRef.current) {
        initializeEventHandlers(setContainerClass);
        saveCurrentState(); // Save initial state
        savePresetState(); // Save initial preset state
      }
    },
    // eslint-disable-next-line
    []
  );

  const saveCurrentState = () => {
    if (containerRef.current) {
      const containerHTML = containerRef.current.innerHTML;
      const currentState = {
        containerHTML,
        scrollTop: containerRef.current.scrollTop,
      };
      setUndoStack((prevStack) => [...prevStack, currentState]);
      setRedoStack([]); // Clear redo stack whenever a new state is saved
    }
  };

  const savePresetState = useCallback(() => {
    setPresetUndoStack((prevStack) => [
      { presets: [...presets] },
      ...prevStack,
    ]);
    setPresetRedoStack([]); // Clear redo stack whenever a new state is saved
  }, [presets]);

  const undo = () => {
    if (undoStack.length > 1) {
      const newRedoStack = [...redoStack, undoStack.pop()];
      setRedoStack(newRedoStack);
      const lastState = undoStack[undoStack.length - 1];
      applyState(lastState);
      setUndoStack([...undoStack]); // Update the undo stack without the latest state
    }
  };

  const redo = () => {
    if (redoStack.length > 0) {
      const nextState = redoStack.pop();
      setUndoStack((prevStack) => [...prevStack, nextState]);
      applyState(nextState);
    }
  };

  const applyState = (state) => {
    if (containerRef.current) {
      containerRef.current.innerHTML = state.containerHTML;
      containerRef.current.scrollTop = state.scrollTop;
    }
  };

  const undoPresets = () => {
    if (presetUndoStack.length > 0) {
      const lastState = presetUndoStack[0]; // Get the most recent undo state
      setPresetUndoStack((prevStack) => prevStack.slice(1)); // Remove the most recent undo state
      setPresetRedoStack((prevStack) => [lastState, ...prevStack]); // Push it to the redo stack
      setPresets(lastState.presets); // Apply the undo state
    }
  };

  // eslint-disable-next-line
  const redoPresets = () => {
    if (presetRedoStack.length > 0) {
      const nextState = presetRedoStack[0]; // Get the next redo state
      setPresetRedoStack((prevStack) => prevStack.slice(1)); // Remove it from the redo stack
      setPresetUndoStack((prevStack) => [nextState, ...prevStack]); // Push it to the undo stack
      setPresets(nextState.presets); // Apply the redo state
    }
  };

  const clearContainer = () => {
    saveCurrentState();
    if (containerRef.current) {
      containerRef.current.innerHTML = "";
    }
    saveCurrentState(); // Save the cleared state
  };

  const saveAsImage = () => {
    if (containerRef.current) {
      html2canvas(containerRef.current).then((canvas) => {
        const link = document.createElement("a");
        link.download = "container.png";
        link.href = canvas.toDataURL();
        link.click();
      });
    }
  };

  const saveAsPDF = () => {
    if (containerRef.current) {
      html2canvas(containerRef.current, {
        scrollX: 0,
        scrollY: -window.scrollY,
        height: containerRef.current.scrollHeight,
        width: containerRef.current.scrollWidth,
        useCORS: true,
      }).then((canvas) => {
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF({
          orientation: "landscape",
          unit: "px",
          format: [canvas.width, canvas.height],
        });
        pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
        pdf.save("container.pdf");
      });
    }
  };

  const toggleDropdown = (dropdownId) => {
    setActiveDropdown((prevDropdown) =>
      prevDropdown === dropdownId ? null : dropdownId
    );
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => !prev);
  };

  const saveEvent = () => {
    // Ensure you are not adding more than 6 presets
    if (presets.length >= 6) {
      alert("You can only save up to 6 presets.");
      return; // Exit the function if there are already 6 presets
    }

    // Proceed to save the new preset
    if (containerRef.current) {
      html2canvas(containerRef.current).then((canvas) => {
        const imgData = canvas.toDataURL("image/png");
        const newPreset = {
          containerHTML: containerRef.current.innerHTML,
          image: imgData,
        };
        // Use a callback function to safely update state based on previous state
        setPresets((prevPresets) => {
          if (prevPresets.length >= 6) {
            alert("You can only save up to 6 presets.");
            return prevPresets; // Return the current presets if limit is reached
          }
          savePresetState(); // Save preset state before updating
          return [...prevPresets, newPreset]; // Add the new preset if within the limit
        });
      });
    }
  };

  const deletePreset = (index) => {
    if (window.confirm("Are you sure you want to delete this preset?")) {
      savePresetState(); // Save preset state before updating
      setPresets((prevPresets) => prevPresets.filter((_, i) => i !== index));
    }
  };

  const generatePresetPreviews = () => {
    return (
      <div className="preset-grid">
        {presets.map((preset, index) => (
          <div key={index} className="preset-item">
            <img
              src={preset.image}
              alt={`Preset ${index}`}
              className="preset-preview-img"
              onClick={() => applyPreset(preset)}
            />
            <button
              className="btn btn-danger btn-sm delete-preset-btn"
              onClick={() => deletePreset(index)}
            >
              X
            </button>
          </div>
        ))}
      </div>
    );
  };

  const applyPreset = (preset) => {
    if (containerRef.current) {
      // Clear the container and apply the preset HTML
      containerRef.current.innerHTML = preset.containerHTML;
      containerRef.current.scrollTop = preset.scrollTop; // Restore the scroll position
      saveCurrentState(); // Save state after applying preset
    }
  };

  useEffect(() => {
    if (sidebarRef.current) {
      const dropdownButtons =
        sidebarRef.current.querySelectorAll(".dropdown-btn");
      dropdownButtons.forEach((button) => {
        const dropdownContent = button.nextElementSibling;
        if (activeDropdown === parseInt(button.getAttribute("data-id"))) {
          dropdownContent.style.display = "block";
        } else {
          dropdownContent.style.display = "none";
        }
      });
    }
  }, [activeDropdown]);

  return (
    <div
      className={`customApp ${isSidebarCollapsed ? "sidebar-collapsed" : ""}`}
    >
      {/* View Presets modal code */}
      <div
        className="modal fade"
        id="exampleModal"
        tabIndex="-1"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="exampleModalLabel">
                Events:
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">{generatePresetPreviews()}</div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Close
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={undoPresets}
              >
                Undo Preset
              </button>
              {/* <button
                type="button"
                className="btn btn-primary"
                onClick={redoPresets}
              >
                Redo Preset
              </button> */}
            </div>
          </div>
        </div>
      </div>

      {/* Navbar */}
      <nav
        className="navbar navbar-expand-lg bg-body-tertiary"
        style={{ padding: "0%" }}
      >
        <div className="container-fluid">
          <a href="https://www.zavyat.com/">
            <img
              src="./Zavyat.png"
              alt="Zavyat"
              style={{
                width: "50px",
                height: "50px",
                objectFit: "cover",
                marginLeft: "30px",
              }}
            ></img>
          </a>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav">
              {/* Empty ul to push the next ul to the right */}
            </ul>
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <div className="customSidebar-item" onClick={toggleSidebar}>
                  Menu
                </div>
              </li>
              <li className="nav-item">
                <div className="customSidebar-item" onClick={saveAsImage}>
                  Save as Image
                </div>
              </li>
              <li className="nav-item">
                <div className="customSidebar-item" onClick={saveAsPDF}>
                  Save as PDF
                </div>
              </li>
              <li className="nav-item">
                <div className="customSidebar-item" onClick={undo}>
                  Undo
                </div>
              </li>
              <li className="nav-item">
                <div className="customSidebar-item" onClick={redo}>
                  Redo
                </div>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <div className="row">
        <div
          className={`col-3 customSidebar ${
            isSidebarCollapsed ? "collapsed" : ""
          }`}
          id="customSidebar"
          ref={sidebarRef}
        >
          <div
            className="customSidebar-item customOutdoor"
            onClick={() => {
              setContainerClass("customOutdoor");
              saveCurrentState();
            }}
          >
            Outdoor
          </div>
          <div
            className="customSidebar-item customIndoor"
            onClick={() => {
              setContainerClass("customIndoor");
              saveCurrentState();
            }}
          >
            Indoor
          </div>
          <div
            className="customSidebar-item customClear"
            onClick={clearContainer}
          >
            Clear
          </div>
          <button
            className="dropdown-btn customSidebar-item"
            data-id="0"
            onClick={() => toggleDropdown(0)}
          >
            Images 1<i className="fa fa-caret-down"></i>
          </button>
          <div
            className={`dropdown-container ${
              activeDropdown === 0 ? "show" : ""
            }`}
          >
            <div className="row">
              <div className="col" style={{ paddingRight: "0%" }}>
                {["A", "B", "C", "D", "E"].map((letter) => (
                  <div
                    className="dropdown-item"
                    key={letter}
                    draggable="true"
                    onDragStart={(e) =>
                      handleDragStart(e, `./images/image${letter}.png`)
                    }
                  >
                    <img
                      src={`./images/image${letter}.png`}
                      alt={letter}
                      className="customImg-fluid"
                    />
                  </div>
                ))}
              </div>
              <div className="col" style={{ paddingRight: "0%" }}>
                {["F", "G", "H", "I", "J"].map((letter) => (
                  <div
                    className="dropdown-item"
                    key={letter}
                    draggable="true"
                    onDragStart={(e) =>
                      handleDragStart(e, `./images/image${letter}.png`)
                    }
                  >
                    <img
                      src={`./images/image${letter}.png`}
                      alt={letter}
                      className="customImg-fluid"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <button
            className="dropdown-btn customSidebar-item"
            data-id="1"
            onClick={() => toggleDropdown(1)}
          >
            Images 2<i className="fa fa-caret-down"></i>
          </button>
          <div
            className={`dropdown-container ${
              activeDropdown === 1 ? "show" : ""
            }`}
          >
            <div className="row">
              <div className="col" style={{ paddingRight: "0%" }}>
                {["K", "L", "M", "N", "O"].map((letter) => (
                  <div
                    className="dropdown-item"
                    key={letter}
                    draggable="true"
                    onDragStart={(e) =>
                      handleDragStart(e, `./images/image${letter}.png`)
                    }
                  >
                    <img
                      src={`./images/image${letter}.png`}
                      alt={letter}
                      className="customImg-fluid"
                    />
                  </div>
                ))}
              </div>
              <div className="col" style={{ paddingRight: "0%" }}>
                {["P", "Q", "R", "S", "T"].map((letter) => (
                  <div
                    className="dropdown-item"
                    key={letter}
                    draggable="true"
                    onDragStart={(e) =>
                      handleDragStart(e, `./images/image${letter}.png`)
                    }
                  >
                    <img
                      src={`./images/image${letter}.png`}
                      alt={letter}
                      className="customImg-fluid"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <button
            type="button"
            class="btn  customSidebar-item"
            data-bs-toggle="modal"
            data-bs-target="#exampleModal"
          >
            View Saved Events
          </button>
          <div className="customSidebar-item" onClick={saveEvent}>
            Save Event
          </div>
        </div>
        <div className={`col-9 ${isSidebarCollapsed ? "full-width" : ""}`}>
          <div
            id="customContainer"
            ref={containerRef}
            className={`customContainer ${containerClass}`}
            onDrop={(event) => {
              handleDrop(event);
              saveCurrentState();
            }}
            onDragOver={handleDragOver}
          >
            {/* Dropped items will appear here */}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Event;
