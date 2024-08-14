import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import SelectComponent from '../../../components/SelectComponent';
import { useLoading } from '../../../components/LoadingContext';

const endpoint = 'http://localhost:8000/api';

const CreateCursos = () => {
  const { setLoading } = useLoading();
  const [formData, setFormData] = useState({
    descripcion: '',
    cantidad_horas: '',
    fecha_inicio: '',
    area_id: '',
    costo: ''
  });
  const [selectDataLoaded, setSelectDataLoaded] = useState(false); // Estado para seguimiento de la carga

  const navigate = useNavigate();

  useEffect(() => {
    const fetchSelectData = async () => {
      setLoading(true); // Inicia la animación de carga
      try {
        // Realiza las solicitudes necesarias para cargar los selectores
        await axios.get(`${endpoint}/area`);
        setSelectDataLoaded(true); // Indica que los datos han sido cargados
      } catch (error) {
        console.error('Error fetching select data:', error);
      } finally {
        setLoading(false); // Detiene la animación de carga
      }
    };

    fetchSelectData();
  }, [setLoading]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Inicia la animación de carga durante el envío del formulario
    try {
      await axios.post(`${endpoint}/cursos`, formData);
      window.alert('El curso ha sido registrado exitosamente.'); // Muestra la ventana de alerta
      navigate('/cursos');
    } catch (error) {
      console.error('Error creating data:', error);
    } finally {
      setLoading(false); // Detiene la animación de carga después de la respuesta del servidor
    }
  };

  return (
    <div className="container">
      <meta name="csrf-token" content="{{ csrf_token() }}" />
      <h1>Agregar Nuevo Curso</h1>
      <Form onSubmit={handleSubmit}>
        <script src="{{ mix('js/app.js') }}"></script>
        <div className="row">
          <div className="col-md-6">
            <Form.Group controlId="descripcion">
              <Form.Label>Nombre del Curso</Form.Label>
              <Form.Control
                type="text"
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group controlId="cantidad_horas">
              <Form.Label>Cantidad de Horas</Form.Label>
              <Form.Control
                type="text"
                name="cantidad_horas"
                value={formData.cantidad_horas}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group controlId="fecha_inicio">
              <Form.Label>Fecha de Inicio</Form.Label>
              <Form.Control
                type="date"
                name="fecha_inicio"
                value={formData.fecha_inicio}
                onChange={handleChange}
                required
              />
            </Form.Group>

            {selectDataLoaded && (
              <SelectComponent
                endpoint={`${endpoint}/area`}
                nameField="descripcion"
                valueField="id"
                selectedValue={formData.area_id}
                handleChange={handleChange}
                controlId="area_id"
                label="Área"
              />
            )}

            <Form.Group controlId="costo">
              <Form.Label>Costo del curso ($)</Form.Label>
              <Form.Control
                type="text"
                name="costo"
                value={formData.costo}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </div>
        </div>

        <Button variant="primary" type="submit">
          Guardar
        </Button>
        <Button 
          variant="secondary" 
          onClick={() => navigate('/cursos')}
          className="ms-2"
        >
          Volver
        </Button>
      </Form>
    </div>
  );
};

export default CreateCursos;
