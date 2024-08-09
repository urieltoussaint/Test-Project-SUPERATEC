import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Table from 'react-bootstrap/Table';
import { useParams, useNavigate } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import './ShowCursos.css'; // Asegúrate de tener este archivo CSS en tu proyecto

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
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h1>Lista de Cursos</h1>
                <Button
                    variant="success"
                    onClick={() => navigate('/cursos/create')}
                >
                    Agregar Nuevo Curso
                </Button>
            </div>
            <div className="cards-container"></div>
            <Table striped bordered hover className="rounded-table">
                <thead>
                    <tr>
                        <th className="col-id">id</th>
                        <th className="col-descripcion">Curso</th>
                        <th className="col-horas">Cantidad de Horas</th>
                        <th className="col-fecha">Fecha de Inicio</th>
                        <th className="col-costo">Costo</th>
                        <th className="col-acciones">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {cursos.map((curso) => (
                        <tr key={curso.id}>
                            <td className="col-id">{curso.id}</td>
                            <td className="col-descripcion">{curso.descripcion}</td>
                            <td className="col-horas">{curso.cantidad_horas} h</td>
                            <td className="col-fecha">{curso.fecha_inicio}</td>
                            <td className="col-costo">{curso.costo} $</td>
                            <td className="col-acciones">
                                <div className="d-flex justify-content-around">
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
                                        className="me-2"
                                    >
                                        Eliminar
                                    </Button>

                                    <Button
                                        variant="info"
                                        onClick={() => navigate(`/inscritos/${curso.id}`)}
                                        className="me-2"
                                    >
                                        Inscritos
                                    </Button>
                                    <Button
                                        variant="success"
                                        onClick={() => navigate(`/inscribir/${curso.id}`)}
                                    >
                                        Inscribir
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

export default ShowCursos;
