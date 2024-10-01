import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Button, Alert } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';

const userId = parseInt(localStorage.getItem('user'));  // ID del usuario logueado
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
  const [inscripcionCursoId, setInscripcionCursoId] = useState(null);  // ID de la inscripción del curso
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false); // Estado de bloqueo
  const [canceladoError, setCanceladoError] = useState('');  // Para manejo de errores en monto cancelado
  const [exoneradoError, setExoneradoError] = useState('');  // Para manejo de errores en monto exonerado
  const navigate = useNavigate();

  useEffect(() => {
    fetchTasaBcv();
    fetchCursoInfo();
    fetchInscripcionCurso();  // Llamamos a la función para obtener la inscripción del curso
  }, [cursoId]);

  // Obtener la tasa BCV
  const fetchTasaBcv = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${endpoint}/tasa_bcv`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasaBcv(response.data.tasa);
      setFormData((prevState) => ({
        ...prevState,
        tasa_bcv_id: response.data.id,
      }));
    } catch (error) {
      console.error('Error fetching tasa:', error);
    }
  };

  // Obtener información del curso
  const fetchCursoInfo = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${endpoint}/ultimo_pago/${cursoId}/${cedula}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const ultimoPago = response.data;

      const montoTotal = ultimoPago ? parseFloat(ultimoPago.monto_restante) : 0; // Asume 0 si no hay último pago
      setFormData((prevState) => ({
        ...prevState,
        monto_total: montoTotal,
        monto_restante: montoTotal,
        conversion_total: calcularConversion(montoTotal),
      }));
    } catch (error) {
      console.error('Error fetching curso info:', error);
      setError('Error al obtener la información del curso');
    }
  };

  // Obtener la inscripción del curso usando paginación
  const fetchInscripcionCurso = async () => {
    try {
      const token = localStorage.getItem('token');
      let allInscripciones = [];
      let currentPage = 1;
      let totalPages = 1;

      while (currentPage <= totalPages) {
        const response = await axios.get(`${endpoint}/cursos_inscripcion`, {
          params: { inscripcion_curso_id: cursoId, page: currentPage },
          headers: { Authorization: `Bearer ${token}` },
        });

        allInscripciones = [...allInscripciones, ...response.data.data];
        totalPages = response.data.last_page;
        currentPage++;
      }

      // Filtramos la inscripción por cursoId
      const inscripcion = allInscripciones.find(
        (inscripcion) => inscripcion.id === parseInt(cursoId, 10)
      );

      if (inscripcion) {
        setInscripcionCursoId(inscripcion.curso_id);  // Guardamos el ID de la inscripción
      } else {
        throw new Error('No se encontró la inscripción para el curso');
      }
    } catch (error) {
      console.error('Error fetching inscripcion del curso:', error);
      setError('Error obteniendo la inscripción del curso');
    }
  };

  // Manejar cambios en los montos y validar errores
  const handleMontoChange = (event) => {
    const { name, value } = event.target;
    const inputValue = parseFloat(value) || 0;

    setCanceladoError('');
    setExoneradoError('');

    let cancelado = name === 'monto_cancelado' ? inputValue : parseFloat(formData.monto_cancelado) || 0;
    let exonerado = name === 'monto_exonerado' ? inputValue : parseFloat(formData.monto_exonerado) || 0;

    const montoRestante = parseFloat(formData.monto_total) - cancelado - exonerado;

    // Validar si el monto restante es menor a 0
    if (montoRestante < 0) {
      if (name === 'monto_cancelado') {
        setCanceladoError('El monto cancelado más el exonerado no pueden exceder el monto restante.');
      } else {
        setExoneradoError('El monto cancelado más el exonerado no pueden exceder el monto restante.');
      }
    }

    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
      monto_restante: montoRestante > 0 ? montoRestante.toFixed(2) : '0.00',
      conversion_restante: calcularConversion(montoRestante),
      conversion_cancelado: calcularConversion(cancelado),
      conversion_exonerado: calcularConversion(exonerado)
    }));
  };

 // Enviar formulario y crear el pago
const handleSubmit = async (e) => {
  e.preventDefault();
  if (isSubmitting) return;

  setIsSubmitting(true);
  try {
    const token = localStorage.getItem('token');

    // Crear el pago
    await axios.post(`${endpoint}/pagos`, { 
      ...formData, 
      cedula_identidad: cedula, 
      conversion_total: calcularConversion(formData.monto_total) 
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const montoRestante = parseFloat(formData.monto_restante);

    // Actualizar inscripcion_cursos según el monto restante
    if (montoRestante === 0) {
      // Si el monto restante es 0, actualizar status_pay a 3
      console.log(cursoId);
      await axios.put(`${endpoint}/inscripcion_cursos/update_status`, {
        cedula_identidad: cedula,
        curso_id: inscripcionCursoId,
        status_pay: 3
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Buscar todas las peticiones paginadas y actualizar la petición correspondiente
      let allPeticiones = [];
      let currentPage = 1;
      let totalPages = 1;

      while (currentPage <= totalPages) {
        const peticionesResponse = await axios.get(`${endpoint}/peticiones?page=${currentPage}`, {
          params: {
            key: formData.inscripcion_curso_id, // Usamos `inscripcion_curso_id`
            zona_id: 3,
            status: false
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        allPeticiones = [...allPeticiones, ...peticionesResponse.data.data];
        totalPages = peticionesResponse.data.last_page;
        currentPage++;
      }

      const peticionesFiltradas = allPeticiones.filter(
        peticion => peticion.key === formData.inscripcion_curso_id && peticion.zona_id === 3 && peticion.status === false
      );

      if (peticionesFiltradas.length > 0) {
        const peticion = peticionesFiltradas[0]; // Tomar la primera petición coincidente
        await axios.put(`${endpoint}/peticiones/${peticion.id}`, {
          status: true,
          finish_time: new Date().toLocaleString('es-ES', { timeZone: 'America/Caracas' }),
          user_success: userId,
        }, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }

    } else if (montoRestante > 0 && montoRestante < parseFloat(formData.monto_total)) {
      // Si el monto restante es mayor que 0 pero menor que el monto total, actualizar el status_pay
      await axios.put(`${endpoint}/inscripcion_cursos/update_status`, {
        cedula_identidad: cedula,
        curso_id: inscripcionCursoId,
        status_pay: 2 // status pago en proceso
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Agregar lógica para actualizar el comentario de peticiones a "Pagos Faltantes"
      let allPeticiones = [];
      let currentPage = 1;
      let totalPages = 1;

      while (currentPage <= totalPages) {
        const peticionesResponse = await axios.get(`${endpoint}/peticiones?page=${currentPage}`, {
          params: {
            key: formData.inscripcion_curso_id,
            zona_id: 3,
            status: false
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        allPeticiones = [...allPeticiones, ...peticionesResponse.data.data];
        totalPages = peticionesResponse.data.last_page;
        currentPage++;
      }

      const peticionesFiltradas = allPeticiones.filter(
        peticion => peticion.key === formData.inscripcion_curso_id && peticion.zona_id === 3 && peticion.status === false
      );

      if (peticionesFiltradas.length > 0) {
        const peticion = peticionesFiltradas[0]; // Tomar la primera petición coincidente
        await axios.put(`${endpoint}/peticiones/${peticion.id}`, {
          comentario: "Pagos Faltantes", // Actualizar el comentario
        }, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
    }

    toast.success('Reporte de pago creado con Éxito');
    navigate('/pagos');
  } catch (error) {
    toast.error('Reporte de pago fallido');
    console.error('Error creando el pago:', error);
  } finally {
    setIsSubmitting(false);
  }
};


  // Calcular conversión a BsF
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
            className={canceladoError ? 'is-invalid' : ''}
            required
          />
          {canceladoError && <Alert variant="danger">{canceladoError}</Alert>}
          <Form.Text className="text-muted">Conversión: {calcularConversion(formData.monto_cancelado)} BsF</Form.Text>
        </Form.Group>
        <Form.Group controlId="monto_exonerado">
          <Form.Label>Monto Exonerado</Form.Label>
          <Form.Control
            type="number"
            name="monto_exonerado"
            value={formData.monto_exonerado}
            onChange={handleMontoChange}
            className={exoneradoError ? 'is-invalid' : ''}
            required
          />
          {exoneradoError && <Alert variant="danger">{exoneradoError}</Alert>}
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
        <Button variant="success" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Registrando...' : 'Registrar Pago'}
        </Button>
        <Button variant="secondary" onClick={() => navigate('/datos')} className="ms-2">
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
