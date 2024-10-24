import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Table from 'react-bootstrap/Table';
import { useNavigate } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { Modal } from 'react-bootstrap';
import { useLoading } from '../../components/LoadingContext'; 
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PaginationTable from '../../components/PaginationTable';
import { ResponsiveContainer,Line, LineChart,BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,AreaChart,Area,Radar,RadarChart, PieChart, Cell, Pie, ComposedChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FaUserFriends, FaClock, FaBook,FaSync,FaBuilding  } from 'react-icons/fa';  // Importamos íconos de react-icons
import ProgressBar from 'react-bootstrap/ProgressBar';
import moment from 'moment';  // Asegúrate de tener moment.js instalado para manejar fechas


const endpoint = 'http://localhost:8000/api';
const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00C49F', '#FFBB28'];

const ShowPatrocinantes = () => {
    const [Patrocinantes, setPatrocinantes] = useState([]);
    const [filteredPatrocinantes, setFilteredPatrocinantes] = useState([]);
    const [searchCedula, setSearchCedula] = useState('');
    const [currentPage, setCurrentPage] = useState(1);  // Estado para la página actual
    const [showModal, setShowModal] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [loadingData, setLoadingData] = useState(false); // Estado para controlar la recarga
    const [range, setRange] = useState(30); // Estado por defecto a 30 días
    const [estadoOptions, setEstadoOptions] = useState([]);  // Inicializa con un array vacío
    const [paisOptions, setPaisOptions] = useState([]);  // Inicializa con un array vacío
    const [tipoPatrocinanteOptions, setTipoPatrocinanteOptions] = useState([]);  // Inicializa con un array vacío
    const [tipoIndustriaOptions, setTipoIndustriaOptions] = useState([]);  // Inicializa con un array vacío
   

    const [filters, setFilters] = useState({
        estado_id: '',
        pais_id: '',
        tipo_patrocinante_id: '',
        tipo_industria_id: '',
        empresa_persona: '',
        es_patrocinante: '',  // Nuevo filtro
        exterior: '',         // Nuevo filtro
        bolsa_empleo: ''      // Nuevo filtro
    });
    
    
    const itemsPerPage = 7; // Número de elementos por página
    const { setLoading } = useLoading();
    const [error, setError] = useState(null);
    const navigate = useNavigate();

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
        Promise.all([getAllPatrocinantes(), fetchFilterOptions()]) // Agrega aquí la función para obtener como_entero_superatec
            .finally(() => {
                setLoading(false);
            });
    }, []);
    

    const getAllPatrocinantes = async () => {
        try {
            const token = localStorage.getItem('token');
            let allPatrocinantes = [];
            let currentPage = 1;
            let totalPages = 1;
    
            // Loop para obtener todas las páginas
            while (currentPage <= totalPages) {
                const response = await axios.get(`${endpoint}/patrocinantes?with=contactoPatrocinante&page=${currentPage}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                });
    
                allPatrocinantes = [...allPatrocinantes, ...response.data.data];
                totalPages = response.data.last_page;
                currentPage++;
            }
    
            setPatrocinantes(allPatrocinantes);
            setFilteredPatrocinantes(allPatrocinantes);
           

            console.log('Patrocinantes obtenidos:', allPatrocinantes);
        } catch (error) {
            if (error.response && error.response.status === 401) {
                setError('No estás autenticado. Por favor, inicia sesión.');
                navigate('/'); // Redirige al login si no está autenticado
            } else {
                setError('Error fetching data');
                console.error('Error fetching data:', error);
            }
        }
    };
 
    const deletePatrocinantes = async () => {
        const token = localStorage.getItem('token');
        try {
            await axios.delete(`${endpoint}/patrocinantes/${selectedId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            toast.success('Participante eliminado con Éxito');             
            getAllPatrocinantes();
            setShowModal(false); // Cierra el modal tras la eliminación exitosa
        } catch (error) {
            setError('Error deleting data');
            console.error('Error deleting data:', error);
            toast.error('Error al eliminar Participante');
            setShowModal(false); // Cierra el modal tras el error
        }
    };
    const fetchFilterOptions = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${endpoint}/filter-patrocinantes`, { headers: { Authorization: `Bearer ${token}` } });

            setEstadoOptions(response.data.estado);
            setPaisOptions(response.data.pais);
            setTipoIndustriaOptions(response.data.tipo_industria);
            setTipoPatrocinanteOptions(response.data.tipo_patrocinante);

        } catch (error) {
            setError('Error fetching filter options');
            console.error('Error fetching filter options:', error);
        }
    }

    

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchCedula(value);
        applyFilters({ ...filters, searchCedula: value });
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        const newFilters = { ...filters, [name]: value };
        setFilters(newFilters);
        applyFilters(newFilters);
    };

    const applyFilters = (filters) => {
        let filtered = Patrocinantes;
    
        // Filtrado por Rif/Cédula
        if (filters.searchCedula) {
            filtered = filtered.filter(dato =>
                dato.rif_cedula.toLowerCase().includes(filters.searchCedula.toLowerCase())
            );
        }
    
        // Filtrado por Estado
        if (filters.estado_id) {
            filtered = filtered.filter(dato =>
                dato.estado_id === parseInt(filters.estado_id)
            );
        }
    
        // Filtrado por Tipo de Patrocinante
        if (filters.tipo_patrocinante_id) {
            filtered = filtered.filter(dato =>
                dato.tipo_patrocinante_id === parseInt(filters.tipo_patrocinante_id)
            );
        }
    
        // Filtrado por Tipo de Industria
        if (filters.tipo_industria_id) {
            filtered = filtered.filter(dato =>
                dato.tipo_industria_id === parseInt(filters.tipo_industria_id)
            );
        }
    
        // Filtrado por País
        if (filters.pais_id) {
            filtered = filtered.filter(dato =>
                dato.pais_id === parseInt(filters.pais_id)
            );
        }
    
        // Filtrado por Empresa o Persona
        if (filters.empresa_persona) {
            filtered = filtered.filter(dato =>
                dato.empresa_persona === filters.empresa_persona
            );
        }
    
        // Filtrado por es_patrocinante
        if (filters.es_patrocinante !== '') {
            filtered = filtered.filter(dato =>
                dato.es_patrocinante === (filters.es_patrocinante === 'true')
            );
        }
    
        // Filtrado por bolsa_empleo
        if (filters.bolsa_empleo !== '') {
            filtered = filtered.filter(dato =>
                dato.bolsa_empleo === (filters.bolsa_empleo === 'true')
            );
        }
    
        // Filtrado por exterior
        if (filters.exterior !== '') {
            filtered = filtered.filter(dato =>
                dato.exterior === (filters.exterior === 'true')
            );
        }
    
        setFilteredPatrocinantes(filtered);
        setCurrentPage(1);  // Resetear a la primera página tras aplicar los filtros
    };
    
    

    if (error) {
        return <div>{error}</div>;
    }


    const loadData = async () => {
        setLoadingData(true); // Inicia el estado de carga
        try {
            await getAllPatrocinantes(); // Espera a que getAllPatrocinantes haga la solicitud y actualice los Patrocinantes
        } catch (error) {
            console.error('Error recargando los Patrocinantes:', error); // Maneja el error si ocurre
        } finally {
            setLoadingData(false); // Detener el estado de carga cuando la solicitud haya terminado
        }
    };

      // Cálculo de Patrocinantes según filtros
    const activeFilters = Object.values(filters).some(val => val); // Comprobar si hay filtros activos
    const dataToUse = activeFilters ? filteredPatrocinantes : Patrocinantes; // Usar filteredPatrocinantes si hay filtros activos, de lo contrario usar Patrocinantes

    // Total de participantes basado en filtros activos
    const totalPatrocinados = dataToUse.length;


    const totalEmpresas = filteredPatrocinantes.filter(dato => dato.empresa_persona === 'Empresa').length;
    const totalPersonas = filteredPatrocinantes.filter(dato => dato.empresa_persona === 'Persona').length;

    const total = totalEmpresas + totalPersonas;
    const porcentajeEmpresa = total > 0 ? (totalEmpresas / total) * 100 : 0;
    const porcentajePersona = total > 0 ? (totalPersonas / total) * 100 : 0;

    // Filtrar los datos según el valor de bolsa_empleo (true o false)
    const bolsaEmpleoTrueCount = filteredPatrocinantes.filter(dato => dato.bolsa_empleo === true).length;
    const bolsaEmpleoFalseCount = filteredPatrocinantes.filter(dato => dato.bolsa_empleo === false).length;

    // Datos para el gráfico de barras
    const bolsa = [
        { name: 'Sí', value: bolsaEmpleoTrueCount },
        { name: 'No', value: bolsaEmpleoFalseCount },
    ];
    const colors = ['#0088FE', 'rgba(255, 74, 74, 0.9)']; // Azul para true, naranja para false

     // Filtrar los datos según el valor de es_patrocinante (true o false)
     const esPatrocinanteTrueCount = filteredPatrocinantes.filter(dato => dato.es_patrocinante === true).length;
     const esPatrocinanteFalseCount = filteredPatrocinantes.filter(dato => dato.es_patrocinante === false).length;
 
     // Datos para el gráfico de dona
     const patrocinante = [
         { name: 'Es Patrocinante (Sí)', value: esPatrocinanteTrueCount },
         { name: 'Es Patrocinante (No)', value: esPatrocinanteFalseCount },
     ];


    

    const getFilteredDataByDate = () => {
        const today = moment();
        const filteredData = dataToUse.filter(dato => {
            const inscripcionDate = moment(dato.created_at);
            return inscripcionDate.isAfter(today.clone().subtract(range, 'days'));
        });
    
        // Agrupar por fecha
        const dateCounts = filteredData.reduce((acc, dato) => {
            const fecha = moment(dato.created_at).format('YYYY-MM-DD');
            acc[fecha] = (acc[fecha] || 0) + 1;
            return acc;
        }, {});
    
        return Object.keys(dateCounts).map(date => ({
            fecha: date,
            count: dateCounts[date]
        }));
    };

    // Función para procesar los datos de patrocinantes y agruparlos por tipo de industria
    const getTipoIndustriaChartData = () => {

        // mapea tipo_industria_id con la descripción
        const industriaDict = tipoIndustriaOptions.reduce((acc, industria) => {
            acc[industria.id] = industria.descripcion;
            return acc;
        }, {});
    
        // Agrupar los datos filtrados por tipo de industria
        const groupedData = filteredPatrocinantes.reduce((acc, dato) => {
            // Asegúrate de que el dato tenga el campo `tipo_industria_id`
            const industriaId = dato?.tipo_industria_id || 'Desconocido'; 
            const industriaName = industriaDict[industriaId] || 'Desconocido';
    
            if (!acc[industriaName]) {
                acc[industriaName] = { name: industriaName, count: 0 };
            }
            acc[industriaName].count += 1;
            return acc;
        }, {});
    
        console.log("Agrupación por tipo de industria:", groupedData);
    
        const total = Object.values(groupedData).reduce((sum, dato) => sum + dato.count, 0); // Total de patrocinantes
    
        // Convertir el total a porcentaje para cada categoría
        return Object.values(groupedData).map(item => ({
            name: item.name,
            value: parseFloat(((item.count / total) * 100).toFixed(2)), // Calcular el porcentaje
        }));
    };


    const getTipoPatrocinanteChartData = () => {

        // Crear un diccionario que mapea tipo_patrocinante_id con la descripción
        const patrocinanteDict = tipoPatrocinanteOptions.reduce((acc, patrocinante) => {
            acc[patrocinante.id] = patrocinante.descripcion;
            return acc;
        }, {});
    
        // Agrupar los datos filtrados por tipo de patrocinante
        const groupedData = filteredPatrocinantes.reduce((acc, dato) => {
            // Asegúrate de que el dato tenga el campo `tipo_patrocinante_id`
            const patrocinanteId = dato?.tipo_patrocinante_id || 'Desconocido'; 
            const patrocinanteName = patrocinanteDict[patrocinanteId] || 'Desconocido';
    
            if (!acc[patrocinanteName]) {
                acc[patrocinanteName] = { name: patrocinanteName, count: 0 };
            }
            acc[patrocinanteName].count += 1;
            return acc;
        }, {});
    
        console.log("Agrupación por tipo de patrocinante:", groupedData);
    
        const total = Object.values(groupedData).reduce((sum, dato) => sum + dato.count, 0); // Total de patrocinantes
    
        // Convertir el total a porcentaje para cada categoría
        return Object.values(groupedData).map(item => ({
            name: item.name,
            value: parseFloat(((item.count / total) * 100).toFixed(2)), // Calcular el porcentaje
        }));
    };


    const getPatrocinantesByEstado = () => {
        // Crear un diccionario que mapea estado_id con la descripción
        const estadoDict = estadoOptions.reduce((acc, estado) => {
            acc[estado.id] = estado.descripcion;
            return acc;
        }, {});
    
        // Agrupar los datos de participantes por estado_id
        const groupedData = filteredPatrocinantes.reduce((acc, dato) => {
            const estadoId = dato?.estado_id || 'Desconocido';
            const estadoName = estadoDict[estadoId] || 'Desconocido';  // Obtiene el nombre del estado desde estadoDict
    
            if (!acc[estadoName]) {
                acc[estadoName] = { name: estadoName, count: 0 };
            }
            acc[estadoName].count += 1;
            return acc;
        }, {});
    
        // Convertir los datos en un array
        return Object.values(groupedData);
    };

    const getPatrocinantesByPais = () => {
        // Crear un diccionario que mapea estado_id con la descripción
        const paisDict = paisOptions.reduce((acc, pais) => {
            acc[pais.id] = pais.descripcion;
            return acc;
        }, {});
    
        // Agrupar los datos de participantes por pais_id
        const groupedData = filteredPatrocinantes.reduce((acc, dato) => {
            const paisId = dato?.pais_id || 'Desconocido';
            const paisName = paisDict[paisId] || 'Desconocido';  // Obtiene el nombre del estado desde estadoDict
    
            if (!acc[paisName]) {
                acc[paisName] = { name: paisName, count: 0 };
            }
            acc[paisName].count += 1;
            return acc;
        }, {});
    
        // Convertir los datos en un array
        return Object.values(groupedData);
    };

    const columns = ["Rif/Cedula", "Nombre", "Telefono","Email","Web", "Acciones"];

    const renderItem = (dato) => (
        <tr key={dato.id}>
            <td className="col-rif_cedula">{dato.rif_cedula}</td>
            <td className="col-nombre_patrocinante">{dato.nombre_patrocinante}</td>
            <td className="col-telefono">{dato.telefono}</td>
            <td className="col">{dato.email}</td>
            <td className="col">{dato.web}</td>
            <td className="col-accioness">
                <div className="d-flex justify-content-around">
 
                <Button
                    variant="btn btn-info" // Cambia aquí, solo debes pasar 'outline-info'
                    onClick={() => navigate(`/patrocinantes/${dato.id}`)}
                    className="me-2"
                >
                    <i className="bi bi-list-task"></i>
                </Button>

    
                    {userRole === 'admin' || userRole === 'superuser' ? (
                        <>
                            <Button
                                variant="btn btn-warning"
                                onClick={() => navigate(`/patrocinantes/${dato.id}/edit`)}
                                className="me-2 icon-white"
                            >
                                <i className="bi bi-pencil-fill"></i>
                            </Button>

                           
    
                            {userRole === 'admin' && (
                         

                                <Button
                                variant="btn btn-danger"
                                onClick={() => handleShowModal(dato.id)}
                                className="me-2"
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
                {/* Total de Patrocinados */}
                <div className="stat-card" style={{ padding: '5px', margin: '0 10px', width: '22%' }}>
                    <div className="stat-icon"><FaBuilding  /></div>
                    <div className="stat-number" style={{ color: '#58c765', fontSize: '1.8rem' }}>{totalPatrocinados}</div>
                    <h4 style={{ fontSize: '1.1rem', color:'gray' }}>Total de Patrocinantes</h4>
                </div>

                <div className="stat-card" style={{ padding: '0', margin: '0 10px', width: '100%', maxWidth: '300px' }}>
                    <ResponsiveContainer width="100%" height={120}> {/* Ajustamos el width y height dinámicamente */}
                        <PieChart>
                            <Pie
                                data={[
                                    { name: 'Empresa', value: porcentajeEmpresa },
                                    { name: 'Persona', value: porcentajePersona },
                                ]}
                                dataKey="value"
                                startAngle={180} // Semicírculo
                                endAngle={0}
                                cx="50%"        // Centrar horizontalmente con porcentaje
                                cy="70%"        // Ajustamos la gráfica para pegarla más arriba
                                outerRadius="70%" // Radio basado en el porcentaje del contenedor para mayor flexibilidad
                                fill="#8884d8"
                                label={({ name, value }) => ` ${value.toFixed(2)}%`} // Mostrar los porcentajes
                                labelLine={false}
                            >
                                {/* Colores para cada sector */}
                                <Cell key="Empresa" fill="#8884d8" />
                                <Cell key="Persona" fill="#82ca9d" />
                            </Pie>
                            <Legend 
                                layout="horizontal" 
                                verticalAlign="bottom" 
                                align="center" 
                                wrapperStyle={{ 
                                width: "98%", 
                                textAlign: "center", 
                                marginTop: "-35px", 
                                fontSize: '10px' 
                                }}
                            />
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Total Empresa y persona */}
                <div className="stat-card" style={{ padding: '5px', margin: '0 10px', width: '22%', textAlign: 'center' }}>
                    <div className="d-flex justify-content-between mx-auto" style={{ marginTop: '17px' }}>
                        <div style={{ textAlign: 'center', marginLeft: '40px' }}>
                            <h4 style={{ fontSize: '1.1rem', color: 'gray' }}>Exterior</h4>
                            <div className="stat-number" style={{ color: '#8884d8', fontSize: '1.8rem' }}>
                                {filteredPatrocinantes.filter(dato => dato.exterior === true).length}
                            </div>
                        </div>
                        <div style={{ textAlign: 'center', marginRight: '40px' }}>
                            <h4 style={{ fontSize: '1.1rem', color: 'gray' }}>No Exterior</h4>
                            <div className="stat-number" style={{ color: '#82ca9d', fontSize: '1.8rem' }}>
                                {filteredPatrocinantes.filter(dato => dato.exterior === false).length}
                            </div>
                        </div>
                    </div>
                </div>

            </div>


            <div className="row" style={{ marginTop: '10px' }}>
                {/* Columna para la tabla */}
                <div className="col-lg-9"> {/* Ajustado para más espacio a la tabla */}
                    <div className="card-box" style={{ padding: '10px' }}> {/* Reduce padding de la tabla */}
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h2 style={{ fontSize: '1.8rem' }}>Lista de Patrocinantes</h2>
                            <div className="d-flex align-items-center">
                                <Form.Control
                                        type="text"
                                        placeholder="Buscar por Rif/Cédula"
                                        value={searchCedula}
                                        onChange={handleSearchChange}
                                        className="me-2"
                                    />

                                    <Button
                                    variant="info me-2"
                                    onClick={loadData}
                                    disabled={loadingData} // Deshabilita el botón si está cargando
                                    style={{ padding: '5px 10px', width: '120px' }} // Ajusta padding y ancho

                                >
                                    {/* Icono de recarga */}
                                    {loadingData ? (
                                    <FaSync className="spin" /> // Ícono girando si está cargando
                                    ) : (
                                    <FaSync />
                                    )}
                                </Button>


                                {userRole === 'admin' || userRole === 'superuser' ? (

                                <Button variant="btn custom" onClick={() => navigate('/patrocinantes/create')} className="btn-custom">
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
                            name="empresa_persona"
                            value={filters.empresa_persona}
                            onChange={handleFilterChange}
                            className="me-2"
                        >
                            <option value="">Tipo</option>
                            <option value="Empresa">Empresa</option>
                            <option value="Persona">Persona</option>
                        </Form.Select>

                        <Form.Select
                                name="pais_id"
                                value={filters.pais_id}
                                onChange={handleFilterChange}
                                className="me-2"
                            >
                                <option value="">País</option>
                                {paisOptions.map(option => (
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
                                name="tipo_industria_id"
                                value={filters.tipo_industria_id}
                                onChange={handleFilterChange}
                                className="me-2"
                            >
                                <option value="">Tipo de Industria</option>
                                {tipoIndustriaOptions.map(option => (
                                    <option key={option.id} value={option.id}>{option.descripcion}</option>
                                ))}
                            </Form.Select>
                            <Form.Select
                                name="tipo_patrocinante_id"
                                value={filters.tipo_patrocinante_id}
                                onChange={handleFilterChange}
                                className="me-2"
                            >
                                <option value="">Tipo de Patrocinante</option>
                                {tipoPatrocinanteOptions.map(option => (
                                    <option key={option.id} value={option.id}>{option.descripcion}</option>
                                ))}
                            </Form.Select>


                            
   
                        </div>
                        <div className="d-flex mb-3" style={{ gap: '10px', flexWrap: 'wrap' }}>
                                

                                {/* Filtros booleanos adicionales */}
                                <Form.Select name="es_patrocinante" 
                                value={filters.es_patrocinante}
                                 onChange={handleFilterChange}
                                  className="me-2" 
                                  style={{ width: '30%' }}  
>
                                    <option value="">¿Es patrocinante actualmente?</option>
                                    <option value="true">Sí</option>
                                    <option value="false">No</option>
                                </Form.Select>

                                <Form.Select name="bolsa_empleo"
                                 value={filters.bolsa_empleo} 
                                 onChange={handleFilterChange} 
                                 className="me-2"
                                 style={{ width: '30%' }} 
>
                                    <option value="">¿Posible para bolsa de Empleo?</option>
                                    <option value="true">Sí</option>
                                    <option value="false">No</option>
                                </Form.Select>

                                <Form.Select name="exterior" 
                                value={filters.exterior} 
                                onChange={handleFilterChange} 
                                className="me-2"
                                style={{ width: '30%' }} >
                                    <option value="">¿Exterior?</option>
                                    <option value="true">Sí</option>
                                    <option value="false">No</option>
                                </Form.Select>
                            </div>        

                        
                        
                            
                        {/* Tabla paginada */}
                        <PaginationTable
                        data={filteredPatrocinantes}  // Patrocinantes filtrados
                        itemsPerPage={itemsPerPage}
                        columns={columns}
                        renderItem={renderItem}
                        currentPage={currentPage}  // Página actual
                        onPageChange={setCurrentPage}  // Función para cambiar de página
                        />
                        

                        

                        {/* Modal  de eliminación */}
                        <Modal show={showModal} onHide={handleCloseModal}>
                            <Modal.Header closeButton>
                                <Modal.Title>Confirmar eliminación</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>¿Estás seguro de que deseas eliminar este Participante y todos los Patrocinantes relacionados a él?</Modal.Body>
                            <Modal.Footer>
                                <Button variant="secondary" onClick={handleCloseModal}>
                                    Cancelar
                                </Button>
                                <Button variant="danger" onClick={deletePatrocinantes}>
                                    Eliminar
                                </Button>
                            </Modal.Footer>
                        </Modal>

                        <ToastContainer />
                    </div>
                    
            </div>
            <div className="col-lg-3" style={{ marginLeft: '-100px'}}> {/* Reduce espacio entre columnas */}
                <div className="chart-box" style={{ marginRight: '10px' }}>
                        <h4 style={{ fontSize: '1.2rem' }}>Distribución Por Tipo de Industria</h4>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={getTipoIndustriaChartData()} // Los datos procesados
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    innerRadius={60}
                                    fill="#8884d8"
                                    label={({ value }) => ` ${value}%`} // Etiquetas que muestran el nombre y valor
                                    labelLine={false}
                                >
                                    {getTipoIndustriaChartData().map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                   
                                </Pie>
                                <Legend/>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>

                    </div>


                <div className="chart-box" style={{ marginRight: '10px', paddingTop: '0px', paddingBottom: '0px' }}>

                <h4 style={{ fontSize: '1.2rem' }}>Distribución Por Tipo de Patrocinante</h4>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={getTipoPatrocinanteChartData()} // Los datos procesados
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    fill="#8884d8"
                                    label={({ value }) => ` ${value}%`} // Etiquetas que muestran el nombre y valor
                                    labelLine={false}
                                >
                                    {getTipoPatrocinanteChartData().map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                   
                                </Pie>
                                <Legend/>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                </div>

            </div>
            </div>
            {/* Gráfica  justo debajo de la tabla */}
            <div className="col-lg-12 d-flex justify-content-between" style={{ gap: '20px' }}>
                <div className="chart-box" style={{ flex: '1 1 50%', maxWidth: '50%', marginRight: '10px'}}>
                <h4 style={{ fontSize: '1.2rem' }}>¿Actualmente es Patrocinante?</h4>
                    
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={patrocinante}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={140}
                            innerRadius={50} 
                            fill="#8884d8"
                            label={({  value }) => ` ${value}`} // Muestra el nombre y valor en la etiqueta
                            labelLine={false}
                        >
                            {/* Asignamos los colores según el índice */}
                            {patrocinante.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                            ))}
                        </Pie>
                        <Legend />
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
                </div>
data
                <div className="chart-box " style={{flex: '1 1 50%', maxWidth: '50%', marginRight: '10px'}}>
                <   h4 style={{ fontSize: '1.2rem' }}>¿Posible para bolsa de Empleo </h4>
                {paisOptions.length > 0 && (
                        <ResponsiveContainer width="100%" height={400}>
                            <BarChart
                                width={500}
                                height={300}
                                data={bolsa}
                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="value" fill="#8884d8">
                                    {/* Asignamos los colores según el índice */}
                                    {bolsa.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                
                
                        

                </div>

            </div>    
            {/* segunda fila de graficos                        */}
            <div className="col-lg-12 d-flex justify-content-between" style={{ gap: '20px' }}>


                <div className="chart-box" style={{ flex: '1 1 50%', maxWidth: '50%', marginRight: '10px'}}>

                <   h4 style={{ fontSize: '1.2rem' }}>Cantidad de Patrocinados por País</h4>
                {paisOptions.length > 0 && (
                        <ResponsiveContainer width="100%" height={400}>
                            <BarChart data={getPatrocinantesByPais()} margin={{ top: 40, right: 30, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="count" name="Participantes">
                                    {getPatrocinantesByPais().map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                  
                </div>

                <div className="chart-box " style={{flex: '1 1 50%', maxWidth: '50%', marginRight: '10px'}}>
                <h4 style={{ fontSize: '1.2rem' }}>Cantidad de Patrocinados por Estados/Venezuela</h4>
                {estadoOptions.length > 0 && (
                        <ResponsiveContainer width="100%" height={400}>
                            <BarChart data={getPatrocinantesByEstado()} margin={{ top: 40, right: 30, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="count" name="Participantes">
                                    {getPatrocinantesByEstado().map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                   
                        

                </div>
                
            </div>




             {/* Gráfica tercera fila*/}
             <div className="col-lg-12 d-flex justify-content-between" style={{ gap: '20px' }}>
                <div className="chart-box" style={{flex: '1 1 100%', maxWidth: '100%', marginRight: '10px'}}>
                    <div className="d-flex justify-content-between align-items-center" >
                        <h4 style={{ fontSize: '1.2rem' }}>Registro de Patrocinantes</h4>
                        {/* Selector de rango de fechas */}
                        <Form.Select 
                            value={range} 
                            onChange={(e) => setRange(parseInt(e.target.value))} 
                            style={{ width: '150px', fontSize: '0.85rem' }} // Ajustar el tamaño del selector
                        >
                            <option value={7}>Últimos 7 días</option>
                            <option value={30}>Últimos 30 días</option>
                            <option value={60}>Últimos 60 días</option>
                        </Form.Select>
                    </div>
                    
                    <ResponsiveContainer  width="100%" height={400}>
                        <AreaChart data={getFilteredDataByDate()} margin={{  right: 30, left: -20}}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="fecha" />
                            <YAxis />
                            <Tooltip />
                            <Area type="monotone" dataKey="count" stroke="#82ca9d" fill="#82ca9d" />
                        </AreaChart>
                    </ResponsiveContainer>

                </div>
                



            </div>

                        

    </div>
                    

                );
};

export default ShowPatrocinantes;
