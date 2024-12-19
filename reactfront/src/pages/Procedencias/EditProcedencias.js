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


const EditProcedencias = () => {
  const [formData, setFormData] = useState({
    cod:'',
    descripcion:'',
    direccion:''
  });

  const { id } = useParams(); // Obtener el id del curso de la URL
  const { setLoading } = useLoading();
  const navigate = useNavigate();
  const [procedencia,setProcedencia]=useState('');
  const [codError, setCodError] = useState('');  // Estado para mensajes de error del cod
  const [isCodValid, setIsCodValid] = useState(true);  // Estado para indicar si el cod es válido
  const [originalCod, setOriginalCod] = useState('');  // Almacena el valor original del cod
  

  useEffect(() => {
    setLoading(true);
    Promise.all([getProcedencia()]).finally(() => {
        setLoading(false);
    });
}, []);



  const getProcedencia = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${endpoint}/procedencia/${id}`,{headers: {
        Authorization: `Bearer ${token}`,
    }});
          
      const procedencia = response.data;
      setProcedencia(procedencia);
      setFormData({
        cod: procedencia.cod || '',
        descripcion: procedencia.descripcion || '',
        direccion: procedencia.direccion || '',

      });
      setOriginalCod(procedencia.cod); // Guarda el valor original de cod

    } catch (error) {
      setError('Error fetching Procedencia');
      console.error('Error fetching Procedencia:', error);
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
  
      const procResponse = await axios.put(`${endpoint}/procedencia/${id}`, formDataWithStatus, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (!hasEmptyFields) {
        // 2. Si el formulario está completo, buscar todas las peticiones paginadas
        const cursoId = procResponse.data.id;  // Usamos el ID del curso
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
          peticion.key === String(cursoId) && peticion.zona_id === 7 && peticion.status === false
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
      navigate('/procedencias');
  
    } catch (error) {
      // Captura cualquier error que ocurra en la solicitud
      toast.error('Error al actualizar curso o petición');
      console.error('Error actualizando:', error);
    }
  };
  

  const handleCodBlur = async () => {
    if (formData.cod && formData.cod !== originalCod) {
        try {
            const token = localStorage.getItem('token');
            await axios.get(`${endpoint}/validate-cod/${formData.cod}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setCodError('El código ya está en uso.');
            setIsCodValid(false);
        } catch (error) {
            if (error.response && error.response.status === 404) {
                setCodError('');
                setIsCodValid(true);
            } else {
                console.error('Error al verificar el código:', error);
                setCodError('Error verificando el código.');
                setIsCodValid(false);
            }
        }
    } else {
        setCodError('');
        setIsCodValid(true);
    }
};




  return (
    <div className="row" style={{ marginTop: '50px' }}>
    <div className="col-lg-6 mx-auto"> {/* Centrado del contenido */}
      <div className="card-box" style={{ padding: '20px', width: '100%', margin: '0 auto' }}>
        <h2 className="mb-2">Actualizar Procedencia</h2>
        <Form onSubmit={handleSubmit} className="custom-gutter">
              <Form.Group controlId="descripcion">
                <Form.Label>Nombre de Procedencia</Form.Label>
                <Form.Control
                  type="text"
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  maxLength={40}
                  required
                />
              </Form.Group>
  
              <Form.Group controlId="direccion">
                <Form.Label>Dirección</Form.Label>
                <Form.Control
                  type="textarea"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleChange}
                />
              </Form.Group>
              <Form.Group controlId="cod">
                <Form.Label>COD</Form.Label>
                <Form.Control
                  type="text"
                  name="cod"
                  value={formData.cod || ''}
                  onChange={(e) => {
                      const uppercaseValue = e.target.value.toUpperCase();
                      setFormData((prevState) => ({
                          ...prevState,
                          cod: uppercaseValue
                      }));
                  }}
                  onBlur={handleCodBlur}
                  className={codError ? 'is-invalid' : isCodValid ? 'is-valid' : ''}
              />

                {codError && (
                    <Form.Control.Feedback type="invalid">
                        {codError}
                    </Form.Control.Feedback>
                )}
                {!codError && isCodValid && (
                    <Form.Control.Feedback type="valid">
                        Código disponible.
                    </Form.Control.Feedback>
                )}
            </Form.Group>

  
            
        <div className="d-flex justify-content-end mt-3">
            <Button variant="secondary" onClick={() => navigate(-1)} className="me-2">
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

export default EditProcedencias;
