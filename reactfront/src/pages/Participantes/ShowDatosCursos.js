import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Table from 'react-bootstrap/Table';
import { useNavigate } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import moment from 'moment';
import { useLoading } from '../../components/LoadingContext';
import { ToastContainer,toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PaginationTable from '../../components/PaginationTable';
import { FaUserFriends, FaClock, FaBook,FaSync,FaSearch } from 'react-icons/fa';  // Importamos íconos de react-icons
import { Modal } from 'react-bootstrap';
import { ResponsiveContainer,Line, LineChart,BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,AreaChart,Area,Radar,RadarChart, PieChart, Cell, Pie, ComposedChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { useParams } from 'react-router-dom';
import { FaExpand, FaCompress } from 'react-icons/fa'; // Íconos para expandir/contraer
import { motion } from 'framer-motion';
const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00C49F', '#FFBB28','#8884d8', '#82ca9d', '#ffc658', '#ff7300','rgba(48, 144, 99, 0.9)','rgb(72, 205, 143)','rgb(255, 74, 74)'];


const endpoint = 'http://localhost:8000/api';

const ShowDatosCursos = () => {

    const [inscripciones, setInscripciones] = useState([]);  // Cambiar a inscripciones
    const [filteredInscripciones, setFilteredInscripciones] = useState([]);  // Cambiar a inscripciones filtradas
    const [participante, setParticipante] = useState('');
    const [error, setError] = useState(null);
    const { setLoading } = useLoading();
    const navigate = useNavigate();
    const { cedula_identidad } = useParams();  // Obtener cedula_identidad del URL
    const itemsPerPage = 7;
    const [currentPage, setCurrentPage] = useState(1);
    const [loadingData, setLoadingData] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [filteredDatos, setFilteredDatos] = useState([]);
    const [periodoOptions, setPeriodoOptions] = useState([]);
    const [areaOptions, setAreaOptions] = useState([]);
    const [unidadOptions, setunidadOptions] = useState([]);
    const [nivelOptions, setNivelOptions] = useState([]);
    const [tipoProgramaOptions, setTipoProgramaOptions] = useState([]);
    const [modalidadOptions, setModalidadOptions] = useState([]);
    const [cohortedOptions, setCohorteOptions] = useState([]);
    const [statistics, setStatistics] = useState({});
    const [totalPages, setTotalPages] = useState(1); // Default to 1 page initially
    const userRole = localStorage.getItem('role'); // Puede ser 'admin', 'superuser', 'invitado', etc.
    const [mostrarSoloTabla, setMostrarSoloTabla] = useState(false);
        
            const toggleTablaExpandida = () => {
                setMostrarSoloTabla(prevState => !prevState);
            };



    const [filters, setFilters] = useState({
        periodo_id:'',
        nivel_id: '',
        area_id: '',
        modalidad_id: '',
        tipo_programa_id: '',
        unidad_id: '',
        status_pay:'',
        cohorte_id:'',
        centro_id:'',
        status_curso:''
    });
 
    useEffect(() => {
        setLoading(true);
       getParticipante();
        fetchFilterOptions();
        getAllDatosCursos().finally(() => {
          setLoading(false);
        });
      }, [cedula_identidad]);

      const getParticipante = async () => {
        try {
          const token = localStorage.getItem('token');
          
          // Suponiendo que el endpoint unificado sea `/filtros-cursos`
          const response = await axios.get(`${endpoint}/datos/${cedula_identidad}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          // Desestructuramos los datos que vienen en la respuesta
          
            setParticipante(response.data);
          
           
        } catch (error) {
          console.error('Error fetching Participante:', error);
        }
      };

    

    const getAllDatosCursos = async (page = 1) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${endpoint}/datos/cursos/${cedula_identidad}?&page=${currentPage}`, {
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


    const fetchFilterOptions = async () => {
        try {
          const token = localStorage.getItem('token');
          
          // Suponiendo que el endpoint unificado sea `/filtros-cursos`
          const response = await axios.get(`${endpoint}/select-inc`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          // Desestructuramos los datos que vienen en la respuesta
          
            setCohorteOptions(response.data.cohorte);
            setAreaOptions(response.data.area);
            setunidadOptions(response.data.unidad);
            setNivelOptions(response.data.nivel);
            setTipoProgramaOptions(response.data.tipoPrograma);
            setModalidadOptions(response.data.modalidad);
            setPeriodoOptions(response.data.periodo);
           
        } catch (error) {
          console.error('Error fetching filter options:', error);
        }
      };

      const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };
    
      const handlePageChange = (page) => {
        setCurrentPage(page);
        getAllDatosCursos(page);
    
    };
    
      const loadData = async () => {
        setLoadingData(true); // Inicia el estado de carga
        try {
            await (getAllDatosCursos(),fetchFilterOptions()); // Espera a que getAllDatos haga la solicitud y actualice los datos
        } catch (error) {
            console.error('Error recargando los datos:', error); // Maneja el error si ocurre
        } finally {
            setLoadingData(false); // Detener el estado de carga cuando la solicitud haya terminado
        }
    };
    


// Agregar esta función para obtener el color del estado de pago
const getStatusPayColor = (status_pay) => {
    if (status_pay === '1') return 'red'; // No pagado
    if (status_pay === '2') return 'orange'; // En proceso
    if (status_pay === '3') return 'green'; // Pagado
    if (status_pay === '4') return 'blue'; // Culminado
    if (status_pay === '5') return '#fc53c4'; // Culminado
    return 'gray'; // Desconocido
};
const getStatusCursoColor = (status_curso) => {
    if (status_curso === '1') return 'orange'; // No finalizado
    if (status_curso === '2') return 'green'; // Egresado/Certificado
    if (status_curso === '3') return 'red'; // Retirado
    return 'gray'; // Desconocido
};

// Función para renderizar el círculo de color
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

  const estadoCurso = Object.values(statistics?.cursosPorEstadoCurso || []).map(({ count, description }) => {
    let color;
    if (description === "No Finalizado") color = "#FFA500"; // Naranja
    if (description === "Egresado/Certificado") color = "green"; // Verde
    if (description === "Retirado") color = "#FF0000"; // Rojo
    if (!color) color = "#808080"; // Gris predeterminado
  
    return {
      name: description,
      value: count,
      color,
    };
  });

  const estadoPago = Object.values(statistics?.cursosPorEstadoPago || []).map(({ count, description }) => {
    let color;
  
    // Asignar colores según el description
    if (description=== "No Pagado (Rojo)") color = "#FF0000"; 
    if (description=== "En proceso (Naranja)") color = "#FFA500"; 
    if (description=== "Pagado (Verde)") color = "green"; 
    if (description=== "Patrocinado (Azul)") color = "blue"; 
    if (description=== "Exonerado (Rosado)") color = "#fc53c4"; 
    
    // Color por defecto si no hay coincidencia
  
    return {
      name: description,
      value: count, 
      color
    };
  });

  const AreaGraphic = Object.entries(statistics?.cursosPorArea || {}).map(([name, { count }]) => ({
    name, // Usamos `name` como la clave del área.
    value: count, // Usamos `value` como la clave del valor.
  }));
  const dataModalidad = Object.entries(statistics?.cursosPorModalidad || {}).map(([name, { count }]) => ({
    name, // Usamos `name` como la clave del área.
    value: count, // Usamos `value` como la clave del valor.
  }));
  
  const dataTipoPrograma = Object.entries(statistics?.cursosPorTipoPrograma || {}).map(([name, { count }]) => ({
    name, // Usamos `name` como la clave del área.
    value: count, // Usamos `value` como la clave del valor.
  }));
  const dataUnidad = Object.entries(statistics?.cursosPorUnidad || {}).map(([name, { count }]) => ({
    name, // Usamos `name` como la clave del área.
    value: count, // Usamos `value` como la clave del valor.
  }));

  const dataNivel = Object.entries(statistics?.cursosPorNivel || {}).map(([name, { count }]) => ({
    name, // Usamos `name` como la clave del área.
    value: count, // Usamos `value` como la clave del valor.
  }));

  const dataCohorte = Object.entries(statistics?.cursosPorCohorte || {}).map(([name, { count }]) => ({
    name, // Usamos `name` como la clave del área.
    value: count, // Usamos `value` como la clave del valor.
  }));







 


    const columns = [ "cod", "Nombre del Curso","Horas","Estado de Pago","Estado de Curso","Acciones"];

    const renderItem = (informacion_inscripcion) => (
        <tr key={informacion_inscripcion.id}>
        <td >{informacion_inscripcion?.curso?.cod}</td>
        <td >{informacion_inscripcion?.curso?.descripcion}</td>
        <td >{informacion_inscripcion?.curso?.cantidad_horas}</td>
        <td className="text-center">{renderStatusPayDot(informacion_inscripcion.status_pay)}</td> 
        <td className="text-center">{renderStatusCursoTriangle(informacion_inscripcion.status_curso)}</td> 
        <td >
        <div className="d-flex justify-content-around">
                        
                        <Button
                                variant="btn btn-info"
                                onClick={() => navigate(`/inscritos/show/${informacion_inscripcion.id}`)}
                                className="me-2 icon-white"
                                title='Ver más'
                            >
                                <i className="bi bi-eye"></i>
                            </Button>

                            <Button variant="btn btn-info" onClick={() => navigate(`/pagos/curso/${informacion_inscripcion.id}`)} className="me-1" title='Ver Pagos'>
                            <i className="bi bi-currency-exchange"></i>
                            </Button>
                            {/* Botón para editar si el rol es 'admin' */}
                            {(userRole === 'admin' || userRole === 'superuser') && (
                            <Button variant="btn btn-warning" onClick={() => navigate(`/inscritos/edit/${informacion_inscripcion.id}/${informacion_inscripcion.cedula_identidad}`)} className="me-1" title='Editar'>
                                <i className="bi bi-pencil-fill"></i>
                            </Button>
                            )}

            </div>
        </td>
    </tr>
    );

    return (

        
        
        <div className="container-fluid " style={{ fontSize: '0.85rem' }}>
             <motion.div 
                initial={{ opacity: 1, maxHeight: "500px" }} // Establece una altura máxima inicial
                animate={{
                    opacity: mostrarSoloTabla ? 0 : 1,
                    maxHeight: mostrarSoloTabla ? 0 : "500px", // Reduce la altura en transición
                }}
                transition={{ duration: 0.5, ease: "easeInOut" }} // Animación más fluida
                style={{ overflow: "hidden" }} // Evita que los elementos internos se muestren fuera de la caja
            >
            <div className="col-lg-11 mx-auto"> {/* Agregamos 'mx-auto' para centrar */}
            <div className="stat-box d-flex justify-content-between" style={{ maxWidth: '100%' }}>

                {/* Total de Cursos */}
                <div className="stat-card" style={{ padding: '5px', margin: '0 10px', width: '22%' }}>
                    <div className="stat-icon"><FaBook /></div>
                    <div className="stat-number" style={{ color: '#58c765', fontSize: '1.8rem' }}>{statistics?.totalCursos !== undefined ? statistics.totalCursos : '0'}</div>
                    
                    <h4 style={{ fontSize: '1.1rem', color: 'gray' }}>Total de Cursos</h4>
                </div>

                {/* Horas Cursando y Horas Realizadas */}
                {((statistics.horasCursando) && (statistics.horasFinalizadas)) !== undefined  && (
                <div className="stat-card" style={{
                    padding: '8px',
                    margin: '0 10px',
                    width: '22%',
                    position: 'relative',
                    backgroundColor: '#fff',
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                }}>
                    <h4 style={{ fontSize: '1rem', color: 'gray', textAlign: 'center' }}>Horas Cursando y Realizadas</h4>
                    <div className="stat-number" style={{
                        color: '#ffda1f',
                        fontSize: '1.5rem',
                        fontWeight: 'bold',
                        textAlign: 'center'
                    }}>
                        {statistics?.horasCursando} / {statistics?.horasFinalizadas}
                    </div>
                    <div style={{ fontSize: '0.85rem', textAlign: 'center', color: '#6c757d' }}>Cursando / Realizadas</div>
                </div>
                )}

                {/* Cursos No Empezados, Cursando, y Terminados */}
                {((statistics.statusNoFinalizado) && (statistics.statusEgresado) && (statistics.statusRetirado)) !== undefined  && (
                    <div className="stat-card" style={{
                        padding: '8px',
                        margin: '0 10px',
                        width: '22%',
                        position: 'relative',
                        backgroundColor: '#fff',
                        borderRadius: '8px',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                    }}>
                        <h4 style={{ fontSize: '1rem', color: 'gray', textAlign: 'center' }}>Status de Cursos</h4>
                        <div className="stat-number" style={{
                            fontSize: '1.2rem',
                            fontWeight: 'bold',
                            textAlign: 'center',
                            color: '#6c757d'
                        }}>
                            <span style={{ color: '#ffda1f' }}>{statistics.statusNoFinalizado}</span> / <span style={{ color: 'rgb(72, 205, 143)' }}>{statistics.statusEgresado}</span> / <span style={{ color: 'rgb(255, 74, 74)' }}>{statistics.statusRetirado}</span>
                        </div>
                        <div style={{ fontSize: '0.85rem', textAlign: 'center', color: '#6c757d' }}>No Finalizado / Egresado / Retirado</div>
                    </div>
                )}
                
            </div>
            </div>
            </motion.div>



        <div className="row" style={{ marginTop: '10px' }}>
            
                {/* Columna para la tabla */}
                <div className="col-lg-11 mx-auto"> {/* Agregamos 'mx-auto' para centrar */}
                    <div className="card-box" style={{ padding: '20px', width: '100%', margin: '0 auto' }}> 
                    <div className="d-flex justify-content-between align-items-center mb-3" style={{ gap: '0px' }}>
                        <h1 style={{ marginRight: '10px' }}>Lista de Cursos de {participante.nombres} {participante.apellidos}</h1>

                        <div className="d-flex" style={{ gap: '5px' }}> 
                        <Button 
                            variant="info me-2" 
                            onClick={toggleTablaExpandida} 
                            style={{ padding: '5px 15px' }}
                            title={mostrarSoloTabla ? "Mostrar Todo" : "Modo Tabla Expandida"}
                        >
                            {mostrarSoloTabla ? <FaCompress /> : <FaExpand />}
                        </Button>
                            <Button
                            variant="info"
                            onClick={loadData}
                            disabled={loadingData} // Deshabilita el botón si está cargando
                            style={{ padding: '8px 16px', width: '90px' }} // Ajustamos el padding para aumentar el grosor
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
                                onClick={getAllDatosCursos}
                                style={{ padding: '5px 10px', width: '120px' }} // Ajusta padding y ancho
                                title='Buscar'
                            >
                                <FaSearch className="me-1" /> {/* Ícono de lupa */}
                            </Button>
                            <Button variant="secondary" onClick={() => navigate("/datos")} className="secondary" style={{ fontSize: '0.9rem' }} title='Volver'>
                                <i className="bi bi-arrow-90deg-left"></i>
                            </Button>

                        </div>
                    </div>

                    <div className="d-flex mb-3 ">
                    <Form.Select
                        name="status_pay"
                        value={filters.status_pay}
                        onChange={handleFilterChange}
                        className="me-2"
                    >
                        <option value="">Filtrar por Estado de Pago</option>
                        <option value="1">No Pagado</option>
                        <option value="2">Pago en Proceso</option>
                        <option value="3">Pagado</option>
                        <option value="4">Patrocinado</option>
                        <option value="5">Exonerado</option>
                    </Form.Select>
                    <Form.Select
                        name="status_curso"
                        value={filters.status_curso}
                        onChange={handleFilterChange}
                        className="me-2"
                    >
                        <option value="">Filtrar por Estado de Curso</option>
                        <option value="1">No Finalizado</option>
                        <option value="2">Egresado/Certificado</option>
                        <option value="3">Retirado</option>
                    </Form.Select>
                    </div>
                    <div className="d-flex mb-3 ">


                    <Form.Select
                            name="cohorte_id"
                            value={filters.cohorte_id}
                            onChange={handleFilterChange}
                            className="me-2"
                        >
                            <option value="">Cohorte</option>
                            {cohortedOptions.map(option => (
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
                            {periodoOptions.map(option => (
                                <option key={option.id} value={option.id}>{option.descripcion}</option>
                            ))}
                        </Form.Select>

                         <Form.Select
                            name="nivel_id"
                            value={filters.nivel_id}
                            onChange={handleFilterChange}
                            className="me-2"
                        >
                            <option value="">Nivel</option>
                            {nivelOptions.map(option => (
                                <option key={option.id} value={option.id}>{option.descripcion}</option>
                            ))}
                        </Form.Select>

                        <Form.Select
                            name="area_id"
                            value={filters.area_id}
                            onChange={handleFilterChange}
                            className="me-2"
                        >
                            <option value="">Área</option>
                            {areaOptions.map(option => (
                                <option key={option.id} value={option.id}>{option.descripcion}</option>
                            ))}
                        </Form.Select>

                        <Form.Select
                            name="modalidad_id"
                            value={filters.modalidad_id}
                            onChange={handleFilterChange}
                            className="me-2"
                        >
                            <option value="">Modalidad</option>
                            {modalidadOptions.map(option => (
                                <option key={option.id} value={option.id}>{option.descripcion}</option>
                            ))}
                        </Form.Select>

                        <Form.Select
                            name="tipo_programa_id"
                            value={filters.tipo_programa_id}
                            onChange={handleFilterChange}
                            className="me-2"
                        >
                            <option value="">Tipo de Programa</option>
                            {tipoProgramaOptions.map(option => (
                                <option key={option.id} value={option.id}>{option.descripcion}</option>
                            ))}
                        </Form.Select>

                        <Form.Select
                            name="unidad_id"
                            value={filters.unidad_id}
                            onChange={handleFilterChange}
                            className="me-2"
                        >
                            <option value="">Unidad</option>
                            {unidadOptions.map(option => (
                                <option key={option.id} value={option.id}>{option.descripcion}</option>
                            ))}
                        </Form.Select> 



                    </div>
                    {/* Leyenda de colores */}
                        {/* Leyenda de colores actualizada para status_pay */}
                    <div className="status-legend d-flex justify-content-start mb-3">
                        <span className="status-dot red"></span> No Pagado (Rojo)
                        <span className="status-dot orange ms-3"></span> Pago en Proceso (Naranja)
                        <span className="status-dot green ms-3"></span> Pagado (Verde)
                        <span className="status-dot blue ms-3"></span> Patrocinado (Azul)
                        <span className="status-dot pink ms-3"></span> Exonerado (Rosado)
                    </div>
                    <div className="status-legend d-flex justify-content-start mb-3">
                        <span className="status-triangle not-finalized"></span> No Finalizado (Naranja)
                        <span className="status-triangle graduated ms-3"></span> Egresado/Certificado (Verde)
                        <span className="status-triangle withdrawn ms-3"></span> Retirado (Rojo)
                    </div>




                    <PaginationTable
                        data={inscripciones}
                        itemsPerPage={itemsPerPage}
                        columns={columns}
                        renderItem={renderItem}
                        currentPage={currentPage}
                        onPageChange={handlePageChange}
                        totalPages={totalPages}  // <--- Añade esta línea si aún no está
                    />


            <ToastContainer />
        </div>
        <motion.div 
            initial={{ opacity: 1, height: "auto" }}
            animate={{ opacity: mostrarSoloTabla ? 0 : 1, height: mostrarSoloTabla ? 0 : "auto" }}
            transition={{ duration: 0.5 }}
        >

        <div className="col-lg-12 d-flex justify-content-between flex-wrap" style={{ gap: '20px', marginTop: '10px' }}>
        <div className="chart-box" style={{ flex: '1 1 31%', maxWidth: '31%', marginRight: '10px' }}>
                    <h4 style={{ fontSize: '1.2rem' }}>Cursos por Status de Progreso</h4>
                    {statistics?.cursosPorEstadoCurso !== undefined && (
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

                    <div className="chart-box" style={{ flex: '1 1 31%', maxWidth: '31%', marginRight: '10px' }}>
                            <h4 style={{ fontSize: '1.2rem' }}>Cursos por Status de Pago</h4>
                            {statistics?.cursosPorEstadoPago !== undefined && (
                           <ResponsiveContainer width="100%" height={400}>
                           <BarChart data={estadoPago} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                               <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                               <YAxis />
                               <Tooltip />
                               <Bar dataKey="value">
                                   {estadoPago.map((entry, index) => (
                                       <Cell key={`cell-${index}`} fill={entry.color} />
                                   ))}
                               </Bar>
                           </BarChart>
                       </ResponsiveContainer>
                       
                            )} 
                    </div>

                    <div className="chart-box" style={{ flex: '1 1 31%', maxWidth: '31%', marginRight: '10px' }}>
                             <h4 style={{ fontSize: '1.2rem' }}>Cursos por Área</h4>
                             <ResponsiveContainer width="100%" height={280}>
                                <PieChart>
                                    <Pie
                                    data={AreaGraphic}
                                    cx={170}
                                    cy={150}
                                    outerRadius={120}
                                    fill="#8884d8"
                                    dataKey="value"
                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`} // Mostrar nombre y porcentaje
                                    >
                                    {AreaGraphic.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                                </ResponsiveContainer>

                    </div>
                    
                    </div>
                    </motion.div>
                    <motion.div 
                            initial={{ opacity: 1, height: "auto" }}
                            animate={{ opacity: mostrarSoloTabla ? 0 : 1, height: mostrarSoloTabla ? 0 : "auto" }}
                            transition={{ duration: 0.5 }}
                        >
                    

        <div className="col-lg-12 d-flex justify-content-between flex-wrap" style={{ gap: '20px', marginTop: '10px' }}>
            <div className="chart-box" style={{ flex: '1 1 31%', maxWidth: '31%', marginRight: '10px' }}>
            <h4 style={{ fontSize: '1.2rem' }}>Distribución de Cursos por Tipo de Programa</h4>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={dataTipoPrograma}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" name="Cursos" barSize={50}>
                            {dataTipoPrograma.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill="#FFA500" /> 
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>


            </div>
            <div className="chart-box" style={{ flex: '1 1 31%', maxWidth: '31%', marginRight: '10px' }}>
            <h4 style={{ fontSize: '1.2rem' }}>Distribución de Cursos por Unidad</h4>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={dataUnidad}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={70}  // Hacer la forma de dona
                            outerRadius={100}
                            fill="#82ca9d"  // Puedes cambiar este color si lo deseas
                            label
                        >
                            {dataUnidad.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>



            </div>
            <div className="chart-box" style={{ flex: '1 1 31%', maxWidth: '31%', marginRight: '10px' }}>
            <h4 style={{ fontSize: '1.2rem' }}>Distribución de Cursos por Nivel</h4>
                <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={dataNivel}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="subject" />
                        <PolarRadiusAxis angle={30} domain={[0, Math.max(...dataNivel.map(d => d.value))]} />
                        <Radar name="Cursos" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                        <Legend />
                    </RadarChart>
                </ResponsiveContainer>
            </div>
            <div className="chart-box" style={{ flex: '1 1 45%', maxWidth: '45%', marginRight: '10px' }}>
            <h4 style={{ fontSize: '1.2rem' }}>Distribución de Cursos por Modalidad</h4>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={dataModalidad}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" fill="#8884d8">
                            {dataModalidad.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>      

            <div className="chart-box" style={{ flex: '1 1 45%', maxWidth: '45%', marginRight: '10px' }}>
            <h4 style={{ fontSize: '1.2rem' }}>Distribución de Cursos por Modalidad</h4>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={dataCohorte}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" fill="#8884d8">
                            {dataCohorte.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>              
        </div>
        </motion.div>
        </div>
        

        </div>
        
       
        </div>
        
        
        

    );
};

export default ShowDatosCursos;
