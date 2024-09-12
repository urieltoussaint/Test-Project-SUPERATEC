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
        Promise.all([getAllUsers(), fetchFilterOptions()]).finally(() => {
            setLoading(false);
        });
    }, []);

    const getAllUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${endpoint}/users-with-roles`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            
            if (response.data && Array.isArray(response.data)) {
                const sortedUsers = response.data.sort((a, b) => a.name.localeCompare(b.name));
                setUsers(sortedUsers);
                setFilteredUsers(sortedUsers); // Inicializa filteredUsers con todos los usuarios
            } else {
                console.error('Unexpected data format:', response.data);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };
    

    const fetchFilterOptions = async () => {
        try {
            const token = localStorage.getItem('token');
            const [] = await Promise.all([
                // axios.get(`${endpoint}/centro`,{
                //     headers: {
                //         Authorization: `Bearer ${token}`,
                //     },
                // }),
                
            ]);
            
        } catch (error) {
            setError('Error fetching filter options');
            console.error('Error fetching filter options:', error);
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

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        const newFilters = { ...filters, [name]: value };
        setFilters(newFilters);
        applyFilters(newFilters);
    };

    

    const applyFilters = (filters) => {
        let filtered = users;

        if (filters.searchName) {
            filtered = filtered.filter(users =>
                users.name.toLowerCase().includes(filters.searchName.toLowerCase())
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
