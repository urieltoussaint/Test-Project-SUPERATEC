import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Table from 'react-bootstrap/Table';
import { useParams, useNavigate } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import moment from 'moment';

const endpoint = 'http://localhost:8000/api';

const ShowPagos = () => {
    const [reportes, setReportes] = useState([]);
    const [error, setError] = useState(null);
    const { id } = useParams();
    const navigate = useNavigate(); // Inicializa useNavigate

    useEffect(() => {
        getAllReportes();
    }, []);

    const getAllReportes = async () => {
        try {
            const response = await axios.get(`${endpoint}/pagos`);
            console.log('Datos obtenidos:', response.data);
            // Ordenar los reportes por ID de forma descendente
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
            <h1>Lista de Reportes de Pagos</h1>
            <div className="cards-container"></div>
            <Table striped bordered hover className="rounded-table">
                <thead>
                    <tr>
                        <th>Id</th>
                        <th>Cédula</th>
                        <th>Fecha</th>
                        <th>Monto Cancelado</th>
                        <th>Monto Restante</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {reportes.map((reporte) => (
                        <tr key={reporte.id}>
                            <td>{reporte.id}</td>
                            <td>{reporte.cedula_identidad}</td>
                            <td>{moment(reporte.fecha).format('YYYY-MM-DD')}</td>
                            <td>{reporte.monto_cancelado} $</td>
                            <td>{reporte.monto_restante} $</td>
                            <td>
                                <Button
                                    variant="info"
                                    onClick={() => navigate(`/pagos/${reporte.id}`)}
                                    className="me-2"
                                >
                                    Ver Detalles
                                </Button>
                                <Button
                                    variant="danger"
                                    onClick={() => deleteReporte(reporte.id)}
                                    className="me-2"
                                >
                                    Eliminar
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
            <Button
                variant="success"
                onClick={() => navigate('/pagos/create')}
                className="mt-3"
            >
                Agregar Nuevo Pago
            </Button>
        </div>
    );
};

export default ShowPagos;
