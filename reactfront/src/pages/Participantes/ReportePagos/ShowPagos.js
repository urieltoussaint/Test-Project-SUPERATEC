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



const ShowPagos = () => {
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
    const [avgMontoCancelado, setAvgMontoCancelado] = useState(0);
    const [latestTasa, setLatestTasa] = useState({ tasa: 0, created_at: '' });
    const [loadingData, setLoadingData] = useState(false); // Estado para controlar la recarga
    const [range, setRange] = useState(30); // Estado para seleccionar el rango de días
    const [totalPages, setTotalPages] = useState(1); // Default to 1 page initially


    
    const handleShowModal = (id) => {
        setSelectedId(id);  // Almacena el ID del participante que se va a eliminar
        setShowModal(true); // Muestra el modal
    };
    
    const handleCloseModal = () => {
        setShowModal(false); // Cierra el modal
    };   

    useEffect(() => {
        setLoading(true);
        Promise.all([getAllReportes(),getLatestTasaBCV()]).finally(() => {
            setLoading(false);
        });
    }, []);

   // Nueva función para obtener los reportes y estadísticas en una sola solicitud
const getAllReportes = async (page = 1) => {
    try {
        const token = localStorage.getItem('token');

        // Parámetros de solicitud incluyendo cédula y página actual
        const params = {
            page,
            ...(searchCedula && { cedula_identidad: searchCedula }) // Solo envía `cedula_identidad` si `searchCedula` tiene valor
        };

        // Realiza la solicitud a la nueva ruta con estadísticas
        const response = await axios.get(`${endpoint}/pagos-estadisticas`, {
            headers: { Authorization: `Bearer ${token}` },
            params
        });

        // Actualiza los datos de la tabla paginada
        const reportes = response.data.datos.data || []; // Asegura que no haya errores si `data` está vacío
        setReportes(reportes);
        setFilteredReportes(reportes);
        setCurrentPage(page); // Actualiza el estado de la página actual
        setTotalPagos(response.data.estadisticas.totalPagos); // Total de pagos de las estadísticas
        setAvgMontoCancelado(response.data.estadisticas.promedioMontoCancelado); // Promedio del monto cancelado
        setTotalPages(response.data.datos.last_page || 1); // Total de páginas para la paginación

    } catch (error) {
        setError('Error fetching data');
        console.error('Error fetching data:', error);
    }
};

// Función para manejar el cambio de página
const handlePageChange = (newPage) => {
    setCurrentPage(newPage); // Actualiza la página actual
    getAllReportes(newPage); // Obtiene los datos para la nueva página
};

// Función para manejar el clic en el botón de búsqueda
const handleSearchClick = () => {
    getAllReportes(1); // Realiza la búsqueda en la primera página
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
    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchCedula(value);
 
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


    const calculateStats = (reportes) => {
        setTotalPagos(reportes.length);
    
        const totalMontoCancelado = reportes.reduce((acc, pago) => acc + parseFloat(pago.monto_cancelado), 0);
        const avgMonto = totalMontoCancelado / reportes.length || 0;
        setAvgMontoCancelado(avgMonto.toFixed(2));
    };

    const getFilteredDataByFecha = () => {
        const today = moment();
        const filteredData = filteredReportes.filter(reporte => {
            const pagoDate = moment(reporte.fecha);
            return pagoDate.isAfter(today.clone().subtract(range, 'days'));
        });
    
        // Agrupar por fecha
        const dateCounts = filteredData.reduce((acc, reporte) => {
            const fecha = moment(reporte.fecha).format('YYYY-MM-DD');
            acc[fecha] = (acc[fecha] || 0) + 1;
            return acc;
        }, {});
    
        return Object.keys(dateCounts).map(date => ({
            fecha: date,
            count: dateCounts[date]
        }));
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
                    <div className="stat-number" style={{ color: '#ffda1f', fontSize: '1.2rem' }}>{avgMontoCancelado} $</div>
                    <div className="stat-label">Avg de Monto Cancelado</div>
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
                                placeholder="Buscar por cédula"
                                value={searchCedula}
                                onChange={handleSearchChange}
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

export default ShowPagos;
