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
    const { setLoading } = useLoading();
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        setLoading(true);
        Promise.all([getAllDatos(), fetchFilterOptions()]).finally(() => {
            setLoading(false);
        });
    }, []);

    const getAllDatos = async () => {
        try {
            const response = await axios.get(`${endpoint}/datos?with=statusSeleccion,informacionInscripcion,NivelInstruccion,genero,estado`);
            console.log('Datos obtenidos:', response.data);
            setDatos(response.data.data);
            setFilteredDatos(response.data.data);
        } catch (error) {
            setError('Error fetching data');
            console.error('Error fetching data:', error);
        }
    };

    const fetchFilterOptions = async () => {
        try {
            const [nivelRes, generoRes, centroRes, areaRes, periodoRes, estadoRes, modalidadRes, tipoProgramaRes, unidadRes, cohorteRes] = await Promise.all([
                axios.get(`${endpoint}/nivel_instruccion`),
                axios.get(`${endpoint}/genero`),
                axios.get(`${endpoint}/centro`),
                axios.get(`${endpoint}/area`),
                axios.get(`${endpoint}/periodo`),
                axios.get(`${endpoint}/estado`),
                axios.get(`${endpoint}/modalidad`),
                axios.get(`${endpoint}/tipo_programa`),
                axios.get(`${endpoint}/unidad`),
                axios.get(`${endpoint}/cohorte`),
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
        if (window.confirm('¿Estás seguro de que deseas eliminar este Participante y todos los datos relacionados a él?')) {
            try {
                await axios.delete(`${endpoint}/datos/${id}`);
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

    return (
        <div className="container mt-5">
            <meta name="csrf-token" content="{{ csrf_token() }}"></meta>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h1>Lista de Participantes</h1>
                <div className="d-flex align-items-center">
                    <Form.Control
                        type="text"
                        placeholder="Buscar por cédula"
                        value={searchCedula}
                        onChange={handleSearchChange}
                        className="me-2"
                    />
                    <Button
                        variant="success"
                        onClick={() => navigate('/formulario/create')}
                        className="mt-3"
                    >
                        Agregar Nuevo Participante
                    </Button>
                </div>
            </div>

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

            <Table striped bordered hover className="rounded-table">
                <thead>
                    <tr>
                        <th className="col-cedula">Cédula</th>
                        <th className="col-nombres">Nombres</th>
                        <th className="col-apellidos">Apellidos</th>
                        <th className="col-acciones">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredDatos.map((dato) => (
                        <tr key={dato.cedula_identidad}>
                            <td className="col-cedula">{dato.cedula_identidad}</td>
                            <td className="col-nombres">{dato.nombres}</td>
                            <td className="col-apellidos">{dato.apellidos}</td>
                            <td className="col-acciones">
                                <div className="d-flex justify-content-around">
                                    <Button
                                        variant="info"
                                        onClick={() => navigate(`/datos/${dato.cedula_identidad}`)}
                                        className="me-2"
                                    >
                                        Ver más
                                    </Button>
                                    <Button
                                        variant="warning"
                                        onClick={() => navigate(`/datos/${dato.cedula_identidad}/edit`)}
                                        className="me-2"
                                    >
                                        Actualizar
                                    </Button>
                                    <Button
                                        variant="danger"
                                        onClick={() => deleteDatos(dato.cedula_identidad)}
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

export default ShowDatos;
