import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Button } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import Select from 'react-select/async';
import { useLoading } from '../../components/LoadingContext';
import { ToastContainer, toast } from 'react-toastify';
import SelectComponent from '../../components/SelectComponent';
import { Card, Row, Col } from 'react-bootstrap'; 
import { Modal, Table } from 'react-bootstrap';
import { FaSearch } from 'react-icons/fa';  // Importamos íconos de react-icons

const userId = parseInt(localStorage.getItem('user'));  // ID del usuario logueado
const endpoint = 'http://localhost:8000/api';


const IncsParticipanteBolsa = () => {
    const { cursoId } = useParams();
    const [cedula, setCedula] = useState('');
    const [datos, setDatos] = useState(null);
    const [curso, setCurso] = useState(null);
    const [error, setError] = useState('');
    const { setLoading } = useLoading();
    const navigate = useNavigate();
    const [selectVisible, setSelectVisible] = useState(false);  // Control de la visibilidad de los selectores
    const [showModal, setShowModal] = useState(false);  // Estado para mostrar/ocultar modal
    const handleCloseModal = () => setShowModal(false); // Cierra el modal
    const [cedulaError, setCedulaError] = useState('');  // Estado para el mensaje de error si ya está inscrito
    const [isCedulaValid, setIsCedulaValid] = useState(true); // Estado para manejar si la cédula es válida
    const [formErrors, setFormErrors] = useState({}); // Estado para almacenar los mensajes de error
  
    const userRole = localStorage.getItem('role');
    
    const [filterOptions, setFilterOptions] = useState({
        estadoCivilOptions: [],
        discapacidadOptions: [],
        disponibilidadOptions: [],
        expLaboraldOptions: [],
        quienViveOptions: [],
        rolHogarOptions: [],
        horarioMañanaOptions: [],
        horarioTardeOptions: [],

    });
    const [formData, setFormData] = useState({
        estado_civil_id: '',
        discapacidad_id: '',
        disponibilidad_id: '',
        entorno_familiar: '',
        fortalezas:'',
        aspectos_mejorables:'',
        exp_laboral_id:'',
        quien_vive_id:'',
        rol_hogar_id:'',
        tlf_casa:'',
        tlf_celular:'',
        email:'',
        sector:'',
        horario_mañana_id:'',
        horario_tarde_id:'',

    });
  

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };


    const fetchOptions = async (inputValue, mayorEdad = false) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${endpoint}/cedulas`, {
                params: {
                    query: inputValue,
                    mayor_edad: mayorEdad ? 1 : 0, // Enviar 1 si queremos el filtro de mayores de edad
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            
    
            return response.data.map((cedula) => ({
                value: cedula.cedula_identidad,
                label: cedula.cedula_identidad,
            }));
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
                const response = await axios.get(`${endpoint}/identificacion/${selectedCedula}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
    
                setDatos(response.data);  // Aquí se almacenan los datos completos del participante
                setFormData(prevData => ({
                    ...prevData,
                    datos_identificacion_id: response.data.id  // Aquí guardas el ID del campo `datos_identificacion_id`
                }));
            } catch (error) {
                setError('Datos no encontrados');
                setDatos(null);
            }
        } else {
            setDatos(null);
        }
    };
    

    const handleSeleccionar = async (cedula) => {
        try {
            const token = localStorage.getItem('token');
    
            // Verificar si el participante ya está inscrito en la bolsa de empleo
            const checkResponse = await axios.get(`${endpoint}/participantes-bolsas/${cedula}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
    
            // Si la respuesta es válida, significa que ya está inscrito
            if (checkResponse.status === 200) {
                setError("El participante ya está inscrito en la bolsa de empleo");
                return;
            }
        } catch (error) {
            // Si obtenemos un 404, significa que NO está inscrito, y podemos proceder
            if (error.response && error.response.status === 404) {
                console.log("Participante no está inscrito, procediendo con la selección...");
                setError(""); // Limpiar cualquier error anterior
            } else {
                console.error("Error verificando inscripción en la bolsa de empleo:", error);
                setError("Error al verificar la inscripción en la bolsa de empleo");
                return;
            }
        }
    
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${endpoint}/select-bolsa`, {
                headers: { Authorization: `Bearer ${token}` }
            });
    
            const { estado_civil, discapacidad, disponibilidad, exp_laboral, quien_vive, rol_hogar, horario_mañana, horario_tarde } = response.data;
    
            // Guardar las opciones en el estado de filterOptions
            setFilterOptions({
                estadoCivilOptions: estado_civil,
                discapacidadOptions: discapacidad,
                disponibilidadOptions: disponibilidad,
                expLaboraldOptions: exp_laboral,
                quienViveOptions: quien_vive,
                rolHogarOptions: rol_hogar,
                horarioMañanaOptions: horario_mañana,
                horarioTardeOptions: horario_tarde,
            });
    
            setSelectVisible(true);  // Mostrar los selectores
        } catch (error) {
            console.error('Error fetching filter options:', error);
            setError("Error al obtener las opciones de la bolsa de empleo");
        }
    };
    
    

const handleInscripcion = async (action) => {
    // Objeto para almacenar errores
    let errors = {};
    let inscripcionId = null;

    // Validar si hay campos vacíos (excepto es_patrocinado)
    if (!cedula) errors.cedula = 'La cédula es requerida';


    // Si hay errores, detener la función y mostrar los errores
    if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        return;
    }

    try {
        const token = localStorage.getItem('token');


        // Crear un nuevo objeto formDataWithStatus que extiende el formData original
        const formDataWithStatus = {
            ...formData,
            datos_identificacion_id: formData.datos_identificacion_id, // Usar el ID de la identificación seleccionada
    
        };

        // 1. Realizar la inscripción con todos los datos
        const inscripcionResponse = await axios.post(`${endpoint}/participantes-bolsa`, formDataWithStatus, {
            headers: { Authorization: `Bearer ${token}` },
        }
    )
    inscripcionId = inscripcionResponse.data.id; // Asignar el ID recibido
       

        // Si la inscripción fue exitosa, redirigir
        toast.success("Participante inscrito con éxito");
        // Redirigir dependiendo de la acción seleccionada y del valor de es_patrocinado
     
            // Si la acción es 'guardar', redirigir siempre a cursos
            navigate(`/postulados-bolsa-empleo`);
        
        
    } catch (error) {
        console.error('Error en la inscripción o en la creación de la petición:', error);
        setFormErrors({ general: 'Error en la inscripción o en la creación de la petición' });
        toast.error("Error al inscribir");
    }
};


    return (
        <div className="row" style={{ marginTop: '50px' }}>
        <div className="col-lg-6 mx-auto"> {/* Centrado del contenido */}
        <Form.Group controlId="cedula" className="custom-gutter" >
          <div className="card-box" style={{ padding: '20px', width: '100%', margin: '0 auto' }}>
            <h1>Inscripción a Bolsa de Empleo </h1>
            <div>
                
            <Form.Group controlId="cedula" className="custom-gutter">
                <Form.Label>Cédula de Identidad</Form.Label>
                <Select
                    cacheOptions
                    loadOptions={fetchOptions}
                    onChange={handleCedulaChange}
                    placeholder="Escriba la cédula de identidad"
                    noOptionsMessage={() => 'No se encontraron cédulas'}
                    className={isCedulaValid ? '' : 'is-invalid'}  // Cambia el estilo si es inválida
                />
                {!isCedulaValid && (
                    <div className="invalid-feedback">
                        {cedulaError}
                    </div>
                )}
            </Form.Group>

               
            </div>
            {error && <div className="alert alert-danger mt-2">{error}</div>}

            {datos && (
                <div className="mt-3">
                    <div className="d-flex">
                        <p className="me-3"><strong>Nombres:</strong> {datos.nombres}</p>
                        <p><strong>Apellidos:</strong> {datos.apellidos}</p>
                    </div>
                    <Button variant="info" onClick={() => handleSeleccionar(datos.cedula_identidad)}>
                        Seleccionar
                    </Button>

            </div>
            
            )}

            {selectVisible && filterOptions && (
                <div className="mt-3">
                    <Row className="g-2">
                    <Col md={3}>
                    {/* Cohorte Selector */}
                    {formErrors.estado_civil_id && (
                    <div className="text-danger">{formErrors.estado_civil_id}</div>
                )}
                    <SelectComponent
                        options={filterOptions.estadoCivilOptions}  // Usar el estado filterOptions
                        nameField="descripcion"
                        valueField="id"
                        selectedValue={formData.estado_civil_id}
                        handleChange={handleChange}
                        controlId="estado_civil_id"
                        label="Estado Civil"
                        required
                    />
                    
                    </Col>
                    <Col md={3}>

                    {/* Centro Selector */}
                    {formErrors.discapacidad_id && (
                    <div className="text-danger">{formErrors.discapacidad_id}</div>
                )}
                    <SelectComponent
                        options={filterOptions.discapacidadOptions}  // Usar el estado filterOptions
                        nameField="descripcion"
                        valueField="id"
                        selectedValue={formData.discapacidad_id}
                        handleChange={handleChange}
                        controlId="discapacidad_id"
                        label="Discapacidad"
                        required
                    />
                    </Col>
                    <Col md={3}>

                    {/* Periodo Selector */}
                    {formErrors.disponibilidad_id && (
                    <div className="text-danger">{formErrors.disponibilidad_id}</div>
                )}
                    <SelectComponent
                        options={filterOptions.disponibilidadOptions}  // Usar el estado filterOptions
                        nameField="descripcion"
                        valueField="id"
                        selectedValue={formData.disponibilidad_id}
                        handleChange={handleChange}
                        controlId="disponibilidad_id"
                        label="Disponibilidad"
                        required

                    />
                    </Col>

                        </Row>
                        
                        <Form.Group controlId="entorno_familiar">
                        <Form.Label>Entorno Familiar</Form.Label>
                        <Form.Control
                            as="textarea"
                            name="entorno_familiar"
                            value={formData.entorno_familiar}
                            onChange={handleChange}
                        />
                        </Form.Group>

                        <Form.Group controlId="fortalezas">
                        <Form.Label>Fortalezas</Form.Label>
                        <Form.Control
                            as="textarea"
                            name="fortalezas"
                            value={formData.fortalezas}
                            onChange={handleChange}
                        />
                        </Form.Group>

                        <Form.Group controlId="aspectos_mejorables">
                        <Form.Label>Aspectos mejorables</Form.Label>
                        <Form.Control
                            as="textarea"
                            name="aspectos_mejorables"
                            value={formData.aspectos_mejorables}
                            onChange={handleChange}
                        />
                        </Form.Group>
                        {formErrors.exp_laboral_id && (
                    <div className="text-danger">{formErrors.exp_laboral_id}</div>
                )}
                        <SelectComponent
                            options={filterOptions.expLaboraldOptions}  // Usar el estado filterOptions
                            nameField="descripcion"
                            valueField="id"
                            selectedValue={formData.exp_laboral_id}
                            handleChange={handleChange}
                            controlId="exp_laboral_id"
                            label="Experiencia laboral"
                            required

                        />

                        <Row className="g-2">
                        <Col md={6}>
                        {formErrors.quien_vive_id && (
                    <div className="text-danger">{formErrors.quien_vive_id}</div>
                )}
                        <SelectComponent
                            options={filterOptions.quienViveOptions}  // Usar el estado filterOptions
                            nameField="descripcion"
                            valueField="id"
                            selectedValue={formData.quien_vive_id}
                            handleChange={handleChange}
                            controlId="quien_vive_id"
                            label="Con quien vive"
                            required

                        />

                        </Col>

                        <Col md={6}>
                        {formErrors.rol_hogar_id && (
                    <div className="text-danger">{formErrors.rol_hogar_id}</div>
                )}
                        <SelectComponent
                            options={filterOptions.rolHogarOptions}  // Usar el estado filterOptions
                            nameField="descripcion"
                            valueField="id"
                            selectedValue={formData.rol_hogar_id}
                            handleChange={handleChange}
                            controlId="rol_hogar_id"
                            label="Rol en su Hogar"
                            required

                        />

                        </Col>
                        </Row>

                        <Row className="g-2">
                        <Col md={3}>
                        <Form.Group controlId="tlf_casa">
                            <Form.Label>Teléfono de Casa</Form.Label>
                            <Form.Control
                            type="text"
                            name="tlf_casa"
                            value={formData.tlf_casa}
                            onChange={handleChange}
                            maxLength={10}
                            />
                        </Form.Group>
                        </Col>
                        <Col md={3}>
                        <Form.Group controlId="tlf_celular">
                            <Form.Label>Teléfono Celular</Form.Label>
                            <Form.Control
                            type="text"
                            name="tlf_celular"
                            value={formData.tlf_celular}
                            onChange={handleChange}
                            maxLength={10}
                            />
                        </Form.Group>
                        </Col>
                        <Col md={3}>
                        <Form.Group controlId="email">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            />
                        </Form.Group>
                        </Col>
                        </Row>
                        <Form.Group controlId="sector">
                            <Form.Label>Sector</Form.Label>
                            <Form.Control
                            type="text"
                            name="sector"
                            value={formData.sector}
                            onChange={handleChange}
                            maxLength={10}
                            />
                        </Form.Group>
                        <Row className="g-2">
                        <Col md={6}>
                        {formErrors.horario_mañana_id && (
                    <div className="text-danger">{formErrors.horario_mañana_id}</div>
                )}
                        <SelectComponent
                            options={filterOptions.horarioMañanaOptions}  // Usar el estado filterOptions
                            nameField="descripcion"
                            valueField="id"
                            selectedValue={formData.horario_mañana_id}
                            handleChange={handleChange}
                            controlId="horario_mañana_id"
                            label="Horario Mañana"
                            required

                        />
                        </Col>

                        <Col md={6}>
                        {formErrors.horario_tarde_id && (
                    <div className="text-danger">{formErrors.horario_tarde_id}</div>
                )}
                        <SelectComponent
                            options={filterOptions.horarioTardeOptions}  // Usar el estado filterOptions
                            nameField="descripcion"
                            valueField="id"
                            selectedValue={formData.horario_tarde_id}
                            handleChange={handleChange}
                            controlId="horario_tarde_id"
                            label="Horario Tarde"
                            required

                        />
                        </Col>
                        </Row>
                        
                            <div className="d-flex justify-content-around">
                                <Button variant="success" onClick={handleInscripcion} className='mt-3'>
                                    Inscribir en Bolsa de Empleo
                                </Button>
                                
                                </div>  
                            </div>

                            
                        )}

                        <Button
                            variant="secondary"
                            onClick={() => navigate(-1)}
                            className="mt-4"
                        >
                            Volver
                            
                        </Button>
                    
                    </div>
                    </Form.Group>


                    </div>
                  

</div>
        
    );
};

export default IncsParticipanteBolsa;
