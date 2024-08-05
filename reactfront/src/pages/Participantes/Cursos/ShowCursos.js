import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Table from 'react-bootstrap/Table';
import { useParams, useNavigate } from 'react-router-dom';
import Button from 'react-bootstrap/Button';

const endpoint = 'http://localhost:8000/api';

const ShowCursos = () => {
    const [cursos, setCursos] = useState([]);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        getAllCursos();
    }, []);

    const getAllCursos = async () => {
        try {
            const response = await axios.get(`${endpoint}/cursos`);
            console.log('Datos obtenidos:', response.data);
            setCursos(response.data.data); // Asegurarse de que `response.data.data` contenga los datos correctamente.
        } catch (error) {
            setError('Error fetching data');
            console.error('Error fetching data:', error);
        }
    };

    const deleteCursos = async (id) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar este curso?')) {
            try {
                await axios.delete(`${endpoint}/cursos/${id}`);
                getAllCursos();
            } catch (error) {
                setError('Error deleting data');
                console.error('Error deleting data:', error);
            }
        }
    };

    if (error) {
        return <div>{error}</div>;
    }
    
    return (
        <div className="container mt-5">
            <meta name="csrf-token" content="{{ csrf_token() }}"></meta>
            <h1>Lista de Cursos</h1>
            <div className="cards-container"></div>
            <Table striped bordered hover className="rounded-table">
                <thead>
                    <tr>
                        <th>id</th>
                        <th>Curso</th>
                        <th>Cantidad de Horas</th>
                        <th>Fecha de Inicio</th>
                        <th>Costo</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {cursos.map((curso) => (
                        <tr key={curso.id}>
                            <td>{curso.id}</td>
                            <td>{curso.descripcion}</td>
                            <td>{curso.cantidad_horas} h</td>
                            <td>{curso.fecha_inicio}</td>
                            <td>{curso.costo} $</td>
                            <td>
                                <Button
                                    variant="warning"
                                    onClick={() => navigate(`/cursos/${curso.id}/edit`)}
                                    className="me-2"
                                >
                                    Editar
                                </Button>
                                <Button
                                    variant="danger"
                                    onClick={() => deleteCursos(curso.id)}
                                >
                                    Eliminar
                                </Button>
                                <Button
                                    variant="info"
                                    onClick={() => navigate(`/cursos/${curso.id}/inscritos`)}
                                    className="me-2"
                                >
                                    Inscritos
                                </Button>
                                <Button variant="success" onClick={() => navigate(`/inscribir/${curso.id}`)}
                                    >Inscribir</Button>

                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
            <Button
                variant="success"
                onClick={() => navigate('/cursos/create')}
                className="mt-3"
            >
                Agregar Nuevo Curso
            </Button>
        </div>
    );
};

export default ShowCursos;
