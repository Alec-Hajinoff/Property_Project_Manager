import React from "react";
import "./HumidityGauge.css";

function HumidityGauge({ humidity }) {
  // Rotate needle: Assume 0% = -90deg (left), 100% = 90deg (right)
  const rotation = (humidity / 100) * 180 - 90;

  return (
    <div className="gauge-wrapper">
      {" "}
      <div className="gauge">
        <div
          className="needle"
          style={{ transform: `rotate(${rotation}deg)` }}
        />
      </div>
      <div className="labels">
        {" "}
        <span>0%</span>
        <span>100%</span>
      </div>
    </div>
  );
}

export default HumidityGauge;
