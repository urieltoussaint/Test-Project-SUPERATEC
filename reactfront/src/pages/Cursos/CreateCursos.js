import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Button, Modal, Table } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import SelectComponent from '../../components/SelectComponent';
import { useLoading } from '../../components/LoadingContext';
import { ToastContainer, toast } from 'react-toastify';
import { Card, Row, Col } from 'react-bootstrap'; 

const userId = parseInt(localStorage.getItem('user'));  // ID del usuario logueado
const endpoint = 'http://localhost:8000/api';

const CreateCursos = () => {
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

  const [formData, setFormData] = useState({
    descripcion: '',
    cantidad_horas: '',
    fecha_inicio: '',
    area_id: '',
    unidad_id:'',
    nivel_id:'',
    modalidad_id:'',
    tipo_programa_id:'',
  });

  const [filterOptions, setFilterOptions] = useState({
    areaOptions: [],
    unidadOptions: [],
    nivelOptions: [],
    tipoProgramaOptions: [],
    modalidadOptions: [],
});
  const [selectDataLoaded, setSelectDataLoaded] = useState(false); // Estado para seguimiento de la carga
  const navigate = useNavigate();
  const [selectVisible, setSelectVisible] = useState(false);  // Control de la visibilidad de los selectores


  useEffect(() => {
    handleSeleccionar();
    const fetchSelectData = async () => {
      setLoading(true); // Inicia la animación de carga
    };
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





  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e, redirectToCursos) => {
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
            status: true,
        };

        // 1. Crear el curso primero
        const cursoResponse = await axios.post(`${endpoint}/cursos`, formDataWithStatus, {
            headers: { Authorization: `Bearer ${token}` },
        });

        toast.success('Nuevo Curso agregado con Éxito');

        // 2. Si todos los campos están llenos, enviamos la petición adicional
        const requestData = {
            user_id: userId,  // ID del usuario actual
            role_id: 4,       // ID del rol
            zona_id: 4,       // ID de la zona
            status: false,
            key: cursoResponse.data.id, // ID del curso recién creado
            comentario: "agregar monto de curso"
        };

        await axios.post(`${endpoint}/peticiones`, requestData, {
            headers: { Authorization: `Bearer ${token}` },
        });

        toast.success('Petición enviada para agregar monto de curso');

        // Redirigir según la opción
        if (redirectToCursos) {
            navigate(`/inscribir-cursos/${cursoResponse.data.id}`);
        } else {
            navigate('/cursos');
        }
    } catch (error) {
        toast.error('Error al crear Curso o enviar la Petición');
        console.error('Error creando curso o enviando petición:', error);
    } finally {
        setLoading(false);
    }
};


const handleSeleccionar = async () => {
  try {
    const token = localStorage.getItem('token');
    
    // Suponiendo que el endpoint unificado sea `/filtros-cursos`
    const response = await axios.get(`${endpoint}/filtros-cursos`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    // Desestructuramos los datos que vienen en la respuesta
    const { area, unidad, nivel, tipo_programa, modalidad } = response.data;

    // Retornamos las opciones en un solo objeto
    setFilterOptions( {
      areaOptions: area,
      unidadOptions: unidad,
      nivelOptions: nivel,
      tipoProgramaOptions: tipo_programa,
      modalidadOptions: modalidad,
    });
    setSelectVisible(true);  // Mostrar los selectores

  } catch (error) {
    console.error('Error fetching filter options:', error);
    
  }
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

  const handleConfirmSendRequest = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Error: Token no encontrado');
        return;
      }

      const formDataWithStatus = { ...formData, status: false };
      const cursoResponse = await axios.post(`${endpoint}/cursos`, formDataWithStatus, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const nuevoCursoId = cursoResponse.data.id;
      const requestData = {
        user_id: userId,
        destinatario_id: selectedUserId || null,
        role_id: selectedRoleId || null,
        zona_id: 2,
        status: false,
        finish_time: null,
        key: nuevoCursoId,
        comentario: comentario
      };

      await axios.post(`${endpoint}/peticiones`, requestData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success('Solicitud y datos del curso enviados exitosamente');
      navigate('/cursos');
    } catch (error) {
      toast.error('Error al enviar la solicitud o los datos del curso');
      console.error('Error al enviar la solicitud o los datos del curso:', error);
    }
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

  return (
    <div className="row" style={{ marginTop: '50px' }}>
  <div className="col-lg-6 mx-auto"> {/* Centrado del contenido */}
    <div className="card-box" style={{ padding: '20px', width: '100%', margin: '0 auto' }}>
      <h2 className="mb-2">Agregar Nuevo Curso</h2>
      <Form onSubmit={handleSubmit} className="custom-gutter">
            <Form.Group controlId="descripcion">
              <Form.Label>Nombre del Curso</Form.Label>
              <Form.Control
                type="text"
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                maxLength={40}
                required
              />
            </Form.Group>

          <Row className="g-2">
          <Col md={6}>
            <Form.Group controlId="cantidad_horas">
              <Form.Label>Cantidad de Horas</Form.Label>
              <Form.Control
                type="number"
                name="cantidad_horas"
                value={formData.cantidad_horas}
                onChange={handleChange}
                maxLength={4}
              />
            </Form.Group>
          </Col>

          <Col md={6}>
          <SelectComponent
              options={filterOptions.nivelOptions}  // Usar el estado filterOptions
              nameField="descripcion"
              valueField="id"
              selectedValue={formData.nivel_id}
              handleChange={handleChange}
              controlId="nivel_id"
              label="Nivel"
            />
          </Col>
          </Row>
          <Row className="g-2">
          <Col md={6}>
          <SelectComponent
              
              options={filterOptions.areaOptions}  // Usar el estado filterOptions
              nameField="descripcion"
              valueField="id"
              selectedValue={formData.area_id}
              handleChange={handleChange}
              controlId="area_id"
              label="Área"
            />
            </Col>

          <Col md={6}>
            <SelectComponent
              options={filterOptions.unidadOptions}  // Usar el estado filterOptions
              nameField="descripcion"
              valueField="id"
              selectedValue={formData.unidad_id}
              handleChange={handleChange}
              controlId="unidad_id"
              label="Unidad"
            />
          </Col>
          </Row>
          <Row className="g-2">
          <Col md={6}>
          <SelectComponent
              options={filterOptions.modalidadOptions}  // Usar el estado filterOptions

              nameField="descripcion"
              valueField="id"
              selectedValue={formData.modalidad_id}
              handleChange={handleChange}
              controlId="modalidad_id"
              label="Modalidad"
            />
          </Col>
          <Col md={6}>
          <SelectComponent
              options={filterOptions.tipoProgramaOptions}  // Usar el estado filterOptions
              nameField="descripcion"
              valueField="id"
              selectedValue={formData.tipo_programa_id}
              handleChange={handleChange}
              controlId="tipo_programa_id"
              label="Tipo de Programa"
            />
          </Col>
        </Row>
        
        <Form.Group controlId="fecha_inicio">
              <Form.Label>Fecha de Inicio</Form.Label>
              <Form.Control
                type="date"
                name="fecha_inicio"
                value={formData.fecha_inicio}
                onChange={handleChange}
              />
            </Form.Group>


        <div className="d-flex justify-content-end mt-3">
          <Button variant="secondary" onClick={() => navigate('/cursos')} className="me-2">
            Volver
          </Button>
          <Button variant="success" type="submit">
            Guardar
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
    </div>
    </div>
  );
};

export default CreateCursos;