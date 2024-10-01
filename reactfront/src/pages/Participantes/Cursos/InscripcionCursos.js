import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Button } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import Select from 'react-select/async';
import { useLoading } from '../../../components/LoadingContext';
import { ToastContainer, toast } from 'react-toastify';
const userId = parseInt(localStorage.getItem('user'));  // ID del usuario logueado
const endpoint = 'http://localhost:8000/api';

const InscripcionCursos = () => {
    const { cursoId } = useParams();
    const [cedula, setCedula] = useState('');
    const [datos, setDatos] = useState(null);
    const [curso, setCurso] = useState(null);
    const [error, setError] = useState('');
    const { setLoading } = useLoading();
    const navigate = useNavigate();

    useEffect(() => {
        setLoading(true);
        Promise.all([fetchCurso()]).finally(() => {
            setLoading(false);
        });
    }, [cursoId]);

    const fetchCurso = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${endpoint}/cursos/${cursoId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setCurso(response.data);
        } catch (error) {
            console.error('Error fetching curso:', error);
            setError('Error fetching curso');
        }
    };

    const fetchOptions = async (inputValue) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${endpoint}/cedulas?query=${inputValue}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data.map((cedula) => ({
                value: cedula.cedula_identidad,
                label: cedula.cedula_identidad,
            }));
        } catch (error) {
            console.error('Error fetching cedulas:', error);
            return [];
        }
    };

    const handleCedulaChange = async (selectedOption) => {
        const selectedCedula = selectedOption ? selectedOption.value : '';
        setCedula(selectedCedula);

        if (selectedCedula) {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`${endpoint}/identificacion/${selectedCedula}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setDatos(response.data);
                setError('');
            } catch (error) {
                setError('Datos no encontrados');
                setDatos(null);
            }
        } else {
            setDatos(null);
        }
    };

    const handleInscripcion = async () => {
    try {
        const token = localStorage.getItem('token');

        // Realizar la inscripción del curso y actualizar el status_pay
        const inscripcionResponse = await axios.post(`${endpoint}/cursos_inscripcion`, {
            cedula_identidad: cedula,
            curso_id: cursoId,
            status_pay: 1, // Actualizar el status_pay a 1
        }, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        // Obtener el ID de la inscripción recién creada
        const inscripcionId = inscripcionResponse.data.id;

        toast.success('Inscripción Exitosa');

        // Crear la petición de pago no realizado usando el ID de la inscripción como key
        const peticionResponse = await axios.post(`${endpoint}/peticiones`, {
            zona_id: 3, // Zona 3
            comentario: 'Pago no realizado', // Comentario
            user_id: userId,  // Usuario logueado que envía la solicitud
            role_id: 4,
            status: false,  // Estado de la petición
            finish_time: null,  // No hay finish_time al momento de creación
            key: inscripcionId,  // Usar el ID de la inscripción como key

        }, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        toast.success('Petición creada: Pago no realizado');
        navigate('/cursos');
    } catch (error) {
        toast.error('Error en la inscripción o en la creación de la petición');
        console.error('Error en la inscripción o en la creación de la petición:', error);
    }
};


    return (
        <div className="container">
            <h1>Inscripción al Curso {curso && `de ${curso.descripcion}`}</h1>
            <div>
                <Form.Group controlId="cedula">
                    <Form.Label>Cédula de Identidad</Form.Label>
                    <Select
                        cacheOptions
                        loadOptions={fetchOptions}
                        onChange={handleCedulaChange}
                        placeholder="Escriba la cédula de identidad"
                        noOptionsMessage={() => 'No se encontraron cédulas'}
                    />
                </Form.Group>
            </div>
            {error && <div className="alert alert-danger">{error}</div>}
            {datos && (
                <div className="mt-3">
                    <p><strong>Nombre:</strong> {datos.nombres}</p>
                    <p><strong>Apellidos:</strong> {datos.apellidos}</p>
                    <p><strong>Email:</strong> {datos.direccion_email}</p>
                    <p><strong>Edad:</strong> {datos.edad}</p>
                    <Button variant="success" onClick={handleInscripcion}>
                        Inscribir
                    </Button>
                </div>
            )}
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

export default InscripcionCursos;
