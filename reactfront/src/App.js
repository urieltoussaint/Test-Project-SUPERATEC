import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import 'bootstrap-icons/font/bootstrap-icons.css'; // Importa Bootstrap Icons
import './App.css';
import ShowDatos from './pages/Participantes/ShowDatos';
import CreateDatos from './pages/Participantes/CreateDatos';
import EditDatos from './pages/Participantes/EditDatos';
import ShowMoreDatos from './pages/Participantes/ShowMoreDatos';
import ShowPagos from './pages/Participantes/ReportePagos/ShowPagos';
import ShowCursos from './pages/Participantes/Cursos/ShowCursos';
import CreateCursos from './pages/Participantes/Cursos/CreateCursos';
import EditCursos from './pages/Participantes/Cursos/EditCursos';
import InscripcionCursos from './pages/Participantes/Cursos/InscripcionCursos';
import ShowInscritos from './pages/Participantes/Cursos/ShowInscritos';
import CreatePagos from './pages/Participantes/ReportePagos/CreatePagos';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Comienza oculta
  const [reloadKey, setReloadKey] = useState(0); // Estado para manejar la recarga

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen); // Cambia el estado
  };

  const handleReload = () => {
    setReloadKey(prevKey => prevKey + 1); // Cambia el estado para recargar ShowMoreDatos
  };

  return (
    <Router>
      <div className="header">
        <button className="menu-button" onClick={toggleSidebar}>☰</button>
        <div className="logo">
          <img src="/IMG/cropped-PNG-7.png" alt="Logo" style={{ height: '45px' }} />
        </div>
      </div>
      <div className={`sidebar ${isSidebarOpen ? "open" : ""}`}>
        <ul>
          <li>
            <Link to="/datos">
              <i className="bi bi-person-circle"></i> {/* Icono de persona */}
              Participantes
            </Link>
            <Link to="/cursos">
              <i className="bi bi-book-half"></i> {/* Icono de libro */}
              Cursos
            </Link>
            <Link to="/pagos">
              <i className="bi bi-coin"></i> {/* Icono de moneda */}
              Reporte de Pagos
            </Link>
            <Link to="/pagos">
              <i className="bi bi-person-raised-hand"></i> {/* Icono de moneda */}
              Voluntariados
            </Link>
          </li>
        </ul>
      </div>
      <div className={`content ${isSidebarOpen ? "open" : "closed"}`}>
        <Routes>
          <Route path="/datos" element={<ShowDatos />} />
          <Route path="/formulario/create" element={<CreateDatos />} />
          <Route path="/datos/:id/edit" element={<EditDatos />} />
          <Route 
            path="/datos/:id" 
            element={<ShowMoreDatos key={reloadKey} onReload={handleReload} />} 
          />
          {/* <Route path="/inscribir/:id" element={<InscripcionCursos />} /> */}
          <Route path="/inscribir/:cursoId" element={<InscripcionCursos />} />
          <Route path="/inscritos/:cursoId" element={<ShowInscritos />} />
          <Route path="/cursos" element={<ShowCursos />} />
          <Route path="/cursos/create" element={<CreateCursos />} />
          <Route path="/cursos/:id/edit" element={<EditCursos />} />
          <Route path="/pagos" element={<ShowPagos />} />
          <Route path="/pagos/create" element={<CreatePagos />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
