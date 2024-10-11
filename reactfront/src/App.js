import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, NavLink } from 'react-router-dom';
import { LoadingProvider, useLoading } from './components/LoadingContext'; 
import Loader from './components/Loader'; 
import axios from 'axios';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css';

// Importa los componentes de las páginas
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ShowDatos from './pages/Participantes/ShowDatos';
import CreateDatos from './pages/Participantes/CreateDatos';
import EditDatos from './pages/Participantes/EditDatos';
import ShowMoreDatos from './pages/Participantes/ShowMoreDatos';
import InscripcionCursos from './pages/Participantes/Cursos/InscripcionCursos';
import InscribirCedula from './pages/Participantes/Cursos/InscribirCedula';
import ShowInscritos from './pages/Participantes/Cursos/ShowInscritos';
import ShowCursos from './pages/Participantes/Cursos/ShowCursos';
import CreateCursos from './pages/Participantes/Cursos/CreateCursos';
import EditCursos from './pages/Participantes/Cursos/EditCursos';
import ShowPagos from './pages/Participantes/ReportePagos/ShowPagos';
import CreatePagos from './pages/Participantes/ReportePagos/CreatePagos';
import CreatePagosCedula from './pages/Participantes/ReportePagos/CreatePagosCedula';
import ShowMorePagos from './pages/Participantes/ReportePagos/ShowMorePagos';
import ShowVoluntariados from './pages/Participantes/Voluntariados/ShowVoluntariados';
import ShowMoreVoluntariados from './pages/Participantes/Voluntariados/ShowMoreVoluntariados';
import CreateVoluntariados from './pages/Participantes/Voluntariados/CreateVoluntariados';
import EditVoluntariados from './pages/Participantes/Voluntariados/EditVoluntariados';
import ShowPromocion from './pages/Promocion/ShowPromocion';
import ShowMorePromocion from './pages/Promocion/ShowMorePromocion';
import CreatePromocion from './pages/Promocion/CreatePromocion';
import EditPromocion from './pages/Promocion/EditPromocion';
import ProtectedRoute from './components/ProtectedRoute';
import ShowUsers from './pages/Users/ShowUsers';
import EditUsers from './pages/Users/EditUsers';
import ShowPeticiones from './pages/Bandeja/ShowPeticiones';
import ShowPeticionesNoAtentidas from './pages/Bandeja/ShowPeticionesNoAtentidas';
import ShowPagosCursos from './pages/Participantes/ReportePagos/ShowPagosCursos';
import Dashboard from './Dashboard';
import { useLocation } from 'react-router-dom'; // Importa useLocation


function App() {
  return (
    <LoadingProvider>
      
        <Router>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
            {/* Envuelve todas las rutas protegidas con AuthenticatedLayout y ProtectedRoute */}
            <Route path="/peticiones" element={<AuthenticatedLayout><ShowPeticiones /></AuthenticatedLayout>} />
            <Route path="/dashboard" element={<AuthenticatedLayout><Dashboard /></AuthenticatedLayout>} />
            <Route path="/peticiones/Noat" element={<AuthenticatedLayout><ShowPeticionesNoAtentidas /></AuthenticatedLayout>} />
            <Route path="users" element={<ProtectedRoute allowedRoles={['admin']}><AuthenticatedLayout><ShowUsers /></AuthenticatedLayout></ProtectedRoute>} />
            <Route path="users/:id" element={<ProtectedRoute allowedRoles={['admin']}><AuthenticatedLayout><EditUsers /></AuthenticatedLayout></ProtectedRoute>} />
            <Route path="/datos" element={<AuthenticatedLayout><ShowDatos /></AuthenticatedLayout>} />
            <Route path="/formulario/create" element={<ProtectedRoute allowedRoles={['admin', 'superuser']}><AuthenticatedLayout><CreateDatos /></AuthenticatedLayout></ProtectedRoute>} />
            <Route path="/datos/:id/edit" element={<ProtectedRoute allowedRoles={['admin', 'superuser']}><AuthenticatedLayout><EditDatos /></AuthenticatedLayout></ProtectedRoute>} />
            <Route path="/datos/:id" element={<AuthenticatedLayout><ShowMoreDatos /></AuthenticatedLayout>} />
            <Route path="/inscribir/:cursoId" element={<ProtectedRoute allowedRoles={['admin', 'superuser']}><AuthenticatedLayout><InscripcionCursos /></AuthenticatedLayout></ProtectedRoute>}  />
            <Route path="/inscribir-cursos/:cedula" element={<ProtectedRoute allowedRoles={['admin', 'superuser']}><AuthenticatedLayout><InscribirCedula /></AuthenticatedLayout></ProtectedRoute>}  />
            <Route path="/inscritos/:cursoId" element={<AuthenticatedLayout><ShowInscritos /></AuthenticatedLayout>} />
            <Route path="/cursos" element={<AuthenticatedLayout><ShowCursos /></AuthenticatedLayout>} />
            <Route path="/cursos/create" element={<ProtectedRoute allowedRoles={['admin', 'superuser']}><AuthenticatedLayout><CreateCursos /></AuthenticatedLayout></ProtectedRoute>}  />
            <Route path="/cursos/:id/edit" element={<ProtectedRoute allowedRoles={['admin', 'superuser']}><AuthenticatedLayout><EditCursos /></AuthenticatedLayout></ProtectedRoute>}  />
            <Route path="/pagos" element={<AuthenticatedLayout><ShowPagos /></AuthenticatedLayout>} />
            <Route path="/pagos/create" element={<ProtectedRoute allowedRoles={['admin', 'superuser','pagos']}><AuthenticatedLayout><CreatePagos /></AuthenticatedLayout></ProtectedRoute>}  />
            <Route path="/pagos/:cedula/:cursoId" element={<ProtectedRoute allowedRoles={['admin', 'superuser','pagos']}><AuthenticatedLayout><CreatePagosCedula /></AuthenticatedLayout></ProtectedRoute>}  />
            <Route path="/pagos/:id" element={<AuthenticatedLayout><ShowMorePagos /></AuthenticatedLayout>} />
            <Route path="/pagos/curso/:inscripcion_curso_id" element={<AuthenticatedLayout><ShowPagosCursos /></AuthenticatedLayout>} />
            <Route path="/voluntariados" element={<AuthenticatedLayout><ShowVoluntariados /></AuthenticatedLayout>} />
            <Route path="/voluntariados/:id" element={<AuthenticatedLayout><ShowMoreVoluntariados /></AuthenticatedLayout>} />
            <Route path="/voluntariados/create" element={<ProtectedRoute allowedRoles={['admin', 'superuser']}><AuthenticatedLayout><CreateVoluntariados /></AuthenticatedLayout></ProtectedRoute>}  />
            <Route path="/voluntariados/:id/edit" element={<ProtectedRoute allowedRoles={['admin', 'superuser']}><AuthenticatedLayout><EditVoluntariados /></AuthenticatedLayout></ProtectedRoute>}  />
            <Route path="/promocion" element={<AuthenticatedLayout><ShowPromocion /></AuthenticatedLayout>} />
            <Route path="/promocion/:id" element={<AuthenticatedLayout><ShowMorePromocion /></AuthenticatedLayout>} />
            <Route path="/promocion/create" element={<ProtectedRoute allowedRoles={['admin', 'superuser']}><AuthenticatedLayout><CreatePromocion /></AuthenticatedLayout></ProtectedRoute>}  />
            <Route path="/promocion/:id/edit" element={<ProtectedRoute allowedRoles={['admin', 'superuser']}><AuthenticatedLayout><EditPromocion /></AuthenticatedLayout></ProtectedRoute>}  />
          </Routes>
        </Router>
      
    </LoadingProvider>
  );
}

const AuthenticatedLayout = ({ children }) => {
  const location = useLocation(); // Obtén la ubicación actual
  const [pageTitle, setPageTitle] = useState('');

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const userRole = localStorage.getItem('role');

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
        
        setUser(response.data);
      } catch (error) {
        console.error('Error fetching user:', error);
        navigate('/');
      }
    };
  
    fetchUser();


    switch (location.pathname) {
      case '/datos':
        setPageTitle('Participantes');
        break;
        case '/peticiones':
        setPageTitle('Bandeja de Entrada');
        break;
      case '/cursos':
        setPageTitle('Cursos');
        break;
      case '/pagos':
        setPageTitle('Reporte de Pagos');
        break;
      case '/voluntariados':
        setPageTitle('Voluntariados');
        break;
      // Agrega más rutas aquí según sea necesario
      default:
        setPageTitle('Dashboard');
        break;
    }
  }, [navigate],[location]);
  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');

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

  

  const toggleDropdowns = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };
  const toggleDropdown = (index) => {
    setOpenDropdown(openDropdown === index ? null : index);
  };

  return (
    <div className="app-container">
   {/* Sidebar */}
  <div className={`sidebar`}>
    <div className="logo">
      <img src="/IMG/Simedimos_Logo_var3.png" alt="Logo" />
    </div>
    <ul>
      <li className={openDropdown === 1 ? 'expanded' : ''}>
        <div className="dropdown-button" onClick={() => toggleDropdown(1)}>
          <i className="bi bi-bookmark-fill"></i> Módulo 1
          <i className={`bi ${openDropdown === 1 ? 'bi-caret-up-fill' : 'bi-caret-down-fill'}`}></i>
        </div>
        <ul className={`dropdown-menu ${openDropdown === 1 ? 'show' : ''}`}>
          <li><NavLink to="/datos"><i className="bi bi-person-circle"></i> Participantes</NavLink></li>
          <li><NavLink to="/cursos"><i className="bi bi-book-half"></i> Cursos</NavLink></li>
          <li><NavLink to="/pagos"><i className="bi bi-credit-card-fill"></i> Reporte de Pagos</NavLink></li>
          <li><NavLink to="/promocion"><i className="bi bi-star-fill"></i> Promoción</NavLink></li>
        </ul>
      </li>
      <li className={openDropdown === 2 ? 'expanded' : ''}>
        <div className="dropdown-button" onClick={() => toggleDropdown(2)}>
          <i className="bi bi-bookmark-fill"></i> Módulo 2
          <i className={`bi ${openDropdown === 2 ? 'bi-caret-up-fill' : 'bi-caret-down-fill'}`}></i>
        </div>
        <ul className={`dropdown-menu ${openDropdown === 2 ? 'show' : ''}`}>
          <li><NavLink to="/voluntariados"><i className="bi bi-person-raised-hand"></i> Voluntariados</NavLink></li>
        </ul>
      </li>
    </ul>
  </div>


      <div className="header">

      <h2 className="page-title">{`> ${pageTitle}`}</h2>
        <div className="header-content">
        
          <div className="user-section ">
            {/* Íconos a la izquierda */}
            <div className="icon-container">
              <div className="user-icon" onClick={() => navigate('/peticiones')}>
                <i className="bi bi-inbox-fill" style={{ fontSize: '1.6rem', cursor: 'pointer', }}></i>
              </div>
              {userRole === 'admin' && (
                <div className="user-icon" onClick={() => navigate('/users')}>
                  <i className="bi bi-person-fill-gear" style={{ fontSize: '1.5rem', cursor: 'pointer', }}></i>
                </div>
              )}
            </div>

            {/* Nombre de Rol y Círculo */}
            <span className="user-role  ">{userRole}</span>
            <div className="user-circle" onClick={toggleDropdowns}>
              <span className="user-initial">{user?.name?.charAt(0).toUpperCase()}</span>
            </div>

            {/* Menú Desplegable de Logout */}
            {isDropdownOpen && (
            <div className="dropdown-menux">
              <div className="logout-options " >
              <span >Usuario: {user.name}</span>
              </div>
              <div className="logout-option" onClick={handleLogout}>

              
                <i className="bi bi-box-arrow-right" style={{ marginRight: '8px' }}></i>
                <span>Logout</span>
              </div>
            </div>
          )}

          </div>
        </div>
      </div>

      {/* Main content */}
      <div className={`content `}>
      <LoadingOverlay>
        {children} {/* Aquí va el contenido principal */}
        </LoadingOverlay>
      </div>
    </div>
  );
};

const LoadingOverlay = ({ children }) => {
  const { loading } = useLoading();

  return (
    <>
      {loading && <Loader /> }
      {children}
    </>
  );
};

export default App;
