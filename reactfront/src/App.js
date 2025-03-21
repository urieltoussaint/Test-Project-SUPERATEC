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
import InscripcionCursos from './pages/Cursos/InscripcionCursos';
import InscribirCedula from './pages/Cursos/InscribirCedula';
import ShowInscritos from './pages/Cursos/ShowInscritos';
import ShowCursos from './pages/Cursos/ShowCursos';
import CreateCursos from './pages/Cursos/CreateCursos';
import EditCursos from './pages/Cursos/EditCursos';
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
import CreateUsers from './pages/Users/CreateUsers';
import CreatePagoCursos from './pages/Cursos/CreatePagoCursos';
import ShowMoreCursos from './pages/Cursos/ShowMoreCursos';
import ShowPatrocinantes from './pages/Patrocinantes/ShowPatrocinantes';
import CreatePatrocinantes from './pages/Patrocinantes/CreatePatrocinantes';
import EditPatrocinantes from './pages/Patrocinantes/EditPatrocinantes';
import ShowMorePatrocinantes from './pages/Patrocinantes/ShowMorePatrocinantes';
import ShowDatosCursos from './pages/Participantes/ShowDatosCursos';
import ShowMoreInscripciones from './pages/Cursos/ShowMoreInscripciones';
import EditInscripciones from './pages/Cursos/EditInscripciones';
import ShowProcedencias from './pages/Procedencias/ShowProcedencias';
import CreateProcedencias from './pages/Procedencias/CreateProcedencias';
import EditProcedencias from './pages/Procedencias/EditProcedencias';
import ShowPagosProgramas from './pages/Participantes/ReportePagos/ShowPagosProgramas';
import CambiarClave from './pages/Users/CambiarClave';
import ShowIndicadores from './pages/CalculoIndicadores/ShowIndicadores';
import ConfirmInscripciones from './pages/Cursos/ConfirmInscripciones';
import ShowCursosExternos from './pages/Cursos/ShowCursosExternos';
import CreateCursosExterno from './pages/Cursos/CreateCursosExterno';
import InscribirExterno from './pages/Cursos/InscribirExterno';
import ShowBolsaEmpleo from './pages/BolsaEmpleo/ShowBolsaEmpleo';
import IncsParticipanteBolsa from './pages/BolsaEmpleo/IncsParticipanteBolsa';
import IncsEmpleo from './pages/BolsaEmpleo/IncsEmpleo';
import ShowPostulados from './pages/BolsaEmpleo/ShowPostulados';
import ShowMorePostulados from './pages/BolsaEmpleo/ShowMorePostulados';
import ShowPostulaciones from './pages/BolsaEmpleo/ShowPostulaciones';
import ShowPostulacionesEmpresas from './pages/BolsaEmpleo/ShowPostulacionesEmpresa';
import EditIncsParticipanteBolsa from './pages/BolsaEmpleo/EditIncsParticipanteBolsa.js';

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
            <Route path="users/create" element={<ProtectedRoute allowedRoles={['admin']}><AuthenticatedLayout><CreateUsers /></AuthenticatedLayout></ProtectedRoute>} />
            <Route path="cambiar_clave" element={<ProtectedRoute allowedRoles={['admin']}><AuthenticatedLayout><CambiarClave /></AuthenticatedLayout></ProtectedRoute>} />

            <Route path="/datos" element={<AuthenticatedLayout><ShowDatos /></AuthenticatedLayout>} />
            <Route path="/formulario/create" element={<ProtectedRoute allowedRoles={['admin', 'superuser']}><AuthenticatedLayout><CreateDatos /></AuthenticatedLayout></ProtectedRoute>} />
            <Route path="/datos/:id/edit" element={<ProtectedRoute allowedRoles={['admin', 'superuser']}><AuthenticatedLayout><EditDatos /></AuthenticatedLayout></ProtectedRoute>} />
            <Route path="/datos/:id" element={<AuthenticatedLayout><ShowMoreDatos /></AuthenticatedLayout>} />
            <Route path="/inscribir/:cursoId" element={<ProtectedRoute allowedRoles={['admin', 'superuser']}><AuthenticatedLayout><InscripcionCursos /></AuthenticatedLayout></ProtectedRoute>}  />
            <Route path="/inscribir/externo/:cursoId" element={<ProtectedRoute allowedRoles={['admin', 'superuser']}><AuthenticatedLayout><InscribirExterno /></AuthenticatedLayout></ProtectedRoute>}  />
            <Route path="/inscribir-cursos/:cedula" element={<ProtectedRoute allowedRoles={['admin', 'superuser']}><AuthenticatedLayout><InscribirCedula /></AuthenticatedLayout></ProtectedRoute>}  />
            <Route path="/inscritos/:cursoId" element={<AuthenticatedLayout><ShowInscritos /></AuthenticatedLayout>} />
            <Route path="/inscritos/show/:id" element={<AuthenticatedLayout><ShowMoreInscripciones /></AuthenticatedLayout>} />
            <Route path="/inscritos/edit/:inscripcionId/:cedula" element={<AuthenticatedLayout><EditInscripciones /></AuthenticatedLayout>} />
            <Route path="/inscripcion-confirm/:inscripcionId" element={<AuthenticatedLayout><ConfirmInscripciones /></AuthenticatedLayout>} />

            <Route path="/indicadores" element={<AuthenticatedLayout><ShowIndicadores /></AuthenticatedLayout>} />


            <Route path="/cursos" element={<AuthenticatedLayout><ShowCursos /></AuthenticatedLayout>} />
            <Route path="/cursos/externos" element={<AuthenticatedLayout><ShowCursosExternos /></AuthenticatedLayout>} />

            <Route path="/cursos/create" element={<ProtectedRoute allowedRoles={['admin', 'superuser']}><AuthenticatedLayout><CreateCursos /></AuthenticatedLayout></ProtectedRoute>}  />
            <Route path="/cursos/create/externo" element={<ProtectedRoute allowedRoles={['admin', 'superuser']}><AuthenticatedLayout><CreateCursosExterno /></AuthenticatedLayout></ProtectedRoute>}  />

            <Route path="/cursos/:id/edit" element={<ProtectedRoute allowedRoles={['admin', 'superuser','pagos']}><AuthenticatedLayout><EditCursos /></AuthenticatedLayout></ProtectedRoute>}  />
            <Route path="/cursos/:id/pagos" element={<ProtectedRoute allowedRoles={['admin', 'superuser','pagos']}><AuthenticatedLayout><CreatePagoCursos /></AuthenticatedLayout></ProtectedRoute>}  />
            <Route path="/cursos/:id" element={<AuthenticatedLayout><ShowMoreCursos /></AuthenticatedLayout>}  />
            <Route path="datos/cursos/:cedula_identidad" element={<AuthenticatedLayout><ShowDatosCursos /></AuthenticatedLayout>}  />
            <Route path="/pagos" element={<AuthenticatedLayout><ShowPagos /></AuthenticatedLayout>} />
            <Route path="/pagos/create" element={<ProtectedRoute allowedRoles={['admin', 'superuser','pagos']}><AuthenticatedLayout><CreatePagos /></AuthenticatedLayout></ProtectedRoute>}  />
            <Route path="/pagos/:cedula/:cursoId" element={<ProtectedRoute allowedRoles={['admin', 'superuser','pagos']}><AuthenticatedLayout><CreatePagosCedula /></AuthenticatedLayout></ProtectedRoute>}  />
            <Route path="/pagos/:id" element={<AuthenticatedLayout><ShowMorePagos /></AuthenticatedLayout>} />
            <Route path="/pagos/curso/:inscripcion_curso_id" element={<AuthenticatedLayout><ShowPagosCursos /></AuthenticatedLayout>} />
            <Route path="/pagos/programa/:curso_id" element={<AuthenticatedLayout><ShowPagosProgramas /></AuthenticatedLayout>} />
            <Route path="/voluntariados" element={<AuthenticatedLayout><ShowVoluntariados /></AuthenticatedLayout>} />
            <Route path="/voluntariados/:id" element={<AuthenticatedLayout><ShowMoreVoluntariados /></AuthenticatedLayout>} />
            <Route path="/voluntariados/create" element={<ProtectedRoute allowedRoles={['admin', 'superuser']}><AuthenticatedLayout><CreateVoluntariados /></AuthenticatedLayout></ProtectedRoute>}  />
            <Route path="/voluntariados/:id/edit" element={<ProtectedRoute allowedRoles={['admin', 'superuser']}><AuthenticatedLayout><EditVoluntariados /></AuthenticatedLayout></ProtectedRoute>}  />
            <Route path="/promocion" element={<AuthenticatedLayout><ShowPromocion /></AuthenticatedLayout>} />
            <Route path="/promocion/:id" element={<AuthenticatedLayout><ShowMorePromocion /></AuthenticatedLayout>} />
            <Route path="/promocion/create" element={<ProtectedRoute allowedRoles={['admin', 'superuser']}><AuthenticatedLayout><CreatePromocion /></AuthenticatedLayout></ProtectedRoute>}  />
            <Route path="/promocion/:id/edit" element={<ProtectedRoute allowedRoles={['admin', 'superuser']}><AuthenticatedLayout><EditPromocion /></AuthenticatedLayout></ProtectedRoute>}  />
            <Route path="/patrocinantes" element={<AuthenticatedLayout><ShowPatrocinantes /></AuthenticatedLayout>} />
            <Route path="/patrocinantes/create" element={<ProtectedRoute allowedRoles={['admin', 'superuser',]}><AuthenticatedLayout><CreatePatrocinantes /></AuthenticatedLayout></ProtectedRoute>}  />
            <Route path="/patrocinantes/:id/edit" element={<ProtectedRoute allowedRoles={['admin', 'superuser',]}><AuthenticatedLayout><EditPatrocinantes /></AuthenticatedLayout></ProtectedRoute>}  />
            <Route path="/patrocinantes/:id" element={<AuthenticatedLayout><ShowMorePatrocinantes /></AuthenticatedLayout>}  />
            <Route path="/procedencias" element={<AuthenticatedLayout><ShowProcedencias /></AuthenticatedLayout>} />
            <Route path="/procedencias/create" element={<ProtectedRoute allowedRoles={['admin', 'superuser','pagos']}><AuthenticatedLayout><CreateProcedencias /></AuthenticatedLayout></ProtectedRoute>}  />
            <Route path="/procedencias/edit/:id" element={<ProtectedRoute allowedRoles={['admin', 'superuser','pagos']}><AuthenticatedLayout><EditProcedencias /></AuthenticatedLayout></ProtectedRoute>}  />
            <Route path="/bolsa-empleo" element={<ProtectedRoute allowedRoles={['admin', 'superuser','pagos']}><AuthenticatedLayout><ShowBolsaEmpleo /></AuthenticatedLayout></ProtectedRoute>}  />
            <Route path="/postulaciones/:id" element={<ProtectedRoute allowedRoles={['admin', 'superuser','pagos']}><AuthenticatedLayout><ShowPostulaciones /></AuthenticatedLayout></ProtectedRoute>}  />
            <Route path="/postulaciones-empresas/:id" element={<ProtectedRoute allowedRoles={['admin', 'superuser','pagos']}><AuthenticatedLayout><ShowPostulacionesEmpresas /></AuthenticatedLayout></ProtectedRoute>}  />
            <Route path="/inscribir-part-bolsa" element={<ProtectedRoute allowedRoles={['admin', 'superuser','pagos']}><AuthenticatedLayout><IncsParticipanteBolsa /></AuthenticatedLayout></ProtectedRoute>}  />
            <Route path="/edit-part-bolsa/:id" element={<ProtectedRoute allowedRoles={['admin', 'superuser','pagos']}><AuthenticatedLayout><EditIncsParticipanteBolsa /></AuthenticatedLayout></ProtectedRoute>}  />
            <Route path="/bolsa-empleo/:patrocinanteId" element={<ProtectedRoute allowedRoles={['admin', 'superuser','pagos']}><AuthenticatedLayout><IncsEmpleo /></AuthenticatedLayout></ProtectedRoute>}  />
            <Route path="/postulados-bolsa-empleo" element={<ProtectedRoute allowedRoles={['admin', 'superuser','pagos']}><AuthenticatedLayout><ShowPostulados /></AuthenticatedLayout></ProtectedRoute>}  />
            <Route path="/postulados-bolsa-empleo/:id" element={<ProtectedRoute allowedRoles={['admin', 'superuser','pagos']}><AuthenticatedLayout><ShowMorePostulados /></AuthenticatedLayout></ProtectedRoute>}  />


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
  const endpoint = 'http://localhost:8000/api';

  const fetchUser = async () => {
    try {
      const storedUser = sessionStorage.getItem('user'); // Verifica si el usuario ya está almacenado en sessionStorage
      if (storedUser) {
        setUser(JSON.parse(storedUser)); // Si ya hay datos guardados, los usa
      } else {
        const token = localStorage.getItem('token'); // Sigue usando localStorage para el token
        if (!token) {
          throw new Error("No token found");
        }
  
        const response = await axios.get('http://localhost:8000/api/user', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        setUser(response.data);
        sessionStorage.setItem('user', JSON.stringify(response.data)); // Almacena los datos del usuario en sessionStorage
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      navigate('/'); // Redirige al login si falla
    }
  };


  const checkAndFetchTasa = async () => {
    const lastUpdated = localStorage.getItem('lastUpdatedBcv'); // Obtener la última fecha de actualización
    const today = new Date().toISOString().split('T')[0]; // Obtener la fecha actual (YYYY-MM-DD)
  
    // Si no se ha hecho la petición hoy
    if (lastUpdated !== today) {
      try {
         // Llamar a la API para obtener la tasa actual
        console.log("Llamando a /get");

        const token = localStorage.getItem('token');
        const response = await axios.get(`${endpoint}/tasa-bcv/get`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("Tasa guardada correctamente");
  

        // Mostrar la tasa actual (puedes ajustar según sea necesario)
        console.log("Tasa BCV:", response.data.dolarBcv);
  
        // Actualizar la fecha en localStorage
        localStorage.setItem('lastUpdatedBcv', today);
      } catch (error) {
        console.error('Error actualizando o obteniendo la tasa del BCV:', error);
      }
    }
  };
  
  
  const scheduleTasaUpdate = () => {
    const targetHour = 12; // Hora a la que deseas ejecutar la función (22 = 10 PM)
    const targetMinutes = 31; // Minutos de la hora objetivo (por ejemplo, 12)
    
    // Obtener la hora actual en la zona horaria de Caracas (UTC-4)
    const now = new Date();

    // Crear un formato de fecha para Caracas
    const timeZone = 'America/Caracas';
    const formatter = new Intl.DateTimeFormat('es-VE', {
      timeZone,
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: false
    });
  
    // Obtener la hora actual en Caracas
    const nowInCaracas = formatter.formatToParts(now).reduce((acc, part) => {
      if (part.type === 'hour') acc.hour = parseInt(part.value);
      if (part.type === 'minute') acc.minute = parseInt(part.value);
      if (part.type === 'second') acc.second = parseInt(part.value);
      return acc;
    }, {});
  
    // Calcular el próximo tiempo objetivo en Caracas
    let targetTime = new Date(now.toLocaleString('en-US', { timeZone }));
    targetTime.setHours(targetHour);
    targetTime.setMinutes(targetMinutes);
    targetTime.setSeconds(0);
  
    // Si la hora objetivo ya pasó hoy, programa para mañana
    if (nowInCaracas.hour > targetHour || (nowInCaracas.hour === targetHour && nowInCaracas.minute >= targetMinutes)) {
      targetTime.setDate(targetTime.getDate() + 1);
    }
  
    // Calcular el tiempo restante hasta la ejecución
    const timeUntilUpdate = targetTime.getTime() - now.getTime();
  
    setTimeout(() => {
      checkAndFetchTasa(); // Llamar la función en el momento indicado
      scheduleTasaUpdate(); // Reprogramar para el día siguiente
    }, timeUntilUpdate);
  };
  
  useEffect(() => {
    fetchUser();
    scheduleTasaUpdate(); // Llamar a la función que programa la actualización de la tasa
  }, []);
  
  

  useEffect(() => {

    fetchUser();
    scheduleTasaUpdate();
  }, [navigate]);
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
          <li><NavLink to="/cursos"><i className="bi bi-book-half"></i> Unidad Curricular</NavLink></li>
          <li><NavLink to="/pagos"><i className="bi bi-credit-card-fill"></i> Reporte de Pagos</NavLink></li>
          <li><NavLink to="/patrocinantes"><i className="bi bi-building"></i> Patrocinantes</NavLink></li>
          <li><NavLink to="/procedencias"><i className="bi bi-geo-fill"></i> Procedencias</NavLink></li>
          <li><NavLink to="/promocion"><i className="bi bi-star-fill"></i> Promoción</NavLink></li>
          <li><NavLink to="/indicadores"><i className="bi bi-sliders"></i> Indicadores</NavLink></li>
        </ul>
      </li>
      <li className={openDropdown === 2 ? 'expanded' : ''}>
        <div className="dropdown-button " onClick={() => toggleDropdown(2)}>
          <i className="bi bi-bookmark-fill"></i> Módulo 2
          <i className={`bi ${openDropdown === 2 ? 'bi-caret-up-fill' : 'bi-caret-down-fill'}`}></i>
        </div>
        <ul className={`dropdown-menu ${openDropdown === 2 ? 'show' : ''}`}>
          <li><NavLink to="/voluntariados"><i className="bi bi-person-raised-hand"></i> Voluntariados</NavLink></li>
          <li><NavLink to="/cursos/externos"><i className="bi bi-book-half"></i> U.C Externa</NavLink></li>

        </ul>
      </li>

      <li className={openDropdown === 3 ? 'expanded' : ''}>
        <div className="dropdown-button " onClick={() => toggleDropdown(3)}>
          <i className="bi bi-person-workspace"></i> Empleo
          <i className={`bi ${openDropdown === 3 ? 'bi-caret-up-fill' : 'bi-caret-down-fill'}`}></i>
        </div>
        <ul className={`dropdown-menu ${openDropdown === 3 ? 'show' : ''}`}>
        
          <li><NavLink to="/bolsa-empleo"><i className="bi bi-building"></i> Empresas</NavLink></li>
          <li><NavLink to="/postulados-bolsa-empleo"><i className="bi bi-person"></i> Postulados</NavLink></li>

        </ul>
      </li>
    </ul>
  </div>


      <div className="header">

      
        <div className="header-content">
        
          <div className="user-section ">
            {/* Íconos a la izquierda */}
            <div className="icon-container">
              <div className="user-icon" onClick={() => navigate('/peticiones')} title='Bandeja de Entrada'>
                <i className="bi bi-inbox-fill" style={{ fontSize: '1.6rem', cursor: 'pointer', }}></i>
              </div>
              {userRole === 'admin' && (
                <div className="user-icon" onClick={() => navigate('/users')} title='Administrar Usuarios'>
                  <i className="bi bi-person-fill-gear" style={{ fontSize: '1.5rem', cursor: 'pointer', }}></i>
                </div>
              )}
            </div>

            {/* Nombre de Rol y Círculo */}
            <span className="user-role  ">{userRole}</span>
            <div className="user-circle" onClick={toggleDropdowns} title='Ver Opciones'>
              <span className="user-initial">{user?.username?.charAt(0).toUpperCase()}</span>
            </div>

            {/* Menú Desplegable de Logout */}
            {isDropdownOpen && (
            <div className="dropdown-menux">
              <div className="logout-options " >
              <span >Usuario: {user.username}</span>
              </div>
              <div className="logout-option" onClick={() => navigate('/cambiar_clave')}>
              <i className="bi bi-lock" style={{ marginRight: '8px' }}></i>
              <span>Cambiar Clave</span>
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
