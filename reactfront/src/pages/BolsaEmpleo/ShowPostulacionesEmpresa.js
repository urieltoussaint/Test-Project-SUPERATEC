import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Table from 'react-bootstrap/Table';
import { useNavigate, useParams } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { Modal } from 'react-bootstrap';
import { useLoading } from '../../components/LoadingContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PaginationTable from '../../components/PaginationTable';  // Importa el componente de paginación
import { ResponsiveContainer,Line, LineChart,BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,AreaChart,Area,Radar,RadarChart, PieChart, Cell, Pie, ComposedChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import { FaExpand, FaCompress } from 'react-icons/fa'; // Íconos para expandir/contraer
import { motion } from 'framer-motion';

// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FaUserFriends, FaClock, FaBook,FaSync,FaSearch  } from 'react-icons/fa';  // Importamos íconos de react-icons
import ProgressBar from 'react-bootstrap/ProgressBar';


const endpoint = 'http://localhost:8000/api';
const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00C49F', '#FFBB28'];

const ShowPostulacionesEmpresas = () => {
    const [datos, setDatos] = useState([]);
    const [data, setData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;
    const [showModal, setShowModal] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [loadingData, setLoadingData] = useState(false); // Estado para controlar la recarga
    const [totalPages, setTotalPages] = useState(1); // Default to 1 page initially
    const [statistics, setStatistics] = useState({});
    const [nivelInstruccionOptions, setNivelInstruccionOptions] = useState([]);
    const [generoOptions, setGeneroOptions] = useState([]);
    const [estadoOptions, setEstadoOptions] = useState([]);
    const { id } = useParams();
    // Mueve esto al principio del componente

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;

    const dataToUse = datos;

    const totalParticipantes = statistics?.totalPostulaciones || 0;

    const [showModalInfo, setShowModalInfo] = useState(false);
    const [mostrarSoloTabla, setMostrarSoloTabla] = useState(false);
                        
        const toggleTablaExpandida = () => {
            setMostrarSoloTabla(prevState => !prevState);
        }; 

    const [filters, setFilters] = useState({
        cedula_identidad: '',
        nombres: '',
        apellidos: '',
        nivel_instruccion_id: '',
        cargo_ofrecido:'',
        genero_id: '',
        estado_id:'',
     
    });
    
    const { setLoading } = useLoading();
    const [error, setError] = useState(null);
    const navigate = useNavigate();

   const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
};


    // Obtener el rol del usuario desde localStorage
    const userRole = localStorage.getItem('role'); // Puede ser 'admin', 'superuser', 'invitado', etc.
    const handleShowModal = (id) => {
        setSelectedId(id);  // Almacena el ID del participante que se va a eliminar
        setShowModal(true); // Muestra el modal
    };
    
    const handleCloseModal = () => {
        setShowModal(false); // Cierra el modal
    };
    
 
    useEffect(() => {
        setLoading(true);
        getAllDatos ();
        fetchData();
        fetchFilterOptions();
        setLoading(false);
       
    }, []); 
    
    
    
    const handlePageChange = (page) => {
        setCurrentPage(page);
        getAllDatos(page); // Llama a `getAllDatos` con el nuevo número de página
        
    };

    const getAllDatos = async (page = 1) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${endpoint}/postulaciones-empresas`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { ...filters, page }, // Incluye `page` en los parámetros
            });
            
            const estadisticas = response.data.estadisticas || {};
            
            setDatos(Array.isArray(response.data.datos.data) ? response.data.datos.data : []);
            setStatistics(estadisticas);
            setTotalPages(response.data.datos.last_page || 1); // Actualiza el total de páginas
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Error fetching data');
            setDatos([]);
            setStatistics({ rangoEdades: [] });
        }
    };


    const fetchFilterOptions = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${endpoint}/filter-datos`, { headers: { Authorization: `Bearer ${token}` } });
            
            setNivelInstruccionOptions(response.data.nivel_instruccion);
            setGeneroOptions(response.data.genero);
            setEstadoOptions(response.data.estado);
            

    
        } catch (error) {
            setError('Error fetching filter options');
            console.error('Error fetching filter options:', error);
        }
    };


    const deleteDatos = async () => {
        const token = localStorage.getItem('token');
        try {
            await axios.delete(`${endpoint}/empleo/${selectedId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            toast.success('Participante eliminado con Éxito');             
            getAllDatos();
            setShowModal(false); // Cierra el modal tras la eliminación exitosa
        } catch (error) {
            setError('Error deleting data');
            console.error('Error deleting data:', error);
            toast.error('Error al eliminar Participante');
            setShowModal(false); // Cierra el modal tras el error
        }
    };

    const fetchData = async () => {
        setLoading(true); // Inicia la animación de carga
        try {
          const token = localStorage.getItem('token');
          const response = await axios.get(`${endpoint}/patrocinantes/${id}`,{
            headers: {
                Authorization: `Bearer ${token}`,
            },
          });
          setData(response.data);
        } catch (error) {
          console.error('Error fetching data:', error);
        } finally {
      
        }
      };
    

    const loadData = async () => {
        setLoadingData(true); // Inicia el estado de carga
        try {
            await (getAllDatos(),fetchFilterOptions()); // Espera a que getAllDatos haga la solicitud y actualice los datos
        } catch (error) {
            console.error('Error recargando los datos:', error); // Maneja el error si ocurre
        } finally {
            setLoadingData(false); // Detener el estado de carga cuando la solicitud haya terminado
        }
    };


    const printInfo = async (filters) => {
        try {
          const token = localStorage.getItem("token");
          if (!token) {
            alert("Token no encontrado.");
            return;
          }
      
          // Realizar la solicitud GET a la ruta que genera los datos en JSON
          const response = await axios.get(`${endpoint}/datos-filtrados-print`, {
            headers: { Authorization: `Bearer ${token}` },
            params: filters, // Pasamos los filtros a la ruta
          });
      
          // Extraer los datos principales y las estadísticas
          const jsonData = response.data.datos; // Clave 'datos'
          const estadisticasData = response.data.estadisticas; // Clave 'estadisticas'
      
          if (!jsonData || jsonData.length === 0) {
            alert("No hay datos para exportar.");
            return;
          }
      
          // Convertir los datos principales a una hoja
          const worksheet1 = XLSX.utils.json_to_sheet(jsonData); // Hoja de datos
          const workbook = XLSX.utils.book_new(); // Crea un libro nuevo
          XLSX.utils.book_append_sheet(workbook, worksheet1, "Datos"); // Añade la hoja al libro
      // Preparar las estadísticas para convertirlas
        const estadisticasArray = [];

        // Iterar sobre las estadísticas y descomponerlas
        Object.entries(estadisticasData).forEach(([key, value]) => {
        if (typeof value === "object" && !Array.isArray(value)) {
            // Si el valor es un objeto, descomponer sus datos (por ejemplo, participantesPorEstado, nivelesInstruccion)
            Object.entries(value).forEach(([subKey, subValue]) => {
            if (typeof subValue === "object") {
                estadisticasArray.push({
                Estadística: `${key} - ${subKey}`,
                Cantidad: subValue.count || 0,
                Porcentaje: subValue.percentage ? `${subValue.percentage.toFixed(2)}%` : "0%",
                });
            } else {
                estadisticasArray.push({
                Estadística: `${key} - ${subKey}`,
                Valor: subValue,
                });
            }
            });
        } else {
            // Si es un valor simple, agregarlo directamente
            estadisticasArray.push({
            Estadística: key,
            Valor: value,
            });
        }
        });

        // Convertir las estadísticas a una hoja
        const worksheet2 = XLSX.utils.json_to_sheet(estadisticasArray);
        XLSX.utils.book_append_sheet(workbook, worksheet2, "Estadísticas"); // Añade la segunda hoja
                // Generar el archivo Excel
                const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
            
                // Crear un Blob y guardarlo como archivo
                const blob = new Blob([excelBuffer], {
                    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                });
                saveAs(blob, "participantes_estadisticas.xlsx");
                } catch (error) {
                console.error("Error al generar el archivo Excel", error);
                alert("Hubo un error al generar el archivo Excel");
                }
            };
      
      

      const handlePrint = async () => {
        setShowModalInfo(false); // Cerrar el modal
        await printInfo(filters); // Llamar a la función de impresión con los filtros
      };
    
    
    const columns = ["cedula_identidad", "Nombres", "Apellidos","Estado","Nivel de Instrucción","Cargo Ofrecido", "Fecha de Postulación", "Acciones"];

    const renderItem = (dato) => (
        <tr key={dato.id}>
            <td >{dato?.part_bolsa_empleo?.datos_identificacion?.cedula_identidad}</td>
            <td >{dato?.part_bolsa_empleo?.datos_identificacion?.nombres}</td>
            <td >{dato?.part_bolsa_empleo?.datos_identificacion?.apellidos}</td>
            <td >{dato?.part_bolsa_empleo?.datos_identificacion?.estado?.descripcion}</td>
            <td >{dato?.part_bolsa_empleo?.datos_identificacion?.nivel_instruccion?.descripcion}</td>
            <td >{dato?.cargo_ofrecido}</td>
            <td >{dato?.fecha_post}</td>

            <td >
                <div className="d-flex justify-content-around">
                
              
                    {userRole === 'admin' || userRole === 'superuser' ? (
                        <>
                           
                            {userRole === 'admin' && (
                                <Button
                                variant="btn btn-danger"
                                onClick={() => handleShowModal(dato.id)}
                                className="me-2"
                                title="Eliminar"
                                >
                                <i className="bi bi-trash3-fill"></i>
                                </Button>
                            )}
                        </>
                    ) : null}
                </div>
            </td>
        </tr>
    );
    
    

    return (
        <div className="container-fluid " style={{ fontSize: '0.85rem' }}>
            <motion.div 
                        initial={{ opacity: 1, maxHeight: "500px" }} // Establece una altura máxima inicial
                        animate={{
                            opacity: mostrarSoloTabla ? 0 : 1,
                            maxHeight: mostrarSoloTabla ? 0 : "500px", // Reduce la altura en transición
                        }}
                        transition={{ duration: 0.5, ease: "easeInOut" }} // Animación más fluida
                        style={{ overflow: "hidden" }} // Evita que los elementos internos se muestren fuera de la caja
                    >
            <div className="stat-box d-flex " style={{ maxWidth: '100%' }}> 
                {/* Total de Participantes */}
                <div className="stat-card" style={{ padding: '5px', margin: '0 10px', width: '22%' }}>
                    <div className="stat-icon"><FaUserFriends /></div>
                    <div className="stat-number" style={{ color: '#58c765', fontSize: '1.8rem' }}>{totalParticipantes}</div>
                    <h4 style={{ fontSize: '1.1rem', color:'gray' }}>Total de Postulaciones</h4>
                </div>
                
            </div>
            </motion.div>

            <div className="row" style={{ marginTop: '10px' }}>
                {/* Columna para la tabla */}
                <div className="col-lg-12"> {/* Ajustado para más espacio a la tabla */}
                    <div className="card-box" style={{ padding: '10px' }}> {/* Reduce padding de la tabla */}
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h2 style={{ fontSize: '1.8rem' }}>Lista de Postulaciones para {data.nombre_patrocinante}</h2>
                            <div className="d-flex align-items-center">
                            <Button 
                                    variant="info me-2" 
                                    onClick={toggleTablaExpandida} 
                                    style={{ padding: '5px 15px' }}
                                    title={mostrarSoloTabla ? "Mostrar Todo" : "Modo Tabla Expandida"}
                                >
                                    {mostrarSoloTabla ? <FaCompress /> : <FaExpand />}
                                </Button>
                           
                                    <Button
                                    variant="info me-2"
                                    onClick={loadData}
                                    disabled={loadingData} // Deshabilita el botón si está cargando
                                    style={{ padding: '5px 10px', width: '120px' }} // Ajusta padding y ancho
                                    title="Recargar datos"
                                >
                                    
                                    {/* Icono de recarga */}
                                    {loadingData ? (
                                    <FaSync className="spin" /> // Ícono girando si está cargando
                                    ) : (
                                    <FaSync />
                                    )}
                                </Button>

                                <Button 
                                    variant="info me-2" 
                                    onClick={getAllDatos}
                                    style={{ padding: '5px 10px', width: '120px' }} 
                                    title="Buscar"
                                >
                                    <FaSearch className="me-1" /> {/* Ícono de lupa */}
                                </Button>
                                <Button
                                    variant="btn btn-info"
                                    onClick={() => setShowModalInfo(true)} // Abrir el modal
                                    className="me-2"
                                    title="Exportar en Excel"
                                >
                                    <i className="bi bi-printer-fill"></i> {/* Icono de impresora */}
                                </Button>
                                


                               
                        </div>
                    </div>

                        {/* Filtros */}
                        <div className="d-flex mb-3 ">
                        <Form.Control
                                type="text"
                                placeholder="Buscar por Cédula"
                                value={filters.cedula_identidad} // Conecta el campo de cédula al estado de filtros
                                name="cedula_identidad"
                                onChange={handleFilterChange} // Usa handleFilterChange para actualizar el valor
                                className="me-2"
                            />
                         <Form.Control
                                type="text"
                                placeholder="Buscar por Nombre"
                                value={filters.nombres} // Conecta el campo de cédula al estado de filtros
                                name="nombres"
                                onChange={handleFilterChange} // Usa handleFilterChange para actualizar el valor
                                className="me-2"
                            />

                        <Form.Control
                                type="text"
                                placeholder="Buscar por Apellido"
                                value={filters.apellidos} // Conecta el campo de cédula al estado de filtros
                                name="apellidos"
                                onChange={handleFilterChange} // Usa handleFilterChange para actualizar el valor
                                className="me-2"
                            />
                            <Form.Select
                                name="nivel_instruccion_id"
                                value={filters.nivel_instruccion_id}
                                onChange={handleFilterChange}
                                className="me-2"
                            >
                                <option value="">Nivel de Instrucción</option>
                                {nivelInstruccionOptions?.map(option => (
                                    <option key={option.id} value={option.id}>{option.descripcion}</option>
                                ))}

                            </Form.Select>
                            <Form.Select
                                name="genero_id"
                                value={filters.genero_id}
                                onChange={handleFilterChange}
                                className="me-2"
                            >
                                <option value="">Género</option>
                                {generoOptions?.map(option => (
                                    <option key={option.id} value={option.id}>{option.descripcion}</option>
                                ))}

                            </Form.Select>
                            <Form.Select
                                name="estado_id"
                                value={filters.estado_id}
                                onChange={handleFilterChange}
                                className="me-2"
                            >
                                <option value="">Estado</option>
                                {estadoOptions?.map(option => (
                                    <option key={option.id} value={option.id}>{option.descripcion}</option>
                                ))}

                            </Form.Select>
                        <Form.Control
                                type="text"
                                placeholder="Buscar por Cargo Ofrecido"
                                value={filters.cargo_ofrecido} // Conecta el campo de cédula al estado de filtros
                                name="cargo_ofrecido"
                                onChange={handleFilterChange} // Usa handleFilterChange para actualizar el valor
                                className="me-2"
                            />

                        
                       

                        </div>
                        
                       
                        <PaginationTable
                            data={datos}
                            itemsPerPage={itemsPerPage}
                            columns={columns}
                            renderItem={renderItem}
                            currentPage={currentPage}
                            onPageChange={handlePageChange}
                            totalPages={totalPages}  // <--- Añade esta línea si aún no está
                        />


                        {/* Modal  de eliminación */}
                        <Modal show={showModal} onHide={handleCloseModal}>
                            <Modal.Header closeButton>
                                <Modal.Title>Confirmar eliminación</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>¿Estás seguro de que deseas eliminar esta Postulación y todos los datos relacionados a él?</Modal.Body>
                            <Modal.Footer>
                                <Button variant="secondary" onClick={handleCloseModal}>
                                    Cancelar
                                </Button>
                                <Button variant="danger" onClick={deleteDatos}>
                                    Eliminar
                                </Button>
                            </Modal.Footer>
                        </Modal>

                        <ToastContainer />
                    </div>
                    
            </div>
            


            </div>
            {/* Gráfica  justo debajo de la tabla */}
           



            <div className="col-lg-12 d-flex justify-content-between" style={{ gap: '20px' }}>


                <div className="chart-box" style={{ flex: '1 1 31%', maxWidth: '31%', marginRight: '10px'}}>

                
                </div>

                <div className="chart-box " style={{flex: '1 1 31%', maxWidth: '31%', marginRight: '10px'}}>
               
                        

                </div>
                <div className="chart-box "style={{ flex: '1 1 31%', maxWidth: '31%', marginRight: '10px'}}>
                   

                    {/* Modal de confirmación */}
                    <Modal show={showModalInfo} onHide={() => setShowModalInfo(false)} centered>
                    <Modal.Header closeButton>
                    <Modal.Title>Confirmar impresión</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                    ¿Está seguro que desea imprimir la información? Esto generará un archivo descargable en formato Excel.
                    </Modal.Body>
                    <Modal.Footer>
                    <div className="d-flex justify-content-end gap-2">
                        <Button variant="secondary" onClick={() => setShowModalInfo(false)}>
                            Cancelar
                        </Button>
                        <Button variant="primary" onClick={handlePrint}>
                            Imprimir
                        </Button>
                        </div>

                    </Modal.Footer>
                </Modal>
                
                </div>
            </div>




             
                        

    </div>
                    

                );
};

export default ShowPostulacionesEmpresas;
