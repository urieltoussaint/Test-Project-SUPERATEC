import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Table from 'react-bootstrap/Table';
import { useParams, useNavigate } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import './ShowCursos.css'; // Asegúrate de tener este archivo CSS en tu proyecto
import { useLoading } from '../../../components/LoadingContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const endpoint = 'http://localhost:8000/api';

const ShowCursos = () => {
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
            const response = await axios.get(`${endpoint}/cursos?with=area`);
            console.log('Datos obtenidos:', response.data);
            setCursos(response.data.data);
            setFilteredCursos(response.data.data);
        } catch (error) {
            setError('Error fetching data');
            console.error('Error fetching data:', error);
        }
    };

    const fetchAreaOptions = async () => {
        try {
            const response = await axios.get(`${endpoint}/area`);
            setAreaOptions(response.data.data);
        } catch (error) {
            setError('Error fetching area options');
            console.error('Error fetching area options:', error);
        }
    };

    const deleteCursos = async (id) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar este curso?')) {
            try {
                await axios.delete(`${endpoint}/cursos/${id}`);
                getAllCursos();
                toast.success('Eliminado con éxito');
            } catch (error) {
                setError('Error deleting data');
                console.error('Error deleting data:', error);
                toast.error('Error al eliminar el curso');
            }
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

    if (error) {
        return <div>{error}</div>;
    }
    
    return (
        <div className="container mt-5">
            <meta name="csrf-token" content="{{ csrf_token() }}"></meta>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h1>Lista de Cursos</h1>
                <div className="d-flex align-items-center">
                    <Form.Control
                        type="text"
                        placeholder="Buscar por nombre de curso"
                        value={searchCurso}
                        onChange={handleSearchChange}
                        className="me-2"
                    />
                    <Button
                        variant="success"
                        onClick={() => navigate('/cursos/create')}
                    >
                        Agregar Nuevo Curso
                    </Button>
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
                        <th className="col-id">id</th>
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
                                <div className="d-flex justify-content-around">
                                    <Button
                                        variant="warning"
                                        onClick={() => navigate(`/cursos/${curso.id}/edit`)}
                                        className="me-2"
                                    >
                                        Actualizar
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
            <ToastContainer />
        </div>
    );
};

export default ShowCursos;
