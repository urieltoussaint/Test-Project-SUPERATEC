import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom'; // Importa useNavigate
import { Card, ListGroup, Button } from 'react-bootstrap';
import { useLoading } from '../../components/LoadingContext'; 

const endpoint = 'http://localhost:8000/api';

const ShowMoreDatos = ({ onReload }) => {
  const { id } = useParams();
  const [data, setData] = useState({});
  const navigate = useNavigate(); // Inicializa useNavigate
  const { setLoading } = useLoading(); // Usar el contexto de carga

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); // Inicia la animación de carga
      try {
        let relationsArray = ['nacionalidad', 'estado', 'statusSeleccion', 'grupoPrioritario', 'procedencia', 'genero', 'nivelInstruccion','comoEnteroSuperatec'];
        const relations = relationsArray.join(',');
        const token = localStorage.getItem('token');
        const response = await axios.get(`${endpoint}/datos/${id}?with=${relations}`,{
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
            <h1 className="mb-4 text-center">Detalles del Participante V-{data.cedula_identidad}</h1> {/* Centrado el título */}
            <ListGroup variant="flush">
              <ListGroup.Item>Cedula de identidad: {data.cedula_identidad}</ListGroup.Item>
              <ListGroup.Item>Nombres: {data.nombres}</ListGroup.Item>
              <ListGroup.Item>Apellidos {data.apellidos}</ListGroup.Item>
              <ListGroup.Item>Fecha de Nacimiento {data.fecha_nacimiento}</ListGroup.Item>
              <ListGroup.Item>Edad: {data.edad}</ListGroup.Item>
              <ListGroup.Item>Género: {data.genero?.descripcion}</ListGroup.Item>
              <ListGroup.Item>Nacionalidad: {data.nacionalidad?.descripcion}</ListGroup.Item>
              <ListGroup.Item>Estado: {data.estado?.descripcion}</ListGroup.Item>
              <ListGroup.Item>Municipio: {data.municipio}</ListGroup.Item>
              <ListGroup.Item>Dirección: {data.direccion}</ListGroup.Item>
              <ListGroup.Item>Status: {data.status_seleccion?.descripcion}</ListGroup.Item>
              <ListGroup.Item>Grupo Prioritario: {data.grupo_prioritario?.descripcion}</ListGroup.Item>
              <ListGroup.Item>Procedencia: {data.procedencia?.descripcion}</ListGroup.Item>
              <ListGroup.Item>Nivel de Instrucción: {data.nivel_instruccion?.descripcion}</ListGroup.Item>
              <ListGroup.Item>Email: {data.direccion_email}</ListGroup.Item>
              <ListGroup.Item>Tlf de Casa: {data.telefono_casa}</ListGroup.Item>
              <ListGroup.Item>Tlf Celular: {data.telefono_celular}</ListGroup.Item>
              <ListGroup.Item>¿Cómo se Enteró de Superatec?: {data.como_entero_superatec?.descripcion}</ListGroup.Item>



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

export default ShowMoreDatos;
