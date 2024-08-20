import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import SelectComponent from '../../components/SelectComponent';
import './CreateDatos.css';
import { useLoading } from '../../components/LoadingContext';
import { ToastContainer, toast } from 'react-toastify';

const endpoint = 'http://localhost:8000/api';

const CreateDatos = () => {
  const [cedulaError, setCedulaError] = useState(''); 
  const [isCedulaValid, setIsCedulaValid] = useState(false);

  const { setLoading } = useLoading();
  const [formData, setFormData] = useState({
    cedula_identidad: '',
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
  });

  const navigate = useNavigate();

  // useEffect(() => {
  //   const fetchSelectData = async () => {
  //     setLoading(true);
  //     try {
  //       const token = localStorage.getItem('token'); 

  //       await Promise.all([
  //         axios.get(`${endpoint}/status_seleccion`, { headers: { Authorization: `Bearer ${token}` } }),
  //         axios.get(`${endpoint}/nacionalidad_seleccion`, { headers: { Authorization: `Bearer ${token}` } }),
  //         axios.get(`${endpoint}/genero`, { headers: { Authorization: `Bearer ${token}` } }),
  //         axios.get(`${endpoint}/grupo_prioritario`, { headers: { Authorization: `Bearer ${token}` } }),
  //         axios.get(`${endpoint}/estado`, { headers: { Authorization: `Bearer ${token}` } }),
  //         axios.get(`${endpoint}/procedencia`, { headers: { Authorization: `Bearer ${token}` } }),
  //         axios.get(`${endpoint}/nivel_instruccion`, { headers: { Authorization: `Bearer ${token}` } }),
  //         axios.get(`${endpoint}/como_entero_superatec`, { headers: { Authorization: `Bearer ${token}` } }),
  //         axios.get(`${endpoint}/cohorte`, { headers: { Authorization: `Bearer ${token}` } }),
  //         axios.get(`${endpoint}/centro`, { headers: { Authorization: `Bearer ${token}` } }),
  //         axios.get(`${endpoint}/periodo`, { headers: { Authorization: `Bearer ${token}` } }),
  //         axios.get(`${endpoint}/area`, { headers: { Authorization: `Bearer ${token}` } }),
  //         axios.get(`${endpoint}/unidad`, { headers: { Authorization: `Bearer ${token}` } }),
  //         axios.get(`${endpoint}/modalidad`, { headers: { Authorization: `Bearer ${token}` } }),
  //         axios.get(`${endpoint}/nivel`, { headers: { Authorization: `Bearer ${token}` } }),
  //         axios.get(`${endpoint}/tipo_programa`, { headers: { Authorization: `Bearer ${token}` } }),
  //       ]);
  //     } catch (error) {
  //       console.error('Error fetching select data:', error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchSelectData();
  // }, [setLoading]);

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

  const handleSubmit = async (e, redirectToCursos) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token'); 

      await axios.post(`${endpoint}/datos`, formData, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
      });
      toast.success('Nuevo Participante agregado con Éxito');
      if (redirectToCursos) {
        navigate(`/inscribir-cursos/${formData.cedula_identidad}`);
      } else {
        navigate('/datos');
      }
    } catch (error) {
      toast.error('Error al crear Participante');
      console.error('Error creating data:', error);
    } 
  };

  const handleBlur = async () => {
    if (formData.cedula_identidad) {
      try {
        const token = localStorage.getItem('token'); 

        const response = await axios.get(`${endpoint}/datos/${formData.cedula_identidad}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setCedulaError('La cédula ya está registrada.');
        setIsCedulaValid(false);
      } catch (error) {
        if (error.response && error.response.status === 404) {
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
      <h1>Agregar Nuevo Participante</h1>
      <Form onSubmit={(e) => handleSubmit(e, false)}>
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
                maxLength={20}
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
                maxLength={20}
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

            <Form.Group controlId="edad">
              <Form.Label>Edad</Form.Label>
              <Form.Control
                type="number"
                name="edad"
                value={formData.edad}
                onChange={handleChange}
                required
                maxLength={2}
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
                maxLength={20}
                required
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
                required
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
                maxLength={10}
              />
            </Form.Group>

            <Form.Group controlId="telefono_celular">
              <Form.Label>Teléfono Celular</Form.Label>
              <Form.Control
                type="text"
                name="telefono_celular"
                value={formData.telefono_celular}
                onChange={handleChange}
                maxLength={10}
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
              selectedValue={formData.como_entero_superatec_id}
              handleChange={handleChange}
              controlId="como_entero_superatec_id"
              label="¿Cómo se enteró de SUPERATEC?"
            />

            <SelectComponent
              endpoint={`${endpoint}/cohorte`}
              nameField="descripcion"
              valueField="id"
              selectedValue={formData.cohorte_id}
              handleChange={handleChange}
              controlId="cohorte_id"
              label="Cohorte"
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

            <SelectComponent
              endpoint={`${endpoint}/periodo`}
              nameField="descripcion"
              valueField="id"
              selectedValue={formData.periodo_id}
              handleChange={handleChange}
              controlId="periodo_id"
              label="Periodo"
            />

            <SelectComponent
              endpoint={`${endpoint}/area`}
              nameField="descripcion"
              valueField="id"
              selectedValue={formData.area_id}
              handleChange={handleChange}
              controlId="area_id"
              label="Área"
            />

            <SelectComponent
              endpoint={`${endpoint}/unidad`}
              nameField="descripcion"
              valueField="id"
              selectedValue={formData.unidad_id}
              handleChange={handleChange}
              controlId="unidad_id"
              label="Unidad"
            />

            <SelectComponent
              endpoint={`${endpoint}/modalidad`}
              nameField="descripcion"
              valueField="id"
              selectedValue={formData.modalidad_id}
              handleChange={handleChange}
              controlId="modalidad_id"
              label="Modalidad"
            />

            <SelectComponent
              endpoint={`${endpoint}/nivel`}
              nameField="descripcion"
              valueField="id"
              selectedValue={formData.nivel_id}
              handleChange={handleChange}
              controlId="nivel_id"
              label="Nivel"
            />

            <SelectComponent
              endpoint={`${endpoint}/tipo_programa`}
              nameField="descripcion"
              valueField="id"
              selectedValue={formData.tipo_programa_id}
              handleChange={handleChange}
              controlId="tipo_programa_id"
              label="Tipo de Programa"
            />

            <Form.Group controlId="realiza_aporte">
              <Form.Check
                type="checkbox"
                name="realiza_aporte"
                label="Realiza Aporte"
                checked={formData.realiza_aporte}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group controlId="es_patrocinado">
              <Form.Check
                type="checkbox"
                name="es_patrocinado"
                label="Es Patrocinado"
                checked={formData.es_patrocinado}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group controlId="grupo">
              <Form.Label>Grupo</Form.Label>
              <Form.Control
                type="text"
                name="grupo"
                value={formData.grupo}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group controlId="observaciones">
              <Form.Label>Observaciones</Form.Label>
              <Form.Control
                as="textarea"
                name="observaciones"
                value={formData.observaciones}
                onChange={handleChange}
              />
            </Form.Group>
          </div>
        </div>

        <Button variant="primary" type="submit">
          Guardar
        </Button>

        <Button 
          variant="secondary" 
          onClick={() => navigate('/datos')}
          className="ms-2"
        >
          Volver
        </Button>

        <Button 
          variant="success" 
          onClick={(e) => handleSubmit(e, true)}
          className="ms-2"
        >
          Siguiente
        </Button>
        
      </Form>
      
    </div>
  );
};

export default CreateDatos;
