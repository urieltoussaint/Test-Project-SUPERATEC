import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Table, Alert, Button, Form, Modal } from 'react-bootstrap';
import moment from 'moment';
import { useLoading } from '../../components/LoadingContext';
import { toast, ToastContainer } from 'react-toastify';
import PaginationTable from '../../components/PaginationTable';
import { ResponsiveContainer,Line, LineChart,BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,AreaChart,Area,Radar,RadarChart, PieChart, Cell, Pie, ComposedChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { FaUserFriends, FaClock, FaBook,FaSync,FaSearch } from 'react-icons/fa';  // Importamos íconos de react-icons
import ProgressBar from 'react-bootstrap/ProgressBar';


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
  const [loadingData, setLoadingData] = useState(false); // Estado para controlar la recarga
  const [selectedCursoStatus, setSelectedCursoStatus] = useState(''); // Estado para el filtro de estado de curso
  const [showExoneradoModal, setShowExoneradoModal] = useState(false); // Controla el modal de exonerado
  const [selectedExoneradoId, setSelectedExoneradoId] = useState(null); // Guarda el ID de la inscripción a exonerar
  const [showRetiradoModal, setShowRetiradoModal] = useState(false); // Estado para el modal de Retirado
  const [selectedRetiradoId, setSelectedRetiradoId] = useState(null); // Estado para el ID de inscripción
  const [centroOptions, setCentroOptions] = useState([]);
  const [cohorteOptions, setCohorteOptions] = useState([]);
  const [periodoOptions, setPeriodoOptions] = useState([]);
    const [statistics, setStatistics] = useState({});
      const [totalPages, setTotalPages] = useState(1); // Default to 1 page initially


    const [filters, setFilters] = useState({
            cedula_identidad: '',
            status_pay: '',
            status_curso: '',
            cohorte_id: '',
            centro_id: '',
        });


  useEffect(() => {
    setLoading(true);
    Promise.all([fetchFilterOptions(),getInscritos(), getCursoCod()]).finally(() => {
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
  const fetchFilterOptions = async () => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${endpoint}/filter-inscripciones`, { headers: { Authorization: `Bearer ${token}` } });

        setCentroOptions(response.data.centro);
        setCohorteOptions(response.data.cohorte);
        setPeriodoOptions(response.data.periodo);

    } catch (error) {
        setError('Error fetching filter options');
        console.error('Error fetching filter options:', error);
    }
};

const getInscritos = async (page = 1) => {
  try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${endpoint}/cursos_inscripcion-filtros/${cursoId}`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { ...filters, page }, // Incluye `page` y otros filtros en los parámetros
      });
      const estadisticas = response.data.estadisticas || {};
      setInscripciones(Array.isArray(response.data.datos.data) ? response.data.datos.data : []);
      setStatistics(estadisticas);
      setTotalPages(response.data.datos.last_page || 1); // Actualiza el total de páginas
  } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Error fetching data');
      setInscripciones([]);
      setStatistics({});
  }
};



  const getStatusPayColor = (status_pay) => {
    if (status_pay === '1') return 'red'; // No pagado
    if (status_pay === '2') return 'orange'; // En proceso
    if (status_pay === '3') return 'green'; // Pagado
    if (status_pay === '4') return 'blue'; // Culminado
    if (status_pay === '5') return '#fc53c4'; // Rosa claro en hexadecimal

    return 'gray'; // Desconocido
  };

  const getStatusCursoColor = (status_curso) => {
    if (status_curso === '1') return 'orange'; // No finalizado
    if (status_curso === '2') return 'green'; // Egresado/Certificado
    if (status_curso === '3') return 'red'; // Retirado
    return 'gray'; // Desconocido
};



const renderStatusCursoTriangle = (status_curso) => {
  const color = getStatusCursoColor(status_curso); // Usar la función correcta para el color
  return (
    <div
      style={{
        width: 10,
        height: 10,
        borderLeft: '6px solid transparent',    // Lado izquierdo del triángulo
        borderRight: '6px solid transparent',   // Lado derecho del triángulo
        borderBottom: `10px solid ${color}`,    // Base del triángulo, define el color
        display: 'inline-block',
        marginRight: '5px',
      }}
    ></div>
  );
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


  //
const handleMarkAsComplete = async () => {
  try {
    const token = localStorage.getItem('token');
    await axios.put(`${endpoint}/inscripcion_cursos/${selectedCompleteId}`, {
      status_curso: 2,
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    toast.success('El participante ha sido marcado como "Egresado/Certificado"');
    setFilteredInscripciones(
      filteredInscripciones.map(inscripcion =>
        inscripcion.id === selectedCompleteId ? { ...inscripcion, status_curso:2 } : inscripcion
      )
    );
    setShowCompleteModal(false); // Cierra el modal tras éxito
  } catch (error) {
    console.error('Error updating status_pay:', error);
    toast.error('Error al marcar como culminado');
    setShowCompleteModal(false);
  }
};


const handleMarkAsExonerado = async () => {
  try {
    const token = localStorage.getItem('token');
    await axios.put(`${endpoint}/inscripcion_cursos/${selectedExoneradoId}`, {
      status_pay: 5,
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    toast.success('El participante ha sido marcado como "Exonerado"');
    setFilteredInscripciones(
      filteredInscripciones.map(inscripcion =>
        inscripcion.id === selectedExoneradoId ? { ...inscripcion, status_pay: 5 } : inscripcion
      )
    );
    setShowExoneradoModal(false); // Cierra el modal tras éxito
  } catch (error) {
    console.error('Error updating status_pay:', error);
    toast.error('Error al marcar como exonerado');
    setShowExoneradoModal(false);
  }
};

// Función para marcar como retirado
const handleMarkAsRetirado = async () => {
  try {
    const token = localStorage.getItem('token');
    await axios.put(`${endpoint}/inscripcion_cursos/${selectedRetiradoId}`, {
      status_curso: 3, // Código para "Retirado"
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    toast.success('El participante ha sido marcado como "Retirado"');
    setFilteredInscripciones(
      filteredInscripciones.map(inscripcion =>
        inscripcion.id === selectedRetiradoId ? { ...inscripcion, status_curso: 3 } : inscripcion
      )
    );
    setShowRetiradoModal(false); // Cierra el modal tras éxito
  } catch (error) {
    console.error('Error updating status_curso:', error);
    toast.error('Error al marcar como retirado');
    setShowRetiradoModal(false);
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


  // Mostrar el modal para confirmar la eliminación
  const handleShowModal = (id) => {
    setSelectedId(id);  // Almacena el ID de la inscripción que se va a eliminar
    setShowModal(true); // Muestra el modal
  };

  const handleCloseModal = () => {
    setShowModal(false); // Cierra el modal
  };

  // Función para abrir el modal
const handleShowRetiradoModal = (id) => {
  setSelectedRetiradoId(id);
  setShowRetiradoModal(true);
};

// Función para cerrar el modal
const handleCloseRetiradoModal = () => {
  setShowRetiradoModal(false);
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
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
};

  const handlePageChange = (page) => {
    setCurrentPage(page);
    getInscritos(page);

};

  const loadData = async () => {
    setLoadingData(true); // Inicia el estado de carga
    try {
        await (getInscritos(),fetchFilterOptions()); // Espera a que getAllDatos haga la solicitud y actualice los datos
    } catch (error) {
        console.error('Error recargando los datos:', error); // Maneja el error si ocurre
    } finally {
        setLoadingData(false); // Detener el estado de carga cuando la solicitud haya terminado
    }
};

const estadoPago = statistics?.estadoPagos?.map(({ nombre, cantidad }) => {
  let color;

  if (nombre === "No pagado (Rojo)") color = "red"; // Naranja
  if (nombre === "En proceso (Naranja)") color = "#FFA500"; // Verde
  if (nombre === "Pagado (Verde)") color = "green"; // Rojo
  if (nombre === "Patrocinado (Azul)") color = "blue"; // Rojo
  if (nombre === "Exonerado (Rosado)") color = "#fc53c4"; // Rojo
  
 
  return{
  name: nombre,
  value: cantidad, // Clave que PieChart espera para los valores numéricos
  color
  };
});

const estadoCurso = statistics?.estadoCursos?.map(({ nombre, cantidad }) => {
  let color;
  if (nombre === "No finalizado") color = "#FFA500"; // Naranja
  if (nombre === "Egresado/Certificado") color = "green"; // Verde
  if (nombre === "Retirado") color = "#FF0000"; // Rojo

  return {
    name: nombre,
    value: cantidad,
    color,
  };
});
  const columns = ["Estado de Pago","Estado de Curso", "Cédula", "Fecha de Inscripción", "Nombres", "Apellidos", "Acciones Pago","Acciones Curso","Acciones"];

  const renderItem = (inscripcion) => (
    <tr key={inscripcion.id}>

      <td className="text-center">{renderStatusPayDot(inscripcion.status_pay)}</td>
      <td className="text-center">{renderStatusCursoTriangle(inscripcion.status_curso)}</td>
      <td>{inscripcion?.datos_identificacion?.cedula_identidad}</td>
      <td>{moment(inscripcion.fecha_inscripcion).format('YYYY-MM-DD')}</td>
      <td>{inscripcion?.datos_identificacion?.nombres}</td>
      <td>{inscripcion?.datos_identificacion?.apellidos}</td>
      <td>
      <div className="d-flex justify-content-center align-items-center" style={{ gap: '5px' }}>


        {/* Botón Exonerado */}
        {(userRole === 'admin' || userRole === 'superuser') && inscripcion.status_pay !== '5' && (
         <Button
         onClick={() => { setSelectedExoneradoId(inscripcion.id); setShowExoneradoModal(true); }}
         className="me-1"
         style={{
           backgroundColor: '#fc53c4', // Rosa
           color: 'white',
           border: 'none',
           padding: '5px 10px', // Ajuste de padding para hacer coincidir el tamaño
           fontSize: '14px', // Tamaño del texto similar a los otros botones
           width: '40px',     // Ajusta el ancho
           height: '40px',    // Ajusta la altura
           display: 'flex',
           alignItems: 'center',
           justifyContent: 'center',
           borderRadius: '5px'
         }}
         title='Exonerar Pago'
       >
         <i className="bi bi-coin"></i>
       </Button>

        )}
        </div>
        </td>
        <td>
        <div className="d-flex justify-content-center align-items-center" style={{ gap: '5px' }}>
        {/* Botón para marcar como culminado si el rol es 'admin' o 'superuser' y status_pay es 3 */}
        {(userRole === 'admin' || userRole === 'superuser') && (inscripcion.status_curso!=='2'  )  && (
          <Button variant="btn btn-success" onClick={() => handleShowCompleteModal(inscripcion.id)} className="me-1" title='Marcar como culminado'>
            <i className="bi bi-check-circle"></i>
          </Button>
        )}
        {/*
        Botón Retirado */}
         {(userRole === 'admin' || userRole === 'superuser') && (inscripcion.status_curso!=='2'  )  && (
        <Button
          onClick={() => handleShowRetiradoModal(inscripcion.id)}
          className="me-1"
          style={{
            backgroundColor: '#FF4A4A', // Rojo
            color: 'white',
            border: 'none',
            padding: '5px 10px',
            fontSize: '14px',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '5px'
          }}
          title='Retirar'
        >
          <i className="bi bi-x-lg"></i> {/* Icono de "X" */}
        </Button>
        )}
        </div>
      </td>
      <td>
      <div className="d-flex justify-content-center align-items-center" style={{ gap: '5px' }}>

      <Button variant="btn btn-info" onClick={() => navigate(`/inscritos/show/${inscripcion.id}`)} className="me-1" title='Ver más'>
          <i className="bi bi-eye"></i>
        </Button>
        {/* Botón para ver pagos */}
        <Button variant="btn btn-info" onClick={() => navigate(`/pagos/curso/${inscripcion.id}`)} className="me-1" title='Ver pagos'>
          <i className="bi bi-currency-exchange"></i>
        </Button>

        {/* Botón para editar si el rol es 'admin' */}
        {(userRole === 'admin' || userRole === 'superuser') && (
          <Button variant="btn btn-warning" onClick={() => navigate(`/inscritos/edit/${inscripcion.id}/${inscripcion.cedula_identidad}`)} className="me-1" title='Editar'>
            <i className="bi bi-pencil-fill"></i>
          </Button>
        )}
        {/* Botón para eliminar si el rol es 'admin' */}
        {userRole === 'admin' && (
          <Button variant="btn btn-danger" onClick={() => handleShowModal(inscripcion.id)} className="me-1" title='Eliminar'> 
            <i className="bi bi-trash3-fill"></i>
          </Button>
        )}
        </div>
      </td>
    </tr>
  );

  return (
    <div className="container-fluid " style={{ fontSize: '0.85rem' }}>
    <div className="stat-box mx-auto col-lg-11" style={{ maxWidth: '100%' }}>
        {/* Total de Inscritos */}
        <div className="stat-card" style={{  }}>
            <div className="stat-icon" style={{ fontSize: '14px', color: '#333', marginBottom: '1px' }}><FaUserFriends /></div>
            <div className="stat-number" style={{ color: 'rgba(255, 74, 74, 0.9)', fontSize: '1.8rem' }}>
              {statistics?.totalInscritos !== undefined ? statistics.totalInscritos : '0'}
            </div>
            <h4 style={{ fontSize: '1.1rem', color:'gray' }}>Total de Inscritos</h4>

        </div>

        {/* Promedio de Antigüedad */}
        <div className="stat-card" style={{
                    padding: '8px',
                    margin: '0 10px',
                    width: '22%',
                    position: 'relative',
                    backgroundColor: '#fff',
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                }}>

                    {/* Menor y Mayor Edad - Distribuidos a los lados */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',  // Distribuye menor a la izquierda y mayor a la derecha
                        fontSize: '0.8rem',  // Ajustamos el tamaño del texto
                        color: '#6c757d',
                        padding: '0 8px',  // Reducimos el padding para que esté más junto
                    }}>
                        <div style={{ color: '#5cb85c', fontWeight: 'bold' }}> {/* Color verde para menor */}
                            <span>↓ Menor:</span> {statistics?.menorEdad != undefined ? statistics?.menorEdad :'0'} años
                            
                        </div>
                        <div style={{ color: '#d9534f', fontWeight: 'bold' }}> {/* Color rojo para mayor */}
                            <span>↑ Mayor:</span> {statistics?.mayorEdad != undefined ? statistics?.mayorEdad :'0'} años
                        </div>
                    </div>
                  {/* Promedio de Edad */}
                    {statistics?.promedioEdad !== undefined && statistics?.promedioEdad !== null && (

                    <div className="stat-number" style={{
                        color: '#ffda1f',
                        fontSize: '1.7rem',  // Reducimos el tamaño de la fuente
                        fontWeight: 'bold',
                        textAlign: 'center',
                        marginBottom: '3px',  // Reducimos el margen
                    }}>
                        {statistics?.promedioEdad?.toFixed(0) || 'N/A'} Años
                    </div>
                    )}
                    <h4 style={{
                        fontSize: '0.9rem',  // Reducimos el tamaño del texto
                        color: '#6c757d',
                        textAlign: 'center',
                        marginBottom: '6px',  // Reducimos el margen inferior
                    }}>
                        Promedio de Edad
                    </h4>

                    {/* Barra de Progreso */}
                    {statistics?.promedioEdad !== undefined &&
                    statistics?.mayorEdad !== undefined &&
                    statistics?.promedioEdad !== null &&
                    statistics?.mayorEdad !== null && (
                    <div style={{ width: '75%', margin: '0 auto' }}>
                        <ProgressBar
                            now={(statistics.promedioEdad * 100) / statistics.mayorEdad}
                            variant="warning"
                            style={{
                                height: '8px',  // Reducimos la altura de la barra
                                borderRadius: '5px',
                                backgroundColor: '#f1f1f1'
                            }}
                        />
                    </div>)}
                </div>
    </div>

    <div className="row" style={{ marginTop: '10px' }}>
      {/* Columna para la tabla */}
      <div className="col-lg-11 mx-auto"> {/* Agregamos 'mx-auto' para centrar */}
          <div className="card-box" style={{ padding: '20px', width: '100%', margin: '0 auto' }}>
          <div className="d-flex justify-content-between align-items-center mb-3" style={{ gap: '0px' }}>
          <h1>Inscritos del Curso {cursoCod}</h1>
        <div className="d-flex align-items-center justify-content-between"> {/* Alineación horizontal */}

          <Form.Control
              type="text"
              placeholder="Buscar por Cédula"
              value={filters.cedula_identidad} // Conecta el campo de cédula al estado de filtros
              name="cedula_identidad"
              onChange={handleFilterChange} // Usa handleFilterChange para actualizar el valor
              className="me-2"
          />
                  <Button
                  variant="info me-2"
                  onClick={loadData}
                  disabled={loadingData} // Deshabilita el botón si está cargando
                  style={{ padding: '5px 10px', width: '120px' }} // Ajusta padding y ancho
                  title='Recargar datos'
              >
                  {/* Icono de recarga */}
                  {loadingData ? (
                  <FaSync className="spin" /> // Ícono girando si está cargando
                  ) : (
                  <FaSync />
                  )}
              </Button>
              <Button
                  variant="info me-2"
                  onClick={getInscritos}
                  style={{ padding: '5px 10px', width: '120px' }} // Ajusta padding y ancho
                  title='Buscar'
              >
                  <FaSearch className="me-1" /> {/* Ícono de lupa */}
              </Button>
          {(userRole === 'admin' || userRole === 'superuser' ) && (
            <Button variant="btn custom" onClick={() => navigate(`/inscribir/${cursoId}`)} className="btn-custom me-2" style={{ fontSize: '0.9rem' }} title='Nueva Inscripción'>
              <i className="bi bi-person-plus-fill"></i> Nuevo
            </Button>
          )}

          <Button variant="secondary" onClick={() => navigate(-1)} className="secondary" style={{ fontSize: '0.9rem' }} title='Volver'>
            <i className="bi bi-arrow-90deg-left"></i>
          </Button>
        </div>
      </div>

        {/* Alinear el buscador y el filtro en la misma fila con el nuevo botón a la derecha */}
    <div className="d-flex justify-content-between align-items-center mb-3">
      <div className="d-flex align-items-center" style={{ gap: '10px' }}> {/* Ajusta el espacio entre el buscador y el filtro */}

        <Form.Select
            name="centro_id"
            value={filters.centro_id}
            onChange={handleFilterChange}
            className="me-2"
        >
            <option value="">Centro</option>
            {centroOptions?.map(option => (
                <option key={option.id} value={option.id}>{option.descripcion}</option>
            ))}

        </Form.Select>
        <Form.Select
            name="cohorte_id"
            value={filters.cohorte_id}
            onChange={handleFilterChange}
            className="me-2"
        >
            <option value="">Cohorte</option>
            {cohorteOptions?.map(option => (
                <option key={option.id} value={option.id}>{option.descripcion}</option>
            ))}

        </Form.Select>
        <Form.Select
            name="periodo_id"
            value={filters.periodo_id}
            onChange={handleFilterChange}
            className="me-2"
        >
            <option value="">Periodo</option>
            {periodoOptions?.map(option => (
                <option key={option.id} value={option.id}>{option.descripcion}</option>
            ))}

        </Form.Select>
        <Form.Select
          name="status_pay"
          value={filters.status_pay}
          onChange={handleFilterChange}
          className="me-2"
          style={{ width: 'auto' }}
        >
          <option value="">Estado de pago</option>
          <option value="1">No pagado (Rojo)</option>
          <option value="2">En proceso (Naranja)</option>
          <option value="3">Pagado (Verde)</option>
          <option value="4">Patrocinado (Azul)</option>
          <option value="5">Exonerado (Rosado)</option>
        </Form.Select>
        <Form.Select
          name="status_curso"
          value={filters.status_curso}
          onChange={handleFilterChange}
          className="me-2"
          style={{ width: 'auto' }}
        >
          <option value="">Estado de curso</option>
          <option value="1">No Finalizado (Naranja)</option>
          <option value="2">Egresado/Certificado (Verde)</option>
          <option value="3">Retirado (Rojo)</option>
        </Form.Select>
        


      </div>


    </div>


      {/* Leyenda de colores */}
      <div className="status-legend d-flex justify-content-start mb-3">
        <span className="status-dot red"></span> No pagado (Rojo)
        <span className="status-dot orange ms-3"></span> En proceso (Naranja)
        <span className="status-dot green ms-3"></span> Pagado (Verde)
        <span className="status-dot blue ms-3"></span> Patrocinado (Azul)
        <span className="status-dot pink ms-3"></span> Exonerado (Rosado)
      </div>
      <div className="status-legend d-flex justify-content-start mb-3">
        <span className="status-triangle not-finalized"></span> No Finalizado (Naranja)
        <span className="status-triangle graduated ms-3"></span> Egresado/Certificado (Verde)
        <span className="status-triangle withdrawn ms-3"></span> Retirado (Rojo)
      </div>



      {error && <Alert variant="danger">{error}</Alert>}

      {/* Tabla paginada */}


      <PaginationTable
          data={inscripciones}
          itemsPerPage={itemsPerPage}
          columns={columns}
          renderItem={renderItem}
          currentPage={currentPage}
          onPageChange={handlePageChange}
          totalPages={totalPages}  // <--- Añade esta línea si aún no está
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
    {/* Modal Exonerado */}
    <Modal show={showExoneradoModal} onHide={() => setShowExoneradoModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Exoneración</Modal.Title>
        </Modal.Header>
        <Modal.Body>¿Estás seguro de que deseas marcar al participante como "Exonerado"?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowExoneradoModal(false)}>
            Cancelar
          </Button>
          <Button
          variant="success"
            onClick={handleMarkAsExonerado}
            style={{
              backgroundColor: '#fc53c4', // Rosa
              color: 'white',
              border: 'none'
            }}
          >
            Confirmar Exoneración
          </Button>
        </Modal.Footer>
      </Modal>

       {/* Modal Retirado      */}
      <Modal show={showRetiradoModal} onHide={handleCloseRetiradoModal}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar retiro</Modal.Title>
        </Modal.Header>
        <Modal.Body>¿Estás seguro de que deseas marcar este participante como "Retirado"?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseRetiradoModal}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleMarkAsRetirado}>
            Marcar como retirado
          </Button>
        </Modal.Footer>
      </Modal>





      <ToastContainer />
    </div>
    <div className="col-lg-12 d-flex justify-content-between flex-wrap" style={{ gap: '20px', marginTop: '10px' }}>
            <div className="chart-box" style={{ flex: '1 1 45%', maxWidth: '45%', marginRight: '10px' }}>
                    <h4 style={{ fontSize: '1.2rem' }}>Participantes por Estado de Pago</h4>
                    {estadoPago!== undefined && (
                    <ResponsiveContainer width="100%" height={400}>
                      <PieChart>
                        <Pie
                          data={estadoPago}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={120}
                          fill="#8884d8"
                          label
                        >
                          {estadoPago.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>  
                    )} 
            </div>

            <div className="chart-box" style={{ flex: '1 1 45%', maxWidth: '45%', marginRight: '10px' }}>
            <h4 style={{ fontSize: '1.2rem' }}>Participantes por Estado de Curso</h4>
            {statistics?.totalInscritos !== undefined && (
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={estadoCurso}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}      // Ajuste para hacer dona
                    outerRadius={120}
                    fill="#8884d8"
                    label
                  >
                    {estadoCurso.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
            </div>
        </div>
        
    </div>

        </div>


    </div>
  );
};

export default ShowInscritos;
