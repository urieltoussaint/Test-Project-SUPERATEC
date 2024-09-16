import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { useLoading } from '../../components/LoadingContext'; 
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PaginationTable from '../../components/PaginationTable';
import moment from 'moment';

const endpoint = 'http://localhost:8000/api';

const ShowPeticiones = () => {
    const [peticiones, setPeticiones] = useState([]);
    const [filteredPeticiones, setFilteredPeticiones] = useState([]);
    const [selectedStatus, setSelectedStatus] = useState(''); // Filtro basado en días transcurridos
    const [error, setError] = useState(null);
    const { setLoading } = useLoading();
    const navigate = useNavigate();
    const userRole = localStorage.getItem('role'); // Puede ser 'admin', 'superuser', 'invitado', etc.
    const itemsPerPage = 4; // Número de elementos por página
    
    useEffect(() => {
        setLoading(true);
        getAllPeticiones().finally(() => {
            setLoading(false);
        });
    }, []);

    const getAllPeticiones = async () => {
        try {
            const token = localStorage.getItem('token');
            const userId = parseInt(localStorage.getItem('user_id'));  // Asegúrate de guardar esto como entero
            const roleId = parseInt(localStorage.getItem('role_id'));  // Asegúrate de guardar esto como entero
            
            // Obtener todas las peticiones del servidor
            const response = await axios.get(`${endpoint}/peticiones?with=user,zonas`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            
            const allPeticiones = response.data.data; // Todos los datos obtenidos
            
            // Filtrar solo las peticiones que coincidan con el user_id o role_id
            const filteredPeticiones = allPeticiones.filter(peticion => {
                console.log('Filtrando:', { destinatario_id: peticion.destinatario_id, role_id: peticion.role_id });
                return peticion.destinatario_id === userId || peticion.role_id === roleId;
            });
            
            // Establecer las peticiones filtradas en el estado
            setPeticiones(filteredPeticiones);
            setFilteredPeticiones(filteredPeticiones); // También para el componente de tabla paginada
        
            console.log('Peticiones filtradas:', filteredPeticiones);
        } catch (error) {
            setError('Error fetching data');
            console.error('Error fetching data:', error);
        }
    };
    
    
    // Función para calcular los días transcurridos desde la creación
    const calculateDaysSinceCreation = (created_at) => {
        const creationDate = moment(created_at); // Formato estándar ISO
        const now = moment(); // Fecha actual
        return now.diff(creationDate, 'days'); // Diferencia en días
    };

    // Función para renderizar el color del semáforo
    const renderStatusDot = (created_at) => {
        const daysSinceCreation = calculateDaysSinceCreation(created_at);

        let color = 'green'; // Por defecto, verde
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

    // Función para manejar el cambio en el filtro
    const handleStatusChange = (e) => {
        const value = e.target.value;
        setSelectedStatus(value);
        applyFilters(value);
    };

    // Función para aplicar los filtros basados en los días desde la creación
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

    if (error) {
        return <div>{error}</div>;
    }

    const columns = ["Status", "Usuario", "key", "Zona", "Fecha de creación", "Acciones"];

    const renderItem = (peticiones) => (
        <tr key={peticiones.id}>
            <td className="text-center">{renderStatusDot(peticiones.created_at)}</td> {/* Semáforo basado en fecha */}
            <td className="text-center">{peticiones.user?.name}</td>
            <td className="text-center">{peticiones.key}</td>
            <td className="text-center">{peticiones.zonas?.name}</td>
            <td className="text-center">{moment(peticiones.created_at).format('YYYY-MM-DD')}</td>
            <td className="text-center">
                <div className="d-flex justify-content-around">
                    <Button
                        variant="success"
                        onClick={() => navigate(`/peticiones/${peticiones.id}`)}
                        className="me-2"
                    >
                        Actualizar
                    </Button>
                </div>
            </td>
        </tr>
    );

    return (
        <div className="container mt-5">
            <meta name="csrf-token" content="{{ csrf_token() }}"></meta>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h1>Bandeja de Entrada</h1>
                <div className="d-flex align-items-center"></div>
            </div>

            {/* Filtro */}
            <div className="d-flex mb-3 custom-width">
                <Form.Select
                    value={selectedStatus}
                    onChange={handleStatusChange}
                    className="me-2"
                >
                    <option value="">Filtrar por Status</option>
                    <option value="green">Reciente (Verde)</option>
                    <option value="orange">Urgente (Naranja)</option>
                    <option value="red">Crítico (Rojo)</option>
                </Form.Select>
            </div>

            <div className="cards-container"></div>
            {/* Tabla paginada */}
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
