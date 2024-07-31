import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';

const endpoint = 'http://localhost:8000/api';

const ShowDatos = () => {
    const [datos, setDatos] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        getAllDatos();
    }, []);

    const getAllDatos = async () => {
        try {
            const response = await axios.get(`${endpoint}/datos`);
            console.log('Datos obtenidos:', response.data);
            setDatos(response.data);
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
            <h1>Lista de Datos Registrados</h1>
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>Cédula</th>
                        <th>Nombres</th>
                        <th>Apellidos</th>
                        <th>Status</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                   
                    {datos?.data?.map((dato) => (

                        <tr key={dato.cedula_identidad}>
                            <td>{dato.cedula_identidad}</td>
                            <td>{dato.nombres}</td>
                            <td>{dato.apellidos}</td>
                            <td>{dato.statusSeleccion ? dato.statusSeleccion.descripcion : 'N/A'}</td>
                            <td>
                                <Button 
                                    variant="info" 
                                    href={`/datos/${dato.cedula_identidad}`}
                                    className="me-2"
                                >
                                    Ver más
                                </Button>
                                <Button 
                                    variant="warning" 
                                    href={`/datos/${dato.cedula_identidad}/edit`}
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
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
            <Button variant="success" href="/formulario/create">
                Agregar Nuevo Registro
            </Button>
        </div>
    );
};

export default ShowDatos;
