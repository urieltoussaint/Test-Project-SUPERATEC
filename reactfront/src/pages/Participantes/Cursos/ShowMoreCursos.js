import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom'; // Importa useNavigate
import { Card, ListGroup, Button } from 'react-bootstrap';
import { useLoading } from '../../../components/LoadingContext';

const endpoint = 'http://localhost:8000/api';

const ShowMoreCursos = ({ onReload }) => {
  const { id } = useParams();
  const [data, setData] = useState({});
  const navigate = useNavigate(); // Inicializa useNavigate
  const { setLoading } = useLoading(); // Usar el contexto de carga

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); // Inicia la animación de carga
      try {
        let relationsArray = [
          'area','unidad','modalidad','tipo_programa','nivel'
        ];
        const relations = relationsArray.join(',');
        const token = localStorage.getItem('token');
        const response = await axios.get(`${endpoint}/cursos/${id}?with=${relations}`,{
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
            <h1 className="mb-4 text-center">Detalles de Curso {data.cod}</h1> {/* Centrado el título */}
            <ListGroup variant="flush">
              <ListGroup.Item>COD: {data.cod}</ListGroup.Item>
              <ListGroup.Item>Nombre del Curso: {data.descripcion}</ListGroup.Item>
              <ListGroup.Item>Cantidad de Horas: {data.cantidad_horas}</ListGroup.Item>
              <ListGroup.Item>Área: {data.area?.descripcion}</ListGroup.Item>
              <ListGroup.Item>Nivel: {data.nivel?.descripcion}</ListGroup.Item>
              <ListGroup.Item>Modalidad: {data.modalidad?.descripcion}</ListGroup.Item>
              <ListGroup.Item>Unidad: {data.unidad?.descripcion}</ListGroup.Item>
              <ListGroup.Item>Tipo de Programa: {data.tipo_programa?.descripcion}</ListGroup.Item>
              <ListGroup.Item>Costo: {data.costo}</ListGroup.Item>
              <ListGroup.Item>Cuotas: {data.cuotas}</ListGroup.Item>
              <ListGroup.Item>Fecha de Inicio: {data.fecha_inicio}</ListGroup.Item>
            </ListGroup>
  
            <div className="text-center mt-4">
              <Button
                variant="secondary"
                onClick={() => navigate('/cursos')}
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

export default ShowMoreCursos;
