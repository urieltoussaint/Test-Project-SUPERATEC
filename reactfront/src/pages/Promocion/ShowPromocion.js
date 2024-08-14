import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Table from 'react-bootstrap/Table';
import { useNavigate } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import './ShowPromocion.css'; 
import moment from 'moment';
import { useLoading } from '../../components/LoadingContext';

const endpoint = 'http://localhost:8000/api';

const ShowPromocion = () => {
    const [promociones, setPromociones] = useState([]);
    const [filteredPromociones, setFilteredPromociones] = useState([]);
    const [searchComentario, setSearchComentario] = useState('');
    const [centroOptions, setCentroOptions] = useState([]);
    const [periodoOptions, setPeriodoOptions] = useState([]);
    const [cohorteOptions, setCohorteOptions] = useState([]);
    const [mencionOptions, setMencionOptions] = useState([]);
    const [filters, setFilters] = useState({
        centro_id: '',
        periodo_id: '',
        cohorte_id: '',
        mencion_id: '',
    });
    const { setLoading } = useLoading();
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        setLoading(true);
        Promise.all([getAllPromociones(), fetchFilterOptions()]).finally(() => {
            setLoading(false);
        });
    }, []);

    const getAllPromociones = async () => {
        try {
            const response = await axios.get(`${endpoint}/promocion`);
            const sortedPromociones = response.data.data.sort((a, b) => b.id - a.id);
            setPromociones(sortedPromociones);
            setFilteredPromociones(sortedPromociones);
        } catch (error) {
            setError('Error fetching data');
            console.error('Error fetching data:', error);
        }
    };

    const fetchFilterOptions = async () => {
        try {
            const [centroRes, periodoRes, cohorteRes, mencionRes] = await Promise.all([
                axios.get(`${endpoint}/centro`),
                axios.get(`${endpoint}/periodo`),
                axios.get(`${endpoint}/cohorte`),
                axios.get(`${endpoint}/mencion`),
            ]);
            setCentroOptions(centroRes.data.data);
            setPeriodoOptions(periodoRes.data.data);
            setCohorteOptions(cohorteRes.data.data);
            setMencionOptions(mencionRes.data.data);
        } catch (error) {
            setError('Error fetching filter options');
            console.error('Error fetching filter options:', error);
        }
    };

    const deletePromocion = async (id) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar esta Promoción?')) {
            try {
                await axios.delete(`${endpoint}/promocion/${id}`);
                getAllPromociones();
            } catch (error) {
                setError('Error deleting data');
                console.error('Error deleting data:', error);
            }
        }
    };

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchComentario(value);
        applyFilters({ ...filters, searchComentario: value });
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        const newFilters = { ...filters, [name]: value };
        setFilters(newFilters);
        applyFilters(newFilters);
    };

    const applyFilters = (filters) => {
        let filtered = promociones;

        if (filters.searchComentario) {
            filtered = filtered.filter(promocion =>
                promocion.comentarios.toLowerCase().includes(filters.searchComentario.toLowerCase())
            );
        }

        if (filters.centro_id) {
            filtered = filtered.filter(promocion =>
                promocion.centro_id === parseInt(filters.centro_id)
            );
        }

        if (filters.periodo_id) {
            filtered = filtered.filter(promocion =>
                promocion.periodo_id === parseInt(filters.periodo_id)
            );
        }

        if (filters.cohorte_id) {
            filtered = filtered.filter(promocion =>
                promocion.cohorte_id === parseInt(filters.cohorte_id)
            );
        }

        if (filters.mencion_id) {
            filtered = filtered.filter(promocion =>
                promocion.mencion_id === parseInt(filters.mencion_id)
            );
        }

        setFilteredPromociones(filtered);
    };

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div className="container mt-5">
            <meta name="csrf-token" content="{{ csrf_token() }}"></meta>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h1>Lista de Promociones</h1>
                <div className="d-flex align-items-center">
                    <Form.Control
                        type="text"
                        placeholder="Buscar por comentario"
                        value={searchComentario}
                        onChange={handleSearchChange}
                        className="me-2"
                    />
                    <Button
                        variant="success"
                        onClick={() => navigate('create')}
                        className="mt-3"
                    >
                        Agregar Nueva Promoción
                    </Button>
                </div>
            </div>

            <div className="d-flex mb-3">
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

                <Form.Select
                    name="mencion_id"
                    value={filters.mencion_id}
                    onChange={handleFilterChange}
                    className="me-2"
                >
                    <option value="">Mención</option>
                    {mencionOptions.map(option => (
                        <option key={option.id} value={option.id}>{option.descripcion}</option>
                    ))}
                </Form.Select>
            </div>

            <Table striped bordered hover className="rounded-table">
                <thead>
                    <tr>
                        <th className="col-cedula">ID</th>
                        <th className="col-nombres">Fecha de Registro</th>
                        <th className="col-apellidos">Comentario</th>
                        <th className="col-acciones">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredPromociones.map((dato) => (
                        <tr key={dato.id}>
                            <td className="col-cedula">{dato.id}</td>
                            <td className="col-nombres">{moment(dato.fecha_registro).format('YYYY-MM-DD')}</td>
                            <td className="col-apellidos">{dato.comentarios}</td>
                            <td className="col-acciones">
                                <div className="d-flex justify-content-around">
                                    <Button
                                        variant="info"
                                        onClick={() => navigate(`/promocion/${dato.id}`)}
                                        className="me-2"
                                    >
                                        Ver más
                                    </Button>
                                    <Button
                                        variant="warning"
                                        onClick={() => navigate(`/promocion/${dato.id}/edit`)}
                                        className="me-2"
                                    >
                                        Actualizar
                                    </Button>
                                    <Button
                                        variant="danger"
                                        onClick={() => deletePromocion(dato.id)}
                                    >
                                        Eliminar
                                    </Button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </div>
    );
};

export default ShowPromocion;
