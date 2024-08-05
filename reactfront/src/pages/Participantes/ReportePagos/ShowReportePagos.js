import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Table from 'react-bootstrap/Table';
import { useParams, useNavigate } from 'react-router-dom';
import Button from 'react-bootstrap/Button';

const endpoint = 'http://localhost:8000/api';

const ShowReportePagos = () => {
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
            setReportes(response.data.data); // Asegurarse de que `response.data.data` contenga los datos correctamente.
        } catch (error) {
            setError('Error fetching data');
            console.error('Error fetching data:', error);
        }
    };

    if (error) {
        return <div>{error}</div>;
    }
    
    return (
        <div className="container mt-5">
            <meta name="csrf-token" content="{{ csrf_token() }}"></meta>
            <h1>Lista de Reportes de Pagos</h1>
            <div className="cards-container"></div>
            <Table striped bordered hover className="rounded-table">
                <thead>
                    <tr>
                        <th>Cédula</th>
                        <th>Fecha</th>
                        <th>Monto</th>
                        <th>Acciones</th>
                        
                    </tr>
                </thead>
                <tbody>
                    {reportes.map((reporte) => (
                        <tr key={reporte.id}>
                            {/* <td>{reporte.cedula_identidad}</td> */}
                            <td>{new Date(reporte.fecha).toLocaleDateString()}</td>
                            <td>{reporte.descripcion}</td>
                            <td>
                                <Button
                                    variant="warning"
                                    onClick={() => navigate(`pagos/${reporte.id}/edit`)}
                                    className="me-2"
                                >
                                    Editar
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

export default ShowReportePagos;
