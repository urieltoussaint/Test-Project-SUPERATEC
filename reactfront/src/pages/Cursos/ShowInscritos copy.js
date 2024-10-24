import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Table, Alert, Button, Form, Modal } from 'react-bootstrap';
import moment from 'moment';
import { useLoading } from '../../components/LoadingContext';
import { toast, ToastContainer } from 'react-toastify';
import PaginationTable from '../../components/PaginationTable';
import { ResponsiveContainer,Line, LineChart,BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,AreaChart,Area,Radar,RadarChart, PieChart, Cell, Pie, ComposedChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { FaUserFriends, FaClock, FaBook,FaSync } from 'react-icons/fa';  // Importamos íconos de react-icons


const endpoint = 'http://localhost:8000/api';

const ShowInscritos = () => {
  const { cursoId } = useParams();
  const [inscripciones, setInscripciones] = useState([]);
  const [filteredInscripciones, setFilteredInscripciones] = useState([]);
  const [searchCedula, setSearchCedula] = useState('');
  const [error, setError] = useState('');
  const [cursoCod, setCursoCod] = useState(''); // Estado para guardar el código del curso
  const [showModal, setShowModal] = useState(false); // Estado para controlar el modal
  const [selectedId, setSelectedId] = useState(null); // Estado para guardar el ID de la inscripción a eliminar
  const navigate = useNavigate();
  const { setLoading } = useLoading();
  const userRole = localStorage.getItem('role'); // Puede ser 'admin', 'superuser', 'invitado', etc.
  const itemsPerPage = 5; // Número de elementos por página
  const [showCompleteModal, setShowCompleteModal] = useState(false); // Estado para controlar el modal de "culminado"
  const [selectedCompleteId, setSelectedCompleteId] = useState(null); // Estado para guardar el ID de la inscripción a marcar como culminado
  const [currentPage, setCurrentPage] = useState(1);  // Estado para la página actual
  const [range, setRange] = useState(30); // Estado para seleccionar rango de días

  useEffect(() => {
    setLoading(true);
    Promise.all([getInscritos(), getCursoCod()]).finally(() => {
      setLoading(false);
    });
  }, [cursoId]);

  // Obtener los detalles del curso por ID
  const getCursoCod = async () => {
    try {
      const token = localStorage.getItem('token');

      // Hacer una solicitud solo para el curso específico
      const response = await axios.get(`${endpoint}/cursos/${cursoId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const curso = response.data;

      if (curso) {
        setCursoCod(curso.cod); // Guardar el código del curso en el estado
      } else {
        setCursoCod('Desconocido');
      }
    } catch (error) {
      console.error('Error fetching curso cod:', error);
      setError('Error al obtener el código del curso');
    }
  };

  const getInscritos = async () => {
    try {
      const token = localStorage.getItem('token');
      let allInscripciones = [];
      let currentPage = 1;
      let totalPages = 1;
  
      // Loop para obtener todas las páginas de inscripciones relacionadas con el curso
      while (currentPage <= totalPages) {
        const response = await axios.get(`${endpoint}/cursos_inscripcion?curso_id=${cursoId}&page=${currentPage}`, { // Aquí pasas cursoId
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        allInscripciones = [...allInscripciones, ...response.data.data];
        totalPages = response.data.last_page;
        currentPage++;
      }
  
      setInscripciones(allInscripciones);
      setFilteredInscripciones(allInscripciones);
    } catch (error) {
      setError('Error fetching data');
      console.error('Error fetching data:', error);
    }
  };


  const getStatusPayColor = (status_pay) => {
    if (status_pay === '1') return 'red'; // No pagado
    if (status_pay === '2') return 'orange'; // En proceso
    if (status_pay === '3') return 'green'; // Pagado
    if (status_pay === '4') return 'blue'; // Culminado
    return 'gray'; // Desconocido
  };


// Mostrar el modal de confirmación para marcar como culminado
const handleShowCompleteModal = (id) => {
  setSelectedCompleteId(id);
  setShowCompleteModal(true);
};

// Cerrar el modal de culminado
const handleCloseCompleteModal = () => {
  setShowCompleteModal(false);
};

  
  // Manejar la acción para cambiar el status_pay a 4 (culminado)
const handleMarkAsComplete = async () => {
  try {
    const token = localStorage.getItem('token');
    await axios.put(`${endpoint}/inscripcion_cursos/${selectedCompleteId}`, {
      status_pay: 4,
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    toast.success('El participante ha sido marcado como "culminado"');
    setFilteredInscripciones(
      filteredInscripciones.map(inscripcion => 
        inscripcion.id === selectedCompleteId ? { ...inscripcion, status_pay: 4 } : inscripcion
      )
    );
    setShowCompleteModal(false); // Cierra el modal tras éxito
  } catch (error) {
    console.error('Error updating status_pay:', error);
    toast.error('Error al marcar como culminado');
    setShowCompleteModal(false);
  }
};

  const renderStatusPayDot = (status_pay) => {
    const color = getStatusPayColor(status_pay);
    return (
      <div
        style={{
          height: '20px',
          width: '20px',
          borderRadius: '50%',
          backgroundColor: color,
          display: 'inline-block',
        }}
      ></div>
    );
  };

  const [selectedPayStatus, setSelectedPayStatus] = useState(''); // Estado para el filtro de estado de pago

  const handlePayStatusChange = (e) => {
    const value = e.target.value;
    setSelectedPayStatus(value);
    applyPayStatusFilter(value);
  };

  const applyPayStatusFilter = (statusValue) => {
    let filtered = [...inscripciones];
    if (statusValue) {
      filtered = filtered.filter(inscripcion => inscripcion.status_pay === statusValue);
    }
    setFilteredInscripciones(filtered);
    setCurrentPage(1);
  };

  // Mostrar el modal para confirmar la eliminación
  const handleShowModal = (id) => {
    setSelectedId(id);  // Almacena el ID de la inscripción que se va a eliminar
    setShowModal(true); // Muestra el modal
  };

  const handleCloseModal = () => {
    setShowModal(false); // Cierra el modal
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${endpoint}/cursos_inscripcion/${selectedId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success('Éxito al eliminar la inscripción');
      setFilteredInscripciones(filteredInscripciones.filter(inscripcion => inscripcion.id !== selectedId));
      setShowModal(false); // Cierra el modal tras la eliminación exitosa
    } catch (error) {
      console.error('Error deleting inscripcion:', error);
      setError('Error al eliminar la inscripción');
      setShowModal(false); // Cierra el modal tras el error
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchCedula(value);
    const filtered = inscripciones.filter(inscripcion =>
      inscripcion.cedula_identidad.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredInscripciones(filtered);
  };

  // Filtrar todos los inscritos menos los que han culminado (status_pay = 4)
const applyNonCulminadosFilter = () => {
  const filtered = inscripciones.filter(inscripcion => inscripcion.status_pay !== '4');
  setFilteredInscripciones(filtered);
};

// Cálculo de datos según filtros
const activeFilters = null;
const dataToUse =  inscripciones ;  // Usar filteredUsers si hay filtros, de lo contrario usar users

const totalIns = dataToUse.length;






  const columns = ["Estado", "Cédula", "Fecha de Inscripción", "Nombres", "Apellidos", "Acciones"];

  const renderItem = (inscripcion) => (
    <tr key={inscripcion.id}>
      <td className="text-centerd-fel">{renderStatusPayDot(inscripcion.status_pay)}</td>
      <td>{inscripcion.cedula_identidad}</td>
      <td>{moment(inscripcion.fecha_inscripcion).format('YYYY-MM-DD')}</td>
      <td>{inscripcion.nombres}</td>
      <td>{inscripcion.apellidos}</td>
      <td>
      <div className="d-flex" style={{ gap: '5px' }}>

        {/* Botón para ver pagos */}
        <Button variant="btn btn-info" onClick={() => navigate(`/pagos/curso/${inscripcion.id}`)} className="me-1">
          <i className="bi bi-list-check"></i>
        </Button>

        {/* Botón para eliminar si el rol es 'admin' */}
        {userRole === 'admin' && (
          <Button variant="btn btn-danger" onClick={() => handleShowModal(inscripcion.id)} className="me-1">
            <i className="bi bi-trash3-fill"></i>
          </Button>
        )}

        {/* Botón para marcar como culminado si el rol es 'admin' o 'superuser' y status_pay es 3 */}
        {(userRole === 'admin' || userRole === 'superuser') && inscripcion.status_pay === '3' && (
          <Button variant="btn btn-success" onClick={() => handleShowCompleteModal(inscripcion.id)} className="me-1">
            <i className="bi bi-check-circle"></i>
          </Button>
        )}


        </div>

      </td>
    </tr>
  );

  return (
    <div className="container-fluid " style={{ fontSize: '0.85rem' }}>
    <div className="stat-box mx-auto col-lg-11" style={{ maxWidth: '100%' }}> 
        {/* Total de Uduarios */}
        <div className="stat-card" style={{  }}>
            <div className="stat-icon" style={{ fontSize: '14px', color: '#333', marginBottom: '1px' }}><FaUserFriends /></div>
            <div className="stat-number" style={{ color: 'rgba(255, 74, 74, 0.9) ', fontSize: '1.8rem' }}>{totalIns}</div>
            <h4 style={{ fontSize: '1.1rem', color:'gray' }}>Total Usuarios</h4>
            
        </div>

        {/* Promedio de Antigüedad */} 
        <div className="stat-card" style={{  }}>
            <div className="stat-icon" style={{ fontSize: '14px', color: '#333', marginBottom: '1px' }}><FaClock /></div>
            <div className="stat-number" style={{ color: 'rgba(54, 162, 235, 0.9)', fontSize: '1.8rem' }}>{'averageAntiquity'} días</div>
            <h4 style={{ fontSize: '1.1rem', color:'gray' }}>Promedio de Antigüedad</h4>
        </div>


    </div>

    <div className="row" style={{ marginTop: '10px' }}>
      {/* Columna para la tabla */}
      <div className="col-lg-11 mx-auto"> {/* Agregamos 'mx-auto' para centrar */}
          <div className="card-box" style={{ padding: '20px', width: '100%', margin: '0 auto' }}> 
          <div className="d-flex justify-content-between align-items-center mb-3" style={{ gap: '0px' }}>
          <h1>Inscritos del Curso {cursoCod}</h1>
        <div className="d-flex align-items-center justify-content-between"> {/* Alineación horizontal */}
          {(userRole === 'admin' || userRole === 'superuser' ) && (
            <Button variant="btn custom" onClick={() => navigate(`/inscribir/${cursoId}`)} className="btn-custom me-2" style={{ fontSize: '0.9rem' }}>
              <i className="bi bi-person-plus-fill"></i> Nuevo
            </Button>
          )}

          <Button variant="secondary" onClick={() => navigate('/cursos')} className="secondary" style={{ fontSize: '0.9rem' }}>
            <i className="bi bi-arrow-90deg-left"></i>
          </Button>
        </div>
      </div>

        {/* Alinear el buscador y el filtro en la misma fila con el nuevo botón a la derecha */}
    <div className="d-flex justify-content-between align-items-center mb-3">
      <div className="d-flex align-items-center" style={{ gap: '10px' }}> {/* Ajusta el espacio entre el buscador y el filtro */}
        <Form.Control
          type="text"
          placeholder="Buscar por cédula"
          value={searchCedula}
          onChange={handleSearchChange}
          style={{ width: '250px' }}
        />
        <Form.Select
          value={selectedPayStatus}
          onChange={handlePayStatusChange}
          className="me-2"
          style={{ width: 'auto' }}
        >
          <option value="">Filtrar por estado de pago</option>
          <option value="1">No pagado (Rojo)</option>
          <option value="2">En proceso (Naranja)</option>
          <option value="3">Pagado (Verde)</option>
          <option value="4">Culminado (Azul)</option> {/* Opción para "Culminado" */}
        </Form.Select>
      </div>

      {/* Botón para mostrar los inscritos que no han culminado (status_pay 1, 2 o 3) */}
      <Button variant="success" onClick={() => applyNonCulminadosFilter()}>
        Mostrar en Proceso
      </Button>
      <Button variant="info" onClick={() => applyPayStatusFilter('4')}>
        Mostrar solo culminados
      </Button>

      
    </div>


      {/* Leyenda de colores */}
      <div className="status-legend d-flex justify-content-start mb-3">
        <span className="status-dot red"></span> No pagado (Rojo)
        <span className="status-dot orange ms-3"></span> En proceso (Naranja)
        <span className="status-dot green ms-3"></span> Pagado (Verde)
        <span className="status-dot blue ms-3"></span> Culminado (Azul)
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {/* Tabla paginada */}
      <PaginationTable
        data={filteredInscripciones}  // Datos filtrados
        itemsPerPage={itemsPerPage}
        columns={columns}
        renderItem={renderItem}
        currentPage={currentPage}  // Página actual
        onPageChange={setCurrentPage}  // Función para cambiar de página
        />

      {/* Modal de eliminación */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>¿Estás seguro de que deseas eliminar esta inscripción?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Eliminar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de Curso Completado */}
      <Modal show={showCompleteModal} onHide={handleCloseCompleteModal}>
      <Modal.Header closeButton>
        <Modal.Title>Confirmar finalización del curso</Modal.Title>
      </Modal.Header>
      <Modal.Body>¿Estás seguro de que este participante ha culminado el curso?</Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleCloseCompleteModal}>
          Cancelar
        </Button>
        <Button variant="success" onClick={handleMarkAsComplete}>
          Marcar como culminado
        </Button>
      </Modal.Footer>
    </Modal>


      <ToastContainer />
    </div>
    </div>
    <div className="col-lg-12 d-flex justify-content-between flex-wrap" style={{ gap: '20px', marginTop: '10px' }}>
            <div className="chart-box" style={{ flex: '1 1 45%', maxWidth: '45%', marginRight: '10px' }}>
                <h4 style={{ fontSize: '1.2rem' }}>Distribución de Cargos</h4>
                    <ResponsiveContainer width="100%" height={400}>
                        
                    </ResponsiveContainer>
            </div>

            <div className="chart-box" style={{ flex: '1 1 45%', maxWidth: '45%', marginRight: '10px' }}>
                <h4 style={{ fontSize: '1.2rem' }}>Distribución de Roles</h4>
                    <ResponsiveContainer width="100%" height={400}>
                        
                    </ResponsiveContainer>
            </div>
        </div>
            


        
        </div>
        <div className="col-lg-11 d-flex justify-content-between flex-wrap" style={{ gap: '20px', marginTop: '10px' }}>
            <div className="chart-box" style={{ flex: '1 1 100%', maxWidth: '100%', marginRight: '10px' }}>
              <div className="d-flex justify-content-between align-items-center">
                  <h4 style={{ fontSize: '1.2rem' }}>Registro de Usuarios</h4>
                  {/* Selector de rango de fechas */}
                  <Form.Select 
                      value={range} 
                      onChange={(e) => setRange(parseInt(e.target.value))} 
                      style={{ width: '150px', fontSize: '0.85rem' }} // Ajustar el tamaño del selector
                  >
                      <option value={7}>Últimos 7 días</option>
                      <option value={30}>Últimos 30 días</option>
                      <option value={60}>Últimos 60 días</option>
                  </Form.Select>
              </div>
              {/* Leyenda de colores */}
      <div className="status-legend d-flex justify-content-start mb-3">
        <span className="status-dot red"></span> No pagado (Rojo)
        <span className="status-dot orange ms-3"></span> En proceso (Naranja)
        <span className="status-dot green ms-3"></span> Pagado (Verde)
        <span className="status-dot blue ms-3"></span> Culminado (Azul)
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {/* Tabla paginada */}
      <PaginationTable
        data={filteredInscripciones}  // Datos filtrados
        itemsPerPage={itemsPerPage}
        columns={columns}
        renderItem={renderItem}
        currentPage={currentPage}  // Página actual
        onPageChange={setCurrentPage}  // Función para cambiar de página
        />

      {/* Modal de eliminación */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>¿Estás seguro de que deseas eliminar esta inscripción?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Eliminar
          </Button>
        </Modal.Footer>
      </Modal>
              
            
            <ResponsiveContainer width="100%" height={400}>
              
               
            </ResponsiveContainer>


            
           </div>
        
        
    </div>
    


      

      {/* Modal de Curso Completado */}
      <Modal show={showCompleteModal} onHide={handleCloseCompleteModal}>
      <Modal.Header closeButton>
        <Modal.Title>Confirmar finalización del curso</Modal.Title>
      </Modal.Header>
      <Modal.Body>¿Estás seguro de que este participante ha culminado el curso?</Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleCloseCompleteModal}>
          Cancelar
        </Button>
        <Button variant="success" onClick={handleMarkAsComplete}>
          Marcar como culminado
        </Button>
      </Modal.Footer>
    </Modal>


      <ToastContainer />
    </div>
  );
};

export default ShowInscritos;
