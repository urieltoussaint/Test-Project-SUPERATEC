import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, ListGroup, Button } from 'react-bootstrap';
import './ShowMorePagos.css';
import moment from 'moment';

const endpoint = 'http://localhost:8000/api';

const ShowMorePagos = ({ onReload }) => {
  const { id } = useParams();
  const [data, setData] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${endpoint}/reporte_pagos_detalle/${id}`);
        setData(response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [id]);

  return (
    <div className="container">
      <h1>Reporte de pago #{data.id} </h1>
      <div className="cards-container">
        <Card>
          <Card.Header>Datos Personales</Card.Header>
          <ListGroup variant="flush">
            <ListGroup.Item>Fecha: {moment(data.fecha).format('YYYY-MM-DD')}</ListGroup.Item>
            <ListGroup.Item>Cedula De Indentidad: {data.cedula_identidad}</ListGroup.Item>
            <ListGroup.Item>Tasa Bcv Usada: {data.tasa_bcv}</ListGroup.Item>
            <ListGroup.Item>Monto Cancelado: {data.monto_cancelado}$ Conversión {data.conversion_cancelado} BsF </ListGroup.Item>
            <ListGroup.Item>Monto Exonerado: {data.monto_exonerado}$ Conversión {data.conversion_exonerado} BsF </ListGroup.Item>
            <ListGroup.Item>Monto Restante: {data.monto_restante}$ Conversión {data.conversion_restante} BsF</ListGroup.Item>
            <ListGroup.Item>Tipo de Moneda: {data.tipo_moneda}</ListGroup.Item>
            <ListGroup.Item>Curso: {data.curso_descripcion}</ListGroup.Item>
            <ListGroup.Item>Comentarios: {data.comentario_cuota}</ListGroup.Item>
          </ListGroup>
        </Card>
      </div>
      <Button 
        variant="secondary" 
        onClick={() => {
          navigate('/pagos');
        }} 
        className="mt-4"
      >
        Volver
      </Button>
    </div>
  );
};

export default ShowMorePagos;
