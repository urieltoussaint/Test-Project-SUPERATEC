import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal'; // Importar el componente Modal
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
    const [showRejectModal, setShowRejectModal] = useState(false); // Estado para controlar el modal de rechazo
    const [selectedPeticion, setSelectedPeticion] = useState(null); // Petición seleccionada para rechazar
    const { setLoading } = useLoading();
    const navigate = useNavigate();
    const itemsPerPage = 4;
    const userId = parseInt(localStorage.getItem('user'));
    useEffect(() => {
        setLoading(true);
        getAllPeticiones().finally(() => {
            setLoading(false);
        });
    }, [showAttended]);

    const getAllPeticiones = async () => {
        try {
            const token = localStorage.getItem('token');
            
            const roleId = parseInt(localStorage.getItem('role_id'));

            const response = await axios.get(`${endpoint}/peticiones?with=user,zonas`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const allPeticiones = response.data.data;
            const filteredPeticiones = allPeticiones.filter(peticion => 
                peticion.destinatario_id === userId || peticion.role_id === roleId
            );

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

    const getStatusColor = (created_at, status) => {
        if (status) return 'gray'; // Estado finalizado
        const daysSinceCreation = calculateDaysSinceCreation(created_at);
        if (daysSinceCreation > 10) return 'red'; // Crítico
        if (daysSinceCreation > 2) return 'orange'; // Urgente
        return 'green'; // Reciente
    };

    const renderStatusDot = (created_at, status) => {
        const color = getStatusColor(created_at, status);
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
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${endpoint}/peticiones/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            getAllPeticiones();
            toast.success('Petición eliminada con éxito');
        } catch (error) {
            setError('Error eliminando la petición');
            console.error('Error eliminando la petición:', error);
            toast.error('Error al eliminar petición');
        }
    };

    const handleStatusChange = (e) => {
        const value = e.target.value;
        setSelectedStatus(value);
        applyFilters(value);
    };

    const applyFilters = (statusValue) => {
        let filtered = [...peticiones];
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
        const { id } = peticiones.zonas || {};
        if (id === 1) {
            navigate(`/datos/${peticiones.key}/edit`);
        } else if (id === 2) {
            navigate(`/cursos/${peticiones.key}/edit`);
        } else {
            toast.error('Zona no válida');
        }
    };

    const handleRejectClick = (peticion) => {
        setSelectedPeticion(peticion); // Guardar la petición seleccionada
        setShowRejectModal(true); // Abrir el modal de confirmación
    };

    const handleRejectConfirm = async () => {
        if (!selectedPeticion) return;
        try {
            const token = localStorage.getItem('token');

            // Borrar la petición actual
            await axios.delete(`${endpoint}/peticiones/${selectedPeticion.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Crear una nueva petición con destinatario_id como user_id y role_id null
            const newPeticion = {

                user_id: userId,
                destinatario_id: selectedPeticion.user_id, // Cambiar destinatario_id
                role_id: null, // role_id será null
                zona_id: selectedPeticion.zona_id,
                status: false,
                finish_time: null,
                key: selectedPeticion.key, // Mantener la misma key
            };

            await axios.post(`${endpoint}/peticiones`, newPeticion, {
                headers: { Authorization: `Bearer ${token}` }
            });

            getAllPeticiones();
            toast.success('Petición rechazada y reenviada al solicitante.');
        } catch (error) {
            setError('Error al rechazar la petición');
            console.error('Error al rechazar la petición:', error);
            toast.error('Error al rechazar petición');
        } finally {
            setShowRejectModal(false); // Cerrar el modal
        }
    };

    const columns = ["Status", "Usuario Request", "key", "Zona", "Fecha de creación", "Acciones/Finalizado"];

    const renderItem = (peticiones) => (
        <tr key={peticiones.id} className={peticiones.status ? "attended-row" : ""}>  
            <td className="text-center">{renderStatusDot(peticiones.created_at, peticiones.status)}</td>
            <td className="text-center">{peticiones.user?.name}</td>
            <td className="text-center">{peticiones.key}</td>
            <td className="text-center">{peticiones.zonas?.name}</td>
            <td className="text-center">{moment(peticiones.created_at).format('YYYY-MM-DD')}</td>
            <td className="text-center">
                {peticiones.status ? (
                    <span>{moment(peticiones.finish_time).format('YYYY-MM-DD HH:mm')}</span>
                ) : (
                    <>
                        <Button
                            variant="success"
                            onClick={() => handleNavigate(peticiones)}
                            className="me-2"
                        >
                            Actualizar
                        </Button>
                        <Button
                            variant="danger"
                            onClick={() => handleRejectClick(peticiones)} // Botón para rechazar
                        >
                            Rechazar
                        </Button>
                    </>
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

            {/* Modal de confirmación para rechazar petición */}
            <Modal show={showRejectModal} onHide={() => setShowRejectModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirmar Rechazo</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedPeticion && (
                        <p>¿Estás seguro de que deseas rechazar la petición de {selectedPeticion.user?.name}?</p>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowRejectModal(false)}>Cancelar</Button>
                    <Button variant="danger" onClick={handleRejectConfirm}>Rechazar</Button>
                </Modal.Footer>
            </Modal>

            <ToastContainer />
        </div>
    );
};

export default ShowPeticiones;
