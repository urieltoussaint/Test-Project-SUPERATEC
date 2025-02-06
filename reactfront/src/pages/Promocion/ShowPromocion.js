import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Table from 'react-bootstrap/Table';
import { useNavigate } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import './ShowPromocion.css'; 
import moment from 'moment';
import { useLoading } from '../../components/LoadingContext';
import { ToastContainer,toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PaginationTable from '../../components/PaginationTable';
import { Modal } from 'react-bootstrap';
import { ResponsiveContainer,Line, LineChart,BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,AreaChart,Area,Radar,RadarChart, PieChart, Cell, Pie, ComposedChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { FaSync,FaSearch } from 'react-icons/fa';  // Importamos íconos de react-icons
import { FaLocationDot } from "react-icons/fa6";
const endpoint = 'http://localhost:8000/api';

const ShowPromocion = () => {
    const [promociones, setPromociones] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [filteredPromociones, setFilteredPromociones] = useState([]);
    const [searchComentario, setSearchComentario] = useState('');
    const [centroOptions, setCentroOptions] = useState([]);
    const [periodoOptions, setPeriodoOptions] = useState([]);
    const [cohorteOptions, setCohorteOptions] = useState([]);
    const [mencionOptions, setMencionOptions] = useState([]);
    const [procedenciaOptions, setProcedenciaOptions] = useState([]);
    const [statistics,setStatistics]=useState([]);
    const [loadingData, setLoadingData] = useState(false); // Estado para controlar la recarga
    const [totalPages, setTotalPages] = useState(1); // Default to 1 page initially

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#FF4567'];


    
    const userRole = localStorage.getItem('role');
    const itemsPerPage = 4;
    const [currentPage, setCurrentPage] = useState(1);  // Estado para la página actual
    const [filters, setFilters] = useState({
        centro_id: '',
        periodo_id: '',
        cohorte_id: '',
        mencion_id: '',
        procedencia_id:'',
        comentarios:''
    });
    const { setLoading } = useLoading();
    const [error, setError] = useState(null);
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
        Promise.all([getAllPromociones(), fetchFilterOptions()]).finally(() => {
            setLoading(false);
        });
    }, []);

    

    const getAllPromociones = async (page = 1) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${endpoint}/promociones-estadisticas`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { ...filters, page }, // Incluye `page` en los parámetros
            });
            
            const estadisticas = response.data.estadisticas || {};
            
            setPromociones(Array.isArray(response.data.datos.data) ? response.data.datos.data : []);
            setStatistics(estadisticas);
            setTotalPages(response.data.datos.last_page || 1); // Actualiza el total de páginas
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Error fetching data');
            setPromociones([]);
            setStatistics({});
        }
    };


    const deletePromocion = async () => {
       
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`${endpoint}/promocion/${selectedId}`,{
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                toast.success('Éxito al eliminar Promoción');
                setShowModal(false); // Cierra el modal tras la eliminación exitosa
                getAllPromociones();
                
                
            } catch (error) {
                setError('Error deleting data');
                toast.error('Error al eliminar Promoción');
                console.error('Error deleting data:', error);
            }
        
    };

    
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };
 
    const handlePageChange = (page) => {
        setCurrentPage(page);
        getAllPromociones(page); // Llama a `getAllDatos` con el nuevo número de página
        
    };

    const fetchFilterOptions = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${endpoint}/filter-promocion`, { headers: { Authorization: `Bearer ${token}` } });
            
            setCentroOptions(response.data.centro);
            setPeriodoOptions(response.data.periodo);
            setCohorteOptions(response.data.cohorte);
            setMencionOptions(response.data.mencion);
            setProcedenciaOptions(response.data.procedencia);

        } catch (error) {
            setError('Error fetching filter options');
            console.error('Error fetching filter options:', error);
        }
    };


    const loadData = async () => {
        setLoadingData(true); // Inicia el estado de carga
        try {
            await (getAllPromociones(),fetchFilterOptions()); // Espera a que getAllDatos haga la solicitud y actualice los datos
        } catch (error) {
            console.error('Error recargando los datos:', error); // Maneja el error si ocurre
        } finally {
            setLoadingData(false); // Detener el estado de carga cuando la solicitud haya terminado
        }
    };


    const totalPromociones = statistics.totalPromociones || 0;
    const totalInteresados=statistics.totalInteresados || 0;
    const totalAsistentes=statistics.totalAsistentes || 0;

    const mencionData = Object.entries(statistics.mencion || {}).map(([name, data]) => ({
        name,
        value: data.percentage || 0
    }));
    const procedenciaData = Object.entries(statistics.procedencia || {}).map(([name, data]) => ({
        name,
        value: data.count || 0
    }));
    const centroData = Object.entries(statistics.centro || {}).map(([name, data]) => ({
        name,
        value: data.count || 0
    }));

    const totalData = [
        { name: 'Asistentes', value: totalAsistentes },
        { name: 'Interesados', value: totalInteresados }
    ];
    


    const columns = [ "id", "Fecha de Registro", "Comentarios","Estudiantes Asistentes","Estudiantes Interesados", "Acciones"];

    const renderItem = (dato) => (
        <tr key={dato.id}>
        <td >{dato.id}</td>
        <td  >{moment(dato.fecha_registro).format('YYYY-MM-DD')}</td>
        <td  >{dato.comentarios}</td>
        <td  >{dato.estudiantes_asistentes}</td>
        <td  >{dato.estudiantes_interesados}</td>
        <td >
            <div className="d-flex justify-content-around">

                <Button
                        variant="btn btn-info" 
                        onClick={() => navigate(`/promocion/${dato.id}`)}
                        className="me-2"
                        title='Ver más'
                    >
                        <i className="bi bi-eye"></i>
                    </Button>
                    {userRole === 'admin' || userRole === 'superuser' ? (

                        <Button
                        variant="btn btn-warning"
                        onClick={() => navigate(`/promocion/${dato.id}/edit`)}
                        className="me-2"
                        title='Editar'
                        >
                        <i className="bi bi-pencil-fill"></i>
                        </Button>
                    ):null} {userRole === 'admin' && (

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
            {/* Total de Promociones */}
            <div className="stat-card" style={{  }}>
                            <div className="stat-icon"><FaLocationDot /></div>
                            <div className="stat-number" style={{ color: '#58c765', fontSize: '1.2rem' }}>{totalPromociones}</div>
                            <div className="stat-label">Total de Promociones</div>
                        </div>
                         {/* Total de Asistentes */}
                         <div className="stat-card" style={{  }}>
                            <div className="stat-icon"><i className="bi bi-people-fill"></i></div>
                            <div className="stat-number" style={{ color: '#4b9cd3', fontSize: '1.2rem' }}>{totalAsistentes}</div>
                            <div className="stat-label">Total de Asistentes</div>
                        </div>
                        {/*  Total de  interesados */}
                        <div className="stat-card" style={{  }}>
                            <div className="stat-icon"><i className="bi bi-people"></i></div>
                            <div className="stat-number" style={{ color: '#f0ad4e', fontSize: '1.2rem' }}>{totalInteresados}</div>
                            <div className="stat-label">Total de Interesados</div>
                        </div>
                </div>
                </div>   

                
                <div className="row" style={{ marginTop: '10px' }}>
                <div className="col-lg-11 mx-auto"> {/* Agregamos 'mx-auto' para centrar */}
                    <div className="card-box" style={{ padding: '20px', width: '100%', margin: '0 auto' }}> 
                            <div className="d-flex justify-content-between align-items-center mb-3" style={{ gap: '0px' }}>
                            <h1>Lista de Promociones</h1>
                            <div className="d-flex align-items-center">
                                <Form.Control
                                    name="comentarios"
                                    type="text"
                                    placeholder="Buscar por comentario"
                                    value={filters.comentarios}
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
                                    onClick={getAllPromociones}
                                    style={{ padding: '5px 10px', width: '120px' }} // Ajusta padding y ancho
                                    title='Buscar'
                                >
                                    <FaSearch className="me-1" /> {/* Ícono de lupa */}
                                </Button>
                                {userRole === 'admin' || userRole === 'superuser' ? (

                                <Button variant="btn custom" onClick={() => navigate('create')} className="btn-custom"title='Crear Promoción'>
                                <i className="bi bi-bookmark-star-fill me-2  "></i> Nuevo
                                </Button>
                                ):null}
                            </div>
                        </div>

                        <div className="d-flex mb-3">
                            <Form.Select
                                name="centro_id"
                                value={filters.centro_id}
                                onChange={handleFilterChange}
                                className="me-2"
                            >
                                <option value="">Centro</option>
                                {centroOptions.map(option => (
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
                                {cohorteOptions.map(option => (
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
                                name="mencion_id"
                                value={filters.mencion_id}
                                onChange={handleFilterChange}
                                className="me-2"
                            >
                                <option value="">Mención</option>
                                {mencionOptions.map(option => (
                                    <option key={option.id} value={option.id}>{option.descripcion}</option>
                                ))}
                            </Form.Select>
                            <Form.Select
                                name="procedencia_id"
                                value={filters.procedencia_id}
                                onChange={handleFilterChange}
                                className="me-2"
                            >
                                <option value="">Procedencia</option>
                                {procedenciaOptions.map(option => (
                                    <option key={option.id} value={option.id}>{option.descripcion}</option>
                                ))}
                            </Form.Select>
                        </div>

                       
                        <PaginationTable
                            data={promociones}
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
                <Modal.Body>¿Estás seguro de que deseas eliminar esta promocion?</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>
                        Cancelar
                    </Button>
                    <Button variant="danger" onClick={deletePromocion}>
                        Eliminar
                    </Button>
                </Modal.Footer>
            </Modal>
            <ToastContainer />
        </div>
        <div className="col-lg-12 d-flex justify-content-between" style={{ gap: '20px', marginTop:'10px' }}>


            <div className="chart-box" style={{ flex: '1 1 31%', maxWidth: '31%', marginRight: '10px'}}>

            <   h4 style={{ fontSize: '1.2rem' }}>Distribución por Mencion</h4>

            {mencionOptions.length > 0 && (
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={mencionData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={120}
                            label={({ name, value }) => `${name}: ${value}%`}
                            labelLine
                        >
                            {mencionData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip formatter={(value) => `${value}%`} />
                        <Legend
                            layout="horizontal"
                            verticalAlign="bottom"
                            align="center"
                            wrapperStyle={{
                                position: "relative",
                                top: "20px",
                                textAlign: "center",
                                fontSize: '12px'
                            }}
                        />
                    </PieChart>
                </ResponsiveContainer>
                )}
            </div>

            <div className="chart-box " style={{flex: '1 1 31%', maxWidth: '31%', marginRight: '10px'}}>
            <h4 style={{ fontSize: '1.2rem', textAlign: 'center' }}>Distribución por Procedencia</h4>
                {procedenciaOptions.length > 0 && (
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={procedenciaData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                             dataKey="name"
                            
                            />
                            <YAxis
                            />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="value" fill="#8884d8" name="Promociones">
                                {procedenciaData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                )}
                    

            </div>
            <div className="chart-box "style={{ flex: '1 1 31%', maxWidth: '31%', marginRight: '10px'}}>
            <h4 style={{ fontSize: '1.2rem', textAlign: 'center' }}>Distribución por Centro</h4>
                {centroOptions.length > 0 && (
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={centroData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                innerRadius={80}  // Radio interno para hacer la forma de dona
                                outerRadius={110} // Radio externo
                                fill="#82ca9d"
                                label={({  percent }) => ` ${(percent * 100).toFixed(2)}%`}
                            >
                                {centroData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend
                                layout="horizontal"
                                verticalAlign="bottom"
                                align="center"
                                wrapperStyle={{
                                    width: "90%",
                                    textAlign: "center",
                                    fontSize: '12px'
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    )}



            </div>
            </div>


            <div className="col-lg-12 d-flex justify-content-between" style={{ gap: '20px', marginTop:'10px' }}>


            <div className="chart-box" style={{ flex: '1 1 100%', maxWidth: '100%', marginRight: '10px'}}>

            <   h4 style={{ fontSize: '1.2rem' }}>Asistentes vs Interesados</h4>

            <ResponsiveContainer width="100%" height={400}>
                <BarChart
                    data={totalData}  // Usamos los datos totales aquí
                    layout="vertical"
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" label={{ value: "Total", position: "insideLeft", angle: 0 }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#8884d8" name="Promociones">
                                {totalData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Bar>
                </BarChart>
            </ResponsiveContainer>




            </div>

            
            
            </div>
        
        </div>
        
        
        </div>
        </div>
    );
};

export default ShowPromocion;
