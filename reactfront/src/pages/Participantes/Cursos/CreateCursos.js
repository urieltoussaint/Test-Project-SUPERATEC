import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Button, Modal, Table } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import SelectComponent from '../../../components/SelectComponent';
import { useLoading } from '../../../components/LoadingContext';
import { ToastContainer,toast } from 'react-toastify';

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
  const [previousModal, setPreviousModal] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);  
  const [showUserRoleModal, setShowUserRoleModal] = useState(false); 
  const [showUserSearchModal, setShowUserSearchModal] = useState(false);  // Modal de búsqueda de usuarios
  const [users, setUsers] = useState([]);  // Lista de usuarios
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchName, setSearchName] = useState('');
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [formData, setFormData] = useState({
    descripcion: '',
    cantidad_horas: '',
    fecha_inicio: '',
    area_id: '',
    costo: ''
  });
  const [selectDataLoaded, setSelectDataLoaded] = useState(false); // Estado para seguimiento de la carga

  const navigate = useNavigate();

  useEffect(() => {

    const fetchSelectData = async () => {
      setLoading(true); // Inicia la animación de carga
      try {
        // Realiza las solicitudes necesarias para cargar los selectores
        const token = localStorage.getItem('token');
        await axios.get(`${endpoint}/area`, { headers: { Authorization: `Bearer ${token}` } });
        setSelectDataLoaded(true); // Indica que los datos han sido cargados
      } catch (error) {
        console.error('Error fetching select data:', error);
      } finally {
        setLoading(false); // Detiene la animación de carga
      }
    };
    if (showUserSearchModal) {
      getAllUsers();
    } else if (showRoleSearchModal) {
      getAllRoles();
    }
  }, [showUserSearchModal, showRoleSearchModal]
);
 

  
  const getAllUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${endpoint}/users-with-roles`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsers(response.data);
      setFilteredUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const getAllRoles = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${endpoint}/role`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      // Asegúrate de extraer los roles desde 'data'
      // const roles = response.data.data || [];
      setRoles (response.data.data);
      setFilteredRoles(response.data.data);
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
    // Excluir los campos que no son obligatorios (realiza_aporte y es_patrocinado)
    if (key === 'realiza_aporte' || key === 'es_patrocinado') {
      return false;
    }
    return !formData[key];
  });

  // Si hay campos vacíos, no se procede con el envío de los datos, mostrar modal
  if (emptyFields.length > 0) {
    setShowConfirmModal(true);  // Mostrar el modal de confirmación
    setLoading(false);
    return;
  }

  // Si el formulario está completo, se envían los datos del curso directamente con status true
  try {
    const token = localStorage.getItem('token');

    if (!token) {
      toast.error('Error: Token no encontrado');
      setLoading(false);
      return;
    }

    // Enviar los datos del curso con status true
    const formDataWithStatus = {
      ...formData,
      status: true,  // Completo, entonces se guarda con status true
    };

    await axios.post(`${endpoint}/cursos`, formDataWithStatus, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    toast.success('Nuevo Curso agregado con Éxito');

    // Redireccionar a la página de cursos o datos
    if (redirectToCursos) {
      navigate(`/inscribir-cursos/${formData.id}`);
    } else {
      navigate('/cursos');
    }

  } catch (error) {
    toast.error('Error al crear Curso');
    console.error('Error creando curso:', error);
  } finally {
    setLoading(false);
  }
};
  
  
  const handleSelectUser = (user) => {
    setSelectedUserId(user.id); // Guardar ID del usuario seleccionado
    setSelectedUserName(user.name); // Guardar nombre del usuario seleccionado
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
  
      if (!token) {
        toast.error('Error: Token no encontrado');
        return;
      }
  
      // Primero, enviamos los datos del curso con status false (incompleto)
      const formDataWithStatus = {
        ...formData,
        status: false,  // Formulario incompleto, entonces se guarda con status false
      };
  
      const cursoResponse = await axios.post(`${endpoint}/cursos`, formDataWithStatus, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

          // Extraer el ID del curso recién creado
    const nuevoCursoId = cursoResponse.data.id;

    // Crear la petición usando el ID del curso como key
    const requestData = {
      user_id: userId,  // Usuario logueado que envía la solicitud
      destinatario_id: selectedUserId || null,  // Usuario destinatario seleccionado (si existe)
      role_id: selectedRoleId || null,  // El role_id es nulo si se seleccionó un usuario
      zona_id: 2,  // Valor fijo para cursos
      status: false,  // Estado de la petición
      finish_time: null,  // No hay finish_time al momento de creación
      key: nuevoCursoId,  // Usar el ID del curso como key
    };

    // Luego enviamos la petición con el ID del curso recién creado
    await axios.post(`${endpoint}/peticiones`, requestData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Mensaje de éxito y redirección
    toast.success('Solicitud y datos del curso enviados exitosamente');
    navigate('/cursos');

  } catch (error) {
    // Mensaje de error y log en consola
    toast.error('Error al enviar la solicitud o los datos del curso');
    console.error('Error al enviar la solicitud o los datos del curso:', error);
  }
};

  
  const handleUserSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchName(value);
    const filtered = users.filter(user => user.name.toLowerCase().includes(value));
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

  return (
    <div className="container">
      <meta name="csrf-token" content="{{ csrf_token() }}" />
      <h1>Agregar Nuevo Curso</h1>
      <Form onSubmit={handleSubmit}>
        <script src="{{ mix('js/app.js') }}"></script>
        <div className="row">
          <div className="col-md-6">
            <Form.Group controlId="descripcion">
              <Form.Label>Nombre del Curso</Form.Label>
              <Form.Control
                type="text"
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                maxLength={40}
                requi
              />
            </Form.Group>
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
            <Form.Group controlId="fecha_inicio">
              <Form.Label>Fecha de Inicio</Form.Label>
              <Form.Control
                type="date"
                name="fecha_inicio"
                value={formData.fecha_inicio}
                onChange={handleChange}
              />
            </Form.Group>

            {selectDataLoaded && (
              <SelectComponent
                endpoint={`${endpoint}/area`}
                nameField="descripcion"
                valueField="id"
                selectedValue={formData.area_id}
                handleChange={handleChange}
                controlId="area_id"
                label="Área"
              />
            )}

            <Form.Group controlId="costo">
              <Form.Label>Costo del curso ($)</Form.Label>
              <Form.Control
                type="number"
                name="costo"
                value={formData.costo}
                onChange={handleChange}
                maxLength={20}
              />
            </Form.Group>
          </div>
        </div>

        <Button variant="success" type="submit">
          Guardar
        </Button>
        <Button 
          variant="secondary" 
          onClick={() => navigate('/cursos')}
          className="ms-2"
        >
          Volver
        </Button>
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
            setPreviousModal('confirm');  // Guardamos el modal actual como "anterior"
            setShowConfirmModal(false);
            setShowUserRoleModal(true);  // Mostrar el modal para seleccionar usuario o rol
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
            setPreviousModal('userRole');  // Guardamos el modal actual como "anterior"
            setShowUserRoleModal(false);
            setShowUserSearchModal(true);  // Abrir modal de búsqueda de usuarios
          }}>
            Buscar Usuario
          </Button>
          <Button variant="info" onClick={() => {
            setPreviousModal('userRole');  // Guardamos el modal actual como "anterior"
            setShowUserRoleModal(false);
            setShowRoleSearchModal(true);  // Abrir modal de búsqueda de roles
          }}>
            Buscar Rol
          </Button>
          {/* Botón Volver */}
          <Button variant="secondary" onClick={() => {
            if (previousModal === 'confirm') {
              setShowUserRoleModal(false);
              setShowConfirmModal(true);  // Volver al modal de confirmación
            }
          }}>
            Volver
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
                    <td>{user.name}</td>
                    <td>
                      <Button
                        variant="primary"
                        onClick={() => {
                          handleSelectUser(user);  // Seleccionar el usuario
                        }}
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
          {/* Botón Volver */}
          <Button variant="light" onClick={() => {
            setShowUserSearchModal(false);
            setShowUserRoleModal(true);  // Volver al modal anterior (Usuario o Rol)
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
            value={searchRoleName} // Usamos searchRoleName
            onChange={handleRoleSearch} // Aseguramos que la búsqueda de roles se aplique correctamente
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
          {/* Botón Volver */}
          <Button variant="light" onClick={() => {
            setShowRoleSearchModal(false);
            setShowUserRoleModal(true);  // Volver al modal anterior
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
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>Cancelar</Button>
          <Button variant="success" onClick={handleConfirmSendRequest} disabled={!selectedUserId}>Confirmar</Button>
          {/* Botón Volver */}
          <Button variant="light" onClick={() => {
            setShowConfirmModal(false);
            setShowUserSearchModal(true);  // Volver al modal de búsqueda de usuarios
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
            ? `¿Seguro que deseas enviar la solicitud al rol ${selectedRoleName}?`
            : 'No se ha seleccionado ningún rol.'}

        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>Cancelar</Button>
          <Button variant="success" onClick={handleConfirmSendRequest} disabled={!selectedRoleId}>Confirmar</Button>
          {/* Botón Volver */}
          <Button variant="light" onClick={() => {
            setShowConfirmModal(false);
            setShowRoleSearchModal(true);  // Volver al modal de búsqueda de roles
          }}>
            Volver
          </Button>
        </Modal.Footer>
      </Modal>

    </div>
  );
};

export default CreateCursos;
