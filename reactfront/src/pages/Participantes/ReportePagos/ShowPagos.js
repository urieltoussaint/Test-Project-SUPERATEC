import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Table from 'react-bootstrap/Table';
import { useParams, useNavigate } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import moment from 'moment';
import './ShowPagos.css'; // Asegúrate de tener este archivo CSS en tu proyecto

const endpoint = 'http://localhost:8000/api';

const ShowPagos = () => {
    const [reportes, setReportes] = useState([]);
    const [error, setError] = useState(null);
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        getAllReportes();
    }, []);

    const getAllReportes = async () => {
        try {
            const response = await axios.get(`${endpoint}/pagos`);
            console.log('Datos obtenidos:', response.data);
            const sortedReportes = response.data.data.sort((a, b) => b.id - a.id);
            setReportes(sortedReportes);
        } catch (error) {
            setError('Error fetching data');
            console.error('Error fetching data:', error);
        }
    };

    if (error) {
        return <div>{error}</div>;
    }

    const deleteReporte = async (id) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar este reporte de pago?')) {
            try {
                await axios.delete(`${endpoint}/pagos/${id}`);
                getAllReportes();
            } catch (error) {
                setError('Error deleting data');
                console.error('Error deleting data:', error);
            }
        }
    };

    return (
        <div className="container mt-5">
            <meta name="csrf-token" content="{{ csrf_token() }}"></meta>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h1>Lista de Reportes de Pagos</h1>
                <Button
                    variant="success"
                    onClick={() => navigate('/pagos/create')}
                >
                    Agregar Nuevo Pago
                </Button>
            </div>
            <div className="cards-container"></div>
            <Table striped bordered hover className="rounded-table">
                <thead>
                    <tr>
                        <th className="col-id">Id</th>
                        <th className="col-cedula">Cédula</th>
                        <th className="col-fecha">Fecha</th>
                        <th className="col-monto">Monto Cancelado</th>
                        <th className="col-monto">Monto Restante</th>
                        <th className="col-comentario">Comentario</th>
                        <th className="col-acciones">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {reportes.map((reporte) => (
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
                                        variant="warning"
                                        onClick={() => navigate(`pagos/${reporte.id}/edit`)}
                                        className="me-2"
                                    >
                                        Editar
                                    </Button>
                                    <Button
                                        variant="info"
                                        onClick={() => navigate(`/pagos/${reporte.id}`)}
                                        className="me-2"
                                    >
                                        Detalles
                                    </Button>
                                    <Button
                                        variant="danger"
                                        onClick={() => deleteReporte(reporte.id)}
                                    >
                                        Eliminar
                                    </Button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </div>
    );
};

export default ShowPagos;
