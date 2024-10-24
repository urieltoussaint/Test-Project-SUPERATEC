import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom'; // Importa useNavigate
import { Card, ListGroup, Button } from 'react-bootstrap';
import { useLoading } from '../../components/LoadingContext';

const endpoint = 'http://localhost:8000/api';

const ShowMorePatrocinantes = ({ onReload }) => {
  const { id } = useParams();
  const [data, setData] = useState({});
  const navigate = useNavigate(); // Inicializa useNavigate
  const { setLoading } = useLoading(); // Usar el contexto de carga
 


  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); // Inicia la animación de carga
      try {
        let relationsArray = ['estado', 'pais', 'tipoIndustria', 'tipoPatrocinante', 'contactoPatrocinante'];
        const relations = relationsArray.join(',');
        const token = localStorage.getItem('token');
        const response = await axios.get(`${endpoint}/patrocinantes/${id}?with=${relations}`,{
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
    <div className="container-fluid" style={{ marginTop: '50px'}}>
      <h1 className="mb-4 text-center">Detalles del Patrocinante con Rif/Cedula {data.rif_cedula}</h1> {/* Centrado el título */}
      <div className="row justify-content-between"> {/* Espacio entre columnas */}
      
        <div className="col-lg-6 col-md-6"> {/* Ajusta el tamaño de la tarjeta */}
            
          <Card className="p-4 shadow"> {/* Añadido padding y sombra */}
          <h4 className="mb-4 text-center">Datos de la Empresa o Individuo</h4> {/* Centrado el título */}
          
           
            <ListGroup variant="flush">
                <ListGroup.Item>Rif/Cédula: {data.rif_cedula}</ListGroup.Item>
                <ListGroup.Item>Nombre del Patrocinante: {data.nombre_patrocinante}</ListGroup.Item>
                <ListGroup.Item>Empresa o Persona: {data.empresa_persona}</ListGroup.Item>
                <ListGroup.Item>Teléfono: {data.telefono}</ListGroup.Item>
                <ListGroup.Item>Dirección: {data.direccion}</ListGroup.Item>
                <ListGroup.Item>Ciudad: {data.ciudad}</ListGroup.Item>
                <ListGroup.Item>Estado: {data.estado?.descripcion}</ListGroup.Item>
                <ListGroup.Item>País: {data.pais?.descripcion}</ListGroup.Item>
                <ListGroup.Item>Código Postal: {data.codigo_postal}</ListGroup.Item>
                <ListGroup.Item>Web: {data.web}</ListGroup.Item>
                <ListGroup.Item>Es Patrocinante: {data.es_patrocinante ? 'Sí' : 'No'}</ListGroup.Item>
                <ListGroup.Item>Bolsa de Empleo: {data.bolsa_empleo ? 'Sí' : 'No'}</ListGroup.Item>
                <ListGroup.Item>Exterior: {data.exterior ? 'Sí' : 'No'}</ListGroup.Item>
                <ListGroup.Item>Referido por: {data.referido_por}</ListGroup.Item>
                <ListGroup.Item>Otra Información: {data.otra_info}</ListGroup.Item>
                <ListGroup.Item>NIT: {data.nit}</ListGroup.Item>
                <ListGroup.Item>Tipo de Industria: {data.tipo_industria?.descripcion}</ListGroup.Item>
                <ListGroup.Item>Tipo de Patrocinante: {data.tipo_patrocinante?.descripcion}</ListGroup.Item>
            </ListGroup>
          </Card>
        </div>
  
        <div className="col-lg-6 col-md-6"> {/* Ajusta el tamaño de la tarjeta */}
          <Card className="p-4 shadow"> {/* Añadido padding y sombra */}
            <h4 className="mb-4 text-center">Detalles del Contacto</h4> {/* Centrado el título */}
           
            <ListGroup variant="flush">
                <ListGroup.Item>Nombre Principal: {data.contacto_patrocinante?.nombre_principal}</ListGroup.Item>
                <ListGroup.Item>Cargo Principal: {data.contacto_patrocinante?.cargo_principal}</ListGroup.Item>
                <ListGroup.Item>Teléfono Principal: {data.contacto_patrocinante?.telefono_principal}</ListGroup.Item>
                <ListGroup.Item>Email Principal: {data.contacto_patrocinante?.email_principal}</ListGroup.Item>
                <ListGroup.Item>Nombre Adicional: {data.contacto_patrocinante?.nombre_adicional}</ListGroup.Item>
                <ListGroup.Item>Cargo Adicional: {data.contacto_patrocinante?.cargo_adicional}</ListGroup.Item>
                <ListGroup.Item>Teléfono Adicional: {data.contacto_patrocinante?.telefono_adicional}</ListGroup.Item>
                <ListGroup.Item>Email Adicional: {data.contacto_patrocinante?.email_adicional}</ListGroup.Item>
                <ListGroup.Item>Nombre Adicional 2: {data.contacto_patrocinante?.nombre_adicional2}</ListGroup.Item>
                <ListGroup.Item>Cargo Adicional 2: {data.contacto_patrocinante?.cargo_adicional2}</ListGroup.Item>
                <ListGroup.Item>Teléfono Adicional 2: {data.contacto_patrocinante?.telefono_adicional2}</ListGroup.Item>
                <ListGroup.Item>Email Adicional 2: {data.contacto_patrocinante?.email_adicional2}</ListGroup.Item>
            </ListGroup>
          </Card>
          <div className="text-center mt-4 w-100">
          <Button variant="secondary" onClick={() => navigate('/patrocinantes')}>
            Volver
          </Button>
        </div>
        </div>
  
        
      </div>
    </div>
  );
  
  
    };

export default ShowMorePatrocinantes;
