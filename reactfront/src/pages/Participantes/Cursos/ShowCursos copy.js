import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Table from 'react-bootstrap/Table';
import { useParams, useNavigate } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import { Modal } from 'react-bootstrap';
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
    const [searchCod, setSearchCod] = useState(''); // Nuevo estado para el buscador por COD
    const [areaOptions, setAreaOptions] = useState([]);
    const [selectedArea, setSelectedArea] = useState('');
    const [error, setError] = useState(null);
    const { setLoading } = useLoading();
    const navigate = useNavigate();
    const userRole = localStorage.getItem('role'); // Puede ser 'admin', 'superuser', 'invitado', etc.
    const itemsPerPage = 4; // Número de elementos por página
    const [showModal, setShowModal] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    

    const handleShowModal = (id) => {
        setSelectedId(id);  // Almacena el ID del participante que se va a eliminar
        setShowModal(true); // Muestra el modal
    };
    
    const handleCloseModal = () => {
        setShowModal(false); // Cierra el modal
    };


    useEffect(() => {
        setLoading(true);
        Promise.all([getAllCursos(), fetchAreaOptions()]).finally(() => {
            setLoading(false);
        });
    }, []);

    const getAllCursos = async () => {
        try {
            const token = localStorage.getItem('token');
            let allCursos = [];
            let currentPage = 1;
            let totalPages = 1;
    
            // Loop para obtener todas las páginas
            while (currentPage <= totalPages) {
                const response = await axios.get(`${endpoint}/cursos?with=area&page=${currentPage}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                });
    
                allCursos = [...allCursos, ...response.data.data];
                totalPages = response.data.last_page;
                currentPage++;
            }
    
            setCursos(allCursos);
            setFilteredCursos(allCursos);
            console.log('Datos obtenidos:', allCursos);
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

    const deleteCursos = async () => {
        const token = localStorage.getItem('token');
        try {
            await axios.delete(`${endpoint}/cursos/${selectedId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            toast.success('Curso eliminado con Éxito');             
            getAllCursos();
            setShowModal(false); // Cierra el modal tras la eliminación exitosa
        } catch (error) {
            setError('Error deleting data');
            console.error('Error deleting data:', error);
            toast.error('Error al eliminar Participante');
            setShowModal(false); // Cierra el modal tras el error
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
    };

    if (error) {
        return <div>{error}</div>;
    }

    const columns = ["COD", "Descripción", "Horas", "Fecha", "Costo", "Acciones"];
    
    const renderItem = (curso) => (
        <tr key={curso.cod}>
            <td className='col-cods'>{curso.cod}</td>
            <td className='col-descripcions'>{curso.descripcion}</td>
            <td className='col-horass'>{curso.cantidad_horas}</td>
            <td className='col-fechas'>{curso.fecha_inicio}</td>
            <td className='col-costos'>{curso.costo} $</td>
            <td>
            <div className="acciones">
                {/* Mostrar el botón de Actualizar solo para 'admin' o 'superuser' */}
                                    <Button
                                        variant="btn btn-info" 
                                        onClick={() => navigate(`/inscritos/${curso.id}`)}
                                        className="me-2"
                                    >
                                        <i className="bi bi-eye"></i>
                                    </Button>
                {userRole === 'admin' || userRole === 'superuser' ? (
                                <>
                                    <Button
                                    variant="btn btn-warning"
                                    onClick={() => navigate(`/cursos/${curso.id}/edit`)}
                                    className="me-2"
                                >
                                    <i className="bi bi-pencil-fill"></i>
                                </Button>

                                    {/* Mostrar el botón de Inscribir solo para 'admin' o 'superuser' */}

                                    <Button
                                        variant="btn btn-success" 
                                        onClick={() => navigate(`/inscribir/${curso.id}`)}
                                        className="me-2"
                                    >
                                        <i className="bi bi-person-plus-fill"></i>
                                    </Button>

                                </>
                            ) : (
                                null
                            )}
                    
                            {/* Mostrar el botón de Eliminar solo para 'admin' */}
                            {userRole === 'admin' && (

                                <Button
                                    variant="btn btn-danger"
                                    onClick={() => handleShowModal(curso.id)}
                                    className="me-2"
                                >
                                    <i className="bi bi-trash3-fill"></i>
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

                        <Button variant="btn custom" onClick={() => navigate('/cursos/create')} className="btn-custom">
                            <i className="bi bi-book-half me-2  "></i> Nuevo
                        </Button>
                    ):
                    null}
                </div>
            </div>

            {/* Buscador por COD */}
            <div className="d-flex mb-3 custom-width">
                <Form.Control
                    type="text"
                    placeholder="Buscar por COD"
                    value={searchCod}
                    onChange={handleCodChange}
                    className="me-2"
                />
               {/* Buscador por Area      */}
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


             {/* Modal  de eliminación */}
             <Modal show={showModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirmar eliminación</Modal.Title>
                </Modal.Header>
                <Modal.Body>¿Estás seguro de que deseas eliminar este Curso y todos los datos relacionados a él?</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>
                        Cancelar
                    </Button>
                    <Button variant="danger" onClick={deleteCursos}>
                        Eliminar
                    </Button>
                </Modal.Footer>
            </Modal>

            <ToastContainer />
        </div>
    );
};

export default ShowCursos;
