import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Table from 'react-bootstrap/Table';
import { useNavigate } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import { Modal,Card } from 'react-bootstrap';
import Form from 'react-bootstrap/Form';
import './ShowCursos.css';
import { useLoading } from '../../components/LoadingContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PaginationTable from '../../components/PaginationTable';
import { ResponsiveContainer,PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,PolarRadiusAxis,PolarAngleAxis,Radar,RadarChart,PolarGrid } from 'recharts';
import { FaUserFriends, FaClock, FaBook,FaSync,FaSearch } from 'react-icons/fa';  // Importamos íconos de react-icons
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import { FaExpand, FaCompress } from 'react-icons/fa'; // Íconos para expandir/contraer
import { motion } from 'framer-motion';

const endpoint = 'http://localhost:8000/api';
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];


const ShowCursos = () => {
    const [cursos, setCursos] = useState([]);
    const [searchCurso, setSearchCurso] = useState('');
    const [searchCod, setSearchCod] = useState(''); // Nuevo estado para el buscador por COD
    const [areaOptions, setAreaOptions] = useState([]);
    const [selectedArea, setSelectedArea] = useState('');
    const [error, setError] = useState(null);
    const { setLoading } = useLoading();
    const navigate = useNavigate();
    const userRole = localStorage.getItem('role');
    const itemsPerPage = 8;
    const [showModal, setShowModal] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [inscripciones, setInscripciones] = useState(0);
 

    const [loadingData, setLoadingData] = useState(false); // Estado para controlar la recarga
    const [currentPage, setCurrentPage] = useState(1);  // Estado para la página actual
    const [unidadOptions, setUnidadOptions] = useState([]);


    const [nivelOptions, setNivelOptions] = useState([]);


    const [tipoProgramaOptions, setTipoProgramaOptions] = useState([]);
    const [modalidadOptions, setModalidadOptions] = useState([]);
    const [grupoOptions, setGrupoOptions] = useState([]);
    const [statistics, setStatistics] = useState({});

    const [totalCursos, setTotalCursos] = useState(0);
    const [totalHoras, setTotalHoras] = useState(0);
    const [totalInscritos, setTotalInscritos] = useState(0);
    const [totalCostos, setTotalCostos] = useState(0);
    const [inscritosAporte, setInscritosAporte] = useState(0);
    const [inscritosPatrocinados, setInscritosPatrocinados] = useState(0);
    const [cursosPorArea, setCursosPorArea] = useState([]);
    const [cursosPorNivel, setCursosPorNivel] = useState([]);
    const [porcentajeCursosPorUnidad, setPorcentajeCursosPorUnidad] = useState([]);
    const [cursosPorTipoPrograma, setCursosPorTipoPrograma] = useState([]);
    const [cursosPorModalidad, setCursosPorModalidad] = useState([]);
    const [inscritosPorStatusPay, setInscritosPorStatusPay] = useState({});
    const [inscritosPorStatusCurso, setInscritosPorStatusCurso] = useState({});
    const [mayorIngreso, setMayorIngreso] = useState({});
    const [totalPages, setTotalPages] = useState(1);  // Agregar estado para el total de páginas
    const [showModalInfo, setShowModalInfo] = useState(false);
      const [mostrarSoloTabla, setMostrarSoloTabla] = useState(false);
    
        const toggleTablaExpandida = () => {
            setMostrarSoloTabla(prevState => !prevState);
        };
    

    const [filters, setFilters] = useState({
      curso_descripcion: '',
      cod: '',
      area_id: '',
      unidad_id: '',
      nivel_id: '',
      modalidad_id: '',
      tipo_programa_id: '',
      grupo_id:'',
      externo:false,
      
  });


  useEffect(() => {
    const fetchData = async () => {
       setLoading(true);
       setCursos([]); // Limpia los datos antes de la nueva carga
       setInscripciones([]); 
       
       try {
          const [{ cursosData, metricsData }, filterOptionsData] = await Promise.all([
             getCursosWithMetrics(),
             fetchFilterOptions(),
          ]);
 
          setCursos(cursosData);
          const { areaOptions, unidadOptions, nivelOptions, tipoProgramaOptions, modalidadOptions,grupoOptions } = filterOptionsData;
          setAreaOptions(areaOptions);
          setUnidadOptions(unidadOptions);
          setNivelOptions(nivelOptions);
          setTipoProgramaOptions(tipoProgramaOptions);
          setModalidadOptions(modalidadOptions);
          setGrupoOptions(grupoOptions);
 
       } catch (error) {
          console.error('Error al obtener los datos:', error);
          setError('Error al obtener los datos');
       } finally {
          setLoading(false);
       }
    };
 
    fetchData();
 }, []);  // <- Aquí agregamos `filters` como dependencia para que se recargue
 
    
 const handlePageChange = (page) => {
  if (page !== currentPage) { // Solo cambiar si la página es diferente
    setCurrentPage(page);
  }
};

// Agrega un useEffect para disparar getCursosWithMetrics cuando currentPage cambie
useEffect(() => {
  getCursosWithMetrics(currentPage);
}, [currentPage]);


    // Ahora las funciones devuelven los datos y actualizamos el estado en el primer useEffect
    const getCursosWithMetrics = async () => {
      try {
          const token = localStorage.getItem('token');
          const response = await axios.get(`${endpoint}/cursos-estadisticas`, {
              headers: {
                  Authorization: `Bearer ${token}`,
              },
              params: { ...filters, page: currentPage }, // Incluye el número de página en los parámetros
          });
  
          const cursosData = response.data.cursos.data || []; // Datos de los cursos con paginación
          const metricsData = response.data.metrics || {}; // Métricas calculadas en el backend, con valor predeterminado
          setCursos(cursosData);
          setStatistics(metricsData);
          
  
          setTotalPages(response.data.cursos.last_page || 1);

  
          // Asignar los datos obtenidos a los estados
          setTotalCursos(metricsData.totalCursos || 0);
          setTotalHoras(metricsData.totalHoras || 0);
          setTotalInscritos(metricsData.totalInscritos || 0);
          setTotalCostos(metricsData.totalCostos || 0);
          setInscritosAporte(metricsData.inscritosAporte || 0);
          setInscritosPatrocinados(metricsData.inscritosPatrocinados || 0);
          setCursosPorArea(metricsData.cursosPorArea || []);
          setCursosPorNivel(metricsData.cursosPorNivel || []);
          setPorcentajeCursosPorUnidad(metricsData.porcentajeCursosPorUnidad || []);
          setCursosPorTipoPrograma(metricsData.cursosPorTipoPrograma || []);
          setCursosPorModalidad(metricsData.cursosPorModalidad || []);
          setInscritosPorStatusPay(metricsData.inscritosPorStatusPay || {});
          setInscritosPorStatusCurso(metricsData.inscritosPorStatusCurso || {});
  
          const cursosMayorIngresoData = response.data.metrics.cursosMayorIngreso || [];
          const formattedData = cursosMayorIngresoData.map(curso => ({
              name: curso.curso_descripcion,
              ingresos: curso.ingresos
          }));
          
          setMayorIngreso(formattedData);
  
          return { cursosData, metricsData };
      } catch (error) {
          console.error('Error fetching data:', error);
          return { cursosData: [], metricsData: {} };
      }
  };
  

    
    const fetchFilterOptions = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${endpoint}/filtros-cursos`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    // Desestructuramos los datos que vienen en la respuesta
    const { area, unidad, nivel, tipo_programa, modalidad,grupo } = response.data;

    // Retornamos las opciones en un solo objeto
    return {
      areaOptions: area,
      unidadOptions: unidad,
      nivelOptions: nivel,
      tipoProgramaOptions: tipo_programa,
      modalidadOptions: modalidad,
      grupoOptions:grupo,
    };
  } catch (error) {
    console.error('Error fetching filter options:', error);
    return {
      areaOptions: [],
      unidadOptions: [],
      nivelOptions: [],
      tipoProgramaOptions: [],
      modalidadOptions: [],
      grupoOptions:[],
    };
  }
};

const handleFilterChange = (e) => {
  const { name, value } = e.target;
  setFilters(prev => ({ ...prev, [name]: value }));
};


    const handleShowModal = (id) => {
        setSelectedId(id);  // Almacena el ID del participante que se va a eliminar
        setShowModal(true); // Muestra el modal
    };
    
    const handleCloseModal = () => {
        setShowModal(false); // Cierra el modal
    };

    
    const deleteCursos = async () => {
        const token = localStorage.getItem('token');
        try {
            await axios.delete(`${endpoint}/cursos/${selectedId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            toast.success('Curso eliminado con Éxito');
            getCursosWithMetrics();
            setShowModal(false); // Cierra el modal tras la eliminación exitosa
        } catch (error) {
            setError('Error deleting data');
            console.error('Error deleting data:', error);
            toast.error('Error al eliminar Curso');
            setShowModal(false); // Cierra el modal tras el error
        }
    };

    const printInfo = async (filters) => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          alert("Token no encontrado.");
          return;
        }
    
        // Realizar la solicitud GET a la ruta que genera los datos en JSON
        const response = await axios.get(`${endpoint}/cursos-estadisticas-print`, {
          headers: { Authorization: `Bearer ${token}` },
          params: filters, // Pasamos los filtros a la ruta
        });
    
        // Extraer los datos principales y las estadísticas
        const jsonData = response.data.cursos; // Clave 'cursos'
        const estadisticasData = response.data.metrics; // Clave 'metrics'
    
        if (!jsonData || jsonData.length === 0) {
          alert("No hay datos para exportar.");
          return;
        }
    
        // Convertir los datos principales a una hoja
        const worksheet1 = XLSX.utils.json_to_sheet(jsonData); // Hoja de datos
        const workbook = XLSX.utils.book_new(); // Crea un libro nuevo
        XLSX.utils.book_append_sheet(workbook, worksheet1, "Datos"); // Añade la hoja al libro
    // Preparar las estadísticas para convertirlas
      const estadisticasArray = [];

      // Iterar sobre las estadísticas y descomponerlas
      Object.entries(estadisticasData).forEach(([key, value]) => {
      if (typeof value === "object" && !Array.isArray(value)) {
          // Si el valor es un objeto, descomponer sus datos (por ejemplo, participantesPorEstado, nivelesInstruccion)
          Object.entries(value).forEach(([subKey, subValue]) => {
          if (typeof subValue === "object") {
              estadisticasArray.push({
              Estadística: `${key} - ${subKey}`,
              Cantidad: subValue.count || 0,
              Porcentaje: subValue.percentage ? `${subValue.percentage.toFixed(2)}%` : "0%",
              });
          } else {
              estadisticasArray.push({
              Estadística: `${key} - ${subKey}`,
              Valor: subValue,
              });
          }
          });
      } else {
          // Si es un valor simple, agregarlo directamente
          estadisticasArray.push({
          Estadística: key,
          Valor: value,
          });
      }
      });

      // Convertir las estadísticas a una hoja
      const worksheet2 = XLSX.utils.json_to_sheet(estadisticasArray);
      XLSX.utils.book_append_sheet(workbook, worksheet2, "Estadísticas"); // Añade la segunda hoja
              // Generar el archivo Excel
              const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
          
              // Crear un Blob y guardarlo como archivo
              const blob = new Blob([excelBuffer], {
                  type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
              });
              saveAs(blob, "programas_estadisticas.xlsx");
              } catch (error) {
              console.error("Error al generar el archivo Excel", error);
              alert("Hubo un error al generar el archivo Excel");
              }
          };
    
    

    const handlePrint = async () => {
      setShowModalInfo(false); // Cerrar el modal
      await printInfo(filters); // Llamar a la función de impresión con los filtros
    };




    // Función para cargar datos
    const loadData = async () => {
      setLoadingData(true); // Inicia el estado de carga
      try {
          await (getCursosWithMetrics(),fetchFilterOptions()); // Espera a que getAllDatos haga la solicitud y actualice los datos
      } catch (error) {
          console.error('Error recargando los datos:', error); // Maneja el error si ocurre
      } finally {
          setLoadingData(false); // Detener el estado de carga cuando la solicitud haya terminado
      }
  };

    // Animating the numbers from 0 to the final value
    const animateValue = (start, end, setState, duration = 2000) => {
      let startTime = null;

      const animate = (currentTime) => {
          if (!startTime) startTime = currentTime;
          const progress = currentTime - startTime;
          const value = Math.min(Math.floor((progress / duration) * (end - start) + start), end);
          setState(value);

          if (progress < duration) {
              requestAnimationFrame(animate);
          }
      };

      requestAnimationFrame(animate);
  };

  const pieChartDataUnidad = Object.entries(porcentajeCursosPorUnidad).map(([name, value]) => ({
    name,
    value,
  }));


  const AreaGraphic = Object.entries(cursosPorArea).map(([name, value]) => ({
    name,
    value,
  }));
  const NivelGraphic = Object.entries(cursosPorNivel).map(([name, value]) => ({
    name,
    value,
  }));
  const TipoProgramaGraphic = Object.entries(cursosPorTipoPrograma).map(([name, count]) => ({
    name,
    count,
}));

  const ModalidadGraphic = Object.entries(cursosPorModalidad).map(([name, count]) => ({
    name,
    count,
  }));
  // Define la data en formato adecuado para el PieChart
const participantsByAportePatrocinado = [
  { name: 'Realiza Aporte', value: inscritosAporte },
  { name: 'Es Patrocinado', value: inscritosPatrocinados },
];



    const columns = ["COD", "Descripción", "Horas", "Fecha de Inicio", "Costo","Cuotas","N° Inscritos", "Acciones"];

    const renderItem = (curso) => (
        
        <tr key={curso.curso_id} >
            <td className='col-cods'>{curso.cod}</td>
            <td className='col-descripcions'>{curso.curso_descripcion}</td>
            <td className='col-horass'>{curso.cantidad_horas}</td>
            <td className='col-fechas'>{curso.fecha_inicio}</td>
            <td className='col-costos'>{curso.costo} $</td>
            <td className='col-cuotas'>{curso.cuotas} </td>
            <td className='col-inscritos'>{curso.num_inscritos}</td>
            <td>
            <div className="d-flex justify-content-center align-items-center">
                  
                    <Button variant="btn btn-info" onClick={() => navigate(`/cursos/${curso.curso_id}`)} className="me-2" title="Ver más">
                        <i className="bi bi-eye"></i>
                    </Button>
                    <Button variant="btn btn-info" onClick={() => navigate(`/inscritos/${curso.curso_id}`)} className="me-2" title="Ver inscritos">
                        <i className="bi bi-person-lines-fill"></i>
                    </Button>
                    {/* Botón para ver pagos */}
                    <Button variant="btn btn-info" onClick={() => navigate(`/pagos/programa/${curso.curso_id}`)} className="me-1" title="Ver Pagos">
                      <i className="bi bi-currency-exchange"></i>
                    </Button>
                    {userRole === 'admin' || userRole === 'superuser'  || userRole === 'pagos' ? (
                        <>
                            <Button variant="btn btn-warning" onClick={() => navigate(`/cursos/${curso.curso_id}/edit`)} className="me-2" title="Editar Unidad Curricular">
                                <i className="bi bi-pencil-fill"></i>
                            </Button>

                            <Button variant="btn btn-warning" onClick={() => navigate(`/cursos/${curso.curso_id}/pagos`)} className="me-2" title="Editar Costo">
                                <i className="bi bi-coin"></i>
                            </Button>
                            
                        </>
                    ) :null}
                      {userRole === 'admin'  || userRole === 'superuser' ? (
                        <>
                            <Button variant="btn btn-success" onClick={() => navigate(`/inscribir/${curso.curso_id}`)} className="me-2" title="Inscribir Participante">
                                <i className="bi bi-person-plus-fill"></i>
                            </Button>
                        </>
                    ) :null}
                    
                    {userRole === 'admin' && (
                        <Button variant="btn btn-danger" onClick={() => handleShowModal(curso.curso_id)} className="me-2" title="Eliminar">
                            <i className="bi bi-trash3-fill"></i>
                        </Button>
                    )}
                </div>
            </td>
        </tr>
    );
   
    return (
      <div className="container-fluid mt-2" style={{ fontSize: '0.85rem' }}>
            <motion.div 
                initial={{ opacity: 1, maxHeight: "500px" }} // Establece una altura máxima inicial
                animate={{
                    opacity: mostrarSoloTabla ? 0 : 1,
                    maxHeight: mostrarSoloTabla ? 0 : "500px", // Reduce la altura en transición
                }}
                transition={{ duration: 0.5, ease: "easeInOut" }} // Animación más fluida
                style={{ overflow: "hidden" }} // Evita que los elementos internos se muestren fuera de la caja
            >
       <div className="stat-box d-flex justify-content-between" style={{ maxWidth: '100%' }}> {/* Limitar el ancho máximo */}
        <div className="stat-card" style={{ padding: '5px', margin: '0 10px', width: '22%' }}> {/* Reducir el ancho a 22% */}
          <div className="stat-icon"><FaBook /></div>
          <div className="stat-number" style={{ color: '#58c765', fontSize: '1.2rem' }}>{totalCursos}</div>
          <div className="stat-label">Total de Programas</div>
        </div>
        <div className="stat-card" style={{ padding: '5px', margin: '0 10px', width: '22%' }}>
        <div className="stat-icon"><FaUserFriends /></div>
        <div className="stat-number" style={{ color: '#ffda1f', fontSize: '1.2rem' }}>{totalInscritos}</div> {/* Total de inscritos */}
        <div className="stat-label">Total de Inscritos</div>
      </div>

      <div className="stat-card" style={{ padding: '5px', margin: '0 10px', width: '22%' }}>
        <div className="stat-icon"><FaClock /></div>
        <div className="stat-number" style={{ color: '#ffda1f', fontSize: '1.2rem' }}>{totalHoras}</div> {/* Total de horas */}
        <div className="stat-label">Total de Horas</div>
      </div>
        <div className="stat-card" style={{ padding: '5px', margin: '0 10px', width: '22%' }}> {/* Reducir el ancho a 22% */}
          <ResponsiveContainer width="100%" height={120}>
            <PieChart>
              <Pie
                data={participantsByAportePatrocinado}
                dataKey="value"
                startAngle={180}
                endAngle={0}
                cx="50%"
                cy="70%"
                outerRadius="70%"
                fill="#8884d8"
                label={({ name, value }) => ` ${value} ${name}`}
                labelLine={true}
              >
                <Cell key="RealizaAporte" fill="#8884d8" />
                <Cell key="EsPatrocinado" fill="#82ca9d" />
              </Pie>
             
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>

        </div>
      </div>
      </motion.div>


    
        <div className="row mt-2">
            <motion.div
                      initial={{ width: "75%" }}
                      animate={{ width: mostrarSoloTabla ? "100%" : "75%" }}
                      transition={{ duration: 0.5 }}
                  >
          {/* Columna para la tabla */}
          
            <div className="card-box" style={{ padding: '10px' }}> {/* Reduce padding de la tabla */}
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 style={{ fontSize: '1.8rem' }}>Unidad Curricular</h2>
                <div className="d-flex align-items-center">
                <Button 
                      variant="info me-2" 
                      onClick={toggleTablaExpandida} 
                      style={{ padding: '5px 15px' }}
                      title={mostrarSoloTabla ? "Mostrar Todo" : "Modo Tabla Expandida"}
                  >
                      {mostrarSoloTabla ? <FaCompress /> : <FaExpand />}
                  </Button>
                  <Form.Control
                    name="curso_descripcion"
                    type="text"
                    placeholder="Buscar por nombre de curso"
                    value={filters.curso_descripcion}
                    onChange={handleFilterChange}
                    className="me-2"
                    style={{ fontSize: '0.9rem' }}
                  />

                  <Button
                    variant="info me-2"
                    onClick={loadData}
                    disabled={loadingData} // Deshabilita el botón si está cargando
                    style={{ padding: '5px 10px', width: '120px' }} // Ajusta padding y ancho
                    title="Recargar datos"
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
                      onClick={getCursosWithMetrics} // Cargar datos usando los filtros actuales
                      style={{ padding: '5px 10px', width: '120px' }}
                      title="Buscar"
                  >
                      <FaSearch className="me-1" />
                  </Button>
                  <Button
                      variant="btn btn-info"
                      onClick={() => setShowModalInfo(true)} // Abrir el modal
                      className="me-2"
                      title="Exportar en Excel"
                  >
                      <i className="bi bi-printer-fill"></i> {/* Icono de impresora */}
                  </Button>

                  {userRole === 'admin' || userRole === 'superuser' ? (
                    <Button variant="btn custom" onClick={() => navigate('/cursos/create')} className="btn-custom" style={{ fontSize: '0.9rem' }} title="Crear Unidad Curricular" >
                      <i className="bi bi-book-half me-2"></i> Nuevo
                    </Button>
                  ) : null}
                </div>
              </div>
    
              {/* Filtros */}
              
              <div className="d-flex ">
                <Form.Control
                  name="cod"
                  type="text"
                  placeholder="Buscar por COD"
                  value={filters.cod}
                  onChange={handleFilterChange}
                  className="me-2"
                  style={{ fontSize: '0.9rem' }}
                  
                />
                <Form.Select
                  name="area_id"
                  value={filters.area_id}
                  onChange={handleFilterChange}
                  className="me-2"
                  style={{ fontSize: '0.9rem' }}
                >
                  <option value="">Filtrar por Área</option>
                  {areaOptions.map(option => (
                    <option key={option.id} value={option.id}>{option.descripcion}</option>
                  ))}
                </Form.Select>

                <Form.Select
                name="unidad_id"
                  value={filters.unidad_id}
                  onChange={handleFilterChange}
                  className="me-2"
                  style={{ fontSize: '0.9rem' }}
                >
                  <option value="">Filtrar por Unidad</option>
                  {unidadOptions.map(option => (
                    <option key={option.id} value={option.id}>{option.descripcion}</option>
                  ))}
                </Form.Select>
                

                <Form.Select
                  name="nivel_id"
                  value={filters.nivel_id}
                  onChange={handleFilterChange}
                  className="me-2"
                  style={{ fontSize: '0.9rem' }}
                >
                  <option value="">Filtrar por Nivel</option>
                  {nivelOptions.map(option => (
                    <option key={option.id} value={option.id}>{option.descripcion}</option>
                  ))}
                </Form.Select>

                

                <Form.Select
                  name="modalidad_id"
                  value={filters.modalidad_id}
                  onChange={handleFilterChange}
                  className="me-2"
                  style={{ fontSize: '0.9rem' }}
                >
                  <option value="">Filtrar por Modalidad</option>
                  {modalidadOptions.map(option => (
                    <option key={option.id} value={option.id}>{option.descripcion}</option>
                  ))}
                </Form.Select>

                <Form.Select
                  name="grupo_id"
                  value={filters.grupo_id}
                  onChange={handleFilterChange}
                  className="me-2"
                  style={{ fontSize: '0.9rem' }}
                >
                  <option value="">Filtrar por Grupo</option>
                  {grupoOptions.map(option => (
                    <option key={option.id} value={option.id}>{option.descripcion}</option>
                  ))}
                </Form.Select>

              </div>
    
              {/* Tabla paginada */}
              <PaginationTable 
                  data={cursos}  // Datos filtrados
                  itemsPerPage={itemsPerPage}
                  columns={columns}
                  renderItem={renderItem}
                  currentPage={currentPage}  // Página actual
                  onPageChange={handlePageChange}  // Función para cambiar de página
                  totalPages={totalPages}  // Total de páginas
              />

              

            
          </div>
          </motion.div>
          {!mostrarSoloTabla && (
    
          <div className="col-lg-3" style={{ marginLeft: '-100px' }}> {/* Reduce espacio entre columnas */}
            <div className="chart-box">
              <h4 style={{ fontSize: '1.2rem' }}>Cursos por Área</h4>
              <ResponsiveContainer width="100%" height={280}>
              <PieChart >
                <Pie
                  data={AreaGraphic}
                  cx={170}
                  cy={120}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => ` ${(percent * 100).toFixed(0)}%`}
                >
                  {AreaGraphic.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend/>
              </PieChart>
              
              </ResponsiveContainer>
            </div>
    
            <div className="chart-box mt-2">
            <h4 style={{ fontSize: '1.2rem' }}>Comparación por Nivel</h4>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={NivelGraphic}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#8884d8" name="Cantidad de Cursos" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          </div>
          )}
        </div>
          <motion.div 
                    initial={{ opacity: 1, height: "auto" }}
                    animate={{ opacity: mostrarSoloTabla ? 0 : 1, height: mostrarSoloTabla ? 0 : "auto" }}
                    transition={{ duration: 0.5 }}
                >
         {/* Gráfica de Estado de Pagos justo debajo de la tabla */}
         <div className="col-lg-12 d-flex  mt-2 justify-content-between"> {/* Añadido justify-content-between para separar */} 
                <div className="chart-box" style={{ flex: '1 1 30%', maxWidth: '30%', marginRight: '10px' }}>
                <h4 style={{ fontSize: '1.2rem' }}>Porcentaje por Unidad</h4>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        // data={pieChartDataUnidad}
                        cx="50%"
                        cy="50%" // Posiciona el centro
                        innerRadius={60} // Agujero del centro
                        outerRadius={80} // Radio externo
                        fill="#8884d8"
                        paddingAngle={2}
                        dataKey="value"
                        data={pieChartDataUnidad}

                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`} // Mostrar nombre y porcentaje
                      >
                        {pieChartDataUnidad.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>

                </div>
                <div className="chart-box" style={{ flex: '1 1 30%', maxWidth: '30%', marginRight: '10px' }}>
                  <h4 style={{ fontSize: '1.2rem' }}>Comparación por Tipo de Programa</h4>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart 
                      data={TipoProgramaGraphic} 
                      layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis
                          type="category"
                          dataKey="name"
                          width={70} // Aumenta el ancho del eje Y
                          tick={{ fontSize: 11 }} // Ajusta el tamaño de la fuente
                        />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" fill="#FF8042" stroke="#FF5722" barSize={20} name="Cantidad de Cursos" />
                      </BarChart>
                    </ResponsiveContainer>

                </div>
                <div className="chart-box" style={{ flex: '1 1 30%', maxWidth: '30%', marginRight: '10px' }}>
                  <h4 style={{ fontSize: '1.2rem' }}>Comparación por Modalidad</h4>
                      <ResponsiveContainer width="100%" height={300}>
                        <RadarChart data={ModalidadGraphic}>
                          <PolarGrid />
                          <PolarAngleAxis dataKey="name" tick={{ fontSize: 12 }} />
                          <PolarRadiusAxis angle={30} domain={[0, 'auto']} />
                          <Radar
                            name="Cantidad de Cursos"
                            dataKey="count"
                            stroke="#FF8042"
                            fill="#FF8042"
                            fillOpacity={0.6}
                          />
                          <Tooltip />
                          <Legend />
                        </RadarChart>
                      </ResponsiveContainer>
                </div>
              </div>

              {/* Gráfica de Estado de Pagos justo debajo de la tabla */}
              <div className="col-lg-12 d-flex  mt-2 justify-content-between"> {/* Añadido justify-content-between para separar */} 
                <div className="chart-box" style={{ flex: '1 1 50%', maxWidth: '50%', marginRight: '10px' }}>
                  <h4 style={{ fontSize: '1.2rem', textAlign: 'flex' }}>Estado de Pagos</h4>
                  <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={[
                    { name: 'No Pagado', value: inscritosPorStatusPay[1], fill: '#FF0000' },
                    { name: 'Pago Inscripción Completo', value: inscritosPorStatusPay[2], fill: '#FFA500' },
                    { name: 'Pago Inscripción y Cuota Completo', value: inscritosPorStatusPay[3], fill: '#008000' },
                    { name: 'Patrocinado', value: inscritosPorStatusPay[4], fill: '#0000FF' },
                    { name: 'Exonerado', value: inscritosPorStatusPay[5], fill: '#FF69B4' }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" barSize={30} />
                  </BarChart>

                  </ResponsiveContainer>

                </div>
                <div className="chart-box" style={{ flex: '1 1 50%', maxWidth: '50%', marginRight: '10px' }}>
                <h4 style={{ fontSize: '1.2rem', textAlign: 'flex' }}>Estado de Programas</h4>
                  <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={[
                    { name: 'No Finalizado', value: inscritosPorStatusCurso[1], fill: '#FFA500' },
                    { name: 'Egresado/Certificado', value: inscritosPorStatusCurso[2], fill: '#28A745' },
                    { name: 'Retirado', value: inscritosPorStatusCurso[3], fill: '#FF0000' }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" barSize={30} />
                  </BarChart>

                  </ResponsiveContainer>

                </div>
              </div>

              {/* Gráfica de Estado de Pagos justo debajo de la tabla */}
              <div className="col-lg-12 d-flex  mt-2 justify-content-between"> {/* Añadido justify-content-between para separar */} 
                
                <div className="chart-box" style={{ flex: '1 1 100%', maxWidth: '100%', marginRight: '10px' }}>
                  <h4 style={{ fontSize: '1.2rem' }}> Programas con mayor Ingreso</h4>
                  <ResponsiveContainer width="100%" height={300}>
                  <BarChart  data={mayorIngreso}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="ingresos" fill="#82ca9d" name="Ingresos" />
                    </BarChart>
                  </ResponsiveContainer>

                </div>
              </div>
              </motion.div>


       {/* Modal  de eliminación */}
       <Modal show={showModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirmar eliminación</Modal.Title>
                </Modal.Header>
                <Modal.Body>¿Estás seguro de que deseas eliminar este Curso y todos los datos relacionados a él?</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>
                        Cancelar
                    </Button>
                    <Button variant="danger" onClick={deleteCursos}>
                        Eliminar
                    </Button>
                </Modal.Footer>
            </Modal>

              {/* Modal de confirmación */}
              <Modal show={showModalInfo} onHide={() => setShowModalInfo(false)} centered>
                    <Modal.Header closeButton>
                    <Modal.Title>Confirmar impresión</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                    ¿Está seguro que desea imprimir la información? Esto generará un archivo descargable en formato Excel.
                    </Modal.Body>
                    <Modal.Footer>
                    <div className="d-flex justify-content-end gap-2">
                        <Button variant="secondary" onClick={() => setShowModalInfo(false)}>
                            Cancelar
                        </Button>
                        <Button variant="primary" onClick={handlePrint}>
                            Imprimir
                        </Button>
                        </div>

                    </Modal.Footer>
                </Modal>

            <ToastContainer />
      </div>

      


                
    );
    
      

      
};

export default ShowCursos;
