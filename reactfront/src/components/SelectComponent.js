import React from 'react';
import { Form } from 'react-bootstrap';

const SelectComponent = ({ options, nameField, valueField, selectedValue, handleChange, controlId, label }) => {
  return (
    <Form.Group controlId={controlId}>
      <Form.Label>{label}</Form.Label>
      <Form.Control as="select" name={controlId} value={selectedValue} onChange={handleChange}>
        <option value="">Seleccione</option>
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
