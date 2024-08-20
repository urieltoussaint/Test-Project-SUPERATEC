import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import SelectComponent from '../../components/SelectComponent';
import './CreatePromocion.css';
import { useLoading } from '../../components/LoadingContext';
import 'react-toastify/dist/ReactToastify.css';
import { toast } from 'react-toastify';


const endpoint = 'http://localhost:8000/api';

const CreatePromocion = () => {
  const { setLoading } = useLoading();
  const [formData, setFormData] = useState({
    centro_id: '',
    cohorte_id: '',
    periodo_id: '',
    fecha_promocion: '',
    procedencia_id: '',
    mencion_id: '',
    estudiantes_asistentes: '',
    estudiantes_interesados: '',
    status_id: '',
    comentarios: '',
  });

  const [selectDataLoaded, setSelectDataLoaded] = useState(false); // Estado para seguimiento de la carga
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSelectData = async () => {
      setLoading(true); // Inicia la animación de carga
      try {
        // Realiza las solicitudes necesarias para cargar los selectores
        const token = localStorage.getItem('token');
        await Promise.all([

          axios.get(`${endpoint}/centro`,{
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }),
          axios.get(`${endpoint}/cohorte`,{
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }),
          axios.get(`${endpoint}/periodo`,{
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }),
          axios.get(`${endpoint}/procedencia`,{
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }),
          axios.get(`${endpoint}/mencion`,{
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }),
          axios.get(`${endpoint}/status_seleccion`,{
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }),
        ]);
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
      const token = localStorage.getItem('token');
      await axios.post(`${endpoint}/promocion`, formData,{
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
      toast.success('Promoción creada con Éxito');
      navigate('/promocion');
    } catch (error) {
      toast.error('Error al crear Promoción');
      console.error('Error creating data:', error);
    } finally {
      setLoading(false); // Detiene la animación de carga después de la respuesta del servidor
    }
  };

  return (
    <div className="container">
      <meta name="csrf-token" content="{{ csrf_token() }}" />
      <h1>Agregar Nueva Promoción</h1>
      <Form onSubmit={handleSubmit}>
        <script src="{{ mix('js/app.js') }}"></script>
        <div className="row">
          <div className="col-md-6">

            {selectDataLoaded && (
              <>
                <SelectComponent
                  endpoint={`${endpoint}/centro`}
                  nameField="descripcion"
                  valueField="id"
                  selectedValue={formData.centro_id}
                  handleChange={handleChange}
                  controlId="centro_id"
                  label="Centro"
                />
                <SelectComponent
                  endpoint={`${endpoint}/cohorte`}
                  nameField="descripcion"
                  valueField="id"
                  selectedValue={formData.cohorte_id}
                  handleChange={handleChange}
                  controlId="cohorte_id"
                  label="Cohorte"
                />
                <SelectComponent
                  endpoint={`${endpoint}/periodo`}
                  nameField="descripcion"
                  valueField="id"
                  selectedValue={formData.periodo_id}
                  handleChange={handleChange}
                  controlId="periodo_id"
                  label="Periodo"
                />
                <SelectComponent
                  endpoint={`${endpoint}/procedencia`}
                  nameField="descripcion"
                  valueField="id"
                  selectedValue={formData.procedencia_id}
                  handleChange={handleChange}
                  controlId="procedencia_id"
                  label="Procedencia"
                />
                <SelectComponent
                  endpoint={`${endpoint}/mencion`}
                  nameField="descripcion"
                  valueField="id"
                  selectedValue={formData.mencion_id}
                  handleChange={handleChange}
                  controlId="mencion_id"
                  label="Mención"
                />
                <SelectComponent
                  endpoint={`${endpoint}/status_seleccion`}
                  nameField="descripcion"
                  valueField="id"
                  selectedValue={formData.status_id}
                  handleChange={handleChange}
                  controlId="status_id"
                  label="Status"
                />
              </>
            )}

            <Form.Group controlId="fecha_promocion">
              <Form.Label>Fecha de Promoción</Form.Label>
              <Form.Control
                type="date"
                name="fecha_promocion"
                value={formData.fecha_promocion}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group controlId="estudiantes_asistentes">
              <Form.Label>Estudiantes Asistentes</Form.Label>
              <Form.Control
                type="number"
                name="estudiantes_asistentes"
                value={formData.estudiantes_asistentes}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group controlId="estudiantes_interesados">
              <Form.Label>Estudiantes Interesados</Form.Label>
              <Form.Control
                type="number"
                name="estudiantes_interesados"
                value={formData.estudiantes_interesados}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group controlId="comentarios">
              <Form.Label>Comentarios</Form.Label>
              <Form.Control
                type="text"
                name="comentarios"
                value={formData.comentarios}
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
          onClick={() => navigate('/promocion')}
          className="ms-2"
        >
          Volver
        </Button>
      </Form>
    </div>
  );
};

export default CreatePromocion;
