// src/components/ShowInscritos.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Table, Alert, Button } from 'react-bootstrap';
import moment from 'moment';  // Importación correcta de moment
import { useLoading } from '../../../components/LoadingContext';

const endpoint = 'http://localhost:8000/api';

const ShowInscritos = () => {
    const { cursoId } = useParams();
    const [inscripciones, setInscripciones] = useState([]);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { setLoading } = useLoading();

    useEffect(() => {
        setLoading(true);
        Promise.all([getInscritos()]).finally(() => {
            setLoading(false);
        });
    }, [cursoId]);


    const getInscritos = async () => {
        try {
            const response = await axios.get(`${endpoint}/cursos_inscripcion?curso_id=${cursoId}`);
            const inscripcionesData = response.data.data;
            const inscripcionesConDetalles = await Promise.all(inscripcionesData.map(async inscripcion => {
                try {
                    const detallesResponse = await axios.get(`${endpoint}/identificacion/${inscripcion.cedula_identidad}`);
                    return { ...inscripcion, ...detallesResponse.data };
                } catch (error) {
                    console.error('Error fetching detalles:', error);
                    return { ...inscripcion, nombres: 'N/A', apellidos: 'N/A' };
                }
            }));
            setInscripciones(inscripcionesConDetalles);
        } catch (error) {
            setError('Error fetching data');
            console.error('Error fetching data:', error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar esta inscripción?')) {
            try {
                await axios.delete(`${endpoint}/cursos_inscripcion/${id}`);
                setInscripciones(inscripciones.filter(inscripcion => inscripcion.id !== id));
            } catch (error) {
                console.error('Error deleting inscripcion:', error);
                setError('Error al eliminar la inscripción');
            }
        }
    };

    return (
        <div className="container">
            <h1>Inscritos del Curso {cursoId}</h1>
            {error && <Alert variant="danger">{error}</Alert>}
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>Cédula</th>
                        <th>Fecha de Inscripción</th>
                        <th>Nombres</th>
                        <th>Apellidos</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {inscripciones.map(inscripcion => (
                        <tr key={inscripcion.id}>
                            <td>{inscripcion.cedula_identidad}</td>
                            <td>{moment(inscripcion.fecha_inscripcion).format('YYYY-MM-DD')}</td>
                            <td>{inscripcion.nombres}</td>
                            <td>{inscripcion.apellidos}</td>
                            <td>
                                <Button 
                                    variant="danger" 
                                    onClick={() => handleDelete(inscripcion.id)}
                                >
                                    Eliminar
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
            <Button 
                variant="secondary" 
                onClick={() => navigate('/cursos')}
                className="mt-4"
            >
                Volver
            </Button>
        </div>
    );
};

export default ShowInscritos;
