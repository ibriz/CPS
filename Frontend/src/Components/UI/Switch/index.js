import React, { useState } from 'react';

function SwitchComponent() {
  // State to store the switch value (true or false)
  const [isChecked, setIsChecked] = useState(false);

  // Function to handle the switch change
  const handleSwitchChange = () => {
    setIsChecked(!isChecked);
  };

  return (
    <div className="form-check form-switch">
      <input
        type="checkbox"
        className="form-check-input"
        id="customSwitch"
        checked={isChecked}
        onChange={handleSwitchChange}
      />
      <label className="form-check-label" htmlFor="customSwitch">
        {isChecked ? 'True' : 'False'}
      </label>
    </div>
  );
}

export default SwitchComponent;
