import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ShowDatos from './components/ShowDatos';
import CreateDatos from './components/CreateDatos';
import EditDatos from './components/EditDatos';
import ShowMoreDatos from './components/ShowMoreDatos';

function App() {
  return (
    <Router>
      <div className="container mt-5">
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


