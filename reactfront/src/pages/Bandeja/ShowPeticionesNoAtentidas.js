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
    
            // Ordenar las peticiones por la fecha de finalización (finish_time) en orden descendente (más reciente primero)
            const sortedPeticiones = filteredPeticiones.sort((a, b) => new Date(b.finish_time) - new Date(a.finish_time));
    
            setPeticiones(sortedPeticiones);
            setFilteredPeticiones(sortedPeticiones);
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

    const getStatusColor = (created_at, status) => {
        if (status) return 'gray';
        const daysSinceCreation = calculateDaysSinceCreation(created_at);
        if (daysSinceCreation > 10) return 'red';
        if (daysSinceCreation > 2) return 'orange';
        return 'green';
    };

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

    const deletePeticiones = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${endpoint}/peticiones/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            getAllPeticiones();
            toast.success('Petición eliminada con éxito');
        } catch (error) {
            setError('Error eliminando la petición');
            console.error('Error eliminando la petición:', error);
            toast.error('Error al eliminar petición');
        }
    };

    const handleNavigate = (peticiones) => {
        const { id } = peticiones.zonas || {};
        if (id === 1) {
            navigate(`/datos/${peticiones.key}/edit`);
        } else if (id === 2) {
            navigate(`/cursos/${peticiones.key}/edit`);
        } else if (id === 3) {
            navigate(`/cursos/${peticiones.key}/edit`);
        } else {
            toast.error('Zona no válida');
        }
    };

    const columns = ["Status", "Usuario Request", "key", "Zona", "Fecha de creación", "Comentarios", "Fecha Finalizada", "Usuario que Atendió"];

    const renderItem = (peticiones) => (
        <tr key={peticiones.id} className={peticiones.status ? "attended-row" : ""}>
            <td className="text-center">{renderStatusDot(peticiones.created_at, peticiones.status)}</td>
            <td className="text-center">{peticiones.user?.name}</td>
            <td className="text-center">{peticiones.key}</td>
            <td className="text-center">{peticiones.zonas?.name}</td>
            <td className="text-center">{moment(peticiones.created_at).format('YYYY-MM-DD')}</td>
            <td className="text-center">{peticiones.comentario}</td>
            <td className="text-center actions-column">
                <span>{moment(peticiones.finish_time).format('YYYY-MM-DD HH:mm')}</span>
            </td>
            <td className="text-center">{peticiones.user_success?.name}</td> {/* Mostrar el nombre del usuario que atendió la petición */}
        </tr>
    );
    

    return (
        <div className="container mt-5 inbox-container">
            <meta name="csrf-token" content="{{ csrf_token() }}" />

            <div className="d-flex justify-content-between align-items-center mb-3">
                <h1>Bandeja de Entrada</h1>
                <h5>Peticiones Atendidas</h5>

                <div className="d-flex align-items-center">
                    <Button variant="info" onClick={() => navigate('/peticiones')}>
                        Ver Peticiones No Atendidas
                    </Button>
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

export default ShowPeticionesNoAtendidas;
