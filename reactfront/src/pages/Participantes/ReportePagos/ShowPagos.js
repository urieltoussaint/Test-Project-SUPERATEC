import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Table from 'react-bootstrap/Table';
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
    const [filteredReportes, setFilteredReportes] = useState([]);
    const [searchCedula, setSearchCedula] = useState('');
    const [error, setError] = useState(null);
    const { id } = useParams();
    const navigate = useNavigate();
    const { setLoading } = useLoading();
    const userRole = localStorage.getItem('role'); // Obtener el rol del usuario desde el localStorage
    const itemsPerPage = 4; // Número de elementos por página
    

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
    

    const deleteReporte = async (id) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar este Reporte de Pago?')) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`${endpoint}/pagos/${id}`,{
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                getAllReportes();
                toast.success('Reporte eliminado con éxito');
            } catch (error) {
                setError('Error deleting data');
                console.error('Error deleting data:', error);
                toast.error('Error al eliminar el reporte');
            }
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
        <td className="col-id">{reporte.id}</td>
        <td className="col-cedula">{reporte.cedula_identidad}</td>
        <td className="col-fecha">{moment(reporte.fecha).format('YYYY-MM-DD')}</td>
        <td className="col-monto">{reporte.monto_cancelado} $</td>
        <td className="col-monto">{reporte.monto_restante} $</td>
        <td className="col-comentario">{reporte.comentario_cuota}</td>
        <td className="col-acciones">
            <div className="d-flex justify-content-around">
                <Button
                    variant="info"
                    onClick={() => navigate(`/pagos/${reporte.id}`)}
                    className="me-2"
                >
                    Detalles
                </Button>
                {userRole === 'admin' && (
                <Button
                    variant="danger"
                    onClick={() => deleteReporte(reporte.id)}
                >
                    Eliminar
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
                    {userRole === 'admin' && (
                    <Button
                        variant="success"
                        onClick={() => navigate('/pagos/create')}
                    >
                        Agregar Nuevo Pago
                    </Button>
                    )}
                </div>
            </div>
            {/* Tabla paginada */}
            <PaginationTable
                data={filteredReportes}
                itemsPerPage={itemsPerPage}
                columns={columns}
                renderItem={renderItem}
            />
            <ToastContainer />
        </div>
    );
};

export default ShowPagos;
