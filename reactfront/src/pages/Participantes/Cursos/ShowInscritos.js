// src/components/ShowInscritos.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Table, Alert, Button, Form } from 'react-bootstrap';
import moment from 'moment';
import { useLoading } from '../../../components/LoadingContext';
import { toast, ToastContainer } from 'react-toastify';

const endpoint = 'http://localhost:8000/api';

const ShowInscritos = () => {
    const { cursoId } = useParams();
    const [inscripciones, setInscripciones] = useState([]);
    const [filteredInscripciones, setFilteredInscripciones] = useState([]);
    const [searchCedula, setSearchCedula] = useState('');
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
            const token = localStorage.getItem('token');
            const response = await axios.get(`${endpoint}/cursos_inscripcion?curso_id=${cursoId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const inscripcionesData = response.data.data;
            const inscripcionesConDetalles = await Promise.all(inscripcionesData.map(async inscripcion => {
                try {
                    const detallesResponse = await axios.get(`${endpoint}/identificacion/${inscripcion.cedula_identidad}`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });
                    return { ...inscripcion, ...detallesResponse.data };
                } catch (error) {
                    console.error('Error fetching detalles:', error);
                    return { ...inscripcion, nombres: 'N/A', apellidos: 'N/A' };
                }
            }));
            setInscripciones(inscripcionesConDetalles);
            setFilteredInscripciones(inscripcionesConDetalles);
        } catch (error) {
            setError('Error fetching data');
            console.error('Error fetching data:', error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar esta inscripción?')) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`${endpoint}/cursos_inscripcion/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                toast.success('Éxito al eliminar la inscripción');
                setFilteredInscripciones(filteredInscripciones.filter(inscripcion => inscripcion.id !== id));
            } catch (error) {
                console.error('Error deleting inscripcion:', error);
                setError('Error al eliminar la inscripción');
            }
        }
    };

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchCedula(value);
        const filtered = inscripciones.filter(inscripcion =>
            inscripcion.cedula_identidad.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredInscripciones(filtered);
    };

    return (
        <div className="container">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h1>Inscritos del Curso {cursoId}</h1>
                <div>
                    <Button
                        variant="success"
                        onClick={() => navigate(`/inscribir/${cursoId}`)}
                        className="me-2"
                    >
                        Inscribir
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={() => navigate('/cursos')}
                    >
                        Volver
                    </Button>
                </div>
            </div>

            <Form.Control
                type="text"
                placeholder="Buscar por cédula"
                value={searchCedula}
                onChange={handleSearchChange}
                style={{ width: '250px', marginBottom: '20px' }} // Ajuste del ancho y separación
            />

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
                    {filteredInscripciones.map(inscripcion => (
                        <tr key={inscripcion.id}>
                            <td>{inscripcion.cedula_identidad}</td>
                            <td>{moment(inscripcion.fecha_inscripcion).format('YYYY-MM-DD')}</td>
                            <td>{inscripcion.nombres}</td>
                            <td>{inscripcion.apellidos}</td>
                            <td>
                                <div className="d-flex justify-content-around">
                                    <Button
                                        variant="danger"
                                        onClick={() => handleDelete(inscripcion.id)}
                                    >
                                        Eliminar
                                    </Button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
            <ToastContainer />
        </div>
    );
};

export default ShowInscritos;
