import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Table from 'react-bootstrap/Table';
import { useNavigate } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { useLoading } from '../../components/LoadingContext';
import './ShowDatos.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PaginationTable from '../../components/PaginationTable';  // Importa el componente de paginación

const endpoint = 'http://localhost:8000/api';

const ShowDatos = () => {
    const [datos, setDatos] = useState([]);
    const [filteredDatos, setFilteredDatos] = useState([]);
    const [searchCedula, setSearchCedula] = useState('');
    const [nivelInstruccionOptions, setNivelInstruccionOptions] = useState([]);
    const [generoOptions, setGeneroOptions] = useState([]);
    const [centroOptions, setCentroOptions] = useState([]);
    const [areaOptions, setAreaOptions] = useState([]);
    const [periodoOptions, setPeriodoOptions] = useState([]);
    const [estadoOptions, setEstadoOptions] = useState([]);
    const [modalidadOptions, setModalidadOptions] = useState([]);
    const [tipoProgramaOptions, setTipoProgramaOptions] = useState([]);
    const [unidadOptions, setUnidadOptions] = useState([]);
    const [cohorteOptions, setCohorteOptions] = useState([]);
    const [filters, setFilters] = useState({
        nivel_instruccion_id: '',
        genero_id: '',
        centro_id: '',
        area_id: '',
        periodo_id: '',
        estado_id: '',
        modalidad_id: '',
        tipo_programa_id: '',
        unidad_id: '',
        cohorte_id: '',
    });
    const itemsPerPage = 4; // Número de elementos por página
    const { setLoading } = useLoading();
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // Obtener el rol del usuario desde localStorage
    const userRole = localStorage.getItem('role'); // Puede ser 'admin', 'superuser', 'invitado', etc.
    
    useEffect(() => {
        console.log('El rol del usuario es:', userRole); 
        setLoading(true);
        Promise.all([getAllDatos(), fetchFilterOptions()]).finally(() => {
            setLoading(false);
        });
    }, []);

    const getAllDatos = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${endpoint}/datos?with=statusSeleccion,informacionInscripcion,NivelInstruccion,genero,estado`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            console.log('Datos obtenidos:', response.data);
            setDatos(response.data.data);
            setFilteredDatos(response.data.data);
        } catch (error) {
            if (error.response && error.response.status === 401) {
                setError('No estás autenticado. Por favor, inicia sesión.');
                navigate('/'); // Redirige al login si no está autenticado
            } else {
                setError('Error fetching data');
                console.error('Error fetching data:', error);
            }
        }
    };

    const fetchFilterOptions = async () => {
        try {
            const token = localStorage.getItem('token');
            const [nivelRes, generoRes, centroRes, areaRes, periodoRes, estadoRes, modalidadRes, tipoProgramaRes, unidadRes, cohorteRes] = await Promise.all([
                axios.get(`${endpoint}/nivel_instruccion`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${endpoint}/genero`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${endpoint}/centro`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${endpoint}/area`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${endpoint}/periodo`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${endpoint}/estado`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${endpoint}/modalidad`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${endpoint}/tipo_programa`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${endpoint}/unidad`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${endpoint}/cohorte`, { headers: { Authorization: `Bearer ${token}` } }),
            ]);
            setNivelInstruccionOptions(nivelRes.data.data);
            setGeneroOptions(generoRes.data.data);
            setCentroOptions(centroRes.data.data);
            setAreaOptions(areaRes.data.data);
            setPeriodoOptions(periodoRes.data.data);
            setEstadoOptions(estadoRes.data.data);
            setModalidadOptions(modalidadRes.data.data);
            setTipoProgramaOptions(tipoProgramaRes.data.data);
            setUnidadOptions(unidadRes.data.data);
            setCohorteOptions(cohorteRes.data.data);
        } catch (error) {
            setError('Error fetching filter options');
            console.error('Error fetching filter options:', error);
        }
    };

    const deleteDatos = async (id) => {
        const token = localStorage.getItem('token');
        if (window.confirm('¿Estás seguro de que deseas eliminar este Participante y todos los datos relacionados a él?')) {
            try {
                await axios.delete(`${endpoint}/datos/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                toast.success('Participante eliminado con Éxito');             
                getAllDatos();
            } catch (error) {
                setError('Error deleting data');
                console.error('Error deleting data:', error);
                toast.error('Error al eliminar Participante');
            }
        }
    };

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchCedula(value);
        applyFilters({ ...filters, searchCedula: value });
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        const newFilters = { ...filters, [name]: value };
        setFilters(newFilters);
        applyFilters(newFilters);
    };

    const applyFilters = (filters) => {
        let filtered = datos;

        if (filters.searchCedula) {
            filtered = filtered.filter(dato =>
                dato.cedula_identidad.toLowerCase().includes(filters.searchCedula.toLowerCase())
            );
        }

        if (filters.nivel_instruccion_id) {
            filtered = filtered.filter(dato =>
                dato.nivel_instruccion_id === parseInt(filters.nivel_instruccion_id)
            );
        }

        if (filters.genero_id) {
            filtered = filtered.filter(dato =>
                dato.genero_id === parseInt(filters.genero_id)
            );
        }

        if (filters.centro_id) {
            filtered = filtered.filter(dato =>
                dato.informacion_inscripcion?.centro_id === parseInt(filters.centro_id)
            );
        }

        if (filters.area_id) {
            filtered = filtered.filter(dato =>
                dato.informacion_inscripcion?.area_id === parseInt(filters.area_id)
            );
        }

        if (filters.periodo_id) {
            filtered = filtered.filter(dato =>
                dato.informacion_inscripcion?.periodo_id === parseInt(filters.periodo_id)
            );
        }
        if (filters.estado_id) {
            filtered = filtered.filter(dato =>
                dato.estado_id === parseInt(filters.estado_id)
            );
        }
        if (filters.modalidad_id) {
            filtered = filtered.filter(dato =>
                dato.informacion_inscripcion?.modalidad_id === parseInt(filters.modalidad_id)
            );
        }
        if (filters.tipo_programa_id) {
            filtered = filtered.filter(dato =>
                dato.informacion_inscripcion?.tipo_programa_id === parseInt(filters.tipo_programa_id)
            );
        }
        if (filters.unidad_id) {
            filtered = filtered.filter(dato =>
                dato.informacion_inscripcion?.unidad_id === parseInt(filters.unidad_id)
            );
        }
        if (filters.cohorte_id) {
            filtered = filtered.filter(dato =>
                dato.informacion_inscripcion?.cohorte_id === parseInt(filters.cohorte_id)
            );
        }

        setFilteredDatos(filtered);
    };

    if (error) {
        return <div>{error}</div>;
    }

    const columns = ["Cédula", "Nombres", "Apellidos", "Acciones"];

    const renderItem = (dato) => (
        <tr key={dato.cedula_identidad}>
            <td>{dato.cedula_identidad}</td>
            <td>{dato.nombres}</td>
            <td>{dato.apellidos}</td>
            <td>
                <div className="d-flex justify-content-around">
                    <Button 
                        variant="info" 
                        onClick={() => navigate(`/datos/${dato.cedula_identidad}`)}
                    >
                        Ver más
                    </Button>
                    
                    {userRole === 'admin' || userRole === 'superuser' ? (
                        <>
                            <Button 
                                variant="warning" 
                                onClick={() => navigate(`/datos/${dato.cedula_identidad}/edit`)}
                            >
                                Actualizar
                            </Button>
    
                            {userRole === 'admin' && (
                                <Button 
                                    variant="danger" 
                                    onClick={() => deleteDatos(dato.cedula_identidad)}
                                >
                                    Eliminar
                                </Button>
                            )}
                        </>
                    ) : null}
                </div>
            </td>
        </tr>
    );
    

    return (
        <div className="container mt-5">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h1>Lista de Participantes</h1>
                <div className="d-flex align-items-center">
                <Form.Control
                        type="text"
                        placeholder="Buscar por Cedula"
                        value={searchCedula}
                        onChange={handleSearchChange}
                        className="me-2"
                    />
                {userRole === 'admin' || userRole === 'superuser' ? (
                    <Button 
                    variant="success" 
                    onClick={() => navigate('/formulario/create')}
                    className="ms-2"
                >
                    Agregar Nuevo Participante
                </Button>
                
                
                ):(
                    <></>
                )}
            </div>
            </div>

            {/* Filtros */}
            <div className="d-flex mb-3">
            <Form.Select
                    name="nivel_instruccion_id"
                    value={filters.nivel_instruccion_id}
                    onChange={handleFilterChange}
                    className="me-2"
                >
                    <option value="">Nivel de Instrucción</option>
                    {nivelInstruccionOptions.map(option => (
                        <option key={option.id} value={option.id}>{option.descripcion}</option>
                    ))}
                </Form.Select>

                <Form.Select
                    name="genero_id"
                    value={filters.genero_id}
                    onChange={handleFilterChange}
                    className="me-2"
                >
                    <option value="">Género</option>
                    {generoOptions.map(option => (
                        <option key={option.id} value={option.id}>{option.descripcion}</option>
                    ))}
                </Form.Select>
                <Form.Select
                    name="estado_id"
                    value={filters.estado_id}
                    onChange={handleFilterChange}
                    className="me-2"
                >
                    <option value="">Estado</option>
                    {estadoOptions.map(option => (
                        <option key={option.id} value={option.id}>{option.descripcion}</option>
                    ))}
                </Form.Select>

                <Form.Select
                    name="centro_id"
                    value={filters.centro_id}
                    onChange={handleFilterChange}
                    className="me-2"
                >
                    <option value="">Centro</option>
                    {centroOptions.map(option => (
                        <option key={option.id} value={option.id}>{option.descripcion}</option>
                    ))}
                </Form.Select>

                <Form.Select
                    name="area_id"
                    value={filters.area_id}
                    onChange={handleFilterChange}
                    className="me-2"
                >
                    <option value="">Área</option>
                    {areaOptions.map(option => (
                        <option key={option.id} value={option.id}>{option.descripcion}</option>
                    ))}
                </Form.Select>

                <Form.Select
                    name="periodo_id"
                    value={filters.periodo_id}
                    onChange={handleFilterChange}
                    className="me-2"
                >
                    <option value="">Periodo</option>
                    {periodoOptions.map(option => (
                        <option key={option.id} value={option.id}>{option.descripcion}</option>
                    ))}
                </Form.Select>
            </div>
            <div className="d-flex mb-3"> 
                <Form.Select
                    name="modalidad_id"
                    value={filters.modalidad_id}
                    onChange={handleFilterChange}
                    className="me-2"
                >
                    <option value="">Modalidad</option>
                    {modalidadOptions.map(option => (
                        <option key={option.id} value={option.id}>{option.descripcion}</option>
                    ))}
                </Form.Select>
                <Form.Select
                    name="tipo_programa_id"
                    value={filters.tipo_programa_id}
                    onChange={handleFilterChange}
                    className="me-2"
                >
                    <option value="">Tipo de Programa</option>
                    {tipoProgramaOptions.map(option => (
                        <option key={option.id} value={option.id}>{option.descripcion}</option>
                    ))}
                </Form.Select> 
                <Form.Select
                    name="unidad_id"
                    value={filters.unidad_id}
                    onChange={handleFilterChange}
                    className="me-2"
                >
                    <option value="">Unidad</option>
                    {unidadOptions.map(option => (
                        <option key={option.id} value={option.id}>{option.descripcion}</option>
                    ))}
                </Form.Select>
                <Form.Select
                    name="cohorte_id"
                    value={filters.cohorte_id}
                    onChange={handleFilterChange}
                    className="me-2"
                >
                    <option value="">Cohorte</option>
                    {cohorteOptions.map(option => (
                        <option key={option.id} value={option.id}>{option.descripcion}</option>
                    ))}
                </Form.Select>
            </div>

            {/* Tabla paginada */}
            <PaginationTable
                data={filteredDatos}
                itemsPerPage={itemsPerPage}
                columns={columns}
                renderItem={renderItem}
            />

            <ToastContainer />
        </div>
    );
};

export default ShowDatos;
