import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal'; 
import { useLoading } from '../../components/LoadingContext'; 
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PaginationTable from '../../components/PaginationTable';
import moment from 'moment';
import './ShowPeticiones.css'; 
import { FaCheckCircle, FaSync, FaUserFriends,FaSearch } from 'react-icons/fa';
import { ProgressBar } from 'react-bootstrap';
import { RiCheckboxBlankCircleFill, RiCheckboxIndeterminateFill } from "react-icons/ri";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';






const endpoint = 'http://localhost:8000/api';

const ShowPeticiones = () => {
    const [peticiones, setPeticiones] = useState([]);
    const [filteredPeticiones, setFilteredPeticiones] = useState([]);
    const [selectedStatus, setSelectedStatus] = useState(''); 
    const [error, setError] = useState(null);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [selectedPeticion, setSelectedPeticion] = useState(null);
    const { setLoading } = useLoading();
    const [rejectComment, setRejectComment] = useState('');

    const navigate = useNavigate();
    const itemsPerPage = 5;
    const [currentPage, setCurrentPage] = useState(1);  // Estado para la página actual
    const userId = parseInt(localStorage.getItem('user'));
    const [loadingData, setLoadingData] = useState(false); // Estado para controlar la recarga
    const [atendidas, setAtendidas] = useState([]);
    const [noAtendidas, setNoAtendidas] = useState([]);

    const [graphData, setGraphData] = useState([]);
    const [allPeticiones, setAllPeticiones] = useState([]);
    const [greenCount, setGreenCount] = useState(0);
    const [orangeCount, setOrangeCount] = useState(0);
    const [redCount, setRedCount] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [filteredGraphData, setFilteredGraphData] = useState([]); // Nuevo estado para datos de la gráfica filtrados
    const [selectedDateRange, setSelectedDateRange] = useState('30d');

    const [selectedFinishDateRange, setSelectedFinishDateRange] = useState(''); 

    // Ajusta el handle para este nuevo filtro
    const handleFinishDateRangeChange = (e) => {
        setSelectedFinishDateRange(e.target.value);
    };





    useEffect(() => {
        setLoading(true);
        getAllPeticiones(currentPage, selectedStatus)
          setLoading(false);
    }, [currentPage, selectedStatus]);
    
    
    

    const getAllPeticiones = async (page = 1, status = '') => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${endpoint}/peticionesAtendidas`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { 
                    page, 
                    days: selectedFinishDateRange  // Incluye el nuevo filtro de días aquí
                },
            });
    
            const { peticiones, estadisticas } = response.data;
    
            setPeticiones(peticiones.data || []);
            setTotalPages(peticiones.last_page || 1);
            setCurrentPage(page);
    
            setAtendidas(estadisticas.totalAtendidas || 0);
            setNoAtendidas(estadisticas.totalNoAtendidas || 0);
            setGraphData(estadisticas.graphData || []);
         
            
            generateGraphData();
    
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };
    
    
    

    // Ejecutar generateGraphData cuando graphData y selectedDateRange cambien
    useEffect(() => {
        generateGraphData();
    }, [selectedDateRange, graphData]);

    // Llama a getAllPeticiones cada vez que se cambia el filtro de fecha seleccionada
useEffect(() => {
    getAllPeticiones(currentPage, selectedStatus);
}, [selectedFinishDateRange]); // Observa selectedFinishDateRange para enviar la solicitud al cambiar el filtro

   
    const handleDateRangeChange = (e) => {
        setSelectedDateRange(e.target.value);
    };
    
    
  

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };


// Función para calcular el número de días desde la creación
const calculatestatusSinceCreation = (created_at) => {
    const creationDate = moment(created_at); // Convierte la fecha de creación en un objeto moment
    const now = moment(); // Obtiene la fecha actual
    return now.diff(creationDate, 'status'); // Calcula la diferencia en días
};



// Función para renderizar el punto de estado
const renderStatusDot = () => {
    const color = 'gray';
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




const handleStatusChange = (e) => {
    const value = e.target.value;
    setSelectedStatus(value);
};

  

const handleNavigate = (peticiones) => {
    const id = peticiones.zona_id;  // Usa `zona_id` directamente
    if (id === 1) {
        navigate(`/datos/${peticiones.key}/edit`);
    } else if (id === 2) {
        navigate(`/cursos/${peticiones.key}/edit`);
    } else if (id === 3) {
        navigate(`/pagos/curso/${peticiones.key}`);
    } else if (id === 4) {
        navigate(`/cursos/${peticiones.key}/pagos`);
    } else if (id === 6) {
        navigate(`/patrocinantes/${peticiones.key}/edit`);
    } else if (id === 7) {
        navigate(`/procedencias/edit/${peticiones.key}`);
    } else if (id === 8) {
        navigate(`/promocion/${peticiones.key}/edit`);
    } else if (id === 9) {
        navigate(`/voluntariados/${peticiones.key}/edit`);
    } else {
        toast.error('Zona no válida');
    }
};


    const handleRejectClick = (peticion) => {
        setSelectedPeticion(peticion);
        setShowRejectModal(true);
    };

    const handleRejectConfirm = async () => {
        if (!selectedPeticion) return;
        try {
            const token = localStorage.getItem('token');

            await axios.delete(`${endpoint}/peticiones/${selectedPeticion.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const newPeticion = {
                user_id: userId,
                destinatario_id: selectedPeticion.user_id,
                role_id: null,
                zona_id: selectedPeticion.zona_id,
                status: false,
                finish_time: null,
                key: selectedPeticion.key,
                comentario: rejectComment
            };

            await axios.post(`${endpoint}/peticiones`, newPeticion, {
                headers: { Authorization: `Bearer ${token}` }
            });

            getAllPeticiones();
            toast.success('Petición rechazada y reenviada al solicitante.');
        } catch (error) {
            setError('Error al rechazar la petición');
            console.error('Error al rechazar la petición:', error);
            toast.error('Error al rechazar petición');
        } finally {
            setShowRejectModal(false);
            setRejectComment('');
        }
    };

    const loadData = async () => {
        setLoadingData(true); // Inicia el estado de carga
        try {
            await getAllPeticiones(); // Espera a que getAllDatos haga la solicitud y actualice los datos
        } catch (error) {
            console.error('Error recargando los datos:', error); // Maneja el error si ocurre
        } finally {
            setLoadingData(false); // Detener el estado de carga cuando la solicitud haya terminado
        }
    };

    const generateGraphData = () => {
        if (!graphData || graphData.length === 0) {
            return; // Sal de la función si no hay datos
        }
    
        const latestDate = moment(graphData[graphData.length - 1].date, 'YYYY-MM-DD').endOf('day');
        let startDate;
    
        switch (selectedDateRange) {
            case '7d':
                startDate = latestDate.clone().subtract(7, 'status').startOf('day');
                break;
            case '15d':
                startDate = latestDate.clone().subtract(15, 'status').startOf('day');
                break;
            case '30d':
                startDate = latestDate.clone().subtract(30, 'status').startOf('day');
                break;
            case '60d':
                startDate = latestDate.clone().subtract(60, 'status').startOf('day');
                break;
            default:
                startDate = latestDate.clone().subtract(7, 'status').startOf('day');
                break;
        }
    
        const filteredData = graphData.filter((p) => {
            const currentDate = moment(p.date, 'YYYY-MM-DD');
            return currentDate.isSameOrAfter(startDate) && currentDate.isSameOrBefore(latestDate);
        });
    
        setFilteredGraphData(filteredData);
    };

    const statusMapping = {
        '7d': 7,
        '15d': 15,
        '30d': 30,
        '60d': 60,
    };
    const status = statusMapping[selectedDateRange] || 7;
    
    
    
    
    

    const columns = ["Status", "Usuario Request", "Zona", "Fecha de creación", "Comentarios", "Fecha Finalizada", "Usuario que Atendió"];

    const renderItem = (peticiones) => (
        <tr key={peticiones.id} className={peticiones.status ? "attended-row" : ""}>
            <td className="text-center">{renderStatusDot(peticiones.created_at, peticiones.status)}</td>
            <td className="text-center">{peticiones.user_username}</td>
            <td className="text-center">{peticiones.zona_name}</td>
            <td className="text-center">{moment(peticiones.finish_time).format('YYYY-MM-DD')}</td>
            <td className="text-center">{peticiones.comentario}</td>
            <td className="text-center actions-column">
                <span>{moment(peticiones.finish_time).format('YYYY-MM-DD HH:mm')}</span>
            </td>
            <td className="text-center">{peticiones.user_success_username}</td> {/* Mostrar el nombre del usuario que atendió la petición */}
        </tr>
    );
    
    const totalPeticiones = greenCount + orangeCount + redCount;


    return (
        <div className="container-fluid " style={{ fontSize: '0.85rem' }}>
            <div className="stat-box mx-auto col-lg-11" style={{ maxWidth: '100%' }}> 
                <div className="stat-card" style={{  }}>
                    <div className="stat-icon" style={{ fontSize: '14px', color: '#333', marginBottom: '1px' }}><RiCheckboxBlankCircleFill /></div>
                    <div className="stat-number" style={{ color: 'rgba(255, 74, 74, 0.9) ', fontSize: '1.8rem' }}>{noAtendidas}</div>
                    <h4 style={{ fontSize: '1.1rem', color:'gray' }}>Peticiones Atentidas</h4>
                    
                </div>
                <div className="stat-card" style={{ 
                    backgroundColor: '#fff', 
                    padding: '15px', 
                    borderRadius: '10px', 
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', 
                    textAlign: 'center',
                    minWidth: '250px'
                }}>
                    

                   
                    
                 
                    <div className="stat-icon" style={{ fontSize: '14px', color: '#333', marginBottom: '1px' }}>
                        <FaCheckCircle /> {/* Icono de peticiones atendidas */}
                    </div>
                    <div className="stat-number" style={{ color: '#58c765', fontSize: '1.8rem' }}>
                        {atendidas} {/* Aquí se mostrará el total de peticiones atendidas */}
                    </div>
                    <h4 style={{ fontSize: '1.1rem', color:'gray' }}>Peticiones Atendidas</h4>
                </div>
                        
        </div>
        
                <div className="row" style={{ marginTop: '10px' }}>
                {/* Columna para la tabla */}
                <div className="col-lg-11 mx-auto"> {/* Agregamos 'mx-auto' para centrar */}
                    <div className="card-box" style={{ padding: '20px', width: '100%', margin: '0 auto' }}> 
                    <div className="d-flex justify-content-between align-items-center mb-3" style={{ gap: '0px' }}>
                        <h1 style={{ marginRight: '10px' }}>Bandeja de Entrada</h1>

                        <div className="d-flex" style={{ gap: '5px' }}> 
                            <Button
                            variant="info"
                            onClick={loadData}
                            disabled={loadingData} // Deshabilita el botón si está cargando
                            style={{ padding: '8px 16px', width: '90px' }} // Ajustamos el padding para aumentar el grosor
                            >
                            {/* Icono de recarga */}
                            {loadingData ? (
                                <FaSync className="spin" /> // Ícono girando si está cargando
                            ) : (
                                <FaSync />
                            )}
                            </Button>
                           
                            
                            <Button 
                            variant="succes" 
                            onClick={() => navigate('/peticiones')} 
                            className="custom-eye-button" 
                            style={{ padding: '8px 16px', width: '200px' }} // Añadimos padding más amplio
                            >
                            <i className="bi bi-eye"></i> Mostrar No Atendidas
                            </Button>
                        </div>
                        </div>

                    <h5>Peticiones No Atendidas</h5>

                    <div className="d-flex justify-content-start align-items-center mb-3">
                    <Form.Select
                        value={selectedFinishDateRange} // Cambia selectedStatus a selectedFinishDateRange
                        onChange={handleFinishDateRangeChange} // Cambia handleStatusChange a handleFinishDateRangeChange
                        className="me-0"
                        style={{ width: 'auto' }}
                    >
                        <option value="">Filtrar por Fecha Finalizada</option>
                        <option value="7d">Últimos 7 días</option>
                        <option value="15d">Últimos 15 días</option>
                        <option value="30d">Últimos 15 días</option>
                        <option value="60d">Últimos 60 días</option>
                    </Form.Select>


                        

                    </div>


                    <PaginationTable
                        data={peticiones}
                        columns={columns}
                        renderItem={renderItem}
                        currentPage={currentPage}
                        onPageChange={handlePageChange}
                        totalPages={totalPages} // Muestra el total de páginas según el backend
                    />
            {/* Modal de confirmación para rechazar petición */}
            <Modal show={showRejectModal} onHide={() => setShowRejectModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirmar Rechazo</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedPeticion && (
                    <>
                        <p>¿Estás seguro de que deseas rechazar la petición de {selectedPeticion.user?.username}?</p>
                        <Form.Group controlId="rejectComment">
                        <Form.Label>Comentario (opcional)</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            value={rejectComment}
                            onChange={(e) => setRejectComment(e.target.value)}
                            placeholder="Escribe el motivo del rechazo o algún comentario."
                        />
                        </Form.Group>
                    </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowRejectModal(false)}>Cancelar</Button>
                    <Button variant="danger" onClick={handleRejectConfirm}>Rechazar</Button>
                </Modal.Footer>
            </Modal>

            <ToastContainer />
            </div>
            <div className="col-lg-11 mx-auto">
                <div className="chart-box" style={{ marginRight: '10px', marginTop:'30px' }}>
                    <h4>Comparativa de Peticiones Recibidas vs. Atendidas</h4>
                    <div className="d-flex justify-content-start align-items-center mb-3">
        

                    <Form.Select
                        value={selectedDateRange}
                        onChange={(e) => {
                            setSelectedDateRange(e.target.value);
                            generateGraphData();  // Generar la gráfica con el nuevo rango
                        }}
                        className="me-1"
                        style={{ width: 'auto' }}
                    >
                        <option value="7d">Últimos 7 días</option>  
                        <option value="15d">Últimos 15 días</option>
                        <option value="30d">Últimos 30 días</option>
                        <option value="60d">Últimos 60 días</option>
                    </Form.Select>

                        </div>
                        <ResponsiveContainer width="100%" height={400}>
                            <LineChart data={filteredGraphData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="received" stroke="#8884d8" activeDot={{ r: 8 }} name="Recibidas" />
                                <Line type="monotone" dataKey="attended" stroke="#82ca9d" name="Atendidas" />
                            </LineChart>
                        </ResponsiveContainer>
                </div>
            </div>
        
        
        </div>


            

        </div>
        </div>
        
    );
};

export default ShowPeticiones;
