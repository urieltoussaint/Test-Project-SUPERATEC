import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Button, Modal, Table } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import SelectComponent from '../../components/SelectComponent';

import { useLoading } from '../../components/LoadingContext';
import { ToastContainer, toast } from 'react-toastify';
import './CreateUsers.css';
import { FaEye, FaEyeSlash } from 'react-icons/fa'; // Importa los íconos de Font Awesome
import { Card, Row, Col } from 'react-bootstrap'; // Asegúrate de importar estos componentes de Bootstrap



const userId = parseInt(localStorage.getItem('user'));  // ID del usuario logueado
const endpoint = 'http://localhost:8000/api';

const CreateUsers = () => {
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
  const [usernameError, setUsernameError] = useState('');  // Estado para mensajes de error del username
  const [isUsernameValid, setIsUsernameValid] = useState(false);  // Estado para indicar si el username es válido
  const [showPassword, setShowPassword] = useState(false); // Estado para mostrar/ocultar contraseña
  const [passwordError, setPasswordError] = useState(''); // Añadir control para error de contraseña




  const [formData, setFormData] = useState({
    username: '',
    email: '',
    nombre: '',
    apellido: '',
    cargo_id: '',
    role_id: '',
    password: '',
    password_confirmation: '', // Añadir confirmación de contraseña
  });

  const [filterOptions, setFilterOptions] = useState({
    roleOptions: [],
    cargoOptions: [],
    
});
  const [selectVisible, setSelectVisible] = useState(false);  // Control de la visibilidad de los selectores
  const [selectDataLoaded, setSelectDataLoaded] = useState(false); // Estado para seguimiento de la carga
  const navigate = useNavigate();

  useEffect(() => {
    handleSeleccionar();
    const fetchSelectData = async () => {
      setLoading(true); // Inicia la animación de carga
      
      try {
        const token = localStorage.getItem('token');
        await axios.get(`${endpoint}/area`, { headers: { Authorization: `Bearer ${token}` } });
        setSelectDataLoaded(true); // Indica que los datos han sido cargados
      } catch (error) {
        console.error('Error fetching select data:', error);
      } finally {
        setLoading(false); // Detiene la animación de carga
      }
    };
      getAllUsers();
  }, []);

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



const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleUsernameBlur = async () => {
    if (formData.username) {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${endpoint}/validate-username/${formData.username}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            // Si el username ya existe
            setUsernameError('El username ya está en uso.');
            setIsUsernameValid(false);
        } catch (error) {
            if (error.response && error.response.status === 404) {
                // Si no existe, está disponible
                setUsernameError('');
                setIsUsernameValid(true);
            } else {
                console.error('Error al verificar el username:', error);
                setUsernameError('Error verificando el username.');
                setIsUsernameValid(false);
            }
        }
    }
};


const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Validar si las contraseñas coinciden
  if (formData.password !== formData.password_confirmation) {
    setPasswordError('Las contraseñas no coinciden.');
    return;
  }

  setLoading(true);
  try {
    const token = localStorage.getItem('token');
    const formDataWithStatus = {
      ...formData,
      status: true,
    };

    await axios.post(`${endpoint}/register`, formDataWithStatus, {
      headers: { Authorization: `Bearer ${token}` },
    });

    toast.success('Nuevo Usuario agregado con Éxito');
    navigate('/users');
  } catch (error) {
    toast.error('Error al crear Usuario');
    console.error('Error creando Usuario:', error);
  } finally {
    setLoading(false);
  }
};


const handleSeleccionar = async () => {
  try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${endpoint}/roles-and-cargos`, {
          headers: {
              Authorization: `Bearer ${token}`,
          },
      });
      const { role, cargo_users } = response.data;
      setFilterOptions( {
        roleOptions: role,
        cargoOptions: cargo_users,
      });
      setSelectVisible(true);  // Mostrar los selectores
      
    } catch (error) {
      console.error('Error fetching filter options:', error);
      
    }
};







return (
  <div className="row" style={{ marginTop: '50px' }}>
    {/* Columna para la tabla */}
    <div className="col-lg-6 mx-auto"> {/* Agregamos 'mx-auto' para centrar */}
      <div className="card-box" style={{ padding: '20px', width: '100%', margin: '0 auto' }}>
        <h2 className="mb-2">Agregar Nuevo Usuario</h2>
        <Form onSubmit={handleSubmit} className="custom-gutter">
          <Form.Group controlId="username">
            <Form.Label>Nombre de Usuario</Form.Label>
            <Form.Control
              type="text"
              name="username"
              value={formData.username}
              onChange={(e) =>
                setFormData((prevState) => ({
                  ...prevState,
                  username: e.target.value.toLowerCase(), // Convierte a minúsculas
                }))
              }
              onBlur={handleUsernameBlur}
              maxLength={40}
              required
              className={
                usernameError
                  ? 'is-invalid' // Clase para indicar error
                  : isUsernameValid
                  ? 'is-valid' // Clase para indicar éxito
                  : ''
              }
            />
            {usernameError && (
              <Form.Control.Feedback type="invalid">
                {usernameError}
              </Form.Control.Feedback>
            )}
            {!usernameError && isUsernameValid && (
              <Form.Control.Feedback type="valid">
                Nombre de Usuario disponible.
              </Form.Control.Feedback>
            )}
          </Form.Group>

          <Row className="g-2">
            <Col md={6}>
              <Form.Group controlId="nombre">
                <Form.Label>Nombre</Form.Label>
                <Form.Control
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  maxLength={40}
                  required
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group controlId="apellido">
                <Form.Label>Apellido</Form.Label>
                <Form.Control
                  type="text"
                  name="apellido"
                  value={formData.apellido}
                  onChange={handleChange}
                  maxLength={40}
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group controlId="email">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Row className="g-1">
            <Col md={6}>
              <SelectComponent
                options={filterOptions.roleOptions}  // Usar el estado filterOptions
                nameField="name"
                valueField="id"
                selectedValue={formData.role_id}
                handleChange={handleChange}
                controlId="role_id"
                label="Role"
                required
              />
            </Col>

            <Col md={6}>
              <SelectComponent
                options={filterOptions.cargoOptions}  // Usar el estado filterOptions
                nameField="descripcion"
                valueField="id"
                selectedValue={formData.cargo_id}
                handleChange={handleChange}
                controlId="cargo_id"
                label="Cargo"
                required
              />
            </Col>
          </Row>

          <Form.Group controlId="password">
            <Form.Label>Contraseña</Form.Label>
            <div className="password-wrapper">
              <Form.Control
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Contraseña"
              />
              <span className="password-toggle-icon" onClick={togglePasswordVisibility}>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
            {passwordError && <p className="text-danger">{passwordError}</p>}
          </Form.Group>

          <Form.Group controlId="password_confirmation">
            <Form.Label>Confirmar Contraseña</Form.Label>
            <div className="password-wrapper">
              <Form.Control
                type={showPassword ? 'text' : 'password'}
                name="password_confirmation"
                value={formData.password_confirmation}
                onChange={handleChange}
                placeholder="Confirma contraseña"
              />
              <span className="password-toggle-icon" onClick={togglePasswordVisibility}>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </Form.Group>

          <div className="d-flex justify-content-end mt-3">
            <Button variant="secondary" onClick={() => navigate('/users')} className="me-2">
              Volver
            </Button>
            <Button variant="success" type="submit">
              Guardar
            </Button>
          </div>
        </Form>
      </div>
    </div>
  </div>
);


};

export default CreateUsers;
