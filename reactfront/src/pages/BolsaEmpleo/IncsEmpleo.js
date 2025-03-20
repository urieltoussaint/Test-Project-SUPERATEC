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


const IncsEmpleo = () => {
  const { patrocinanteId } = useParams();
    const [patrocinante, setPatrocinante] = useState(null);
    const [error, setError] = useState('');
    const { setLoading } = useLoading();
    const navigate = useNavigate();
    const userRole = localStorage.getItem('role');
   
    

    const [formData, setFormData] = useState({
        cargo_ofrecido: '',
        email: '',
        fecha_post: '',
      
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
          part_bolsa_empleo_id:'',
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
            part_bolsa_empleo_id:'',
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
            part_bolsa_empleo_id:'',
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
            part_bolsa_empleo_id:'',
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
    
          const [filterOptions2, setFilterOptions2] = useState({
              nivelInstruccionOptions: [],
              estadoOptions: [],
              generoOptions: [],
              grupoOptions: [],
              nacionalidadOptions: [],
              procedenciaOptions: [],
              superatecOptions: [],  
          });

  

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };




    
    
    useEffect(() => {
        setLoading(true);
        Promise.all([handleSeleccionar2(),fetchPatrocinante()]).finally(() => {
            setLoading(false);
        });
    }, [patrocinanteId]);
    

    const fetchPatrocinante = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${endpoint}/patrocinantes/${patrocinanteId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setPatrocinante(response.data);
        } catch (error) {
            console.error('Error fetching curso:', error);
            setError('Error fetching curso');
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
        
        
        
          } catch (error) {
                console.error('Error fetching filter options:', error);
            }
        };

  
    

        const handleCedulaSearch = async (index) => {
          const selectedCedula = filas[index].cedula_identidad;
          if (!selectedCedula) return;
      
          try {
              const token = localStorage.getItem('token');
              const response = await axios.get(`${endpoint}/cedula-empleo/${selectedCedula}`, {
                  headers: {
                      Authorization: `Bearer ${token}`,
                  },
              });
      
              console.log("Respuesta completa del backend:", response.data);
      
              // Verificar que la respuesta contenga al menos un elemento en el array
              if (Array.isArray(response.data) && response.data.length > 0) {
                  const datosIdentificacion = response.data[0].datos_identificacion; // Acceder al primer objeto
                  
                  if (datosIdentificacion) {
                      let nuevoEstadoFilas = [...filas];
                      nuevoEstadoFilas[index] = {
                          ...nuevoEstadoFilas[index],
                          nombres: datosIdentificacion.nombres || "", 
                          apellidos: datosIdentificacion.apellidos || "",
                          fecha_nacimiento: datosIdentificacion.fecha_nacimiento || "",
                          genero_id: datosIdentificacion.genero_id || null,
                          direccion: datosIdentificacion.direccion || "",
                          nivel_instruccion_id: datosIdentificacion.nivel_instruccion_id || null,
                          direccion_email: datosIdentificacion.direccion_email || "",
                          telefono_celular: datosIdentificacion.telefono_celular || "",
                          part_bolsa_empleo_id: response.data[0].id || null,
                      
                          bloqueado: true
                      };
                      setFilas(nuevoEstadoFilas);
                  } else {
                      console.error("Error: 'datos_identificacion' no está presente en el objeto.");
                      let nuevoEstadoFilas = [...filas];
                      nuevoEstadoFilas[index].errorMensaje = "Datos no encontrados en la base de datos";
                      setFilas(nuevoEstadoFilas);
                  }
              } else {
                  console.error("Error: La respuesta no contiene datos válidos.");
                  let nuevoEstadoFilas = [...filas];
                  nuevoEstadoFilas[index].errorMensaje = "Cédula no encontrada en la base de datos";
                  setFilas(nuevoEstadoFilas);
              }
          } catch (error) {
              console.error("Error en la petición:", error);
              console.error("Detalles del error:", error.response ? error.response.data : error.message);
      
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
            id:"",
        };
        setFilas(nuevoEstadoFilas);
    };

        const handleInscripcion = async () => {
            let todosParticipantes = [...filas];
        
            try {
                const token = localStorage.getItem('token');
        
                // Inscribir todos los participantes en el curso
                const inscripcionData = todosParticipantes.map(participante => ({
                    ...formData,
                    cargo_ofrecido: formData.cargo_ofrecido,
                    email:formData.email,
                    fecha_post:formData.fecha_post,
                    part_bolsa_empleo_id: participante.part_bolsa_empleo_id,
                    patrocinante_id:patrocinanteId,
                }));
        
                await axios.post(`${endpoint}/empleo`, { inscripciones: inscripcionData }, {
                    headers: { Authorization: `Bearer ${token}` },
                });
        
                toast.success("Participantes inscritos con éxito");
                navigate(`/bolsa-empleo`);
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
            <h1>Postulación Masiva de Empleo de  {patrocinante && ` ${patrocinante.nombre_patrocinante}`}</h1>
            <div>


            </div>
           
                <div className="mt-3">
                    
                            
                        <Form.Group controlId="cargo_ofrecido">
                        <Form.Label>Cargo Ofrecido</Form.Label>
                        <Form.Control
                            type="text"
                            name="cargo_ofrecido"
                            value={formData.cargo_ofrecido}
                            onChange={handleChange}
                        />
                        </Form.Group>
                        <Form.Group controlId="email">
                        <Form.Label>Email del Contratante</Form.Label>
                        <Form.Control
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                        />
                        </Form.Group>
                         <Form.Group controlId="fecha_post">
                            <Form.Label>Fecha de Postulación</Form.Label>
                            <Form.Control
                              type="date"
                              name="fecha_post"
                              value={formData.fecha_post}
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
            <th>Id Bolsa</th>
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
                <Form.Control
                  type="num"
                  name="part_bolsa_empleo_id"
                  value={fila.part_bolsa_empleo_id}
                  onChange={(e) => {
                    if (!filas[index].bloqueado) {
                    const nuevasFilas = [...filas];
                    nuevasFilas[index].part_bolsa_empleo_id = e.target.value;
                    setFilas(nuevasFilas);
                    }
                  }}
                  maxLength={10}
                  placeholder="Id Bolsa"
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
                   
</div>
        
    );
};
export default IncsEmpleo;
