import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Button } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import SelectComponent from '../../components/SelectComponent';
import { useLoading } from '../../components/LoadingContext'; 
import { ToastContainer, toast } from 'react-toastify';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { Card, Row, Col } from 'react-bootstrap'; 

const endpoint = 'http://localhost:8000/api';

const EditUsers = () => {
  const [formData, setFormData] = useState({
    username: '',
    nombre: '',
    apellido: '',
    email: '',
    role_id: '',
    cargo_id: '',
    password: '',  // Añadir campo para la contraseña
    password_confirmation: '' // Añadir campo para la confirmación de la contraseña
  });
  const [filterOptions, setFilterOptions] = useState({
    roleOptions: [],
    cargoOptions: [],
    
});
  const [selectVisible, setSelectVisible] = useState(false);  // Control de la visibilidad de los selectores
  const [originalUsername, setOriginalUsername] = useState('');
  const navigate = useNavigate();
  const { id } = useParams();
  const { setLoading } = useLoading();
  const [usernameError, setUsernameError] = useState('');
  const [isUsernameValid, setIsUsernameValid] = useState(true);
  const [showPassword, setShowPassword] = useState(false); // Control de visibilidad de la contraseña
  const [passwordError, setPasswordError] = useState(''); // Control de errores de contraseña

  useEffect(() => {
    handleSeleccionar();
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await axios.get(`${endpoint}/users/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const userData = response.data.user;
        setFormData({
          username: userData.username || '',
          email: userData.email || '',
          role_id: userData.role_id || '',
          cargo_id: userData.cargo_id || '',
          nombre: userData.nombre || '',
          apellido: userData.apellido || '',
          password: '',  // El campo de la contraseña queda vacío
          password_confirmation: '' 
        });
        setOriginalUsername(userData.username);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, setLoading]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value || '',
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Validar longitud de la contraseña (mínimo 8 caracteres)
    if (formData.password && formData.password.length < 8) {
      setPasswordError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
  
    // Validar si las contraseñas coinciden
    if (formData.password && formData.password !== formData.password_confirmation) {
      setPasswordError('Las contraseñas no coinciden.');
      return;
    }
  
    try {
      const token = localStorage.getItem('token');
      
      const updatedData = {
        username: formData.username,
        email: formData.email,
        role_id: formData.role_id,
        cargo_id: formData.cargo_id,
        nombre: formData.nombre,
        apellido: formData.apellido,
      };
  
      // Solo incluir la contraseña y la confirmación si el campo no está vacío
      if (formData.password) {
        updatedData.password = formData.password;
        updatedData.password_confirmation = formData.password_confirmation; // Agregar este campo
      }
  
      await axios.put(`${endpoint}/users/${id}`, updatedData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      toast.success('Actualización exitosa');
      navigate('/users');
    } catch (error) {
      console.error('Error al actualizar los datos:', error);
      toast.error('Error al actualizar el usuario');
    }
  };
  
  const handleUsernameBlur = async () => {
    if (formData.username && formData.username !== originalUsername) {
      try {
        const token = localStorage.getItem('token');
        await axios.get(`${endpoint}/validate-username/${formData.username}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUsernameError('El username ya está en uso.');
        setIsUsernameValid(false);
      } catch (error) {
        if (error.response && error.response.status === 404) {
          setUsernameError('');
          setIsUsernameValid(true);
        } else {
          console.error('Error al verificar el username:', error);
          setUsernameError('Error verificando el username.');
          setIsUsernameValid(false);
        }
      }
    } else {
      setUsernameError('');
      setIsUsernameValid(true);
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
          <h2 className="mb-2">Actualizar Usuario</h2>
          <Form onSubmit={handleSubmit} className="custom-gutter">
            <Form.Group controlId="username">
              <Form.Label>Nombre de Usuario</Form.Label>
              <Form.Control
                type="text"
                name="username"
                value={formData.username || ''}
                onChange={(e) =>
                  setFormData((prevState) => ({
                    ...prevState,
                    username: e.target.value.toLowerCase(),
                  }))
                }
                onBlur={handleUsernameBlur}
                maxLength={40}
                required
                className={usernameError ? 'is-invalid' : isUsernameValid ? 'is-valid' : ''}
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
                    value={formData.nombre || ''}
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
                    value={formData.apellido || ''}
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
                value={formData.email || ''}
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
                  selectedValue={formData.role_id || ''}
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
                  selectedValue={formData.cargo_id || ''}
                  handleChange={handleChange}
                  controlId="cargo_id"
                  label="Cargo"
                  required
                />
              </Col>
            </Row>
  
            <Row className="g-2">
              <Col md={6}>
                <Form.Group controlId="password">
                  <Form.Label>Contraseña</Form.Label>
                  <div className="password-wrapper">
                    <Form.Control
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Dejar en blanco si no se desea cambiar"
                    />
                    <span className="password-toggle-icon" onClick={togglePasswordVisibility}>
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </span>
                  </div>
                  {passwordError && <p className="text-danger">{passwordError}</p>}
                </Form.Group>
              </Col>
  
            </Row>


            <Row className="g-2">
              
              {formData.password && (
                <Col md={6}>
                  <Form.Group controlId="password_confirmation">
                    <Form.Label>Confirmar Contraseña</Form.Label>
                    <div className="password-wrapper">
                      <Form.Control
                        type={showPassword ? 'text' : 'password'}
                        name="password_confirmation"
                        value={formData.password_confirmation}
                        onChange={handleChange}
                        placeholder="Confirma la nueva contraseña"
                      />
                    </div>
                  </Form.Group>
                </Col>
              )}
            </Row>
  
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

export default EditUsers;
