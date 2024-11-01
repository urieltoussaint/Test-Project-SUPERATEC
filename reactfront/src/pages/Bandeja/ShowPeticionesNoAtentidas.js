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

const ShowPeticionesNoAtendidas = () => {
    const [peticiones, setPeticiones] = useState([]);
    const [filteredPeticiones, setFilteredPeticiones] = useState([]);
    const [error, setError] = useState(null);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [selectedPeticion, setSelectedPeticion] = useState(null);
    const { setLoading } = useLoading();
    const [rejectComment, setRejectComment] = useState('');
    const navigate = useNavigate();
    const itemsPerPage = 4;
    const userId = parseInt(localStorage.getItem('user'));
    const [currentPage, setCurrentPage] = useState(1);  // Estado para la página actual
    const [loadingData, setLoadingData] = useState(false); // Estado para controlar la recarga
    const [attendedPeticiones, setAttendedPeticiones] = useState([]);
    const [selectedDateRange, setSelectedDateRange] = useState('');
    const [graphData, setGraphData] = useState([]);
    const [allPeticiones, setAllPeticiones] = useState([]);



    useEffect(() => {
        setLoading(true);
        getAllPeticiones().finally(() => {
            setLoading(false);
        });
    }, []);

    const getAllPeticiones = async () => {
        try {
            const token = localStorage.getItem('token');
            const roleId = parseInt(localStorage.getItem('role_id'));
            let allPeticiones = [];
            let currentPage = 1;
            let totalPages = 1;
    
            while (currentPage <= totalPages) {
                const response = await axios.get(`${endpoint}/peticiones?with=user,zonas&page=${currentPage}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
    
                allPeticiones = [...allPeticiones, ...response.data.data];
                totalPages = response.data.last_page;
                currentPage++;
            }
    
            // Filtrar las peticiones atendidas (status=true)
            const filteredPeticiones = allPeticiones.filter(
                (peticion) => (peticion.destinatario_id === userId || peticion.role_id === roleId) && peticion.status === true
            );
            // Filtrar peticiones no atendidas (status=false)
            const noattended = allPeticiones.filter(
                (peticion) => (peticion.destinatario_id === userId || peticion.role_id === roleId) && peticion.status === false
            );
    
            
    
            // Ordenar las peticiones por la fecha de finalización (finish_time) en orden descendente (más reciente primero)
            const sortedPeticiones = filteredPeticiones.sort((a, b) => new Date(b.finish_time) - new Date(a.finish_time));
    
            setPeticiones(sortedPeticiones);          // Peticiones no atendidas
            setFilteredPeticiones(sortedPeticiones);  // Actualiza el estado de peticiones no atendidas
            setAttendedPeticiones(noattended);          // Actualiza el estado de peticiones atendidas
            setCurrentPage(1);
            generateGraphData(allPeticiones); 
            setAllPeticiones(allPeticiones);
            
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
   

    const renderStatusDot = (created_at, status) => {
        return (
            <div
                style={{
                    height: '20px',
                    width: '20px',
                    borderRadius: '50%',
                    backgroundColor: 'gray', // Mostrará el punto gris para peticiones atendidas
                    display: 'inline-block',
                }}
            ></div>
        );
    };

    const handleDateRangeChange = (e) => {
        const value = e.target.value;
        setSelectedDateRange(value);
        applyDateFilter(value);
    };
    const applyDateFilter = (range) => {
        const now = moment();  // Momento actual
        let filtered = [...peticiones];
    
        if (range === 'hoy') {
            filtered = filtered.filter(peticion => moment(peticion.finish_time).isSame(now, 'day'));
        } else if (range === '3dias') {
            filtered = filtered.filter(peticion => moment(peticion.finish_time).isAfter(now.subtract(3, 'days')));
        } else if (range === '7dias') {
            filtered = filtered.filter(peticion => moment(peticion.finish_time).isAfter(now.subtract(7, 'days')));
        } else if (range === '30dias') {
            filtered = filtered.filter(peticion => moment(peticion.finish_time).isAfter(now.subtract(30, 'days')));
        } else if (range === '60dias') {
            filtered = filtered.filter(peticion => moment(peticion.finish_time).isAfter(now.subtract(60, 'days')));
        }
    
        setFilteredPeticiones(filtered);  // Actualiza el estado con las peticiones filtradas por fecha
        setCurrentPage(1);  // Resetea la paginación a la primera página
    };

    const columns = ["Status", "Usuario Request", "key", "Zona", "Fecha de creación", "Comentarios", "Fecha Finalizada", "Usuario que Atendió"];

    const renderItem = (peticiones) => (
        <tr key={peticiones.id} className={peticiones.status ? "attended-row" : ""}>
            <td className="text-center">{renderStatusDot(peticiones.created_at, peticiones.status)}</td>
            <td className="text-center">{peticiones.user?.username}</td>
            <td className="text-center">{peticiones.key}</td>
            <td className="text-center">{peticiones.zonas?.name}</td>
            <td className="text-center">{moment(peticiones.finish_time).format('YYYY-MM-DD')}</td>
            <td className="text-center">{peticiones.comentario}</td>
            <td className="text-center actions-column">
                <span>{moment(peticiones.finish_time).format('YYYY-MM-DD HH:mm')}</span>
            </td>
            <td className="text-center">{peticiones.user_success?.username}</td> {/* Mostrar el nombre del usuario que atendió la petición */}
        </tr>
    );
    

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




    return (

        <div className="container-fluid " style={{ fontSize: '0.85rem' }}>
            <div className="stat-box mx-auto col-lg-11" style={{ maxWidth: '100%' }}> 
                {/* Total de Participantes */}
                <div className="stat-card" style={{  }}>
                    <div className="stat-icon" style={{ fontSize: '14px', color: '#333', marginBottom: '1px' }}><RiCheckboxBlankCircleFill /></div>
                    <div className="stat-number" style={{ color: 'rgba(255, 74, 74, 0.9) ', fontSize: '1.8rem' }}>{attendedPeticiones.length}</div>
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
                    <div className="stat-icon" style={{ fontSize: '14px', color: '#333', marginBottom: '1px' }}>
                        <FaCheckCircle /> {/* Icono de peticiones atendidas */}
                    </div>
                    <div className="stat-number" style={{ color: '#58c765', fontSize: '1.8rem' }}>
                        {filteredPeticiones.length} {/* Aquí se mostrará el total de peticiones atendidas */}
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
                            variant="info" 
                            onClick={() => navigate('/peticiones')}
                            className="custom-eye-button" 
                            style={{ padding: '8px 16px', width: '250px' }} // Añadimos padding más amplio
                            >
                            <i className="bi bi-eye"></i> Mostrar No Atendidas
                            </Button>
                        </div>
                    </div>
            <h5>Peticiones Atendidas</h5>
            <div className="d-flex justify-content-start align-items-center mb-3">
                        
                        <Form.Select
                            value={selectedDateRange}
                            onChange={handleDateRangeChange}
                            className="me-0"
                            style={{ width: 'auto' }}
                        >
                            <option value="">Filtrar por Fecha Finalizada</option>
                            <option value="hoy">Hoy</option>
                            <option value="3dias">Últimos 3 días</option>
                            <option value="7dias">Últimos 7 días</option>
                            <option value="30dias">Últimos 30 días</option>
                            <option value="60dias">Últimos 60 días</option>
                        </Form.Select>
                    </div>
                        <PaginationTable
                        data={filteredPeticiones}
                        itemsPerPage={itemsPerPage}
                        columns={columns}
                        renderItem={renderItem}
                        currentPage={currentPage}
                        onPageChange={setCurrentPage}
                        />

            

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

export default ShowPeticionesNoAtendidas;
