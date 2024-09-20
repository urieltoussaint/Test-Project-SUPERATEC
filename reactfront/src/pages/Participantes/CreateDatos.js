import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Button, Alert, Modal, Table } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import SelectComponent from '../../components/SelectComponent';
import './CreateDatos.css';
import { useLoading } from '../../components/LoadingContext';
import { ToastContainer, toast } from 'react-toastify';

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




  
  const [formData, setFormData] = useState({
    cedula_identidad: '',
    nombres: '',
    apellidos: '',
    fecha_nacimiento: '',
    edad: '',
    direccion: '',
    direccion_email: '',
    telefono_casa: '',
    telefono_celular: '',
    status_seleccion_id: null,
    nacionalidad_id: null,
    genero_id: null,
    grupo_prioritario_id: null,
    estado_id: null,
    procedencia_id: null,
    nivel_instruccion_id: null,
    como_entero_superatec_id: null,
    cohorte_id: null,
    centro_id: null,
    periodo_id: null,
    area_id: null,
    unidad_id: null,
    modalidad_id: null,
    nivel_id: null,
    tipo_programa_id: null,
    realiza_aporte: false,
    es_patrocinado: false,
    grupo: '',
    observaciones: '',
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
      const requestData = {
        user_id: userId,  // Usuario logueado que envía la solicitud
        destinatario_id: selectedUserId || null,  // Usuario destinatario seleccionado (si existe)
        role_id: selectedRoleId || null,  // El role_id es nulo si se seleccionó un usuario, si no, el rol seleccionado
        zona_id: 1,  // Valor fijo
        status: false,  // Estado de la petición
        finish_time: null,  // No hay finish_time al momento de creación
        key: formData.cedula_identidad,  // Enviar la cédula de identidad como key
      };
  
      await axios.post(`${endpoint}/peticiones`, requestData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      await axios.post(`${endpoint}/datos`, formData, {
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

    const emptyFields = Object.keys(formData).filter(key => {
      if (key === 'realiza_aporte' || key === 'es_patrocinado') {
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

      await axios.post(`${endpoint}/datos`, formData, {
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
        const response = await axios.get(`${endpoint}/datos/${formData.cedula_identidad}`, {
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
    
    <div className="container">
      <meta name="csrf-token" content="{{ csrf_token() }}" />
      <h1>Agregar Nuevo Participante</h1>
      <Form onSubmit={(e) => handleSubmit(e, false)}>
        <div className="row">
          <div className="col-md-6">
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
            

            <SelectComponent
              endpoint={`${endpoint}/status_seleccion`}
              nameField="descripcion"
              valueField="id"
              selectedValue={formData.status_seleccion_id}
              handleChange={handleChange}
              controlId="status_seleccion_id"
              label="Status Selección"
              allowEmpty={true}  // Permitir que el campo esté vacío
            />

            <SelectComponent
              endpoint={`${endpoint}/nacionalidad_seleccion`}
              nameField="descripcion"
              valueField="id"
              selectedValue={formData.nacionalidad_id}
              handleChange={handleChange}
              controlId="nacionalidad_id"
              label="Nacionalidad"
            />

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

            <Form.Group controlId="fecha_nacimiento">
              <Form.Label>Fecha de Nacimiento</Form.Label>
              <Form.Control
                type="date"
                name="fecha_nacimiento"
                value={formData.fecha_nacimiento}
                onChange={handleChange}
                
              />
            </Form.Group>

            <Form.Group controlId="edad">
              <Form.Label>Edad</Form.Label>
              <Form.Control
                type="number"
                name="edad"
                value={formData.edad}
                onChange={handleChange}
                
                maxLength={2}
              />
            </Form.Group>

            <SelectComponent
              endpoint={`${endpoint}/genero`}
              nameField="descripcion"
              valueField="id"
              selectedValue={formData.genero_id}
              handleChange={handleChange}
              controlId="genero_id"
              label="Género"
            />

            <SelectComponent
              endpoint={`${endpoint}/grupo_prioritario`}
              nameField="descripcion"
              valueField="id"
              selectedValue={formData.grupo_prioritario_id}
              handleChange={handleChange}
              controlId="grupo_prioritario_id"
              label="Grupo Prioritario"
            />

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

            <SelectComponent
              endpoint={`${endpoint}/estado`}
              nameField="descripcion"
              valueField="id"
              selectedValue={formData.estado_id}
              handleChange={handleChange}
              controlId="estado_id"
              label="Estado"
            />

            <Form.Group controlId="direccion_email">
              <Form.Label>Dirección Email</Form.Label>
              <Form.Control
                type="email"
                name="direccion_email"
                value={formData.direccion_email}
                onChange={handleChange}
                
              />
            </Form.Group>

            <SelectComponent
              endpoint={`${endpoint}/procedencia`}
              nameField="descripcion"
              valueField="id"
              selectedValue={formData.procedencia_id}
              handleChange={handleChange}
              controlId="procedencia_id"
              label="Procedencia"
            />

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

            <SelectComponent
              endpoint={`${endpoint}/nivel_instruccion`}
              nameField="descripcion"
              valueField="id"
              selectedValue={formData.nivel_instruccion_id}
              handleChange={handleChange}
              controlId="nivel_instruccion_id"
              label="Nivel de Instrucción"
            />
          </div>
          <div className="col-md-6">
            <h2>Información de Inscripción</h2>
            <SelectComponent
              endpoint={`${endpoint}/como_entero_superatec`}
              nameField="descripcion"
              valueField="id"
              selectedValue={formData.como_entero_superatec_id}
              handleChange={handleChange}
              controlId="como_entero_superatec_id"
              label="¿Cómo se enteró de SUPERATEC?"
            />

            <SelectComponent
              endpoint={`${endpoint}/cohorte`}
              nameField="descripcion"
              valueField="id"
              selectedValue={formData.cohorte_id}
              handleChange={handleChange}
              controlId="cohorte_id"
              label="Cohorte"
            />

            <SelectComponent
              endpoint={`${endpoint}/centro`}
              nameField="descripcion"
              valueField="id"
              selectedValue={formData.centro_id}
              handleChange={handleChange}
              controlId="centro_id"
              label="Centro"
            />

            <SelectComponent
              endpoint={`${endpoint}/periodo`}
              nameField="descripcion"
              valueField="id"
              selectedValue={formData.periodo_id}
              handleChange={handleChange}
              controlId="periodo_id"
              label="Periodo"
            />

            <SelectComponent
              endpoint={`${endpoint}/area`}
              nameField="descripcion"
              valueField="id"
              selectedValue={formData.area_id}
              handleChange={handleChange}
              controlId="area_id"
              label="Área"
            />

            <SelectComponent
              endpoint={`${endpoint}/unidad`}
              nameField="descripcion"
              valueField="id"
              selectedValue={formData.unidad_id}
              handleChange={handleChange}
              controlId="unidad_id"
              label="Unidad"
            />

            <SelectComponent
              endpoint={`${endpoint}/modalidad`}
              nameField="descripcion"
              valueField="id"
              selectedValue={formData.modalidad_id}
              handleChange={handleChange}
              controlId="modalidad_id"
              label="Modalidad"
            />

            <SelectComponent
              endpoint={`${endpoint}/nivel`}
              nameField="descripcion"
              valueField="id"
              selectedValue={formData.nivel_id}
              handleChange={handleChange}
              controlId="nivel_id"
              label="Nivel"
            />

            <SelectComponent
              endpoint={`${endpoint}/tipo_programa`}
              nameField="descripcion"
              valueField="id"
              selectedValue={formData.tipo_programa_id}
              handleChange={handleChange}
              controlId="tipo_programa_id"
              label="Tipo de Programa"
            />

            <Form.Group controlId="realiza_aporte">
              <Form.Check
                type="checkbox"
                name="realiza_aporte"
                label="Realiza Aporte"
                checked={formData.realiza_aporte}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group controlId="es_patrocinado">
              <Form.Check
                type="checkbox"
                name="es_patrocinado"
                label="Es Patrocinado"
                checked={formData.es_patrocinado}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group controlId="grupo">
              <Form.Label>Grupo</Form.Label>
              <Form.Control
                type="text"
                name="grupo"
                value={formData.grupo}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group controlId="observaciones">
              <Form.Label>Observaciones</Form.Label>
              <Form.Control
                as="textarea"
                name="observaciones"
                value={formData.observaciones}
                onChange={handleChange}
              />
            </Form.Group>
          </div>
        </div>

        <div className="button-container">
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

export default CreateDatos;
