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



const userId = parseInt(localStorage.getItem('user'));  // ID del usuario logueado
const endpoint = 'http://localhost:8000/api';

const CreateDatos = () => {
  const [cedulaError, setCedulaError] = useState(''); 
  const [isCedulaValid, setIsCedulaValid] = useState(false);
  const [cedulaLengthError, setCedulaLengthError] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);  
  const [showUserRoleModal, setShowUserRoleModal] = useState(false); 
  const [showUserSearchModal, setShowUserSearchModal] = useState(false);  // Modal de búsqueda de usuarios
  const [users, setUsers] = useState([]);  // Lista de usuarios
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchName, setSearchName] = useState('');
  const [selectedUserId, setSelectedUserId] = useState(null);
  const navigate = useNavigate();
  const { setLoading } = useLoading();
  const [selectedUserName, setSelectedUserName] = useState(''); // Nombre del usuario seleccionado
  const [showRoleSearchModal, setShowRoleSearchModal] = useState(false);  // Modal de búsqueda de roles
  const [roles, setRoles] = useState([]);  // Lista de roles
  const [selectedRoleId, setSelectedRoleId] = useState(null);  // ID del rol seleccionado
  const [selectedRoleName, setSelectedRoleName] = useState('');  // Nombre del rol seleccionado
  const [filteredRoles, setFilteredRoles] = useState([]);
  const [searchRoleName, setSearchRoleName] = useState(''); // Estado específico para la búsqueda de roles
  const [previousModal, setPreviousModal] = useState(null);
  const [comentario, setComentario] = useState('');
  const [municipiosDisponibles, setMunicipiosDisponibles] = useState([]);  // Municipios que se mostrarán según el estado seleccionado

  


  const [formData, setFormData] = useState({
    cedula_identidad: '',
    nombres: '',
    apellidos: '',
    fecha_nacimiento: '',
    direccion: '',
    direccion_email: '',
    telefono_casa: '',
    telefono_celular: '',
    status_seleccion_id: null,
    nacionalidad_id: null,
    genero_id: null,
    grupo_prioritario_id: null,
    estado_id: '',
    procedencia_id: null,
    nivel_instruccion_id: null,
    como_entero_superatec_id: null,
    municipio:''
  });

  useEffect(() => {
    if (showUserSearchModal) {
      getAllUsers();
    } else if (showRoleSearchModal) {
      getAllRoles();
    }
  }, [showUserSearchModal, showRoleSearchModal]);
  

  const getAllUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      let allUsers = [];
      let currentPage = 1;
      let lastPage = 1;
      
      do {
        const response = await axios.get(`${endpoint}/users-with-roles?page=${currentPage}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        allUsers = allUsers.concat(response.data.data);  // Asumiendo que la respuesta tiene un formato de paginación
        lastPage = response.data.last_page;  // Asumiendo que la respuesta incluye información de la última página
        currentPage++;
      } while (currentPage <= lastPage);

      setUsers(allUsers);
      setFilteredUsers(allUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
};

  const getAllRoles = async () => {
    try {
      const token = localStorage.getItem('token');
      let allRoles = [];
      let currentPage = 1;
      let lastPage = 1;
  
      do {
        const response = await axios.get(`${endpoint}/role?page=${currentPage}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        allRoles = allRoles.concat(response.data.data); // Asumiendo que la respuesta tiene un formato de paginación
        lastPage = response.data.last_page; // Asumiendo que la respuesta incluye información de la última página
        currentPage++;
      } while (currentPage <= lastPage);
  
      setRoles(allRoles);
      setFilteredRoles(allRoles);
    } catch (error) {
      console.error('Error fetching roles:', error);
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
  
  
  

  const handleUserSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchName(value);
    const filtered = users.filter(user => user.username.toLowerCase().includes(value));
    setFilteredUsers(filtered);
  };

  const handleRoleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchRoleName(value); // Actualiza el estado de búsqueda para roles
    
    // Filtrar los roles basados en el valor ingresado en el campo de búsqueda
    const filtered = roles.filter(role => role.name.toLowerCase().includes(value)
    );
    
    // Actualizar el estado de filteredRoles con los resultados filtrados
    setFilteredRoles(filtered);
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
      const token = localStorage.getItem('token');
  
      // 1. Crear el nuevo participante primero
      const response = await axios.post(`${endpoint}/datos`, formData, {
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
  
      toast.success('Solicitud y datos enviados exitosamente');
      navigate('/datos');
  
    } catch (error) {
      toast.error('Error al enviar la solicitud o los datos');
      console.error('Error al enviar la solicitud o los datos:', error);
    }
  };
  
 
  

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

  const handleKeyDown = (e) => {
    if (e.key !== 'Backspace' && e.key !== 'Tab' && e.key !== 'Delete' && !/[0-9]/.test(e.key)) {
      e.preventDefault();
    }
  };

  const handleSubmit = async (e, redirectToCursos) => {
  e.preventDefault();

  setLoading(true);
  // Calcular la edad y agregarla a los datos del formulario
  const edadCalculada = calcularEdad(formData.fecha_nacimiento);
  const dataToSend = {
    ...formData,
    edad: edadCalculada // Agregar la edad calculada
  };

  const emptyFields = Object.keys(formData).filter(key => {
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

    await axios.post(`${endpoint}/datos`, dataToSend, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    toast.success('Nuevo Participante agregado con Éxito');

    if (redirectToCursos) {
      navigate(`/inscribir-cursos/${formData.cedula_identidad}`);
    } else {
      navigate('/datos');
    }

  } catch (error) {
    toast.error('Error al crear Participante');
    console.error('Error creating data:', error);

  } finally {
    setLoading(false);
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
            
        <div className="button-container mt-3"  >
            <Button 
                variant="info"
                type="submit"
                className="ms-2"
            >
                Guardar
            </Button>

            <Button 
                variant="secondary" 
                onClick={() => navigate('/datos')}
                className="ms-2"
            >
                Volver
            </Button>

            <Button 
                variant="success" 
                onClick={(e) => handleSubmit(e, true)}
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
          <Form.Control
            type="text"
            placeholder="Buscar por nombre"
            value={searchName}
            onChange={handleUserSearch}
          />
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map(user => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.username}</td>
                    <td>
                      <Button
                        variant="primary"
                        onClick={() => handleSelectUser(user)}
                      >
                        Seleccionar
                      </Button>
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
          <Form.Control
            type="text"
            placeholder="Buscar por nombre"
            value={searchRoleName}
            onChange={handleRoleSearch}
          />
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredRoles.length > 0 ? (
                filteredRoles.map(role => (
                  <tr key={role.id}>
                    <td>{role.id}</td>
                    <td>{role.name}</td>
                    <td>
                      <Button
                        variant="primary"
                        onClick={() => handleSelectRole(role)}
                      >
                        Seleccionar
                      </Button>
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
