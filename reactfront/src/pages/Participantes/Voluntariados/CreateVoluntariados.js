import React, { useState } from 'react';
import axios from 'axios';
import { Form, Button,Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import SelectComponent from '../../../components/SelectComponent';
import './CreateVoluntariados.css';
import { toast } from 'react-toastify';

const endpoint = 'http://localhost:8000/api';

const CreateVoluntariados = () => {
  const [cedulaError, setCedulaError] = useState(''); // Estado para almacenar el mensaje de validación
  const [isCedulaValid, setIsCedulaValid] = useState(false);
  const [formData, setFormData] = useState({
    cedula_identidad: '',
    nombres: '',
    apellidos: '',
    fecha_nacimiento: '',
    direccion: '',
    email: '',
    telefono_casa: '',
    telefono_celular: '',
    genero_id: '',
    nivel_instruccion_id: '',
    procedencia_id: '',
    como_entero_superatec_id: '',
    tipo_voluntariado_id: '',
    area_voluntariado_id: '',
    centro_id: '',
    actividades_realizar: '',
    turno_id: '',
    fecha_inicio: '',
    horas_totales: ''
  });

  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;

    if (name === 'cedula_identidad') {
      // Permitir solo números y agregar prefijo "V-"
      const numericValue = value.replace(/\D/g, ''); // Eliminar todo lo que no sea un número
      setFormData(prevState => ({
        ...prevState,
        [name]: numericValue,
      }));
    } else {
      setFormData(prevState => ({
        ...prevState,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${endpoint}/voluntariados`, formData,{headers: {
        Authorization: `Bearer ${token}`,
    }});
      toast.success('Voluntariado creado con Éxito');
      navigate('/voluntariados');
    } catch (error) {
      toast.error('Error al crear Voluntariado');
      console.error('Error creating data:', error);
    }
  };

  const handleBlur = async () => {
    if (formData.cedula_identidad) {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${endpoint}/datos/${formData.cedula_identidad}`,{headers: {
          Authorization: `Bearer ${token}`,
      }});
        // Si la cédula está registrada, mostramos el error y no es válida
        setCedulaError('La cédula ya está registrada.');
        setIsCedulaValid(false);
      } catch (error) {
        if (error.response && error.response.status === 404) {
          // La cédula no está registrada, por lo que es válida
          setCedulaError('');
          setIsCedulaValid(true);
        } else {
          console.error('Error checking cedula:', error);
          setCedulaError('Error verificando la cédula.');
          setIsCedulaValid(false);
        }
      }
    }
  };

  return (
    <div className="container">
      <meta name="csrf-token" content="{{ csrf_token() }}" />
      <h1>Agregar Nuevo Voluntario</h1>
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
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="V-123321123"
                maxLength={10}
                required
                className={cedulaError ? 'is-invalid' : isCedulaValid ? 'is-valid' : ''}
              />
              {cedulaError && <Alert variant="danger">{cedulaError}</Alert>}
              {!cedulaError && isCedulaValid && (
                <Form.Control.Feedback type="valid">
                  Cédula disponible.
                </Form.Control.Feedback>
              )}
            </Form.Group>

            <Form.Group controlId="nombres">
              <Form.Label>Nombres</Form.Label>
              <Form.Control
                type="text"
                name="nombres"
                value={formData.nombres}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group controlId="apellidos">
              <Form.Label>Apellidos</Form.Label>
              <Form.Control
                type="text"
                name="apellidos"
                value={formData.apellidos}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group controlId="fecha_nacimiento">
              <Form.Label>Fecha de Nacimiento</Form.Label>
              <Form.Control
                type="date"
                name="fecha_nacimiento"
                value={formData.fecha_nacimiento}
                onChange={handleChange}
                required
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

            <Form.Group controlId="direccion">
              <Form.Label>Dirección</Form.Label>
              <Form.Control
                as="textarea"
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group controlId="email">
              <Form.Label>Dirección Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </Form.Group>

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

            <SelectComponent
              endpoint={`${endpoint}/procedencia`}
              nameField="descripcion"
              valueField="id"
              selectedValue={formData.procedencia_id}
              handleChange={handleChange}
              controlId="procedencia_id"
              label="Procedencia"
            />
            <SelectComponent
              endpoint={`${endpoint}/como_entero_superatec`}
              nameField="descripcion"
              valueField="id"
              selectedValue={formData.como_entero_superatec_id}
              handleChange={handleChange}
              controlId="como_entero_superatec_id"
              label="¿Cómo se enteró de SUPERATEC?"
            />
          </div>

          <div className="col-md-6">
            <h2>Información del Voluntariado</h2>
            
            

            <SelectComponent
              endpoint={`${endpoint}/tipo_voluntariado`}
              nameField="descripcion"
              valueField="id"
              selectedValue={formData.tipo_voluntariado_id}
              handleChange={handleChange}
              controlId="tipo_voluntariado_id"
              label="Tipo de Voluntariado"
            />

            <SelectComponent
              endpoint={`${endpoint}/area`}
              nameField="descripcion"
              valueField="id"
              selectedValue={formData.area_voluntariado_id}
              handleChange={handleChange}
              controlId="area_voluntariado_id"
              label="Área de Voluntariado"
            />

            <SelectComponent
              endpoint={`${endpoint}/centro`}
              nameField="descripcion"
              valueField="id"
              selectedValue={formData.centro_id}
              handleChange={handleChange}
              controlId="centro_id"
              label="Centro"
            />

            <Form.Group controlId="actividades_realizar">
              <Form.Label>Actividades a Realizar</Form.Label>
              <Form.Control
                as="textarea"
                name="actividades_realizar"
                value={formData.actividades_realizar}
                onChange={handleChange}
              />
            </Form.Group>

            <SelectComponent
              endpoint={`${endpoint}/turnos`}
              nameField="descripcion"
              valueField="id"
              selectedValue={formData.turno_id}
              handleChange={handleChange}
              controlId="turno_id"
              label="Turnos"
            />

            <Form.Group controlId="fecha_inicio">
              <Form.Label>Fecha de Inicio</Form.Label>
              <Form.Control
                type="date"
                name="fecha_inicio"
                value={formData.fecha_inicio}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group controlId="horas_totales">
              <Form.Label>Horas Totales</Form.Label>
              <Form.Control
                type="number"
                name="horas_totales"
                value={formData.horas_totales}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </div>
        </div>

        <Button variant="success" type="submit">
          Guardar
        </Button>
        <Button 
          variant="secondary" 
          onClick={() => navigate('/voluntariados')}
          className="ms-2"
        >
          Volver
        </Button>
      </Form>
    </div>
  );
};

export default CreateVoluntariados;
