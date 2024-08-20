import React from 'react';
import { Form, Spinner, Alert } from 'react-bootstrap';
import useFetchOptions from './useFetchOptions';

const SelectComponent = ({ endpoint, nameField, valueField, selectedValue, handleChange, controlId, label }) => {
  const { options, loading, error } = useFetchOptions(endpoint, nameField, valueField);

  return (
    <Form.Group controlId={controlId}>
      <Form.Label>{label}</Form.Label>
      {loading ? (
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Cargando...</span>
        </Spinner>
      ) : error ? (
        <Alert variant="danger">
          Error al cargar opciones: {error.message}
        </Alert>
      ) : (
        <Form.Control as="select" name={controlId} value={selectedValue} onChange={handleChange} required>
          <option value="">Seleccione</option>
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.name}
            </option>
          ))}
        </Form.Control>
      )}
    </Form.Group>
  );
};

export default SelectComponent;
