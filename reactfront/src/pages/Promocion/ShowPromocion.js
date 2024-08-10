import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Table from 'react-bootstrap/Table';
import { useParams, useNavigate } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import './ShowPromocion.css'; // Asegúrate de tener este archivo CSS en tu proyecto
import moment from 'moment';

const endpoint = 'http://localhost:8000/api';

const ShowPromocion = () => {
    const [Promocion, setPromocion] = useState([]);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        getAllPromocion();
    }, []);

    const getAllPromocion = async () => {
        try {
            const response = await axios.get(`${endpoint}/promocion`);
            console.log('Datos obtenidos:', response.data);
            const sortedPromocion = response.data.data.sort((a, b) => b.id - a.id);
            setPromocion(sortedPromocion); // Asegurarse de que `response.data.data` contenga los datos correctamente.
        } catch (error) {
            setError('Error fetching data');
            console.error('Error fetching data:', error);
        }
    };

    const deletePromocion = async (id) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar esta Promocion?')) {
            try {
                await axios.delete(`${endpoint}/promocion/${id}`);
                getAllPromocion();
            } catch (error) {
                setError('Error deleting data');
                console.error('Error deleting data:', error);
            }
        }
    };

    if (error) {
        return <div>{error}</div>;
    }
    
    return (
        <div className="container mt-5">
            <meta name="csrf-token" content="{{ csrf_token() }}"></meta>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h1>Lista de Promociones</h1>
                <Button
                    variant="success"
                    onClick={() => navigate('create')}
                    className="mt-3"
                >
                    Agregar Nueva Promoción
                </Button>
            </div>
            <div className="cards-container"></div>
            <Table striped bordered hover className="rounded-table">
                <thead>
                    <tr>
                        <th className="col-cedula">id</th>
                        <th className="col-nombres">Fecha de Resgistro</th>
                        <th className="col-apellidos">Comentario</th>
                        <th className="col-acciones">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {Promocion.map((dato) => (
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
                                        Editar
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
