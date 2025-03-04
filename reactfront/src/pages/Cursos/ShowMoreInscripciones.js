import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom'; // Importa useNavigate
import { Card, ListGroup, Button } from 'react-bootstrap';
import { useLoading } from '../../components/LoadingContext';

const endpoint = 'http://localhost:8000/api';

const ShowMoreInscripciones = ({ onReload }) => {
  const { id } = useParams();
  const [data, setData] = useState({});
  const navigate = useNavigate(); // Inicializa useNavigate
  const { setLoading } = useLoading(); // Usar el contexto de carga

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); // Inicia la animación de carga
      try {
       
        const token = localStorage.getItem('token');
        const response = await axios.get(`${endpoint}/cursos_inscripcion/${id}`,{
          headers: {
              Authorization: `Bearer ${token}`,
          },
        });
        setData(response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false); // Detiene la animación de carga
      }
    };

    fetchData();
  }, [id, setLoading]);

  return (
    <div className="container my-5"> {/* Añadido margen superior */}
      <div className="row justify-content-center"> {/* Centra el contenido */}
        <div className="col-lg-9 col-md-8"> {/* Ajusta el tamaño de la tarjeta */}
          <Card className="p-4 shadow"> {/* Añadido padding y sombra */}
            <h1 className="mb-4 text-center">Detalles de Inscripción {data.cod}</h1> {/* Centrado el título */}
            <ListGroup variant="flush">
              <ListGroup.Item>Cédula de Identidad: {data.datos_identificacion?.cedula_identidad}</ListGroup.Item>
              <ListGroup.Item>Fecha de Inscripción: {data.fecha_inscripcion}</ListGroup.Item>
              <ListGroup.Item>¿Realiza Aporte?: {data.realiza_aporte ? 'Sí' : 'No'}</ListGroup.Item>
              <ListGroup.Item>¿Es patrocinado?: {data.es_patrocinado ? 'Sí' : 'No'}</ListGroup.Item>
              <ListGroup.Item>Patrocinante 1: {data?.patrocinante1?.nombre_patrocinante || 'No asignado'}</ListGroup.Item>
              <ListGroup.Item>Patrocinante 2: {data?.patrocinante2?.nombre_patrocinante || 'No asignado'}</ListGroup.Item>
              <ListGroup.Item>Patrocinante 3: {data?.patrocinante3?.nombre_patrocinante || 'No asignado'}</ListGroup.Item>
              <ListGroup.Item>COD: {data?.curso?.cod}</ListGroup.Item>
              <ListGroup.Item>Nombre del Curso: {data?.curso?.descripcion}</ListGroup.Item>
              <ListGroup.Item>Cohorte: {data?.cohorte?.descripcion}</ListGroup.Item>
              <ListGroup.Item>Periodo: {data?.periodo?.descripcion}</ListGroup.Item>
              <ListGroup.Item>Centro: {data?.centro?.descripcion}</ListGroup.Item>
              <ListGroup.Item>Observaciones: {data?.observaciones}</ListGroup.Item>
              
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

export default ShowMoreInscripciones;
