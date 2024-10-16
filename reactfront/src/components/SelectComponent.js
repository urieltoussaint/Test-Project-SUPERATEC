import React from 'react';
import { Form, Spinner, Alert } from 'react-bootstrap';
import useFetchOptions from './useFetchOptions';

const SelectComponent = ({ endpoint, nameField, valueField, selectedValue, handleChange, controlId, label }) => {
  const { options, loading, error } = useFetchOptions(endpoint, nameField, valueField);

  return (
    <Form.Group controlId={controlId}>
      <Form.Label>{label}</Form.Label>
      
        <Form.Control as="select" name={controlId} value={selectedValue} onChange={handleChange} >
          <option value="">Seleccione</option>
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.name}
            </option>
          ))}
        </Form.Control>
    </Form.Group>
  );
};

export default SelectComponent;
