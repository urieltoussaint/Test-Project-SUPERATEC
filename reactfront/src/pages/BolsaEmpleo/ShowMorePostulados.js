import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom'; // Importa useNavigate
import { Card, ListGroup, Button } from 'react-bootstrap';
import { useLoading } from '../../components/LoadingContext'; 

const endpoint = 'http://localhost:8000/api';

const ShowMorePostulados = ({ onReload }) => {
  const { id } = useParams();
  const [data, setData] = useState({});
  const navigate = useNavigate(); // Inicializa useNavigate
  const { setLoading } = useLoading(); // Usar el contexto de carga

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); // Inicia la animación de carga
      try {
        let relationsArray = ['datosIdentificacion','EstadoCivil','Discapacidad','Disponibilidad','ExpLaboral','QuienVive','RolHogar','HorarioMañana','HorarioTarde'];
        const relations = relationsArray.join(',');
        const token = localStorage.getItem('token');
        const response = await axios.get(`${endpoint}/participantes-bolsa/${id}?with=${relations}`,{
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
            <h1 className="mb-4 text-center">Detalles del Postulado V-{data?.datos_identificacion?.cedula_identidad}</h1> {/* Centrado el título */}
            <ListGroup variant="flush">
              <ListGroup.Item>Cedula de identidad: {data?.datos_identificacion?.cedula_identidad}</ListGroup.Item>
              <ListGroup.Item>Nombres: {data?.datos_identificacion?.nombres}</ListGroup.Item>
              <ListGroup.Item>Apellidos {data?.datos_identificacion?.apellidos}</ListGroup.Item>
              <ListGroup.Item>Estado Civil {data?.estado_civil?.descripcion}</ListGroup.Item>
              <ListGroup.Item>Discapacidad: {data?.discapacidad?.descripcion}</ListGroup.Item>
              <ListGroup.Item>Disponibilidad: {data?.disponibilidad?.descripcion}</ListGroup.Item>
              <ListGroup.Item>Entorno Familiar: {data?.entorno_familiar}</ListGroup.Item>
              <ListGroup.Item>Fortalezas: {data.fortalezas}</ListGroup.Item>
              <ListGroup.Item>Aspectos Mejorables: {data.aspectos_mejorables?.descripcion}</ListGroup.Item>
              <ListGroup.Item>¿Con quien vive?: {data.quien_vive?.descripcion}</ListGroup.Item>
              <ListGroup.Item>Rol de hogar: {data?.rol_hogar?.descripcion}</ListGroup.Item>
              <ListGroup.Item>Telefono Casa: {data.tlf_casa}</ListGroup.Item>
              <ListGroup.Item>Telefono Celular: {data.tlf_celular}</ListGroup.Item>
              <ListGroup.Item>Email: {data.email}</ListGroup.Item>
              <ListGroup.Item>Sector: {data.sector}</ListGroup.Item>
              <ListGroup.Item>Horario de mañana: {data?.horario_mañana?.descripcion}</ListGroup.Item>
              <ListGroup.Item>Horario de tarde: {data.horario_tarde?.descripcion}</ListGroup.Item>
            </ListGroup>
  
            <div className="text-center mt-4">
            <Button
                variant="secondary"
                onClick={() => navigate(-1)}  // Esto navega a la última página
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

export default ShowMorePostulados;
