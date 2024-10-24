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

const userId = parseInt(localStorage.getItem('user'));  // ID del usuario logueado
const endpoint = 'http://localhost:8000/api';


const InscripcionCursos = () => {
    const { cursoId } = useParams();
    const [cedula, setCedula] = useState('');
    const [datos, setDatos] = useState(null);
    const [curso, setCurso] = useState(null);
    const [error, setError] = useState('');
    const { setLoading } = useLoading();
    const navigate = useNavigate();
    const [selectVisible, setSelectVisible] = useState(false);  // Control de la visibilidad de los selectores
    const [showModal, setShowModal] = useState(false);  // Estado para mostrar/ocultar modal
    const [patrocinanteSeleccionado, setPatrocinanteSeleccionado] = useState(null);  // Estado para almacenar patrocinante seleccionado
    const handleCloseModal = () => setShowModal(false); // Cierra el modal
    const [patrocinantes, setPatrocinantes] = useState([]); // Estado para lista de patrocinantes
    const [searchCedula, setSearchCedula] = useState('');    // Estado para controlar búsqueda por cédula
    const [currentPage, setCurrentPage] = useState(1);  // Página actual
    const [totalPages, setTotalPages] = useState(1);    // Total de páginas
    const [inscripciones, setInscripciones] = useState([]); // Para almacenar inscripciones existentes del curso
    const [cedulaError, setCedulaError] = useState('');  // Estado para el mensaje de error si ya está inscrito
    const [isCedulaValid, setIsCedulaValid] = useState(true); // Estado para manejar si la cédula es válida
    const [formErrors, setFormErrors] = useState({}); // Estado para almacenar los mensajes de error


  
    



    const [filterOptions, setFilterOptions] = useState({
        cohorteOptions: [],
        centroOptions: [],
        periodoOptions: []
    });
    const [formData, setFormData] = useState({
        cohorte_id: '',
        centro_id: '',
        periodo_id: '',
        es_patrocinado: false,
        grupo:'',
        observaciones:''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };
    const handleSeleccionarPatrocinante = (patrocinante) => {
        setPatrocinanteSeleccionado(patrocinante);  // Guarda el patrocinante seleccionado
        setFormData(prevData => ({
            ...prevData,
            patrocinante_id: patrocinante.id  // Almacena el ID del patrocinante seleccionado
        }));
        handleCloseModal();  // Cierra el modal después de seleccionar
    };
    
    
    


    useEffect(() => {
        setLoading(true);
        Promise.all([fetchCurso()]).finally(() => {
            setLoading(false);
        });
    }, [cursoId]);
    

    const fetchCurso = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${endpoint}/cursos/${cursoId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setCurso(response.data);
        } catch (error) {
            console.error('Error fetching curso:', error);
            setError('Error fetching curso');
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
    
                // Verificar si la cédula ya está inscrita en el curso
                const inscripcionResponse = await axios.get(`${endpoint}/cursos_inscripcion/validate`, {
                    params: { curso_id: cursoId, cedula_identidad: selectedCedula },  // Enviar los parámetros para validar
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
    
                if (inscripcionResponse.data.alreadyRegistered) {
                    // Mostrar mensaje de error si ya está inscrita
                    setCedulaError('La cédula ya está inscrita en este curso.');
                    setIsCedulaValid(false);  // Marcar la cédula como inválida
                    setDatos(null);  // No guardar los datos
                    return;
                } else {
                    setCedulaError('');  // Limpiar error si no está inscrita
                    setIsCedulaValid(true);  // Marcar la cédula como válida
                }
    
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
    

    const handleSeleccionar = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${endpoint}/select-inc`, {
                headers: { Authorization: `Bearer ${token}` }
            });
    
            const { cohorte, centro, periodo } = response.data;
    
            // Guardar las opciones en el estado de filterOptions
            setFilterOptions({
                cohorteOptions: cohorte,
                centroOptions: centro,
                periodoOptions: periodo
            });
    
            setSelectVisible(true);  // Mostrar los selectores
        } catch (error) {
            console.error('Error fetching filter options:', error);
        }
    };
    
    

    const fetchPatrocinantes = async (page = 1) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${endpoint}/patrocinantes?page=${page}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const patrocinantesData = Array.isArray(response.data.data) ? response.data.data : []; // Asegurar que sea un array
            setPatrocinantes(patrocinantesData);  // Guardar los patrocinantes en el estado
            setTotalPages(response.data.last_page);  // Actualizar el total de páginas desde la respuesta
        } catch (error) {
            console.error('Error fetching patrocinantes:', error);
            setPatrocinantes([]); // En caso de error, definir un array vacío
        }
    };
    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(prevPage => prevPage + 1);
            fetchPatrocinantes(currentPage + 1);
        }
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(prevPage => prevPage - 1);
            fetchPatrocinantes(currentPage - 1);
        }
    }


    const filteredPatrocinantes = Array.isArray(patrocinantes) 
        ? patrocinantes.filter(patrocinante =>
            patrocinante.rif_cedula.toLowerCase().includes(searchCedula.toLowerCase())
        )
        : [];
    
    
    // Llama a `fetchPatrocinantes` al abrir el modal:
    const handleOpenModal = () => {
        fetchPatrocinantes(currentPage);  // Obtener los patrocinantes de la página actual
        setShowModal(true);               // Mostrar el modal
    };


const handleInscripcion = async () => {
    // Objeto para almacenar errores
    let errors = {};

    // Validar si hay campos vacíos (excepto es_patrocinado)
    if (!cedula) errors.cedula = 'La cédula es requerida';
    if (!formData.cohorte_id) errors.cohorte_id = 'El cohorte es requerido';
    if (!formData.centro_id) errors.centro_id = 'El centro es requerido';
    if (!formData.periodo_id) errors.periodo_id = 'El periodo es requerido';
    if (!formData.grupo) errors.grupo = 'El grupo es requerido';

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
            status_pay: formData.es_patrocinado === "true" ? 3 : 1,  // Agregar status_pay basado en patrocinado
            patrocinante_id: formData.es_patrocinado === "true" ? patrocinanteSeleccionado?.id : null, // Si patrocinado, agregar patrocinante_id
            // Agregar otros campos que no están en el formulario
            cedula_identidad: cedula,
            datos_identificacion_id: formData.datos_identificacion_id, // Usar el ID de la identificación seleccionada
            curso_id: cursoId,
            area_id: curso.area_id,
            modalidad_id: curso.modalidad_id,
            nivel_id: curso.nivel_id,
            unidad_id: curso.unidad_id,
            tipo_programa_id: curso.tipo_programa_id,
        };

        // 1. Realizar la inscripción con todos los datos
        const inscripcionResponse = await axios.post(`${endpoint}/cursos_inscripcion`, formDataWithStatus, {
            headers: { Authorization: `Bearer ${token}` },
        });

        const inscripcionId = inscripcionResponse.data.id;  // El ID de la inscripción

        // 2. Si es patrocinado, crear la petición adicional
        if (formData.es_patrocinado === "false" || !formData.es_patrocinado) {
            const peticionResponse = await axios.post(`${endpoint}/peticiones`, {
                zona_id: 3,
                comentario: 'Pago no realizado',
                user_id: userId,
                role_id: 4,
                status: false,
                key: inscripcionId,  // Usar el ID de la inscripción como key
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });
        }

        // Si la inscripción fue exitosa, redirigir
        toast.success("Participante inscrito con éxito");
        navigate(`/inscritos/${cursoId}`);
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
            <h1>Inscripción al Curso {curso && ` ${curso.cod}`}</h1>
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
            {error && <div className="alert alert-danger">{error}</div>}
            {datos && (
                <div className="mt-3">
                <div className="d-flex">
                    <p className="me-3"><strong>Nombres:</strong> {datos.nombres}</p>
                    <p><strong>Apellidos:</strong> {datos.apellidos}</p>
                </div>
                <div className="d-flex">
                    <p className="me-3"><strong>Edad:</strong> {datos.edad}</p>
                    <p ><strong>Email:</strong> {datos.direccion_email}</p>
                    
                </div>
                <Button variant="info" onClick={handleSeleccionar}>
                    Seleccionar
                </Button>

            </div>
            
            )}

            {selectVisible && filterOptions && (
                <div className="mt-3">
                    <Row className="g-2">
                    <Col md={6}>
                    {/* Cohorte Selector */}
                    {formErrors.cohorte_id && (
                    <div className="text-danger">{formErrors.cohorte_id}</div>
                )}
                    <SelectComponent
                        options={filterOptions.cohorteOptions}  // Usar el estado filterOptions
                        nameField="descripcion"
                        valueField="id"
                        selectedValue={formData.cohorte_id}
                        handleChange={handleChange}
                        controlId="cohorte_id"
                        label="Cohorte"
                        required
                    />


                    {/* Centro Selector */}
                    {formErrors.centro_id && (
                    <div className="text-danger">{formErrors.centro_id}</div>
                )}
                    <SelectComponent
                        options={filterOptions.centroOptions}  // Usar el estado filterOptions
                        nameField="descripcion"
                        valueField="id"
                        selectedValue={formData.centro_id}
                        handleChange={handleChange}
                        controlId="centro_id"
                        label="Centro"
                        required
                    />
                    </Col>

                    <Col md={6}>
                    {/* Periodo Selector */}
                    {formErrors.periodo_id && (
                    <div className="text-danger">{formErrors.periodo_id}</div>
                )}
                    <SelectComponent
                        options={filterOptions.periodoOptions}  // Usar el estado filterOptions
                        nameField="descripcion"
                        valueField="id"
                        selectedValue={formData.periodo_id}
                        handleChange={handleChange}
                        controlId="periodo_id"
                        label="Periodo"
                        required

                    />


                    {/* Es grupo */}
                    {formErrors.grupo && (
                        <div className="text-danger">{formErrors.grupo}</div>
                    )}
                    <Form.Group controlId="grupo">
                        <Form.Label>Grupo</Form.Label>
                        <Form.Control
                            type="text"
                            name="grupo"
                            value={formData.grupo}
                            onChange={handleChange}
                            required
                        />
                        </Form.Group>

                        </Col>
                        </Row>
                        
                        <Form.Group controlId="es_patrocinado">
                        <Form.Label>¿Es patrocinado?</Form.Label>
                        <Form.Control as="select" name="es_patrocinado" value={formData.es_patrocinado} onChange={handleChange}>
                            <option value="">Seleccione</option>
                            <option value={true}>Sí</option>
                            <option value={false}>No</option>
                        </Form.Control>
                        

                        </Form.Group>
                        {/* Mostrar el campo de patrocinante solo si es_patrocinado es true */}
                        {formData.es_patrocinado === "true" && (
                                <Form.Group controlId="patrocinante">
                                    <Form.Label>Patrocinante seleccionado</Form.Label>
                                    <div className="d-flex">
                                        {patrocinanteSeleccionado ? (
                                            <>
                                                <Form.Control 
                                                    type="text" 
                                                    value={patrocinanteSeleccionado.nombre_patrocinante} 
                                                    readOnly 
                                                />
                                                <Button variant="secondary" onClick={handleOpenModal} className="ms-2">
                                                    Cambiar
                                                </Button>
                                            </>
                                        ) : (
                                            <Button variant="info" onClick={handleOpenModal}>
                                                Buscar Patrocinante
                                            </Button>
                                        )}
                                    </div>
                                </Form.Group>
                            )}
                            {formErrors.general && (
            <div className="text-danger">{formErrors.general}</div>
        )}
                            
                        <Form.Group controlId="observaciones">
                        <Form.Label>Observaciones</Form.Label>
                        <Form.Control
                            as="textarea"
                            name="observaciones"
                            value={formData.observaciones}
                            onChange={handleChange}
                        />
                        </Form.Group>
                        
                            <div className="d-flex justify-content-around">
                                <Button variant="success" onClick={handleInscripcion} className='mt-3'>
                                    Inscribir
                                </Button>
                                </div>  
                            </div>
                        )}

                        <Button
                            variant="secondary"
                            onClick={() => navigate(`/inscritos/${cursoId}`)}
                            className="mt-4"
                        >
                            Volver
                            
                        </Button>
                    
                    </div>
                    </Form.Group>


                    </div>
                    <Modal show={showModal} onHide={handleCloseModal} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Seleccionar Patrocinante</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Control 
                        type="text" 
                        placeholder="Buscar por Rif/Cédula" 
                        onChange={(e) => setSearchCedula(e.target.value)} 
                        className="mb-3"
                    />
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>Rif/Cédula</th>
                                <th>Nombre</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPatrocinantes.map((patrocinante) => (
                                <tr key={patrocinante.id}>
                                    <td>{patrocinante.rif_cedula}</td>
                                    <td>{patrocinante.nombre_patrocinante}</td>
                                    <td>
                                    <div className="d-flex justify-content-center align-items-center">
                                        <Button variant="info"  onClick={() => handleSeleccionarPatrocinante(patrocinante)} className="me-2">
                                             <i className="bi bi-check2-square"></i>
                                        </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
        </Table>
    </Modal.Body>
    <Modal.Footer>
    <Button 
        variant="secondary" 
        onClick={handlePreviousPage} 
        disabled={currentPage === 1}
    >
        Anterior
    </Button>
    <Button 
        variant="secondary" 
        onClick={handleNextPage} 
        disabled={currentPage === totalPages}
    >
        Siguiente
    </Button>
    <Button variant="secondary" onClick={handleCloseModal}>
        Cerrar
    </Button>
</Modal.Footer>
</Modal>



</div>
        
    );
};

export default InscripcionCursos;
