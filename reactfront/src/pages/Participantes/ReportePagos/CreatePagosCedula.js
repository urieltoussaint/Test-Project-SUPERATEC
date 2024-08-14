import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Button } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';

const endpoint = 'http://localhost:8000/api';

const CreatePagosCedula = () => {
  const { cedula, cursoId } = useParams();  // Obtener cedula y cursoId de la URL
  const [formData, setFormData] = useState({
    inscripcion_curso_id: cursoId,
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
  const [tasaBcv, setTasaBcv] = useState(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false); // Estado de bloqueo
  const navigate = useNavigate();

  useEffect(() => {
    fetchTasaBcv();
    fetchCursoInfo();
  }, [cursoId]);

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

  const fetchCursoInfo = async () => {
    try {
      const response = await axios.get(`${endpoint}/ultimo_pago/${cursoId}/${cedula}`);
      const ultimoPago = response.data;

      const montoTotal = ultimoPago ? parseFloat(ultimoPago.monto_restante) : 0; // Asume 0 si no hay último pago

      setFormData((prevState) => ({
        ...prevState,
        monto_total: montoTotal,
        monto_restante: montoTotal,
        conversion_total: calcularConversion(montoTotal)
      }));
    } catch (error) {
      console.error('Error fetching curso info:', error);
      setError('Error al obtener la información del curso');
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
      const nuevoMontoRestante = parseFloat(formData.monto_total) - montoCancelado - montoExonerado;
      setFormData((prevState) => ({
        ...prevState,
        monto_restante: nuevoMontoRestante.toFixed(2),
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
      setError('Error creando el pago');
    } finally {
      setIsSubmitting(false);
    }
  };

  const calcularConversion = (monto) => {
    return tasaBcv ? (monto * tasaBcv).toFixed(2) : 'N/A';
  };

  return (
    <div className="container">
      <h1>Registrar Nuevo Pago para V{cedula}</h1>
      {error && <div className="alert alert-danger">{error}</div>}
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="monto_total">
          <Form.Label>Monto Total</Form.Label>
          <Form.Control
            type="text"
            name="monto_total"
            value={formData.monto_total}
            readOnly
          />
          <Form.Text className="text-muted">Conversión: {calcularConversion(formData.monto_total)} BsF</Form.Text>
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
          <Form.Text className="text-muted">Conversión: {calcularConversion(formData.monto_cancelado)} BsF</Form.Text>
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
          <Form.Text className="text-muted">Conversión: {calcularConversion(formData.monto_exonerado)} BsF</Form.Text>
        </Form.Group>
        <Form.Group controlId="monto_restante">
          <Form.Label>Monto Restante</Form.Label>
          <Form.Control
            type="text"
            name="monto_restante"
            value={formData.monto_restante}
            readOnly
          />
          <Form.Text className="text-muted">Conversión: {calcularConversion(formData.monto_restante)} BsF</Form.Text>
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

export default CreatePagosCedula;
