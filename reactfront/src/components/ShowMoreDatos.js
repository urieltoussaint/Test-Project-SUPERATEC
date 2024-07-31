import React, { useState, useEffect } from 'react';
import axios from '../axiosConfig';
import { useParams } from 'react-router-dom';
import { Card, ListGroup } from 'react-bootstrap';

const endpoint = 'http://localhost:8000/api';

const ShowMoreDatos = () => {
  const { id } = useParams();
  const [data, setData] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${endpoint}/datos/${id}`);
        setData(response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [id]);

  return (
    <div>
      <h1>Datos de Registro de {data.nombres} {data.apellidos}</h1>
      <Card>
        <Card.Header>Datos Personales</Card.Header>
        <ListGroup variant="flush">
          <ListGroup.Item>Cédula de Identidad: {data.cedula_identidad}</ListGroup.Item>
          <ListGroup.Item>Nombres: {data.nombres}</ListGroup.Item>
          <ListGroup.Item>Apellidos: {data.apellidos}</ListGroup.Item>
          <ListGroup.Item>Fecha de Nacimiento: {data.fecha_nacimiento}</ListGroup.Item>
          <ListGroup.Item>Edad: {data.edad}</ListGroup.Item>
          <ListGroup.Item>Dirección: {data.direccion}</ListGroup.Item>
          <ListGroup.Item>Email: {data.direccion_email}</ListGroup.Item>
          <ListGroup.Item>Teléfono de Casa: {data.telefono_casa}</ListGroup.Item>
          <ListGroup.Item>Teléfono Celular: {data.telefono_celular}</ListGroup.Item>
          <ListGroup.Item>Estado: {data.estado?.descripcion || 'N/A'}</ListGroup.Item>
          <ListGroup.Item>Nacionalidad: {data.nacionalidad?.descripcion || 'N/A'}</ListGroup.Item>
          <ListGroup.Item>Género: {data.genero?.descripcion || 'N/A'}</ListGroup.Item>
          <ListGroup.Item>Grupo Prioritario: {data.grupo_prioritario?.descripcion || 'N/A'}</ListGroup.Item>
          <ListGroup.Item>Procedencia: {data.procedencia?.descripcion || 'N/A'}</ListGroup.Item>
          <ListGroup.Item>Nivel de Instrucción: {data.nivel_instruccion?.descripcion || 'N/A'}</ListGroup.Item>
        </ListGroup>
      </Card>
      <Card className="mt-4">
        <Card.Header>Información de Inscripción</Card.Header>
        <ListGroup variant="flush">
          <ListGroup.Item>Cómo se Enteró de SUPERATEC: {data.comoEnteroSuperatec?.descripcion || 'N/A'}</ListGroup.Item>
          <ListGroup.Item>Cohorte: {data.cohorte?.descripcion || 'N/A'}</ListGroup.Item>
          <ListGroup.Item>Centro: {data.centro?.descripcion || 'N/A'}</ListGroup.Item>
          <ListGroup.Item>Periodo: {data.periodo?.descripcion || 'N/A'}</ListGroup.Item>
          <ListGroup.Item>Área: {data.area?.descripcion || 'N/A'}</ListGroup.Item>
          <ListGroup.Item>Unidad: {data.unidad?.descripcion || 'N/A'}</ListGroup.Item>
          <ListGroup.Item>Modalidad: {data.modalidad?.descripcion || 'N/A'}</ListGroup.Item>
          <ListGroup.Item>Nivel: {data.nivel?.descripcion || 'N/A'}</ListGroup.Item>
          <ListGroup.Item>Tipo de Programa: {data.tipo_programa?.descripcion || 'N/A'}</ListGroup.Item>
          <ListGroup.Item>Realiza Aporte: {data.realiza_aporte ? 'Sí' : 'No'}</ListGroup.Item>
          <ListGroup.Item>Es Patrocinado: {data.es_patrocinado ? 'Sí' : 'No'}</ListGroup.Item>
          <ListGroup.Item>Grupo: {data.grupo}</ListGroup.Item>
          <ListGroup.Item>Observaciones: {data.observaciones}</ListGroup.Item>
        </ListGroup>
      </Card>
    </div>
  );
  
};

export default ShowMoreDatos;
