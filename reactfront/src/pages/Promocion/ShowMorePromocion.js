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
        const token = localStorage.getItem('token');
        const response = await axios.get(`${endpoint}/promocion/${id}?with=${relations}`,{
          headers: {
              Authorization: `Bearer ${token}`,
          },
      });
        setData(response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }setLoading(false);
    };

    fetchData();
  }, [id]);

  return (
    <div className="container my-5"> {/* Añadido margen superior */}
      <div className="row justify-content-center"> {/* Centra el contenido */}
        <div className="col-lg-9 col-md-8"> {/* Ajusta el tamaño de la tarjeta */}
          <Card className="p-4 shadow"> {/* Añadido padding y sombra */}
            <h1 className="mb-4 text-center">Detalles de Promoción {data.cod}</h1> {/* Centrado el título */}
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

export default ShowMorePromocion;
