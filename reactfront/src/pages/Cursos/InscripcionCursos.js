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
    const handleCloseModal = () => setShowModal(false); // Cierra el modal
    const [patrocinantes, setPatrocinantes] = useState([]); // Estado para lista de patrocinantes
    const [totalPages, setTotalPages] = useState(1);    // Total de páginas
    const [cedulaError, setCedulaError] = useState('');  // Estado para el mensaje de error si ya está inscrito
    const [isCedulaValid, setIsCedulaValid] = useState(true); // Estado para manejar si la cédula es válida
    const [formErrors, setFormErrors] = useState({}); // Estado para almacenar los mensajes de error
    const [patrocinanteSeleccionado1, setPatrocinanteSeleccionado1] = useState(null);
    const [patrocinanteSeleccionado2, setPatrocinanteSeleccionado2] = useState(null);
    const [patrocinanteSeleccionado3, setPatrocinanteSeleccionado3] = useState(null);
    const [currentPatrocinante, setCurrentPatrocinante] = useState(null); // Para saber cuál botón abrió el modal
    const [paginatedPatrocinantes, setPaginatedPatrocinantes] = useState([]); // Patrocinantes en la página actual
    const [inscripcionId, setInscripcionId] = useState([]); // Patrocinantes en la página actual

    const [currentPagePatrocinantes, setCurrentPagePatrocinantes] = useState(1);
    const userRole = localStorage.getItem('role');
    
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
        observaciones:''
    });
    const [filtrosPatrocinante, setFiltrosPatrocinante] = useState({
        rif_cedula:'',
        nombre_patrocinante: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleFilterPatrocinantesChange = (e) => {
        const { name, value } = e.target;
        setFiltrosPatrocinante(prev => ({ ...prev, [name]: value }));
      };
      
      const handlePatrocinantesPageChange = async (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            await getAllPatrocinantes(newPage);
        }
      };

    const handleSeleccionarPatrocinante = (patrocinante) => {
        if (currentPatrocinante === 1) {
            setPatrocinanteSeleccionado1(patrocinante);
            setFormData(prevData => ({ ...prevData, patrocinante_id: patrocinante.id }));
        } else if (currentPatrocinante === 2) {
            setPatrocinanteSeleccionado2(patrocinante);
            setFormData(prevData => ({ ...prevData, patrocinante_id2: patrocinante.id }));
        } else if (currentPatrocinante === 3) {
            setPatrocinanteSeleccionado3(patrocinante);
            setFormData(prevData => ({ ...prevData, patrocinante_id3: patrocinante.id }));
        }
        handleCloseModal();
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

    
    
    

    const getAllPatrocinantes = async (page = 1) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${endpoint}/patrocinantes-paginate`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { ...filtrosPatrocinante, page }, // Incluye `page` en los parámetros
            });
    
            const { data, last_page, current_page } = response.data.patrocinantes;
    
            // Actualizar el estado
            setPaginatedPatrocinantes(data); // Datos de la página actual
            setCurrentPagePatrocinantes(current_page); // Página actual
            setTotalPages(last_page); // Total de páginas
            setPatrocinantes(data);
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('Error fetching data');
            setPaginatedPatrocinantes([]); // Limpia los datos en caso de error
            setPatrocinantes([]);
        }
    };

  
        const handleOpenModal = () => {
            getAllPatrocinantes(); // Cargar todos los patrocinantes
            setShowModal(true); // Mostrar el modal
        };

const handleInscripcion = async (action) => {
    // Objeto para almacenar errores
    let errors = {};

    // Validar si hay campos vacíos (excepto es_patrocinado)
    if (!cedula) errors.cedula = 'La cédula es requerida';
    if (!formData.cohorte_id) errors.cohorte_id = 'El cohorte es requerido';
    if (!formData.centro_id) errors.centro_id = 'El centro es requerido';
    if (!formData.periodo_id) errors.periodo_id = 'El periodo es requerido';

    // Si hay errores, detener la función y mostrar los errores
    if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        return;
    }

    try {
        const token = localStorage.getItem('token');

        if (userRole==='admin') {

        // Crear un nuevo objeto formDataWithStatus que extiende el formData original
        const formDataWithStatus = {
            ...formData,
            status_pay: formData.realiza_aporte === "false" && (!formData.es_patrocinado || formData.es_patrocinado === "false") ? 5 : (formData.es_patrocinado === "true" ? 4 : 1), 
            status_curso:1,
            patrocinante_id: formData.es_patrocinado === "true" ? patrocinanteSeleccionado1?.id : null,
            patrocinante_id2: formData.es_patrocinado === "true" ? patrocinanteSeleccionado2?.id || null :null,
            patrocinante_id3: formData.es_patrocinado === "true" ? patrocinanteSeleccionado3?.id || null:null,
            cedula_identidad: cedula,
            datos_identificacion_id: formData.datos_identificacion_id, // Usar el ID de la identificación seleccionada
            curso_id: cursoId,
            check:false
      
        };

        // 1. Realizar la inscripción con todos los datos
        const inscripcionResponse = await axios.post(`${endpoint}/cursos_inscripcion`, formDataWithStatus, {
            headers: { Authorization: `Bearer ${token}` },
        });
        setInscripcionId(inscripcionResponse.data.id);
        console.log(inscripcionId);
    }

        else if (userRole!='admin') {
            
       
            // Crear un nuevo objeto formDataWithStatus que extiende el formData original
            const formDataWithStatus = {
                ...formData,
                status_pay: formData.realiza_aporte === "false" && (!formData.es_patrocinado || formData.es_patrocinado === "false") ? 5 : (formData.es_patrocinado === "true" ? 4 : 1), 
                status_curso:1,
                patrocinante_id: formData.es_patrocinado === "true" ? patrocinanteSeleccionado1?.id : null,
                patrocinante_id2: formData.es_patrocinado === "true" ? patrocinanteSeleccionado2?.id || null :null,
                patrocinante_id3: formData.es_patrocinado === "true" ? patrocinanteSeleccionado3?.id || null:null,
                cedula_identidad: cedula,
                datos_identificacion_id: formData.datos_identificacion_id, // Usar el ID de la identificación seleccionada
                curso_id: cursoId,
                check:true
          
            };
    
            // 1. Realizar la inscripción con todos los datos
            const inscripcionResponse = await axios.post(`${endpoint}/cursos_inscripcion`, formDataWithStatus, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setInscripcionId(inscripcionResponse.data.id);
            console.log(inscripcionId);
        };
        // const inscripcionId = inscripcionResponse.data.id;  // El ID de la inscripción};


        // 2. Crear petición par confirmar inscripcion
        if (userRole==='admin') {
            const peticionResponse = await axios.post(`${endpoint}/peticiones`, {
                zona_id: 10,
                comentario: 'Inscripcion no confirmada',
                user_id: userId,
                role_id: 1,
                status: false,
                key: inscripcionId,  // Usar el ID de la inscripción como key
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });
        }
        // if ((formData.es_patrocinado === "false" || !formData.es_patrocinado)&& formData.realiza_aporte==='true') {
        //     const peticionResponse = await axios.post(`${endpoint}/peticiones`, {
        //         zona_id: 3,
        //         comentario: 'Pago no realizado',
        //         user_id: userId,
        //         role_id: 4,
        //         status: false,
        //         key: inscripcionId,  // Usar el ID de la inscripción como key
        //     }, {
        //         headers: { Authorization: `Bearer ${token}` },
        //     });
        // }
        

        // Si la inscripción fue exitosa, redirigir
        toast.success("Participante inscrito con éxito");
        // Redirigir dependiendo de la acción seleccionada y del valor de es_patrocinado
        if (action === 'siguiente') {
            if ((formData.es_patrocinado === "false" || !formData.es_patrocinado)&& formData.realiza_aporte==='true') {
                // Si no es patrocinado, redirigir a pagos
                navigate(`/pagos/${cedula}/${inscripcionId}`);
            } else {
                // Si es patrocinado, redirigir a cursos
                navigate('/cursos');
            }
        } else {
            // Si la acción es 'guardar', redirigir siempre a cursos
            navigate(`/inscritos/${cursoId}`);
        }
        
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

                        </Row>
                        <Form.Group controlId="realiza_aporte">
                        <Form.Label>¿Realiza Aporte?</Form.Label>
                        <Form.Control as="select" name="realiza_aporte" value={formData.realiza_aporte} onChange={handleChange}>
                            <option value="">Seleccione</option>
                            <option value={true}>Sí</option>
                            <option value={false}>No</option>
                        </Form.Control>
                        </Form.Group>
                        
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
                            <>
                                <Form.Group controlId="patrocinante1">
                                    <Form.Label>Patrocinante 1 (Obligatorio)</Form.Label>
                                    <div className="d-flex">
                                        <Form.Control 
                                            type="text" 
                                            value={patrocinanteSeleccionado1 ? patrocinanteSeleccionado1.nombre_patrocinante : 'No seleccionado'} 
                                            readOnly 
                                        />
                                        <Button variant="secondary" onClick={() => { setCurrentPatrocinante(1); handleOpenModal(); }} className="ms-2">
                                            {patrocinanteSeleccionado1 ? 'Cambiar' : 'Seleccionar'}
                                        </Button>
                                        {patrocinanteSeleccionado1 && (
                                            <Button variant="danger" onClick={() => setPatrocinanteSeleccionado1(null)} className="ms-2">
                                                Deseleccionar
                                            </Button>
                                        )}
                                    </div>
                                </Form.Group>
                                
                                <Form.Group controlId="patrocinante2">
                                    <Form.Label>Patrocinante 2 (Opcional)</Form.Label>
                                    <div className="d-flex">
                                        <Form.Control 
                                            type="text" 
                                            value={patrocinanteSeleccionado2 ? patrocinanteSeleccionado2.nombre_patrocinante : 'No seleccionado'} 
                                            readOnly 
                                        />
                                        <Button variant="secondary" onClick={() => { setCurrentPatrocinante(2); handleOpenModal(); }} className="ms-2">
                                            {patrocinanteSeleccionado2 ? 'Cambiar' : 'Seleccionar'}
                                        </Button>
                                        {patrocinanteSeleccionado2 && (
                                            <Button variant="danger" onClick={() => setPatrocinanteSeleccionado2(null)} className="ms-2">
                                                Deseleccionar
                                            </Button>
                                        )}
                                    </div>
                                </Form.Group>

                                <Form.Group controlId="patrocinante3">
                                    <Form.Label>Patrocinante 3 (Opcional)</Form.Label>
                                    <div className="d-flex">
                                        <Form.Control 
                                            type="text" 
                                            value={patrocinanteSeleccionado3 ? patrocinanteSeleccionado3.nombre_patrocinante : 'No seleccionado'} 
                                            readOnly 
                                        />
                                        <Button variant="secondary" onClick={() => { setCurrentPatrocinante(3); handleOpenModal(); }} className="ms-2">
                                            {patrocinanteSeleccionado3 ? 'Cambiar' : 'Seleccionar'}
                                        </Button>
                                        {patrocinanteSeleccionado3 && (
                                            <Button variant="danger" onClick={() => setPatrocinanteSeleccionado3(null)} className="ms-2">
                                                Deseleccionar
                                            </Button>
                                        )}
                                    </div>
                                </Form.Group>
                            </>
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
                                <Button variant="info" onClick={handleInscripcion} className='mt-3'>
                                    Inscribir y Guardar
                                </Button>
                                <Button variant="success" onClick={() => handleInscripcion('siguiente')} className='mt-3 'style={{marginRight:"10px"}}>
                                 Siguiente
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
                    <Modal show={showModal} onHide={handleCloseModal} size="lg">
                    <Modal.Header closeButton>
                        <Modal.Title>Seleccionar Patrocinante</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                    <div className="d-flex align-items-center">

                        <Form.Control 
                            name="rif_cedula"
                            type="text" 
                            placeholder="Buscar por Rif/Cédula" 
                            value={filtrosPatrocinante.rif_cedula}
                            onChange={handleFilterPatrocinantesChange} 
                            className="mb-3"
                        />
                        <Form.Control 
                            name="nombre_patrocinante"
                            type="text" 
                            placeholder="Buscar por Nombre" 
                            value={filtrosPatrocinante.nombre_patrocinante}
                            onChange={handleFilterPatrocinantesChange} 
                            className="mb-3"
                        />
                        <Button 
                            variant="info me-2" 
                            onClick={getAllPatrocinantes}
                            style={{ padding: '5px 10px', width: '120px' }} // Ajusta padding y ancho
                        >
                            <FaSearch className="me-1" /> {/* Ícono de lupa */}
                        </Button>
                    </div>

                        <Table striped bordered hover>
                            <thead>
                                <tr>
                                    <th>Rif/Cédula</th>
                                    <th>Nombre</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                
                                {paginatedPatrocinantes.map((patrocinante) => (
                                    <tr key={patrocinante.id}>
                                        <td>{patrocinante.rif_cedula}</td>
                                        <td>{patrocinante.nombre_patrocinante}</td>
                                        <td>
                                            <div className="d-flex justify-content-center align-items-center">
                                                <Button variant="info" onClick={() => handleSeleccionarPatrocinante(patrocinante)} className="me-2">
                                                    <i className="bi bi-check2-square"></i>
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                        <div className="d-flex justify-content-between mt-3">
                            

                            <Button
                                variant="secondary"
                                onClick={() => handlePatrocinantesPageChange(currentPagePatrocinantes - 1)}
                                disabled={currentPagePatrocinantes === 1}
                            >
                                Anterior
                            </Button>
                            

                            <Button
                                variant="secondary"
                                onClick={() => handlePatrocinantesPageChange(currentPagePatrocinantes + 1)}
                                disabled={currentPagePatrocinantes === totalPages}
                            >
                                Siguiente
                            </Button>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseModal}>
                            Cerrar
                        </Button>
                    </Modal.Footer>
                </Modal>

</div>
        
    );
};

export default InscripcionCursos;
