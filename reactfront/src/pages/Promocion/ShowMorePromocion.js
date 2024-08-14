import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom'; // Importa useNavigate
import { Card, ListGroup, Button } from 'react-bootstrap';
import './ShowMorePromocion.css'; // Importa la hoja de estilo
import moment from 'moment';
import { useLoading } from '../../components/LoadingContext';

const endpoint = 'http://localhost:8000/api';

const ShowMorePromocion = ({  }) => {
  const { id } = useParams();
  const [data, setData] = useState({});
  const { setLoading } = useLoading();
  const navigate = useNavigate(); // Inicializa useNavigate

  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      try {
        let relationsArray = [
           'Centro', 'statusSeleccion', 'Cohorte', 'Periodo', 'Procedencia','Mencion'
        ];
        const relations = relationsArray.join(',');
        const response = await axios.get(`${endpoint}/promocion/${id}?with=${relations}`);
        setData(response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }setLoading(false);
    };

    fetchData();
  }, [id]);

  return (
    <div className="container">
      <h1>Promocion #{data.id}</h1>
      <div className="cards-container">
        <Card>
          <Card.Header>Datos de Promoción</Card.Header>
          <ListGroup variant="flush">
            <ListGroup.Item>Fecha de Registro: {moment(data.fecha_registro).format('YYYY-MM-DD')}</ListGroup.Item>
            <ListGroup.Item>Centro: {data.centro?.descripcion}</ListGroup.Item>
            <ListGroup.Item>Cohorte: {data.cohorte?.descripcion}</ListGroup.Item>
            <ListGroup.Item>Periodo: {data.periodo?.descripcion}</ListGroup.Item>
            <ListGroup.Item>Fecha de Promoción: {data.fecha_promocion}</ListGroup.Item>
            <ListGroup.Item>Procedencia: {data.procedencia?.descripcion}</ListGroup.Item>
            <ListGroup.Item>Mención: {data.mencion?.descripcion}</ListGroup.Item>
            <ListGroup.Item>Estudiantes Asistentes: {data.estudiantes_asistentes}</ListGroup.Item>
            <ListGroup.Item>Estudiantes Interesados: {data.estudiantes_interesados}</ListGroup.Item>
            <ListGroup.Item>Comentarios: {data.comentarios}</ListGroup.Item>
          </ListGroup>
        </Card>
      </div>
      <Button 
        variant="secondary" 
        onClick={() => {
          navigate('/promocion');
        }} 
        className="mt-4"
      >
        Volver
      </Button>
    </div>
  );
};

export default ShowMorePromocion;
