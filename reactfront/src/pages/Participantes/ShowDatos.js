import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Table from 'react-bootstrap/Table';
import { useParams, useNavigate } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import './ShowDatos.css'; // Asegúrate de tener este archivo CSS en tu proyecto

const endpoint = 'http://localhost:8000/api';

const ShowDatos = () => {
    const [datos, setDatos] = useState([]);
    const [error, setError] = useState(null);
    const { id } = useParams();
    const navigate = useNavigate(); // Inicializa useNavigate

    useEffect(() => {
        getAllDatos();
    }, [id]);

    const getAllDatos = async () => {
        try {
            const response = await axios.get(`${endpoint}/datos?with=statusSeleccion`);
            console.log('Datos obtenidos:', response.data);
            setDatos(response.data.data); // Asegurarse de que `response.data.data` contenga los datos correctamente.
        } catch (error) {
            setError('Error fetching data');
            console.error('Error fetching data:', error);
        }
    };

    const deleteDatos = async (id) => {
        try {
            await axios.delete(`${endpoint}/datos/${id}`);
            getAllDatos();
        } catch (error) {
            setError('Error deleting data');
            console.error('Error deleting data:', error);
        }
    };

    if (error) {
        return <div>{error}</div>;
    }
    
    return (
        <div className="container mt-5">
            <meta name="csrf-token" content="{{ csrf_token() }}"></meta>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h1>Lista de Participantes</h1>
                <Button
                    variant="success"
                    onClick={() => navigate('/formulario/create')}
                    className="mt-3"
                >
                    Agregar Nuevo Participante
                </Button>
            </div>
            <div className="cards-container"></div>
            <Table striped bordered hover className="rounded-table">
                <thead>
                    <tr>
                        <th className="col-cedula">Cédula</th>
                        <th className="col-nombres">Nombres</th>
                        <th className="col-apellidos">Apellidos</th>
                        {/* <th>Status</th> */}
                        <th className="col-acciones">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {datos.map((dato) => (
                        <tr key={dato.cedula_identidad}>
                            <td className="col-cedula">{dato.cedula_identidad}</td>
                            <td className="col-nombres">{dato.nombres}</td>
                            <td className="col-apellidos">{dato.apellidos}</td>
                            {/* <td>{dato.status_seleccion?.descripcion || 'N/A'}</td> */}
                            <td className="col-acciones">
                                <div className="d-flex justify-content-around">
                                    <Button
                                        variant="info"
                                        onClick={() => navigate(`/datos/${dato.cedula_identidad}`)}
                                        className="me-2"
                                    >
                                        Ver más
                                    </Button>
                                    <Button
                                        variant="warning"
                                        onClick={() => navigate(`/datos/${dato.cedula_identidad}/edit`)}
                                        className="me-2"
                                    >
                                        Editar
                                    </Button>
                                    <Button
                                        variant="danger"
                                        onClick={() => deleteDatos(dato.cedula_identidad)}
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

export default ShowDatos;