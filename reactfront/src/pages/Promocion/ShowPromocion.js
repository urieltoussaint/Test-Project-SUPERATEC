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
import { FaSync } from 'react-icons/fa';  // Importamos íconos de react-icons
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
    const [loadingData, setLoadingData] = useState(false); // Estado para controlar la recarga
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

    const getAllPromociones = async () => {
        try {
            const token = localStorage.getItem('token');
            let allPromociones = [];
            let currentPage = 1;
            let totalPages = 1;
    
            // Loop para obtener todas las páginas
            while (currentPage <= totalPages) {
                const response = await axios.get(`${endpoint}/promocion?page=${currentPage}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
    
                allPromociones = [...allPromociones, ...response.data.data];
                totalPages = response.data.last_page; // Total de páginas
                currentPage++;
            }
    
            // Ordenar las promociones por ID en orden descendente
            const sortedPromociones = allPromociones.sort((a, b) => b.id - a.id);
            setPromociones(sortedPromociones);
            setFilteredPromociones(sortedPromociones);
            console.log('Promociones obtenidas:', sortedPromociones);
        } catch (error) {
            setError('Error fetching data');
            console.error('Error fetching data:', error);
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

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchComentario(value);
        applyFilters({ ...filters, searchComentario: value });
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        const newFilters = { ...filters, [name]: value };
        setFilters(newFilters);
        applyFilters(newFilters);
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

    const applyFilters = (filters) => {
        let filtered = promociones;

        if (filters.searchComentario) {
            filtered = filtered.filter(promocion =>
                promocion.comentarios.toLowerCase().includes(filters.searchComentario.toLowerCase())
            );
        }

        if (filters.centro_id) {
            filtered = filtered.filter(promocion =>
                promocion.centro_id === parseInt(filters.centro_id)
            );
        }

        if (filters.periodo_id) {
            filtered = filtered.filter(promocion =>
                promocion.periodo_id === parseInt(filters.periodo_id)
            );
        }

        if (filters.cohorte_id) {
            filtered = filtered.filter(promocion =>
                promocion.cohorte_id === parseInt(filters.cohorte_id)
            );
        }

        if (filters.mencion_id) {
            filtered = filtered.filter(promocion =>
                promocion.mencion_id === parseInt(filters.mencion_id)
            );
        }
        if (filters.procedencia_id) {
            filtered = filtered.filter(promocion =>
                promocion.procedencia_id === parseInt(filters.procedencia_id)
            );
        }

        setFilteredPromociones(filtered);
        setCurrentPage(1);
    };

    if (error) {
        return <div>{error}</div>;
    };

    const loadData = async () => {
        setLoadingData(true); // Inicia el estado de carga
        try {
            await getAllPromociones(); // Espera a que getAllDatos haga la solicitud y actualice los datos
        } catch (error) {
            console.error('Error recargando los datos:', error); // Maneja el error si ocurre
        } finally {
            setLoadingData(false); // Detener el estado de carga cuando la solicitud haya terminado
        }
    };


    const activeFilters = Object.values(filters).some(val => val); // Comprobar si hay filtros activos
    const dataToUse = activeFilters ? filteredPromociones : promociones; // Usar filteredDatos si hay filtros activos, de lo contrario usar datos

    // Total de participantes basado en filtros activos
    const totalPromociones = dataToUse.length;

    const getMencionChartData = () => {
        const mencionDict = mencionOptions.reduce((acc, mencion) => {
            acc[mencion.id] = mencion.descripcion;
            return acc;
        }, {});
    
        const groupedData = filteredPromociones.reduce((acc, promocion) => {
            const mencionName = mencionDict[promocion.mencion_id] || 'Desconocido';
            if (!acc[mencionName]) {
                acc[mencionName] = { name: mencionName, count: 0 };
            }
            acc[mencionName].count += 1;
            return acc;
        }, {});
    
        const total = Object.values(groupedData).reduce((sum, item) => sum + item.count, 0);
        return Object.values(groupedData).map(item => ({
            name: item.name,
            value: parseFloat(((item.count / total) * 100).toFixed(2)), // Calcular el porcentaje
        }));
    };
    
    const getProcedenciaChartData = () => {
        const grupoDict = procedenciaOptions.reduce((acc, grupo) => {
            acc[grupo.id] = grupo.descripcion;
            return acc;
        }, {});
    
        const groupedData = filteredPromociones.reduce((acc, promocion) => {
            const grupoName = grupoDict[promocion.procedencia_id] || 'Desconocido';
            if (!acc[grupoName]) {
                acc[grupoName] = { name: grupoName, count: 0 };
            }
            acc[grupoName].count += 1;
            return acc;
        }, {});
    
        return Object.values(groupedData);
    };

    const getCentroChartData = () => {
        const centroDict = centroOptions.reduce((acc, centro) => {
            acc[centro.id] = centro.descripcion;
            return acc;
        }, {});
    
        const groupedData = filteredPromociones.reduce((acc, promocion) => {
            const centroName = centroDict[promocion.centro_id] || 'Desconocido';
            if (!acc[centroName]) {
                acc[centroName] = { name: centroName, count: 0 };
            }
            acc[centroName].count += 1;
            return acc;
        }, {});
    
        return Object.values(groupedData).map(item => ({
            name: item.name,
            value: item.count
        }));
    };
    
    // Agrega estas funciones dentro del componente ShowPromocion
const getTotalEstudiantesAsistentes = () => {
    return filteredPromociones.reduce((acc, promocion) => acc + (promocion.estudiantes_asistentes || 0), 0);
};

const getTotalEstudiantesInteresados = () => {
    return filteredPromociones.reduce((acc, promocion) => acc + (promocion.estudiantes_interesados || 0), 0);
};

    


    const columns = [ "id", "Fecha de Registro", "Comentarios", "Acciones"];

    const renderItem = (dato) => (
        <tr key={dato.id}>
        <td >{dato.id}</td>
        <td  >{moment(dato.fecha_registro).format('YYYY-MM-DD')}</td>
        <td  >{dato.comentarios}</td>
        <td >
            <div className="d-flex justify-content-around">

                <Button
                        variant="btn btn-info" 
                        onClick={() => navigate(`/promocion/${dato.id}`)}
                        className="me-2"
                    >
                        <i className="bi bi-eye"></i>
                    </Button>
                    {userRole === 'admin' || userRole === 'superuser' ? (

                        <Button
                        variant="btn btn-warning"
                        onClick={() => navigate(`/promocion/${dato.id}/edit`)}
                        className="me-2"
                        >
                        <i className="bi bi-pencil-fill"></i>
                        </Button>
                    ):null} {userRole === 'admin' && (

                    <Button
                    variant="btn btn-danger"
                    onClick={() => handleShowModal(dato.id)}
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
                            <div className="stat-number" style={{ color: '#4b9cd3', fontSize: '1.2rem' }}>{getTotalEstudiantesAsistentes()}</div>
                            <div className="stat-label">Total de Asistentes</div>
                        </div>
                        {/*  Total de  interesados */}
                        <div className="stat-card" style={{  }}>
                            <div className="stat-icon"><i className="bi bi-people"></i></div>
                            <div className="stat-number" style={{ color: '#f0ad4e', fontSize: '1.2rem' }}>{getTotalEstudiantesInteresados()}</div>
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
                                    type="text"
                                    placeholder="Buscar por comentario"
                                    value={searchComentario}
                                    onChange={handleSearchChange}
                                    className="me-2"
                                />

                                <Button
                                    variant="info me-2"
                                    onClick={loadData}
                                    disabled={loadingData} // Deshabilita el botón si está cargando
                                    style={{ padding: '5px 10px', width: '120px' }} // Ajusta padding y ancho

                                >
                                    {/* Icono de recarga */}
                                    {loadingData ? (
                                    <FaSync className="spin" /> // Ícono girando si está cargando
                                    ) : (
                                    <FaSync />
                                    )}
                                </Button>
                                {userRole === 'admin' || userRole === 'superuser' ? (

                                <Button variant="btn custom" onClick={() => navigate('create')} className="btn-custom">
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
                            data={filteredPromociones}  // Datos filtrados
                            itemsPerPage={itemsPerPage}
                            columns={columns}
                            renderItem={renderItem}
                            currentPage={currentPage}  // Página actual
                            onPageChange={setCurrentPage}  // Función para cambiar de página
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
                            data={getMencionChartData()}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={120}
                            label={({ name, value }) => `${name}: ${value}%`}
                            labelLine
                        >
                            {getMencionChartData().map((entry, index) => (
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
                        <BarChart data={getProcedenciaChartData()} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="count" fill="#8884d8" name="Promociones">
                                {getProcedenciaChartData().map((entry, index) => (
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
                                data={getCentroChartData()}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                innerRadius={80}  // Radio interno para hacer la forma de dona
                                outerRadius={110} // Radio externo
                                fill="#82ca9d"
                                label={({  percent }) => ` ${(percent * 100).toFixed(2)}%`}
                            >
                                {getCentroChartData().map((entry, index) => (
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
                    data={dataToUse}
                    layout="vertical"
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="id" type="category" label={{ value: "Promociones", position: "insideLeft", angle: 0 }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="estudiantes_asistentes" fill="#4b9cd3" name="Asistentes" />
                    <Bar dataKey="estudiantes_interesados" fill="#f0ad4e" name="Interesados" />
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
