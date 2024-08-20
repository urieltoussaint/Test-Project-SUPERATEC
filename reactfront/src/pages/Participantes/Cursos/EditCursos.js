import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Button } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { useLoading } from '../../../components/LoadingContext';
import { ToastContainer,toast } from 'react-toastify';


const endpoint = 'http://localhost:8000/api';

const EditCursos = () => {
  const [formData, setFormData] = useState({
    descripcion: '',
    cantidad_horas: '',
    fecha_inicio: '',
    costo: '',
    area_id: ''
  });
  const [areas, setAreas] = useState([]);
  const [error, setError] = useState(null);
  const { id } = useParams(); // Obtener el id del curso de la URL
  const { setLoading } = useLoading();
  const navigate = useNavigate();


  useEffect(() => {
    setLoading(true);
    Promise.all([getAreas(), getCurso()]).finally(() => {
        setLoading(false);
    });
}, []);

 

  const getAreas = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${endpoint}/area`,{headers: {
        Authorization: `Bearer ${token}`,
    }});
      setAreas(response.data.data);
    } catch (error) {
      setError('Error fetching areas');
      console.error('Error fetching areas:', error);
    }
  };

  const getCurso = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${endpoint}/cursos/${id}`,{headers: {
        Authorization: `Bearer ${token}`,
    }});
      const curso = response.data;
      setFormData({
        descripcion: curso.descripcion || '',
        cantidad_horas: curso.cantidad_horas || '',
        fecha_inicio: curso.fecha_inicio || '',
        costo: curso.costo || '',
        area_id: curso.area_id || ''
      });
    } catch (error) {
      setError('Error fetching course');
      console.error('Error fetching course:', error);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${endpoint}/cursos/${id}`, formData,{headers: {
        Authorization: `Bearer ${token}`,
    }});
      navigate('/cursos');
      toast.success('Actualización con Éxito');
    } catch (error) {
      setError('Error updating course');
      console.error('Error updating course:', error);
      toast.error('Actualización con fallida');

    }
  };

  return (
    <div className="container">
      <meta name="csrf-token" content="{{ csrf_token() }}" />
      <h1>Actualizar Curso</h1>
      {error && <div className="alert alert-danger">{error}</div>}
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="descripcion">
          <Form.Label>Descripción</Form.Label>
          <Form.Control
            type="text"
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            maxLength={40}
            required
          />
        </Form.Group>

        <Form.Group controlId="cantidad_horas">
          <Form.Label>Cantidad de Horas</Form.Label>
          <Form.Control
            type="number"
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

        <Form.Group controlId="costo">
          <Form.Label>Costo</Form.Label>
          <Form.Control
            type="number"
            step="0.01"
            name="costo"
            value={formData.costo}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group controlId="area_id">
          <Form.Label>Área</Form.Label>
          <Form.Control
            as="select"
            name="area_id"
            value={formData.area_id}
            onChange={handleChange}
            required
          >
            <option value="">Seleccione un área</option>
            {areas.map((area) => (
              <option key={area.id} value={area.id}>{area.descripcion}</option>
            ))}
          </Form.Control>
        </Form.Group>

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

export default EditCursos;
