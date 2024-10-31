import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Button,Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import SelectComponent from '../../../components/SelectComponent';
import './CreateVoluntariados.css';
import { toast } from 'react-toastify';
import { Card, Row, Col } from 'react-bootstrap';
import { useLoading } from '../../../components/LoadingContext';



const endpoint = 'http://localhost:8000/api';

const CreateVoluntariados = () => {
  const { setLoading } = useLoading();

  const [cedulaError, setCedulaError] = useState(''); // Estado para almacenar el mensaje de validación
  const [isCedulaValid, setIsCedulaValid] = useState(false);
 
  const [formData, setFormData] = useState({
    cedula_identidad: '',
    nombres: '',
    apellidos: '',
    fecha_nacimiento: '',
    direccion: '',
    email: '',
    telefono_casa: '',
    telefono_celular: '',
    genero_id: '',
    nivel_instruccion_id: '',
    procedencia_id: '',
    como_entero_superatec_id: '',
    tipo_voluntariado_id: '',
    area_voluntariado_id: '',
    centro_id: '',
    actividades_realizar: '',
    turno_id: '',
    fecha_inicio: '',
    horas_totales: ''
  });
  const [filterOptions, setFilterOptions] = useState({
    generoOptions: [],
    nivelOptions: [],
    procedenciaOptions: [],
    superatecOptions: [],
    tipoOptions: [],
    areaOptions: [],
    centroOptions: [],
    turnoOptions: []
  });

  const navigate = useNavigate();
  useEffect(() => {
    const fetchSelectData = async () => {
        HandleSelected ();
      
    };

    fetchSelectData();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    if (name === 'cedula_identidad') {
      // Permitir solo números y agregar prefijo "V-"
      const numericValue = value.replace(/\D/g, ''); // Eliminar todo lo que no sea un número
      setFormData(prevState => ({
        ...prevState,
        [name]: numericValue,
      }));
    } else {
      setFormData(prevState => ({
        ...prevState,
        [name]: value
      }));
    }
  };

  const HandleSelected = async () => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${endpoint}/filter-voluntariados`, { headers: { Authorization: `Bearer ${token}` } });

        const {centro,area,nivel,genero,procedencia,turno,superatec,tipo}=response.data;
        setFilterOptions({
        centroOptions:centro,
        areaOptions: area,
        nivelOptions: nivel,
        generoOptions:genero,
        procedenciaOptions:procedencia,
        turnoOptions:turno,
        superatecOptions:superatec,
        tipoOptions:tipo,

        });
 
    } catch (error) {
        console.error('Error fetching filter options:', error);
    }
};


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${endpoint}/voluntariados`, formData,{headers: {
        Authorization: `Bearer ${token}`,
    }});
      toast.success('Voluntariado creado con Éxito');
      navigate('/voluntariados');
    } catch (error) {
      toast.error('Error al crear Voluntariado');
      console.error('Error creating data:', error);
    }
  };

  const handleBlur = async () => {
    if (formData.cedula_identidad) {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${endpoint}/datos/${formData.cedula_identidad}`,{headers: {
          Authorization: `Bearer ${token}`,
      }});
        // Si la cédula está registrada, mostramos el error y no es válida
        setCedulaError('La cédula ya está registrada.');
        setIsCedulaValid(false);
      } catch (error) {
        if (error.response && error.response.status === 404) {
          // La cédula no está registrada, por lo que es válida
          setCedulaError('');
          setIsCedulaValid(true);
        } else {
          console.error('Error checking cedula:', error);
          setCedulaError('Error verificando la cédula.');
          setIsCedulaValid(false);
        }
      }
    }
  };

  return (


    <div className="container-fluid" style={{ marginTop: '50px'}}>
    <Form onSubmit={(e) => handleSubmit(e, false)} className="custom-gutter">
  <div className="row justify-content-center" >
  <div className="col-lg-6 " > {/* Centrado del contenido */}
  <h2 className="mb-2">Agregar Nuevo voluntariado</h2>
  <div className="card-box" style={{ padding: '20px',  }}>
  <h4 className="mb-4">Datos del Voluntariado</h4>
        <script src="{{ mix('js/app.js') }}"></script>
        <div className="row">
          <div className="col-md-6">
          <Form.Group controlId="cedula_identidad">
              <Form.Label>Cédula de Identidad</Form.Label>
              <Form.Control
                type="text"
                name="cedula_identidad"
                value={formData.cedula_identidad ? `V-${formData.cedula_identidad}` : ''}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="V-123321123"
                maxLength={10}
                required
                className={cedulaError ? 'is-invalid' : isCedulaValid ? 'is-valid' : ''}
              />
              {cedulaError && <Alert variant="danger">{cedulaError}</Alert>}
              {!cedulaError && isCedulaValid && (
                <Form.Control.Feedback type="valid">
                  Cédula disponible.
                </Form.Control.Feedback>
              )}
            </Form.Group>
            <Row className="g-2"> 
            <Col md={6}>
            <Form.Group controlId="nombres">
              <Form.Label>Nombres</Form.Label>
              <Form.Control
                type="text"
                name="nombres"
                value={formData.nombres}
                onChange={handleChange}
                required
              />
            </Form.Group>
            </Col>
            <Col md={6}>
            <Form.Group controlId="apellidos">
              <Form.Label>Apellidos</Form.Label>
              <Form.Control
                type="text"
                name="apellidos"
                value={formData.apellidos}
                onChange={handleChange}
                required
              />
            </Form.Group>
            </Col>
            </Row>
            
            <Row className="g-2"> 
            <Col md={6}>
            <Form.Group controlId="fecha_nacimiento">
              <Form.Label>Fecha de Nacimiento</Form.Label>
              <Form.Control
                type="date"
                name="fecha_nacimiento"
                value={formData.fecha_nacimiento}
                onChange={handleChange}
                required
              />
            </Form.Group>
            </Col>
            <Col md={6}>

            <SelectComponent
              options={filterOptions.generoOptions} 
              nameField="descripcion"
              valueField="id"
              selectedValue={formData.genero_id}
              handleChange={handleChange}
              controlId="genero_id"
              label="Género"
            />

            </Col>
            </Row>
            
            

            <Form.Group controlId="direccion">
              <Form.Label>Dirección</Form.Label>
              <Form.Control
                as="textarea"
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group controlId="email">
              <Form.Label>Dirección Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Row className="g-2"> 
            <Col md={6}>

            <Form.Group controlId="telefono_casa">
              <Form.Label>Teléfono de Casa</Form.Label>
              <Form.Control
                type="text"
                name="telefono_casa"
                value={formData.telefono_casa}
                onChange={handleChange}
              />
            </Form.Group>
            </Col>
            <Col md={6}>

            <Form.Group controlId="telefono_celular">
              <Form.Label>Teléfono Celular</Form.Label>
              <Form.Control
                type="text"
                name="telefono_celular"
                value={formData.telefono_celular}
                onChange={handleChange}
              />
            </Form.Group>
            </Col>
            </Row>

            <Form.Group controlId="ocupacion">
              <Form.Label>Ocupación</Form.Label>
              <Form.Control
                type="text"
                name="ocupacion"
                value={formData.ocupacion}
                onChange={handleChange}
              />
            </Form.Group>


            <Row className="g-2"> 
            <Col md={6}>
              
            <SelectComponent
              options={filterOptions.nivelOptions} 
              nameField="descripcion"
              valueField="id"
              selectedValue={formData.nivel_instruccion_id}
              handleChange={handleChange}
              controlId="nivel_instruccion_id"
              label="Nivel de Instrucción"
            />

            </Col>
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
            </Row>
            <Row className="g-2"> 
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
            <Col md={6}>
            <SelectComponent
              options={filterOptions.superatecOptions} 
              nameField="descripcion"
              valueField="id"
              selectedValue={formData.como_entero_superatec_id}
              handleChange={handleChange}
              controlId="como_entero_superatec_id"
              label="¿Cómo se enteró de SUPERATEC?"
            />
            </Col>
            </Row>

            </div>
          </div>
          </div>
              </div>

          <div className="col-lg-5 "style={{ marginTop: '50px'}} >
          <div className="card-box" style={{ padding: '20px' }}>
            <h2>Información del Voluntariado</h2>
    
            <Row className="g-2"> 
            <Col md={6}>
            <SelectComponent
              options={filterOptions.tipoOptions} 
              nameField="descripcion"
              valueField="id"
              selectedValue={formData.tipo_voluntariado_id}
              handleChange={handleChange}
              controlId="tipo_voluntariado_id"
              label="Tipo de Voluntariado"
            />

            </Col>
            <Col md={6}>

            <SelectComponent
              options={filterOptions.areaOptions} 
              nameField="descripcion"
              valueField="id"
              selectedValue={formData.area_voluntariado_id}
              handleChange={handleChange}
              controlId="area_voluntariado_id"
              label="Área de Voluntariado"
            />

            </Col>
            </Row>
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

            <Form.Group controlId="actividades_realizar">
              <Form.Label>Actividades a Realizar</Form.Label>
              <Form.Control
                as="textarea"
                name="actividades_realizar"
                value={formData.actividades_realizar}
                onChange={handleChange}
              />
            </Form.Group>

            </Col>
            </Row>
            <Row className="g-2"> 
            <Col md={6}>

            <SelectComponent
              options={filterOptions.turnoOptions} 
              nameField="descripcion"
              valueField="id"
              selectedValue={formData.turno_id}
              handleChange={handleChange}
              controlId="turno_id"
              label="Turnos"
            />

            </Col>
            <Col md={6}>

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

            </Col>
            </Row>

            <Form.Group controlId="horas_totales">
              <Form.Label>Horas Totales</Form.Label>
              <Form.Control
                type="number"
                name="horas_totales"
                value={formData.horas_totales}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </div>
          <div className="button-container"  >
                <Button 
                    variant="info"
                    type="submit"
                    className="ms-2"
                >
                    Guardar
                </Button>

                <Button 
                    variant="secondary" 
                    onClick={() => navigate(-1)}
                    className="ms-2"
                >
                    Volver
                </Button>
            </div>
        </div>

        
      
    </div>
    </Form>
    </div>
    

    
    
  );
};

export default CreateVoluntariados;
