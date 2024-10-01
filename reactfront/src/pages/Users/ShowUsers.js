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
const endpoint = 'http://localhost:8000/api';

const ShowUsers = () => {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchName, setSearchName] = useState('');
    const [selectedRole, setSelectedRole] = useState('');
    const [searchRole, setSearchRole] = useState('');
    const [roleOptions, setRoleOptions] = useState([]);
    const userRole = localStorage.getItem('role');
    const itemsPerPage = 4;
    const [filters, setFilters] = useState({
        // centro_id: '',
    
    });
    const { setLoading } = useLoading();
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        setLoading(true);
        Promise.all([getAllUsers(), fetchRoleOptions()]).finally(() => {
            setLoading(false);
        });
    }, []);

    const getAllUsers = async (page = 1) => {
        try {
            const token = localStorage.getItem('token');
            
            // Solicitar una página específica
            const response = await axios.get(`${endpoint}/users-with-roles?page=${page}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
    
            // Si la respuesta tiene la estructura correcta para paginación
            if (response.data && response.data.data) {
                const newUsers = response.data.data.sort((a, b) => a.name.localeCompare(b.name));
    
                // Actualiza el estado añadiendo los usuarios de esta página
                setUsers((prevUsers) => [...prevUsers, ...newUsers]);
                setFilteredUsers((prevUsers) => [...prevUsers, ...newUsers]); // También actualizamos los filtrados
    
                // Verifica si hay más páginas
                if (response.data.current_page < response.data.last_page) {
                    // Cargar la siguiente página si existe
                    getAllUsers(response.data.current_page + 1);
                }
            } else {
                console.error('Unexpected data format:', response.data);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };
    
    
    
    
    

    const fetchRoleOptions = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${endpoint}/role`,{headers: {
                Authorization: `Bearer ${token}`,
            }});
            setRoleOptions(response.data.data);
        } catch (error) {
            setError('Error fetching area options');
            console.error('Error fetching area options:', error);
        }
    };

    const deleteUsers = async (id) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar este Usuario?')) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`${endpoint}/users/${id}`,{
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                toast.success('Éxito al eliminar el Usuario');
                getAllUsers();
                
                
            } catch (error) {
                setError('Error deleting data');
                toast.error('Error al eliminar Usuario');
                console.error('Error deleting data:', error);
            }
        }
    };

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchName(value);
        applyFilters({ ...filters, searchName: value });
    };
    const handleRoleChange = (e) => {
        const value = e.target.value;
        setSelectedRole(value);
        applyFilters(searchRole, value);
    };
    

    

    const applyFilters = (filters,roleValue) => {
        let filtered = users;

        if (filters.searchName) {
            filtered = filtered.filter(users =>
                users.name.toLowerCase().includes(filters.searchName.toLowerCase())
            );
        }

        if (roleValue) {
            filtered = filtered.filter(users =>
                users.role_id === parseInt(roleValue)
            );
        }

        setFilteredUsers(filtered);
    };

    if (error) {
        return <div>{error}</div>;
    };
    const columns = [ "id", "Nombre de Usuario", "Email", "Fecha de Registro","Rol","Acciones"];

    const renderItem = (users) => (
        <tr key={users.id}>
        <td >{users.id}</td>
        <td >{users.name}</td>
        <td >{users.email}</td>
        <td >{moment(users.created_at).format('YYYY-MM-DD')}</td>
        <td >{users.role?.name}</td>
        
        <td >
            <div className="d-flex justify-content-around">
                        
                        <Button
                            variant="warning"
                            onClick={() => navigate(`/users/${users.id}`)}
                            className="me-2"
                        >
                            Actualizar
                        </Button>
                    
                    <Button
                        variant="danger"
                        onClick={() => deleteUsers(users.id)}
                    >
                        Eliminar
                    </Button>
                    
            </div>
        </td>
    </tr>
    );

    return (
        <div className="container mt-5">
            <meta name="csrf-token" content="{{ csrf_token() }}"></meta>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h1>Lista de Usuarios</h1>
                <div className="d-flex align-items-center">
                    <Form.Control
                        type="text"
                        placeholder="Buscar por Nombre"
                        value={searchName}
                        onChange={handleSearchChange}
                        className="me-2"
                    />
                </div>
            </div>
            <div className="d-flex mb-3 custom-width">
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
            </div>

            <PaginationTable
                data={filteredUsers}
                itemsPerPage={itemsPerPage}
                columns={columns}
                renderItem={renderItem}
            />
            <ToastContainer />
        </div>
    );
};

export default ShowUsers;
