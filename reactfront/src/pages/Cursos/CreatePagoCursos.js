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


const CreatePagoCursos = () => {
  const [formData, setFormData] = useState({
    costo:'',
    cuotas:''
  });

  const { id } = useParams(); // Obtener el id del curso de la URL
  const { setLoading } = useLoading();
  const navigate = useNavigate();
  const [curso,setCurso]=useState('');


  useEffect(() => {
    setLoading(true);
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
        cuotas: curso.cuotas || '',
        costo: curso.costo || '',
        
        

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
          peticion.key === String(cursoId) && peticion.zona_id === 4 && peticion.status === false
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
  



  return (
    <div className="row" style={{ marginTop: '50px' }}>
    <div className="col-lg-6 mx-auto"> {/* Centrado del contenido */}
      <div className="card-box" style={{ padding: '20px', width: '100%', margin: '0 auto' }}>
        <h2 className="mb-2">Actualizar Costo de Curso {curso.cod}</h2>
        <Form onSubmit={handleSubmit} className="custom-gutter">
              <Form.Group controlId="costo">
                <Form.Label>Costo en $</Form.Label>
                <Form.Control
                  type="number"
                  name="costo"
                  value={formData.costo}
                  onChange={handleChange}
                  maxLength={40}
                />
              </Form.Group>
              <Form.Group controlId="cuotas">
                <Form.Label>Número de Cuotas</Form.Label>
                <Form.Control
                  type="number"
                  name="cuotas"
                  value={formData.cuotas}
                  onChange={handleChange}
                  maxLength={40}
                />
              </Form.Group>
  
            

        <Button variant="success" type="submit">
          Guardar
        </Button>
        <Button 
          variant="secondary" 
          onClick={() => navigate('/cursos')}
          className="ms-2"
        >
          Volver
        </Button>
      </Form>
    </div>
    </div>
    </div>
  );
};

export default CreatePagoCursos;
