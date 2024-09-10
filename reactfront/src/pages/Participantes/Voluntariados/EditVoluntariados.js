import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Button } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import SelectComponent from '../../../components/SelectComponent';
import './EditVoluntariados.css';
import { useLoading } from '../../../components/LoadingContext';	
import { toast } from 'react-toastify';

const endpoint = 'http://localhost:8000/api';

const EditVoluntariados = () => {
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
    informacion_voluntariados: {
      tipo_voluntariado_id: '',
      area_voluntariado_id: '',
      centro_id: '',
      actividades_realizar: '',
      turno_id: '',
      fecha_inicio: '',
      horas_totales: '',
    },
  });

  const navigate = useNavigate();
  const { id } = useParams();
  const { setLoading } = useLoading();


  useEffect(() => {
    const fetchData = async () => {
      try { 
        setLoading(true);
        let relationsArray = [
          'nacionalidad',
          'estado',
          'procedencia',
          'genero',
          'NivelInstruccion',
          'informacionVoluntariados.TipoVoluntariado',
          'informacionVoluntariados.area',
          'informacionVoluntariados.centro',
          'informacionVoluntariados.turnos',
        ];
        const relations = relationsArray.join(',');
        const token = localStorage.getItem('token');
        const response = await axios.get(`${endpoint}/voluntariados/${id}?with=${relations}`,{headers: {
          Authorization: `Bearer ${token}`,
      },});
        console.log(response.data);

        setFormData({
          ...response.data,
          informacion_voluntariados: response.data.informacion_voluntariados || {
            tipo_voluntariado_id: '',
            area_voluntariado_id: '',
            centro_id: '',
            actividades_realizar: '',
            turno_id: '',
            fecha_inicio: '',
            horas_totales: '',
          },
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      }setLoading(false);
    };

    fetchData();
  }, [id]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    const keys = name.split('.');

    if (keys.length > 1) {
      setFormData(prevState => ({
        ...prevState,
        informacion_voluntariados: {
          ...prevState.informacion_voluntariados,
          [keys[1]]: value,
        },
      }));
    } else {
      setFormData(prevState => ({
        ...prevState,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${endpoint}/voluntariados/${id}`, formData,{headers: {
        Authorization: `Bearer ${token}`,
    },});
      toast.success('Actualización con Éxito');
      navigate('/voluntariados');
    } catch (error) {
      toast.error('Error al actualizar Voluntariado');
      console.error('Error updating data:', error);
    }
  };

  return (
    <div className="container">
      <meta name="csrf-token" content="{{ csrf_token() }}" />
      <h1>Actualizar Datos del Voluntario</h1>
      <Form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-md-6">
            <Form.Group controlId="cedula_identidad">
              <Form.Label>Cédula de Identidad</Form.Label>
              <Form.Control
                type="text"
                name="cedula_identidad"
                value={formData.cedula_identidad}
                onChange={handleChange}
                required
              />
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
              selectedValue={formData.informacion_voluntariados.tipo_voluntariado_id}
              handleChange={handleChange}
              controlId="informacion_voluntariados.tipo_voluntariado_id"
              name="informacion_voluntariados.tipo_voluntariado_id"
              label="Tipo de Voluntariado"
            />

            <SelectComponent
              endpoint={`${endpoint}/area`}
              nameField="descripcion"
              valueField="id"
              selectedValue={formData.informacion_voluntariados.area_voluntariado_id}
              handleChange={handleChange}
              controlId="informacion_voluntariados.area_voluntariado_id"
              name="informacion_voluntariados.area_voluntariado_id"
              label="Área de Voluntariado"
            />

            <SelectComponent
              endpoint={`${endpoint}/centro`}
              nameField="descripcion"
              valueField="id"
              selectedValue={formData.informacion_voluntariados.centro_id}
              handleChange={handleChange}
              controlId="informacion_voluntariados.centro_id"
              name="informacion_voluntariados.centro_id"
              label="Centro"
            />

            <Form.Group controlId="informacion_voluntariados.actividades_realizar">
              <Form.Label>Actividades a Realizar</Form.Label>
              <Form.Control
                as="textarea"
                name="informacion_voluntariados.actividades_realizar"
                value={formData.informacion_voluntariados.actividades_realizar}
                onChange={handleChange}
              />
            </Form.Group>

            <SelectComponent
              endpoint={`${endpoint}/turnos`}
              nameField="descripcion"
              valueField="id"
              selectedValue={formData.informacion_voluntariados.turno_id}
              handleChange={handleChange}
              controlId="informacion_voluntariados.turno_id"
              name="informacion_voluntariados.turno_id"
              label="Turno"
            />

            <Form.Group controlId="informacion_voluntariados.fecha_inicio">
              <Form.Label>Fecha de Inicio</Form.Label>
              <Form.Control
                type="date"
                name="informacion_voluntariados.fecha_inicio"
                value={formData.informacion_voluntariados.fecha_inicio}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group controlId="informacion_voluntariados.horas_totales">
              <Form.Label>Horas Totales</Form.Label>
              <Form.Control
                type="number"
                name="informacion_voluntariados.horas_totales"
                value={formData.informacion_voluntariados.horas_totales}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </div>
        </div>

        <Button variant="primary" type="submit">
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

export default EditVoluntariados;
