import React, { useState, useEffect } from 'react';
import axios from 'axios'
import { useParams, useNavigate } from 'react-router-dom'; // Importa useNavigate
import { Card, ListGroup, Button } from 'react-bootstrap';
import './ShowMoreVoluntariados.css'; // Importa la hoja de estilo
import { useLoading } from '../../../components/LoadingContext';   


const endpoint = 'http://localhost:8000/api';

const ShowMoreVoluntariados = ({  }) => {
  const { id } = useParams();
  const [data, setData] = useState({});
  const navigate = useNavigate(); // Inicializa useNavigate
  const { setLoading } = useLoading();


  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        let relationsArray = [
          'cedula_identidad','nombres','apellidos','fecha_nacimiento','genero','telefonos_casa','telefono_celular','email','direccion',
          'ocupacion','nivelInstruccion','procedencia','ComoEnteroSuperatec','fecha_registro','InformacionVoluntariados.TipoVoluntariado',
          'InformacionVoluntariados.area','InformacionVoluntariados.Centro','InformacionVoluntariados.Area',
          'InformacionVoluntariados.Turnos'
        ];
        const relations = relationsArray.join(',');
        const token = localStorage.getItem('token');
        const response = await axios.get(`${endpoint}/voluntariados/${id}?with=${relations}`,{headers: {
          Authorization: `Bearer ${token}`,
      }});
        setData(response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }        setLoading(false);

    };

    fetchData();
  }, [id]);

  return (
    <div className="container-fluid" style={{ marginTop: '50px'}}>
      <h1 className="mb-4 text-center">Detalles del Voluntariado {data.cedula_identidad}</h1> {/* Centrado el título */}
      <div className="row justify-content-between"> {/* Espacio entre columnas */}
      
        <div className="col-lg-6 col-md-6"> {/* Ajusta el tamaño de la tarjeta */}
            
          <Card className="p-4 shadow"> {/* Añadido padding y sombra */}
          <h4 className="mb-4 text-center">Datos del Voluntariado</h4> {/* Centrado el título */}
          <ListGroup variant="flush">

            <ListGroup.Item>Cédula de Identidad: {data.cedula_identidad}</ListGroup.Item>
            <ListGroup.Item>Nombres: {data.nombres}</ListGroup.Item>
            <ListGroup.Item>Apellidos: {data.apellidos}</ListGroup.Item>
            <ListGroup.Item>Fecha de Nacimiento: {data.fecha_nacimiento}</ListGroup.Item>
            <ListGroup.Item>Género: {data.genero?.descripcion || 'N/A'}</ListGroup.Item>
            <ListGroup.Item>Dirección: {data.direccion}</ListGroup.Item>
            <ListGroup.Item>Email: {data.email}</ListGroup.Item>
            <ListGroup.Item>Teléfono de Casa: {data.telefono_casa}</ListGroup.Item>
            <ListGroup.Item>Teléfono Celular: {data.telefono_celular}</ListGroup.Item>
            <ListGroup.Item>Ocupacion: {data.ocupacion}</ListGroup.Item>
            <ListGroup.Item>Nivel de Instruccion: {data.nivel_instruccion?.descripcion}</ListGroup.Item>
            <ListGroup.Item>Procedencia: {data.procedencia?.descripcion || 'N/A'}</ListGroup.Item>
            <ListGroup.Item>Como se enteró de SUPERATEC: {data.como_entero_superatec?.descripcion || 'N/A'}</ListGroup.Item>
            <ListGroup.Item>Fecha de Registro: {data.fecha_registro}</ListGroup.Item>
          </ListGroup>
        </Card>
        </div>

         <div className="col-lg-6 col-md-6"> {/* Ajusta el tamaño de la tarjeta */}
          <Card className="p-4 shadow"> {/* Añadido padding y sombra */}
            <h4 className="mb-4 text-center">Informacion de Voluntariado</h4>
            <ListGroup variant="flush">

            <ListGroup.Item>Tipo de Voluntariado : {data.informacion_voluntariados?.tipo_voluntariado?.descripcion || 'N/A'}</ListGroup.Item>
            <ListGroup.Item>Area de Voluntariado : {data.informacion_voluntariados?.area?.descripcion || 'N/A'}</ListGroup.Item>          
            <ListGroup.Item>Centro : {data.informacion_voluntariados?.centro?.descripcion || 'N/A'}</ListGroup.Item>           
            <ListGroup.Item>Actividades a Realizar : {data.informacion_voluntariados?.actividades_realizar || 'N/A'}</ListGroup.Item>
            <ListGroup.Item>Turnos: {data.informacion_voluntariados?.turnos?.descripcion || 'N/A'}</ListGroup.Item>            
            <ListGroup.Item>Horas Totales : {data.informacion_voluntariados?.horas_totales || 'N/A'}</ListGroup.Item>           
          </ListGroup>
        </Card>
        <div className="text-center mt-4 w-100">
          <Button variant="secondary" onClick={() => navigate(-1)}>
            Volver
          </Button>
        </div>
      </div>
      </div>
      </div>
     
  );
};

export default ShowMoreVoluntariados;
