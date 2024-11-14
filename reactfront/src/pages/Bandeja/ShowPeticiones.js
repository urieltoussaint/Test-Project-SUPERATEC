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
import { FaCheckCircle, FaSync, FaUserFriends, } from 'react-icons/fa';
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
    const [attendedPeticiones, setAttendedPeticiones] = useState([]);
    const [selectedDateRange, setSelectedDateRange] = useState('7d');
    const [graphData, setGraphData] = useState([]);
    const [allPeticiones, setAllPeticiones] = useState([]);
    const [greenCount, setGreenCount] = useState(0);
    const [orangeCount, setOrangeCount] = useState(0);
    const [redCount, setRedCount] = useState(0);




    useEffect(() => {
        setLoading(true);
        getAllPeticiones ()
            .finally(() => setLoading(false));
    }, []); 
    

    const getAllPeticiones = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${endpoint}/peticiones-estadisticas`, {
                headers: { Authorization: `Bearer ${token}` },
            });
    
            // Desestructurar los datos de la respuesta correctamente
            const { peticiones, estadisticas } = response.data;
    
            // Peticiones paginadas
            setPeticiones(peticiones.data || []); // Usar directamente `peticiones.data` según la estructura que muestra la consola
            setFilteredPeticiones(peticiones.data || []);
            setCurrentPage(1);
    
            // Actualizar estadísticas
            setAttendedPeticiones(estadisticas.totalAtendidas || 0);
            setGraphData(estadisticas.graphData || []);
    
            // Actualizar los contadores de estados
            setGreenCount(estadisticas.clasificacionAntiguedad.reciente || 0);
            setOrangeCount(estadisticas.clasificacionAntiguedad.urgente || 0);
            setRedCount(estadisticas.clasificacionAntiguedad.critico || 0);
    
        } catch (error) {
            setError('Error fetching data');
            console.error('Error fetching data:', error);
        }
    };
    
    

       // UseEffect para regenerar grafica
       useEffect(() => {
        if (allPeticiones.length > 0) {
            generateGraphData(allPeticiones);  
        }
    }, [selectedDateRange, allPeticiones]);  
    const handleDateRangeChange = (e) => {
        const value = e.target.value;
        setSelectedDateRange(value);
    };


// Función para calcular el número de días desde la creación
const calculateDaysSinceCreation = (created_at) => {
    const creationDate = moment(created_at); // Convierte la fecha de creación en un objeto moment
    const now = moment(); // Obtiene la fecha actual
    return now.diff(creationDate, 'days'); // Calcula la diferencia en días
};

// Definimos los colores en un objeto de configuración
const statusColors = {
    reciente: 'green',
    urgente: 'orange',
    critico: 'red'
};

// Función para obtener el color de estado basado en la antigüedad de creación
const getStatusColor = (created_at) => {
    const daysSinceCreation = calculateDaysSinceCreation(created_at);
    if (daysSinceCreation > 10) return statusColors.critico;
    if (daysSinceCreation > 2) return statusColors.urgente;
    return statusColors.reciente;
};

// Función para renderizar el punto de estado
const renderStatusDot = (created_at) => {
    const color = getStatusColor(created_at);
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
        const { id } = peticiones.zonas || {};
        if (id === 1) {
            navigate(`/datos/${peticiones.key}/edit`);
        } else if (id === 2) {
            navigate(`/cursos/${peticiones.key}/edit`);
        } else if (id === 3) {
            navigate(`/pagos/curso/${peticiones.key}`);
        } 
         else if (id === 4) {
        navigate(`/cursos/${peticiones.key}/pagos`);
        }
        else if (id === 6) {
            navigate(`/patrocinantes/${peticiones.key}/edit`);
            }
        else if (id === 7) {
                navigate(`/procedencias/edit/${peticiones.key}`);
                }
        else if (id === 8) {
                navigate(`/promocion/${peticiones.key}/edit`);
                }    
        else if (id === 9) {
            navigate(`/voluntariados/${peticiones.key}/edit`);
            }             
        else {
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

    const generateGraphData = (allPeticiones) => {
        const now = moment().endOf('day'); 
        let startDate;
        const token = localStorage.getItem('token');
        const roleId = parseInt(localStorage.getItem('role_id'));
    
        // Filtra peticiones por usuario o rol
        const userFilteredPeticiones = allPeticiones.filter(
            (peticion) => (peticion.destinatario_id === userId || peticion.role_id === roleId)
        );
    
        switch (selectedDateRange) {
            case '7d':
                startDate = now.clone().subtract(7, 'days').startOf('day');
                break;
            case '15d':
                startDate = now.clone().subtract(15, 'days').startOf('day');
                break;
            case '30d':
                startDate = now.clone().subtract(30, 'days').startOf('day');
                break;
            case '60d':
                startDate = now.clone().subtract(60, 'days').startOf('day');
                break;
            default:
                startDate = now.clone().subtract(7, 'days').startOf('day'); // Default to last 7 days
                break;
        }
    
        // Filtra peticiones según la fecha y el usuario/rol
        const filteredPeticiones = userFilteredPeticiones.filter(
            (p) => moment(p.created_at).isSameOrAfter(startDate) && moment(p.created_at).isSameOrBefore(now)
        );
    
        const graphData = [];
    
        for (let m = startDate.clone(); m.isSameOrBefore(now); m.add(1, 'days')) {
            const day = m.format('YYYY-MM-DD');
    
            // Cuenta las peticiones no atendidas
            const peticionesCount = filteredPeticiones.filter((p) => moment(p.created_at).isSame(day, 'day')).length;
    
            // Cuenta las peticiones atendidas
            const attendedCount = filteredPeticiones.filter((p) => p.finish_time && moment(p.finish_time).isSame(day, 'day')).length;
    
            // Agrega el punto de datos a la gráfica
            graphData.push({
                date: day,
                received: peticionesCount,
                attended: attendedCount,
            });
        }
    
        setGraphData(graphData); // Actualiza la gráfica
    };




    const columns = ["Status", "Usuario Request", "Zona", "Fecha de creación", "Comentarios", "Acciones"];

    const renderItem = (peticiones) => (
        <tr key={peticiones.id}>
            <td className="status">{renderStatusDot(peticiones.created_at)}</td>
            <td className="usuario">{peticiones.user_username}</td>
            <td className="zona">{peticiones.zona_name}</td>
            <td className="fecha">{moment(peticiones.created_at).format('YYYY-MM-DD')}</td>
            <td className="comentarios">{peticiones.comentario}</td>
            <td className="acciones">
            <div className="d-flex justify-content-around">
            <Button
                variant="btn btn-success"
                onClick={() => handleNavigate(peticiones)}
                className="me-2 icon-white"
            >
                <i className="bi bi-check-square"></i> 
            </Button>
            <Button
                variant="btn btn-danger"
                onClick={() => handleRejectClick(peticiones)}
            >
                <i className="bi bi-x-lg"></i> 
            </Button>
            </div>
            </td>
        </tr>
    );

    const totalPeticiones=filteredPeticiones.length;

    return (
        <div className="container-fluid " style={{ fontSize: '0.85rem' }}>
            <div className="stat-box mx-auto col-lg-11" style={{ maxWidth: '100%' }}> 
                {/* Total de Participantes */}
                <div className="stat-card" style={{  }}>
                    <div className="stat-icon" style={{ fontSize: '14px', color: '#333', marginBottom: '1px' }}><RiCheckboxBlankCircleFill /></div>
                    <div className="stat-number" style={{ color: 'rgba(255, 74, 74, 0.9) ', fontSize: '1.8rem' }}>{filteredPeticiones.length}</div>
                    <h4 style={{ fontSize: '1.1rem', color:'gray' }}>Peticiones No Atentidas</h4>
                    
                </div>
                <div className="stat-card" style={{ 
                    backgroundColor: '#fff', 
                    padding: '15px', 
                    borderRadius: '10px', 
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', 
                    textAlign: 'center',
                    minWidth: '250px'
                }}>
                    

                    {/* Sección de conteo con barra de progreso alineada horizontalmente */}
                    <div className="stat-number" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}> 
                        <div style={{ textAlign: 'center', width: '30%' }}>
                            <span style={{ color: 'green', display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '0.9rem' }}>
                                <i className="bi bi-check-circle" style={{ marginBottom: '5px', fontSize: '0.9rem' }}></i>
                                Reciente: {greenCount}
                            </span>
                            {/* Barra de progreso para Reciente */}
                            <ProgressBar 
                                now={(greenCount / totalPeticiones) * 100} 
                                variant="success" 
                                style={{ height: '5px', marginTop: '5px', width: '100%' }}
                            />
                        </div>

                        <div style={{ textAlign: 'center', width: '30%' }}>
                            <span style={{ color: 'orange', display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '0.9rem' }}>
                                <i className="bi bi-exclamation-circle" style={{ marginBottom: '5px', fontSize: '0.9rem' }}></i>
                                Urgente: {orangeCount}
                            </span>
                            {/* Barra de progreso para Urgente */}
                            <ProgressBar 
                                now={(orangeCount / totalPeticiones) * 100} 
                                variant="warning" 
                                style={{ height: '5px', marginTop: '5px', width: '100%' }}
                            />
                        </div>

                        <div style={{ textAlign: 'center', width: '30%' }}>
                            <span style={{ color: 'red', display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '0.9rem' }}>
                                <i className="bi bi-x-circle" style={{ marginBottom: '5px', fontSize: '0.9rem' }}></i>
                                Crítico: {redCount}
                            </span>
                            {/* Barra de progreso para Crítico */}
                            <ProgressBar 
                                now={(redCount / totalPeticiones) * 100} 
                                variant="danger" 
                                style={{ height: '5px', marginTop: '5px', width: '100%' }}
                            />
                        </div>
                    </div>
                    
                    <h4 style={{ fontSize: '1.1rem', color: '#6c757d' }}>Cantidad por Status</h4>
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
                        {attendedPeticiones.length} {/* Aquí se mostrará el total de peticiones atendidas */}
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
                            onClick={() => navigate('/peticiones/Noat')} 
                            className="custom-eye-button" 
                            style={{ padding: '8px 16px', width: '200px' }} // Añadimos padding más amplio
                            >
                            <i className="bi bi-eye"></i> Mostrar Atendidas
                            </Button>
                        </div>
                        </div>

                    <h5>Peticiones No Atendidas</h5>

                    <div className="d-flex justify-content-start align-items-center mb-3">
                        <Form.Select
                        value={selectedStatus}
                        onChange={handleStatusChange}
                        className="me-2"
                        style={{ width: 'auto' }}
                        >
                        <option value="">Filtrar por Status</option>
                        <option value="green">Reciente (Verde)</option>
                        <option value="orange">Urgente (Naranja)</option>
                        <option value="red">Crítico (Rojo)</option>
                        </Form.Select>


                        <div className="ms-auto">
                        <span className="status-dot green"></span> Reciente (Verde)
                        <span className="status-dot orange"></span> Urgente (Naranja)
                        <span className="status-dot red"></span> Crítico (Rojo)
                        </div>

                    </div>

                    <PaginationTable
                        data={peticiones}
                        itemsPerPage={itemsPerPage}
                        columns={columns}
                        renderItem={renderItem}
                        currentPage={currentPage}
                        onPageChange={setCurrentPage}
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
                            generateGraphData(allPeticiones);  // Call the graph generation with the updated date range
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
                            <LineChart data={graphData}>
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
