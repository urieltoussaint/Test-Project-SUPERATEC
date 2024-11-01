import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Button,Alert } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import SelectComponent from '../../../components/SelectComponent';
import './EditVoluntariados.css';
import { useLoading } from '../../../components/LoadingContext';	
import { toast } from 'react-toastify';
import { Card, Row, Col } from 'react-bootstrap';


const userId = parseInt(localStorage.getItem('user'));  // ID del usuario logueado
const endpoint = 'http://localhost:8000/api';

const EditVoluntariados = () => {
  const [cedulaError, setCedulaError] = useState(''); // Estado para almacenar el mensaje de validación
  const [isCedulaValid, setIsCedulaValid] = useState(false);
  const [originalCedula, setOriginalCedula] = useState('');

  const [cedulaLengthError, setCedulaLengthError] = useState('');
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
    informacion_voluntariados: {
      tipo_voluntariado_id: '',
      area_voluntariado_id: '',
      centro_id: '',
      actividades_realizar: '',
      turno_id: '',
      fecha_inicio: '',
      horas_totales: '',
    },
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
  const { id } = useParams();
  const { setLoading } = useLoading();


  useEffect(() => {
  handleSeleccionar();
  const fetchData = async () => {
    try {
      setLoading(true);
      let relationsArray = [
        'procedencia',
        'genero',
        'NivelInstruccion',
        'informacionVoluntariados',
      ];
      const relations = relationsArray.join(',');
      const token = localStorage.getItem('token');
      const response = await axios.get(`${endpoint}/voluntariados/${id}?with=${relations}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        
      });

      const fetchedData = response.data;
      setOriginalCedula(fetchedData.cedula_identidad); // Guarda la cédula original


      setFormData({
        ...fetchedData,
        informacion_voluntariados: fetchedData.informacion_voluntariados || {
          tipo_voluntariado_id: '',
          area_voluntariado_id: '',
          centro_id: '',
          actividades_realizar: '',
          turno_id: '',
          fecha_inicio: '',
          horas_totales: '',
        },
      });

      console.log("FormData after fetch:", formData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, [id]);


const handleChange = (event) => {
  const { name, value, type, checked } = event.target;

  let updatedValue = value;

  if (name === 'cedula_identidad') {
    updatedValue = value.replace(/^V-/, '');  
    updatedValue = updatedValue.replace(/\D/g, ''); 
    if (updatedValue.length < 7) {
      setCedulaLengthError('La cédula debe tener al menos 7 caracteres.');
      setIsCedulaValid(false);
    } else {
      setCedulaLengthError('');
      setIsCedulaValid(true);
    }
  }

  setFormData(prevState => ({
    ...prevState,
    [name]: type === 'checkbox' ? checked : updatedValue,
  }));
};

  
  const handleSeleccionar = async () => {
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

const handleBlur = async () => {
  if (formData.cedula_identidad && formData.cedula_identidad !== originalCedula) {
    try {
      const token = localStorage.getItem('token'); 
      const response = await axios.get(`${endpoint}/voluntariados/cedula/${formData.cedula_identidad}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCedulaError('La cédula ya está registrada.');
      setIsCedulaValid(false);
    } catch (error) {
      if (error.response && error.response.status === 404) {
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

  const handleSubmit = async (e) => {
    e.preventDefault();


    // Filtrar los campos vacíos o que contienen solo espacios, asegurando que el valor sea una cadena
    const emptyFields = Object.keys(formData).filter(key => {
        const value = formData[key];
        return value === '' || value === null || (typeof value === 'string' && value.trim() === ''); // Considerar vacíos los campos que están vacíos, son nulos, o tienen solo espacios
    });

    const hasEmptyFields = emptyFields.length > 0;

    try {
        const token = localStorage.getItem('token');

        // 1. Actualizar los datos del participante
        await axios.put(`${endpoint}/voluntariados/${id}`, formData, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!hasEmptyFields) {
            // Si no hay campos vacíos, proceder con la actualización de la petición
            let allPeticiones = [];
            let currentPage = 1;
            let totalPages = 1;

            // 2. Obtener todas las páginas de peticiones y combinarlas
            while (currentPage <= totalPages) {
                const response = await axios.get(`${endpoint}/peticiones?page=${currentPage}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                allPeticiones = [...allPeticiones, ...response.data.data];
                totalPages = response.data.last_page;
                currentPage++;
            }

            // Filtrar las peticiones por cedula_identidad, zona_id, y status
            const peticionesFiltradas = allPeticiones.filter(peticion =>
                peticion.key === id && peticion.zona_id === 9 && peticion.status === false
            );

            if (peticionesFiltradas.length > 0) {
                const peticion = peticionesFiltradas[0];  // Obtener la primera petición que coincida

                // 3. Actualizar el status de la petición a true
                await axios.put(`${endpoint}/peticiones/${peticion.id}`, {
                    status: true,   // Cambiar el estado a true
                    finish_time: new Date().toLocaleString('es-ES', { timeZone: 'America/Caracas' }), // Ejemplo para Caracas
                    user_success: userId, // Enviar el usuario que completó la tarea
                }, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                toast.success('Actualización con Éxito, Petición también actualizada');
            } else {
                // Si no hay peticiones, no mencionar en el mensaje de éxito
                toast.success('Actualización con Éxito');
            }
        } else {
            // Si hay campos vacíos, solo actualizamos los datos del participante
            toast.success('Formulario actualizado con éxito.');
        }

        navigate('/voluntariados');
    } catch (error) {
        // Captura cualquier error que ocurra en la solicitud
        toast.error('Error al actualizar Participante o Petición');
        console.error('Error actualizando:', error);
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
                className={
                  cedulaError || cedulaLengthError
                    ? 'is-invalid'
                    : isCedulaValid ? 'is-valid' : ''
                }
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
              selectedValue={formData.informacion_voluntariados.tipo_voluntariado_id}
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
              selectedValue={formData.informacion_voluntariados.area_voluntariado_id}
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
              selectedValue={formData.informacion_voluntariados.centro_id}
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
                value={formData.informacion_voluntariados.actividades_realizar}
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
              selectedValue={formData.informacion_voluntariados.turno_id}
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
                value={formData.informacion_voluntariados.fecha_inicio}
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
                value={formData.informacion_voluntariados.horas_totales}
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

export default EditVoluntariados;
