import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Button, Alert, Modal, Table } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import SelectComponent from '../../components/SelectComponent';
import { useLoading } from '../../components/LoadingContext';
import { ToastContainer, toast } from 'react-toastify';
import { Card, Row, Col } from 'react-bootstrap'; 
import estadosMunicipios from '../../components/estadosMunicipios.json';
import { FaSearch } from 'react-icons/fa';  // Importamos íconos de react-icons

 

const userId = parseInt(localStorage.getItem('user'));  // ID del usuario logueado
const endpoint = 'http://localhost:8000/api';

const CreatePatrocinantes = () => {
  const [cedulaError, setCedulaError] = useState(''); 
  const [isCedulaValid, setIsCedulaValid] = useState(false);
  const [cedulaLengthError, setCedulaLengthError] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);  
  const [showUserRoleModal, setShowUserRoleModal] = useState(false); 
  const [showUserSearchModal, setShowUserSearchModal] = useState(false);  // Modal de búsqueda de usuarios
  const [selectedUserId, setSelectedUserId] = useState(null);
  const navigate = useNavigate();
  const { setLoading } = useLoading();
  const [selectedUserName, setSelectedUserName] = useState(''); // Nombre del usuario seleccionado
  const [showRoleSearchModal, setShowRoleSearchModal] = useState(false);  // Modal de búsqueda de roles
  const [selectedRoleId, setSelectedRoleId] = useState(null);  // ID del rol seleccionado
  const [selectedRoleName, setSelectedRoleName] = useState('');  // Nombre del rol seleccionado

  const [comentario, setComentario] = useState('');
  const [municipiosDisponibles, setMunicipiosDisponibles] = useState([]);  // Municipios que se mostrarán según el estado seleccionado

  const [paginatedUsers, setPaginatedUsers] = useState([]); // Usuarios en la página actual
  const [currentPageUsers, setCurrentPageUsers] = useState(1);
  
  const [paginatedRoles, setPaginatedRoles] = useState([]); // Roles en la página actual
  const [currentPageRoles, setCurrentPageRoles] = useState(1);
  const [totalPages, setTotalPages] = useState(1); // Default to 1 page initially
  


  const [formData, setFormData] = useState({
    nombre_patrocinante: '',
    // empresa_persona: '',
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
    tipo_doc_id:1,
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
    tipoDocOptions:[],
});
const [selectVisible, setSelectVisible] = useState(false);  // Control de la visibilidad de los selectores

  useEffect(() => {
    handleSeleccionar();
    if (showUserSearchModal) {
      getAllUsers();
    } else if (showRoleSearchModal) {
      getAllRoles();
    }
  }, [showUserSearchModal, showRoleSearchModal]);


  const [filters, setFilters] = useState({
    username:'',
    name:''
  });
  

  const getAllUsers = async (page = 1) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${endpoint}/users-paginate`, {
            headers: { Authorization: `Bearer ${token}` },
            params: { ...filters, page }, // Incluye `page` en los parámetros
        });

        const { data, last_page, current_page } = response.data.users;

        // Actualizar el estado
        setPaginatedUsers(data); // Datos de la página actual
        setCurrentPageUsers(current_page); // Página actual
        setTotalPages(last_page); // Total de páginas
    } catch (error) {
        console.error('Error fetching users:', error);
        toast.error('Error fetching data');
        setPaginatedUsers([]); // Limpia los datos en caso de error
    }
};


const getAllRoles = async (page = 1) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${endpoint}/role-paginate`, {
            headers: { Authorization: `Bearer ${token}` },
            params: { ...filters, page }, // Incluye `page` en los parámetros
        });

        const { data, last_page, current_page } = response.data.roles;

        setPaginatedRoles(data); // Datos de la página actual
        setCurrentPageRoles(current_page); // Página actual
        setTotalPages(last_page); // Total de páginas
    } catch (error) {
        console.error('Error fetching roles:', error);
        toast.error('Error fetching data');
        setPaginatedRoles([]); // Limpia los datos en caso de error
    }
};




const handleFilterChange = (e) => {
  const { name, value } = e.target;
  setFilters(prev => ({ ...prev, [name]: value }));
};


const handleUserPageChange = async (newPage) => {
  if (newPage >= 1 && newPage <= totalPages) {
      await getAllUsers(newPage);
  }
};

const handleRolePageChange = async (newPage) => {
  if (newPage >= 1 && newPage <= totalPages) {
      await getAllRoles(newPage);
  }
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
 
  // const handleUserSearch = (e) => {
  //   const value = e.target.value.toLowerCase();
  //   setSearchName(value);
  //   const filtered = users.filter(user => user.username.toLowerCase().includes(value));
  //   setFilteredUsers(filtered);
  // };

  // const handleRoleSearch = (e) => {
  //   const value = e.target.value.toLowerCase();
  //   setSearchRoleName(value); // Actualiza el estado de búsqueda para roles
    
  //   // Filtrar los roles basados en el valor ingresado en el campo de búsqueda
  //   const filtered = roles.filter(role => role.name.toLowerCase().includes(value)
  //   );
    
  //   // Actualizar el estado de filteredRoles con los resultados filtrados
  //   setFilteredRoles(filtered);
  // };
  

  const handleSelectUser = (user) => {
    setSelectedUserId(user.id); // Guardar ID del usuario seleccionado
    setSelectedUserName(user.username); // Guardar nombre del usuario seleccionado
    setShowUserSearchModal(false); // Cerrar modal de búsqueda
    setShowConfirmModal(true); // Mostrar el modal de confirmación después de seleccionar un usuario
  };


  const handleSelectRole = (role) => {
    setSelectedRoleId(role.id);  // Guardar ID del rol seleccionado
    setSelectedRoleName(role.name);  // Guardar nombre del rol seleccionado
    setShowRoleSearchModal(false);  // Cerrar modal de búsqueda de roles
    setShowConfirmModal(true);  // Mostrar modal de confirmación
  };
  
  const handleConfirmSendRequest = async () => {
    try {
      const token = localStorage.getItem('token');
  
      // 1. Crear el nuevo participante primero
      const response = await axios.post(`${endpoint}/patrocinantes`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      const newParticipantId = response.data.patrocinante.id;  // Obtener el ID del nuevo participante
      console.log("respuesta del post", response.data.patrocinante.id);
  
      // 2. Usar el ID del nuevo participante como clave en la petición
      const requestData = {
        user_id: userId,  // Usuario logueado que envía la solicitud
        destinatario_id: selectedUserId || null,  // Usuario destinatario seleccionado (si existe)
        role_id: selectedRoleId || null,  // El role_id es nulo si se seleccionó un usuario, si no, el rol seleccionado
        zona_id: 6,  // Valor fijo
        status: false,  // Estado de la petición
        finish_time: null,  // No hay finish_time al momento de creación
        key: newParticipantId,  // Usar el ID del nuevo participante como clave
        comentario: comentario
      };
  
      // 3. Enviar la petición
      await axios.post(`${endpoint}/peticiones`, requestData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      toast.success('Solicitud y datos enviados exitosamente');
      navigate('/patrocinantes');
  
    } catch (error) {
      toast.error('Error al enviar la solicitud o los datos');
      console.error('Error al enviar la solicitud o los datos:', error);
    }
  };
 
  

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    let updatedValue = value;

    if (name === 'rif_cedula') {
      updatedValue = value.replace(/^V-/, '');  
      updatedValue = updatedValue.replace(/\D/g, ''); 
      if (updatedValue.length < 7) {
        setCedulaLengthError('Debe tener al menos 7 caracteres.');
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

  const handleKeyDown = (e) => {
    if (e.key !== 'Backspace' && e.key !== 'Tab' && e.key !== 'Delete' && !/[0-9]/.test(e.key)) {
      e.preventDefault();
    }
  };

  const handleSubmit = async (e) => {
    console.log("llego al submit");
  e.preventDefault();

  setLoading(true);
  const dataToSend = {
    ...formData,
  };

  const emptyFields = Object.keys(formData).filter(key => {
    if (key === 'otra_info' || key === 'referido_por' || key === 'web' 
        || key === 'estado_id' || key === 'ciudad' || key === 'nombre_adicional' || key === 'cargo_adicional'
        || key === 'telefono_adicional'   || key === 'email_adicional' 
        || key === 'nombre_adicional2' || key === 'cargo_adicional2'
        || key === 'telefono_adicional2'   || key === 'email_adicional2' 
    ) {
        return false;
      }

    return !formData[key];
  });

  if (emptyFields.length > 0) {
    setShowConfirmModal(true);
    setLoading(false);
    return;
  }

  try {
    const token = localStorage.getItem('token'); 

    if (!token) {
      toast.error('Error: Token no encontrado');
      setLoading(false);
      return;
    }

    await axios.post(`${endpoint}/patrocinantes`, dataToSend, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    toast.success('Nuevo Patrocinante agregado con Éxito');

  } catch (error) {
    toast.error('Error al crear Patrocinado');
    console.error('Error creating data:', error);

  } finally {
    setLoading(false);
    navigate('/patrocinantes');
  }
};

const handleSeleccionar = async () => {
  try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${endpoint}/filter-patrocinantes`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const { estado, pais, tipo_industria, tipo_patrocinante,tipo_doc } = response.data;
      setFilterOptions( {
        estadoOptions: estado,
        paisOptions: pais,
        tipoIndustriaOptions: tipo_industria,
        tipoPatrocinanteOptions: tipo_patrocinante,
        tipoDocOptions:tipo_doc,

      });
      setSelectVisible(true);  // Mostrar los selectores

    } catch (error) {
      console.error('Error fetching filter options:', error);
      
    }
}



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
          <h2 className="mb-2">Agregar Nuevo Patrocinante</h2>
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
                    <Row className="g-2 align-items-end">
                  <Col md={1}>
                    <SelectComponent
                      options={filterOptions.tipoDocOptions} // Usar el estado filterOptions
                      nameField="descripcion"
                      valueField="id"
                      selectedValue={formData.tipo_doc_id}
                      handleChange={handleChange}
                      controlId="tipo_doc_id"
                      label="Tipo"
                    />
                  </Col>

                  <Col md={9}>
                    <Form.Group controlId="rif_cedula">
                      <Form.Label>Número de Documento</Form.Label>
                      <Form.Control
                        type="text"
                        name="rif_cedula"
                        value={formData.rif_cedula }
                        onChange={handleChange}
                        onKeyDown={handleKeyDown}  // Evita caracteres no numéricos
                        onBlur={handleBlur}
                        placeholder="123321123"
                        maxLength={10}
                        required
                        className={
                          cedulaError || cedulaLengthError
                            ? 'is-invalid'
                            : isCedulaValid ? 'is-valid' : ''
                        }
                      />
                      
                    </Form.Group>
                    </Col>
                    {cedulaError && <Alert variant="danger">{cedulaError}</Alert>}
                      {!cedulaError && isCedulaValid && (
                        <Form.Control.Feedback type="valid">
                          Rif/Cédula No disponible.
                        </Form.Control.Feedback>
                      )}
                    </Row>
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
                      <Form.Label>Web (Opcional)</Form.Label>
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
                      <Form.Label>Referido por (Opcional)</Form.Label>
                      <Form.Control
                        type="text"
                        name="referido_por"
                        value={formData.referido_por}
                        onChange={handleChange}
                        
                      />
                    </Form.Group>
                    <Form.Group controlId="otra_info">
                      <Form.Label>Información Adicional (Opcional)</Form.Label>
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
              <Form.Label>Nombre Adicional (Opcional)</Form.Label>
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
              <Form.Label>Cargo Adicional (Opcional)</Form.Label>
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
              <Form.Label>Telefono Adicional (Opcional)</Form.Label>
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
              <Form.Label>Email Adicional (Opcional)</Form.Label>
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
              <Form.Label>Nombre Adicional 2 (Opcional)</Form.Label>
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
              <Form.Label>Cargo Adicional 2 (Opcional)</Form.Label>
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
              <Form.Label>Telefono Adicional 2 (Opcional)</Form.Label>
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
              <Form.Label>Email Adicional 2 (Opcional)</Form.Label>
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
                    onClick={() => navigate(-1)}
                    className="ms-2"
                >
                    Volver
                </Button>
            </div>
        
      </div>
      
  {/* Modal de confirmación si hay campos vacíos */}
  <Modal show={showConfirmModal && !selectedUserId && !selectedRoleId} onHide={() => setShowConfirmModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Campos Vacíos</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Existen campos vacíos en el formulario. ¿Desea realizar una petición a un usuario o conjunto de usuarios/roles?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
            Cancelar
          </Button>
          <Button variant="success" onClick={() => {
            setShowConfirmModal(false);
            setShowUserRoleModal(true);
          }}>
            Enviar Petición
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal para seleccionar usuario o rol */}
      <Modal show={showUserRoleModal} onHide={() => setShowUserRoleModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Enviar Petición</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          ¿Desea enviar la petición a un usuario específico o a un rol?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowUserRoleModal(false)}>
            Cancelar
          </Button>
          <Button variant="warning" onClick={() => {
            setShowUserRoleModal(false);
            setShowUserSearchModal(true);
          }}>
            Buscar Usuario
          </Button>
          <Button variant="info" onClick={() => {
            setShowUserRoleModal(false);
            setShowRoleSearchModal(true);
          }}>
            Buscar Rol
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de búsqueda de usuarios */}
      <Modal show={showUserSearchModal} onHide={() => setShowUserSearchModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Buscar Usuario</Modal.Title>
        </Modal.Header>
        <Modal.Body>
        <div className="d-flex align-items-center">
          <Form.Control
            name="username"
            type="text"
            placeholder="Buscar por nombre"
            value={filters.username}
            onChange={handleFilterChange}
            className="me-2"
          />
          <Button 
              variant="info me-2" 
              onClick={getAllUsers}
              style={{ padding: '5px 10px', width: '120px' }} // Ajusta padding y ancho
          >
              <FaSearch className="me-1" /> {/* Ícono de lupa */}
          </Button>
          </div>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.length > 0 ? (
                  paginatedUsers.map(user => (
                      <tr key={user.id}>
                          <td>{user.id}</td>
                          <td>{user.username}</td>
                          <td>
                          <div className="d-flex justify-content-center align-items-center">

                                <Button variant="info" onClick={() => handleSelectUser(user)} className="me-2">
                                    <i className="bi bi-check2-square"></i>
                                </Button>
                            </div>
                          </td>
                      </tr>
                  ))
              ) : (
                  <tr>
                      <td colSpan="3">No se encontraron usuarios.</td>
                  </tr>
              )}
          </tbody>

          </Table>
          <div className="d-flex justify-content-between mt-3">
          <Button
            variant="secondary"
              onClick={() => handleUserPageChange(currentPageUsers - 1)}
              disabled={currentPageUsers === 1}
          >
              Anterior
          </Button>
          <Button
              variant="secondary"
              onClick={() => handleUserPageChange(currentPageUsers + 1)}
              disabled={currentPageUsers === totalPages}
          >
              Siguiente
          </Button>

          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowUserSearchModal(false)}>
            Cerrar
          </Button>
          <Button variant="light" onClick={() => {
            setShowUserSearchModal(false);
            setShowUserRoleModal(true);
          }}>
            Volver
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de búsqueda de roles */}
      <Modal show={showRoleSearchModal} onHide={() => setShowRoleSearchModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Buscar Rol</Modal.Title>
        </Modal.Header>
        <Modal.Body>
        <div className="d-flex align-items-center">
          <Form.Control
            name="name"
            type="text"
            placeholder="Buscar por nombre"
            value={filters.name}
            onChange={handleFilterChange}
            className="me-2" // Margen derecho para separar del botón
            style={{ flex: 1 }} // Ajusta el ancho para que ocupe el espacio disponible
          />
          <Button
            variant="info"
            onClick={getAllRoles}
            style={{ whiteSpace: 'nowrap' }} // Evita que el texto del botón se rompa en varias líneas
          >
            <FaSearch className="me-1" /> Buscar {/* Ícono de lupa */}
          </Button>
        </div>

          <Table striped bordered hover>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
            {paginatedRoles.length > 0 ? (
                paginatedRoles.map(role => (
                    <tr key={role.id}>
                        <td>{role.id}</td>
                        <td>{role.name}</td>
                        <td>

                            <div className="d-flex justify-content-center align-items-center">

                              <Button variant="info" onClick={() => handleSelectRole(role)} className="me-2">
                                  <i className="bi bi-check2-square"></i>
                              </Button>
                            </div>
                        </td>
                    </tr>
                ))
            ) : (
                <tr>
                    <td colSpan="3">No se encontraron roles.</td>
                </tr>
            )}
        </tbody>

          </Table>
          <div className="d-flex justify-content-between mt-3">
          <Button
            variant="secondary"
            onClick={() => handleRolePageChange(currentPageRoles - 1)}
            disabled={currentPageRoles === 1}
        >
            Anterior
        </Button>
        <Button
            variant="secondary"
            onClick={() => handleRolePageChange(currentPageRoles + 1)}
            disabled={currentPageRoles === totalPages}
        >
            Siguiente
        </Button>

          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRoleSearchModal(false)}>
            Cerrar
          </Button>
          <Button variant="light" onClick={() => {
            setShowRoleSearchModal(false);
            setShowUserRoleModal(true);
          }}>
            Volver
          </Button>
        </Modal.Footer>
      </Modal>


      {/* Modal de confirmación para enviar la solicitud al usuario */}
      <Modal show={selectedUserId !== null && showConfirmModal} onHide={() => setShowConfirmModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Envío de Solicitud</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedUserId
            ? `¿Seguro que deseas enviar la solicitud al usuario ${selectedUserName}?`
            : 'No se ha seleccionado ningún usuario.'}
        </Modal.Body>
        <Form.Group controlId="comentario" style={{ margin: '10px 20px' }}>
          <Form.Label>Comentario (opcional)</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            placeholder="Agrega un comentario sobre lo que hiciste o lo que falta."
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            style={{ padding: '5px', resize: 'none' }}
          />
        </Form.Group>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>Cancelar</Button>
          <Button variant="success" onClick={handleConfirmSendRequest} disabled={!selectedUserId}>Confirmar</Button>
          <Button variant="light" onClick={() => {
            setShowConfirmModal(false);
            setShowUserSearchModal(true);
          }}>
            Volver
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de confirmación para enviar la solicitud al rol */}
      <Modal show={selectedRoleId !== null && showConfirmModal} onHide={() => setShowConfirmModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Envío de Solicitud</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedRoleId
            ? <p>¿Seguro que deseas enviar la solicitud al rol {selectedRoleName}?</p>
            : <p>No se ha seleccionado ningún rol.</p>}
          <Form.Group controlId="comentario" style={{ margin: '10px 0' }}>
            <Form.Label>Comentario (opcional)</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Agrega un comentario sobre lo que hiciste o lo que falta."
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              style={{ padding: '5px', resize: 'none' }}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>Cancelar</Button>
          <Button variant="success" onClick={handleConfirmSendRequest} disabled={!selectedRoleId}>Confirmar</Button>
          <Button variant="light" onClick={() => {
            setShowConfirmModal(false);
            setShowRoleSearchModal(true);
          }}>Volver</Button>
        </Modal.Footer>
      </Modal>

    </div>
    </Form>
    </div>
  );
};

export default CreatePatrocinantes;
