import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Table from 'react-bootstrap/Table';
import { useNavigate } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { Modal } from 'react-bootstrap';
import { useLoading } from '../../components/LoadingContext';
// import './ShowDatos.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PaginationTable from '../../components/PaginationTable';  // Importa el componente de paginación
import { ResponsiveContainer,Line, LineChart,BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,AreaChart,Area,Radar,RadarChart, PieChart, Cell, Pie, ComposedChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";

// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FaUserFriends, FaClock, FaBook,FaSync,FaSearch  } from 'react-icons/fa';  // Importamos íconos de react-icons
import ProgressBar from 'react-bootstrap/ProgressBar';
import { FaExpand, FaCompress } from 'react-icons/fa'; // Íconos para expandir/contraer
import { motion } from 'framer-motion';


const endpoint = 'http://localhost:8000/api';
const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00C49F', '#FFBB28'];

const ShowIndicadores = () => {
    const [datos, setDatos] = useState([]);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;
    const [showModal, setShowModal] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [loadingData, setLoadingData] = useState(false); // Estado para controlar la recarga
    const [totalPages, setTotalPages] = useState(1); // Default to 1 page initially
    const [statistics, setStatistics] = useState({});
    // Mueve esto al principio del componente

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const [nivelInstruccionOptions, setNivelInstruccionOptions] = useState([]);
    const [generoOptions, setGeneroOptions] = useState([]);
    const [estadoOptions, setEstadoOptions] = useState([]);
    const [periodoOptions, setPeriodoOptions] = useState([]);
    const [areaOptions, setAreaOptions] = useState([]);
    const [cohorteOptions, setCohorteOptions] = useState([]);
    const [patrocinanteOptions, setPatrocinanteOptions] = useState([]);
    const [procedenciaOptions, setProcedenciaOptions] = useState([]);
    const [centroOptions, setCentroOptions] = useState([]);
    const [grupoOptions, setGrupoOptions] = useState([]);
    const [unidadOptions, setUnidadOptions] = useState([]);
    const [inscritosAporte, setInscritosAporte] = useState(0);
    const [inscritosPatrocinados, setInscritosPatrocinados] = useState(0);
    const [cursosPorArea, setCursosPorArea] = useState([]);
    const [inscritosPorStatusPay, setInscritosPorStatusPay] = useState({});
    const [inscritosPorStatusCurso, setInscritosPorStatusCurso] = useState({});


    const totalParticipantes = statistics?.totalInscritos    || 0;
    const mayorEdad = statistics?.mayorEdad || 0;
    const menorEdad = statistics?.menorEdad || 0;
    const promedioEdad = statistics?.promedioEdad || 0;
    const porcentajeMasculino = statistics?.porcentajesGenero?.masculino || 0;
    const porcentajeFemenino = statistics?.porcentajesGenero?.femenino || 0;
    const porcentajeOtros = statistics?.porcentajesGenero?.otros || 0;
    const [showModalInfo, setShowModalInfo] = useState(false);
    const [mostrarSoloTabla, setMostrarSoloTabla] = useState(false);
                  
    const toggleTablaExpandida = () => {
        setMostrarSoloTabla(prevState => !prevState);
    }; 

    const [filters, setFilters] = useState({
        nivel_instruccion_id: '',
        genero_id: '',
        centro_id: '',
        area_id: '',
        periodo_id: '',
        estado_id: '',
        unidad_id: '',
        cohorte_id: '',
        cedula_identidad: '' ,
        status_pay:'',
        status_curso:'',
        es_patrocinado:'',
        patrocinante_id:'',
        patrocinante_id2:'',
        patrocinante_id3:'',
        fecha_inscripcion:'',
        procedencia_id:'',
        nivel_instruccion_id:'',
        estado_id:'',
        nombres:'',
        apellidos:'',
        tlf:'',
        centro_id:'',
        grupo_id:'',
        externo:'',
        edad_mayor:'',
        edad_menor:''

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
  
 
    useEffect(() => {
        setLoading(true);
        getAllIndicadores ();
        fetchFilterOptions()
            .finally(() => setLoading(false));
    }, []); 
    
    
    
    const handlePageChange = (page) => {
        setCurrentPage(page);
        getAllIndicadores(page); // Llama a `getAllIndicadores` con el nuevo número de página
        
    };

    const getAllIndicadores = async (page = 1) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${endpoint}/indicadores-filtrados`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { ...filters, page }, // Incluye `page` en los parámetros
            });
            
            const estadisticas = response.data.estadisticas || {};
            estadisticas.rangoEdades = estadisticas.rangoEdades || [];
            
            setDatos(Array.isArray(response.data.datos.data) ? response.data.datos.data : []);
            setStatistics(estadisticas);
            setTotalPages(response.data.datos.last_page || 1); // Actualiza el total de páginas
            setInscritosAporte(estadisticas.inscritosAporte || 0);
          setInscritosPatrocinados(estadisticas.inscritosPatrocinados || 0);
          setCursosPorArea(estadisticas.cursosPorArea || []);
  
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
            const response = await axios.get(`${endpoint}/filter-indicadores`, { headers: { Authorization: `Bearer ${token}` } });
            
            setNivelInstruccionOptions(response.data.nivelInstruccion);
            setGeneroOptions(response.data.genero);
            setEstadoOptions(response.data.estado);
            setPeriodoOptions(response.data.periodo);
            setCohorteOptions(response.data.cohorte);
            setCentroOptions(response.data.centro);
            setAreaOptions(response.data.area);
            setUnidadOptions(response.data.unidad);
            setPatrocinanteOptions(response.data.patrocinante);
            setProcedenciaOptions(response.data.procedencia);
            setGrupoOptions(response.data.grupo);

        } catch (error) {
            setError('Error fetching filter options');
            console.error('Error fetching filter options:', error);
        }
    };



    const loadData = async () => {
        setLoadingData(true); // Inicia el estado de carga
        try {
            await (getAllIndicadores(),fetchFilterOptions()); // Espera a que getAllIndicadores haga la solicitud y actualice los datos
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
          const response = await axios.get(`${endpoint}/indicadores-print`, {
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
                saveAs(blob, "calculo_indicadores.xlsx");
                } catch (error) {
                console.error("Error al generar el archivo Excel", error);
                alert("Hubo un error al generar el archivo Excel");
                }
            };
      
      

      const handlePrint = async () => {
        setShowModalInfo(false); // Cerrar el modal
        await printInfo(filters); // Llamar a la función de impresión con los filtros
      };
    



    
    const rangoEdades = statistics?.rangoEdades
    ? Object.entries(statistics.rangoEdades).map(([name, percentage]) => ({
        name,
        value: percentage,
    }))
    : [];


    const comoEnteroSuperatecData = statistics?.comoEnteroSuperatec
    ? Object.entries(statistics.comoEnteroSuperatec).map(([name, obj]) => ({
        name,
        value: obj.percentage,
    }))
    : [];

const grupoPrioritarioData = statistics?.grupoPrioritario
    ? Object.entries(statistics.grupoPrioritario).map(([name, obj]) => ({
        name,
        value: obj.percentage,
    }))
    : [];



    const nivelesInstruccionData = statistics?.nivelesInstruccion
    ? Object.entries(statistics.nivelesInstruccion).map(([name, obj]) => ({
        name,
        count: obj.count,
    }))
    : [];

const participantesPorEstadoData = statistics?.participantesPorEstado
    ? Object.entries(statistics.participantesPorEstado).map(([name, obj]) => ({
        name,
        count: obj.count,
    }))
    : [];

    const participantsByAportePatrocinado = [
        { name: 'Realiza Aporte', value: inscritosAporte },
        { name: 'Es Patrocinado', value: inscritosPatrocinados },
      ];

      const AreaGraphic = Object.entries(cursosPorArea).map(([name, data]) => ({
        name,
        value: data.count, // Usar 'count' en lugar de 'value' directamente
        percentage: data.percentage.toFixed(2) + "%", // Formatear porcentaje con 2 decimales
      }));


      const estadoPago = statistics?.estadoPagos?.map(({ nombre, cantidad }) => {
        let color;
      
        if (nombre === "No pagado (Rojo)") color = "red"; // Naranja
        if (nombre === "En proceso (Naranja)") color = "#FFA500"; // Verde
        if (nombre === "Pagado (Verde)") color = "green"; // Rojo
        if (nombre === "Patrocinado (Azul)") color = "blue"; // Rojo
        if (nombre === "Exonerado (Rosado)") color = "#fc53c4"; // Rojo
        
       
        return{
        name: nombre,
        value: cantidad, // Clave que PieChart espera para los valores numéricos
        color
        };
      });
      
      const estadoCurso = statistics?.estadoCursos?.map(({ nombre, cantidad }) => {
        let color;
        if (nombre === "No finalizado") color = "#FFA500"; // Naranja
        if (nombre === "Egresado/Certificado") color = "green"; // Verde
        if (nombre === "Retirado") color = "#FF0000"; // Rojo
      
        return {
          name: nombre,
          value: cantidad,
          color,
        };
      });

      
      

    const columns = ["Cédula", "Nombres", "Apellidos","Edad","Cod Unidad C.","Unidad Curricular","Centro","Cohorte","Periodo","Grupo","Fecha Insc", "Email", "Teléfono","Procedencia","Estado","Es Patrocinado"];

    const renderItem = (dato) => (
        <tr key={dato.id}>
            <td className="col">{dato?.datos_identificacion?.cedula_identidad}</td>
            <td className="col">{dato?.datos_identificacion?.nombres}</td>
            <td className="col">{dato?.datos_identificacion?.apellidos}</td>
            <td className="col">{dato?.edad}</td>
            <td className="col">{dato?.curso?.cod}</td>
            <td className="col">{dato?.curso?.descripcion}</td>
            <td className="col">{dato?.centro?.descripcion}</td>
            <td className="col">{dato?.cohorte?.descripcion}</td>
            <td className="col">{dato?.periodo?.descripcion}</td>
            <td className="col">{dato?.curso?.grupo?.descripcion}</td>
            <td className="col">{dato?.fecha_inscripcion}</td>
            <td className="col">{dato?.datos_identificacion?.direccion_email}</td>
            <td className="col">{dato?.datos_identificacion?.telefono_celular}</td>
            <td className="col">{dato?.datos_identificacion?.procedencia?.descripcion}</td>
            <td className="col">{dato?.datos_identificacion?.estado?.descripcion}</td>
            <td className="col">{dato?.es_patrocinado ? "Sí" : "No"}</td>

          
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
            <div className="stat-box d-flex justify-content-between" style={{ maxWidth: '100%' }}> 
                {/* Total de Participantes */}
                <div className="stat-card" style={{ padding: '5px', margin: '0 10px', width: '22%' }}>
                    <div className="stat-icon"><FaUserFriends /></div>
                    <div className="stat-number" style={{ color: '#58c765', fontSize: '1.8rem' }}>{totalParticipantes}</div>
                    <h4 style={{ fontSize: '1.1rem', color:'gray' }}>Total Inscripciones</h4>
                </div>
                <div className="stat-card" style={{
                    padding: '8px',
                    margin: '0 10px',
                    width: '22%',
                    position: 'relative',
                    backgroundColor: '#fff',
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                }}>

                    {/* Menor y Mayor Edad - Distribuidos a los lados */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',  // Distribuye menor a la izquierda y mayor a la derecha
                        fontSize: '0.8rem',  // Ajustamos el tamaño del texto
                        color: '#6c757d',
                        padding: '0 8px',  // Reducimos el padding para que esté más junto
                    }}>
                        <div style={{ color: '#5cb85c', fontWeight: 'bold' }}> {/* Color verde para menor */}
                            <span>↓ Menor:</span> {menorEdad} años
                        </div>
                        <div style={{ color: '#d9534f', fontWeight: 'bold' }}> {/* Color rojo para mayor */}
                            <span>↑ Mayor:</span> {mayorEdad} años
                        </div>
                    </div>

                    {/* Promedio de Edad */}
                    <div className="stat-number" style={{
                        color: '#ffda1f',  
                        fontSize: '1.7rem',  // Reducimos el tamaño de la fuente
                        fontWeight: 'bold',
                        textAlign: 'center',
                        marginBottom: '3px',  // Reducimos el margen
                    }}>
                        {promedioEdad.toFixed(0)} Años
                    </div>

                    <h4 style={{
                        fontSize: '0.9rem',  // Reducimos el tamaño del texto
                        color: '#6c757d',  
                        textAlign: 'center',
                        marginBottom: '6px',  // Reducimos el margen inferior
                    }}>
                        Promedio de Edad
                    </h4>

                    {/* Barra de Progreso */}
                    <div style={{ width: '75%', margin: '0 auto' }}>
                        <ProgressBar
                            now={(promedioEdad * 100) /mayorEdad} 
                            variant="warning"
                            style={{
                                height: '8px',  // Reducimos la altura de la barra
                                borderRadius: '5px',
                                backgroundColor: '#f1f1f1'
                            }}
                        />
                    </div>
                   
                </div>



                
                <div className="stat-card" style={{ padding: '0', margin: '0 10px', width: '100%', maxWidth: '300px' }}> 
                    <ResponsiveContainer width="100%" height={120}> {/* Ajustamos el width y height dinámicamente */}
                        <PieChart>
                        <Pie
                            data={[
                            { name: 'Masculino', value: porcentajeMasculino },
                            { name: 'Femenino', value: porcentajeFemenino },
                            { name: 'Otros', value: porcentajeOtros },
                            ]}
                            dataKey="value"
                            startAngle={180} // Semicírculo
                            endAngle={0}
                            cx="50%"        // Centrar horizontalmente con porcentaje
                            cy="70%"        // Ajustamos la gráfica para pegarla más arriba
                            outerRadius="70%" // Radio basado en el porcentaje del contenedor para mayor flexibilidad
                            fill="#8884d8"
                            label={({ name, value }) => ` ${value.toFixed(2)}%`} // Mostrar los porcentajes
                            labelLine={true}
                        >
                            {/* Colores para cada sector */}
                            <Cell key="Masculino" fill="#185da7" />
                            <Cell key="Femenino" fill="rgba(254, 185, 56, 0.9)" />
                            <Cell key="Otros" fill="rgba(255, 74, 74, 0.9)" />
                        </Pie>
                        <Legend 
                            layout="horizontal" 
                            verticalAlign="bottom" 
                            align="center" 
                            wrapperStyle={{ 
                            width: "88%", 
                            textAlign: "center", 
                            marginTop: "-15px", 
                            fontSize: '10px' 
                            }}
                        />
                        <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                    </div>



                {/* Promedio de Aporte y Patrocinado */}
                <div className="stat-card" style={{ padding: '5px', margin: '0 10px', width: '22%' }}> {/* Reducir el ancho a 22% */}
                              <ResponsiveContainer width="100%" height={120}>
                                <PieChart>
                                  <Pie
                                    data={participantsByAportePatrocinado}
                                    dataKey="value"
                                    startAngle={180}
                                    endAngle={0}
                                    cx="50%"
                                    cy="70%"
                                    outerRadius="70%"
                                    fill="#8884d8"
                                    label={({ name, value }) => ` ${value} ${name}`}
                                    labelLine={true}
                                  >
                                    <Cell key="RealizaAporte" fill="#8884d8" />
                                    <Cell key="EsPatrocinado" fill="#82ca9d" />
                                  </Pie>
                                 
                                  <Tooltip />
                                </PieChart>
                              </ResponsiveContainer>
                    
                            </div>

                

            </div>

            </motion.div>

            <div className="row" style={{ marginTop: '10px' }}>
                {/* Columna para la tabla */}
                <div className="col-lg-12"> {/* Ajustado para más espacio a la tabla */}
                    <div className="card-box" style={{ padding: '10px' }}> {/* Reduce padding de la tabla */}
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h2 style={{ fontSize: '1.8rem' }}>Cálculo de Indicadores</h2>
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
                                    onClick={getAllIndicadores}
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
                        <div className="d-flex gap-2 align-items-center mb-3">
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
                            </div>
                            <div className="d-flex mb-3 ">
                            <Form.Select
                                    name="externo"
                                    value={filters.externo}
                                    onChange={handleFilterChange}
                                    className="me-2"
                                    style={{ width: 'auto' }}
                                    >
                                    <option value="">¿U.C externa?</option>
                                    <option value="true">Sí</option>
                                    <option value="false">No</option>
                                    </Form.Select>
                            <Form.Select
                                name="status_pay"
                                value={filters.status_pay}
                                onChange={handleFilterChange}
                                className="me-2"
                                style={{ width: 'auto' }}
                                >
                                <option value="">Estado de pago</option>
                                <option value="1">No pagado (Rojo)</option>
                                <option value="2">Pago Inscripción Completo (Naranja)</option>
                                <option value="3">Pago Inscripción y Cuota Completo (Verde)</option>
                                <option value="4">Patrocinado (Azul)</option>
                                <option value="5">Exonerado (Rosado)</option>
                                </Form.Select>
                                <Form.Select
                                name="status_curso"
                                value={filters.status_curso}
                                onChange={handleFilterChange}
                                className="me-2"
                                style={{ width: 'auto' }}
                                >
                                <option value="">Estado de curso</option>
                                <option value="1">No Finalizado (Naranja)</option>
                                <option value="2">Egresado/Certificado (Verde)</option>
                                <option value="3">Retirado (Rojo)</option>
                                </Form.Select>
                                <Form.Select
                                    name="es_patrocinado"
                                    value={filters.es_patrocinado}
                                    onChange={handleFilterChange}
                                    className="me-2"
                                    style={{ width: 'auto' }}
                                    >
                                    <option value="">¿Es patrocinado?</option>
                                    <option value="true">Sí</option>
                                    <option value="false">No</option>
                                    </Form.Select>
                                    <Form.Select
                                        name="tlf"
                                        value={filters.tlf}
                                        onChange={handleFilterChange}
                                        className="me-2"
                                        style={{ width: 'auto' }}
                                        >
                                        <option value="">¿Tiene Tlf?</option>
                                        <option value="true">Sí</option>
                                        <option value="false">No</option>
                                    </Form.Select>
                                    {/* Fecha con label en la misma línea */}
                                <div className="d-flex align-items-center">
                                    <Form.Label className="me-2 mb-0">Fecha mayor que: </Form.Label>
                                    <Form.Control
                                    type="date"
                                    name="fecha_inscripcion"
                                    value={filters.fecha_inscripcion}
                                    onChange={handleFilterChange}
                                    style={{ width: 'auto' }}
                                    />
                                        </div>                          
                                    




                                        

                            </div>
                        <div className="d-flex mb-3 ">
                            
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
                                {generoOptions.map(option => (
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
                                {estadoOptions.map(option => (
                                    <option key={option.id} value={option.id}>{option.descripcion}</option>
                                ))}
                            </Form.Select>

                            <Form.Select
                                name="grupo_id"
                                value={filters.grupo_id}
                                onChange={handleFilterChange}
                                className="me-2"
                            >
                                <option value="">Grupo</option>
                                {grupoOptions.map(option => (
                                    <option key={option.id} value={option.id}>{option.descripcion}</option>
                                ))}
                            </Form.Select>
                            <Form.Select
                                name="area_id"
                                value={filters.area_id}
                                onChange={handleFilterChange}
                                className="me-2"
                            >
                                <option value="">Área</option>
                                {areaOptions.map(option => (
                                    <option key={option.id} value={option.id}>{option.descripcion}</option>
                                ))}
                            </Form.Select>
                            <Form.Select
                                name="centro_id"
                                value={filters.centro_id}
                                onChange={handleFilterChange}
                                className="me-2"
                            >
                                <option value="">Centro</option>
                                {centroOptions.map(option => (
                                    <option key={option.id} value={option.id}>{option.descripcion}</option>
                                ))}
                            </Form.Select>
                            <Form.Select
                                name="cohorte_id"
                                value={filters.cohorte_id}
                                onChange={handleFilterChange}
                                className="me-2"
                            >
                                <option value="">Cohorte</option>
                                {cohorteOptions.map(option => (
                                    <option key={option.id} value={option.id}>{option.descripcion}</option>
                                ))}
                            </Form.Select>
                            <Form.Select
                                name="periodo_id"
                                value={filters.periodo_id}
                                onChange={handleFilterChange}
                                className="me-2"
                            >
                                <option value="">Periodo</option>
                                {periodoOptions.map(option => (
                                    <option key={option.id} value={option.id}>{option.descripcion}</option>
                                ))}
                            </Form.Select>
                            <Form.Select
                                name="unidad_id"
                                value={filters.unidad_id}
                                onChange={handleFilterChange}
                                className="me-2"
                            >
                                <option value="">Unidad</option>
                                {unidadOptions.map(option => (
                                    <option key={option.id} value={option.id}>{option.descripcion}</option>
                                ))}
                            </Form.Select>
                            <Form.Select
                                name="patrocinante_id"
                                value={filters.patrocinante_id}
                                onChange={handleFilterChange}
                                className="me-2"
                            >
                                <option value="">Patrocinante 1</option>
                                {patrocinanteOptions.map(option => (
                                    <option key={option.id} value={option.id}>{option.nombre_patrocinante}</option>
                                ))}
                            </Form.Select>
                            <Form.Select
                                name="patrocinante_id2"
                                value={filters.patrocinante_id2}
                                onChange={handleFilterChange}
                                className="me-2"
                            >
                                <option value="">Patrocinante 2</option>
                                {patrocinanteOptions.map(option => (
                                    <option key={option.id} value={option.id}>{option.nombre_patrocinante}</option>
                                ))}
                            </Form.Select>
                            <Form.Select
                                name="patrocinante_id3"
                                value={filters.patrocinante_id3}
                                onChange={handleFilterChange}
                                className="me-2"
                            >
                                <option value="">Patrocinante 3</option>
                                {patrocinanteOptions.map(option => (
                                    <option key={option.id} value={option.id}>{option.nombre_patrocinante}</option>
                                ))}
                            </Form.Select>
                            <Form.Select
                                name="procedencia_id"
                                value={filters.procedencia_id}
                                onChange={handleFilterChange}
                                className="me-2"
                            >
                                <option value="">Procedencia</option>
                                {procedenciaOptions.map(option => (
                                    <option key={option.id} value={option.id}>{option.descripcion}</option>
                                ))}
                            </Form.Select>

                        </div>
                        <div className="d-flex mb-3 ">
                        <Form.Control
                                type="number"
                                placeholder="Edad mayor que"
                                value={filters.edad_mayor} // Conecta el campo de cédula al estado de filtros
                                name="edad_mayor"
                                onChange={handleFilterChange} // Usa handleFilterChange para actualizar el valor
                                className="me-2"
                            />

                        <Form.Control
                                type="number"
                                placeholder="Edad menor que"
                                value={filters.edad_menor} // Conecta el campo de cédula al estado de filtros
                                name="edad_menor"
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


                        

                        <ToastContainer />
                    </div>
                    
            </div>
            
            </div>
            {/* Gráfica  justo debajo de la tabla */}
           


        <motion.div 
                initial={{ opacity: 1, height: "auto" }}
                animate={{ opacity: mostrarSoloTabla ? 0 : 1, height: mostrarSoloTabla ? 0 : "auto" }}
                transition={{ duration: 0.5 }}
            >
            <div className="col-lg-12 d-flex justify-content-between" style={{ gap: '20px' }}>


                <div className="chart-box" style={{ flex: '1 1 31%', maxWidth: '31%', marginRight: '10px'}}>

                <   h4 style={{ fontSize: '1.2rem' }}>Cantidad de Participantes por Estado</h4>
    
                    {estadoOptions.length > 0 && (
                       <ResponsiveContainer width="100%" height={400}>
                     {participantesPorEstadoData.length > 0 && (
                        <BarChart data={participantesPorEstadoData} margin={{ top: 40, right: 30, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="count" fill="#8884d8" name="Participantes" />
                        </BarChart>
                    )}
                   </ResponsiveContainer>
                    )}
                </div>

               
                <div className="chart-box "style={{ flex: '1 1 31%', maxWidth: '31%', marginRight: '10px'}}>
                    <h4 style={{ fontSize: '1.2rem', color: 'gray' }}>Distribución por Áreas</h4>
                        <ResponsiveContainer width="100%" height={400}>
                        <PieChart >
                        <Pie
                            data={AreaGraphic}
                            cx={250}
                            cy={150}
                            outerRadius={150}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => ` ${(percent * 100).toFixed(0)}%`}
                        >
                            {AreaGraphic.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend/>
                        </PieChart>
                        
                        </ResponsiveContainer>
                        </div>  

                <div className="chart-box "style={{ flex: '1 1 31%', maxWidth: '31%', marginRight: '10px'}}>
                <h4 style={{ fontSize: '1.2rem', color: 'gray' }}>Distribución por Rango de Edad</h4>
                    <ResponsiveContainer width="100%" height={300} >
                        <PieChart>
                            <Pie
                                data={rangoEdades}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="60%"
                                outerRadius={120}
                                fill="#82ca9d"
                                label={({ name, percent }) => `${(percent * 100).toFixed(2)}%`}
                            >
                                {rangoEdades.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value) => `${value}%`} />
                            <Legend 
                                layout="horizontal" 
                                verticalAlign="bottom" 
                                align="center" 
                                wrapperStyle={{ 
                                    position: "relative",  // Hace que "top" funcione
                                    top: "20px",  // Ajusta el valor para empujar la leyenda hacia abajo
                                    width: "90%", 
                                    textAlign: "center", 
                                    fontSize: '15px' 
                                }}
                            />

                        </PieChart>
                    </ResponsiveContainer>
                </div>  


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
            </motion.div>
            <motion.div 
                initial={{ opacity: 1, height: "auto" }}
                animate={{ opacity: mostrarSoloTabla ? 0 : 1, height: mostrarSoloTabla ? 0 : "auto" }}
                transition={{ duration: 0.5 }}
            >

 {/* Gráfica de Estado de Pagos justo debajo de la tabla */}
              <div className="col-lg-12 d-flex  mt-2 justify-content-between"> {/* Añadido justify-content-between para separar */} 
                <div className="chart-box" style={{ flex: '1 1 50%', maxWidth: '50%', marginRight: '10px' }}>
                  <h4 style={{ fontSize: '1.2rem', textAlign: 'flex' }}>Estado de Pagos</h4>
                  {estadoPago!== undefined && (
                                    <ResponsiveContainer width="100%" height={400}>
                                    <BarChart data={estadoPago} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                      <CartesianGrid strokeDasharray="3 3" />
                                      <XAxis dataKey="name" />
                                      <YAxis />
                                      <Tooltip />
                                      <Legend />
                                      <Bar dataKey="value">
                                        {estadoPago.map((entry, index) => (
                                          <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                      </Bar>
                                    </BarChart>
                                  </ResponsiveContainer>
                                  
                                     )} 

                </div>
                <div className="chart-box" style={{ flex: '1 1 50%', maxWidth: '50%', marginRight: '10px' }}>
                <h4 style={{ fontSize: '1.2rem', textAlign: 'flex' }}>Estado de Programas</h4>
                 {statistics?.totalInscritos !== undefined && (
                               <ResponsiveContainer width="100%" height={400}>
                               <BarChart data={estadoCurso} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                 <CartesianGrid strokeDasharray="3 3" />
                                 <XAxis dataKey="name" />
                                 <YAxis />
                                 <Tooltip />
                                 <Legend />
                                 <Bar dataKey="value">
                                   {estadoPago.map((entry, index) => (
                                     <Cell key={`cell-${index}`} fill={entry.color} />
                                   ))}
                                 </Bar>
                               </BarChart>
                             </ResponsiveContainer>
                             )}

                </div>
              </div>
              </motion.div>


             
                        

    </div>
                    

                );
};

export default ShowIndicadores;
