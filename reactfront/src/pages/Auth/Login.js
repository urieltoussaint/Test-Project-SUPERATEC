import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css'; // Asegúrate de que esta hoja de estilo contiene las clases necesarias
import { FaEye, FaEyeSlash } from 'react-icons/fa'; // Importa los íconos de Font Awesome

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // Controla la visibilidad de la contraseña
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        await axios.get('http://localhost:8000/sanctum/csrf-cookie');  // Obtener el token CSRF
      const response = await axios.post('http://localhost:8000/api/login', { email, password });
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('role', response.data.role);
      localStorage.setItem('user_id', response.id);  // Almacenar el ID del usuario autenticado
      localStorage.setItem('role_id', response.role_id);  // Almacenar el rol del usuario autenticado

      navigate('/datos'); // Redirige a la página principal después de iniciar sesión
    } catch (error) {
      setError('Invalid login credentials');
    }
  };

  // Función para alternar la visibilidad de la contraseña
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-wrapper">
      <div className="login-container">
        <img src="/IMG/cropped-PNG-7.png" alt="Logo" className="login-logo" />
        <h2 className="login-title">Iniciar sesión</h2>
        <form onSubmit={handleSubmit} className="form-signin">
          <div className="form-group">
            <input 
              type="email" 
              id="inputEmail" 
              className="form-control" 
              placeholder="Email" 
              required 
              autoFocus 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
            />
          </div>
          <div className="form-group password-wrapper">
            <input 
              type={showPassword ? 'text' : 'password'} // Cambia entre password y text
              id="inputPassword" 
              className="form-control" 
              placeholder="Contraseña" 
              required 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
            />
            <span className="password-toggle-icon" onClick={togglePasswordVisibility}>
              {showPassword ? <FaEyeSlash /> : <FaEye />} {/* Cambia el ícono */}
            </span>
          </div>
          
          {error && <p className="text-danger">{error}</p>}
          <button className="btn btn-lg btn-primary btn-block" type="submit">Iniciar Sesión</button>
        </form>

        <p className="register-text mt-3">
          ¿No tienes una cuenta?{' '}
          <Link to="/register" className="register-link">
            Crear nueva Cuenta
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
