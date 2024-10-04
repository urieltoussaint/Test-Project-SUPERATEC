import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select/async';
import { Modal } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';

const endpoint = 'http://localhost:8000/api';
const userId = parseInt(localStorage.getItem('user'));  // ID del usuario logueado

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [canceladoError, setCanceladoError] = useState('');
  const [exoneradoError, setExoneradoError] = useState('');
  const navigate = useNavigate();
  const [cursoId, setCursoId] = useState(null); // <-- Añadido el estado para cursoId
  const [showModal, setShowModal] = useState(false);  // Controlar el modal
  const [modalMessage, setModalMessage] = useState('');  // Mensaje del modal

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
          inscripcion_curso_id: '',
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


  const getAllCursos = async () => {
    try {
        const token = localStorage.getItem('token');
        let allCursos = [];
        let currentPage = 1;
        let totalPages = 1;

        // Loop para obtener todas las páginas
        while (currentPage <= totalPages) {
            const response = await axios.get(`${endpoint}/cursos?with=area&page=${currentPage}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });

            allCursos = [...allCursos, ...response.data.data];
            totalPages = response.data.last_page;
            currentPage++;
        }

        console.log('Cursos obtenidos:', allCursos);
        return allCursos; // Devolver los cursos obtenidos
    } catch (error) {
        console.error('Error fetching cursos:', error);
        return [];
    }
};


  const handleCursoChange = async (event) => {
    const selectedCursoId = event.target.value;
    const selectedCurso = cursos.find(curso => curso.id === parseInt(selectedCursoId, 10));
    
    if (!selectedCurso) {
      console.error('Curso no encontrado');
      return;
    }
    console.log('Curso seleccionado:', selectedCurso.curso_id);
    
    setCursoSeleccionado(selectedCurso);
    setCursoId(selectedCurso.curso_id);
    console.log (selectedCurso.curso_id);
    
  
    try {
      const allCursos = await getAllCursos();
    
      // Filtrar el curso exacto por curso_id después de obtener todos los cursos
      const cursoFromApi = allCursos.find(curso => curso.id === selectedCurso.curso_id);
  
      if (!cursoFromApi) {
        console.error('Curso no encontrado en la API');
        return;
      }
  
      console.log('Cuotas del curso desde API:', cursoFromApi.cuotas);
  


      // Obtener la cantidad de pagos ya realizados
      const pagosRealizados = await getPagosByCurso(selectedCursoId);
      console.log (cursoFromApi.cuotas);
  
      // Verificar si estamos en la última cuota
      const esUltimaCuota = pagosRealizados + 1 === cursoFromApi.cuotas;
  
      const token = localStorage.getItem('token');
      const response = await axios.get(`${endpoint}/ultimo_pago/${selectedCursoId}/${cedula}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      const ultimoPago = response.data;
      const montoTotal = ultimoPago ? parseFloat(ultimoPago.monto_restante) : parseFloat(selectedCurso.costo);
  
      setFormData((prevState) => ({
        ...prevState,
        inscripcion_curso_id: selectedCursoId,
        monto_total: montoTotal,
        monto_restante: montoTotal,
        conversion_total: calcularConversion(montoTotal),
        esUltimaCuota,  // Almacenar si es la última cuota
      }));
    } catch (error) {
      console.error('Error fetching ultimo pago:', error);
      setFormData((prevState) => ({
        ...prevState,
        inscripcion_curso_id: selectedCursoId,
        monto_total: parseFloat(selectedCurso.costo),
        monto_restante: parseFloat(selectedCurso.costo),
        conversion_total: calcularConversion(selectedCurso.costo),
        esUltimaCuota: false,  // Asumir que no es la última cuota en caso de error
      }));
    }
  };
  
  

  const getPagosByCurso = async (inscripcion_curso_id) => {
    try {
      const token = localStorage.getItem('token');
      let allPagos = [];
      let currentPage = 1;
      let totalPages = 1;
  
      while (currentPage <= totalPages) {
        const response = await axios.get(`${endpoint}/pagos`, {
          params: { curso_id: inscripcion_curso_id, page: currentPage },
          headers: { Authorization: `Bearer ${token}` },
        });
  
        allPagos = [...allPagos, ...response.data.data];
        totalPages = response.data.last_page;
        currentPage++;
      }
  
      // Filtrar por inscripcion_curso_id
      const pagosFiltrados = allPagos.filter((reporte) => reporte.inscripcion_curso_id === parseInt(inscripcion_curso_id));
      return pagosFiltrados.length; // Devolver la cantidad de pagos realizados
    } catch (error) {
      console.error('Error fetching pagos:', error);
      return 0;
    }
  };
  

 
  

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
        await axios.put(`${endpoint}/inscripcion_cursos/${cedula}/status`, {
          cedula_identidad: cedula,
          curso_id: cursoId,
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
        await axios.put(`${endpoint}/inscripcion_cursos/update_status`, {
          cedula_identidad: cedula,
          curso_id: cursoId,
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
                className={canceladoError ? 'is-invalid' : ''}
              />
              {canceladoError && <Alert variant="danger">{canceladoError}</Alert>}
              <Form.Text className="text-muted">Conversión: {calcularConversion(formData.monto_cancelado)}BsF</Form.Text>
            </Form.Group>
            <Form.Group controlId="monto_exonerado">
              <Form.Label>Monto Exonerado</Form.Label>
              <Form.Control
                type="number"
                name="monto_exonerado"
                value={formData.monto_exonerado}
                onChange={handleMontoChange}
                className={exoneradoError ? 'is-invalid' : ''}
              />
              {exoneradoError && <Alert variant="danger">{exoneradoError}</Alert>}
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
        <Button variant="success" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Registrando...' : 'Registrar Pago'}
        </Button>
        <Button variant="secondary" onClick={() => navigate('/pagos')} className="ms-2">
          Volver
        </Button>
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
          <p><strong>Tasa BCV Actual:</strong> {tasaBcv}</p>
        </div>
      )}
    </div>
  );
};

export default CreatePago;
