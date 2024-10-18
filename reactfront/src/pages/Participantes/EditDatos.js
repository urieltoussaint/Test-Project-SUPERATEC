import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Button, Alert, Modal, Table } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import SelectComponent from '../../components/SelectComponent';
import './EditDatos.css'; // Importa la hoja de estilo si es necesario
import { useLoading } from '../../components/LoadingContext'; // Importa useLoading
import { ToastContainer,toast } from 'react-toastify';
import moment from 'moment';
import { Card, Row, Col } from 'react-bootstrap'; 
import estadosMunicipios from '../../components/estadosMunicipios.json';

const userId = parseInt(localStorage.getItem('user'));  // ID del usuario logueado
const endpoint = 'http://localhost:8000/api';


const EditDatos = () => {
  const { setLoading } = useLoading(); // Usar el contexto de carga
  const [formData, setFormData] = useState({
    cedula_identidad: '',
    nombres: '',
    apellidos: '',
    fecha_nacimiento: '',
    direccion: '',
    direccion_email: '',
    telefono_casa: '',
    telefono_celular: '',
    status_seleccion_id: '',
    nacionalidad_id: '',
    genero_id: '',
    grupo_prioritario_id: '',
    estado_id: '',
    procedencia_id: '',
    nivel_instruccion_id: '',
    como_entero_superatec_id: '',
    municipio:''
  });

  const navigate = useNavigate();
  const { id } = useParams(); // Obtener el ID desde la ruta
  const [municipiosDisponibles, setMunicipiosDisponibles] = useState([]);  
  const [originalCedula, setOriginalCedula] = useState('');
  const [cedulaError, setCedulaError] = useState(''); 
  const [isCedulaValid, setIsCedulaValid] = useState(false);
  const [cedulaLengthError, setCedulaLengthError] = useState('');


  useEffect(() => {
    setLoading(true); // Inicia la animación de carga
    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            let relationsArray = ['nacionalidad', 'estado', 'statusSeleccion', 'grupoPrioritario', 'procedencia', 'genero', 'nivelInstruccion'];
            const relations = relationsArray.join(',');
            const response = await axios.get(`${endpoint}/datos/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const fetchedData = response.data;
            setFormData({ ...fetchedData });
            setOriginalCedula(fetchedData.cedula_identidad); // Guarda la cédula original
            // Verificar si ya hay un estado seleccionado y cargar los municipios
            if (fetchedData.estado_id) {
                const estadoSeleccionado = estadosMunicipios.find(estado => estado.id_estado === parseInt(fetchedData.estado_id));
                if (estadoSeleccionado) {
                    setMunicipiosDisponibles(estadoSeleccionado.municipios);
                }
            }
            

            setFormData({
                ...fetchedData,
            });
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false); // Detiene la animación de carga
        }
    };

    fetchData();
}, [id, setLoading]);


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


  const calcularEdad = (fechaNacimiento) => {
    const hoy = new Date();
    const fechaNac = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - fechaNac.getFullYear();
    const mes = hoy.getMonth() - fechaNac.getMonth();
  
    if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) {
      edad--;
    }
    return edad;
  };

  const handleEstadoChange = (e) => {
    const estadoId = e.target.value;
    
    // Encuentra el estado seleccionado en el JSON
    const estadoSeleccionado = estadosMunicipios.find(estado => estado.id_estado === parseInt(estadoId));
    
    // Actualiza los municipios disponibles
    setMunicipiosDisponibles(estadoSeleccionado ? estadoSeleccionado.municipios : []);
    
    // Actualiza el estado seleccionado en formData
    setFormData({
      ...formData,
      estado_id: estadoId,
      municipio: ''  // Reseteamos el municipio al cambiar de estado
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Calcular la edad y agregarla a los datos del formulario
    const edadCalculada = calcularEdad(formData.fecha_nacimiento);
    const dataToSend = {
        ...formData,
        edad: edadCalculada, // Agregar la edad calculada
    };

    // Filtrar los campos vacíos o que contienen solo espacios, asegurando que el valor sea una cadena
    const emptyFields = Object.keys(formData).filter(key => {
        const value = formData[key];
        return value === '' || value === null || (typeof value === 'string' && value.trim() === ''); // Considerar vacíos los campos que están vacíos, son nulos, o tienen solo espacios
    });

    const hasEmptyFields = emptyFields.length > 0;

    try {
        const token = localStorage.getItem('token');

        // 1. Actualizar los datos del participante
        await axios.put(`${endpoint}/datos/${id}`, dataToSend, {
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
                peticion.key === id && peticion.zona_id === 1 && peticion.status === false
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

        navigate('/datos');
    } catch (error) {
        // Captura cualquier error que ocurra en la solicitud
        toast.error('Error al actualizar Participante o Petición');
        console.error('Error actualizando:', error);
    }
};

const handleKeyDown = (e) => {
  if (e.key !== 'Backspace' && e.key !== 'Tab' && e.key !== 'Delete' && !/[0-9]/.test(e.key)) {
    e.preventDefault();
  }
};




  const handleBlur = async () => {
    if (formData.cedula_identidad && formData.cedula_identidad !== originalCedula) {
      try {
        const token = localStorage.getItem('token'); 
        const response = await axios.get(`${endpoint}/datos/cedula/${formData.cedula_identidad}`, {
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
  

  return (
    <div className="row" style={{ marginTop: '50px' }}>
  <div className="col-lg-7 mx-auto"> {/* Centrado del contenido */}
    <div className="card-box" style={{ padding: '20px', width: '80%', margin: '0 auto' }}>
      <meta name="csrf-token" content="{{ csrf_token() }}" />
      <h1>Actualizar Datos de Participante V{formData.cedula_identidad}	</h1>
      <Form onSubmit={(e) => handleSubmit(e, false)}
        className="custom-gutter">
            <Row className="g-2"> 
            <Col md={6}>
            <Form.Group controlId="cedula_identidad">
              <Form.Label>Cédula de Identidad</Form.Label>
              <Form.Control
                type="text"
                name="cedula_identidad"
                value={formData.cedula_identidad ? `V-${formData.cedula_identidad}` : ''}
                onChange={handleChange}
                onKeyDown={handleKeyDown}  // Evita caracteres no numéricos
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
            </Col>
            


            </Row>


            <Row className="g-2"> 
            <Col md={6}>
            <Form.Group controlId="nombres">
              <Form.Label>Nombres</Form.Label>
              <Form.Control
                type="text"
                name="nombres"
                value={formData.nombres}
                onChange={handleChange}
                maxLength={20}
                
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
                maxLength={20}
                
              />
            </Form.Group>
            </Col>

            </Row>
            <Form.Group controlId="fecha_nacimiento">
              <Form.Label>Fecha de Nacimiento</Form.Label>
              <Form.Control
                type="date"
                name="fecha_nacimiento"
                value={formData.fecha_nacimiento}
                onChange={handleChange}
                
              />
            </Form.Group>
            
            <Row className="g-2"> 
            <Col md={6}>
            <SelectComponent
              endpoint={`${endpoint}/genero`}
              nameField="descripcion"
              valueField="id"
              selectedValue={formData.genero_id}
              handleChange={handleChange}
              controlId="genero_id"
              label="Género"
            />
            </Col>
            <Col md={6}>
            <SelectComponent
              endpoint={`${endpoint}/nacionalidad_seleccion`}
              nameField="descripcion"
              valueField="id"
              selectedValue={formData.nacionalidad_id}
              handleChange={handleChange}
              controlId="nacionalidad_id"
              label="Nacionalidad"
            />
            
            </Col>
            </Row>
            <Row className="g-2"> 
            <Col md={6}>
              <Form.Group controlId="estado">
                <Form.Label>Estado</Form.Label>
                <Form.Select
                  name="estado_id"
                  value={formData.estado_id}
                  onChange={handleEstadoChange}
                >
                  <option value="">Seleccione </option>
                  {estadosMunicipios.map(estado => (
                    <option key={estado.id_estado} value={estado.id_estado}>
                      {estado.estado}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            
            <Col md={6}>
              <Form.Group controlId="municipio">
                <Form.Label>Municipio</Form.Label>
                <Form.Select
                  name="municipio"
                  value={formData.municipio}
                  onChange={(e) => setFormData({ ...formData, municipio: e.target.value })}
                  disabled={!municipiosDisponibles.length}  // Deshabilita si no hay municipios disponibles
                >
                  <option value="">Seleccione un Municipio</option>
                  {municipiosDisponibles.map((municipio, index) => (
                    <option key={index} value={municipio.municipio}>
                      {municipio.municipio}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

            <Form.Group controlId="direccion">
              <Form.Label>Dirección</Form.Label>
              <Form.Control
                as="textarea"
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
                maxLength={20}
                
              />
            </Form.Group>

            <Row className="g-2"> 
            <Col md={6}>
            <SelectComponent
              endpoint={`${endpoint}/status_seleccion`}
              nameField="descripcion"
              valueField="id"
              selectedValue={formData.status_seleccion_id}
              handleChange={handleChange}
              controlId="status_seleccion_id"
              label="Status"
              allowEmpty={true}  // Permitir que el campo esté vacío
            />
            </Col>
            <Col md={6}>
            <SelectComponent
              endpoint={`${endpoint}/grupo_prioritario`}
              nameField="descripcion"
              valueField="id"
              selectedValue={formData.grupo_prioritario_id}
              handleChange={handleChange}
              controlId="grupo_prioritario_id"
              label="Grupo Prioritario"
            />
            </Col>
            </Row>
            <Row className="g-2"> 
            <Col md={6}>
            <SelectComponent
              endpoint={`${endpoint}/procedencia`}
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
              endpoint={`${endpoint}/nivel_instruccion`}
              nameField="descripcion"
              valueField="id"
              selectedValue={formData.nivel_instruccion_id}
              handleChange={handleChange}
              controlId="nivel_instruccion_id"
              label="Nivel de Instrucción"
            />
            </Col>
            </Row>

            <Form.Group controlId="direccion_email">
              <Form.Label>Dirección Email</Form.Label>
              <Form.Control
                type="email"
                name="direccion_email"
                value={formData.direccion_email}
                onChange={handleChange}
                
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
                maxLength={10}
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
                maxLength={10}
              />
            </Form.Group>
            </Col>
            </Row>
            <SelectComponent
              endpoint={`${endpoint}/como_entero_superatec`}
              nameField="descripcion"
              valueField="id"
              selectedValue={formData.como_entero_superatec_id}
              handleChange={handleChange}
              controlId="como_entero_superatec_id"
              label="¿Cómo se enteró de Superatec?"
            />

        <Button variant="success" type="submit">
          Guardar
        </Button>
        <Button 
          variant="secondary" 
          onClick={() => navigate('/datos')}
          className="ms-2"
        >
          Volver
        </Button>
      </Form>
      </div>
      </div>
    </div>
  );
};

export default EditDatos;
