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
import PaginationTable from '../../../components/PaginationTable';

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
    const userRole = localStorage.getItem('role'); // Puede ser 'admin', 'superuser', 'invitado', etc.
    const itemsPerPage = 4; // Número de elementos por página
    
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
                Authorization: `Bearer ${token}`,
            },});
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
            const token = localStorage.getItem('token');
            const response = await axios.get(`${endpoint}/area`,{headers: {
                Authorization: `Bearer ${token}`,
            }});
            setAreaOptions(response.data.data);
        } catch (error) {
            setError('Error fetching area options');
            console.error('Error fetching area options:', error);
        }
    };

    const deleteCursos = async (id) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar este curso?')) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`${endpoint}/cursos/${id}`,{
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
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

    const columns = ["id", "Descripción", "Horas", "Fecha", "Costo", "Acciones"];
    
    const renderItem = (curso) => (
        <tr key={curso.id}>
            <td>{curso.id}</td>
            <td>{curso.descripcion}</td>
            <td>{curso.cantidad_horas}</td>
            <td>{curso.fecha_inicio}</td>
            <td>{curso.costo} $</td>
            <td>
            <div className="d-flex justify-content-around">
                {/* Mostrar el botón de Actualizar solo para 'admin' o 'superuser' */}
                {userRole === 'admin' || userRole === 'superuser' ? (
                                <>
                                    <Button
                                        variant="warning"
                                        onClick={() => navigate(`/cursos/${curso.id}/edit`)}
                                        className="me-2"
                                    >
                                        Actualizar
                                    </Button>

                                    {/* Mostrar el botón de Inscribir solo para 'admin' o 'superuser' */}
                                    <Button
                                        variant="success"
                                        onClick={() => navigate(`/inscribir/${curso.id}`)}
                                    >
                                        Inscribir
                                    </Button>

                                    {/* Mostrar el botón de Inscritos para 'admin' o 'superuser' */}
                                    <Button
                                        variant="info"
                                        onClick={() => navigate(`/inscritos/${curso.id}`)}
                                        className="me-2"
                                    >
                                        Inscritos
                                    </Button>
                                </>
                            ) : (
                                // Mostrar solo el botón de ver inscritos para otros roles
                                <Button
                                    variant="info"
                                    onClick={() => navigate(`/inscritos/${curso.id}`)}
                                    className="me-2"
                                >
                                    Inscritos
                                </Button>
                            )}
                    
                            {/* Mostrar el botón de Eliminar solo para 'admin' */}
                            {userRole === 'admin' && (
                                <Button
                                    variant="danger"
                                    onClick={() => deleteCursos(curso.id)}
                                    className="me-2"
                                >
                                    Eliminar
                                </Button>
                            )}
                </div>
            </td>
        </tr>
    );
    
    
    
    return (
        <div className="container mt-5">
            <meta name="csrf-token" content="{{ csrf_token() }}"></meta>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h1>Lista de Cursos</h1>
                <div className="d-flex align-items-center">
                    {/* Mostrar el buscador para todos los usuarios, incluidos los invitados */}
                    <Form.Control
                        type="text"
                        placeholder="Buscar por nombre de curso"
                        value={searchCurso}
                        onChange={handleSearchChange}
                        className="me-2"
                    />

                    {/* Mostrar el botón "Agregar Nuevo Curso" solo para 'admin' o 'superuser' */}
                    {userRole === 'admin' || userRole == 'superuser' ?(
                        <Button
                            variant="success"
                            onClick={() => navigate('/cursos/create')}
                        >
                            Agregar Nuevo Curso
                        </Button>
                    ):
                    null}
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
            {/* Tabla paginada */}
            <PaginationTable
                data={filteredCursos}
                itemsPerPage={itemsPerPage}
                columns={columns}
                renderItem={renderItem}
            />
            <ToastContainer />
        </div>
    );
};

export default ShowCursos;
