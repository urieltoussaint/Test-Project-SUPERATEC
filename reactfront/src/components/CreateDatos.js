import React, { useState, useEffect } from 'react';

import axios from '../axiosConfig';
import { Form, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';


const endpoint = 'http://localhost:8000/api';

const CreateDatos = () => {
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

  const [options, setOptions] = useState({
    statusSeleccion: [],
    nacionalidades: [],
    generos: [],
    gruposPrioritarios: [],
    estados: [],
    procedencias: [],
    nivelesInstruccion: [],
    comoEnteroSuperatec: [],
    cohortes: [],
    centros: [],
    periodos: [],
    areas: [],
    unidades: [],
    modalidades: [],
    niveles: [],
    tiposPrograma: [],
  });

  const navigate = useNavigate();

  useEffect(() => {
    getOptions();
  }, []);

  const getOptions = async () => {
    try {
      const response = await axios.get(`${endpoint}/formulario/create`);
      setOptions(response.data);
    } catch (error) {
      console.error('Error fetching options:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${endpoint}/datos`, formData);
      navigate('/datos');
    } catch (error) {
      console.error('Error creating data:', error);
    }
  };
    
  return (
    
    <div>
      <meta name="csrf-token" content="{{ csrf_token() }}"></meta>
      <h1>Agregar Nuevo Registro</h1>
      <Form onSubmit={handleSubmit}>
        <script src="{{ mix('js/app.js') }}"></script>
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
        <Form.Group controlId="status_seleccion_id">
          <Form.Label>Status Selección</Form.Label>
          <Form.Control
            as="select"
            name="status_seleccion_id"
            value={formData.status_seleccion_id}
            onChange={handleChange}
            required
          >
            <option value="">Seleccione</option>
            {options.statusSeleccion.map((status) => (
              <option key={status.id} value={status.id}>
                {status.descripcion}
              </option>
            ))}
          </Form.Control>
        </Form.Group>
        <Form.Group controlId="nacionalidad_id">
          <Form.Label>Nacionalidad</Form.Label>
          <Form.Control
            as="select"
            name="nacionalidad_id"
            value={formData.nacionalidad_id}
            onChange={handleChange}
            required
          >
            <option value="">Seleccione</option>
            {options.nacionalidades.map((nacionalidad) => (
              <option key={nacionalidad.id} value={nacionalidad.id}>
                {nacionalidad.descripcion}
              </option>
            ))}
          </Form.Control>
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
        <Form.Group controlId="edad">
          <Form.Label>Edad</Form.Label>
          <Form.Control
            type="number"
            name="edad"
            value={formData.edad}
            onChange={handleChange}
            required
          />
        </Form.Group>
        <Form.Group controlId="genero_id">
          <Form.Label>Género</Form.Label>
          <Form.Control
            as="select"
            name="genero_id"
            value={formData.genero_id}
            onChange={handleChange}
            required
          >
            <option value="">Seleccione</option>
            {options.generos.map((genero) => (
              <option key={genero.id} value={genero.id}>
                {genero.descripcion}
              </option>
            ))}
          </Form.Control>
        </Form.Group>
        <Form.Group controlId="grupo_prioritario_id">
          <Form.Label>Grupo Prioritario</Form.Label>
          <Form.Control
            as="select"
            name="grupo_prioritario_id"
            value={formData.grupo_prioritario_id}
            onChange={handleChange}
            required
          >
            <option value="">Seleccione</option>
            {options.gruposPrioritarios.map((grupo) => (
              <option key={grupo.id} value={grupo.id}>
                {grupo.descripcion}
              </option>
            ))}
          </Form.Control>
        </Form.Group>
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
        <Form.Group controlId="estado_id">
          <Form.Label>Estado</Form.Label>
          <Form.Control
            as="select"
            name="estado_id"
            value={formData.estado_id}
            onChange={handleChange}
            required
          >
            <option value="">Seleccione</option>
            {options.estados.map((estado) => (
              <option key={estado.id} value={estado.id}>
                {estado.descripcion}
              </option>
            ))}
          </Form.Control>
        </Form.Group>
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
        <Form.Group controlId="procedencia_id">
          <Form.Label>Procedencia</Form.Label>
          <Form.Control
            as="select"
            name="procedencia_id"
            value={formData.procedencia_id}
            onChange={handleChange}
            required
          >
            <option value="">Seleccione</option>
            {options.procedencias.map((procedencia) => (
              <option key={procedencia.id} value={procedencia.id}>
                {procedencia.descripcion}
              </option>
            ))}
          </Form.Control>
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
        <Form.Group controlId="nivel_instruccion_id">
          <Form.Label>Nivel de Instrucción</Form.Label>
          <Form.Control
            as="select"
            name="nivel_instruccion_id"
            value={formData.nivel_instruccion_id}
            onChange={handleChange}
            required
          >
            <option value="">Seleccione</option>
            {options.nivelesInstruccion.map((nivel) => (
              <option key={nivel.id} value={nivel.id}>
                {nivel.descripcion}
              </option>
            ))}
          </Form.Control>
        </Form.Group>
        <h2>Información de Inscripción</h2>
        <Form.Group controlId="como_entero_superatec_id">
          <Form.Label>¿Cómo se enteró de SUPERATEC?</Form.Label>
          <Form.Control
            as="select"
            name="como_entero_superatec_id"
            value={formData.como_entero_superatec_id}
            onChange={handleChange}
            required
          >
            <option value="">Seleccione</option>
            {options.comoEnteroSuperatec.map((opcion) => (
              <option key={opcion.id} value={opcion.id}>
                {opcion.descripcion}
              </option>
            ))}
          </Form.Control>
        </Form.Group>
        <Form.Group controlId="cohorte_id">
          <Form.Label>Cohorte</Form.Label>
          <Form.Control
            as="select"
            name="cohorte_id"
            value={formData.cohorte_id}
            onChange={handleChange}
            required
          >
            <option value="">Seleccione</option>
            {options.cohortes.map((cohorte) => (
              <option key={cohorte.id} value={cohorte.id}>
                {cohorte.descripcion}
              </option>
            ))}
          </Form.Control>
        </Form.Group>
        <Form.Group controlId="centro_id">
          <Form.Label>Centro</Form.Label>
          <Form.Control
            as="select"
            name="centro_id"
            value={formData.centro_id}
            onChange={handleChange}
            required
          >
            <option value="">Seleccione</option>
            {options.centros.map((centro) => (
              <option key={centro.id} value={centro.id}>
                {centro.descripcion}
              </option>
            ))}
          </Form.Control>
        </Form.Group>
        <Form.Group controlId="periodo_id">
          <Form.Label>Periodo</Form.Label>
          <Form.Control
            as="select"
            name="periodo_id"
            value={formData.periodo_id}
            onChange={handleChange}
            required
          >
            <option value="">Seleccione</option>
            {options.periodos.map((periodo) => (
              <option key={periodo.id} value={periodo.id}>
                {periodo.descripcion}
              </option>
            ))}
          </Form.Control>
        </Form.Group>
        <Form.Group controlId="area_id">
          <Form.Label>Área</Form.Label>
          <Form.Control
            as="select"
            name="area_id"
            value={formData.area_id}
            onChange={handleChange}
            required
          >
            <option value="">Seleccione</option>
            {options.areas.map((area) => (
              <option key={area.id} value={area.id}>
                {area.descripcion}
              </option>
            ))}
          </Form.Control>
        </Form.Group>
        <Form.Group controlId="unidad_id">
          <Form.Label>Unidad</Form.Label>
          <Form.Control
            as="select"
            name="unidad_id"
            value={formData.unidad_id}
            onChange={handleChange}
            required
          >
            <option value="">Seleccione</option>
            {options.unidades.map((unidad) => (
              <option key={unidad.id} value={unidad.id}>
                {unidad.descripcion}
              </option>
            ))}
          </Form.Control>
        </Form.Group>
        <Form.Group controlId="modalidad_id">
          <Form.Label>Modalidad</Form.Label>
          <Form.Control
            as="select"
            name="modalidad_id"
            value={formData.modalidad_id}
            onChange={handleChange}
            required
          >
            <option value="">Seleccione</option>
            {options.modalidades.map((modalidad) => (
              <option key={modalidad.id} value={modalidad.id}>
                {modalidad.descripcion}
              </option>
            ))}
          </Form.Control>
        </Form.Group>
        <Form.Group controlId="nivel_id">
          <Form.Label>Nivel</Form.Label>
          <Form.Control
            as="select"
            name="nivel_id"
            value={formData.nivel_id}
            onChange={handleChange}
            required
          >
            <option value="">Seleccione</option>
            {options.niveles.map((nivel) => (
              <option key={nivel.id} value={nivel.id}>
                {nivel.descripcion}
              </option>
            ))}
          </Form.Control>
        </Form.Group>
        <Form.Group controlId="tipo_programa_id">
          <Form.Label>Tipo de Programa</Form.Label>
          <Form.Control
            as="select"
            name="tipo_programa_id"
            value={formData.tipo_programa_id}
            onChange={handleChange}
            required
          >
            <option value="">Seleccione</option>
            {options.tiposPrograma.map((tipoPrograma) => (
              <option key={tipoPrograma.id} value={tipoPrograma.id}>
                {tipoPrograma.descripcion}
              </option>
            ))}
          </Form.Control>
        </Form.Group>
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
        <Button variant="primary" type="submit">
          Guardar
        </Button>
      </Form>
    </div>
  );
};

export default CreateDatos;
