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
    const userRole = localStorage.getItem('role');
    const itemsPerPage = 4;
    const [currentPage, setCurrentPage] = useState(1);  // Estado para la página actual
    const [filters, setFilters] = useState({
        centro_id: '',
        periodo_id: '',
        cohorte_id: '',
        mencion_id: '',
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
    

    const fetchFilterOptions = async () => {
        try {
            const token = localStorage.getItem('token');
            const [centroRes, periodoRes, cohorteRes, mencionRes] = await Promise.all([
                axios.get(`${endpoint}/centro`,{
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }),
                axios.get(`${endpoint}/periodo`,{
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }),
                axios.get(`${endpoint}/cohorte`,{
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }),
                axios.get(`${endpoint}/mencion`,{
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }),
            ]);
            setCentroOptions(centroRes.data.data);
            setPeriodoOptions(periodoRes.data.data);
            setCohorteOptions(cohorteRes.data.data);
            setMencionOptions(mencionRes.data.data);
        } catch (error) {
            setError('Error fetching filter options');
            console.error('Error fetching filter options:', error);
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

        setFilteredPromociones(filtered);
        setCurrentPage(1);
    };

    if (error) {
        return <div>{error}</div>;
    };
    const columns = [ "id", "Fecha de Registro", "Comentarios", "Acciones"];

    const renderItem = (dato) => (
        <tr key={dato.id}>
        <td className='col-id'>{dato.id}</td>
        <td className='col-fecha' >{moment(dato.fecha_registro).format('YYYY-MM-DD')}</td>
        <td className='col-comentarios' >{dato.comentarios}</td>
        <td >
            <div className="col-acciones">

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
        <div className="container mt-5">
            <meta name="csrf-token" content="{{ csrf_token() }}"></meta>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h1>Lista de Promociones</h1>
                <div className="d-flex align-items-center">
                    <Form.Control
                        type="text"
                        placeholder="Buscar por comentario"
                        value={searchComentario}
                        onChange={handleSearchChange}
                        className="me-2"
                    />
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
    );
};

export default ShowPromocion;
