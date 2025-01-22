import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Table from 'react-bootstrap/Table';
import { Modal } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import moment from 'moment';
import './ShowPagos.css';
import { useLoading } from '../../../components/LoadingContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PaginationTable from '../../../components/PaginationTable';
import { ResponsiveContainer,Line, LineChart,BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,AreaChart,Area,Radar,RadarChart, PieChart, Cell, Pie, ComposedChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { FaUserFriends, FaClock, FaBook,FaSync,FaSearch } from 'react-icons/fa';  // Importamos íconos de react-icons
import { RiCoinsFill} from "react-icons/ri";
import { TbCoins } from "react-icons/tb";


const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00C49F', '#FFBB28'];
const endpoint = 'http://localhost:8000/api';



const ShowPagosProgramas = () => {
    const [reportes, setReportes] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [filteredReportes, setFilteredReportes] = useState([]);
    const [searchCedula, setSearchCedula] = useState('');
    const [error, setError] = useState(null);
    const { id } = useParams();
    const navigate = useNavigate();
    const { setLoading } = useLoading();
    const userRole = localStorage.getItem('role'); // Obtener el rol del usuario desde el localStorage
    const itemsPerPage = 4; // Número de elementos por página
    const [currentPage, setCurrentPage] = useState(1);  // Estado para la página actual
    const [totalPagos, setTotalPagos] = useState(0);
    const [totalMontoCancelado, setTotalMontoCancelado] = useState(0);
    const [latestTasa, setLatestTasa] = useState({ tasa: 0, created_at: '' });
    const [loadingData, setLoadingData] = useState(false); // Estado para controlar la recarga
    const [range, setRange] = useState(30); // Estado para seleccionar el rango de días
    const [totalPages, setTotalPages] = useState(1); // Default to 1 page initially
    const [centroOptions, setCentroOptions] = useState([]);
    const [cohorteOptions, setCohorteOptions] = useState([]);
    const [periodoOptions, setPeriodoOptions] = useState([]);
    const {curso_id } = useParams();  // Obtener cedula y cursoId de la URL


     const [filters, setFilters] = useState({
                cedula_identidad: '',
                cohorte_id: '',
                centro_id: '',
            });
    
    const handleShowModal = (id) => {
        setSelectedId(id);  // Almacena el ID del participante que se va a eliminar
        setShowModal(true); // Muestra el modal
    };
    
    const handleCloseModal = () => {
        setShowModal(false); // Cierra el modal
    };   
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    useEffect(() => {
        setLoading(true);
        Promise.all([getAllReportes(),getLatestTasaBCV(),fetchFilterOptions()]).finally(() => {
            setLoading(false);
        });
    }, []);

   // Nueva función para obtener los reportes y estadísticas en una sola solicitud
const getAllReportes = async (page = 1) => {
    try {
        const token = localStorage.getItem('token');

        // Realiza la solicitud a la nueva ruta con estadísticas
        const response = await axios.get(`${endpoint}/pagos-estadisticas`, {
            headers: { Authorization: `Bearer ${token}` },
            params: { ...filters, page, curso_id }, // Incluye `page` y otros filtros en los parámetros}
        });

        // Actualiza los datos de la tabla paginada
        const reportes = response.data.datos.data || []; // Asegura que no haya errores si `data` está vacío
        setReportes(reportes);
        setFilteredReportes(reportes);
        setCurrentPage(page); // Actualiza el estado de la página actual
        setTotalPagos(response.data.estadisticas.totalPagos); // Total de pagos de las estadísticas
        setTotalMontoCancelado(response.data.estadisticas.totalMontoCancelado); // Promedio del monto cancelado
        setTotalPages(response.data.datos.last_page || 1); // Total de páginas para la paginación



    } catch (error) {
        setError('Error fetching data');
        console.error('Error fetching data:', error);
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

// Función para manejar el cambio de página
const handlePageChange = (newPage) => {
    setCurrentPage(newPage); // Actualiza la página actual
    getAllReportes(newPage); // Obtiene los datos para la nueva página
};




    const getLatestTasaBCV = async () => {
        try {
            const response = await axios.get(`${endpoint}/tasa_bcv`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            setLatestTasa({ tasa: response.data.tasa, created_at: response.data.created_at });
        } catch (error) {
            console.error('Error al obtener la última tasa BCV:', error);
        }
    };
    
    
    const deleteReporte = async () => {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`${endpoint}/pagos/${selectedId}`,{
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                getAllReportes();
                setShowModal(false); // Cierra el modal tras la eliminación exitosa
                toast.success('Reporte eliminado con éxito');
            } catch (error) {
                setError('Error deleting data');
                console.error('Error deleting data:', error);
                toast.error('Error al eliminar el reporte');
            }
        
    };

    if (error) {
        return <div>{error}</div>;
    }

    const loadData = async () => {
        setLoadingData(true); // Inicia el estado de carga
        try {
            await (getAllReportes(),getLatestTasaBCV()); // Espera a que getAllDatos haga la solicitud y actualice los datos
        } catch (error) {
            console.error('Error recargando los datos:', error); // Maneja el error si ocurre
        } finally {
            setLoadingData(false); // Detener el estado de carga cuando la solicitud haya terminado
        }
    };


    const columns = ["id", "Cédula", "Fecha de Pago", "Monto Cancelado", "Monto Restante", "Comentario","Acciones"];

    const renderItem = (reporte) => (
        <tr key={reporte.id}>
        <td className="col-idq">{reporte.id}</td>
        <td className="col-cedulaq">{reporte.cedula_identidad}</td>
        <td className="col-fechaq">{moment(reporte.fecha).format('YYYY-MM-DD')}</td>
        <td className="col-montoq">{reporte.monto_cancelado} $</td>
        <td className="col-montoq">{reporte.monto_restante} $</td>
        <td className="col-comentarioq">{reporte.comentario_cuota}</td>
        <td className="col-accionesq">
            <div className="d-flex justify-content-around">

                <Button
                    variant="btn btn-info" 
                    onClick={() => navigate(`/pagos/${reporte.id}`)}
                    className="me-2"
                >
                    <i className="bi bi-eye"></i>
                </Button>
                {userRole === 'admin' && (
                

                <Button
                variant="btn btn-danger"
                onClick={() => handleShowModal(reporte.id)}
                className="me-2"
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
            <div className="col-lg-11 mx-auto"> 
            <div className="stat-box d-flex justify-content-between" style={{ maxWidth: '100%' }}>
                {/* Total de Pagos */}
                <div className="stat-card" style={{ padding: '5px', margin: '0 10px', width: '22%' }}>
                    <div className="stat-icon"><RiCoinsFill /></div>
                    <div className="stat-number" style={{ color: '#58c765', fontSize: '1.2rem' }}>{totalPagos}</div>
                    <div className="stat-label">Total de Pagos</div>
                </div>

                {/* Promedio de Monto Cancelado */}
                <div className="stat-card" style={{ padding: '5px', margin: '0 10px', width: '22%' }}>
                    <div className="stat-icon"><TbCoins /></div>
                    <div className="stat-number" style={{ color: '#ffda1f', fontSize: '1.2rem' }}>{totalMontoCancelado} $</div>
                    <div className="stat-label">Total de Monto Cancelado</div>
                </div>

                {/* Última Tasa BCV */}
                <div className="stat-card" style={{ padding: '5px', margin: '0 10px', width: '22%' }}>
                    <div className="stat-icon"><FaClock /></div>
                    <div className="stat-number" style={{ color: '#ffda1f', fontSize: '1.6rem' }}>{latestTasa.tasa}</div>
                    <div className="stat-label" style={{ fontSize: '0.8rem', color: 'gray' }}>Última tasa BCV registrada</div>
                    <div className="stat-date" style={{ fontSize: '0.8rem', color: '#888' }}>{moment(latestTasa.created_at).format('YYYY-MM-DD')}</div>
                </div>
            </div>
            </div>



            <div className="row" style={{ marginTop: '10px' }}>
           



                {/* Columna para la tabla */}
                <div className="col-lg-11 mx-auto"> {/* Agregamos 'mx-auto' para centrar */}

                    <div className="card-box" style={{ padding: '20px', width: '100%', margin: '0 auto' }}> 
                        
                    <div className="d-flex justify-content-between align-items-center mb-3" style={{ gap: '0px' }}>
                        <h2>Lista de Reportes de Pagos</h2>
                        <div className="d-flex align-items-center">
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
                                style={{ padding: '5px 10px', width: '90px' }} // Ajusta padding y ancho

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
                                    onClick={getAllReportes}
                                    style={{ padding: '5px 10px', width: '120px' }} // Ajusta padding y ancho
                                >
                                    <FaSearch className="me-1" /> {/* Ícono de lupa */}
                                </Button>

                            {userRole === 'admin' ||userRole === 'pagos' ? (

                            <Button variant="btn custom" onClick={() => navigate('/pagos/create')} className="btn-custom">
                            <i className="bi bi-cash-coin me-2  "></i> Nuevo
                            </Button>
                            ):null}
                        </div>
                    </div>
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




                        </div>

                    {/* Tabla paginada */}
                    <PaginationTable
                        data={filteredReportes}
                        itemsPerPage={itemsPerPage}
                        columns={columns}
                        renderItem={renderItem}
                        currentPage={currentPage}
                        onPageChange={handlePageChange} // Llama a `handlePageChange` para cambiar la página
                        totalPages={totalPages}
                    />


                    {/* Modal  de eliminación */}
                    <Modal show={showModal} onHide={handleCloseModal}>
                        <Modal.Header closeButton>
                            <Modal.Title>Confirmar eliminación</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>¿Estás seguro de que deseas eliminar este Reporte de Pago?</Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={handleCloseModal}>
                                Cancelar
                    </Button>
                    <Button variant="danger" onClick={deleteReporte}>
                        Eliminar
                    </Button>
                </Modal.Footer>
            </Modal>
            <ToastContainer />
        </div>
       
        </div>
        </div>
        </div>
    );
};

export default ShowPagosProgramas;
