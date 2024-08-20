import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Table from 'react-bootstrap/Table';
import { useParams, useNavigate } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { useLoading } from '../../../components/LoadingContext'; 
import { ToastContainer,toast } from 'react-toastify';


const endpoint = 'http://localhost:8000/api';

const InscribirCedula = () => {
    const { cedula } = useParams();
    const [cursos, setCursos] = useState([]);
    const [filteredCursos, setFilteredCursos] = useState([]);
    const [searchCurso, setSearchCurso] = useState('');
    const [areaOptions, setAreaOptions] = useState([]);
    const [selectedArea, setSelectedArea] = useState('');
    const [error, setError] = useState(null);
    const { setLoading } = useLoading();
    const navigate = useNavigate();

    useEffect(() => {
        setLoading(true);
        Promise.all([getAllCursos(), fetchAreaOptions()]).finally(() => {
            setLoading(false);
        });
    }, []);

    const getAllCursos = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${endpoint}/cursos?with=area`,{
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },});
            setCursos(response.data.data);
            setFilteredCursos(response.data.data);
        } catch (error) {
            setError('Error fetching data');
            console.error('Error fetching data:', error);
        }
    };

    const fetchAreaOptions = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${endpoint}/area`,{headers: {
                Authorization: `Bearer ${token}`,
            },});
            setAreaOptions(response.data.data);
        } catch (error) {
            setError('Error fetching area options');
            console.error('Error fetching area options:', error);
        }
    };

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchCurso(value);
        applyFilters(value, selectedArea);
    };

    const handleAreaChange = (e) => {
        const value = e.target.value;
        setSelectedArea(value);
        applyFilters(searchCurso, value);
    };

    const applyFilters = (searchValue, areaValue) => {
        let filtered = cursos;

        if (searchValue) {
            filtered = filtered.filter(curso =>
                curso.descripcion.toLowerCase().includes(searchValue.toLowerCase())
            );
        }

        if (areaValue) {
            filtered = filtered.filter(curso =>
                curso.area_id === parseInt(areaValue)
            );
        }

        setFilteredCursos(filtered);
    };

    const handleInscribir = async (cursoId) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`${endpoint}/cursos_inscripcion`, {
                cedula_identidad: cedula,
                curso_id: cursoId
            },{headers: {
                Authorization: `Bearer ${token}`,
            }});
            const inscripcionCursoId = response.data.id; // Suponiendo que el servidor devuelve el ID de inscripción
            toast.success('Inscripción Exitosa');
            navigate(`/pagos/${cedula}/${inscripcionCursoId}`); // Redirige a la página de creación de pago con inscripcion_curso_id
        } catch (error) {

            toast.error('Inscripción Fallida');
            console.error('Error inscribiendo al participante:', error);
        } finally {
            setLoading(false);
        }
    };

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div className="container mt-5">
            <meta name="csrf-token" content="{{ csrf_token() }}"></meta>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h1>Inscribir V{cedula} en Cursos</h1>
                <div className="d-flex align-items-center">
                    <Form.Control
                        type="text"
                        placeholder="Buscar por nombre"
                        value={searchCurso}
                        onChange={handleSearchChange}
                        className="me-2"
                    />
                </div>
            </div>

            <div className="d-flex mb-3 custom-width">
                <Form.Select
                    value={selectedArea}
                    onChange={handleAreaChange}
                    className="me-2"
                >
                    <option value="">Filtrar por Área</option>
                    {areaOptions.map(option => (
                        <option key={option.id} value={option.id}>{option.descripcion}</option>
                    ))}
                </Form.Select>
            </div>

            <div className="cards-container"></div>
            <Table striped bordered hover className="rounded-table">
                <thead>
                    <tr>
                        <th className="col-id">ID</th>
                        <th className="col-descripcion">Curso</th>
                        <th className="col-horas">Cantidad de Horas</th>
                        <th className="col-fecha">Fecha de Inicio</th>
                        <th className="col-costo">Costo</th>
                        <th className="col-acciones">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredCursos.map((curso) => (
                        <tr key={curso.id}>
                            <td className="col-id">{curso.id}</td>
                            <td className="col-descripcion">{curso.descripcion}</td>
                            <td className="col-horas">{curso.cantidad_horas} h</td>
                            <td className="col-fecha">{curso.fecha_inicio}</td>
                            <td className="col-costo">{curso.costo} $</td>
                            <td className="col-acciones">
                                <Button
                                    variant="success"
                                    onClick={() => handleInscribir(curso.id)}
                                >
                                    Inscribir
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
            
        </div>
    );
};

export default InscribirCedula;
