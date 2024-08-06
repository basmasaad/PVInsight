import React from 'react';

const ComponentWithCheckbox = ({ title, children, onCheckboxChange, checked }) => {
    return (
      <div style={{ marginBottom: '20px', border: '1px solid #ddd', padding: '10px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ flex: 1 }}>
                {children}
            </div>
            <label className="flex items-center space-x-2" style={{ marginTop: '10px' }}>
                <input
                    type="checkbox"
                    onChange={onCheckboxChange}
                    checked={checked}
                />
                <span>{title}</span>
            </label>
        </div>
    );
  };
  export default ComponentWithCheckbox;