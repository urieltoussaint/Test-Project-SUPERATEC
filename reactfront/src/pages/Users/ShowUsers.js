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
import { FaUserFriends, FaClock, FaBook,FaSync } from 'react-icons/fa';  // Importamos íconos de react-icons
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




    

    const [filters, setFilters] = useState({
        // centro_id: '',
    
    });
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

    
    
    const averageAntiquity = users.length > 0 ? calculateAverageAntiquity(users) : 0;

    const getAllUsers = async () => {

        try {
            const token = localStorage.getItem('token');
            let allUsers = [];
            let currentPage = 1;
    
            // Primera llamada para obtener el número total de páginas
            const initialResponse = await axios.get(`${endpoint}/users-with-roles?page=${currentPage}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
    
            // Guardar los datos de la primera página
            allUsers = [...initialResponse.data.data]; 
            const totalPages = initialResponse.data.last_page;
    
            // Crear un array de promesas para las siguientes páginas si hay más de una página
            if (totalPages > 1) {
                const requests = [];
                for (let i = 2; i <= totalPages; i++) {
                    requests.push(
                        axios.get(`${endpoint}/users-with-roles?page=${i}`, {
                            headers: {
                                Authorization: `Bearer ${token}`
                            }})
                    );
                }
    
                // Esperar a que todas las promesas se resuelvan
                const responses = await Promise.all(requests);
    
                // Añadir los datos de las otras páginas
                responses.forEach(response => {
                    allUsers = [...allUsers, ...response.data.data];
                });
            }
    
            // Actualizar el estado con todos los usuarios obtenidos
            setUsers(allUsers);
            setFilteredUsers(allUsers);
    
            console.log('Usuarios obtenidos:', allUsers);
        } catch (error) {
            if (error.response && error.response.status === 401) {
                setError('No estás autenticado. Por favor, inicia sesión.');
                navigate('/'); // Redirige al login si no está autenticado
            } else {
                setError('Error fetching data');
                console.error('Error fetching data:', error);
            }
        }
    };
    
    const handleShowModal = (id) => {
        setSelectedId(id);  // Almacena el ID del participante que se va a eliminar
        setShowModal(true); // Muestra el modal
    };
    
    const handleCloseModal = () => {
        setShowModal(false); // Cierra el modal
    };

    const getFilteredDataByDate = () => {
        const today = moment();
        const filteredData = users.filter(user => {
            const userCreationDate = moment(user.created_at);
            return userCreationDate.isAfter(today.clone().subtract(range, 'days'));
        });
    
        // Agrupar por fecha
        const dateCounts = filteredData.reduce((acc, user) => {
            const fecha = moment(user.created_at).format('YYYY-MM-DD');
            acc[fecha] = (acc[fecha] || 0) + 1;
            return acc;
        }, {});
    
        // Convertir el objeto en un array para Recharts
        return Object.keys(dateCounts).map(date => ({
            fecha: date,
            count: dateCounts[date]
        }));
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

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchName(value);  // Actualiza el estado de búsqueda de username
        applyFilters(value, selectedRole,selectedCargo);  // Aplica los filtros basados en el nuevo valor
    };
    
    const handleRoleChange = (e) => {
        const value = e.target.value;
        setSelectedRole(value);
        applyFilters(searchName, value,selectedCargo);  // Asegurarse de pasar searchName como cadena, no como un objeto
    };
    
    const handleCargoChange = (e) => {
        const value = e.target.value;
        setSelectedCargo(value);
        applyFilters(searchName, selectedRole, value);  // Asegúrate de que el valor de cargo se esté pasando correctamente
    };
    
    
    
    


    const applyFilters = (searchName, roleValue, cargoValue) => {
        let filtered = users;
    
        // Filtrar por nombre de usuario
        if (typeof searchName === 'string' && searchName.trim() !== '') {
            filtered = filtered.filter(user =>
                user.username.toLowerCase().includes(searchName.toLowerCase())
            );
        }
    
        // Filtrar por rol
        if (roleValue) {
            filtered = filtered.filter(user => user.role_id === parseInt(roleValue));
        }
    
        // Filtrar por cargo
        if (cargoValue) {
            filtered = filtered.filter(user => user.cargo_id === parseInt(cargoValue));
        }
    
        setFilteredUsers(filtered);
        setCurrentPage(1);

    };
    


    if (error) {
        return <div>{error}</div>;
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

    const getCargoDataForChart = () => {
        // Agrupar los usuarios por cargo
        const groupedData = filteredUsers.reduce((acc, user) => {
            const cargo = user.cargo?.descripcion || 'Desconocido';
            if (!acc[cargo]) {
                acc[cargo] = { name: cargo, count: 0 };
            }
            acc[cargo].count += 1;
            return acc;
        }, {});
    
        // Convertir el objeto en un array para Recharts
        return Object.values(groupedData);
    };
    const getRoleDataForChart = () => {
        // Agrupar los usuarios por rol
        const groupedData = filteredUsers.reduce((acc, user) => {
            const role = user.role?.name || 'Desconocido';
            if (!acc[role]) {
                acc[role] = { name: role, count: 0 };
            }
            acc[role].count += 1;
            return acc;
        }, {});
    
        // Convertir el objeto en un array para Recharts
        return Object.values(groupedData);
    };
   
    
    

       // Cálculo de datos según filtros
        const activeFilters = selectedRole || searchName || selectedCargo;  // Comprobar si hay filtros activos (nombre o rol)
        const dataToUse = activeFilters ? filteredUsers : users ;  // Usar filteredUsers si hay filtros, de lo contrario usar users

        // Total de usuarios basado en los datos mostrados
        const totalUsers = dataToUse.length;

        
        


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
                            >
                                <i className="bi bi-pencil-fill"></i>
                            </Button>
                    


                                <Button variant="btn btn-danger" onClick={() => handleShowModal(users.id)} className="me-2">
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
                            >
                            {/* Icono de recarga */}
                            {loadingData ? (
                                <FaSync className="spin" /> // Ícono girando si está cargando
                            ) : (
                                <FaSync />
                            )}
                            </Button>
                            
                            <Button variant="btn custom" onClick={() => navigate('/users/create')} className="btn-custom">
                                <i className="bi bi-person-plus-fill me-2  "></i> Nuevo
                            </Button>
                        </div>
                    </div>



                    <div className="d-flex mb-3 custom-width">
                        <Form.Control
                            type="text"
                            placeholder="Buscar por Nombre de Usuario"
                            value={searchName}
                            onChange={handleSearchChange}  // Asocia la función handleSearchChange
                            className="me-2"
                        />

                        <Form.Select
                            value={selectedRole}
                            onChange={handleRoleChange}
                            className="me-2"
                        >
                            <option value="">Filtrar por Rol</option>
                            {roleOptions.map(option => (
                                <option key={option.id} value={option.id}>{option.name}</option>
                            ))}
                        </Form.Select>

                        <Form.Select
                            value={selectedCargo}
                            onChange={handleCargoChange}
                            className="me-2"
                        >
                            <option value="">Filtrar por Cargo</option>
                            {cargoOptions.map(option => (
                                <option key={option.id} value={option.id}>{option.descripcion}</option>
                            ))}
                        </Form.Select>


                    </div>


                    <PaginationTable
                        data={dataToUse}  // Pasamos los datos calculados con o sin filtros
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
                                data={getCargoDataForChart()}
                                dataKey="count"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                innerRadius={70}  // Inner radius para hacer la dona
                                outerRadius={120}
                                fill="#82ca9d"
                                label={({ value }) => `${value}`}  // Mostrar solo el valor
                            >
                                {getCargoDataForChart().map((entry, index) => (
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
                        <BarChart data={getRoleDataForChart()} margin={{ top: 10, right: 30, left: -20, bottom: 0 }}>
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
        <div className="col-lg-11 d-flex justify-content-between flex-wrap" style={{ gap: '20px', marginTop: '10px' }}>
            <div className="chart-box" style={{ flex: '1 1 100%', maxWidth: '100%', marginRight: '10px' }}>
            <div className="d-flex justify-content-between align-items-center">
                <h4 style={{ fontSize: '1.2rem' }}>Registro de Usuarios</h4>
                {/* Selector de rango de fechas */}
                <Form.Select 
                    value={range} 
                    onChange={(e) => setRange(parseInt(e.target.value))} 
                    style={{ width: '150px', fontSize: '0.85rem' }} // Ajustar el tamaño del selector
                >
                    <option value={7}>Últimos 7 días</option>
                    <option value={30}>Últimos 30 días</option>
                    <option value={60}>Últimos 60 días</option>
                </Form.Select>
            </div>
            
            <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={getFilteredDataByDate()} margin={{ top: 10, right: 30, left: -20, bottom: 0 }}>
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

export default ShowUsers;
