import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Table from 'react-bootstrap/Table';
import { useNavigate } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { Modal } from 'react-bootstrap';
import { useLoading } from '../../components/LoadingContext'; 
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PaginationTable from '../../components/PaginationTable';
import { ResponsiveContainer,Line, LineChart,BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,AreaChart,Area,Radar,RadarChart, PieChart, Cell, Pie, ComposedChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FaUserFriends, FaClock, FaBook,FaSync,FaBuilding,FaSearch  } from 'react-icons/fa';  // Importamos íconos de react-icons
import ProgressBar from 'react-bootstrap/ProgressBar';
import moment from 'moment';  // Asegúrate de tener moment.js instalado para manejar fechas


const endpoint = 'http://localhost:8000/api';
const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00C49F', '#FFBB28'];

const ShowBolsaEmpleo = () => {
    const [Patrocinantes, setPatrocinantes] = useState([]);
    const [filteredPatrocinantes, setFilteredPatrocinantes] = useState([]);
    const [searchCedula, setSearchCedula] = useState('');
    const [currentPage, setCurrentPage] = useState(1);  // Estado para la página actual
    const [showModal, setShowModal] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [loadingData, setLoadingData] = useState(false); // Estado para controlar la recarga
    const [range, setRange] = useState(30); // Estado por defecto a 30 días
    const [estadoOptions, setEstadoOptions] = useState([]);  // Inicializa con un array vacío
    const [paisOptions, setPaisOptions] = useState([]);  // Inicializa con un array vacío
    const [tipoPatrocinanteOptions, setTipoPatrocinanteOptions] = useState([]);  // Inicializa con un array vacío
    const [tipoIndustriaOptions, setTipoIndustriaOptions] = useState([]);  // Inicializa con un array vacío
    const [statistics, setStatistics] = useState({});
    const [totalPages, setTotalPages] = useState(1); // Default to 1 page initially



    const [filters, setFilters] = useState({
        estado_id: '',
        pais_id: '',
        tipo_patrocinante_id: '',
        tipo_industria_id: '',
        empresa_persona: 'Empresa',
        es_patrocinante: '',  
        exterior: '',         
        bolsa_empleo: '' ,
        rif_cedula:'',
        nombre_patrocinante:''  ,

    });
    
    
    const itemsPerPage = 7; // Número de elementos por página
    const { setLoading } = useLoading();
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // Obtener el rol del usuario desde localStorage
    const userRole = localStorage.getItem('role'); // Puede ser 'admin', 'superuser', 'invitado', etc.
    const handleShowModal = (id) => {
        setSelectedId(id);  // Almacena el ID del participante que se va a eliminar
        setShowModal(true); // Muestra el modal
    };
    
    const handleCloseModal = () => {
        setShowModal(false); // Cierra el modal
    };
    
    useEffect(() => {
        setLoading(true);
        Promise.all([getAllPatrocinantes(), fetchFilterOptions()]) // Agrega aquí la función para obtener como_entero_superatec
            .finally(() => {
                setLoading(false);
            });
    }, []);
    

    const getAllPatrocinantes = async (page = 1) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${endpoint}/patrocinantes-estadisticas`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { ...filters, page }, // Incluye `page` en los parámetros
            });
            
            const estadisticas = response.data.estadisticas || {};
            
            setPatrocinantes(Array.isArray(response.data.datos.data) ? response.data.datos.data : []);
            setStatistics(estadisticas);
            setTotalPages(response.data.datos.last_page || 1); // Actualiza el total de páginas
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Error fetching data');
            setPatrocinantes([]);
            setStatistics({});
        }
    };
 
    const deletePatrocinantes = async () => {
        const token = localStorage.getItem('token');
        try {
            await axios.delete(`${endpoint}/patrocinantes/${selectedId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            toast.success('Participante eliminado con Éxito');             
            getAllPatrocinantes();
            setShowModal(false); // Cierra el modal tras la eliminación exitosa
        } catch (error) {
            setError('Error deleting data');
            console.error('Error deleting data:', error);
            toast.error('Error al eliminar Participante');
            setShowModal(false); // Cierra el modal tras el error
        }
    };
    const fetchFilterOptions = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${endpoint}/filter-patrocinantes`, { headers: { Authorization: `Bearer ${token}` } });

            setEstadoOptions(response.data.estado);
            setPaisOptions(response.data.pais);
            setTipoIndustriaOptions(response.data.tipo_industria);
            setTipoPatrocinanteOptions(response.data.tipo_patrocinante);

        } catch (error) {
            setError('Error fetching filter options');
            console.error('Error fetching filter options:', error);
        }
    }


    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };
 
    const handlePageChange = (page) => {
        setCurrentPage(page);
        getAllPatrocinantes(page); // Llama a `getAllDatos` con el nuevo número de página
        
    };



    const loadData = async () => {
        setLoadingData(true); // Inicia el estado de carga
        try {
            await (getAllPatrocinantes(),fetchFilterOptions()); // Espera a que getAllPatrocinantes haga la solicitud y actualice los Patrocinantes
        } catch (error) {
            console.error('Error recargando los Patrocinantes:', error); // Maneja el error si ocurre
        } finally {
            setLoadingData(false); // Detener el estado de carga cuando la solicitud haya terminado
        }
    };

    const totalPatrocinados = statistics.totalPatrocinantes || 0;
    const porcentajeEmpresa = statistics.porcentajesTipo?.Empresa || 0;
    const porcentajePersona = statistics.porcentajesTipo?.Persona || 0;

    // Datos para el gráfico de barr
    const exteriorData= statistics.exterior?.Exterior || 0;
    const noExteriorData= statistics.exterior?.NoExterior || 0;


    const esPatrocinadoData = [
        { name: 'Sí', value: statistics.esPatrocinado?.Si || 0 },
        { name: 'No', value: statistics.esPatrocinado?.No || 0 }
    ];

    const paisData = Object.entries(statistics.pais || {}).map(([name, data]) => ({
        name,
        value: data.count || 0
    }));

    const estadoData = Object.entries(statistics.estado || {}).map(([name, data]) => ({
        name,
        value: data.count || 0
    }));

    const tipoIndustriaData = Object.entries(statistics.tipoIndustria || {}).map(([name, data]) => ({
        name,
        value: data.percentage || 0
    }));

    const tipoPatrocinanteData = Object.entries(statistics.tipoPatrocinante || {}).map(([name, data]) => ({
        name,
        value: data.percentage || 0
    }));

    const bolsaEmpleoData = [
        { name: 'Sí', value: statistics.bolsaEmpleo?.Si || 0 },
        { name: 'No', value: statistics.bolsaEmpleo?.No || 0 }
    ];
    
    
    const colors = ['#0088FE', 'rgba(255, 74, 74, 0.9)']; // Azul para true, naranja para false

    const columns = ["Rif/Cedula", "Nombre", "Telefono","Email","Web", "Acciones"];

    const renderItem = (dato) => (
        <tr key={dato.id}>
            <td className="col-rif_cedula">{dato.rif_cedula}</td>
            <td className="col-nombre_patrocinante">{dato.nombre_patrocinante}</td>
            <td className="col-telefono">{dato.telefono}</td>
            <td className="col">{dato.email}</td>
            <td className="col">{dato.web}</td>
            <td className="col-accioness">
                <div className="d-flex justify-content-around">
 
                <Button
                    variant="btn btn-info" // Cambia aquí, solo debes pasar 'outline-info'
                    onClick={() => navigate(`/patrocinantes/${dato.id}`)}
                    className="me-2"
                    title='Ver más'
                >
                    <i className="bi bi-eye"></i>
                </Button>
                <Button
                    variant="btn btn-info" // Cambia aquí, solo debes pasar 'outline-info'
                    onClick={() => navigate(`/postulaciones-empresas/${dato.id}`)}
                    className="me-2"
                    title='Ver Postulados'
                >
                    <i className="bi bi-person"></i>
                </Button>

    
                    {userRole === 'admin' || userRole === 'superuser' ? (
                        <>
                            <Button
                                variant="btn btn-warning"
                                onClick={() => navigate(`/patrocinantes/${dato.id}/edit`)}
                                className="me-2 icon-white"
                                title='Editar'
                            >
                                <i className="bi bi-pencil-fill"></i>
                            </Button>

                            <Button variant="btn btn-success" onClick={() => navigate(`/bolsa-empleo/${dato.id}`)} className="me-2" title="Inscribir A Bolsa de Empleo">
                                <i className="bi bi-person-plus-fill"></i>
                            </Button>

                           
    
                            {userRole === 'admin' && (
                         

                                <Button
                                variant="btn btn-danger"
                                onClick={() => handleShowModal(dato.id)}
                                className="me-2"
                                title='Eliminar'
                                >
                                <i className="bi bi-trash3-fill"></i>
                                </Button>

                            )}
                        </>
                    ) : null}
                </div>
            </td>
            
        </tr>
        
    );

    return (
        <div className="container-fluid " style={{ fontSize: '0.85rem' }}>
            <div className="stat-box d-flex justify-content-between" style={{ maxWidth: '100%' }}> 
                {/* Total de Patrocinados */}
                <div className="stat-card" style={{ padding: '5px', margin: '0 10px', width: '22%' }}>
                    <div className="stat-icon"><FaBuilding  /></div>
                    <div className="stat-number" style={{ color: '#58c765', fontSize: '1.8rem' }}>{totalPatrocinados}</div>
                    <h4 style={{ fontSize: '1.1rem', color:'gray' }}>Total de Empresas</h4>
                </div>

                <div className="stat-card" style={{ padding: '0', margin: '0 10px', width: '100%', maxWidth: '300px' }}>
                    <ResponsiveContainer width="100%" height={120}> {/* Ajustamos el width y height dinámicamente */}
                        <PieChart>
                            <Pie
                                data={[
                                    { name: 'Empresa', value: porcentajeEmpresa },
                                    { name: 'Persona', value: porcentajePersona },
                                ]}
                                dataKey="value"
                                startAngle={180} // Semicírculo
                                endAngle={0}
                                cx="50%"        // Centrar horizontalmente con porcentaje
                                cy="70%"        // Ajustamos la gráfica para pegarla más arriba
                                outerRadius="70%" // Radio basado en el porcentaje del contenedor para mayor flexibilidad
                                fill="#8884d8"
                                label={({ name, value }) => ` ${value.toFixed(2)}%`} // Mostrar los porcentajes
                                labelLine={false}
                            >
                                {/* Colores para cada sector */}
                                <Cell key="Empresa" fill="#8884d8" />
                                <Cell key="Persona" fill="#82ca9d" />
                            </Pie>
                            <Legend 
                                layout="horizontal" 
                                verticalAlign="bottom" 
                                align="center" 
                                wrapperStyle={{ 
                                width: "98%", 
                                textAlign: "center", 
                                marginTop: "-35px", 
                                fontSize: '10px' 
                                }}
                            />
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Total Empresa y persona */}
                <div className="stat-card" style={{ padding: '5px', margin: '0 10px', width: '22%', textAlign: 'center' }}>
                    <div className="d-flex justify-content-between mx-auto" style={{ marginTop: '17px' }}>
                        <div style={{ textAlign: 'center', marginLeft: '40px' }}>
                            <h4 style={{ fontSize: '1.1rem', color: 'gray' }}>Exterior</h4>
                            <div className="stat-number" style={{ color: '#8884d8', fontSize: '1.8rem' }}>
                                {exteriorData}
                            </div>
                        </div>
                        <div style={{ textAlign: 'center', marginRight: '40px' }}>
                            <h4 style={{ fontSize: '1.1rem', color: 'gray' }}>No Exterior</h4>
                            <div className="stat-number" style={{ color: '#82ca9d', fontSize: '1.8rem' }}>
                            {noExteriorData}
                            </div>
                        </div>
                    </div>
                </div>

            </div>


            <div className="row" style={{ marginTop: '10px' }}>
                {/* Columna para la tabla */}
                <div className="col-lg-12"> {/* Ajustado para más espacio a la tabla */}
                    <div className="card-box" style={{ padding: '10px' }}> {/* Reduce padding de la tabla */}
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h2 style={{ fontSize: '1.8rem' }}>Lista de Empresas</h2>
                            <div className="d-flex align-items-center">
                                <Form.Control
                                        name="rif_cedula"
                                        type="text"
                                        placeholder="Buscar por Rif/Cédula"
                                        value={filters.rif_cedula}
                                        onChange={handleFilterChange}
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
                                    onClick={getAllPatrocinantes}
                                    style={{ padding: '5px 10px', width: '120px' }} // Ajusta padding y ancho
                                    title='Buscar'
                                >
                                    <FaSearch className="me-1" /> {/* Ícono de lupa */}
                                </Button>


                                {userRole === 'admin' || userRole === 'superuser' ? (

                                <Button variant="btn custom" onClick={() => navigate('/patrocinantes/create')} className="btn-custom"title='Crear Patrocinante'>
                                <i className="bi bi-person-plus-fill me-2  "></i> Nuevo
                            </Button>

                                
                                
                                ):(
                                    <></>
                                )}
                        </div>
                    </div>

                        {/* Filtros */}
                        <div className="d-flex mb-3 ">
                        <Form.Control
                                        name="nombre_patrocinante"
                                        type="text"
                                        placeholder="Buscar por Nombre"
                                        value={filters.nombre_patrocinante}
                                        onChange={handleFilterChange}
                                        className="me-2"
                                    />

                        <Form.Select
                                name="pais_id"
                                value={filters.pais_id}
                                onChange={handleFilterChange}
                                className="me-2"
                            >
                                <option value="">País</option>
                                {paisOptions.map(option => (
                                    <option key={option.id} value={option.id}>{option.descripcion}</option>
                                ))}
                            </Form.Select>
                            <Form.Select
                                name="estado_id"
                                value={filters.estado_id}
                                onChange={handleFilterChange}
                                className="me-2"
                            >
                                <option value="">Estado</option>
                                {estadoOptions.map(option => (
                                    <option key={option.id} value={option.id}>{option.descripcion}</option>
                                ))}
                            </Form.Select>
                            <Form.Select
                                name="tipo_industria_id"
                                value={filters.tipo_industria_id}
                                onChange={handleFilterChange}
                                className="me-2"
                            >
                                <option value="">Tipo de Industria</option>
                                {tipoIndustriaOptions.map(option => (
                                    <option key={option.id} value={option.id}>{option.descripcion}</option>
                                ))}
                            </Form.Select>
                            <Form.Select
                                name="tipo_patrocinante_id"
                                value={filters.tipo_patrocinante_id}
                                onChange={handleFilterChange}
                                className="me-2"
                            >
                                <option value="">Tipo de Patrocinante</option>
                                {tipoPatrocinanteOptions.map(option => (
                                    <option key={option.id} value={option.id}>{option.descripcion}</option>
                                ))}
                            </Form.Select>


                            
   
                        </div>
                        <div className="d-flex mb-3" style={{ gap: '10px', flexWrap: 'wrap' }}>
                                


                                <Form.Select name="exterior" 
                                value={filters.exterior} 
                                onChange={handleFilterChange} 
                                className="me-2"
                                style={{ width: '30%' }} >
                                    <option value="">¿Exterior?</option>
                                    <option value="true">Sí</option>
                                    <option value="false">No</option>
                                </Form.Select>
                            </div>        

                       

                        <PaginationTable
                            data={Patrocinantes}
                            itemsPerPage={itemsPerPage}
                            columns={columns}
                            renderItem={renderItem}
                            currentPage={currentPage}
                            onPageChange={handlePageChange}
                            totalPages={totalPages}  
                        />
                        

                        {/* Modal  de eliminación */}
                        <Modal show={showModal} onHide={handleCloseModal}>
                            <Modal.Header closeButton>
                                <Modal.Title>Confirmar eliminación</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>¿Estás seguro de que deseas eliminar este Participante y todos los Patrocinantes relacionados a él?</Modal.Body>
                            <Modal.Footer>
                                <Button variant="secondary" onClick={handleCloseModal}>
                                    Cancelar
                                </Button>
                                <Button variant="danger" onClick={deletePatrocinantes}>
                                    Eliminar
                                </Button>
                            </Modal.Footer>
                        </Modal>

                        <ToastContainer />
                    </div>
                    
            </div>
            
            </div>
            {/* Gráfica  justo debajo de la tabla */}
            <div className="col-lg-12 d-flex justify-content-between" style={{ gap: '20px' }}>
                <div className="chart-box" style={{ flex: '1 1 50%', maxWidth: '50%', marginRight: '10px'}}>
                <h4 style={{ fontSize: '1.2rem' }}>Distribución por tipo de Industria</h4>
                    
                <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={tipoIndustriaData} // Los datos procesados
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    innerRadius={60}
                                    fill="#8884d8"
                                    label={({ value }) => ` ${value}%`} // Etiquetas que muestran el nombre y valor
                                    labelLine={false}
                                >
                                    {tipoIndustriaData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                   
                                </Pie>
                                <Legend/>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                </div>

                <div className="chart-box " style={{flex: '1 1 50%', maxWidth: '50%', marginRight: '10px'}}>
                <h4 style={{ fontSize: '1.2rem' }}>Distribución Por Tipo de Patrocinante</h4>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={tipoPatrocinanteData} // Los datos procesados
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    fill="#8884d8"
                                    label={({ value }) => ` ${value}%`} // Etiquetas que muestran el nombre y valor
                                    labelLine={false}
                                >
                                    {tipoPatrocinanteData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                   
                                </Pie>
                                <Legend/>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                </div>

            </div>    
            {/* segunda fila de graficos                        */}
            <div className="col-lg-12 d-flex justify-content-between" style={{ gap: '20px' }}>


                <div className="chart-box" style={{ flex: '1 1 50%', maxWidth: '50%', marginRight: '10px'}}>

                <   h4 style={{ fontSize: '1.2rem' }}>Cantidad de Patrocinados por País</h4>
                {paisOptions.length > 0 && (
                        <ResponsiveContainer width="100%" height={400}>
                            <BarChart data={paisData} margin={{ top: 40, right: 30, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="value" name="Participantes">
                                    {paisData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                  
                </div>

                <div className="chart-box " style={{flex: '1 1 50%', maxWidth: '50%', marginRight: '10px'}}>
                <h4 style={{ fontSize: '1.2rem' }}>Cantidad de Patrocinados por Estados/Venezuela</h4>
                {estadoOptions.length > 0 && (
                        <ResponsiveContainer width="100%" height={400}>
                            <BarChart data={estadoData} margin={{ top: 40, right: 30, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="value" name="Participantes">
                                    {estadoData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                   
                        

                </div>
                
            </div>


    </div>
                    

                );
};

export default ShowBolsaEmpleo;
