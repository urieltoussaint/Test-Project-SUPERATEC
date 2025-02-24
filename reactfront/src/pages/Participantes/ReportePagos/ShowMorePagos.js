import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, ListGroup, Button } from 'react-bootstrap';
import './ShowMorePagos.css';
import moment from 'moment';
import { useLoading } from '../../../components/LoadingContext';


const endpoint = 'http://localhost:8000/api';

const ShowMorePagos = ({ onReload }) => {
  const { setLoading } = useLoading();
  const { id } = useParams();
  const [data, setData] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    

    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await axios.get(`${endpoint}/reporte_pagos_detalle/${id}`,{
          headers: {
              Authorization: `Bearer ${token}`,
          },
      });
        setData(response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }    setLoading(false);

    };


    fetchData();
  }, [id]);

  return (
    <div className="container my-5"> {/* Añadido margen superior */}
      <div className="row justify-content-center"> {/* Centra el contenido */}
        <div className="col-lg-9 col-md-8"> {/* Ajusta el tamaño de la tarjeta */}
          <Card className="p-4 shadow"> {/* Añadido padding y sombra */}
            <h1 className="mb-4 text-center">Detalles de Pago {data.cod}</h1> {/* Centrado el título */}
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
          <div className="text-center mt-4">
            <Button
                variant="secondary"
                onClick={() => navigate(-1)}  
                >
                Volver
                </Button>

            </div>
        </Card>
      </div>
      
    </div>
    </div>
  );
};

export default ShowMorePagos;
