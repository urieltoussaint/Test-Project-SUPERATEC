import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { useParams, useNavigate } from 'react-router-dom';
import { useLoading } from '../../components/LoadingContext'; 
import { ToastContainer, toast } from 'react-toastify';
import PaginationTable from '../../components/PaginationTable'; // Importa el componente
import { Card, Row, Col } from 'react-bootstrap'; 
import { Modal, Table } from 'react-bootstrap';
import SelectComponent from '../../components/SelectComponent';

const userId = parseInt(localStorage.getItem('user'));  // ID del usuario logueado
const endpoint = 'http://localhost:8000/api';

const InscribirCedula = () => {
    const { cursoId } = useParams();
    const { cedula } = useParams();
    const [cursos, setCursos] = useState([]);
    const [searchCod, setSearchCod] = useState(''); // Nuevo estado para el buscador por COD
    const [filteredCursos, setFilteredCursos] = useState([]);
    const [searchCurso, setSearchCurso] = useState('');
    const [areaOptions, setAreaOptions] = useState([]);
    const [selectedArea, setSelectedArea] = useState('');
    const [error, setError] = useState(null);
    const { setLoading } = useLoading();
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(1);  // Estado para la página actual
    const [selectVisible, setSelectVisible] = useState(false);  // Control de la visibilidad de los selectores
    const [formErrors, setFormErrors] = useState({}); // Estado para almacenar los mensajes de error
    const [patrocinanteSeleccionado, setPatrocinanteSeleccionado] = useState(null);  // Estado para almacenar patrocinante seleccionado
    const handleCloseModal = () => setShowModal(false); // Cierra el modal
    const [showModal, setShowModal] = useState(false);  // Estado para mostrar/ocultar modal
    const [patrocinantes, setPatrocinantes] = useState([]); // Estado para lista de patrocinantes
    const [totalPages, setTotalPages] = useState(1);    // Total de páginas
    const [searchCedula, setSearchCedula] = useState('');    // Estado para controlar búsqueda por cédula
    const [datos, setDatos] = useState(null);
    const [curso, setCurso] = useState(null);
    const [patrocinanteSeleccionado1, setPatrocinanteSeleccionado1] = useState(null);
    const [patrocinanteSeleccionado2, setPatrocinanteSeleccionado2] = useState(null);
    const [patrocinanteSeleccionado3, setPatrocinanteSeleccionado3] = useState(null);
    const [currentPatrocinante, setCurrentPatrocinante] = useState(null); // Para saber cuál botón abrió el modal


    const [showCursoModal, setShowCursoModal] = useState(false); // Mostrar/ocultar modal de cursos

const [totalCursoPages, setTotalCursoPages] = useState(1); // Total de páginas para cursos




    const itemsPerPage = 3;  // Definir cuántos elementos por página

    useEffect(() => {
        if (cedula) {
            searchDatos(); // Llama a la búsqueda de datos cuando cambie la cédula
        }
    }, [cedula]); // Ejecutar solo cuando cambia la cédula
    
    useEffect(() => {
        setLoading(true);
        handleSeleccionar(); // Solo ejecutar una vez, cuando se monta el componente
    }, []); // Ejecutar una vez, al montar
    
 

    
    

    const cursosPaginados = filteredCursos.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
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
    

    const handleOpenCursoModal = () => {
        fetchCursos(currentPage);  // Obtener los cursos de la página actual
        setShowCursoModal(true);   // Mostrar el modal de cursos
    };
    
    

   
    const [filterOptions, setFilterOptions] = useState({
        cohorteOptions: [],
        centroOptions: [],
        periodoOptions: [],
        areaOptions: [],
        modalidadOptions: [],
        tipoProgramaOptions: [],
        nivelOptions: [],
        unidadOptions: [],
    });
    
    const [formData, setFormData] = useState({
        cohorte_id: '',
        centro_id: '',
        periodo_id: '',
        es_patrocinado: false,
        grupo:'',
        observaciones:'',
        
    });


    const [filtrosCurso, setFiltrosCurso] = useState({
        area_id: '',
        modalidad_id: '',
        nivel_id: '',
        tipo_programa_id: '',
        unidad_id:'',
        cod:'',
    });

    useEffect(() => {
        handleFiltersChange(); // Función que aplicará los filtros cada vez que un filtro cambie
    }, [filtrosCurso]); // Observa los cambios en los filtros
    
    const fetchCursos = async () => {
        try {
            const token = localStorage.getItem('token');
            let allCursos = [];
            let currentPage = 1;
            let totalPages = 1;
            
            // Fetch courses page by page
            while (currentPage <= totalPages) {
                const response = await axios.get(`${endpoint}/cursos`, {
                    params: { page: currentPage },
                    headers: { Authorization: `Bearer ${token}` },
                });
    
                allCursos = [...allCursos, ...response.data.data];
                totalPages = response.data.last_page;
                currentPage++;
            }
            
            setCursos(allCursos);  // Guardar todos los cursos en el estado
            setFilteredCursos(allCursos);  // Inicialmente mostrar todos
        } catch (error) {
            console.error('Error fetching courses:', error);
            setCursos([]);
        }
    };
    const handleFiltersChange = () => {
        let filtered = cursos;
    
        if (filtrosCurso.area_id) {
            filtered = filtered.filter(curso => curso.area_id === parseInt(filtrosCurso.area_id));
        }
        if (filtrosCurso.modalidad_id) {
            filtered = filtered.filter(curso => curso.modalidad_id === parseInt(filtrosCurso.modalidad_id));
        }
        if (filtrosCurso.nivel_id) {
            filtered = filtered.filter(curso => curso.nivel_id === parseInt(filtrosCurso.nivel_id));
        }
        if (filtrosCurso.tipo_programa_id) {
            filtered = filtered.filter(curso => curso.tipo_programa_id === parseInt(filtrosCurso.tipo_programa_id));
        }
        if (filtrosCurso.unidad_id) {
            filtered = filtered.filter(curso => curso.unidad_id === parseInt(filtrosCurso.unidad_id));
        }
        if (filtrosCurso.cod) {
            filtered = filtered.filter(curso => curso.cod.toLowerCase().includes(filtrosCurso.cod.toLowerCase()));
        }
        
    
        setFilteredCursos(filtered);  // Actualiza los cursos filtrados
    };
    
    

    const handleSeleccionar = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${endpoint}/select-inc`, {
                headers: { Authorization: `Bearer ${token}` }
            });
    
            const { cohorte, centro, periodo, area, tipo_programa, unidad, modalidad, nivel } = response.data;
    
            // Guardar las opciones en el estado de filterOptions
            setFilterOptions({
                cohorteOptions: cohorte || [],
                centroOptions: centro || [],
                periodoOptions: periodo || [],
                areaOptions: area || [],
                tipoProgramaOptions: tipo_programa || [],
                unidadOptions: unidad || [],
                modalidadOptions: modalidad || [],
                nivelOptions: nivel || [],
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



    const handleSeleccionarCurso = (cursoSeleccionado) => {
        setCurso(cursoSeleccionado); // Guardar el curso seleccionado en el estado
        setFormData(prevData => ({
            ...prevData,
            curso_id: cursoSeleccionado.id,  // Almacenar el ID del curso seleccionado
        }));
        setShowCursoModal(false); // Cerrar el modal
    };
    const handleNextCursoPage = () => {
        if (currentPage * itemsPerPage < filteredCursos.length) {
            setCurrentPage(currentPage + 1);
        }
    };
    
    const handlePreviousCursoPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };
    
    
    const searchDatos = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${endpoint}/identificacion/${cedula}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setDatos(response.data); // Almacena los datos encontrados en el estado
        } catch (error) {
            if (error.response && error.response.status === 404) {
                setError('Datos no encontrados'); // Mostrar mensaje si no se encuentran datos
            } else {
                setError('Error al buscar los datos'); // Error de otro tipo
                console.error(error);
            }
        } finally {
            setLoading(false); // Detener el loading cuando termina la búsqueda
        }
    };
    

    const handleInscribir = async (action) => {
        let errors = {};
        
        if (!cedula) errors.cedula = 'La cédula es requerida';
        if (!formData.cohorte_id) errors.cohorte_id = 'El cohorte es requerido';
        if (!formData.centro_id) errors.centro_id = 'El centro es requerido';
        if (!formData.periodo_id) errors.periodo_id = 'El periodo es requerido';
        if (!formData.grupo) errors.grupo = 'El grupo es requerido';
        
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }
        
        try {
            const token = localStorage.getItem('token');
            
            const formDataComplete = {
                ...formData,
                status_curso:1,
                status_pay: formData.realiza_aporte === "false" && (!formData.es_patrocinado || formData.es_patrocinado === "false") ? 5 : (formData.es_patrocinado === "true" ? 4 : 1), 
                patrocinante_id: formData.es_patrocinado === "true" ? patrocinanteSeleccionado1?.id : null,
                patrocinante_id2: formData.es_patrocinado === "true" ? patrocinanteSeleccionado2?.id || null :null,
                patrocinante_id3: formData.es_patrocinado === "true" ? patrocinanteSeleccionado3?.id || null:null,
                cedula_identidad: cedula,
                curso_id: curso.id,
                area_id: curso?.area_id,
                modalidad_id: curso?.modalidad_id,
                nivel_id: curso?.nivel_id,
                unidad_id: curso?.unidad_id,
                tipo_programa_id: curso?.tipo_programa_id,
            };
            
            const inscripcionResponse = await axios.post(`${endpoint}/cursos_inscripcion`, formDataComplete, {
                headers: { Authorization: `Bearer ${token}` },
            });
            
            const inscripcionId = inscripcionResponse.data.id;
            
            if ((formData.es_patrocinado === "false" || !formData.es_patrocinado)&& formData.realiza_aporte==='true') {
                await axios.post(`${endpoint}/peticiones`, {
                    zona_id: 3,
                    comentario: 'Pago no realizado',
                    user_id: userId,
                    role_id: 4,
                    status: false,
                    key: inscripcionId,
                }, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            }
    
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
                navigate('/cursos');
            }
    
        } catch (error) {
            console.error('Error en la inscripción o en la creación de la petición:', error);
            setFormErrors({ general: 'Error en la inscripción o en la creación de la petición' });
        }
    };
    


    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div className="row" style={{ marginTop: '50px' }}>
        <div className="col-lg-6 mx-auto"> {/* Centrado del contenido */}
        <Form.Group controlId="cedula" className="custom-gutter" >
          <div className="card-box" style={{ padding: '20px', width: '100%', margin: '0 auto' }}>
            <h1>Inscripción al Curso {curso && ` ${curso.cod}`}</h1>
            <div>
                
            <Form.Group controlId="cedula" className="custom-gutter">
                <Form.Label>Cédula de Identidad</Form.Label>
                <Form.Control
                    type="text"
                    value={cedula}  // Usamos la cédula del parámetro de la URL
                    readOnly  // Hacemos el campo de solo lectura
                    className="is-valid"  // Marcamos el campo como válido directamente
                />
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


                        <Form.Group controlId="curso">
                            <Form.Label>Curso seleccionado</Form.Label>
                            <div className="d-flex">
                                {curso ? (
                                    <>
                                        <Form.Control 
                                            type="text" 
                                            value={curso.descripcion} 
                                            readOnly 
                                        />
                                        <Button variant="secondary" onClick={handleOpenCursoModal} className="ms-2">
                                            Cambiar
                                        </Button>
                                    </>
                                ) : (
                                    <Button variant="info" onClick={handleOpenCursoModal}>
                                        Seleccionar Curso
                                    </Button>
                                )}
                            </div>
                        </Form.Group>

                            
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
                                
                                </div>  
                            </div>
                        )}
                        
                        <div className="d-flex justify-content">
                        <Button variant="info" onClick={() => handleInscribir('guardar')} className='mt-3 'style={{marginRight:"10px"}}>
                            Inscribir y Guardar
                        </Button>

                        <Button variant="success" onClick={() => handleInscribir('siguiente')} className='mt-3 'style={{marginRight:"10px"}}>
                            Siguiente
                        </Button>



                            
                        </div>
                    
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

            <Modal show={showCursoModal} onHide={() => setShowCursoModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Seleccionar Curso</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                <Row className="mb-3 mt-3">
                <Col>
                    <Form.Control 
                        type="text" 
                        placeholder="Buscar por Código (COD)" 
                        value={filtrosCurso.cod} 
                        onChange={(e) => setFiltrosCurso({ ...filtrosCurso, cod: e.target.value })} 
                    />
                </Col>
            </Row>

                    <Row>
                        <Col>
                            <Form.Select onChange={(e) => setFiltrosCurso({ ...filtrosCurso, area_id: e.target.value })}>
                                <option value="">Filtrar por Área</option>
                                {filterOptions.areaOptions.map(area => (
                                    <option key={area.id} value={area.id}>{area.descripcion}</option>
                                ))}
                            </Form.Select>
                        </Col>
                        <Col>
                            <Form.Select onChange={(e) => setFiltrosCurso({ ...filtrosCurso, unidad_id: e.target.value })}>
                                <option value="">Filtrar por Unidad</option>
                                {filterOptions.unidadOptions.map(unidad => (
                                    <option key={unidad.id} value={unidad.id}>{unidad.descripcion}</option>
                                ))}
                            </Form.Select>
                        </Col>
                        <Col>
                            <Form.Select onChange={(e) => setFiltrosCurso({ ...filtrosCurso, modalidad_id: e.target.value })}>
                                <option value="">Filtrar por Modalidad</option>
                                {filterOptions.modalidadOptions.map(mod => (
                                    <option key={mod.id} value={mod.id}>{mod.descripcion}</option>
                                ))}
                            </Form.Select>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Form.Select onChange={(e) => setFiltrosCurso({ ...filtrosCurso, nivel_id: e.target.value })}>
                                <option value="">Filtrar por Nivel</option>
                                {filterOptions.nivelOptions.map(nivel => (
                                    <option key={nivel.id} value={nivel.id}>{nivel.descripcion}</option>
                                ))}
                            </Form.Select>
                        </Col>
                        <Col>
                            <Form.Select onChange={(e) => setFiltrosCurso({ ...filtrosCurso, tipo_programa_id: e.target.value })}>
                                <option value="">Filtrar por Tipo de Programa</option>
                                {filterOptions.tipoProgramaOptions.map(tipo => (
                                    <option key={tipo.id} value={tipo.id}>{tipo.descripcion}</option>
                                ))}
                            </Form.Select>
                        </Col>
                    </Row>

                    <Table striped bordered hover className='mt-3'>
                        <thead>
                            <tr>
                                <th>COD</th>
                                <th>Descripción</th>
                                <th>Horas</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cursosPaginados.map((curso) => (
                                <tr key={curso.id}>
                                    <td>{curso.cod}</td>
                                    <td>{curso.descripcion}</td>
                                    <td>{curso.cantidad_horas}</td>

                                    <td>
                                    <div className="d-flex justify-content-center align-items-center">
                                        <Button variant="info"  onClick={() => handleSeleccionarCurso(curso)} className="me-2">
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
                    <Button variant="secondary" onClick={handlePreviousCursoPage} disabled={currentPage === 1}>
                        Anterior
                    </Button>
                    <Button variant="secondary" onClick={handleNextCursoPage} disabled={currentPage * itemsPerPage >= filteredCursos.length}>
                        Siguiente
                    </Button>
                    <Button variant="secondary" onClick={() => setShowCursoModal(false)}>
                        Cerrar
                    </Button>
                </Modal.Footer>
            </Modal>





</div>
        
    );
};

export default InscribirCedula;