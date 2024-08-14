import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { LoadingProvider, useLoading } from './components/LoadingContext'; 
import Loader from './components/Loader'; 
import 'bootstrap-icons/font/bootstrap-icons.css';
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
import InscribirCedula from './pages/Participantes/Cursos/InscribirCedula';
import CreatePagosCedula from './pages/Participantes/ReportePagos/CreatePagosCedula';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <LoadingProvider>
      <LoadingOverlay>
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
              <div className="dropdown-button" onClick={toggleDropdown}>
                <i className="bi bi-bookmark-fill"></i> Part1
                <i className={`bi ${isDropdownOpen ? "bi-caret-up-fill" : "bi-caret-down-fill"}`}></i>
              </div>

                <ul className={`dropdown-menu ${isDropdownOpen ? "show" : ""}`}>
                  <li><Link to="/datos"><i className="bi bi-person-circle"></i> Participantes</Link></li>
                  <li><Link to="/cursos"><i className="bi bi-book-half"></i> Cursos</Link></li>
                  <li><Link to="/pagos"><i className="bi bi-credit-card-fill"></i> Reporte de Pagos</Link></li>
                  <li><Link to="/promocion"><i className="bi bi-star-fill"></i> Promoción</Link></li>
                </ul>
              </li>
            </ul>
          </div>
          <div className={`content ${isSidebarOpen ? "open" : "closed"}`}>
            <Routes>
              <Route path="/datos" element={<ShowDatos />} />
              <Route path="/formulario/create" element={<CreateDatos />} />
              <Route path="/datos/:id/edit" element={<EditDatos />} />
              <Route path="/datos/:id" element={<ShowMoreDatos />} />
              <Route path="/inscribir/:cursoId" element={<InscripcionCursos />} />
              <Route path="/inscribir-cursos/:cedula" element={<InscribirCedula />} />
              <Route path="/inscritos/:cursoId" element={<ShowInscritos />} />
              <Route path="/cursos" element={<ShowCursos />} />
              <Route path="/cursos/create" element={<CreateCursos />} />
              <Route path="/cursos/:id/edit" element={<EditCursos />} />
              <Route path="/pagos" element={<ShowPagos />} />
              <Route path="/pagos/create" element={<CreatePagos />} />
              <Route path="/pagos/:cedula/:cursoId" element={<CreatePagosCedula />} />
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
      </LoadingOverlay>
    </LoadingProvider>
  );
}

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
