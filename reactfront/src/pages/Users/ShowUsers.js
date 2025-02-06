import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Table from 'react-bootstrap/Table';
import { useNavigate } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import moment from 'moment';
import { useLoading } from '../../components/LoadingContext';
import { ToastContainer,toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PaginationTable from '../../components/PaginationTable';
import { FaUserFriends, FaClock, FaBook,FaSync,FaSearch } from 'react-icons/fa';  // Importamos íconos de react-icons
import { Modal } from 'react-bootstrap';
import { ResponsiveContainer,Line, LineChart,BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,AreaChart,Area,Radar,RadarChart, PieChart, Cell, Pie, ComposedChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00C49F', '#FFBB28'];

const endpoint = 'http://localhost:8000/api';

const calculateAverageAntiquity = (users) => {
    const totalDays = users.reduce((acc, user) => {
        const createdAt = moment(user.created_at);
        const today = moment();
        const diffDays = today.diff(createdAt, 'days');  // Calcula la diferencia en días
        return acc + diffDays;
    }, 0);

    return users.length > 0 ? (totalDays / users.length).toFixed(0) : 0;  // Promedio de días
};

const ShowUsers = () => {

    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchName, setSearchName] = useState('');
    const [selectedRole, setSelectedRole] = useState('');
    const [searchRole, setSearchRole] = useState('');
    const [roleOptions, setRoleOptions] = useState([]);
    const userRole = localStorage.getItem('role');
    const itemsPerPage = 7;
    const [currentPage, setCurrentPage] = useState(1);  // Estado para la página actual
    const [loadingData, setLoadingData] = useState(false); // Estado para controlar la recarga
    const [showModal, setShowModal] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [selectedCargo, setSelectedCargo] = useState('');
    const [cargoOptions, setCargoOptions] = useState([]);
    const [range, setRange] = useState(30); // Estado para seleccionar rango de días

    const [totalPages, setTotalPages] = useState(1);  // Total de páginas desde el backend
    const [totalUsers, setTotalUsers] =useState (0);  // Total de páginas desde el backend
    const [averageAntiquity, setAverageAntiquity] = useState(0);  // Total de páginas desde el backend

    const [statistics, setStatistics] = useState({});  // Datos de estadísticas



    

    const [filters, setFilters] = useState({
        role_id:'',
        cargo_id:'',
        username:'',
    });
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };
    const { setLoading } = useLoading();
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    

    useEffect(() => {
        setLoading(true);
        // Reemplazamos fetchRoleOptions() y fetchCargoOptions() por fetchRolesAndCargos()
        Promise.all([getAllUsers(), fetchRolesAndCargos()]).finally(() => {
            setLoading(false);
        });
    }, []);
    const handlePageChange = (newPage) => {
        setCurrentPage(newPage); // Actualiza la página actual
        getAllUsers(newPage); // Obtiene los datos para la nueva página
    };
    
    
    

    const getAllUsers = async (page = currentPage) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${endpoint}/users-estadisticas`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { ...filters, page }, // Incluye `page` en los parámetros
            });
    
            setUsers(response.data.users.data);  // Datos paginados
            setTotalPages(response.data.users.last_page);  // Total de páginas
            setStatistics(response.data.estadisticas);  // Estadísticas
            setTotalUsers(response.data.estadisticas.totalUsers);
            setAverageAntiquity(response.data.estadisticas.averageAntiquityInDays);
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('Error al obtener usuarios');
        }
    };
    
    
    const handleShowModal = (id) => {
        setSelectedId(id);  // Almacena el ID del participante que se va a eliminar
        setShowModal(true); // Muestra el modal
    };
    
    const handleCloseModal = () => {
        setShowModal(false); // Cierra el modal
    };


    



    const fetchRolesAndCargos = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${endpoint}/roles-and-cargos`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
    
            setRoleOptions(response.data.role); // Asignamos los roles
            setCargoOptions(response.data.cargo_users); // Asignamos los cargos
        } catch (error) {
            setError('Error fetching roles and cargos');
            console.error('Error fetching roles and cargos:', error);
        }
    };
    



    const deleteUsers = async () => {
        const token = localStorage.getItem('token');
        try {
            await axios.delete(`${endpoint}/users/${selectedId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            toast.success('Usuario eliminado con Éxito');
            getAllUsers();
            setShowModal(false); // Cierra el modal tras la eliminación exitosa
        } catch (error) {
            setError('Error deleting data');
            console.error('Error deleting data:', error);
            toast.error('Error al eliminar Usuario');
            setShowModal(false); // Cierra el modal tras el error
        }
    };


    const loadData = async () => {
        setLoadingData(true); // Inicia el estado de carga
        try {
            await getAllUsers(); // Espera a que getAllDatos haga la solicitud y actualice los datos
        } catch (error) {
            console.error('Error recargando los datos:', error); // Maneja el error si ocurre
        } finally {
            setLoadingData(false); // Detener el estado de carga cuando la solicitud haya terminado
        }
    };

    const cargoData = statistics?.usersByCargo
    ? Object.entries(statistics.usersByCargo).map(([name, obj]) => ({
        name,
        count: obj.count,  // Cambia 'value' a 'count'
    }))
    : [];

    const roleData = statistics?.usersByRole
    ? Object.entries(statistics.usersByRole).map(([name, obj]) => ({
        name,
        count: obj.count,  // Cambia 'value' a 'count'
    }))
    : [];



    const columns = [ "id", "Nombre de Usuario","Nombre","Apellido", "Email","Cargo", "Fecha de Registro","Rol","Acciones"];

    const renderItem = (users) => (
        <tr key={users.id}>
        <td >{users.id}</td>
        <td >{users.username}</td>
        <td >{users.nombre}</td>
        <td >{users.apellido}</td>
        <td >{users.email}</td>
        <td >{users.cargo?.descripcion}</td>
        <td >{moment(users.created_at).format('YYYY-MM-DD')}</td>
        <td >{users.role?.name}</td>
        
        <td >
        <div className="d-flex justify-content-around">
                        
                        <Button
                                variant="btn btn-warning"
                                onClick={() => navigate(`/users/${users.id}`)}
                                className="me-2 icon-white"
                                title='Editar'
                            >
                                <i className="bi bi-pencil-fill"></i>
                            </Button>
                    


                                <Button variant="btn btn-danger" onClick={() => handleShowModal(users.id)} className="me-2" title='Eliminar'>
                                 <i className="bi bi-trash3-fill"></i>
                                </Button>
                    
            </div>
        </td>
    </tr>
    );

    return (

        
        
        <div className="container-fluid " style={{ fontSize: '0.85rem' }}>
            <div className="stat-box mx-auto col-lg-11" style={{ maxWidth: '100%' }}> 
                {/* Total de Uduarios */}
                <div className="stat-card" style={{  }}>
                    <div className="stat-icon" style={{ fontSize: '14px', color: '#333', marginBottom: '1px' }}><FaUserFriends /></div>
                    <div className="stat-number" style={{ color: 'rgba(255, 74, 74, 0.9) ', fontSize: '1.8rem' }}>{totalUsers}</div>
                    <h4 style={{ fontSize: '1.1rem', color:'gray' }}>Total Usuarios</h4>
                    
                </div>

                {/* Promedio de Antigüedad */} 
                <div className="stat-card" style={{  }}>
                    <div className="stat-icon" style={{ fontSize: '14px', color: '#333', marginBottom: '1px' }}><FaClock /></div>
                    <div className="stat-number" style={{ color: 'rgba(54, 162, 235, 0.9)', fontSize: '1.8rem' }}>{averageAntiquity} días</div>
                    <h4 style={{ fontSize: '1.1rem', color:'gray' }}>Promedio de Antigüedad</h4>
                </div>

      
        </div>


        <div className="row" style={{ marginTop: '10px' }}>
                {/* Columna para la tabla */}
                <div className="col-lg-11 mx-auto"> {/* Agregamos 'mx-auto' para centrar */}
                    <div className="card-box" style={{ padding: '20px', width: '100%', margin: '0 auto' }}> 
                    <div className="d-flex justify-content-between align-items-center mb-3" style={{ gap: '0px' }}>
                        <h1 style={{ marginRight: '10px' }}>Lista de Usuarios</h1>

                        <div className="d-flex" style={{ gap: '5px' }}> 
                            <Button
                            variant="info"
                            onClick={loadData}
                            disabled={loadingData} // Deshabilita el botón si está cargando
                            style={{ padding: '8px 16px', width: '90px' }} // Ajustamos el padding para aumentar el grosor
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
                                    onClick={getAllUsers}
                                    style={{ padding: '5px 10px', width: '120px' }} // Ajusta padding y ancho
                                    title='Buscar'
                                >
                                    <FaSearch className="me-1" /> {/* Ícono de lupa */}
                                </Button>
                            
                            <Button variant="btn custom" onClick={() => navigate('/users/create')} className="btn-custom" title='Crear Usuario'>
                                <i className="bi bi-person-plus-fill me-2  "></i> Nuevo
                            </Button>
                        </div>
                    </div>



                    <div className="d-flex mb-3 custom-width">
                        <Form.Control
                            name='username'
                            type="text"
                            placeholder="Buscar por Nombre de Usuario"
                            value={filters.username}
                            onChange={handleFilterChange}  // Asocia la función handleSearchChange
                            className="me-2"
                        />

                        <Form.Select
                            name='role_id'
                            value={filters.role_id}
                            onChange={handleFilterChange}
                            className="me-2"
                        >
                            <option value="">Filtrar por Rol</option>
                            {roleOptions.map(option => (
                                <option key={option.id} value={option.id}>{option.name}</option>
                            ))}
                        </Form.Select>

                        <Form.Select
                            name='cargo_id'
                            value={filters.cargo_id}
                            onChange={handleFilterChange}
                            className="me-2"
                        >
                            <option value="">Filtrar por Cargo</option>
                            {cargoOptions.map(option => (
                                <option key={option.id} value={option.id}>{option.descripcion}</option>
                            ))}
                        </Form.Select>


                    </div>


                    <PaginationTable
                        data={users}
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
                <Modal.Body>¿Estás seguro de que deseas eliminar este Usuario? {users.username}</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>
                        Cancelar
                    </Button>
                    <Button variant="danger" onClick={deleteUsers}>
                        Eliminar
                    </Button>
                </Modal.Footer>
            </Modal>

            <ToastContainer />
        </div>

        
        <div className="col-lg-12 d-flex justify-content-between flex-wrap" style={{ gap: '20px', marginTop: '10px' }}>
            <div className="chart-box" style={{ flex: '1 1 45%', maxWidth: '45%', marginRight: '10px' }}>
                <h4 style={{ fontSize: '1.2rem' }}>Distribución de Cargos</h4>
                    <ResponsiveContainer width="100%" height={400}>
                        <PieChart>
                            <Pie
                                data={cargoData}
                                dataKey="count"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                innerRadius={70}  // Inner radius para hacer la dona
                                outerRadius={120}
                                fill="#82ca9d"
                                label={({ value }) => `${value}`}  // Mostrar solo el valor
                            >
                                {cargoData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
            </div>

            <div className="chart-box" style={{ flex: '1 1 45%', maxWidth: '45%', marginRight: '10px' }}>
                <h4 style={{ fontSize: '1.2rem' }}>Distribución de Roles</h4>
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={roleData} margin={{ top: 10, right: 30, left: -20, bottom: 0 }}>
                            <CartesianGrid stroke="#f5f5f5" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="count" fill="#8884d8" />
                        </BarChart>
                    </ResponsiveContainer>
            </div>
        </div>
            


        
        </div>
       
        </div>
        

        </div>
    );
};

export default ShowUsers;
