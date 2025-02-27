import React from 'react';
import { Form } from 'react-bootstrap';

const SelectComponent = ({ 
  options, 
  nameField, 
  valueField, 
  selectedValue, 
  handleChange, 
  controlId, 
  label, 
  defaultOptionLabel = "Seleccione"  
}) => {
  return (
    <Form.Group controlId={controlId} > {/* Espaciado inferior para separación */}
      {label && <Form.Label>{label}</Form.Label>} {/* Ahora el label se mostrará correctamente */}
      <Form.Control 
        as="select" 
        name={controlId} 
        value={selectedValue} 
        onChange={handleChange} 
      >
        <option value="">{defaultOptionLabel}</option>
        {options.map(option => (
          <option key={option[valueField]} value={option[valueField]}>
            {option[nameField]}
          </option>
        ))}
      </Form.Control>
    </Form.Group>
  );
};




export default SelectComponent;
