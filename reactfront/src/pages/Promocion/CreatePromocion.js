import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import SelectComponent from '../../components/SelectComponent';
import './CreatePromocion.css';
import { useLoading } from '../../components/LoadingContext';
import 'react-toastify/dist/ReactToastify.css';
import { toast } from 'react-toastify';
import { Card, Row, Col } from 'react-bootstrap'; 



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
    comentarios: '',
  });

  const [filterOptions, setFilterOptions] = useState({
    centroOptions: [],
    periodoOptions: [],
    cohorteOptions: [],
    mencionOptions: [],
    procedenciaOptions: [],

});

  const [selectDataLoaded, setSelectDataLoaded] = useState(false); // Estado para seguimiento de la carga
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSelectData = async () => {
      setLoading(true); // Inicia la animación de carga
        HandleSelected ();
        setLoading(false); // Detiene la animación de carga
      
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


  const HandleSelected = async () => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${endpoint}/filter-promocion`, { headers: { Authorization: `Bearer ${token}` } });

        const {centro,periodo,cohorte,mencion,procedencia}=response.data;
        setFilterOptions({

        centroOptions:centro,
        periodoOptions: periodo,
        cohorteOptions: cohorte,
        mencionOptions: mencion,
        procedenciaOptions:procedencia
        });
 
    } catch (error) {
        console.error('Error fetching filter options:', error);
    }
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
    <div className="row" style={{ marginTop: '50px' }}>
    <div className="col-lg-6 mx-auto"> {/* Centrado del contenido */}
      <div className="card-box" style={{ padding: '20px', width: '100%', margin: '0 auto' }}>
      <meta name="csrf-token" content="{{ csrf_token() }}" />
      <h1>Agregar Nueva Promoción</h1>
      <Form onSubmit={handleSubmit} className="custom-gutter">
        <script src="{{ mix('js/app.js') }}"></script>
        <div className="row">
          <div className="col-md-6">
              <Row className="g-2"> 
              <Col md={6}>

                <SelectComponent
                  options={filterOptions.centroOptions} 
                  nameField="descripcion"
                  valueField="id"
                  selectedValue={formData.centro_id}
                  handleChange={handleChange}
                  controlId="centro_id"
                  label="Centro"
                />
                </Col>
                <Col md={6}>

                <SelectComponent
                
                options={filterOptions.cohorteOptions} 
                  nameField="descripcion"
                  valueField="id"
                  selectedValue={formData.cohorte_id}
                  handleChange={handleChange}
                  controlId="cohorte_id"
                  label="Cohorte"
                />
                </Col>
                </Row>
                <Row className="g-2"> 
                <Col md={6}>
                <SelectComponent
                  options={filterOptions.periodoOptions} 
                  nameField="descripcion"
                  valueField="id"
                  selectedValue={formData.periodo_id}
                  handleChange={handleChange}
                  controlId="periodo_id"
                  label="Periodo"
                />
                </Col>
                <Col md={6}>
                <SelectComponent
                  options={filterOptions.procedenciaOptions} 
                  nameField="descripcion"
                  valueField="id"
                  selectedValue={formData.procedencia_id}
                  handleChange={handleChange}
                  controlId="procedencia_id"
                  label="Procedencia"
                />
                </Col>
                </Row>
                <Row className="g-2"> 
                <Col md={6}>
                <SelectComponent
                  options={filterOptions.mencionOptions} 
                  nameField="descripcion"
                  valueField="id"
                  selectedValue={formData.mencion_id}
                  handleChange={handleChange}
                  controlId="mencion_id"
                  label="Mención"
                />
                </Col>
               
                <Col md={6}>
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
            </Col>
            </Row>
            <Row className="g-2"> 
            <Col md={6}>
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
            </Col>
            
            <Col md={6}>
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
            </Col>
            </Row>
            

            <Form.Group controlId="comentarios">
              <Form.Label>Comentarios</Form.Label>
              <Form.Control
                type="textarea"
                name="comentarios"
                value={formData.comentarios}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </div>
        </div>
        <div className='mt-3'>
          <Button variant="success" type="submit">
            Guardar
          </Button>
          <Button
            variant="secondary"
            onClick={() => navigate('/promocion')}
            className="ms-2"
          >
            Volver
          </Button>
        </div>
      </Form>
    </div>
    </div>
    </div>
  );
};

export default CreatePromocion;
