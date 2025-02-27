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
import InscribirCedula from './InscribirCedula.css';

const userId = parseInt(localStorage.getItem('user'));  // ID del usuario logueado
const endpoint = 'http://localhost:8000/api';


const InscribirExterno = () => {
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

    const [currentPagePatrocinantes, setCurrentPagePatrocinantes] = useState(1);
    const userRole = localStorage.getItem('role');
    
    const [filterOptions, setFilterOptions] = useState({
        cohorteOptions: [],
        periodoOptions: [],
        nivelInstruccionOptions: [],
        estadoOptions: [],
        generoOptions: [],
        grupoOptions: [],
        nacionalidadOptions: [],
        procedenciaOptions: [],
        superatecOptions: [],  
    });
      const [filterOptions2, setFilterOptions2] = useState({
        nivelInstruccionOptions: [],
        estadoOptions: [],
        generoOptions: [],
        grupoOptions: [],
        nacionalidadOptions: [],
        procedenciaOptions: [],
        superatecOptions: [],  
    });
    const [formData, setFormData] = useState({
        cohorte_id: '',
        periodo_id: '',
        es_patrocinado: true,
        observaciones:'',
        realiza_aporte:false,
        curso_id:'',
        datos_identificacion_id:'',
        patrocinante_id:'',
        status_curso:'',
        status_pay:'',
        iniciativa_id:'',
        check:'',
    });
    const [filas, setFilas] = useState([
        {
          cedula_identidad: '',
          nombres: '',
          apellidos: '',
          fecha_nacimiento: '',
          genero_id: '',
          direccion: '',
          nivel_instruccion_id: '',
          direccion_email: '',
          telefono_celular: '',
          superatec:'',
          datos_identificacion_id:'',
        },
        {
            cedula_identidad: '',
            nombres: '',
            apellidos: '',
            fecha_nacimiento: '',
            genero_id: '',
            direccion: '',
            nivel_instruccion_id: '',
            direccion_email: '',
            telefono_celular: '',
            superatec:'',
            datos_identificacion_id:'',
          },
          {
            cedula_identidad: '',
            nombres: '',
            apellidos: '',
            fecha_nacimiento: '',
            genero_id: '',
            direccion: '',
            nivel_instruccion_id: '',
            direccion_email: '',
            telefono_celular: '',
            superatec:'',
            datos_identificacion_id:'',
          },
       
      ]); 
      
    
      // ✅ Agregar nueva fila
      const agregarFila = () => {
        setFilas([
          ...filas,
          {
            cedula_identidad: '',
            nombres: '',
            apellidos: '',
            fecha_nacimiento: '',
            genero_id: '',
            direccion: '',
            nivel_instruccion_id: '',
            direccion_email: '',
            telefono_celular: '',
            superatec:'',
            datos_identificacion_id:'',
            bloqueado: false // Bloquear edición

          },
        ]);
      };
    
      // ✅ Eliminar la última fila
      const eliminarFila = () => {
        if (filas.length > 1) {
          setFilas(filas.slice(0, -1)); // Remueve la última fila
        }
      };
    


 

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
        Promise.all([fetchCurso(),handleSeleccionar(),handleSeleccionar2()]).finally(() => {
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

  
    

    const handleCedulaSearch = async (index) => {
        const selectedCedula = filas[index].cedula_identidad;
        if (!selectedCedula) return;
    
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${endpoint}/identificacion/${selectedCedula}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
    
            if (response.data) {
                let nuevoEstadoFilas = [...filas];
                nuevoEstadoFilas[index] = {
                    ...nuevoEstadoFilas[index],
                    nombres: response.data.nombres,
                    apellidos: response.data.apellidos,
                    fecha_nacimiento: response.data.fecha_nacimiento,
                    genero_id: response.data.genero_id,
                    direccion: response.data.direccion,
                    nivel_instruccion_id: response.data.nivel_instruccion_id,
                    direccion_email: response.data.direccion_email,
                    telefono_celular: response.data.telefono_celular,
                    datos_identificacion_id: response.data.id, // Asegurar que el ID esté presente
                    superatec: true, // Marca el checkbox automáticamente
                    errorMensaje: "",
                    bloqueado: true // Bloquear edición

                };
                setFilas(nuevoEstadoFilas);
            } else {
                let nuevoEstadoFilas = [...filas];
                nuevoEstadoFilas[index].errorMensaje = 'Cédula no encontrada en la base de datos';
                setFilas(nuevoEstadoFilas);
            }
        } catch (error) {
            let nuevoEstadoFilas = [...filas];
            nuevoEstadoFilas[index].errorMensaje = 'Error al buscar la cédula';
            setFilas(nuevoEstadoFilas);
        }
    };
    
    
    const handleCedulaInputChange = (event, index) => {
        let nuevoEstadoFilas = [...filas];
        let inputValue = event.target.value.replace(/\D/g, '').slice(0, 9); // Solo números y máximo 9 caracteres
        nuevoEstadoFilas[index].cedula_identidad = inputValue;
        nuevoEstadoFilas[index].errorMensaje = "";
        setFilas(nuevoEstadoFilas);
    };
    
    const limpiarFila = (index) => {
        let nuevoEstadoFilas = [...filas];
        nuevoEstadoFilas[index] = {
            cedula_identidad: "",
            nombres: "",
            apellidos: "",
            fecha_nacimiento: "",
            genero_id: "",
            direccion: "",
            nivel_instruccion_id: "",
            direccion_email: "",
            telefono_celular: "",
            superatec: false,
        };
        setFilas(nuevoEstadoFilas);
    };
    const handleSeleccionar = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${endpoint}/select-inc`, {
                headers: { Authorization: `Bearer ${token}` }
            });
    
            const { cohorte, periodo } = response.data;
    
            // Guardar las opciones en el estado de filterOptions
            setFilterOptions({
                cohorteOptions: cohorte,
                periodoOptions: periodo
            });
    
            setSelectVisible(true);  // Mostrar los selectores
        } catch (error) {
            console.error('Error fetching filter options:', error);
        }
    };
    const handleSeleccionar2 = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${endpoint}/filter-datos`, {
                headers: { Authorization: `Bearer ${token}` }
            });
    
            const {nivel_instruccion,estado,genero,grupo_prioritario,nacionalidad,procedencia,superatec} = response.data;
    
            // Guardar las opciones en el estado de filterOptions
            setFilterOptions2({
                nivelInstruccionOptions: nivel_instruccion,
                estadoOptions: estado,
                generoOptions: genero,
                grupoOptions:grupo_prioritario,
                nacionalidadOptions:nacionalidad,
                procedenciaOptions:procedencia,
                superatecOptions:superatec,
    
            });
    
            console.log("superatec",filterOptions.superatecOptions);
            console.log("procedencia",filterOptions.procedenciaOptions);
    
    
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


        const handleInscripcion = async () => {
            let participantesNoSuperatec = filas.filter(fila => !fila.superatec && fila.cedula_identidad);
            let todosParticipantes = [...filas];
        
            try {
                const token = localStorage.getItem('token');
        
                // Registrar participantes no superatec
                if (participantesNoSuperatec.length > 0) {
                    const response = await axios.post(`${endpoint}/datos`, { participantes: participantesNoSuperatec }, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });
                    
                    // Verificar si la respuesta contiene participantes antes de mapear
                    if (response.data && response.data.participantes) {
                        response.data.participantes.forEach((nuevoParticipante) => {
                            const filaIndex = todosParticipantes.findIndex(f => f.cedula_identidad === nuevoParticipante.cedula_identidad);
                            if (filaIndex !== -1) {
                                todosParticipantes[filaIndex].datos_identificacion_id = nuevoParticipante.id;
                            }
                        });
                        setFilas([...todosParticipantes]); // Actualizar el estado con los nuevos IDs
                    }
                }
        
                // Inscribir todos los participantes en el curso
                const inscripcionData = todosParticipantes.map(participante => ({
                    ...formData,
                    cohorte_id: formData.cohorte_id,
                    periodo_id: formData.periodo_id,
                    status_pay: 4,
                    status_curso: 1,
                    es_patrocinado: true,
                    realiza_aporte: false,
                    patrocinante_id: patrocinanteSeleccionado1?.id || null,
                    datos_identificacion_id: participante.datos_identificacion_id,
                    curso_id: cursoId,
                    check: true,
                }));
        
                await axios.post(`${endpoint}/cursos_inscripcion`, { inscripciones: inscripcionData }, {
                    headers: { Authorization: `Bearer ${token}` },
                });
        
                toast.success("Participantes inscritos con éxito");
                navigate(`/inscritos/${cursoId}`);
            } catch (error) {
                console.error('Error en la inscripción:', error);
                toast.error("Error al inscribir");
            }
        };
        
        

    return (
        <div className="row" style={{ marginTop: '50px' }}>
        <div className="col-lg-11 mx-auto"> {/* Centrado del contenido */}
        <Form.Group controlId="cedula" className="custom-gutter" >
          <div className="card-box" style={{ padding: '20px', width: '100%', margin: '0 auto' }}>
            <h1>Inscripción a U.C Externa {curso && ` ${curso.cod}`}</h1>
            <div>


            </div>
           
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
                    </Col>
                    <Col md={6}>

                    {/* Centro Selector */}
                    {formErrors.centro_id && (
                    <div className="text-danger">{formErrors.centro_id}</div>
                )}
                   

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
                    </Col>
                        
                    <Col md={6}>
                        {/* Mostrar el campo de patrocinante solo si es_patrocinado es true */}
                        
                            <>
                                <Form.Group controlId="patrocinante1">
                                    <Form.Label>Patrocinante </Form.Label>
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
                                
                              
                            </>
                            </Col>
                            </Row>
                            
                        <Form.Group controlId="observaciones">
                        <Form.Label>Descripción</Form.Label>
                        <Form.Control
                            as="textarea"
                            name="observaciones"
                            value={formData.observaciones}
                            onChange={handleChange}
                        />
                        </Form.Group>

                        <div className="d-flex align-items-center gap-2 flex-wrap mt-3">


                         {/* Tabla de Datos */}
                         <Table bordered striped responsive >

        <thead>
          <tr>
            <th>Cédula</th>
            <th>Nombre</th>
            <th>Apellido</th>
            <th>Fecha Nac.</th>
            <th>Género</th>
            <th>Dirección</th>
            <th>Nivel Inst</th>
            <th>Email</th>
            <th>Tlf</th>
            <th>Superatec</th>
            <th>Limpiar</th>

          </tr>
        </thead>
        <tbody>
          {filas.map((fila, index) => (
            <tr key={index}>
              <td>
              <Form.Group controlId={`cedula-${index}`} className="custom-gutter d-flex align-items-center">
                            <input
                                type="text"
                                value={fila.cedula_identidad}
                                onChange={(event) => handleCedulaInputChange(event, index)}
                                placeholder="Cédula"
                                className="form-control flex-grow-1"
                                maxLength="9"
                            />
                            <button type="button" onClick={() => handleCedulaSearch(index)} className="btn btn-primary ms-1 px-2">
                                <i className="bi bi-search"></i>
                            </button>
                        </Form.Group>
                        {fila.errorMensaje && <div className="text-danger mt-1">{fila.errorMensaje}</div>}
                    </td>
              <td>
                <Form.Control
                  type="text"
                  name="nombres"
                  value={fila.nombres}
                  onChange={(e) => {
                    if (!filas[index].bloqueado) {
                    const nuevasFilas = [...filas];
                    nuevasFilas[index].nombres = e.target.value;
                    setFilas(nuevasFilas);
                    }
                  }}

              
                  maxLength={20}
                  placeholder="Nombre"
                />
              </td>
              <td>
                <Form.Control
                  type="text"
                  name="apellidos"
                  value={fila.apellidos}
                  onChange={(e) => {
                    if (!filas[index].bloqueado) {
                    const nuevasFilas = [...filas];
                    nuevasFilas[index].apellidos = e.target.value;
                    setFilas(nuevasFilas);
                    }
                  }}
                  maxLength={20}
                  placeholder="Apellido"
                />
              </td>
              <td>
                <Form.Control
                  type="date"
                  name="fecha_nacimiento"
                  value={fila.fecha_nacimiento}
                  onChange={(e) => {
                    if (!filas[index].bloqueado) {
                    const nuevasFilas = [...filas];
                    nuevasFilas[index].fecha_nacimiento = e.target.value;
                    setFilas(nuevasFilas);
                    }
                  }}
                />
              </td>
              <td>
                <SelectComponent
                  options={filterOptions2.generoOptions}
                  nameField="descripcion"
                  valueField="id"
                  selectedValue={fila.genero_id}
                  handleChange={(e) => {
                    if (!filas[index].bloqueado) {
                    const nuevasFilas = [...filas];
                    nuevasFilas[index].genero_id = e.target.value;
                    setFilas(nuevasFilas);
                    }
                  }}
                  controlId={`genero_id_${index}`}
                />
              </td>
              <td>
                <Form.Control
                  type="text"
                  name="direccion"
                  value={fila.direccion}
                  onChange={(e) => {
                    if (!filas[index].bloqueado) {
                    const nuevasFilas = [...filas];
                    nuevasFilas[index].direccion = e.target.value;
                    setFilas(nuevasFilas);
                    }
                  }}
                  maxLength={20}
                  placeholder="Dirección"
                />
              </td>
              <td>
                <SelectComponent
                  options={filterOptions2.nivelInstruccionOptions}
                  nameField="descripcion"
                  valueField="id"
                  selectedValue={fila.nivel_instruccion_id}
                  handleChange={(e) => {
                    if (!filas[index].bloqueado) {
                    const nuevasFilas = [...filas];
                    nuevasFilas[index].nivel_instruccion_id = e.target.value;
                    setFilas(nuevasFilas);
                    }
                  }}
                  controlId={`nivel_instruccion_id_${index}`}
                />
              </td>
              <td>
                <Form.Control
                  type="email"
                  name="direccion_email"
                  value={fila.direccion_email}
                  onChange={(e) => {
                    if (!filas[index].bloqueado) {
                    const nuevasFilas = [...filas];
                    nuevasFilas[index].direccion_email = e.target.value;
                    setFilas(nuevasFilas);
                    }
                  }}
                  placeholder="Email"
                />
              </td>
              <td>
                <Form.Control
                  type="text"
                  name="telefono_celular"
                  value={fila.telefono_celular}
                  onChange={(e) => {
                    if (!filas[index].bloqueado) {
                    const nuevasFilas = [...filas];
                    nuevasFilas[index].telefono_celular = e.target.value;
                    setFilas(nuevasFilas);
                    }
                  }}
                  maxLength={10}
                  placeholder="Tlf"
                />
              </td>
              <td>
                        <Form.Check
                            type="checkbox"
                            name="superatec"
                            checked={fila.superatec}
                            readOnly
                        />
                    </td>
                    <td>
                    <button type="button" onClick={() => limpiarFila(index)} className="btn btn-warning ms-2">
                                <i className="bi bi-brush-fill"></i>
                            </button>
                    </td>
            </tr>
            
          ))}
        </tbody>
      </Table>

      {/* Botones de Acción */}
      <div className="d-flex justify-content-between mt-3">
        <Button variant="success" onClick={agregarFila}>
          ➕ Agregar Fila
        </Button>
        <Button variant="danger" onClick={eliminarFila} disabled={filas.length === 1} className="ms-3">
            ❌ Eliminar Fila
            </Button>
      </div>
                    </div>
                            </div>

                   
                            <div className="d-flex mt-1">
                                <Button variant="info" onClick={handleInscripcion} className="mt-3 me-2">
                                    Inscribir
                                </Button>
                                <Button
                                    variant="secondary"
                                    onClick={() => navigate(-1)}
                                    className="mt-3"
                                >
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
export default InscribirExterno;
