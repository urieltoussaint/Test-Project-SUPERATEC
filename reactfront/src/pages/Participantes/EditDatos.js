import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Button } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import SelectComponent from '../../components/SelectComponent';
import './EditDatos.css'; // Importa la hoja de estilo si es necesario
import { useLoading } from '../../components/LoadingContext'; // Importa useLoading
import { ToastContainer,toast } from 'react-toastify';
import moment from 'moment';
const userId = parseInt(localStorage.getItem('user'));  // ID del usuario logueado
const endpoint = 'http://localhost:8000/api';

const EditDatos = () => {
  const { setLoading } = useLoading(); // Usar el contexto de carga
  const [formData, setFormData] = useState({
    // cedula_identidad: '',
    nombres: '',
    apellidos: '',
    fecha_nacimiento: '',
    edad: '',
    direccion: '',
    direccion_email: '',
    telefono_casa: '',
    telefono_celular: '',
    status_seleccion_id: '',
    nacionalidad_id: '',
    genero_id: '',
    grupo_prioritario_id: '',
    estado_id: '',
    procedencia_id: '',
    nivel_instruccion_id: '',
    informacion_inscripcion: {
      como_entero_superatec_id: '',
      cohorte_id: '',
      centro_id: '',
      periodo_id: '',
      area_id: '',
      unidad_id: '',
      modalidad_id: '',
      nivel_id: '',
      tipo_programa_id: '',
      realiza_aporte: false,
      es_patrocinado: false,
      grupo: '',
      observaciones: '',
    },
  });

  const navigate = useNavigate();
  const { id } = useParams(); // Obtener el ID desde la ruta

  useEffect(() => {
    setLoading(true); // Inicia la animación de carga
    const fetchData = async () => {
      
      try {
        const token = localStorage.getItem('token'); 
        let relationsArray = ['nacionalidad', 'estado', 'statusSeleccion', 'grupoPrioritario', 'procedencia', 'genero', 'nivelInstruccion', 'informacionInscripcion'];
        const relations = relationsArray.join(',');
        const response = await axios.get(`${endpoint}/datos/${id}?with=${relations}`,{
          headers: {
              Authorization: `Bearer ${token}`,
          },
        });
        
        console.log(response.data);
        setFormData({
          ...response.data,
          informacion_inscripcion: response.data.informacion_inscripcion || {
            como_entero_superatec_id: '',
            cohorte_id: '',
            centro_id: '',
            periodo_id: '',
            area_id: '',
            unidad_id: '',
            modalidad_id: '',
            nivel_id: '',
            tipo_programa_id: '',
            realiza_aporte: false,
            es_patrocinado: false,
            grupo: '',
            observaciones: '',
          },
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      }finally {
        setLoading(false); // Detiene la animación de carga
      } 
    };

    fetchData();
  }, [id, setLoading]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    const keys = name.split('.');

    if (keys.length > 1) {
      setFormData(prevState => ({
        ...prevState,
        informacion_inscripcion: {
          ...prevState.informacion_inscripcion,
          [keys[1]]: type === 'checkbox' ? checked : value,
        },
      }));
    } else {
      setFormData(prevState => ({
        ...prevState,
        [name]: type === 'checkbox' ? checked : value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const emptyFields = Object.keys(formData).filter(key => {
      if (key === 'realiza_aporte' || key === 'es_patrocinado') {
        return false;  // Excluir checkboxes de la validación de campos vacíos
      }
      return !formData[key];  // Considerar vacíos los campos que no tienen valor
    });
  
    const hasEmptyFields = emptyFields.length > 0;
  
    try {
      const token = localStorage.getItem('token');
      const cedulaIdentidad = formData.cedula_identidad;
  
      // 1. Actualizar los datos del participante
      await axios.put(`${endpoint}/datos/${id}`, formData, {
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
          peticion.key === cedulaIdentidad && peticion.zona_id === 1 && peticion.status === false
        );
  
        if (peticionesFiltradas.length > 0) {
          const peticion = peticionesFiltradas[0];  // Obtener la primera petición que coincida
  
          // 3. Actualizar el status de la petición a true
          await axios.put(`${endpoint}/peticiones/${peticion.id}`, {
            status: true,   // Cambiar el estado a true
            finish_time: new Date().toLocaleString('es-ES', { timeZone: 'America/Caracas' }), // Ejemplo para Caracas
            user_success: userId //envia el usuario que completo la tarea
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
  
      navigate('/datos');
    } catch (error) {
      // Captura cualquier error que ocurra en la solicitud
      toast.error('Error al actualizar Participante o Petición');
      console.error('Error actualizando:', error);
    }
  };
  

  return (
    <div className="container">
      <meta name="csrf-token" content="{{ csrf_token() }}" />
      <h1>Actualizar Datos de Participante V{formData.cedula_identidad}	</h1>
      <Form onSubmit={handleSubmit}>
        <script src="{{ mix('js/app.js') }}"></script>
        <div className="row">
          <div className="col-md-6">
            <Form.Group controlId="cedula_identidad">
              <Form.Label>Cédula de Identidad</Form.Label>
              <Form.Control
                type="text"
                name="cedula_identidad"
                value={formData.cedula_identidad ? `V-${formData.cedula_identidad}` : ''}
                readOnly
                required
              />
            </Form.Group>

            <SelectComponent
              endpoint={`${endpoint}/status_seleccion`}
              nameField="descripcion"
              valueField="id"
              selectedValue={formData.status_seleccion_id}
              handleChange={handleChange}
              controlId="status_seleccion_id"
              label="Status Selección"
            />

            <SelectComponent
              endpoint={`${endpoint}/nacionalidad_seleccion`}
              nameField="descripcion"
              valueField="id"
              selectedValue={formData.nacionalidad_id}
              handleChange={handleChange}
              controlId="nacionalidad_id"
              label="Nacionalidad"
            />

            <Form.Group controlId="nombres">
              <Form.Label>Nombres</Form.Label>
              <Form.Control
                type="text"
                name="nombres"
                value={formData.nombres}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group controlId="apellidos">
              <Form.Label>Apellidos</Form.Label>
              <Form.Control
                type="text"
                name="apellidos"
                value={formData.apellidos}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group controlId="fecha_nacimiento">
              <Form.Label>Fecha de Nacimiento</Form.Label>
              <Form.Control
                type="date"
                name="fecha_nacimiento"
                value={formData.fecha_nacimiento}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group controlId="edad">
              <Form.Label>Edad</Form.Label>
              <Form.Control
                type="number"
                name="edad"
                value={formData.edad}
                onChange={handleChange}
              />
            </Form.Group>

            <SelectComponent
              endpoint={`${endpoint}/genero`}
              nameField="descripcion"
              valueField="id"
              selectedValue={formData.genero_id}
              handleChange={handleChange}
              controlId="genero_id"
              label="Género"
            />

            <SelectComponent
              endpoint={`${endpoint}/grupo_prioritario`}
              nameField="descripcion"
              valueField="id"
              selectedValue={formData.grupo_prioritario_id}
              handleChange={handleChange}
              controlId="grupo_prioritario_id"
              label="Grupo Prioritario"
            />

            <Form.Group controlId="direccion">
              <Form.Label>Dirección</Form.Label>
              <Form.Control
                as="textarea"
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
              />
            </Form.Group>

            <SelectComponent
              endpoint={`${endpoint}/estado`}
              nameField="descripcion"
              valueField="id"
              selectedValue={formData.estado_id}
              handleChange={handleChange}
              controlId="estado_id"
              label="Estado"
            />

            <Form.Group controlId="direccion_email">
              <Form.Label>Dirección Email</Form.Label>
              <Form.Control
                type="email"
                name="direccion_email"
                value={formData.direccion_email}
                onChange={handleChange}
              />
            </Form.Group>

            <SelectComponent
              endpoint={`${endpoint}/procedencia`}
              nameField="descripcion"
              valueField="id"
              selectedValue={formData.procedencia_id}
              handleChange={handleChange}
              controlId="procedencia_id"
              label="Procedencia"
            />

            <Form.Group controlId="telefono_casa">
              <Form.Label>Teléfono de Casa</Form.Label>
              <Form.Control
                type="text"
                name="telefono_casa"
                value={formData.telefono_casa}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group controlId="telefono_celular">
              <Form.Label>Teléfono Celular</Form.Label>
              <Form.Control
                type="text"
                name="telefono_celular"
                value={formData.telefono_celular}
                onChange={handleChange}
              />
            </Form.Group>

            <SelectComponent
              endpoint={`${endpoint}/nivel_instruccion`}
              nameField="descripcion"
              valueField="id"
              selectedValue={formData.nivel_instruccion_id}
              handleChange={handleChange}
              controlId="nivel_instruccion_id"
              label="Nivel de Instrucción"
            />
          </div>
          <div className="col-md-6">
            <h2>Información de Inscripción</h2>
            <SelectComponent
              endpoint={`${endpoint}/como_entero_superatec`}
              nameField="descripcion"
              valueField="id"
              selectedValue={formData.informacion_inscripcion?.como_entero_superatec_id}
              handleChange={handleChange}
              controlId="informacion_inscripcion.como_entero_superatec_id"
              name="informacion_inscripcion.como_entero_superatec_id"
              label="¿Cómo se enteró de SUPERATEC?"
            />

            <SelectComponent
              endpoint={`${endpoint}/cohorte`}
              nameField="descripcion"
              valueField="id"
              selectedValue={formData.informacion_inscripcion?.cohorte_id}
              handleChange={handleChange}
              controlId="informacion_inscripcion.cohorte_id"
              label="Cohorte"
              name="informacion_inscripcion.cohorte_id"
            />

            <SelectComponent
              endpoint={`${endpoint}/centro`}
              nameField="descripcion"
              valueField="id"
              selectedValue={formData.informacion_inscripcion.centro_id}
              handleChange={handleChange}
              controlId="informacion_inscripcion.centro_id"
              name="informacion_inscripcion.centro_id"
              label="Centro"
            />

            <SelectComponent
              endpoint={`${endpoint}/periodo`}
              nameField="descripcion"
              valueField="id"
              selectedValue={formData.informacion_inscripcion.periodo_id}
              handleChange={handleChange}
              controlId="informacion_inscripcion.periodo_id"
              name="informacion_inscripcion.periodo_id"
              label="Periodo"
            />

            <SelectComponent
              endpoint={`${endpoint}/area`}
              nameField="descripcion"
              valueField="id"
              selectedValue={formData.informacion_inscripcion.area_id}
              handleChange={handleChange}
              controlId="informacion_inscripcion.area_id"
              name="informacion_inscripcion.area_id"
              label="Área"
            />

            <SelectComponent
              endpoint={`${endpoint}/unidad`}
              nameField="descripcion"
              valueField="id"
              selectedValue={formData.informacion_inscripcion.unidad_id}
              handleChange={handleChange}
              controlId="informacion_inscripcion.unidad_id"
              name="informacion_inscripcion.unidad_id"
              label="Unidad"
            />

            <SelectComponent
              endpoint={`${endpoint}/modalidad`}
              nameField="descripcion"
              valueField="id"
              selectedValue={formData.informacion_inscripcion.modalidad_id}
              handleChange={handleChange}
              controlId="informacion_inscripcion.modalidad_id"
              name="informacion_inscripcion.modalidad_id"
              label="Modalidad"
            />

            <SelectComponent
              endpoint={`${endpoint}/nivel`}
              nameField="descripcion"
              valueField="id"
              selectedValue={formData.informacion_inscripcion.nivel_id}
              handleChange={handleChange}
              controlId="informacion_inscripcion.nivel_id"
              name="informacion_inscripcion.nivel_id"
              label="Nivel"
            />

            <SelectComponent
              endpoint={`${endpoint}/tipo_programa`}
              nameField="descripcion"
              valueField="id"
              selectedValue={formData.informacion_inscripcion.tipo_programa_id}
              handleChange={handleChange}
              controlId="informacion_inscripcion.tipo_programa_id"
              name="informacion_inscripcion.tipo_programa_id"
              label="Tipo de Programa"
            />

            <Form.Group controlId="realiza_aporte">
              <Form.Check
                type="checkbox"
                name="informacion_inscripcion.realiza_aporte"
                label="Realiza Aporte"
                checked={formData.informacion_inscripcion.realiza_aporte}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group controlId="es_patrocinado">
              <Form.Check
                type="checkbox"
                name="informacion_inscripcion.es_patrocinado"
                label="Es Patrocinado"
                checked={formData.informacion_inscripcion.es_patrocinado}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group controlId="grupo">
              <Form.Label>Grupo</Form.Label>
              <Form.Control
                type="text"
                name="informacion_inscripcion.grupo"
                value={formData.informacion_inscripcion.grupo}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group controlId="observaciones">
              <Form.Label>Observaciones</Form.Label>
              <Form.Control
                as="textarea"
                name="informacion_inscripcion.observaciones"
                value={formData.informacion_inscripcion.observaciones}
                onChange={handleChange}
              />
            </Form.Group>
          </div>
        </div>

        <Button variant="success" type="submit">
          Guardar
        </Button>
        <Button 
          variant="secondary" 
          onClick={() => navigate('/datos')}
          className="ms-2"
        >
          Volver
        </Button>
      </Form>
    </div>
  );
};

export default EditDatos;
