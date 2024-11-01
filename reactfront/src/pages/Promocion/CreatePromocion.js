import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Button, Modal, Table } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import SelectComponent from '../../components/SelectComponent';
import './CreatePromocion.css';
import { useLoading } from '../../components/LoadingContext';
import 'react-toastify/dist/ReactToastify.css';
import { toast } from 'react-toastify';
import { Card, Row, Col } from 'react-bootstrap'; 




const userId = parseInt(localStorage.getItem('user'));  // ID del usuario logueado
const endpoint = 'http://localhost:8000/api';

const CreatePromocion = () => {
  const { setLoading } = useLoading();
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
  
  const itemsPerPage = 8; // Elementos por página

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

  const navigate = useNavigate();

 
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

      const cursoResponse = await axios.post(`${endpoint}/promocion`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const procedenciaId = cursoResponse.data.id;
      const requestData = {
        user_id: userId,
        destinatario_id: selectedUserId || null,
        role_id: selectedRoleId || null,
        zona_id: 8,
        status: false,
        finish_time: null,
        key: procedenciaId,
        comentario: comentario
      };

      await axios.post(`${endpoint}/peticiones`, requestData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success('Solicitud y Promocion  enviados exitosamente');
      navigate('/promocion');
    } catch (error) {
      toast.error('Error al enviar la solicitud o Promocion');
      console.error('Error al enviar la solicitud o Promocion :', error);
    }
  };

  

  

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
        const cursoResponse = await axios.post(`${endpoint}/promocion`, formDataWithStatus, {
            headers: { Authorization: `Bearer ${token}` },
        });

        toast.success('Nueva Promocion agregada con Éxito');

            navigate('/promocion');
        
    } catch (error) {
        toast.error('Error al crear Promocion ');
        console.error('Error creando Promocion ', error);
    } finally {
        setLoading(false);
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
    </div>
    </div>
  );
};

export default CreatePromocion;
