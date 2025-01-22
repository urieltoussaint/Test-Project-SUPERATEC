import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Button } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { useLoading } from '../../components/LoadingContext';
import { ToastContainer,toast } from 'react-toastify';
import { Card, Row, Col } from 'react-bootstrap'; 
import SelectComponent from '../../components/SelectComponent';



const userId = parseInt(localStorage.getItem('user'));  // ID del usuario logueado
const endpoint = 'http://localhost:8000/api';


const EditCursos = () => {
   const [formData, setFormData] = useState({
      descripcion: '',
      cantidad_horas: '',
      fecha_inicio: '',
      area_id: '',
      unidad_id:'',
      nivel_id:'',
      modalidad_id:'',
      tipo_programa_id:'',
      sesiones:0,
      grupo_id:'',
      externo:false,
      
    });

  const [filterOptions, setFilterOptions] = useState({
    areaOptions: [],
    unidadOptions: [],
    nivelOptions: [],
    tipoProgramaOptions: [],
    modalidadOptions: [],
    grupoOptions:[],
});

  const { id } = useParams(); // Obtener el id del curso de la URL
  const { setLoading } = useLoading();
  const navigate = useNavigate();
  const [curso,setCurso]=useState('');
  const [selectVisible, setSelectVisible] = useState(false);  // Control de la visibilidad de los selectores

 


  useEffect(() => {
    setLoading(true);
    handleSeleccionar();
    Promise.all([getCurso()]).finally(() => {
        setLoading(false);
    });
}, []);



  const getCurso = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${endpoint}/cursos/${id}`,{headers: {
        Authorization: `Bearer ${token}`,
    }});
      const curso = response.data;
      setCurso(curso);
      setFormData({
      descripcion: curso.descripcion || '',
      cantidad_horas: curso.cantidad_horas || '',
      fecha_inicio: curso.fecha_inicio || '',
      area_id: curso.area_id || '',
      nivel_id: curso.nivel_id || '',
      unidad_id: curso.unidad_id || '',  
      modalidad_id: curso.modalidad_id || '',  
      tipo_programa_id: curso.tipo_programa_id || '',
      cantidad_sesiones:curso.sesiones || '',
      grupo_id:curso.grupo_id || '',
    });

    } catch (error) {
      setError('Error fetching course');
      console.error('Error fetching course:', error);
    }
  };

  const [error, setError] = useState(null);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  // const curso=formData.curso.cod;

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const emptyFields = Object.keys(formData).filter(key => {
      return !formData[key];  // Considerar vacíos los campos que no tienen valor
    });
  
    const hasEmptyFields = emptyFields.length > 0;
  
    try {
      const token = localStorage.getItem('token');
  
      if (!token) {
        toast.error('Error: Token no encontrado');
        return;
      }
  
      // 1. Actualizar los datos del curso
      const formDataWithStatus = {
        ...formData,
        status: !hasEmptyFields  // Si no hay campos vacíos, el status será true, de lo contrario, false
      };
  
      const cursoResponse = await axios.put(`${endpoint}/cursos/${id}`, formDataWithStatus, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (!hasEmptyFields) {
        // 2. Si el formulario está completo, buscar todas las peticiones paginadas
        const cursoId = cursoResponse.data.id;  // Usamos el ID del curso
        let allPeticiones = [];
        let currentPage = 1;
        let totalPages = 1;
  
        // 3. Obtener todas las páginas de peticiones
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
  
        // 4. Filtrar las peticiones por key = cursoId, zona_id = 2, y status = false
        const peticionesFiltradas = allPeticiones.filter(peticion =>
          peticion.key === String(cursoId) && peticion.zona_id === 2 && peticion.status === false
        );
  
        if (peticionesFiltradas.length > 0) {
          const peticion = peticionesFiltradas[0];  // Obtener la primera petición que coincida
  
          // 5. Actualizar el status de la petición a true
          await axios.put(`${endpoint}/peticiones/${peticion.id}`, {
            status: true,   // Cambiar el estado a true
            finish_time: new Date().toLocaleString('es-ES', { timeZone: 'America/Caracas' }), // Ejemplo para Caracas
            user_success: userId //envia el usuario que completo la tarea
          }, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
  
          toast.success('Curso y petición actualizados con éxito.');
        } else {
          toast.success('Curso actualizado.');
        }
  
      } else {
        // Si hay campos vacíos, solo actualizamos los datos del curso
        toast.success('Curso actualizado con campos vacíos.');
      }
  
      // Redirigir después de la actualización
      navigate('/cursos');
  
    } catch (error) {
      // Captura cualquier error que ocurra en la solicitud
      toast.error('Error al actualizar curso o petición');
      console.error('Error actualizando:', error);
    }
  };

  const handleSeleccionar = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Suponiendo que el endpoint unificado sea `/filtros-cursos`
      const response = await axios.get(`${endpoint}/filtros-cursos`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Desestructuramos los datos que vienen en la respuesta
      const { area, unidad, nivel, tipo_programa, modalidad,grupo } = response.data;
  
      // Retornamos las opciones en un solo objeto
      setFilterOptions( {
        areaOptions: area,
        unidadOptions: unidad,
        nivelOptions: nivel,
        tipoProgramaOptions: tipo_programa,
        modalidadOptions: modalidad,
        grupoOptions:grupo,
      });
      setSelectVisible(true);  // Mostrar los selectores
  
    } catch (error) {
      console.error('Error fetching filter options:', error);
      
    }
  };
  
   useEffect(() => {
      if (formData.tipo_programa_id === "1") {
        setFormData((prevState) => ({
          ...prevState,
          cantidad_horas: 2,
          sesiones: 1,
        }));
      } else if (formData.tipo_programa_id === "2") {
        setFormData((prevState) => ({
          ...prevState,
          cantidad_horas: 4,
          sesiones: 1,
        }));
      } else if (formData.tipo_programa_id === "3") {
        setFormData((prevState) => ({
          ...prevState,
          sesiones: prevState.cantidad_horas
            ? Math.floor(prevState.cantidad_horas / 4)
            : "",
        }));
      }
    }, [formData.tipo_programa_id, formData.cantidad_horas]);



  return (
    <div className="row" style={{ marginTop: '50px' }}>
    <div className="col-lg-6 mx-auto"> {/* Centrado del contenido */}
      <div className="card-box" style={{ padding: '20px', width: '100%', margin: '0 auto' }}>
        <h2 className="mb-2">Actualizar Curso {curso.cod}</h2>
        <Form onSubmit={handleSubmit} className="custom-gutter">
      <Form.Group controlId="externo">
        <Form.Label>¿Programa externo a Superatec?</Form.Label>
        <Form.Control
            as="select"
            name="externo"
            value={formData.externo} // Asume que formData tiene la clave curso_externo
            onChange={handleChange}
            required
        >
            <option value="">Seleccione</option>
            <option value="1">Sí</option>
            <option value="0">No</option>
        </Form.Control>
    </Form.Group>

      <Form.Group controlId="descripcion">
              <Form.Label>Nombre del Programa</Form.Label>
              <Form.Control
                type="text"
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                maxLength={40}
                required
              />
            </Form.Group>
            <SelectComponent
              options={filterOptions.tipoProgramaOptions}  // Usar el estado filterOptions
              nameField="descripcion"
              valueField="id"
              selectedValue={formData.tipo_programa_id}
              handleChange={handleChange}
              controlId="tipo_programa_id"
              label="Tipo de Programa"
            />

            <SelectComponent
                options={filterOptions.grupoOptions}  // Usar el estado filterOptions
                nameField="descripcion"
                valueField="id"
                selectedValue={formData.grupo_id}
                handleChange={handleChange}
                controlId="grupo_id"
                label="Grupo"
              />

          <Row className="g-2">
          <Col md={6}>
            <Form.Group controlId="cantidad_horas">
              <Form.Label>Cantidad de Horas</Form.Label>
              <Form.Control
                type="number"
                name="cantidad_horas"
                value={formData.cantidad_horas}
                onChange={handleChange}
                maxLength={4}
                disabled={formData.tipo_programa_id === "1" || formData.tipo_programa_id === "2"} // Bloquear si tipo_programa_id es 1 o 2
              />
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group controlId="sesiones">
              <Form.Label>Cantidad de Sesiones</Form.Label>
              <Form.Control
                type="number"
                name="sesiones"
                value={formData.sesiones}
                onChange={handleChange}
                maxLength={4}
                disabled={formData.tipo_programa_id !== "3"} // Bloquear si tipo_programa_id no es 3
              />
            </Form.Group>
          </Col>

          </Row>
          <Row className="g-2">
          <Col md={6}>
          <SelectComponent
              
              options={filterOptions.areaOptions}  // Usar el estado filterOptions
              nameField="descripcion"
              valueField="id"
              selectedValue={formData.area_id}
              handleChange={handleChange}
              controlId="area_id"
              label="Área"
            />
            
            </Col>

          <Col md={6}>
            <SelectComponent
              options={filterOptions.unidadOptions}  // Usar el estado filterOptions
              nameField="descripcion"
              valueField="id"
              selectedValue={formData.unidad_id}
              handleChange={handleChange}
              controlId="unidad_id"
              label="Unidad"
            />
          </Col>
          </Row>
          <Row className="g-2">
          <Col md={6}>
          <SelectComponent
              options={filterOptions.modalidadOptions}  // Usar el estado filterOptions

              nameField="descripcion"
              valueField="id"
              selectedValue={formData.modalidad_id}
              handleChange={handleChange}
              controlId="modalidad_id"
              label="Modalidad"
            />
          </Col>
          <Col md={6}>
          <SelectComponent
              options={filterOptions.nivelOptions}  // Usar el estado filterOptions
              nameField="descripcion"
              valueField="id"
              selectedValue={formData.nivel_id}
              handleChange={handleChange}
              controlId="nivel_id"
              label="Nivel"
            />
          </Col>
        </Row>
        
        <Form.Group controlId="fecha_inicio">
              <Form.Label>Fecha de Inicio</Form.Label>
              <Form.Control
                type="date"
                name="fecha_inicio"
                value={formData.fecha_inicio}
                onChange={handleChange}
              />
            </Form.Group>


        <div className="d-flex justify-content-end mt-3">
          <Button variant="secondary" onClick={() => navigate('/cursos')} className="me-2">
            Volver
          </Button>
          <Button variant="success" type="submit">
            Guardar
          </Button>
        </div>
      </Form>
      
    </div>
    </div>
    </div>
  );
};

export default EditCursos;
