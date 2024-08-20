import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom'; // Importa Link desde react-router-dom

import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        await axios.get('http://localhost:8000/sanctum/csrf-cookie');  // Obtener el token CSRF
      const response = await axios.post('http://localhost:8000/api/login', { email, password });
      localStorage.setItem('token', response.data.access_token);
      navigate('/datos'); // Redirige a la página principal después de iniciar sesión
    } catch (error) {
      setError('Invalid login credentials');
    }
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
          <div className="form-group">
            <input 
              type="password" 
              id="inputPassword" 
              className="form-control" 
              placeholder="Contraseña" 
              required 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
            />
          </div>
          
          {error && <p className="text-danger">{error}</p>}
          <button className="btn btn-lg btn-primary btn-block" type="submit">Login</button>
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
