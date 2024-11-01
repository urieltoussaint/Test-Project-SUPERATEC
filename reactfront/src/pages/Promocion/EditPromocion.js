import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Button } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import SelectComponent from '../../components/SelectComponent';
import './EditPromocion.css'; // Importa la hoja de estilo si es necesario
import { useLoading } from '../../components/LoadingContext'; 
import { ToastContainer,toast } from 'react-toastify';
import { Card, Row, Col } from 'react-bootstrap'; 

const userId = parseInt(localStorage.getItem('user'));  // ID del usuario logueado
const endpoint = 'http://localhost:8000/api';

const EditPromocion = () => {
    const [formData, setFormData] = useState({
        centro_id: '',
        cohorte_id:'',
        periodo_id:'',
        fecha_promocion:'',
        procedencia_id:'',
        mencion_id:'',
        estudiantes_asistentes:'',
        estudiantes_interesados:'',
        comentarios:'',
        
      });

      const [filterOptions, setFilterOptions] = useState({
        centroOptions: [],
        periodoOptions: [],
        cohorteOptions: [],
        mencionOptions: [],
        procedenciaOptions: [],
    
    });

  const navigate = useNavigate();
  const { id } = useParams(); // Obtener el ID desde la ruta
  const {setLoading}=useLoading();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        HandleSelected();
        let relationsArray = ['centro', 'cohorte', 'periodo', 'procedencia', 'mencion'];
        const relations = relationsArray.join(',');
        const token = localStorage.getItem('token');
        const response = await axios.get(`${endpoint}/promocion/${id}?with=${relations}`,{
          headers: {
              Authorization: `Bearer ${token}`,
          },
      });
        console.log(response.data);
        setFormData({
          ...response.data,
          promocion: response.data.promocion || {
            cohorte_id: '',
            centro_id: '',
            periodo_id: '',
            fecha_promocion: '',
            procedencia_id: '',
            mencion_id: '',
            nivel_id: '',
            estudiantes_asistentes: '',
            estudiantes_interesados: '',
            comentarios: '',
          },
        });
    
      } catch (error) {
        console.error('Error fetching data:', error);
      }

      setLoading(false);
    };

    fetchData();
  }, [id]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };



  const handleSubmit = async (e) => {
    e.preventDefault();


    // Filtrar los campos vacíos o que contienen solo espacios, asegurando que el valor sea una cadena
    const emptyFields = Object.keys(formData).filter(key => {
        const value = formData[key];
        return value === '' || value === null || (typeof value === 'string' && value.trim() === ''); // Considerar vacíos los campos que están vacíos, son nulos, o tienen solo espacios
    });

    const hasEmptyFields = emptyFields.length > 0;

    try {
        const token = localStorage.getItem('token');

        // 1. Actualizar los datos del participante
        await axios.put(`${endpoint}/promocion/${id}`, formData, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!hasEmptyFields) {
            // Si no hay campos vacíos, proceder con la actualización de la petición
            let allPeticiones = [];
            let currentPage = 1;
            let totalPages = 1;

            // 2. Obtener todas las páginas de peticiones y combinarlas
            while (currentPage <= totalPages) {
                const response = await axios.get(`${endpoint}/peticiones?page=${currentPage}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                allPeticiones = [...allPeticiones, ...response.data.data];
                totalPages = response.data.last_page;
                currentPage++;
            }

            // Filtrar las peticiones por cedula_identidad, zona_id, y status
            const peticionesFiltradas = allPeticiones.filter(peticion =>
                peticion.key === id && peticion.zona_id === 8 && peticion.status === false
            );

            if (peticionesFiltradas.length > 0) {
                const peticion = peticionesFiltradas[0];  // Obtener la primera petición que coincida

                // 3. Actualizar el status de la petición a true
                await axios.put(`${endpoint}/peticiones/${peticion.id}`, {
                    status: true,   // Cambiar el estado a true
                    finish_time: new Date().toLocaleString('es-ES', { timeZone: 'America/Caracas' }), // Ejemplo para Caracas
                    user_success: userId, // Enviar el usuario que completó la tarea
                }, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                toast.success('Actualización con Éxito, Petición también actualizada');
            } else {
                // Si no hay peticiones, no mencionar en el mensaje de éxito
                toast.success('Actualización con Éxito');
            }
        } else {
            // Si hay campos vacíos, solo actualizamos los datos del participante
            toast.success('Formulario actualizado con éxito.');
        }

        navigate('/promocion');
    } catch (error) {
        // Captura cualquier error que ocurra en la solicitud
        toast.error('Error al actualizar Participante o Petición');
        console.error('Error actualizando:', error);
    }
};



  const HandleSelected = async () => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${endpoint}/filter-promocion`, { headers: { Authorization: `Bearer ${token}` } });

        const {centro,periodo,cohorte,mencion,procedencia}=response.data;
        setFilterOptions({

        centroOptions:centro,
        periodoOptions: periodo,
        cohorteOptions: cohorte,
        mencionOptions: mencion,
        procedenciaOptions:procedencia
        });
 
    } catch (error) {
        console.error('Error fetching filter options:', error);
    }
};


  return (
    <div className="row" style={{ marginTop: '50px' }}>
    <div className="col-lg-6 mx-auto"> {/* Centrado del contenido */}
      <div className="card-box" style={{ padding: '20px', width: '100%', margin: '0 auto' }}>
      <meta name="csrf-token" content="{{ csrf_token() }}" />
      <h1>Agregar Nueva Promoción</h1>
      <Form onSubmit={handleSubmit} className="custom-gutter">
        <script src="{{ mix('js/app.js') }}"></script>
        <div className="row">
          <div className="col-md-6">
              <Row className="g-2"> 
              <Col md={6}>

                <SelectComponent
                  options={filterOptions.centroOptions} 
                  nameField="descripcion"
                  valueField="id"
                  selectedValue={formData.centro_id}
                  handleChange={handleChange}
                  controlId="centro_id"
                  label="Centro"
                />
                </Col>
                <Col md={6}>

                <SelectComponent
                
                options={filterOptions.cohorteOptions} 
                  nameField="descripcion"
                  valueField="id"
                  selectedValue={formData.cohorte_id}
                  handleChange={handleChange}
                  controlId="cohorte_id"
                  label="Cohorte"
                />
                </Col>
                </Row>
                <Row className="g-2"> 
                <Col md={6}>
                <SelectComponent
                  options={filterOptions.periodoOptions} 
                  nameField="descripcion"
                  valueField="id"
                  selectedValue={formData.periodo_id}
                  handleChange={handleChange}
                  controlId="periodo_id"
                  label="Periodo"
                />
                </Col>
                <Col md={6}>
                <SelectComponent
                  options={filterOptions.procedenciaOptions} 
                  nameField="descripcion"
                  valueField="id"
                  selectedValue={formData.procedencia_id}
                  handleChange={handleChange}
                  controlId="procedencia_id"
                  label="Procedencia"
                />
                </Col>
                </Row>
                <Row className="g-2"> 
                <Col md={6}>
                <SelectComponent
                  options={filterOptions.mencionOptions} 
                  nameField="descripcion"
                  valueField="id"
                  selectedValue={formData.mencion_id}
                  handleChange={handleChange}
                  controlId="mencion_id"
                  label="Mención"
                />
                </Col>
               
                <Col md={6}>
            <Form.Group controlId="fecha_promocion">
              <Form.Label>Fecha de Promoción</Form.Label>
              <Form.Control
                type="date"
                name="fecha_promocion"
                value={formData.fecha_promocion}
                onChange={handleChange}
                required
              />
            </Form.Group>
            </Col>
            </Row>
            <Row className="g-2"> 
            <Col md={6}>
            <Form.Group controlId="estudiantes_asistentes">
              <Form.Label>Estudiantes Asistentes</Form.Label>
              <Form.Control
                type="number"
                name="estudiantes_asistentes"
                value={formData.estudiantes_asistentes}
                onChange={handleChange}
                required
              />
            </Form.Group>
            </Col>
            
            <Col md={6}>
            <Form.Group controlId="estudiantes_interesados">
              <Form.Label>Estudiantes Interesados</Form.Label>
              <Form.Control
                type="number"
                name="estudiantes_interesados"
                value={formData.estudiantes_interesados}
                onChange={handleChange}
                required
              />
            </Form.Group>
            </Col>
            </Row>
            

            <Form.Group controlId="comentarios">
              <Form.Label>Comentarios</Form.Label>
              <Form.Control
                type="textarea"
                name="comentarios"
                value={formData.comentarios}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </div>
        </div>
        <div className='mt-3'>
          <Button variant="success" type="submit">
            Guardar
          </Button>
          <Button
            variant="secondary"
            onClick={() => navigate('/promocion')}
            className="ms-2"
          >
            Volver
          </Button>
        </div>
      </Form>
    </div>
    </div>
    </div>
  );
};

export default EditPromocion;
