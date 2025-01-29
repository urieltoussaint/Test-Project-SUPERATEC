import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Table from 'react-bootstrap/Table';
import { useNavigate } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { Modal } from 'react-bootstrap';
import { useLoading } from '../../components/LoadingContext';
import './ShowDatos.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PaginationTable from '../../components/PaginationTable';  // Importa el componente de paginación
import { ResponsiveContainer,Line, LineChart,BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,AreaChart,Area,Radar,RadarChart, PieChart, Cell, Pie, ComposedChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";

// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FaUserFriends, FaClock, FaBook,FaSync,FaSearch  } from 'react-icons/fa';  // Importamos íconos de react-icons
import ProgressBar from 'react-bootstrap/ProgressBar';


const endpoint = 'http://localhost:8000/api';
const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00C49F', '#FFBB28'];

const ShowDatos = () => {
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
    const [SuperatecOptions, setSuperatecOptions] = useState([]);
    const [grupoPrioritarioOptions, setgrupoPrioritarioOptions] = useState([]);
    const dataToUse = datos;

    const totalParticipantes = statistics?.totalParticipantes || 0;
    const mayorEdad = statistics?.mayorEdad || 0;
    const menorEdad = statistics?.menorEdad || 0;
    const promedioEdad = statistics?.promedioEdad || 0;
    const porcentajeMasculino = statistics?.porcentajesGenero?.masculino || 0;
    const porcentajeFemenino = statistics?.porcentajesGenero?.femenino || 0;
    const porcentajeOtros = statistics?.porcentajesGenero?.otros || 0;
    const [showModalInfo, setShowModalInfo] = useState(false);

    const [filters, setFilters] = useState({
        nivel_instruccion_id: '',
        genero_id: '',
        centro_id: '',
        area_id: '',
        periodo_id: '',
        estado_id: '',
        modalidad_id: '',
        tipo_programa_id: '',
        unidad_id: '',
        cohorte_id: '',
        como_entero_superatec_id: '',
        cedula_identidad: '' 
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
        fetchFilterOptions()
            .finally(() => setLoading(false));
    }, []); 
    
    
    
    const handlePageChange = (page) => {
        setCurrentPage(page);
        getAllDatos(page); // Llama a `getAllDatos` con el nuevo número de página
        
    };

    const getAllDatos = async (page = 1) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${endpoint}/datos-filtrados`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { ...filters, page }, // Incluye `page` en los parámetros
            });
            
            const estadisticas = response.data.estadisticas || {};
            estadisticas.rangoEdades = estadisticas.rangoEdades || [];
            
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
            setSuperatecOptions(response.data.superatec);
            setgrupoPrioritarioOptions(response.data.grupo_prioritario);


    
        } catch (error) {
            setError('Error fetching filter options');
            console.error('Error fetching filter options:', error);
        }
    };


    const deleteDatos = async () => {
        const token = localStorage.getItem('token');
        try {
            await axios.delete(`${endpoint}/datos/${selectedId}`, {
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



 
    const columns = ["Cédula", "Nombres", "Apellidos", "Email", "Teléfono", "Acciones"];


    const renderItem = (dato) => (
        <tr key={dato.id}>
            <td className="col-cedulas">{dato.cedula_identidad}</td>
            <td className="col-nombress">{dato.nombres}</td>
            <td className="col-apellidoss">{dato.apellidos}</td>
            <td className="col">{dato.direccion_email}</td>
            <td className="col">{dato.telefono_celular}</td>
            <td className="col-accioness">
                <div className="d-flex justify-content-around">
                <Button
                    variant="btn btn-info" 
                    onClick={() => navigate(`/datos/${dato.id}`)}
                    className="me-2"
                    title="Ver más"
                >
                    <i className="bi bi-eye"></i>
                </Button>
                <Button
                    variant="btn btn-info" 
                    onClick={() => navigate(`/datos/cursos/${dato.id}`)}
                    className="me-2"
                    title="Ver Unidades Curriculares del Participante"
                >
                    <i className="bi bi-book-fill"></i>
                </Button>
                    {userRole === 'admin' || userRole === 'superuser' ? (
                        <>
                            <Button
                                variant="btn btn-warning"
                                onClick={() => navigate(`/datos/${dato.id}/edit`)}
                                className="me-2 icon-white"
                                title="Editar"
                            >
                                <i className="bi bi-pencil-fill"></i>
                            </Button>
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
            <div className="stat-box d-flex justify-content-between" style={{ maxWidth: '100%' }}> 
                {/* Total de Participantes */}
                <div className="stat-card" style={{ padding: '5px', margin: '0 10px', width: '22%' }}>
                    <div className="stat-icon"><FaUserFriends /></div>
                    <div className="stat-number" style={{ color: '#58c765', fontSize: '1.8rem' }}>{totalParticipantes}</div>
                    <h4 style={{ fontSize: '1.1rem', color:'gray' }}>Total de Participantes</h4>
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
                <div className="stat-card" style={{ padding: '0', margin: '0 10px', width: '100%', maxWidth: '300px' }}> 
                {rangoEdades.length > 0 ? (
                    <ResponsiveContainer width="100%" height={120}>
                        <PieChart>
                            <Pie
                                data={rangoEdades}
                                startAngle={180} // Semicírculo
                                endAngle={0}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="70%"
                                outerRadius="70%"
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
                            width: "88%", 
                            textAlign: "center", 
                            marginTop: "-15px", 
                            fontSize: '10px' 
                            }}
                        />
                        </PieChart>
                    </ResponsiveContainer>
                ) : (
                    <p>0</p>
                )}

                </div>

            </div>


            <div className="row" style={{ marginTop: '10px' }}>
                {/* Columna para la tabla */}
                <div className="col-lg-9"> {/* Ajustado para más espacio a la tabla */}
                    <div className="card-box" style={{ padding: '10px' }}> {/* Reduce padding de la tabla */}
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h2 style={{ fontSize: '1.8rem' }}>Lista de Participantes</h2>
                            <div className="d-flex align-items-center">
                            <Form.Control
                                type="text"
                                placeholder="Buscar por Cédula"
                                value={filters.cedula_identidad} // Conecta el campo de cédula al estado de filtros
                                name="cedula_identidad"
                                onChange={handleFilterChange} // Usa handleFilterChange para actualizar el valor
                                className="me-2"
                            />
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
                                


                                {userRole === 'admin' || userRole === 'superuser' ? (

                                <Button variant="btn custom" onClick={() => navigate('/formulario/create')} className="btn-custom" title="Crear Participante">
                                <i className="bi bi-person-plus-fill me-2  "></i> Nuevo
                            </Button>

                                
                                
                                ):(
                                    <></>
                                )}
                        </div>
                    </div>

                        {/* Filtros */}
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
                                name="como_entero_superatec_id"
                                value={filters.como_entero_superatec_id}
                                onChange={handleFilterChange}
                                className="me-2"
                            >
                                <option value="">Como se Entero</option>
                                {SuperatecOptions.map(option => (
                                    <option key={option.id} value={option.id}>{option.descripcion}</option>
                                ))}
                            </Form.Select>

                            
                            <Form.Select 
                                name="grupo_prioritario_id"
                                value={filters.grupo_prioritario_id}
                                onChange={handleFilterChange}
                                className="me-2"
                            >
                                <option value="">Grupo Prioritario</option>
                                {grupoPrioritarioOptions.map(option => (
                                    <option key={option.id} value={option.id}>{option.descripcion}</option>
                                ))}
                            </Form.Select>

                           
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
                            <Modal.Body>¿Estás seguro de que deseas eliminar este Participante y todos los datos relacionados a él?</Modal.Body>
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
            <div className="col-lg-3" style={{ marginLeft: '-100px'}}> {/* Reduce espacio entre columnas */}
                <div className="chart-box" style={{ marginRight: '10px' }}>
                        <h4 style={{ fontSize: '1.2rem' }}>¿Cómo se enteró de Superatec?</h4>

                        {SuperatecOptions.length > 0 && (
                         <ResponsiveContainer width='100%' height={300}>
                         <PieChart>
                             <Pie
                                 data={comoEnteroSuperatecData} // Usa comoEnteroSuperatecData
                                 dataKey="value"
                                 nameKey="name"
                                 cx="50%"
                                 cy="50%"
                                 innerRadius={80}
                                 outerRadius={100}
                                 fill="#82ca9d"
                                 label={({ value }) => `${value}%`}
                             >
                                 {comoEnteroSuperatecData.map((entry, index) => (
                                     <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                 ))}
                             </Pie>
                             <Tooltip />
                         </PieChart>
                     </ResponsiveContainer>
                    )}

                    </div>


                <div className="chart-box" style={{ marginRight: '10px', paddingTop: '0px', paddingBottom: '0px' }}>

                    <h4 style={{ fontSize: '1.2rem' }}>Nivel de Instrucción</h4>

                    <ResponsiveContainer width="100%" height={300}>
                    {nivelesInstruccionData.length > 0 && (
                            <BarChart data={nivelesInstruccionData} margin={{ right: 30, left: -20 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="count" fill="#8884d8" name="Participantes" />
                            </BarChart>
                        )}
                    </ResponsiveContainer>
                </div>

            </div>
            </div>
            {/* Gráfica  justo debajo de la tabla */}
           



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

                <div className="chart-box " style={{flex: '1 1 31%', maxWidth: '31%', marginRight: '10px'}}>
                <h4 style={{ fontSize: '1.2rem' }}>Porcentaje por Grupo Prioritario</h4>
                    {grupoPrioritarioOptions.length > 0 && (
                       <ResponsiveContainer width='100%' height={300}>
                       <PieChart>
                           <Pie
                               data={grupoPrioritarioData} // Usa grupoPrioritarioData
                               dataKey="value"
                               nameKey="name"
                               cx="50%"
                               cy="60%"
                               outerRadius={120}
                               fill="#82ca9d"
                               label={({ value }) => `${value}%`}
                           >
                               {grupoPrioritarioData.map((entry, index) => (
                                   <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                               ))}
                           </Pie>
                           <Tooltip />
                           <Legend 
                                layout="horizontal" 
                                verticalAlign="bottom" 
                                align="center" 
                                wrapperStyle={{ 
                                    position: "relative",  
                                    top: "20px",  // Ajusta el valor para empujar la leyenda hacia abajo
                                    width: "90%", 
                                    textAlign: "center", 
                                    fontSize: '15px' 
                                }}
                            />
                       </PieChart>
                   </ResponsiveContainer>
                    )}
                        

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

export default ShowDatos;
