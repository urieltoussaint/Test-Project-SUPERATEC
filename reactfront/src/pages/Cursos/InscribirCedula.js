import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { useParams, useNavigate } from 'react-router-dom';
import { useLoading } from '../../components/LoadingContext'; 
import { ToastContainer, toast } from 'react-toastify';
import PaginationTable from '../../components/PaginationTable'; // Importa el componente

const userId = parseInt(localStorage.getItem('user'));  // ID del usuario logueado
const endpoint = 'http://localhost:8000/api';

const InscribirCedula = () => {
    const { cursoId } = useParams();
    const { cedula } = useParams();
    const [cursos, setCursos] = useState([]);
    const [searchCod, setSearchCod] = useState(''); // Nuevo estado para el buscador por COD
    const [filteredCursos, setFilteredCursos] = useState([]);
    const [searchCurso, setSearchCurso] = useState('');
    const [areaOptions, setAreaOptions] = useState([]);
    const [selectedArea, setSelectedArea] = useState('');
    const [error, setError] = useState(null);
    const { setLoading } = useLoading();
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(1);  // Estado para la página actual

    const itemsPerPage = 10;  // Definir cuántos elementos por página

    useEffect(() => {
        setLoading(true);
        fetchInitialData();
    }, [cursoId]);

    const fetchInitialData = async () => {
        await Promise.all([getAllCursos(), fetchAreaOptions()]);
        setLoading(false);
    };

    const getAllCursos = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${endpoint}/cursos?with=area`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });

            // Actualizar la lista de cursos
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
            const response = await axios.get(`${endpoint}/area`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setAreaOptions(response.data.data);
        } catch (error) {
            setError('Error fetching area options');
            console.error('Error fetching area options:', error);
        }
    };

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchCurso(value);
        applyFilters(value, searchCod, selectedArea); // Pasa el valor de búsqueda de curso
    };

    const handleCodChange = (e) => {
        const value = e.target.value;
        setSearchCod(value);
        applyFilters(searchCurso, value, selectedArea); // Pasa el valor de búsqueda por COD
    };

    const handleAreaChange = (e) => {
        const value = e.target.value;
        setSelectedArea(value);
        applyFilters(searchCurso, searchCod, value);
    };

    const applyFilters = (searchValue, codValue, areaValue) => {
        let filtered = cursos;

        if (searchValue) {
            filtered = filtered.filter(curso =>
                curso.descripcion.toLowerCase().includes(searchValue.toLowerCase())
            );
        }

        if (codValue) {
            filtered = filtered.filter(curso =>
                curso.cod.toLowerCase().includes(codValue.toLowerCase())
            );
        }

        if (areaValue) {
            filtered = filtered.filter(curso =>
                curso.area_id === parseInt(areaValue)
            );
        }

        setFilteredCursos(filtered);
        setCurrentPage(1);
    };

    const handleInscribir = async (cursoId) => {
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
            await axios.post(`${endpoint}/peticiones`, {
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

    if (error) {
        return <div>{error}</div>;
    }

    const columns = ["COD", "Curso", "Horas", "Fecha de Inicio", "Costo", "Acciones"];

    const renderItem = (curso) => (
        <tr key={curso.id}>
            <td>{curso.cod}</td>
            <td>{curso.descripcion}</td>
            <td>{curso.cantidad_horas} h</td>
            <td>{curso.fecha_inicio}</td>
            <td>{curso.costo} $</td>
            <td>
                <Button
                    variant="success"
                    onClick={() => handleInscribir(curso.id)}
                    className="d-flex align-items-center"
                >
                    <i className="bi bi-person-plus-fill me-2"></i> 
                </Button>
            </td>
        </tr>
    );

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

                <Form.Control
                    type="text"
                    placeholder="Buscar por COD"
                    value={searchCod}
                    onChange={handleCodChange}
                    className="me-2"
                />
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

            {/* Tabla paginada */}
            <PaginationTable
                data={filteredCursos}  // Datos filtrados
                itemsPerPage={itemsPerPage}
                columns={columns}
                renderItem={renderItem}
                currentPage={currentPage}  // Página actual
                onPageChange={setCurrentPage}  // Función para cambiar de página
                />

            <ToastContainer />
        </div>
    );
};

export default InscribirCedula;
