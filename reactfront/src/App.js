import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route,Link } from 'react-router-dom';
import './App.css';
import ShowDatos from './components/ShowDatos';
import CreateDatos from './components/CreateDatos';
import EditDatos from './components/EditDatos';
import ShowMoreDatos from './components/ShowMoreDatos';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Comienza oculta

  const toggleSidebar = () => {
      setIsSidebarOpen(!isSidebarOpen); // Cambia el estado
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
                  <li><Link to="/datos">Datos Registrados</Link></li>
                  <li><Link to="/formulario/create">Crear Datos</Link></li>
              </ul>
          </div>
          <div className={`content ${isSidebarOpen ? "open" : "closed"}`}>
              <Routes>
                  <Route path="/datos" element={<ShowDatos />} />
                  <Route path="/formulario/create" element={<CreateDatos />} />
                  <Route path="/datos/:id/edit" element={<EditDatos />} />
                  <Route path="/datos/:id" element={<ShowMoreDatos />} />
              </Routes>
          </div>
      </Router>
  );
}

export default App;