import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { useLoading } from '../../components/LoadingContext'; 
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PaginationTable from '../../components/PaginationTable';
import moment from 'moment';
import './ShowPeticiones.css'; 

const endpoint = 'http://localhost:8000/api';

const ShowPeticiones = () => {
    const [peticiones, setPeticiones] = useState([]);
    const [filteredPeticiones, setFilteredPeticiones] = useState([]);
    const [selectedStatus, setSelectedStatus] = useState(''); 
    const [showAttended, setShowAttended] = useState(false);
    const [error, setError] = useState(null);
    const { setLoading } = useLoading();
    const navigate = useNavigate();
    const userRole = localStorage.getItem('role');
    const itemsPerPage = 4;

    useEffect(() => {
        setLoading(true);
        getAllPeticiones().finally(() => {
            setLoading(false);
        });
    }, [showAttended]);

    const getAllPeticiones = async () => {
        try {
            const token = localStorage.getItem('token');
            const userId = parseInt(localStorage.getItem('user'));  
            const roleId = parseInt(localStorage.getItem('role_id'));

            const response = await axios.get(`${endpoint}/peticiones?with=user,zonas`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const allPeticiones = response.data.data;

            const filteredPeticiones = allPeticiones.filter(peticion => {
                return peticion.destinatario_id === userId || peticion.role_id === roleId;
            });

            const statusFiltered = filteredPeticiones.filter(peticion => peticion.status === showAttended);

            setPeticiones(statusFiltered);
            setFilteredPeticiones(statusFiltered);
        } catch (error) {
            setError('Error fetching data');
            console.error('Error fetching data:', error);
        }
    };

    const calculateDaysSinceCreation = (created_at) => {
        const creationDate = moment(created_at);
        const now = moment();
        return now.diff(creationDate, 'days');
    };

    const renderStatusDot = (created_at, status) => {
        if (status) {
            return (
                <div
                    style={{
                        height: '20px',
                        width: '20px',
                        borderRadius: '50%',
                        backgroundColor: 'gray',  // Muestra el círculo en gris si el status es true
                        display: 'inline-block',
                    }}
                ></div>
            );
        }
        const daysSinceCreation = calculateDaysSinceCreation(created_at);
        let color = 'green';
        if (daysSinceCreation > 10) {
            color = 'red';
        } else if (daysSinceCreation > 3) {
            color = 'orange';
        }

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

    const deletePeticiones = async (id) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar esta Petición?')) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`${endpoint}/peticiones/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                getAllPeticiones();
                toast.success('Eliminado con éxito');
            } catch (error) {
                setError('Error deleting data');
                console.error('Error deleting data:', error);
                toast.error('Error al eliminar petición');
            }
        }
    };

    const handleStatusChange = (e) => {
        const value = e.target.value;
        setSelectedStatus(value);
        applyFilters(value);
    };

    const applyFilters = (statusValue) => {
        let filtered = peticiones;

        if (statusValue === 'green') {
            filtered = filtered.filter(peticion => calculateDaysSinceCreation(peticion.created_at) <= 3);
        } else if (statusValue === 'orange') {
            filtered = filtered.filter(peticion => calculateDaysSinceCreation(peticion.created_at) > 3 && calculateDaysSinceCreation(peticion.created_at) <= 10);
        } else if (statusValue === 'red') {
            filtered = filtered.filter(peticion => calculateDaysSinceCreation(peticion.created_at) > 10);
        }

        setFilteredPeticiones(filtered);
    };

    const toggleAttendedFilter = () => {
        setShowAttended(!showAttended);
    };

    const handleNavigate = (peticiones) => {
        if (peticiones.zonas.id === 1) {
            navigate(`/datos/${peticiones.key}/edit`);
        } else if (peticiones.zonas.id === 2) {
            navigate(`/cursos/${peticiones.key}/edit`);
        } else {
            toast.error('Zona no válida');
        }
    };

    if (error) {
        return <div>{error}</div>;
    }

    const columns = ["Status", "Usuario Request", "key", "Zona", "Fecha de creación", "Acciones/Finalizado"]; // Cambiamos el encabezado de la columna

    const renderItem = (peticiones) => (
        <tr key={peticiones.id} className={peticiones.status ? "attended-row" : ""}>  {/* Clase para filas atendidas */}
            <td className="text-center">{renderStatusDot(peticiones.created_at, peticiones.status)}</td>
            <td className="text-center">{peticiones.user?.name}</td>
            <td className="text-center">{peticiones.key}</td>
            <td className="text-center">{peticiones.zonas?.name}</td>
            <td className="text-center">{moment(peticiones.created_at).format('YYYY-MM-DD')}</td>
            <td className="text-center">
                {peticiones.status ? (
                    <span>{moment(peticiones.finish_time).format('YYYY-MM-DD HH:mm')}</span>  // Muestra la fecha de finalización si status es true
                ) : (
                    <Button
                        variant="success"
                        onClick={() => handleNavigate(peticiones)}
                        className="me-2"
                    >
                        Actualizar
                    </Button>
                )}
            </td>
        </tr>
    );

    return (
        <div className="container mt-5 inbox-container">
            <meta name="csrf-token" content="{{ csrf_token() }}"></meta>
            
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h1>Bandeja de Entrada</h1>
                
                {/* Botón para filtrar atendidas/no atendidas */}
                <div className="d-flex align-items-center">
                    <Button 
                        variant={showAttended ? 'primary' : 'secondary'} 
                        onClick={toggleAttendedFilter}
                    >
                        {showAttended ? 'Mostrar No Atendidas' : 'Mostrar Atendidas'}
                    </Button>
                </div>
            </div>

            {/* Filtro de status y leyenda alineada a la derecha */}
            <div className="d-flex justify-content-between align-items-center mb-3">
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
                    <option value="gray">Finalizado (Gris)</option>
                </Form.Select>
                <div className="status-legend">
                    <span className="status-dot green"></span> Reciente (Verde)
                    <span className="status-dot orange"></span> Urgente (Naranja)
                    <span className="status-dot red"></span> Crítico (Rojo)
                    <span className="status-dot gray"></span> Finalizado (Gris)
                </div>
            </div>

            <PaginationTable
                data={filteredPeticiones}
                itemsPerPage={itemsPerPage}
                columns={columns}
                renderItem={renderItem}
            />
            <ToastContainer />
        </div>
    );
};

export default ShowPeticiones;
