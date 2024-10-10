import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Table from 'react-bootstrap/Table';
import { useParams, useNavigate } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import './ShowVoluntariados.css'; // Asegúrate de tener este archivo CSS en tu proyecto
import { useLoading } from '../../../components/LoadingContext';   
import { toast, ToastContainer } from 'react-toastify';
import PaginationTable from '../../../components/PaginationTable';
import { Modal } from 'react-bootstrap';

const endpoint = 'http://localhost:8000/api';

const ShowVoluntariados = () => {
    const [voluntariados, setVoluntariados] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [filteredVoluntariados, setFilteredVoluntariados] = useState([]);
    const [searchCedula, setSearchCedula] = useState('');
    const [areaOptions, setAreaOptions] = useState([]);
    const [selectedArea, setSelectedArea] = useState('');
    const [nivelOptions, setNivelOptions] = useState([]);
    const [selectedNivel, setSelectedNivel] = useState('');
    const [generoOptions, setGeneroOptions] = useState([]);
    const [selectedGenero, setSelectedGenero] = useState('');
    const [centroOptions, setCentroOptions] = useState([]);
    const [selectedCentro, setSelectedCentro] = useState('');
    const [error, setError] = useState(null);
    const { id } = useParams();
    const { setLoading } = useLoading();
    const userRole = localStorage.getItem('role'); // Puede ser 'admin', 'superuser', 'invitado', etc.
    const [currentPage, setCurrentPage] = useState(1);  // Estado para la página actual
    

    

    const itemsPerPage = 4;

    const navigate = useNavigate();

    const handleShowModal = (id) => {
        setSelectedId(id);  // Almacena el ID del participante que se va a eliminar
        setShowModal(true); // Muestra el modal
    };
    
    const handleCloseModal = () => {
        setShowModal(false); // Cierra el modal
    };   

    useEffect(() => {
        setLoading(true);
        Promise.all([getAllVoluntariados(), fetchFilterOptions()]).finally(() => {
            setLoading(false);
            
        });
    }, [id]);


    const getAllVoluntariados = async () => {
        try {
            const token = localStorage.getItem('token');
            let allVoluntariados = [];
            let currentPage = 1;
            let totalPages = 1;
    
            // Loop para obtener todas las páginas
            while (currentPage <= totalPages) {
                const response = await axios.get(`${endpoint}/voluntariados?with=informacionVoluntariados,nivelInstruccion,genero&page=${currentPage}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
    
                allVoluntariados = [...allVoluntariados, ...response.data.data];
                totalPages = response.data.last_page; // Total de páginas
                currentPage++;
            }
    
            setVoluntariados(allVoluntariados);
            setFilteredVoluntariados(allVoluntariados);
            console.log('Voluntariados obtenidos:', allVoluntariados);
        } catch (error) {
            setError('Error fetching data');
            console.error('Error fetching data:', error);
        }
    };
    

    
    const fetchFilterOptions = async () => {
        const token = localStorage.getItem('token');
        try {
            
            const areaResponse = await axios.get(`${endpoint}/area`,{
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setAreaOptions(areaResponse.data.data);
            

            const nivelResponse = await axios.get(`${endpoint}/nivel_instruccion`,{
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setNivelOptions(nivelResponse.data.data);

            const generoResponse = await axios.get(`${endpoint}/genero`,{
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setGeneroOptions(generoResponse.data.data);

            const centroResponse = await axios.get(`${endpoint}/centro`,{
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setCentroOptions(centroResponse.data.data);
            
        } catch (error) {
            setError('Error fetching filter options');
            console.error('Error fetching filter options:', error);
        }
        
        

        
        
        
    };

    const deleteVoluntariados = async () => {
        
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`${endpoint}/voluntariados/${selectedId}`,{
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                toast.success('Voluntariado eliminado con Éxito');
                setTimeout(() => {
                    getAllVoluntariados();
                }, 500);
                
            } catch (error) {
                setError('Error deleting data');
                toast.error('Error al eliminar Voluntariado');
                console.error('Error deleting data:', error);
            }
        
    };

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchCedula(value);
        applyFilters(value, selectedArea, selectedNivel, selectedGenero,selectedCentro);
    };

    const handleAreaChange = (e) => {
        const value = e.target.value;
        setSelectedArea(value);
        applyFilters(searchCedula, value, selectedNivel, selectedGenero,selectedCentro);
    };

    const handleNivelChange = (e) => {
        const value = e.target.value;
        setSelectedNivel(value);
        applyFilters(searchCedula, selectedArea, value, selectedGenero,selectedCentro);
    };

    const handleGeneroChange = (e) => {
        const value = e.target.value;
        setSelectedGenero(value);
        applyFilters(searchCedula, selectedArea, selectedNivel, value,selectedCentro);
    };
    const handleCentroChange = (e) => {
        const value = e.target.value;
        setSelectedCentro(value);
        applyFilters(searchCedula, selectedArea, selectedNivel,selectedGenero, value);
    };

    const applyFilters = (cedulaValue, areaValue, nivelValue, generoValue,centroValue) => {
        let filtered = voluntariados;

        if (cedulaValue) {
            filtered = filtered.filter(voluntario =>
                voluntario.cedula_identidad.toLowerCase().includes(cedulaValue.toLowerCase())
            );
        }

        if (areaValue) {
            filtered = filtered.filter(voluntario =>
                voluntario.informacion_voluntariados.area_voluntariado_id === parseInt(areaValue)
            );
        }

        if (nivelValue) {
            filtered = filtered.filter(voluntario =>
                voluntario.nivel_instruccion_id === parseInt(nivelValue)
            );
        }

        if (generoValue) {
            filtered = filtered.filter(voluntario =>
                voluntario.genero_id === parseInt(generoValue)
            );
        }
        if (centroValue) {
            filtered = filtered.filter(voluntario =>
                voluntario.informacion_voluntariados.centro_id === parseInt(centroValue)
            );
        }

        setFilteredVoluntariados(filtered);
        setCurrentPage(1);
    };

    if (error) {
        return <div>{error}</div>;
    }
    const columns = [ "Cédula", "Nombres", "Apellidos","Acciones"];

    const renderItem = (dato) => (
        <tr key={dato.cedula_identidad}>
            <td className='col-cedula' >{dato.cedula_identidad}</td>
            <td className='col-nombre'>{dato.nombres}</td>
            <td className='col-apellido'>{dato.apellidos}</td>
            <td >
                <div className="col-acciones">

                    <Button
                        variant="btn btn-info" 
                        onClick={() => navigate(`/Voluntariados/${dato.cedula_identidad}`)}
                        className="me-2"
                    >
                        <i className="bi bi-eye"></i>
                    </Button>
                    {userRole && (userRole === 'admin' || userRole === 'superuser') && (

                        <Button
                        variant="btn btn-warning"
                        onClick={() => navigate(`/voluntariados/${dato.cedula_identidad}/edit`)}
                        className="me-2"
                        >
                        <i className="bi bi-pencil-fill"></i>
                        </Button>
                    )}
                    {userRole === 'admin' && (
                   
                    <Button
                    variant="btn btn-danger"
                    onClick={() => handleShowModal(dato.cedula_identidad)}
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
                <h1>Lista de Voluntarios</h1>
                <div className="d-flex align-items-center">
                    <Form.Control
                        type="text"
                        placeholder="Buscar por cédula"
                        value={searchCedula}
                        onChange={handleSearchChange}
                        className="me-2"
                    />
                    {userRole === 'admin' || userRole === 'superuser' ? (

                    <Button variant="btn custom" onClick={() => navigate('create')} className="btn-custom">
                    <i className="bi bi-person-plus-fill me-2  "></i> Nuevo
                    </Button>
                    ): null}
                </div>
            </div>
            <div className="d-flex mb-3">
                <Form.Select
                    value={selectedArea}
                    onChange={handleAreaChange}
                    className="me-2"
                    style={{ width: '150px' }}
                >
                    <option value="">Área</option>
                    {areaOptions.map(option => (
                        <option key={option.id} value={option.id}>{option.descripcion}</option>
                    ))}
                </Form.Select>

                <Form.Select
                    value={selectedNivel}
                    onChange={handleNivelChange}
                    className="me-2"
                    style={{ width: '150px' }}
                >
                    <option value="">Nivel de Instrucción</option>
                    {nivelOptions.map(option => (
                        <option key={option.id} value={option.id}>{option.descripcion}</option>
                    ))}
                </Form.Select>

                <Form.Select
                    value={selectedGenero}
                    onChange={handleGeneroChange}
                    className="me-2"
                    style={{ width: '150px' }}
                >
                    <option value="">Género</option>
                    {generoOptions.map(option => (
                        <option key={option.id} value={option.id}>{option.descripcion}</option>
                    ))}
                </Form.Select>
                <Form.Select
                    value={selectedCentro}
                    onChange={handleCentroChange}
                    className="me-2"
                    style={{ width: '150px' }}
                >
                    <option value="">Centro</option>
                    {centroOptions.map(option => (
                        <option key={option.id} value={option.id}>{option.descripcion}</option>
                    ))}
                </Form.Select>
            </div>
            <div className="cards-container"></div>
            <PaginationTable
                data={filteredVoluntariados}  // Datos filtrados
                itemsPerPage={itemsPerPage}
                columns={columns}
                renderItem={renderItem}
                currentPage={currentPage}  // Página actual
                onPageChange={setCurrentPage}  // Función para cambiar de página
                />

             {/* Modal  de eliminación */}
             <Modal show={showModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirmar eliminación</Modal.Title>
                </Modal.Header>
                <Modal.Body>¿Estás seguro de que deseas eliminar este Voluntariado?</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>
                        Cancelar
                    </Button>
                    <Button variant="danger" onClick={deleteVoluntariados}>
                        Eliminar
                    </Button>
                </Modal.Footer>
            </Modal>
            <ToastContainer />
        </div>
    );
};

export default ShowVoluntariados;
