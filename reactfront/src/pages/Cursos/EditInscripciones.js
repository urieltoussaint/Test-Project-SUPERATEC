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
import { FaSearch } from 'react-icons/fa';  // Importamos íconos de react-icons


const userId = parseInt(localStorage.getItem('user'));  // ID del usuario logueado
const endpoint = 'http://localhost:8000/api';

const EditInscripciones = () => {
    const { inscripcionId } = useParams();
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
    const [inscripcion, setInscripcion] = useState(null);
    const [curso, setCurso] = useState(null);
    const [patrocinanteSeleccionado1, setPatrocinanteSeleccionado1] = useState(null);
    const [patrocinanteSeleccionado2, setPatrocinanteSeleccionado2] = useState(null);
    const [patrocinanteSeleccionado3, setPatrocinanteSeleccionado3] = useState(null);
    const [currentPatrocinante, setCurrentPatrocinante] = useState(null); // Para saber cuál botón abrió el modal
    const [paginatedPatrocinantes, setPaginatedPatrocinantes] = useState([]); // Patrocinantes en la página actual
    const [currentPagePatrocinantes, setCurrentPagePatrocinantes] = useState(1);


// Cursos que se mostrarán en la página actual




    const itemsPerPage = 3;  // Definir cuántos elementos por página

    useEffect(() => {
        console.log("ID de inscripción:", inscripcionId); // Para verificar si inscripcionId tiene valor

        getInscripcion();
        // if (cedula) {
        //     searchDatos(); // Llama a la búsqueda de datos cuando cambie la cédula
        // }
        
    }, [inscripcionId]); // Ejecutar solo cuando cambia la cédula
    
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

    
    
    const getInscripcion = async () => {
        if (!inscripcionId) {
            setError('Error: ID de inscripción no proporcionado.');
            return;
        }
    
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${endpoint}/cursos_inscripcion/${inscripcionId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
    
            const inscripcionData = response.data;
            setInscripcion(inscripcionData);
            setDatos(response.data.datos_identificacion); // Almacena los datos encontrados en el estado
    
            setFormData({
                cedula_identidad: inscripcionData.cedula_identidad || '',
                cohorte_id: inscripcionData.cohorte_id || '',
                periodo_id: inscripcionData.periodo_id || '',
                centro_id: inscripcionData.centro_id || '',
                nivel_id: inscripcionData.nivel_id || '',
                grupo: inscripcionData.grupo || '',
                es_patrocinado: inscripcionData.es_patrocinado || '',
                patrocinante_id: inscripcionData.patrocinante_id || '',
                observaciones: inscripcionData.observaciones || '',
            });
            setLoading(false);
    
        } catch (error) {
            setError('Error fetching course');
            console.error('Error fetching course:', error);
        }
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
    
    

    const [filtrosPatrocinante, setFiltrosPatrocinante] = useState({
        rif_cedula:'',
        nombre_patrocinante: '',
    });
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
    const handlePatrocinantesPageChange = async (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            await getAllPatrocinantes(newPage);
        }
      };
      const handleFilterPatrocinantesChange = (e) => {
        const { name, value } = e.target;
        setFiltrosPatrocinante(prev => ({ ...prev, [name]: value }));
      };

    

    const filteredPatrocinantes = Array.isArray(patrocinantes) 
        ? patrocinantes.filter(patrocinante =>
            patrocinante.rif_cedula.toLowerCase().includes(searchCedula.toLowerCase())
        )
        : [];
    
    
    // Llama a `fetchPatrocinantes` al abrir el modal:
    const handleOpenModal = () => {
        getAllPatrocinantes(currentPage);  // Obtener los patrocinantes de la página actual
        setShowModal(true);               // Mostrar el modal
    };

    


    const handleInscribir = async () => {
        try {
            const token = localStorage.getItem('token');
            
            if (!token) {
                toast.error('Error: Token no encontrado');
                return;
            }
    
            const response = await axios.put(
                `${endpoint}/inscripcion_cursos/${inscripcionId}`, 
                { ...formData, 
                status_pay: formData.realiza_aporte === "false" && (!formData.es_patrocinado || formData.es_patrocinado === "false") ? 5 : (formData.es_patrocinado === "true" ? 4 : 1), 
                patrocinante_id: formData.es_patrocinado === "true" ? patrocinanteSeleccionado1?.id : null,
                patrocinante_id2: formData.es_patrocinado === "true" ? patrocinanteSeleccionado2?.id || null :null,
                patrocinante_id3: formData.es_patrocinado === "true" ? patrocinanteSeleccionado3?.id || null:null,



                }, // Datos a actualizar
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
    
            if (response.status === 200) {
                toast.success('Inscripción actualizada correctamente');
                navigate(-1);
                // Redirigir o realizar otra acción
            }
        } catch (error) {
            console.error('Error en la inscripción:', error);
            if (error.response && error.response.status === 401) {
                setError('Error: No autenticado. Por favor, inicie sesión nuevamente.');
                navigate('/login');
            } else {
                setError('Error al actualizar la inscripción');
            }
        }
    };
    
    


    if (error) {
        return <div>{error}</div>;
    }

    const columns = ["COD", "Curso", "Horas", "Fecha de Inicio", "Costo", "Acciones"];

    const renderItem = (curso) => (
        <tr key={curso.id}>
            <td>{curso.cod}</td>
            <td>{curso.descripcion}</td>
            <td>{curso.cantidad_horas} h</td>
            <td>{curso.fecha_inicio}</td>
            <td>{curso.costo} $</td>
            <td>
                <Button
                    variant="success"
                    onClick={() => handleInscribir(curso.id)}
                    className="d-flex align-items-center"
                >
                    <i className="bi bi-person-plus-fill me-2"></i> 
                </Button>
            </td>
        </tr>
    );

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
                                
                                </div>  
                            </div>
                        )}
                        
                        <div className="d-flex justify-content">
                        <Button variant="info" onClick={() => handleInscribir('guardar')} className='mt-3 'style={{marginRight:"10px"}}>
                            Guardar
                        </Button>

                        <Button variant="secondary" onClick={() => navigate(-1)}   className='mt-3 '>
                            Volver
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

export default EditInscripciones;
