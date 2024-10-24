import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import moment from 'moment';
import './ShowPagos.css';
import { useLoading } from '../../../components/LoadingContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PaginationTable from '../../../components/PaginationTable';
import { Modal } from 'react-bootstrap';
import { FaUserFriends, FaClock, FaBook,FaSync } from 'react-icons/fa';  // Importamos íconos de react-icons
import { ResponsiveContainer,Line, LineChart,BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,AreaChart,Area,Radar,RadarChart, PieChart, Cell, Pie, ComposedChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import Form from 'react-bootstrap/Form';
import { RiCoinsFill} from "react-icons/ri";

import { TbCoins } from "react-icons/tb";




const endpoint = 'http://localhost:8000/api';

const ShowPagosCursos = () => {
    const [reportes, setReportes] = useState([]);
    const [filteredReportes, setFilteredReportes] = useState([]);
    const [error, setError] = useState(null);
    const [cedulaInscripcion, setCedulaInscripcion] = useState(null); // Estado para almacenar la cédula de la inscripción
    const [cursoCod, setCursoCod] = useState(null); // Estado para almacenar el código del curso
    const { inscripcion_curso_id } = useParams(); // Obtener el inscripcion_curso_id desde la URL
    const navigate = useNavigate();
    const { setLoading } = useLoading();
    const userRole = localStorage.getItem('role'); // Obtener el rol del usuario desde el localStorage
    const itemsPerPage = 4; // Número de elementos por página
    const [cursoId, setCursoId] = useState(null); // Estado para almacenar el ID del curso
    const [currentPage, setCurrentPage] = useState(1);  // Estado para la página actual
    const [showModal, setShowModal] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [loadingData, setLoadingData] = useState(false); // Estado para controlar la recarga
    const [totalPagos, setTotalPagos] = useState(0);
    const [totalMontoCancelado, setTotalMontoCancelado] = useState(0);
    const [ultimaFechaPago, setUltimaFechaPago] = useState(null);
    const [range, setRange] = useState(30); // Estado para seleccionar el rango de días


    



    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const inscripcionData = await getInscripcionCurso(inscripcion_curso_id);
    
                const { cedula_identidad, curso_id } = inscripcionData;
                setCedulaInscripcion(cedula_identidad);
                setCursoId(curso_id);
    
                if (curso_id) {
                    await getCursoCod(curso_id); // Solo llamar a getCursoCod si curso_id está definido
                } else {
                    console.error('No hay curso_id disponible');
                }
    
                await getPagosByCurso(); // Llamar después de asegurarse de que se tiene el curso_id
    
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };
    
        fetchData(); // Llamada a la función fetchData
    
    }, [inscripcion_curso_id]);
    

    const handleShowModal = (id) => {
        setSelectedId(id);  // Almacena el ID del participante que se va a eliminar
        setShowModal(true); // Muestra el modal
    };
    
    const handleCloseModal = () => {
        setShowModal(false); // Cierra el modal
    }; 

    // Función para obtener la cédula y el curso_id a través de la inscripción del curso
    const getInscripcionCurso = async (id) => {
        try {
            const token = localStorage.getItem('token');
            let allInscripciones = [];
            let currentPage = 1;
            let totalPages = 1;
    
            while (currentPage <= totalPages) {
                const response = await axios.get(`${endpoint}/cursos_inscripcion?page=${currentPage}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
    
                allInscripciones = [...allInscripciones, ...response.data.data];
                totalPages = response.data.last_page;
                currentPage++;
            }
    
            // Filtrar explícitamente por el inscripcion_curso_id correcto
            const inscripcion = allInscripciones.find(informacion_inscripcion => 
                String(informacion_inscripcion.id) === String(id)  // Convertimos a cadenas
            );
    
            if (inscripcion) {
                console.log("Inscripción encontrada:", inscripcion);
                return { cedula_identidad: inscripcion.cedula_identidad, curso_id: inscripcion.curso_id };
            } else {
                console.error("No se encontró ninguna inscripción para el curso con ID:", id);
                throw new Error('No se encontró la inscripción para el curso');
            }
        } catch (error) {
            console.error('Error fetching inscripcion:', error);
            toast.error('Error obteniendo la inscripción');
            throw error;
        }
    };

    // Función para obtener el código del curso usando el curso_id
    const getCursoCod = async (cursoId) => {
        try {
            if (!cursoId) {
                console.warn('cursoId es null o indefinido, no se hará la petición');
                return;
            }
    
            const token = localStorage.getItem('token');
            const response = await axios.get(`${endpoint}/cursos/${cursoId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
    
            const curso = response.data;
            console.log("Curso encontrado:", curso.cod);
    
            if (curso) {
                setCursoCod(curso.cod);
            } else {
                setCursoCod('Desconocido');
            }
        } catch (error) {
            console.error('Error fetching curso cod:', error);
            setError('Error al obtener el código del curso');
        }
    };

    const loadData = async () => {
        setLoadingData(true); // Inicia el estado de carga
        try {
            await getPagosByCurso(); // Espera a que getAllDatos haga la solicitud y actualice los datos
        } catch (error) {
            console.error('Error recargando los datos:', error); // Maneja el error si ocurre
        } finally {
            setLoadingData(false); // Detener el estado de carga cuando la solicitud haya terminado
        }
    };
    


    // Función para obtener los pagos por curso
    const getPagosByCurso = async () => {
        try {
            const token = localStorage.getItem('token');
            let allPagos = [];
            let currentPage = 1;
            let totalPages = 1;
    
            while (currentPage <= totalPages) {
                const response = await axios.get(`${endpoint}/pagos`, {
                    params: {
                        curso_id: inscripcion_curso_id,
                        page: currentPage,
                    },
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
    
                allPagos = [...allPagos, ...response.data.data];
                totalPages = response.data.last_page;
                currentPage++;
            }
    
            const pagosFiltrados = allPagos.filter(
                (reporte) => reporte.informacion_inscripcion_id === parseInt(inscripcion_curso_id)
            );
    
            // Si no hay pagos encontrados, devuelve advertencia
            if (pagosFiltrados.length === 0) {
                console.warn("No se encontraron pagos con inscripcion_curso_id:", inscripcion_curso_id);
            }
    
            // Calcular total de pagos
            const totalPagos = pagosFiltrados.length;
            setTotalPagos(totalPagos);
    
            // Calcular el monto total cancelado
            const totalMontoCancelado = pagosFiltrados.reduce((acc, reporte) => acc + parseFloat(reporte.monto_cancelado), 0);
            setTotalMontoCancelado(totalMontoCancelado.toFixed(2)); // Formatear a dos decimales
    
            // Obtener la última fecha de pago
            const ultimaFechaPago = pagosFiltrados.length > 0 ? pagosFiltrados[0].fecha : null;
            setUltimaFechaPago(ultimaFechaPago);
    
            // Ordenar pagos por ID (más recientes primero)
            const sortedReportes = pagosFiltrados.sort((a, b) => b.id - a.id);
            setReportes(sortedReportes);
            setFilteredReportes(sortedReportes);
            setCurrentPage(1);
    
        } catch (error) {
            setError('Error fetching data');
            console.error('Error fetching data:', error);
        }
    };
    const getFilteredDataByFecha = () => {
        const today = moment(); // Usar moment.js para la fecha actual
        const filteredData = filteredReportes.filter(reporte => {
            const pagoDate = moment(reporte.fecha);
            return pagoDate.isAfter(today.clone().subtract(range, 'days')); // Filtrar los reportes dentro del rango seleccionado
        });
    
        // Agrupar por fecha para contar la cantidad de pagos en cada día
        const dateCounts = filteredData.reduce((acc, reporte) => {
            const fecha = moment(reporte.fecha).format('YYYY-MM-DD');
            acc[fecha] = (acc[fecha] || 0) + 1;
            return acc;
        }, {});
    
        // Convertir el objeto en un arreglo de {fecha, count} para la gráfica
        return Object.keys(dateCounts).map(date => ({
            fecha: date,
            count: dateCounts[date]
        }));
    };
    
    

    const deleteReporte = async () => {
        
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`${endpoint}/pagos/${selectedId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                getPagosByCurso(); // Volver a cargar los pagos después de la eliminación
                toast.success('Reporte eliminado con éxito');
            } catch (error) {
                setError('Error deleting data');
                console.error('Error deleting data:', error);
                toast.error('Error al eliminar el reporte');
            }
            handleCloseModal();
        
    };

    const columns = ["id", "Cédula", "Fecha de Pago", "Monto Cancelado", "Monto Restante", "Comentario", "Acciones"];

    const renderItem = (reporte) => (
        <tr key={reporte.id}>
            <td >{reporte.id}</td>
            <td >{reporte.cedula_identidad}</td>
            <td >{moment(reporte.fecha).format('YYYY-MM-DD')}</td>
            <td >{reporte.monto_cancelado} $</td>
            <td >{reporte.monto_restante} $</td>
            <td >{reporte.comentario_cuota}</td>
            <td >
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

                    {/* Total de Monto Cancelado */}
                    <div className="stat-card" style={{ padding: '5px', margin: '0 10px', width: '22%' }}>
                        <div className="stat-icon"><TbCoins /></div>
                        <div className="stat-number" style={{ color: '#ffda1f', fontSize: '1.2rem' }}>{totalMontoCancelado} $</div>
                        <div className="stat-label">Total de Monto Cancelado</div>
                    </div>

                    {/* Última Fecha de Pago */}
                    <div className="stat-card" style={{ padding: '5px', margin: '0 10px', width: '22%' }}>
                        <div className="stat-icon"><FaClock /></div>
                        <div className="stat-number" style={{ color: '#58c765', fontSize: '1.2rem' }}>
                            {ultimaFechaPago ? moment(ultimaFechaPago).format('YYYY-MM-DD') : 'No disponible'}
                        </div>
                        <div className="stat-label">Última Fecha de Pago</div>
                    </div>
                </div>
            </div>




          <div className="row" style={{ marginTop: '10px' }}>
            {/* Columna para la tabla */}
            <div className="col-lg-11 mx-auto"> {/* Agregamos 'mx-auto' para centrar */}
                <div className="card-box" style={{ padding: '10px', width: '100%', margin: '0 auto' }}> 
                    
                   
                    <div className="d-flex justify-content-between align-items-center" style={{ marginBottom: '5px' }}>
                        <h2 style={{ marginBottom: '2px' }}>Lista de Pagos</h2>  {/* Reducimos el margen inferior */}
                    </div>

                   
                    <div className="d-flex justify-content-between align-items-center" style={{ marginBottom: '5px' }}>
                        <h3 style={{ marginBottom: '2px' }}>Participante V{cedulaInscripcion}</h3>  
                        {(userRole === 'admin' || userRole === 'pagos') && cedulaInscripcion && (
                            <div className="d-flex" style={{ gap: '10px' }}>  
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
                                <Button variant="btn custom" onClick={() => navigate(`/pagos/${cedulaInscripcion}/${inscripcion_curso_id}`)} className="btn-custom">
                                    <i className="bi bi-cash-coin me-2"></i> Nuevo
                                </Button>
                                <Button variant="secondary" onClick={() => navigate(`/inscritos/${cursoId}`)} className="secondary" style={{ fontSize: '0.9rem' }}>
                                    <i className="bi bi-arrow-90deg-left"></i>
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Tercera línea: Código del curso */}
                    <div className="d-flex justify-content-between align-items-center" style={{ marginBottom: '5px' }}>
                        <h4 style={{ marginBottom: '15px' }}>Curso {cursoCod}</h4>  {/* Reducimos el margen inferior */}
                    </div>


                    {/* Tabla paginada */}
           
            <PaginationTable
                data={filteredReportes}  // Datos filtrados
                itemsPerPage={itemsPerPage}
                columns={columns}
                renderItem={renderItem}
                currentPage={currentPage}  // Página actual
                onPageChange={setCurrentPage}  // Función para cambiar de página
                />
            <ToastContainer />

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
        </div>
        <div className="col-lg-12 d-flex justify-content-between flex-wrap" style={{ gap: '20px', marginTop: '10px' }}>
            <div className="chart-box" style={{ flex: '1 1 100%', maxWidth: '100%', marginRight: '10px' }}>
                <div className="d-flex justify-content-between align-items-center">
                    <h4 style={{ fontSize: '1.2rem' }}>Registro de Pagos</h4>
                    {/* Selector de rango de fechas */}
                    <Form.Select 
                        value={range} 
                        onChange={(e) => setRange(parseInt(e.target.value))} 
                        style={{ width: '150px', fontSize: '0.85rem' }}
                    >
                        <option value={7}>Últimos 7 días</option>
                        <option value={30}>Últimos 30 días</option>
                        <option value={60}>Últimos 60 días</option>
                    </Form.Select>
                </div>
                
              
            </div>
                <ResponsiveContainer width="100%" height={400}>
                    <AreaChart data={getFilteredDataByFecha()} margin={{ right: 30, left: -20 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="fecha" />
                        <YAxis />
                        <Tooltip />
                        <Area type="monotone" dataKey="count" stroke="#82ca9d" fill="#82ca9d" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
        </div>
        </div>
    );
    
    
};

export default ShowPagosCursos;
