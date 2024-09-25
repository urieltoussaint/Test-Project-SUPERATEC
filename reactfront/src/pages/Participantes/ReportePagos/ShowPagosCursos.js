import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Table from 'react-bootstrap/Table';
import { useParams, useNavigate } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import moment from 'moment';
import './ShowPagos.css';
import { useLoading } from '../../../components/LoadingContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PaginationTable from '../../../components/PaginationTable';

const endpoint = 'http://localhost:8000/api';

const ShowPagosCursos = () => {
    const [reportes, setReportes] = useState([]);
    const [filteredReportes, setFilteredReportes] = useState([]);
    const [error, setError] = useState(null);
    const { inscripcion_curso_id } = useParams(); // Obtener el inscripcion_curso_id desde la URL
    const navigate = useNavigate();
    const { setLoading } = useLoading();
    const userRole = localStorage.getItem('role'); // Obtener el rol del usuario desde el localStorage
    const itemsPerPage = 4; // Número de elementos por página

    useEffect(() => {
        setLoading(true);
        getPagosByCurso().finally(() => {
            setLoading(false);
        });
    }, [inscripcion_curso_id]);

    const getPagosByCurso = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${endpoint}/pagos?curso_id=${inscripcion_curso_id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            // Filtrar los pagos que coinciden con el inscripcion_curso_id
            const pagosFiltrados = response.data.data.filter(
                (reporte) => reporte.inscripcion_curso_id === parseInt(inscripcion_curso_id)
            );

            // Ordenar por ID (más recientes primero)
            const sortedReportes = pagosFiltrados.sort((a, b) => b.id - a.id);
            setReportes(sortedReportes);
            setFilteredReportes(sortedReportes);
        } catch (error) {
            setError('Error fetching data');
            console.error('Error fetching data:', error);
        }
    };

    const deleteReporte = async (id) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar este Reporte de Pago?')) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`${endpoint}/pagos/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                getPagosByCurso(); // Volver a cargar los pagos después de la eliminación
                toast.success('Reporte eliminado con éxito');
            } catch (error) {
                setError('Error deleting data');
                console.error('Error deleting data:', error);
                toast.error('Error al eliminar el reporte');
            }
        }
    };

    const columns = ["id", "Cédula", "Fecha de Pago", "Monto Cancelado", "Monto Restante", "Comentario", "Acciones"];

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
                        onClick={() => navigate(`/pagos/${reporte.id}`)} // Redirigir a la página de detalles
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
                <h1>Lista de Pagos por Curso</h1>
                {(userRole === 'admin' || userRole === 'pagos') && (
                    <Button
                        variant="success"
                        onClick={() => navigate('/pagos/create')}
                    >
                        Agregar Nuevo Pago
                    </Button>
                )}
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

export default ShowPagosCursos;
