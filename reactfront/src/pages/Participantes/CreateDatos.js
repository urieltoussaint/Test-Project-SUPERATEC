import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Button, Alert, Modal, Table } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import SelectComponent from '../../components/SelectComponent';
import './CreateDatos.css';
import { useLoading } from '../../components/LoadingContext';
import { ToastContainer, toast } from 'react-toastify';
import { Card, Row, Col } from 'react-bootstrap'; 
import estadosMunicipios from '../../components/estadosMunicipios.json';
import { FaSearch } from 'react-icons/fa';  // Importamos íconos de react-icons



const userId = parseInt(localStorage.getItem('user'));  // ID del usuario logueado
const endpoint = 'http://localhost:8000/api';

const CreateDatos = () => {
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
  const [redirectToCursos, setRedirectToCursos] = useState('');
  const [municipiosDisponibles, setMunicipiosDisponibles] = useState([]);  // Municipios que se mostrarán según el estado seleccionado
  const [selectVisible, setSelectVisible] = useState(false);  // Control de la visibilidad de los selectores

  const [paginatedUsers, setPaginatedUsers] = useState([]); // Usuarios en la página actual
  const [currentPageUsers, setCurrentPageUsers] = useState(1);
  

  const [paginatedRoles, setPaginatedRoles] = useState([]); // Roles en la página actual
  const [currentPageRoles, setCurrentPageRoles] = useState(1);
  const [totalPages, setTotalPages] = useState(1); // Default to 1 page initially

  
  const itemsPerPage = 8; // Elementos por página
  

  const [formData, setFormData] = useState({
    cedula_identidad: '',
    nombres: '',
    apellidos: '',
    fecha_nacimiento: '',
    direccion: '',
    direccion_email: '',
    telefono_casa: '',
    telefono_celular: '',
    nacionalidad_id: 2,
    genero_id: null,
    grupo_prioritario_id: null,
    estado_id: '',
    procedencia_id: null,
    nivel_instruccion_id: null,
    como_entero_superatec_id: null,
    municipio:''
  });

  const [filterOptions, setFilterOptions] = useState({
    nivelInstruccionOptions: [],
    estadoOptions: [],
    generoOptions: [],
    grupoOptions: [],
    nacionalidadOptions: [],
    procedenciaOptions: [],
    superatecOptions: [],  
});




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
      let dataToSend = { ...formData }; // Inicia dataToSend con los datos del formulario
      
      if (formData.fecha_nacimiento) { // Verifica si fecha_nacimiento NO es nulo
        const edadCalculada = calcularEdad(formData.fecha_nacimiento);
        dataToSend = {
          ...dataToSend,
          edad: edadCalculada // Agrega la edad calculada solo si fecha_nacimiento no es nulo
        };
      }
  
      const token = localStorage.getItem('token');
    
      // 1. Crear el nuevo participante primero
      const response = await axios.post(`${endpoint}/datos`, dataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    
      const newParticipantId = response.data.id;  // Obtener el ID del nuevo participante
    
      // 2. Usar el ID del nuevo participante como clave en la petición
      const requestData = {
        user_id: userId,  // Usuario logueado que envía la solicitud
        destinatario_id: selectedUserId || null,  // Usuario destinatario seleccionado (si existe)
        role_id: selectedRoleId || null,  // El role_id es nulo si se seleccionó un usuario, si no, el rol seleccionado
        zona_id: 1,  // Valor fijo
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
      // toast.success("Nuevo Participante agregado y petición creada con Éxito");
      toast.error('Error al enviar la solicitud o los datos');
  
      // Redirigir dependiendo de 'redirectToCursos'
      if (redirectToCursos===true) {
        navigate(`/inscribir-cursos/${formData.cedula_identidad}`); // Redirige a inscripción de cursos
      } else {
        navigate('/datos'); // Redirige a la página de datos
      }
    } catch (error) {
      toast.error('Error al enviar la solicitud o los datos');
      console.error('Error al enviar la solicitud o los datos:', error);
    }
  };
  

  
  const handleSeleccionar = async () => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${endpoint}/filter-datos`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const {nivel_instruccion,estado,genero,grupo_prioritario,nacionalidad,procedencia,superatec} = response.data;

        // Guardar las opciones en el estado de filterOptions
        setFilterOptions({
            nivelInstruccionOptions: nivel_instruccion,
            estadoOptions: estado,
            generoOptions: genero,
            grupoOptions:grupo_prioritario,
            nacionalidadOptions:nacionalidad,
            procedenciaOptions:procedencia,
            superatecOptions:superatec,

        });

        console.log("superatec",filterOptions.superatecOptions);
        console.log("procedencia",filterOptions.procedenciaOptions);


        setSelectVisible(true);  // Mostrar los selectores
    } catch (error) {
        console.error('Error fetching filter options:', error);
    }
};



const handleChange = (event) => {
  const { name, value, type, checked } = event.target;

  let updatedValue = value;

  if (name === 'cedula_identidad') {
    updatedValue = value.replace(/^V-/, '');  // Elimina "V-" si ya está presente
    updatedValue = updatedValue.toUpperCase(); // Convertir todo a mayúsculas

    // Permitir solo números y UNA sola 'R'
    const rCount = (updatedValue.match(/R/g) || []).length;
    updatedValue = updatedValue.replace(/[^0-9R]/gi, ''); // Permitir solo números y "R"
    
    if (rCount > 1) {
      updatedValue = updatedValue.replace(/R/g, ''); // Si hay más de una R, eliminarlas
      updatedValue += 'R'; // Volver a añadir solo una R si era válida
    }

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



  const handleKeyDown = (e) => {
    // Permitir números, borrar, tabulación, eliminar y la tecla "R" (en mayúscula)
    if (
      e.key !== 'Backspace' &&
      e.key !== 'Tab' &&
      e.key !== 'Delete' &&
      e.key !== 'r' &&
      e.key !== 'R' &&
      !/[0-9]/.test(e.key)
    ) {
      e.preventDefault();
    }
  };

  const handleSubmit = async (e, redirectToCursos) => {
    e.preventDefault(); // Previene el comportamiento por defecto del formulario
  
    // Define los campos que deben ser ignorados al verificar si están vacíos
    const fieldsToIgnore = ['direccion_email', 'telefono_casa'];
  
    setLoading(true); // Inicia el proceso de carga
    // Calcular la edad y agregarla a los datos del formulario
    const edadCalculada = calcularEdad(formData.fecha_nacimiento);
    const dataToSend = {
      ...formData,
      edad: edadCalculada // Agregar la edad calculada
    };
  
    // Filtra los campos vacíos, excepto los de la lista fieldsToIgnore
    const emptyFields = Object.keys(formData).filter(key => {
      if (fieldsToIgnore.includes(key)) return false;
      return !formData[key];
    });
  
    if (emptyFields.length > 0) {
      // Si existen campos vacíos, muestra el modal y detiene el proceso
      setRedirectToCursos(redirectToCursos); // Guardamos el valor de redirección

      setShowConfirmModal(true);
      setLoading(false);
      return;
    }
  
    try {
      const token = localStorage.getItem('token'); // Obtiene el token del localStorage
  
      if (!token) {
        toast.error('Error: Token no encontrado');
        setLoading(false);
        return;
      }
  
      // Envía los datos del formulario al backend
      await axios.post(`${endpoint}/datos`, dataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      toast.success('Nuevo Participante agregado con Éxito');
  
      // Redirige según el valor de redirectToCursos
      if (redirectToCursos !== false) {
        navigate(`/inscribir-cursos/${formData.cedula_identidad}`);
      } else {
        navigate('/datos');
      }
  
    } catch (error) {
      toast.error('Error al crear Participante');
      console.error('Error creating data:', error);
    } finally {
      setLoading(false); // Detiene el proceso de carga
    }
  };

  const handleBlur = async () => {
    if (formData.cedula_identidad) {
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
      <h2 className="mb-2">Agregar Nuevo Participante</h2>

      <Form onSubmit={(e) => handleSubmit(e, false)}
        className="custom-gutter">
            <Row className="g-2"> 
            <Col md={6}>
            
            <Row className="g-2 align-items-end">
              <Col md={1}>
                <SelectComponent
                  options={filterOptions.nacionalidadOptions} // Usar el estado filterOptions
                  nameField="descripcion"
                  valueField="id"
                  selectedValue={formData.nacionalidad_id}
                  handleChange={handleChange}
                  controlId="nacionalidad_id"
                  label="Tipo"
                />
              </Col>

              <Col md={9}>
                <Form.Group controlId="cedula_identidad">
                  <Form.Label>Número de Documento</Form.Label>
                  <Form.Control
                    type="text"
                    name="cedula_identidad"
                    value={formData.cedula_identidad ? `${formData.cedula_identidad}` : ''}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown} // Evita caracteres no numéricos
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
                      Cédula disponible.
                    </Form.Control.Feedback>
                  )}
            </Row>

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
              options={filterOptions.generoOptions}  // Usar el estado filterOptions
              nameField="descripcion"
              valueField="id"
              selectedValue={formData.genero_id}
              handleChange={handleChange}
              controlId="genero_id"
              label="Género"
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
            
            <SelectComponent
              options={filterOptions.grupoOptions}  // Usar el estado filterOptions
              nameField="descripcion"
              valueField="id"
              selectedValue={formData.grupo_prioritario_id}
              handleChange={handleChange}
              controlId="grupo_prioritario_id"
              label="Grupo Prioritario"
            />
            </Row>
            <Row className="g-2"> 
            <Col md={6}>
            <SelectComponent
              options={filterOptions.procedenciaOptions}  // Usar el estado filterOptions
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
             options={filterOptions.nivelInstruccionOptions}  // Usar el estado filterOptions
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
              <Form.Label>Dirección Email (Opcional)</Form.Label>
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
              <Form.Label>Teléfono de Casa (Opcional)</Form.Label>
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
              options={filterOptions.superatecOptions}
              nameField="descripcion"
              valueField="id"
              selectedValue={formData.como_entero_superatec_id}
              handleChange={handleChange}
              controlId="como_entero_superatec_id"
              label="¿Cómo se enteró de Superatec?"
            />



            
      <div className="button-container mt-3">
        <Button
          variant="info"
          type="submit"
          className="ms-2"
          
          onClick={(e) => { 

            e.preventDefault();  // Prevenir comportamiento por defecto
            setRedirectToCursos(false);
            handleSubmit(e, false); // Guardar y redirigir a /datos
          }}
        >
          Guardar
        </Button>

        <Button
          variant="secondary"
          onClick={() => navigate('/datos')}  // Volver simplemente redirige a /datos sin lógica adicional
          className="ms-2"
        >
          Volver
        </Button>

        <Button
          variant="success"
          onClick={(e) => { 
            e.preventDefault();  // Prevenir comportamiento por defecto
            setRedirectToCursos(true);
            handleSubmit(e, true); // Siguiente redirige a /inscribir-cursos
          }}
          className="ms-2"
        >
          Siguiente
        </Button>
      </div>


      </Form>

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
  );
};

export default CreateDatos;
