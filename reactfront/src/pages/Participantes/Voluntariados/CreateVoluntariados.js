import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Button, Modal, Table,Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import SelectComponent from '../../../components/SelectComponent';
import './CreateVoluntariados.css';
import { toast } from 'react-toastify';
import { Card, Row, Col } from 'react-bootstrap';
import { useLoading } from '../../../components/LoadingContext';



const userId = parseInt(localStorage.getItem('user'));  // ID del usuario logueado
const endpoint = 'http://localhost:8000/api';

const CreateVoluntariados = () => {
  const { setLoading } = useLoading();

  const [cedulaError, setCedulaError] = useState(''); // Estado para almacenar el mensaje de validación
  const [isCedulaValid, setIsCedulaValid] = useState(false);

  const [cedulaLengthError, setCedulaLengthError] = useState('');

  const [selectedUserName, setSelectedUserName] = useState(''); // Nombre del usuario seleccionado
  const [showRoleSearchModal, setShowRoleSearchModal] = useState(false);  // Modal de búsqueda de roles
  const [roles, setRoles] = useState([]);  // Lista de roles
  const [selectedRoleId, setSelectedRoleId] = useState(null);  // ID del rol seleccionado
  const [selectedRoleName, setSelectedRoleName] = useState('');  // Nombre del rol seleccionado
  const [filteredRoles, setFilteredRoles] = useState([]);
  const [searchRoleName, setSearchRoleName] = useState(''); // Estado específico para la búsqueda de roles
  const [showConfirmModal, setShowConfirmModal] = useState(false);  
  const [showUserRoleModal, setShowUserRoleModal] = useState(false); 
  const [showUserSearchModal, setShowUserSearchModal] = useState(false);  // Modal de búsqueda de usuarios
  const [users, setUsers] = useState([]);  // Lista de usuarios
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchName, setSearchName] = useState('');
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [comentario, setComentario] = useState('');  // Nuevo estado para el comentario
  const [allUsers, setAllUsers] = useState([]); // Todos los usuarios cargados
  const [paginatedUsers, setPaginatedUsers] = useState([]); // Usuarios en la página actual
  const [currentPageUsers, setCurrentPageUsers] = useState(1);
  const [allRoles, setAllRoles] = useState([]); // Todos los roles cargados
  const [paginatedRoles, setPaginatedRoles] = useState([]); // Roles en la página actual
  const [currentPageRoles, setCurrentPageRoles] = useState(1);
  const navigate = useNavigate();
  
  const itemsPerPage = 8; // Elementos por página
 
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

  useEffect(() => {
    HandleSelected();
    if (showUserSearchModal) {
      getAllUsers();
    } else if (showRoleSearchModal) {
      getAllRoles();
    }
  }, [showUserSearchModal, showRoleSearchModal]);


  const getAllUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      let allUsersData = [];
      let currentPageAPI = 1;
      let lastPageAPI = 1;
  
      do {
        const response = await axios.get(`${endpoint}/users-with-roles?page=${currentPageAPI}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        allUsersData = allUsersData.concat(response.data.data);
        lastPageAPI = response.data.last_page;
        currentPageAPI++;
      } while (currentPageAPI <= lastPageAPI);
  
      setAllUsers(allUsersData);
      setPaginatedUsers(allUsersData.slice(0, itemsPerPage));
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };


  const getAllRoles = async () => {
    try {
      const token = localStorage.getItem('token');
      let allRolesData = [];
      let currentPageAPI = 1;
      let lastPageAPI = 1;
  
      do {
        const response = await axios.get(`${endpoint}/role?page=${currentPageAPI}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        allRolesData = allRolesData.concat(response.data.data);
        lastPageAPI = response.data.last_page;
        currentPageAPI++;
      } while (currentPageAPI <= lastPageAPI);
  
      setAllRoles(allRolesData);
      setPaginatedRoles(allRolesData.slice(0, itemsPerPage));
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  const handleUserPageChange = (pageNumber) => {
    const startIndex = (pageNumber - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setPaginatedUsers(allUsers.slice(startIndex, endIndex));
    setCurrentPageUsers(pageNumber);
  };
  
  const handleRolePageChange = (pageNumber) => {
    const startIndex = (pageNumber - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setPaginatedRoles(allRoles.slice(startIndex, endIndex));
    setCurrentPageRoles(pageNumber);
  };

  const handleSelectUser = (user) => {
    setSelectedUserId(user.id);
    setSelectedUserName(user.username);
    setSelectedRoleId(null); // Limpiar selección de rol al seleccionar usuario
    setSelectedRoleName('');
    setShowUserSearchModal(false);
    setShowConfirmModal(true);
  };

  const handleSelectRole = (role) => {
    setSelectedRoleId(role.id);
    setSelectedRoleName(role.name);
    setSelectedUserId(null); // Limpiar selección de usuario al seleccionar rol
    setSelectedUserName('');
    setShowRoleSearchModal(false);
    setShowConfirmModal(true);
  };

  const handleUserSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchName(value);
    const filtered = users.filter(user => user.username.toLowerCase().includes(value));
    setFilteredUsers(filtered);
  };

  const handleRoleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchRoleName(value);
    const filtered = roles.filter(role => role.name.toLowerCase().includes(value));
    setFilteredRoles(filtered);
  };

  const handleConfirmSendRequest = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Error: Token no encontrado');
        return;
      }

      const cursoResponse = await axios.post(`${endpoint}/voluntariados`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const procedenciaId = cursoResponse.data.personales_voluntariados.id;
      const requestData = {
        user_id: userId,
        destinatario_id: selectedUserId || null,
        role_id: selectedRoleId || null,
        zona_id: 9,
        status: false,
        finish_time: null,
        key: procedenciaId,
        comentario: comentario
      };

      await axios.post(`${endpoint}/peticiones`, requestData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success('Solicitud y Voluntariado  enviados exitosamente');
      navigate('/voluntariados');
    } catch (error) {
      toast.error('Error al enviar la solicitud o Voluntariado');
      console.error('Error al enviar la solicitud o Voluntariado :', error);
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
  setLoading(true);

  const emptyFields = Object.keys(formData).filter(key => {
      return !formData[key];
  });

  if (emptyFields.length > 0) {
      // Si hay campos vacíos, mostramos el modal de confirmación
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

      const formDataWithStatus = {
          ...formData,
      };

      // 1. Crear el curso primero
      const cursoResponse = await axios.post(`${endpoint}/voluntariados`, formDataWithStatus, {
          headers: { Authorization: `Bearer ${token}` },
      });

      toast.success('Nuevo Voluntariado agregado con Éxito');

          navigate('/voluntariados');
      
  } catch (error) {
      toast.error('Error al crear Voluntariado ');
      console.error('Error creando Voluntariado ', error);
  } finally {
      setLoading(false);
  }
};

  const handleBlur = async () => {
    if (formData.cedula_identidad) {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${endpoint}/voluntariados/cedula/${formData.cedula_identidad}`,{headers: {
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
              />
            </Form.Group>

            <Form.Group controlId="email">
              <Form.Label>Dirección Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
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
              {paginatedUsers.length > 0 ? (
                paginatedUsers.map(user => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.username}</td>
                    <td>
                    <div className="d-flex justify-content-around">
                      <Button variant="info"  onClick={() => handleSelectUser(user)} className="me-2">
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
              disabled={currentPageUsers * itemsPerPage >= allUsers.length}
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
              {paginatedRoles.length > 0 ? (
                paginatedRoles.map(role => (
                  <tr key={role.id}>
                    <td>{role.id}</td>
                    <td>{role.name}</td>
                    <td >
                    <div className="d-flex justify-content-around">
                      <Button variant="info"  onClick={() => handleSelectRole(role)} className="me-2">
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
              disabled={currentPageRoles * itemsPerPage >= allRoles.length}
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

export default CreateVoluntariados;
