import React from 'react';
import { Form } from 'react-bootstrap';
import useFetchOptions from './useFetchOptions';

const SelectComponent = ({ endpoint, nameField, valueField, selectedValue, handleChange, controlId, label }) => {
  const { options, loading, error } = useFetchOptions(endpoint, nameField, valueField);

  // if (loading) return <p>Loading...</p>;
  // if (error) return <p>Error: {error.message}</p>;


  return (
    <Form.Group controlId={controlId}>
      <Form.Label>{label}</Form.Label>
      <Form.Control as="select" name={controlId} value={selectedValue} onChange={handleChange} required>
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
