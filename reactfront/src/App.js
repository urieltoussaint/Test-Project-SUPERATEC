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
import ShowMorePagos from './pages/Participantes/ReportePagos/ShowMorePagos';
import ShowVoluntariados from './pages/Participantes/Voluntariados/ShowVoluntariados';
import ShowMoreVoluntariados from './pages/Participantes/Voluntariados/ShowMoreVoluntariados';
import CreateVoluntariados from './pages/Participantes/Voluntariados/CreateVoluntariados';
import EditVoluntariados from './pages/Participantes/Voluntariados/EditVoluntariados';
import ShowPromocion from './pages/Promocion/ShowPromocion';
import ShowMorePromocion from './pages/Promocion/ShowMorePromocion';
import CreatePromocion from './pages/Promocion/CreatePromocion';
import EditPromocion from './pages/Promocion/EditPromocion';


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
            <Link to="/voluntariados">
              <i className="bi bi-person-raised-hand"></i> {/* Icono de moneda */}
              Voluntariados
            </Link>
            <Link to="/promocion">
              <i className="bi bi-mortarboard"></i> {/* Icono de gorro */}
              Promoción
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
          <Route path="/inscribir/:cursoId" element={<InscripcionCursos />} />
          <Route path="/inscritos/:cursoId" element={<ShowInscritos />} />
          <Route path="/cursos" element={<ShowCursos />} />
          <Route path="/cursos/create" element={<CreateCursos />} />
          <Route path="/cursos/:id/edit" element={<EditCursos />} />
          <Route path="/pagos" element={<ShowPagos />} />
          <Route path="/pagos/create" element={<CreatePagos />} />
          <Route path="/pagos/:id" element={<ShowMorePagos />} />
          <Route path="/voluntariados" element={<ShowVoluntariados />} />
          <Route path="/voluntariados/:id" element={<ShowMoreVoluntariados />} />
          <Route path="/voluntariados/create" element={<CreateVoluntariados />} />
          <Route path="/voluntariados/:id/edit" element={<EditVoluntariados />} />
          <Route path="/promocion" element={<ShowPromocion />} />
          <Route path="/promocion/:id" element={<ShowMorePromocion />} />
          <Route path="/promocion/create" element={<CreatePromocion />} />
          <Route path="/promocion/:id/edit" element={<EditPromocion />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
