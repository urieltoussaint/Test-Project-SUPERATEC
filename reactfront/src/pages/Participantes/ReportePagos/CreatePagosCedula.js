import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Button, Alert } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { Modal } from 'react-bootstrap';
import { Card, Row, Col } from 'react-bootstrap'; 
import moment from 'moment';
import { useLoading } from '../../../components/LoadingContext';
import SelectComponent from '../../../components/SelectComponent';





const userId = parseInt(localStorage.getItem('user'));  // ID del usuario logueado
const endpoint = 'http://localhost:8000/api';

const CreatePagosCedula = () => {
  const { cedula, cursoId } = useParams();  // Obtener cedula y cursoId de la URL
 const [formData, setFormData] = useState({
     informacion_inscripcion_id: '',
     monto_cancelado: '',
     monto_exonerado: '',
     tipo_moneda: 'bsF',
     tasa_bcv_id: '',
     comentario_cuota: '',
     monto_total: '',
     monto_restante_cuota: '',
     monto_restante_inscripcion: '',
     conversion_total: '',
     conversion_cancelado: '',
     conversion_exonerado: '',
     conversion_restante: '',
     tipo_pago_id:'',
     forma_pago_id:'',
     numero_comprobante:'',
     serial_billete:'',
     fecha_pago:'',
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
  const [showModal2, setShowModal2] = useState(false);
  const [nuevaTasa, setNuevaTasa] = useState("");
  const [curso, setCurso] = useState(null);
  const { setLoading } = useLoading();
    const [cuotasCursos, setCuotasCursos] = useState('');  // Mensaje del modal
    const [costoCuota, setCostoCuota] = useState('');  // Mensaje del modal
    const [costoInscripcion, setCostoInscripcion] = useState('');  // Mensaje del modal
    

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
    // setLoading(true);
   
    //   setLoading(false);
  
  };
  handleSeleccionar();

  fetchCursoData();
}, [curso]); // Se ejecuta solo cuando curso cambia

  
    const [filterOptions, setFilterOptions] = useState({
        tipoPagoOptions: [],
        formaPagoOptions: [],

    });

      // Se ejecuta cuando cursoSeleccionado y tipo_pago_id cambian
      useEffect(() => {
        if (formData.tipo_pago_id) {
          handlePay(curso);
        }
      }, [curso,formData.tipo_pago_id]);
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
    // Función para obtener la tasa BCV según la fecha seleccionada
const obtenerTasaBcv = async (fechaPago) => {
  try {
    const token = localStorage.getItem('token');

    if (!token) {
      console.error("Error: Token no encontrado.");
      return;
    }

    const response = await axios.get(`${endpoint}/tasa_bcv-fecha`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { fecha_pago: fechaPago },
    });

    setTasaBcv(response.data.tasa); // Guardar la tasa obtenida
  } catch (error) {
    console.error("Error obteniendo la tasa BCV:", error.response?.data?.error || error.message);
    setShowModal2(true); // Mostrar modal si no se encuentra la tasa
  }
};
// Función para guardar una nueva tasa en el backend
const guardarNuevaTasa = async () => {
  try {
    const token = localStorage.getItem('token');

    if (!token) {
      console.error("Error: Token no encontrado.");
      return;
    }

    await axios.post(
      `${endpoint}/tasa_bcv`,
      {
        tasa: nuevaTasa,
        created_at: formData.fecha_pago, // Usar la fecha seleccionada
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    setShowModal2(false);
    setTasaBcv(nuevaTasa); // Guardar la nueva tasa ingresada
  } catch (error) {
    console.error("Error guardando la nueva tasa:", error.response?.data?.error || error.message);
  }
};
  // Manejar cambios en los inputs
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });

    if (name === "fecha_pago") {
      obtenerTasaBcv(value); // Llamar a la API cuando se selecciona la fecha
    }
  };


// Obtener información del curso
// const fetchCursoInfo = async () => {
//   try {
//     const token = localStorage.getItem('token');
  
//     // Obtenemos pagos y el último pago con la función ya corregida
//     const { cantidadPagos, ultimoPago } = await getPagosByCurso(cursoId);
//     setCuotas(cantidadPagos);
  
//     // Determinamos el monto total dependiendo de si hay pagos previos
//     let montoTotal = parseFloat(curso.costo); // Valor original por defecto

//     if (cantidadPagos > 0) {
//       // Si hay pagos previos, utilizamos el monto restante del último pago
//       montoTotal = parseFloat(ultimoPago.monto_restante);
//     }
  
//     // Determinamos si es la última cuota
//     const esUltimaCuota = cantidadPagos + 1 === curso.cuotas;
  
//     // Actualizamos el estado del formulario
//     setFormData((prevState) => ({
//       ...prevState,
//       monto_total: montoTotal,  // Actualizamos monto total
//       monto_restante: montoTotal, // Aseguramos que el monto restante también se actualice
//       conversion_total: calcularConversion(montoTotal),  // Calculamos la conversión
//       esUltimaCuota,  // Indicamos si es la última cuota
//     }));
  
//     // Logs para depuración
//     console.log('Curso seleccionado:', curso.cod);
//     console.log('Cuotas del curso:', curso.cuotas);
//     console.log('Pagos realizados:', cantidadPagos);
//     console.log('Último pago:', ultimoPago);
//   } catch (error) {
//     console.error('Error fetching curso info:', error);
//     setError('Error al obtener la información del curso');
//   }
// };

const handlePay = async (curso) => {
  console.log("inscripcion es:", curso.costo_inscripcion);
  try {
    const { cantidadPagos, ultimoPago } = await getPagosByCurso(cursoId, formData.tipo_pago_id);
    setCuotas(cantidadPagos);
    setCuotasCursos(curso.curso_cuotas);

    let montoTotal = 0;
    // setCostoInscripcion(false);

    if (formData.tipo_pago_id === "1") { 
      // Pago de inscripción
      montoTotal = cantidadPagos > 0 ? parseFloat(ultimoPago.monto_restante_inscripcion) : parseFloat(curso.costo_inscripcion);
      
      setFormData((prevState) => ({
        ...prevState,
        monto_total: montoTotal,
        monto_restante_inscripcion: montoTotal,
        conversion_total: calcularConversion(montoTotal),
      }));

    } else if (formData.tipo_pago_id === "2") { 
      // Pago de cuota
      montoTotal = cantidadPagos > 0 ? parseFloat(ultimoPago.monto_restante_cuota) : parseFloat(curso.costo_total_cuota);
      const esUltimaCuota = cantidadPagos + 1 === curso.curso_cuotas;

      setFormData((prevState) => ({
        ...prevState,
        monto_total: montoTotal,
        monto_restante_cuota: montoTotal,
        conversion_total: calcularConversion(montoTotal),
        esUltimaCuota,
      }));
    }

    console.log('Cuotas del curso:', curso.curso_cuotas);
    console.log('Pagos realizados:', cantidadPagos);
    console.log('Último pago:', ultimoPago);
  } catch (error) {
    console.error('Error fetching curso info:', error);
    setError('Error al obtener la información del curso');
  }
};


const getPagosByCurso = async (cursoId, tipo_pago_id) => {
  try {
      const token = localStorage.getItem('token');

      // Realizamos la solicitud para obtener pagos con el filtro de tipo_pago_id
      const response = await axios.get(`${endpoint}/pagos-inscripcion/${cursoId}`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { tipo_pago_id } // Enviar como parámetro en la petición
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

const handleSeleccionar = async () => {
  try {
    const token = localStorage.getItem('token');
    
    // Suponiendo que el endpoint unificado sea `/filtros-cursos`
    const response = await axios.get(`${endpoint}/filter-inscripciones`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    // Desestructuramos los datos que vienen en la respuesta
    const { tipo_pago,forma_pago } = response.data;

    // Retornamos las opciones en un solo objeto
    setFilterOptions( {
      tipoPagoOptions: tipo_pago,
      formaPagoOptions:forma_pago,
   
    });

  } catch (error) {
    console.error('Error fetching filter options:', error);
    
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
   // Actualizar informacion_inscripcion según el monto restante
      if (montoRestante === 0 && formData.tipo_pago_id===1) {
        await axios.put(`${endpoint}/informacion_inscripcion/${cursoId}`, {
          status_pay: 2
        }, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        // Buscar todas las peticiones paginadas y actualizar la petición correspondiente
        // Realizar la solicitud con filtros directamente en la API
        const response = await axios.get(`${endpoint}/peticiones-filtro`, {
          headers: {
              Authorization: `Bearer ${token}`,
          },
          params: {
              key: cursoId,
              zona_id: 3,
              status: false
          }
        });

        // Obtener solo las peticiones filtradas
        const peticionesFiltradas = response.data.data;
  
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
  
      }
      
      
     // Actualizar informacion_inscripcion según el monto restante
     if (montoRestante === 0 && formData.tipo_pago_id===2) {
      await axios.put(`${endpoint}/informacion_inscripcion/${cursoId}`, {
        status_pay: 3
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Buscar todas las peticiones paginadas y actualizar la petición correspondiente
      // Realizar la solicitud con filtros directamente en la API
      const response = await axios.get(`${endpoint}/peticiones-filtro`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
        params: {
            key: cursoId,
            zona_id: 3,
            status: false
        }
      });

      // Obtener solo las peticiones filtradas
      const peticionesFiltradas = response.data.data;

      if (peticionesFiltradas.length > 0) {
        const peticion = peticionesFiltradas[0]; // Tomar la primera petición coincidente
        await axios.put(`${endpoint}/peticiones/${peticion.id}`, {
          comentario: "Pago Cuotas Faltantes", // Actualizar el comentario
          user_success: userId, 
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
      <Form onSubmit={handleSubmit} className="custom-gutter">
     
          
          <SelectComponent
             options={filterOptions.tipoPagoOptions}  // Usar el estado filterOptions
             nameField="descripcion"
             valueField="id"
             selectedValue={formData.tipo_pago_id}
             handleChange={handleChange}
             controlId="tipo_pago_id"
             label="Tipo de Pago"
             onChange={handlePay}
           />
       
           
         {/* Solo se muestra si se ha seleccionado un tipo de pago */}
       {formData.tipo_pago_id && (
         <>
           {formData.tipo_pago_id==1 ? (
             <>
           <p><strong>Pago Inscripción</strong></p>
           <>
           {/* Input de Fecha de Pago */}
           <Form.Group controlId="fecha_pago">
             <Form.Label>Fecha de Pago</Form.Label>
             <Form.Control type="date" name="fecha_pago" value={formData.fecha_pago} onChange={handleChange} />
           </Form.Group>

           {/* Mostrar la tasa obtenida */}
           {tasaBcv && <p>Tasa BCV: {tasaBcv}</p>}

         
   </>
           <Row className="g-2">
         <Col md={6}>
        
           <Form.Group controlId="monto_total">
             <Form.Label>Monto a Pagar de Inscripción</Form.Label>
             <Form.Control
               type="text"
               name="monto_total"
               value={formData.monto_total}
               onChange={handlePay}
               readOnly
             />
             <Form.Text className="text-muted">Conversión: {calcularConversion(formData.monto_total)}BsF</Form.Text>
           </Form.Group>
           </Col>
           <Col md={6}>
           <Form.Group controlId="monto_inscripcion">
             <Form.Label>Monto de Inscripción </Form.Label>
             <Form.Control
               type="text"
               name="monto_inscripcion"
               value={costoInscripcion}
               readOnly
             />
             <Form.Text className="text-muted">Conversión: {calcularConversion(formData.monto_total)}BsF</Form.Text>
           </Form.Group>
           </Col>
           
           </Row>
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
           <Form.Group controlId="monto_restante_inscripcion">
             <Form.Label>Monto Restante de Inscripción</Form.Label>
             <Form.Control
               type="text"
               name="monto_restante_inscripcion"
               value={formData.monto_restante_inscripcion}
               readOnly
             />
             <Form.Text className="text-muted">Conversión: {calcularConversion(formData.monto_restante)}BsF</Form.Text>
           </Form.Group>
           <Row className="g-2">
         <Col md={6}>
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
           </Col>
           <Col md={6}>
           <SelectComponent
             options={filterOptions.formaPagoOptions}  // Usar el estado filterOptions
             nameField="descripcion"
             valueField="id"
             selectedValue={formData.forma_pago_id}
             handleChange={handleChange}
             controlId="forma_pago_id"
             label="Forma de Pago"
           />
           </Col>
           </Row>
           <>
           {formData.forma_pago_id && ( // Solo se muestra si se ha seleccionado una forma de pago
             <>
               {formData.forma_pago_id == 4 ? (
                 <Form.Group controlId="serial_billete">
                   <Form.Label>Serial Billete</Form.Label>
                   <Form.Control
                     type="text"
                     name="serial_billete"
                     value={formData.serial_billete}
                     onChange={handleChange} // Asegúrate de manejar el cambio
                   />
                 </Form.Group>
               ) : (
                 <>
                 <Form.Group controlId="numero_comprobante">
                   <Form.Label>Número Comprobante</Form.Label>
                   <Form.Control
                     type="text"
                     name="numero_comprobante"
                     value={formData.numero_comprobante}
                     onChange={handleChange} // Asegúrate de manejar el cambio
                   />
                 </Form.Group>
                
               </>
               )}
             </>
           )}
           </>

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
          
           
         ) : (
           <>
           <p mb-3><strong>Pago de Cuota</strong></p>
           <Form.Group controlId="fecha_pago">
                 <Form.Label>Fecha de Pago</Form.Label>
                 <Form.Control
                   type="date"
                   name="fecha_pago"
                   value={formData.fecha_pago}
                   onChange={handleChange} // Asegúrate de manejar el cambio
                 />
               </Form.Group>
           <Row className="g-2">
         <Col md={6}>
       
           <Form.Group controlId="monto_total">
             <Form.Label>Monto a Pagar de Cuotas</Form.Label>
             <Form.Control
               type="text"
               name="monto_total"
               value={formData.monto_total}
               readOnly
             />
             <Form.Text className="text-muted">Conversión: {calcularConversion(formData.monto_total)}BsF</Form.Text>
           </Form.Group>
           </Col>
           <Col md={6}>
           <Form.Group controlId="costo_cuota">
             <Form.Label>Costo de Cuota</Form.Label>
             <Form.Control
               type="text"
               name="costo_cuota"
               value={costoCuota}
               readOnly
             />
             <Form.Text className="text-muted">Conversión: {calcularConversion(costoCuota)}BsF</Form.Text>
           </Form.Group>
           </Col>
           </Row>
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
           <Form.Group controlId="monto_restante_cuota">
             <Form.Label>Monto Restante de Cuotas</Form.Label>
             <Form.Control
               type="text"
               name="monto_restante_cuota"
               value={formData.monto_restante_cuota}
               readOnly
             />
             <Form.Text className="text-muted">Conversión: {calcularConversion(formData.monto_restante_cuota)}BsF</Form.Text>
           </Form.Group>
           <Row className="g-2">
         <Col md={6}>
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
           </Col>
           <Col md={6}>
           <SelectComponent
             options={filterOptions.formaPagoOptions}  // Usar el estado filterOptions
             nameField="descripcion"
             valueField="id"
             selectedValue={formData.forma_pago_id}
             handleChange={handleChange}
             controlId="forma_pago_id"
             label="Forma de Pago"
           />
           </Col>
           </Row>
           <>
           {formData.forma_pago_id && ( // Solo se muestra si se ha seleccionado una forma de pago
             <>
               {formData.forma_pago_id == 4 ? (
                 <Form.Group controlId="serial_billete">
                   <Form.Label>Serial Billete</Form.Label>
                   <Form.Control
                     type="text"
                     name="serial_billete"
                     value={formData.serial_billete}
                     onChange={handleChange} // Asegúrate de manejar el cambio
                   />
                 </Form.Group>
               ) : (
                 <Form.Group controlId="numero_comprobante">
                   <Form.Label>Número Comprobante</Form.Label>
                   <Form.Control
                     type="text"
                     name="numero_comprobante"
                     value={formData.numero_comprobante}
                     onChange={handleChange} // Asegúrate de manejar el cambio
                   />
                 </Form.Group>
               )}
             </>
           )}
           </>

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
 </>
)}

  {/* Modal para ingresar nueva tasa si no existe */}
  <Modal show={showModal2} onHide={() => setShowModal2(false)}>
             <Modal.Header closeButton>
               <Modal.Title>Tasa BCV no encontrada</Modal.Title>
             </Modal.Header>
             <Modal.Body>
               <p>No hay una tasa BCV para la fecha seleccionada. Ingresa la tasa manualmente.</p>
               <Form.Group controlId="nueva_tasa">
                 <Form.Label>Ingresar Tasa BCV</Form.Label>
                 <Form.Control
                   type="number"
                   step="0.01"
                   value={nuevaTasa}
                   onChange={(e) => setNuevaTasa(e.target.value)}
                 />
               </Form.Group>
             </Modal.Body>
             <Modal.Footer>
               <Button variant="secondary" onClick={() => setShowModal2(false)}>
                 Cancelar
               </Button>
               <Button variant="primary" onClick={guardarNuevaTasa}>
                 Guardar Tasa
               </Button>
             </Modal.Footer>
           </Modal>
</Form>
       <div className='mt-3'>
       <Button variant="success" type="submit" disabled={isSubmitting}>
         {isSubmitting ? 'Registrando...' : 'Registrar Pago'}
       </Button>
       <Button variant="secondary" onClick={() => navigate('/pagos')} className="ms-2">
         Volver
       </Button>
       </div>

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
