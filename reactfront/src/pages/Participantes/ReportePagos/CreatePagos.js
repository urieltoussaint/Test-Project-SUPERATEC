import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select/async';

const endpoint = 'http://localhost:8000/api';

const CreatePago = () => {
  const [formData, setFormData] = useState({
    inscripcion_curso_id: '',
    monto_cancelado: '',
    monto_exonerado: '',
    tipo_moneda: 'bsF',
    tasa_bcv_id: '',
    comentario_cuota: '',
    monto_total: '',
    monto_restante: '',
    conversion_total: '',
    conversion_cancelado: '',
    conversion_exonerado: '',
    conversion_restante: ''
  });
  const [cedula, setCedula] = useState('');
  const [cursos, setCursos] = useState([]);
  const [cursoSeleccionado, setCursoSeleccionado] = useState(null);
  const [tasaBcv, setTasaBcv] = useState(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false); // Estado de bloqueo
  const navigate = useNavigate();

  useEffect(() => {
    fetchTasaBcv();
  }, []);

  const fetchTasaBcv = async () => {
    try {
      const response = await axios.get(`${endpoint}/tasa_bcv`);
      setTasaBcv(response.data.tasa);
      setFormData((prevState) => ({
        ...prevState,
        tasa_bcv_id: response.data.id,
      }));
    } catch (error) {
      console.error('Error fetching tasa:', error);
    }
  };

  const fetchOptions = async (inputValue) => {
    try {
      const response = await axios.get(`${endpoint}/cedulas?query=${inputValue}`);
      return response.data.map((cedula) => ({ value: cedula.cedula_identidad, label: cedula.cedula_identidad }));
    } catch (error) {
      console.error('Error fetching cedulas:', error);
      return [];
    }
  };

  const handleCedulaChange = async (selectedOption) => {
    const selectedCedula = selectedOption ? selectedOption.value : '';
    setCedula(selectedCedula);

    if (selectedCedula) {
      try {
        const response = await axios.get(`${endpoint}/cursos_por_cedula/${selectedCedula}`);
        setCursos(response.data);
        setCursoSeleccionado(null);
        setFormData({
          inscripcion_curso_id: '',
          monto_cancelado: '',
          monto_exonerado: '',
          tipo_moneda: 'bsF',
          tasa_bcv_id: formData.tasa_bcv_id, // Preservar tasa_bcv_id
          comentario_cuota: '',
          monto_total: '',
          monto_restante: '',
          conversion_total: '',
          conversion_cancelado: '',
          conversion_exonerado: '',
          conversion_restante: ''
        });
        setError(''); // Clear any previous errors
      } catch (error) {
        console.error('Error fetching cursos:', error);
        setCursos([]);
        setError(error.response.data.error || 'Error fetching cursos');
      }
    } else {
      setCursos([]);
    }
  };

  const handleCursoChange = async (event) => {
    const selectedCursoId = event.target.value;
    const selectedCurso = cursos.find(curso => curso.id === parseInt(selectedCursoId, 10));
    setCursoSeleccionado(selectedCurso);

    try {
      const response = await axios.get(`${endpoint}/ultimo_pago/${selectedCursoId}/${cedula}`);
      const ultimoPago = response.data;

      const montoTotal = ultimoPago ? parseFloat(ultimoPago.monto_restante) : parseFloat(selectedCurso.costo);
      setFormData((prevState) => ({
        ...prevState,
        inscripcion_curso_id: selectedCursoId,
        monto_total: montoTotal,
        monto_restante: montoTotal,
        conversion_total: calcularConversion(montoTotal)
      }));
    } catch (error) {
      console.error('Error fetching ultimo pago:', error);
      setFormData((prevState) => ({
        ...prevState,
        inscripcion_curso_id: selectedCursoId,
        monto_total: parseFloat(selectedCurso.costo),
        monto_restante: parseFloat(selectedCurso.costo),
        conversion_total: calcularConversion(selectedCurso.costo)
      }));
    }
  };

  const handleMontoChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));

    if (name === 'monto_cancelado' || name === 'monto_exonerado') {
      const montoCancelado = name === 'monto_cancelado' ? parseFloat(value) || 0 : parseFloat(formData.monto_cancelado) || 0;
      const montoExonerado = name === 'monto_exonerado' ? parseFloat(value) || 0 : parseFloat(formData.monto_exonerado) || 0;
      const nuevoMontoRestante = cursoSeleccionado ? (parseFloat(formData.monto_total) - montoCancelado - montoExonerado).toFixed(2) : 0;
      setFormData((prevState) => ({
        ...prevState,
        monto_restante: nuevoMontoRestante,
        conversion_restante: calcularConversion(nuevoMontoRestante),
        conversion_cancelado: calcularConversion(montoCancelado),
        conversion_exonerado: calcularConversion(montoExonerado)
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return; // Si ya se está enviando, no hacer nada

    setIsSubmitting(true);
    try {
      await axios.post(`${endpoint}/pagos`, { 
        ...formData, 
        cedula_identidad: cedula, 
        conversion_total: calcularConversion(formData.monto_total) 
      });
      navigate('/pagos');
    } catch (error) {
      console.error('Error creando el pago:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const calcularConversion = (monto) => {
    return tasaBcv ? (monto * tasaBcv).toFixed(2) : 'N/A';
  };

  return (
    <div className="container">
      <h1>Registrar Nuevo Pago</h1>
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="cedula">
          <Form.Label>Cédula de Identidad</Form.Label>
          <Select
            cacheOptions
            loadOptions={fetchOptions}
            onChange={handleCedulaChange}
            placeholder="Escriba la cédula de identidad"
            noOptionsMessage={() => 'No se encontraron cédulas'}
          />
        </Form.Group>
        {error && <div className="alert alert-danger">{error}</div>}
        {cursos.length > 0 && (
          <Form.Group controlId="inscripcion_curso_id">
            <Form.Label>Curso</Form.Label>
            <Form.Control
              as="select"
              name="inscripcion_curso_id"
              value={formData.inscripcion_curso_id}
              onChange={handleCursoChange}
              required
            >
              <option value="">Seleccione</option>
              {cursos.map(curso => (
                <option key={curso.id} value={curso.id}>
                  {curso.descripcion} - Costo: {curso.costo}
                </option>
              ))}
            </Form.Control>
          </Form.Group>
        )}
        {cursoSeleccionado && (
          <>
            <Form.Group controlId="monto_total">
              <Form.Label>Monto Total</Form.Label>
              <Form.Control
                type="text"
                name="monto_total"
                value={formData.monto_total}
                readOnly
              />
              <Form.Text className="text-muted">Conversión: {calcularConversion(formData.monto_total)}BsF</Form.Text>
            </Form.Group>
            <Form.Group controlId="monto_cancelado">
              <Form.Label>Monto Cancelado</Form.Label>
              <Form.Control
                type="number"
                name="monto_cancelado"
                value={formData.monto_cancelado}
                onChange={handleMontoChange}
                required
              />
              <Form.Text className="text-muted">Conversión: {calcularConversion(formData.monto_cancelado)}BsF</Form.Text>
            </Form.Group>
            <Form.Group controlId="monto_exonerado">
              <Form.Label>Monto Exonerado</Form.Label>
              <Form.Control
                type="number"
                name="monto_exonerado"
                value={formData.monto_exonerado}
                onChange={handleMontoChange}
                required
              />
              <Form.Text className="text-muted">Conversión: {calcularConversion(formData.monto_exonerado)}BsF</Form.Text>
            </Form.Group>
            <Form.Group controlId="monto_restante">
              <Form.Label>Monto Restante</Form.Label>
              <Form.Control
                type="text"
                name="monto_restante"
                value={formData.monto_restante}
                readOnly
              />
              <Form.Text className="text-muted">Conversión: {calcularConversion(formData.monto_restante)}BsF</Form.Text>
            </Form.Group>
            <Form.Group controlId="tipo_moneda">
              <Form.Label>Tipo de Moneda</Form.Label>
              <Form.Control
                as="select"
                name="tipo_moneda"
                value={formData.tipo_moneda}
                onChange={handleMontoChange}
                required
              >
                <option value="bsF">bsF</option>
                <option value="$">$</option>
              </Form.Control>
            </Form.Group>
            <Form.Group controlId="comentario_cuota">
              <Form.Label>Comentario Cuota</Form.Label>
              <Form.Control
                as="textarea"
                name="comentario_cuota"
                value={formData.comentario_cuota}
                onChange={handleMontoChange}
              />
            </Form.Group>
          </>
        )}
        <Button variant="primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Registrando...' : 'Registrar Pago'}
        </Button>
        <Button variant="secondary" onClick={() => navigate('/pagos')} className="ms-2">
          Volver
        </Button>
      </Form>
      {tasaBcv && (
        <div className="mt-3">
          <p><strong>Tasa BCV Actual:</strong> {tasaBcv}</p>
        </div>
      )}
    </div>
  );
};

export default CreatePago;
