import React from "react";
import Toggle from "react-toggle";
import "react-toggle/style.css"; // Import the styles

function ToggleComponent({ formData, handleChange, idView }) {
  return (
    <Toggle
      id="is_archived"
      name="is_archived"
      checked={formData.is_archived ? true : false}
      onChange={handleChange}
      disabled={idView ? true : false}
    />
  );
}

export default ToggleComponent;
