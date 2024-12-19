import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Button, Alert, Modal, Table } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import SelectComponent from '../../components/SelectComponent';
import { useLoading } from '../../components/LoadingContext'; // Importa useLoading
import { ToastContainer,toast } from 'react-toastify';
import moment from 'moment';
import { Card, Row, Col } from 'react-bootstrap'; 
import estadosMunicipios from '../../components/estadosMunicipios.json';

const userId = parseInt(localStorage.getItem('user'));  // ID del usuario logueado
const endpoint = 'http://localhost:8000/api';


const EditPatrocinantes = () => {
  const { setLoading } = useLoading(); // Usar el contexto de carga
  const [formData, setFormData] = useState({
    nombre_patrocinante: '',
    empresa_persona: '',
    rif_cedula: '',
    nit:'',
    tipo_patrocinante_id:'',
    tipo_industria_id:'',
    telefono: '',
    direccion: '',
    email: '',
    pais_id: '',
    estado_id: '',
    ciudad: '',
    codigo_postal: '',
    web: '',
    es_patrocinante: '',
    bolsa_empleo: '',
    exterior: '',
    referido_por: '',
    otra_info: '',

      //tabla contacto
    nombre_principal:'',
    cargo_principal:'',
    telefono_principal:'',
    email_principal:'',

    nombre_adicional:'',
    cargo_adicional:'',
    telefono_adicional:'',
    email_adicional:'',

    nombre_adicional2:'',
    cargo_adicional2:'',
    telefono_adicional2:'',
    email_adicional2:'',

  });

  const [filterOptions, setFilterOptions] = useState({
    estadoOptions: [],
    paisOptions: [],
    tipoIndustriaOptions: [],
    tipoPatrocinanteOptions: [],
});

  const [selectVisible, setSelectVisible] = useState(false);  // Control de la visibilidad de los selectores
  const navigate = useNavigate();
  const { id } = useParams(); // Obtener el ID desde la ruta
  const [municipiosDisponibles, setMunicipiosDisponibles] = useState([]);  
  const [originalCedula, setOriginalCedula] = useState('');
  const [cedulaError, setCedulaError] = useState(''); 
  const [isCedulaValid, setIsCedulaValid] = useState(false);
  const [cedulaLengthError, setCedulaLengthError] = useState('');


  useEffect(() => {
    setLoading(true); // Inicia la animación de carga
    handleSeleccionar();
    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            let relationsArray = ['estado', 'pais', 'tipoIndustria', 'tipoPatrocinante', 'contactoPatrocinante'];
            const relations = relationsArray.join(',');
            const response = await axios.get(`${endpoint}/patrocinantes/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const fetchedData = response.data;
            setFormData({ ...fetchedData });
            setOriginalCedula(fetchedData.rif_cedula); // Guarda la cédula original
            // Verificar si ya hay un estado seleccionado y cargar los municipios
            if (fetchedData.estado_id) {
                const estadoSeleccionado = estadosMunicipios.find(estado => estado.id_estado === parseInt(fetchedData.estado_id));
                if (estadoSeleccionado) {
                    setMunicipiosDisponibles(estadoSeleccionado.ciudades);
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

  if (name === 'rif_cedula') {
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



  const handleEstadoChange = (e) => {
    const estadoId = e.target.value;
    
    // Encuentra el estado seleccionado en el JSON
    const estadoSeleccionado = estadosMunicipios.find(estado => estado.id_estado === parseInt(estadoId));
    
    // Actualiza los municipios disponibles
    setMunicipiosDisponibles(estadoSeleccionado ? estadoSeleccionado.ciudades : []);
    
    // Actualiza el estado seleccionado en formData
    setFormData({
      ...formData,
      estado_id: estadoId,
      ciudad: ''  // Reseteamos el municipio al cambiar de estado
    });
  };


  const handleSeleccionar = async () => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${endpoint}/filter-patrocinantes`, {
          headers: { Authorization: `Bearer ${token}` }
        });
  
        const { estado, pais, tipo_industria, tipo_patrocinante } = response.data;
        setFilterOptions( {
          estadoOptions: estado,
          paisOptions: pais,
          tipoIndustriaOptions: tipo_industria,
          tipoPatrocinanteOptions: tipo_patrocinante,
        });
        setSelectVisible(true);  // Mostrar los selectores
  
      } catch (error) {
        console.error('Error fetching filter options:', error);
        
      }
  }

  const handleSubmit = async (e) => {

    e.preventDefault();
    // Calcular la edad y agregarla a los datos del formulario
    const dataToSend = {
        ...formData,
    };

    // Filtrar los campos vacíos o que contienen solo espacios, asegurando que el valor sea una cadena
    const emptyFields = Object.keys(formData).filter(key => {
    if (key === 'otra_info' || key === 'referido_por' || key === 'web' || key === 'referido_por' 
        || key === 'estado_id' || key === 'ciudad' || key === 'nombre_adicional' || key === 'cargo_adicional'
        || key === 'telefono_adicional'   || key === 'email_adicional' 
        || key === 'nombre_adicional2' || key === 'cargo_adicional2'
        || key === 'telefono_adicional2'   || key === 'email_adicional2' 
    ) {
        return false;
      }

    return !formData[key];
  });

    const hasEmptyFields = emptyFields.length > 0;

    try {
        const token = localStorage.getItem('token');

        // 1. Actualizar los datos del participante
        await axios.put(`${endpoint}/patrocinantes/${id}`, dataToSend, {
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
                peticion.key === id && peticion.zona_id === 6 && peticion.status === false
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

        navigate('/peticiones');
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
    if (formData.rif_cedula) {
      try {
        const token = localStorage.getItem('token'); 
        const response = await axios.get(`${endpoint}/patrocinantes/rif-cedula/${formData.rif_cedula}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setCedulaError('Ya está registrada.');
        setIsCedulaValid(false);
      } catch (error) {
        if (error.response && error.response.status === 404) {
          setCedulaError('');
          setIsCedulaValid(true);
        } else {
          console.error('Error checking cedula:', error);
          setCedulaError('Error verificando el rif/cedula.');
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
          <h2 className="mb-2">Actualizar informacion de Patrocinante</h2>
          <div className="card-box" style={{ padding: '20px',  }}>
          <meta name="csrf-token" content="{{ csrf_token() }}" />
              <h4 className="mb-4">Datos de la Empresa o Individuo</h4>

              
                    <Form.Group controlId="empresa_persona">
                      <Form.Label>¿Empresa o Persona?</Form.Label>
                      <Form.Select
                        name="empresa_persona"
                        value={formData.empresa_persona}
                        onChange={handleChange}
                      >
                        <option value="">Seleccione una opción</option>
                        <option value="Empresa">Empresa</option>
                        <option value="Persona">Persona</option>
                      </Form.Select>
                    </Form.Group>
                    <Row className="g-2"> 
                    <Col md={6}>
                    <Form.Group controlId="rif_cedula">
                      <Form.Label>Rif/Cédula</Form.Label>
                      <Form.Control
                        type="text"
                        name="rif_cedula"
                        value={formData.rif_cedula }
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
                          Rif/Cédula No disponible.
                        </Form.Control.Feedback>
                      )}
                    </Form.Group>
                    </Col>
                    </Row>


                    <Row className="g-2"> 
                    <Col md={6}>
                    <Form.Group controlId="nombres">
                      <Form.Label>Nombre de Patrocinante o Cooperante</Form.Label>
                      <Form.Control
                        type="text"
                        name="nombre_patrocinante"
                        value={formData.nombre_patrocinante}
                        onChange={handleChange}
                        maxLength={20}
                        
                      />
                    </Form.Group>
                    </Col>
                    <Col md={6}>
                    <Form.Group controlId="nit">
                      <Form.Label>NIT</Form.Label>
                      <Form.Control
                        type="text"
                        name="nit"
                        value={formData.nit}
                        onChange={handleChange}
                        maxLength={20}
                        
                      />
                    </Form.Group>
                    </Col>

                    </Row>

                    <Row className="g-2"> 
                    <Col md={6}>
                    <SelectComponent
                      options={filterOptions.tipoPatrocinanteOptions}  // Usar el estado filterOptions
                      nameField="descripcion"
                      valueField="id"
                      selectedValue={formData.tipo_patrocinante_id}
                      handleChange={handleChange}
                      controlId="tipo_patrocinante_id"
                      label="Tipo de Patrocinante"
                    />
                    </Col>
                    <Col md={6}>
                    <SelectComponent
                      options={filterOptions.tipoIndustriaOptions}  // Usar el estado filterOptions
                      nameField="descripcion"
                      valueField="id"
                      selectedValue={formData.tipo_industria_id}
                      handleChange={handleChange}
                      controlId="tipo_industria_id"
                      label="Tipo de Industria"
                    />
                    </Col>
                    </Row>
                    
                    <Row className="g-2"> 
                    <Col md={6}>
                    <Form.Group controlId="telefono">
                      <Form.Label>telefono</Form.Label>
                      <Form.Control
                        type="text"
                        name="telefono"
                        value={formData.telefono}
                        onChange={handleChange}
                        maxLength={20}
                        
                      />
                    </Form.Group>
                    </Col>
                    <Col md={6}>
                    <Form.Group controlId="email">
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        maxLength={40}
                        
                      />
                    </Form.Group>
                    
                    </Col>
                    </Row>

                  
                    <SelectComponent
                        options={filterOptions.paisOptions}  // Usar el estado filterOptions
                        nameField="descripcion"
                        valueField="id"
                        selectedValue={formData.pais_id}
                        handleChange={handleChange}
                        controlId="pais_id"
                        label="Pais"
                      />

                      {/* Renderiza los campos de estado y ciudad solo si pais_id es 1 */}
                      {formData.pais_id === '1' && (
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
                                {estadosMunicipios.map((estado) => (
                                  <option key={estado.id_estado} value={estado.id_estado}>
                                    {estado.estado}
                                  </option>
                                ))}
                              </Form.Select>
                            </Form.Group>
                          </Col>

                          <Col md={6}>
                            <Form.Group controlId="ciudad">
                              <Form.Label>Ciudad</Form.Label>
                              <Form.Select
                                name="ciudad"
                                value={formData.ciudad}
                                onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                                disabled={municipiosDisponibles.length === 0}
                              >
                                <option value="">Seleccione una Ciudad</option>
                                {municipiosDisponibles.map((ciudad, index) => (
                                  <option key={index} value={ciudad}>
                                    {ciudad}
                                  </option>
                                ))}
                              </Form.Select>
                            </Form.Group>
                          </Col>
                        </Row>
                      )}


                  <Form.Group controlId="direccion">
                      <Form.Label>Direccion</Form.Label>
                      <Form.Control
                        type="textarea"
                        name="direccion"
                        value={formData.direccion}
                        onChange={handleChange}
                        maxLength={20}
                        
                      />
                    </Form.Group>

                    <Row className="g-2"> 
                    <Col md={6}>
                    <Form.Group controlId="codigo_postal">
                      <Form.Label>Código Postal</Form.Label>
                      <Form.Control
                        type="text"
                        name="codigo_postal"
                        value={formData.codigo_postal}
                        onChange={handleChange}
                        maxLength={20}
                        
                      />
                    </Form.Group>
                    </Col>
                    <Col md={6}>
                    <Form.Group controlId="web">
                      <Form.Label>Web</Form.Label>
                      <Form.Control
                        type="text"
                        name="web"
                        value={formData.web}
                        onChange={handleChange}
                        maxLength={20}
                        
                      />
                    </Form.Group>
                    </Col>
                    </Row>
                    <Row className="g-2"> 
                      <Col md={4}>
                        <Form.Group controlId="es_patrocinante">
                          <Form.Label>¿Es patrocinante actualmente?</Form.Label>
                          <Form.Select
                            name="es_patrocinante"
                            value={formData.es_patrocinante}
                            onChange={handleChange}
                          >
                            <option value="">Seleccione una opción</option>
                            <option value="true">Sí</option>
                            <option value="false">No</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group controlId="bolsa_empleo">
                          <Form.Label>¿Posible para bolsa de Empleo?</Form.Label>
                          <Form.Select
                            name="bolsa_empleo"
                            value={formData.bolsa_empleo}
                            onChange={handleChange}
                          >
                            <option value="">Seleccione una opción</option>
                            <option value="true">Sí</option>
                            <option value="false">No</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={3}>
                        <Form.Group controlId="exterior">
                          <Form.Label>¿Exterior?</Form.Label>
                          <Form.Select
                            name="exterior"
                            value={formData.exterior}
                            onChange={handleChange}
                          >
                            <option value="">Seleccione una opción</option>
                            <option value="true">Sí</option>
                            <option value="false">No</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                    </Row>

                    <Form.Group controlId="referido_por">
                      <Form.Label>Referido por</Form.Label>
                      <Form.Control
                        type="text"
                        name="referido_por"
                        value={formData.referido_por}
                        onChange={handleChange}
                        
                      />
                    </Form.Group>
                    <Form.Group controlId="otra_info">
                      <Form.Label>Información Adicional</Form.Label>
                      <Form.Control
                        type="text"
                        name="otra_info"
                        value={formData.otra_info}
                        onChange={handleChange}
                        
                      />
                    </Form.Group>


              </div>
              </div>
            {/* Segunda Carta */}
      <div className="col-lg-5 "style={{ marginTop: '50px'}} >
      <div className="card-box" style={{ padding: '20px' }}>
          <h4 className="mb-4">Datos de Contacto</h4>

          
          <Row className="g-2"> 
            <Col md={6}>
            <Form.Group controlId="nombre_principal">
              <Form.Label>Nombre Principal</Form.Label>
              <Form.Control
                type="text"
                name="nombre_principal"
                value={formData.nombre_principal}
                onChange={handleChange}
                
              />
            </Form.Group>
            </Col>
            <Col md={6}>
            <Form.Group controlId="cargo_principal">
              <Form.Label>Cargo Principal</Form.Label>
              <Form.Control
                type="text"
                name="cargo_principal"
                value={formData.cargo_principal}
                onChange={handleChange}
                
              />
            </Form.Group>
            </Col>
          </Row>
          <Row className="g-2"> 
            <Col md={6}>
            <Form.Group controlId="telefono_principal">
              <Form.Label>Telefono Principal</Form.Label>
              <Form.Control
                type="text"
                name="telefono_principal"
                value={formData.telefono_principal}
                onChange={handleChange}
                
              />
            </Form.Group>
            </Col>
            <Col md={6}>
            <Form.Group controlId="email_principal">
              <Form.Label>Email Principal</Form.Label>
              <Form.Control
                type="email"
                name="email_principal"
                value={formData.email_principal}
                onChange={handleChange}
                
              />
            </Form.Group>
            </Col>
          </Row>


          <Row className="g-2"> 
            <Col md={6}>
            <Form.Group controlId="nombre_adicional">
              <Form.Label>Nombre Adicional</Form.Label>
              <Form.Control
                type="text"
                name="nombre_adicional"
                value={formData.nombre_adicional}
                onChange={handleChange}
                
              />
            </Form.Group>
            </Col>
            <Col md={6}>
            <Form.Group controlId="cargo_adicional">
              <Form.Label>Cargo Adicional</Form.Label>
              <Form.Control
                type="text"
                name="cargo_adicional"
                value={formData.cargo_adicional}
                onChange={handleChange}
                
              />
            </Form.Group>
            </Col>
          </Row>
          <Row className="g-2"> 
            <Col md={6}>
            <Form.Group controlId="telefono_adicional">
              <Form.Label>Telefono Adicional</Form.Label>
              <Form.Control
                type="text"
                name="telefono_adicional"
                value={formData.telefono_adicional}
                onChange={handleChange}
                
              />
            </Form.Group>
            </Col>
            <Col md={6}>
            <Form.Group controlId="email_adicional">
              <Form.Label>Email Adicional</Form.Label>
              <Form.Control
                type="email"
                name="email_adicional"
                value={formData.email_adicional}
                onChange={handleChange}
                
              />
            </Form.Group>
            </Col>
          </Row>



          <Row className="g-2"> 
            <Col md={6}>
            <Form.Group controlId="nombre_adicional2">
              <Form.Label>Nombre Adicional 2</Form.Label>
              <Form.Control
                type="text"
                name="nombre_adicional2"
                value={formData.nombre_adicional2}
                onChange={handleChange}
                
              />
            </Form.Group>
            </Col>
            <Col md={6}>
            <Form.Group controlId="cargo_adicional2">
              <Form.Label>Cargo Adicional 2</Form.Label>
              <Form.Control
                type="text"
                name="cargo_adicional2"
                value={formData.cargo_adicional2}
                onChange={handleChange}
                
              />
            </Form.Group>
            </Col>
          </Row>
          <Row className="g-2"> 
            <Col md={6}>
            <Form.Group controlId="telefono_adicional2">
              <Form.Label>Telefono Adicional 2</Form.Label>
              <Form.Control
                type="text"
                name="telefono_adicional2"
                value={formData.telefono_adicional2}
                onChange={handleChange}
                
              />
            </Form.Group>
            </Col>
            <Col md={6}>
            <Form.Group controlId="email_adicional2">
              <Form.Label>Email Adicional 2</Form.Label>
              <Form.Control
                type="email"
                name="email_adicional2"
                value={formData.email_adicional2}
                onChange={handleChange}
                
              />
            </Form.Group>
            </Col>
          </Row>
          
            
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
                    onClick={() => navigate('/patrocinantes')}
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

export default EditPatrocinantes;
