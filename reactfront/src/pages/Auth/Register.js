import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './Register.css';

const Register = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); // Nuevo estado para la confirmación de contraseña
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar que las contraseñas coinciden
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    try {
      await axios.get('http://localhost:8000/sanctum/csrf-cookie'); // Obtener el token CSRF
      const response = await axios.post('http://localhost:8000/api/register', { username, email, password });
      localStorage.setItem('token', response.data.access_token);
      navigate('/login'); // Redirige a la página principal después de iniciar sesión
    } catch (error) {
      setError('Error al registrarse. Intente de nuevo.');
    }
  };

  return (
    <div className="register-wrapper">
      <div className="register-container">
        <img src="/IMG/Simedimos_Logo_var3.png" alt="Logo" className="register-logo" />
        <h2 className="register-title">Registro de Usuario</h2>
        <form onSubmit={handleSubmit} className="form-signin">
          <div className="form-group">
            <input 
              type="text" 
              id="inputName" 
              className="form-control" 
              placeholder="Nombre de Usuario" 
              required 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
            />
          </div>
          <div className="form-group">
            <input 
              type="email" 
              id="inputEmail" 
              className="form-control" 
              placeholder="Email" 
              required 
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
          <div className="form-group">
            <input 
              type="password" 
              id="confirmPassword" 
              className="form-control" 
              placeholder="Confirmar Contraseña" 
              required 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
            />
          </div>

          {error && <p className="text-danger">{error}</p>}
          <button className="btn btn-lg btn-primary btn-block" type="submit">Registrarse</button>
        </form>

        <p className="register-text mt-3">
          ¿Tienes una cuenta?{' '}
          <Link to="/" className="register-link">
            Inicia Sesión
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
