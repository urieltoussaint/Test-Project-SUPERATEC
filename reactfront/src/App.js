import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { LoadingProvider, useLoading } from './components/LoadingContext'; 
import Loader from './components/Loader'; 
import axios from 'axios';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css';

// Importa los componentes de las páginas
import Login from './pages/Auth/Login';
import ShowDatos from './pages/Participantes/ShowDatos';
//... otros imports

function App() {
  return (
    <LoadingProvider>
      <LoadingOverlay>
        <Router>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/datos" element={<AuthenticatedLayout><ShowDatos /></AuthenticatedLayout>} />
            {/* ... otras rutas */}
          </Routes>
        </Router>
      </LoadingOverlay>
    </LoadingProvider>
  );
}

const AuthenticatedLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error("No token found");
        }
  
        const response = await axios.get('http://localhost:8000/api/user', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        console.log('User data:', response.data); // Verifica lo que devuelve la API
        setUser(response.data);
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };
  
    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:8000/api/user', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

      await axios.post('http://localhost:8000/api/logout', {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      localStorage.removeItem('token');
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleDropdown = (index) => {
    setOpenDropdown(openDropdown === index ? null : index);
  };

  return (
    <div>
      <div className="header">
        <button className="menu-button" onClick={toggleSidebar}>☰</button>
        <div className="logo">
          <img src="/IMG/cropped-PNG-7.png" alt="Logo" style={{ height: '45px' }} />
        </div>
        <div className="user-info">
          {user ? (
            <>
              <span className="username">{user.name}</span>
              <button onClick={handleLogout} className="logout-button">Logout</button>
            </>
          ) : (
            <span>Cargando usuario...</span>
          )}
        </div>
        
      </div>
      <div className={`sidebar ${isSidebarOpen ? "open" : ""}`}>
        <ul>
          <li className={openDropdown === 1 ? 'expanded' : ''}>
            <div className="dropdown-button" onClick={() => toggleDropdown(1)}>
              <i className="bi bi-bookmark-fill"></i> Módulo 1
              <i className={`bi ${openDropdown === 1 ? "bi-caret-up-fill" : "bi-caret-down-fill"}`}></i>
            </div>
            <ul className={`dropdown-menu ${openDropdown === 1 ? "show" : ""}`}>
              <li><Link to="/datos"><i className="bi bi-person-circle"></i> Participantes</Link></li>
              <li><Link to="/cursos"><i className="bi bi-book-half"></i> Cursos</Link></li>
              <li><Link to="/pagos"><i className="bi bi-credit-card-fill"></i> Reporte de Pagos</Link></li>
              <li><Link to="/promocion"><i className="bi bi-star-fill"></i> Promoción</Link></li>
            </ul>
          </li>
          <li className={openDropdown === 2 ? 'expanded' : ''}>
            <div className="dropdown-button" onClick={() => toggleDropdown(2)}>
              <i className="bi bi-bookmark-fill"></i> Módulo 2
              <i className={`bi ${openDropdown === 2 ? "bi-caret-up-fill" : "bi-caret-down-fill"}`}></i>
            </div>
            <ul className={`dropdown-menu ${openDropdown === 2 ? "show" : ""}`}>
              <li><Link to="/voluntariados"><i className="bi bi-person-raised-hand"></i> Voluntariados</Link></li>
            </ul>
          </li>
        </ul>
      </div>
      <div className={`content ${isSidebarOpen ? "open" : "closed"}`}>
        {children}
      </div>
    </div>
  );
};

const LoadingOverlay = ({ children }) => {
  const { loading } = useLoading();

  return (
    <>
      {loading && <Loader />}
      {children}
    </>
  );
};

export default App;
