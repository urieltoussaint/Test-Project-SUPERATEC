import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Table from 'react-bootstrap/Table';
import { Modal } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import moment from 'moment';
import './ShowPagos.css';
import { useLoading } from '../../../components/LoadingContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PaginationTable from '../../../components/PaginationTable';

const endpoint = 'http://localhost:8000/api';



const ShowPagos = () => {
    const [reportes, setReportes] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [filteredReportes, setFilteredReportes] = useState([]);
    const [searchCedula, setSearchCedula] = useState('');
    const [error, setError] = useState(null);
    const { id } = useParams();
    const navigate = useNavigate();
    const { setLoading } = useLoading();
    const userRole = localStorage.getItem('role'); // Obtener el rol del usuario desde el localStorage
    const itemsPerPage = 4; // Número de elementos por página
    
    const handleShowModal = (id) => {
        setSelectedId(id);  // Almacena el ID del participante que se va a eliminar
        setShowModal(true); // Muestra el modal
    };
    
    const handleCloseModal = () => {
        setShowModal(false); // Cierra el modal
    };   

    useEffect(() => {
        setLoading(true);
        Promise.all([getAllReportes()]).finally(() => {
            setLoading(false);
        });
    }, []);

    const getAllReportes = async () => {
        try {
            const token = localStorage.getItem('token');
            let allReportes = [];
            let currentPage = 1;
            let totalPages = 1;
    
            // Loop para obtener todas las páginas
            while (currentPage <= totalPages) {
                const response = await axios.get(`${endpoint}/pagos?page=${currentPage}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
    
                allReportes = [...allReportes, ...response.data.data];
                totalPages = response.data.last_page; // Total de páginas
                currentPage++;
            }
    
            // Ordenar los reportes por ID
            const sortedReportes = allReportes.sort((a, b) => b.id - a.id);
            setReportes(sortedReportes);
            setFilteredReportes(sortedReportes);
            console.log('Datos obtenidos:', sortedReportes);
        } catch (error) {
            setError('Error fetching data');
            console.error('Error fetching data:', error);
        }
    };
    

    const deleteReporte = async () => {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`${endpoint}/pagos/${selectedId}`,{
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                getAllReportes();
                setShowModal(false); // Cierra el modal tras la eliminación exitosa
                toast.success('Reporte eliminado con éxito');
            } catch (error) {
                setError('Error deleting data');
                console.error('Error deleting data:', error);
                toast.error('Error al eliminar el reporte');
            }
        
    };


    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchCedula(value);
        const filtered = reportes.filter(reporte =>
            reporte.cedula_identidad.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredReportes(filtered);
    };

    if (error) {
        return <div>{error}</div>;
    }

    const columns = ["id", "Cédula", "Fecha de Pago", "Monto Cancelado", "Monto Restante", "Comentario","Acciones"];

    const renderItem = (reporte) => (
        <tr key={reporte.id}>
        <td className="col-idq">{reporte.id}</td>
        <td className="col-cedulaq">{reporte.cedula_identidad}</td>
        <td className="col-fechaq">{moment(reporte.fecha).format('YYYY-MM-DD')}</td>
        <td className="col-montoq">{reporte.monto_cancelado} $</td>
        <td className="col-montoq">{reporte.monto_restante} $</td>
        <td className="col-comentarioq">{reporte.comentario_cuota}</td>
        <td className="col-accionesq">
            <div className="d-flex justify-content-around">

                <Button
                    variant="btn btn-info" 
                    onClick={() => navigate(`/pagos/${reporte.id}`)}
                    className="me-2"
                >
                    <i className="bi bi-eye"></i>
                </Button>
                {userRole === 'admin' && (
                

                <Button
                variant="btn btn-danger"
                onClick={() => handleShowModal(reporte.id)}
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
                <h1>Lista de Reportes de Pagos</h1>
                <div className="d-flex align-items-center">
                    <Form.Control
                        type="text"
                        placeholder="Buscar por cédula"
                        value={searchCedula}
                        onChange={handleSearchChange}
                        className="me-2"
                    />
                    {userRole === 'admin' ||userRole === 'pagos' ? (

                    <Button variant="btn custom" onClick={() => navigate('/pagos/create')} className="btn-custom">
                    <i className="bi bi-cash-coin me-2  "></i> Nuevo
                    </Button>
                    ):null}
                </div>
            </div>
            {/* Tabla paginada */}
            <PaginationTable
                data={filteredReportes}
                itemsPerPage={itemsPerPage}
                columns={columns}
                renderItem={renderItem}
            />


            {/* Modal  de eliminación */}
            <Modal show={showModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirmar eliminación</Modal.Title>
                </Modal.Header>
                <Modal.Body>¿Estás seguro de que deseas eliminar este Reporte de Pago?</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>
                        Cancelar
                    </Button>
                    <Button variant="danger" onClick={deleteReporte}>
                        Eliminar
                    </Button>
                </Modal.Footer>
            </Modal>
            <ToastContainer />
        </div>
    );
};

export default ShowPagos;
