import React from 'react';
import './Thermometer.css';

function Thermometer({ temperature }) {
  // Assume max temp is 50°C; adjust as needed
  const maxTemp = 30;
  const fillPercent = Math.min((temperature / maxTemp) * 100, 100); // Cap at 100%

  return (
    <div className="thermometer">
      <div className="stem">
        <div className="stem-fill" style={{ height: `${fillPercent}%` }}></div>
      </div>
      <div className="bulb"></div>
      <div className="scale">
        <span>30°C</span>
        <span>0°C</span>
      </div>
    </div>
  );
}

export default Thermometer;
