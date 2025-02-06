import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select/async';
import { Modal } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import { Card, Row, Col } from 'react-bootstrap'; 
import moment from 'moment';


const endpoint = 'http://localhost:8000/api';
const userId = parseInt(localStorage.getItem('user'));  // ID del usuario logueado


const CreatePago = () => {
  const [formData, setFormData] = useState({
    informacion_inscripcion_id: '',
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
  const [fechaBcv, setFechaBcv] = useState(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [canceladoError, setCanceladoError] = useState('');
  const [exoneradoError, setExoneradoError] = useState('');
  const navigate = useNavigate();
  const [cursoId, setCursoId] = useState(null); // <-- Añadido el estado para cursoId
  const [showModal, setShowModal] = useState(false);  // Controlar el modal
  const [modalMessage, setModalMessage] = useState('');  // Mensaje del modal
  const [cuotas, setCuotas] = useState('');  // Mensaje del modal
  const [cuotasCursos, setCuotasCursos] = useState('');  // Mensaje del modal
  const [costoInscripcion, setCostoInscripcion] = useState(false);
  


  useEffect(() => {
    fetchTasaBcv();
  }, []);

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

  const fetchOptions = async (inputValue) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${endpoint}/cedulas?query=${inputValue}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
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
        const token = localStorage.getItem('token');
        const response = await axios.get(`${endpoint}/cursos_por_cedula/${selectedCedula}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setCursos(response.data);
        setCursoSeleccionado(null);
        setFormData({
          informacion_inscripcion_id: '',
          monto_cancelado: '',
          monto_exonerado: '',
          tipo_moneda: 'bsF',
          tasa_bcv_id: formData.tasa_bcv_id,
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
    const selectedCursoId = event.target.value; // Obtén el ID del curso seleccionado
    const selectedCurso = cursos.find(curso => curso.id === parseInt(selectedCursoId)); // Busca el objeto completo
  
    if (selectedCurso) {
      console.log("Curso seleccionado:", selectedCurso);
      setCursoSeleccionado(selectedCurso); // Guarda el objeto completo en el estado
      setCursoId(selectedCurso.id); // Guarda el ID del curso en el estado
      setFormData(prevData => ({
        ...prevData,
        informacion_inscripcion_id: selectedCursoId // Guarda el ID en el formulario
      }));
    }

   
    try {
      // Obtener la cantidad de pagos ya realizados
      const { cantidadPagos, ultimoPago } = await getPagosByCurso(selectedCursoId);
      setCuotas(cantidadPagos);
      setCuotasCursos(selectedCurso.curso_cuotas);
  
      let montoTotal = parseFloat(selectedCurso.curso_costo); // Valor original por defecto
      setCostoInscripcion(false);
      if (cantidadPagos > 0) {
        // Si hay pagos previos, utilizamos el monto restante del último pago
        montoTotal = parseFloat(ultimoPago.monto_restante);
      }
      if ((cantidadPagos == 0) && (selectedCurso.status_pay==1)) {
        // Si hay pagos previos, utilizamos el monto restante del último pago
        montoTotal = parseFloat(selectedCurso.costo_inscripcion);
        setCostoInscripcion(true);
        
      }
    
      // Determinamos si es la última cuota
      const esUltimaCuota = cantidadPagos + 1 === selectedCurso.curso_cuotas;
    
      // Actualizamos el estado del formulario
      setFormData((prevState) => ({
        ...prevState,
        monto_total: montoTotal,  // Actualizamos monto total
        monto_restante: montoTotal, // Aseguramos que el monto restante también se actualice
        conversion_total: calcularConversion(montoTotal),  // Calculamos la conversión
        esUltimaCuota,  // Indicamos si es la última cuota
      }));
    
      // Logs para depuración
      console.log('Curso seleccionado:', selectedCurso.curso_cod);
      console.log('Cuotas del curso:', selectedCurso.curso_cuotas);
      console.log('Pagos realizados:', cantidadPagos);
      console.log('Último pago:', ultimoPago);
    } catch (error) {
      console.error('Error fetching curso info:', error);
      setError('Error al obtener la información del curso');
    }
  };
  
  

 

  const getPagosByCurso = async (informacion_inscripcion_id) => {
    try {
      const token = localStorage.getItem('token');
  
      // Realizamos la solicitud para obtener pagos
      const response = await axios.get(`${endpoint}/pagos-inscripcion/${informacion_inscripcion_id}`, {
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
  


  const handleSubmit = async (e) => {
    console.log(formData.informacion_inscripcion_id);
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
        cedula_identidad: cedula, 
        conversion_total: calcularConversion(formData.monto_total) 
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      const montoRestante = parseFloat(formData.monto_restante);
  
      // Actualizar informacion_inscripcion según el monto restante
      if (montoRestante === 0) {
        await axios.put(`${endpoint}/informacion_inscripcion/${formData.informacion_inscripcion_id}`, {
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
        // Actualizar status_pay a 2 (pago en proceso)
        await axios.put(`${endpoint}/informacion_inscripcion/${formData.informacion_inscripcion_id}`, {
          status_pay: 2
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
        setCanceladoError('El monto cancelado más el exonerado no pueden exceder el monto restante.');
      } else {
        setExoneradoError('El monto cancelado más el exonerado no pueden exceder el monto restante.');
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
  

  const calcularConversion = (monto) => {
    return tasaBcv ? (monto * tasaBcv).toFixed(2) : 'N/A';
  };

  return (
    <div className="row" style={{ marginTop: '50px' }}>
  <div className="col-lg-6 mx-auto"> {/* Centrado del contenido */}
    <div className="card-box" style={{ padding: '20px', width: '100%', margin: '0 auto' }}>
      <h2>Registrar Nuevo Pago</h2>
      <Form onSubmit={handleSubmit} className="custom-gutter">
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
          <Form.Group controlId="informacion_inscripcion_id">
            <Form.Label>Curso</Form.Label>
            <Form.Control
              as="select"
              name="informacion_inscripcion_id"
              value={formData.informacion_inscripcion_id}
              onChange={handleCursoChange}
              required
            >
              <option value="">Seleccione</option>
              {cursos.map(curso => (
                <option key={curso.id} value={curso.id}>
                  {curso.curso_descripcion} - Costo: {curso.curso_costo}
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
              <Form.Text className="text-muted">Conversión: {calcularConversion(formData.monto_cancelado)}BsF</Form.Text>
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
              <Form.Text className="text-muted">Conversión: {calcularConversion(formData.monto_exonerado)}BsF</Form.Text>
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
        <div className='mt-3'>
        <Button variant="success" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Registrando...' : 'Registrar Pago'}
        </Button>
        <Button variant="secondary" onClick={() => navigate('/pagos')} className="ms-2">
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
          <p><strong>Tasa BCV:</strong> {tasaBcv} Registrada {moment(fechaBcv).format('YYYY-MM-DD')} </p>
        </div>
        
      )}
      {cursoSeleccionado && (
      <div className="mt-2">
        <p><strong>Cuotas:</strong> {cuotas+1 }/{cuotasCursos}</p>
      </div>
    )}

    </div>
    </div>
    </div>
  );
};

export default CreatePago;
