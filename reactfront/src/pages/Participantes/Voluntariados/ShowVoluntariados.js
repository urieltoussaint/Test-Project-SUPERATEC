import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Table from 'react-bootstrap/Table';
import { useParams, useNavigate } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import './ShowVoluntariados.css'; // Asegúrate de tener este archivo CSS en tu proyecto
import { useLoading } from '../../../components/LoadingContext';   
import { toast, ToastContainer } from 'react-toastify';
import PaginationTable from '../../../components/PaginationTable';
import { Modal } from 'react-bootstrap';
import { FaLocationDot } from "react-icons/fa6";
import { FaPerson } from "react-icons/fa6";
import { FaSync,FaSearch } from 'react-icons/fa';  // Importamos íconos de react-icons
import { ResponsiveContainer,Line, LineChart,BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,AreaChart,Area,Radar,RadarChart, PieChart, Cell, Pie, ComposedChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';





const endpoint = 'http://localhost:8000/api';

const ShowVoluntariados = () => {
    const [voluntariados, setVoluntariados] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [filteredVoluntariados, setFilteredVoluntariados] = useState([]);
    const [searchCedula, setSearchCedula] = useState('');
    const [areaOptions, setAreaOptions] = useState([]);
    const [selectedArea, setSelectedArea] = useState('');
    const [nivelOptions, setNivelOptions] = useState([]);
    const [selectedNivel, setSelectedNivel] = useState('');
    const [generoOptions, setGeneroOptions] = useState([]);
    const [selectedGenero, setSelectedGenero] = useState('');
    const [centroOptions, setCentroOptions] = useState([]);
    const [selectedCentro, setSelectedCentro] = useState('');
    const [error, setError] = useState(null);
    const { id } = useParams();
    const { setLoading } = useLoading();
    const userRole = localStorage.getItem('role'); // Puede ser 'admin', 'superuser', 'invitado', etc.
    const [currentPage, setCurrentPage] = useState(1);  // Estado para la página actual
    const [loadingData, setLoadingData] = useState(false); // Estado para controlar la recarga
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#FF4567'];
    const [totalPages, setTotalPages] = useState(1); // Default to 1 page initially
    const [statistics, setStatistics] = useState({});

    

    const itemsPerPage = 10;

    const navigate = useNavigate();

    const handleShowModal = (id) => {
        setSelectedId(id);  // Almacena el ID del participante que se va a eliminar
        setShowModal(true); // Muestra el modal
    };
    
    const handleCloseModal = () => {
        setShowModal(false); // Cierra el modal
    };   

    useEffect(() => {
        setLoading(true);
        Promise.all([getAllVoluntariados(), fetchFilterOptions()]).finally(() => {
            setLoading(false);
            
        });
    }, [id]);
    const [filters, setFilters] = useState({
        centro_id: '',
        area_voluntariado_id: '',
        nivel_instruccion_id: '',
        genero_id: '',
        cedula_identidad:'',
    });


    const getAllVoluntariados = async (page = 1) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${endpoint}/voluntariados-estadisticas`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { ...filters, page }, // Incluye `page` en los parámetros
            });
            
            const estadisticas = response.data.estadisticas || {};
            estadisticas.rangoEdades = estadisticas.rangoEdades || [];
            
            setVoluntariados(Array.isArray(response.data.datos.data) ? response.data.datos.data : []);
            setStatistics(estadisticas);
            setTotalPages(response.data.datos.last_page || 1); // Actualiza el total de páginas
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Error fetching data');
            setVoluntariados([]);
            setStatistics({ rangoEdades: [] });
        }
    };

    const fetchFilterOptions = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${endpoint}/filter-voluntariados`, { headers: { Authorization: `Bearer ${token}` } });
            
            setAreaOptions(response.data.area);
            setNivelOptions(response.data.nivel);
            setGeneroOptions(response.data.genero);
            setCentroOptions(response.data.centro);

        } catch (error) {
            setError('Error fetching filter options');
            console.error('Error fetching filter options:', error);
        }
    };

    const deleteVoluntariados = async () => {
        
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`${endpoint}/voluntariados/${selectedId}`,{
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                toast.success('Voluntariado eliminado con Éxito');
                setTimeout(() => {
                    getAllVoluntariados();
                }, 500);
                handleCloseModal();
                
            } catch (error) {
                setError('Error deleting data');
                toast.error('Error al eliminar Voluntariado');
                console.error('Error deleting data:', error);
            }
        
    };

    

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };



    const loadData = async () => {
        setLoadingData(true); // Inicia el estado de carga
        try {
            await (getAllVoluntariados(),fetchFilterOptions()); // Espera a que getAllDatos haga la solicitud y actualice los datos
        } catch (error) {
            console.error('Error recargando los datos:', error); // Maneja el error si ocurre
        } finally {
            setLoadingData(false); // Detener el estado de carga cuando la solicitud haya terminado
        }
    };

    const totalVoluntariados= statistics.totalVoluntariados;
    const porcentajeMasculino = statistics?.porcentajesGenero?.masculino || 0;
    const porcentajeFemenino = statistics?.porcentajesGenero?.femenino || 0;
    const porcentajeOtros = statistics?.porcentajesGenero?.otros || 0;

    const areaData = statistics?.participantesPorArea
    ? Object.entries(statistics.participantesPorArea).map(([name, obj]) => ({
        name,           // Nombre del área
        value: obj.count, // El valor que deseas graficar (en este caso, `count`)
    }))
    : [];


    const centroData = statistics?.centro
    ? Object.entries(statistics.centro).map(([name, obj]) => ({
        name,
        value: obj.count,
    }))
    : [];

    const NivelData = statistics?.nivelesInstruccion
    ? Object.entries(statistics.nivelesInstruccion).map(([name, obj]) => ({
        name,
        value: obj.count,
    }))
    : [];



   
    
    

    const columns = [ "Cédula", "Nombres", "Apellidos","Acciones"];

    const renderItem = (dato) => (
        <tr key={dato.cedula_identidad}>
            <td className='col-cedula' >{dato.cedula_identidad}</td>
            <td className='col-nombre'>{dato.nombres}</td>
            <td className='col-apellido'>{dato.apellidos}</td>
            <td >
            <div className="d-flex justify-content-around">

                    <Button
                        variant="btn btn-info" 
                        onClick={() => navigate(`/Voluntariados/${dato.id}`)}
                        className="me-2"
                        title='Ver más'
                    >
                        <i className="bi bi-eye"></i>
                    </Button>
                    {userRole && (userRole === 'admin' || userRole === 'superuser') && (

                        <Button
                        variant="btn btn-warning"
                        onClick={() => navigate(`/voluntariados/${dato.id}/edit`)}
                        className="me-2"
                        title='Editar'
                        >
                        <i className="bi bi-pencil-fill"></i>
                        </Button>
                    )}
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
                </div>
            </td>
        </tr>
    );
    
    
    return (
        <div className="container-fluid mt-2" style={{ fontSize: '0.85rem' }}>
            <div className="col-lg-11 mx-auto d-flex justify-content-center"> 
            <div className="stat-box mx-auto col-lg-11" style={{ maxWidth: '100%' }}> 
            {/* Total de Voluntariados */}
            <div className="stat-card" style={{  }}>
                <div className="stat-icon"><FaPerson  /></div>
                <div className="stat-number" style={{ color: '#58c765', fontSize: '1.2rem' }}>{totalVoluntariados}</div>
                <div className="stat-label">Total de Voluntariados</div>
            </div>
                {/* por genero */}
                <div className="stat-card" style={{  }}>
                <ResponsiveContainer width="100%" height={120}> {/* Ajustamos el width y height dinámicamente */}
                        <PieChart>
                        <Pie
                            data={[
                            { name: 'Masculino', value: porcentajeMasculino },
                            { name: 'Femenino', value: porcentajeFemenino },
                            { name: 'Otros', value: porcentajeOtros },
                            ]}
                            dataKey="value"
                            startAngle={180} // Semicírculo
                            endAngle={0}
                            cx="50%"        // Centrar horizontalmente con porcentaje
                            cy="70%"        // Ajustamos la gráfica para pegarla más arriba
                            outerRadius="70%" // Radio basado en el porcentaje del contenedor para mayor flexibilidad
                            fill="#8884d8"
                            label={({ name, value }) => ` ${value.toFixed(2)}%`} // Mostrar los porcentajes
                            labelLine={true}
                        >
                            {/* Colores para cada sector */}
                            <Cell key="Masculino" fill="#185da7" />
                            <Cell key="Femenino" fill="rgba(254, 185, 56, 0.9)" />
                            <Cell key="Otros" fill="rgba(255, 74, 74, 0.9)" />
                        </Pie>
                        <Legend 
                            layout="horizontal" 
                            verticalAlign="bottom" 
                            align="center" 
                            wrapperStyle={{ 
                            width: "88%", 
                            textAlign: "center", 
                            marginTop: "-15px", 
                            fontSize: '10px' 
                            }}
                        />
                        <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                </div>
                </div> 

                <div className="row" style={{ marginTop: '10px' }}>
                <div className="col-lg-11 mx-auto"> {/* Agregamos 'mx-auto' para centrar */}
                    <div className="card-box" style={{ padding: '20px', width: '100%', margin: '0 auto' }}> 
                            <div className="d-flex justify-content-between align-items-center mb-3" style={{ gap: '0px' }}>
                        <h1>Lista de Voluntarios</h1>
                        <div className="d-flex align-items-center">
                            <Form.Control
                                name="cedula_identidad"
                                type="text"
                                placeholder="Buscar por cédula"
                                value={filters.cedula_identidad}
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
                                    onClick={getAllVoluntariados}
                                    style={{ padding: '5px 10px', width: '120px' }} // Ajusta padding y ancho
                                    title='Buscar'
                                >
                                    <FaSearch className="me-1" /> {/* Ícono de lupa */}

                                </Button>
                            {userRole === 'admin' || userRole === 'superuser' ? (
                                    
                            <Button variant="btn custom" onClick={() => navigate('create')} className="btn-custom" title='Crear Voluntariado'>
                            <i className="bi bi-person-plus-fill me-2  "></i> Nuevo
                            </Button>
                            ): null}
                        </div>
            </div>
            <div className="d-flex mb-3">
                <Form.Select
                    name="area_voluntariado_id"
                    value={filters.area_voluntariado_id}
                    onChange={handleFilterChange}
                    className="me-2"
                    style={{ width: '150px' }}
                >
                    <option value="">Área</option>
                    {areaOptions.map(option => (
                        <option key={option.id} value={option.id}>{option.descripcion}</option>
                    ))}
                </Form.Select>
                

                <Form.Select
                    name="nivel_instruccion_id"
                    value={filters.nivel_instruccion_id}
                    onChange={handleFilterChange}
                    className="me-2"
                    style={{ width: '150px' }}
                >
                    <option value="">Nivel de Instrucción</option>
                    {nivelOptions.map(option => (
                        <option key={option.id} value={option.id}>{option.descripcion}</option>
                    ))}
                </Form.Select>

                <Form.Select
                    name="genero_id"
                    value={filters.genero_id}
                    onChange={handleFilterChange}
                    className="me-2"
                    style={{ width: '150px' }}
                >
                    <option value="">Género</option>
                    {generoOptions.map(option => (
                        <option key={option.id} value={option.id}>{option.descripcion}</option>
                    ))}
                </Form.Select>
                <Form.Select
                    name="centro_id"
                    value={filters.centro_id}
                    onChange={handleFilterChange}
                    className="me-2"
                    style={{ width: '150px' }}
                >
                    <option value="">Centro</option>
                    {centroOptions.map(option => (
                        <option key={option.id} value={option.id}>{option.descripcion}</option>
                    ))}
                </Form.Select>
            </div>
            <div className="cards-container"></div>
            <PaginationTable
                data={voluntariados}  // Datos filtrados
                itemsPerPage={itemsPerPage}
                columns={columns}
                renderItem={renderItem}
                currentPage={currentPage}  // Página actual
                onPageChange={setCurrentPage}  // Función para cambiar de página
                totalPages={totalPages}  // <--- Añade esta línea si aún no está

                />



             {/* Modal  de eliminación */}
             <Modal show={showModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirmar eliminación</Modal.Title>
                </Modal.Header>
                <Modal.Body>¿Estás seguro de que deseas eliminar este Voluntariado?</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>
                        Cancelar
                    </Button>
                    <Button variant="danger" onClick={deleteVoluntariados}>
                        Eliminar
                    </Button>
                </Modal.Footer>
            </Modal>
            <ToastContainer />
        </div>
        <div className="col-lg-12 d-flex justify-content-between" style={{ gap: '20px', marginTop:'10px' }}>
            <div className="chart-box" style={{ flex: '1 1 31%', maxWidth: '31%', marginRight: '10px'}}>
            <h4 style={{ fontSize: '1.2rem', textAlign: 'center' }}>Distribución por Área</h4>

                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={areaData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            fill="#82ca9d"
                            label={({ name, value }) => `${name}: ${value}`}
                        >
                            {areaData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
          
            </div>

            <div className="chart-box " style={{flex: '1 1 31%', maxWidth: '31%', marginRight: '10px'}}>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={NivelData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8884d8">
                        {NivelData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>


            </div>
            <div className="chart-box "style={{ flex: '1 1 31%', maxWidth: '31%', marginRight: '10px'}}>
            <h4 style={{ fontSize: '1.2rem' }}>Distribución por Centro</h4>
            <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={centroData} cx="50%" cy="50%" outerRadius="80%">
                    <PolarGrid />
                    <PolarAngleAxis dataKey="name" />
                    <PolarRadiusAxis angle={30} domain={[0, Math.max(...centroData.map(d => d.count))]} />
                    <Radar name="Centros" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                    <Legend />
                    <Tooltip />
                </RadarChart>
            </ResponsiveContainer>

            </div>
            </div>
        </div>
        </div>
        </div>
    );
};

export default ShowVoluntariados;
