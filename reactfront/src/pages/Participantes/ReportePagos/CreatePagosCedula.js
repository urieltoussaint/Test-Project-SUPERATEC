import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Button, Alert } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { Modal } from 'react-bootstrap';
import { Card, Row, Col } from 'react-bootstrap'; 
import moment from 'moment';
import { useLoading } from '../../../components/LoadingContext';




const userId = parseInt(localStorage.getItem('user'));  // ID del usuario logueado
const endpoint = 'http://localhost:8000/api';

const CreatePagosCedula = () => {
  const { cedula, cursoId } = useParams();  // Obtener cedula y cursoId de la URL
  const [formData, setFormData] = useState({
    informacion_inscripcion_id: cursoId,
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
  const [showModal, setShowModal] = useState(false);  // Controlar el modal
  const [modalMessage, setModalMessage] = useState('');  // Mensaje del modal
  const [fechaBcv, setFechaBcv] = useState(null);
  const [cuotas, setCuotas] = useState('');  // Mensaje del modal

  const [curso, setCurso] = useState(null);
  const { setLoading } = useLoading();

  const navigate = useNavigate();

 // Primer useEffect: Obtiene Tasa BCV y datos del curso
useEffect(() => {
  const fetchData = async () => {
    setLoading(true);
    try {
      await fetchTasaBcv(); // Obtener tasa BCV primero
      await fetchInscripcionCurso(); // Esperar a que se complete la inscripción del curso
    } catch (error) {
      console.error('Error durante las peticiones:', error);
      setError('Error al obtener la información');
    } finally {
      setLoading(false); // Desactivar el estado de carga
    }
  };

  fetchData();
}, [cursoId]); // Solo depende de cursoId

// Segundo useEffect: Llama a fetchCursoInfo solo cuando curso esté listo
useEffect(() => {
  if (!curso) return; // Evita ejecutar si curso no está definido
  const fetchCursoData = async () => {
    setLoading(true);
    try {
      await fetchCursoInfo();
    } catch (error) {
      console.error('Error fetching curso info:', error);
      setError('Error al obtener la información del curso');
    } finally {
      setLoading(false);
    }
  };

  fetchCursoData();
}, [curso]); // Se ejecuta solo cuando curso cambia

  
  

  // Obtener la tasa BCV
  const fetchTasaBcv = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${endpoint}/tasa_bcv`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setTasaBcv(response.data.tasa);
      setFechaBcv(response.data.created_at);
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
  
    // Obtenemos pagos y el último pago con la función ya corregida
    const { cantidadPagos, ultimoPago } = await getPagosByCurso(cursoId);
    setCuotas(cantidadPagos);
  
    // Determinamos el monto total dependiendo de si hay pagos previos
    let montoTotal = parseFloat(curso.costo); // Valor original por defecto

    if (cantidadPagos > 0) {
      // Si hay pagos previos, utilizamos el monto restante del último pago
      montoTotal = parseFloat(ultimoPago.monto_restante);
    }
  
    // Determinamos si es la última cuota
    const esUltimaCuota = cantidadPagos + 1 === curso.cuotas;
  
    // Actualizamos el estado del formulario
    setFormData((prevState) => ({
      ...prevState,
      monto_total: montoTotal,  // Actualizamos monto total
      monto_restante: montoTotal, // Aseguramos que el monto restante también se actualice
      conversion_total: calcularConversion(montoTotal),  // Calculamos la conversión
      esUltimaCuota,  // Indicamos si es la última cuota
    }));
  
    // Logs para depuración
    console.log('Curso seleccionado:', curso.cod);
    console.log('Cuotas del curso:', curso.cuotas);
    console.log('Pagos realizados:', cantidadPagos);
    console.log('Último pago:', ultimoPago);
  } catch (error) {
    console.error('Error fetching curso info:', error);
    setError('Error al obtener la información del curso');
  }
};


  const getPagosByCurso = async (cursoId) => {
    try {
      const token = localStorage.getItem('token');
  
      // Realizamos la solicitud para obtener pagos
      const response = await axios.get(`${endpoint}/pagos-inscripcion/${cursoId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      const { cantidadPagos, ultimoPago } = response.data; // Ajustamos según la estructura del backend
  
      // Retornamos los datos directamente
      return { cantidadPagos, ultimoPago };
    } catch (error) {
      console.error('Error fetching pagos:', error);
      return { cantidadPagos: 0, ultimoPago: null }; // Devolvemos valores por defecto
    }
  };
  


const fetchInscripcionCurso = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${endpoint}/cursos_inscripcion/${cursoId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log("Respuesta completa:", response);

    // Verifica si la propiedad 'curso' existe en la respuesta
    if (response.data && response.data.curso) {
      setCurso(response.data.curso);  // Asegúrate de que 'curso' está en la respuesta correcta
      console.log("Curso obtenido:", response.data.curso);
      // console.log("se supone que esta si",curso.cuotas);
    } else {
      setError('No se encontró la información del curso');
    }
    
    setInscripcionCursoId(response.data.curso_id);  // Ajustado en caso de que curso_id esté en la respuesta
  } catch (error) {
    console.error('Error obteniendo la inscripción del curso:', error);
    setError('Error obteniendo la inscripción del curso');
  }
};

  

  // Manejar cambios en los montos y validar errores
  const handleMontoChange = (event) => {
    const { name, value } = event.target;
    const inputValue = parseFloat(value) || 0;
  
    // Reiniciar errores
    setCanceladoError('');
    setExoneradoError('');
  
    // Obtener valores de los campos
    let cancelado = name === 'monto_cancelado' ? inputValue : parseFloat(formData.monto_cancelado) || 0;
    let exonerado = name === 'monto_exonerado' ? inputValue : parseFloat(formData.monto_exonerado) || 0;
  
    // Calcular el monto restante
    const montoRestante = parseFloat(formData.monto_total) - cancelado - exonerado;
  
    // Verificar si el monto excede el monto restante (esta validación tiene mayor prioridad)
    if (montoRestante < 0) {
      if (name === 'monto_cancelado') {
        setCanceladoError('El monto cancelado más el exonerado no pueden exceder el monto a pagar .');
      } else {
        setExoneradoError('El monto cancelado más el exonerado no pueden exceder el monto a pagar.');
      }
    } 
    // Validar si es la última cuota y si cancelado + exonerado no cubren el monto restante
    else if (formData.esUltimaCuota && montoRestante !== 0) {
      if (name === 'monto_cancelado') {
        setCanceladoError('En la última cuota, el monto debe cubrir el restante completo.');
      } else {
        setExoneradoError('En la última cuota, el monto debe cubrir el restante completo.');
      }
    }
  
    // Actualizar el estado del formulario
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

  // Verificar si hay errores en los montos
  if (canceladoError || exoneradoError) {
    setModalMessage('Hay errores en los montos. Por favor, corrígelos antes de continuar.');
    setShowModal(true);  // Mostrar el modal
    return;  // No continuar con el submit
  }

  setIsSubmitting(true);
  try {
    const token = localStorage.getItem('token');

    // Crear el pago
    await axios.post(`${endpoint}/pagos`, { 
      ...formData, 
      informacion_inscripcion_id: cursoId, 
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
      await axios.put(`${endpoint}/informacion_inscripcion/${cursoId}`, {
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
            key: formData.informacion_inscripcion_id, // Usamos `informacion_inscripcion_id`
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
        peticion => peticion.key === formData.informacion_inscripcion_id && peticion.zona_id === 3 && peticion.status === false
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
      await axios.put(`${endpoint}/informacion_inscripcion/${cursoId}`, {        
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
            key: formData.informacion_inscripcion_id,
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
        peticion => peticion.key === formData.informacion_inscripcion_id && peticion.zona_id === 3 && peticion.status === false
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
    <div className="row" style={{ marginTop: '50px' }}>
    <div className="col-lg-6 mx-auto"> {/* Centrado del contenido */}
      <div className="card-box" style={{ padding: '20px', width: '100%', margin: '0 auto' }}>
      <h1>Registrar Nuevo Pago para V{cedula}</h1>
      {error && <div className="alert alert-danger">{error}</div>}
      <Form onSubmit={handleSubmit} className="custom-gutter">
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
        <Row className="g-2">
          <Col md={6}>
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
        </Col>
        <Col md={6}>
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
        </Col>
        </Row>
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
        <div className='mt-3'>
          <Button variant="success" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Registrando...' : 'Registrar Pago'}
          </Button>
          <Button variant="secondary" onClick={() => navigate('/datos')} className="ms-2">
            Volver
          </Button>
        </div>
      </Form>

            {/* // Modal de error */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Error en el formulario</Modal.Title>
        </Modal.Header>
        <Modal.Body>{modalMessage}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
      {tasaBcv && (
        <div className="mt-3">
          <p><strong>Tasa BCV:</strong> {tasaBcv} Registrada el {moment(fechaBcv).format('YYYY-MM-DD')} </p>
        </div>
        
      )}
      
      <div className="mt-2">
        <p><strong>Cuotas:</strong> {cuotas +1}/{curso?.cuotas}</p>
      </div>
   
    </div>
    </div>
    </div>
  );
};

export default CreatePagosCedula;
