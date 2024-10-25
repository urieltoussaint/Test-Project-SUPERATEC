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

// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FaUserFriends, FaClock, FaBook,FaSync } from 'react-icons/fa';  // Importamos íconos de react-icons
import ProgressBar from 'react-bootstrap/ProgressBar';
import moment from 'moment';  // Asegúrate de tener moment.js instalado para manejar fechas


const endpoint = 'http://localhost:8000/api';
const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00C49F', '#FFBB28'];

const ShowDatos = () => {
    const [datos, setDatos] = useState([]);
    const [filteredDatos, setFilteredDatos] = useState([]);
    const [searchCedula, setSearchCedula] = useState('');
    const [nivelInstruccionOptions, setNivelInstruccionOptions] = useState([]);
    const [generoOptions, setGeneroOptions] = useState([]);
    const [estadoOptions, setEstadoOptions] = useState([]);
    const [SuperatecOptions, setSuperatecOptions] = useState([]);
    const [grupoPrioritarioOptions, setgrupoPrioritarioOptions] = useState([]);
    const [StatusOptions, setStatusOptions] = useState([]);

    


    const [currentPage, setCurrentPage] = useState(1);  // Estado para la página actual
    const [showModal, setShowModal] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [loadingData, setLoadingData] = useState(false); // Estado para controlar la recarga
    const [range, setRange] = useState(30); // Estado por defecto a 30 días


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
        como_entero_superatec_id:'',
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
        Promise.all([getAllDatos(), fetchFilterOptions()]) // Agrega aquí la función para obtener como_entero_superatec
            .finally(() => {
                setLoading(false);
            });
    }, []);
    

    const getAllDatos = async () => {
        try {
            const token = localStorage.getItem('token');
            let allDatos = [];
            let currentPage = 1;
            let totalPages = 1;
    
            // Loop para obtener todas las páginas
            while (currentPage <= totalPages) {
                const response = await axios.get(`${endpoint}/datos?${currentPage}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                });
    
                allDatos = [...allDatos, ...response.data.data];
                totalPages = response.data.last_page;
                currentPage++;
            }
    
            setDatos(allDatos);
            setFilteredDatos(allDatos);
           

            console.log('Datos obtenidos:', allDatos);
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
    const fetchFilterOptions = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${endpoint}/filter-datos`, { headers: { Authorization: `Bearer ${token}` } });
            
            setNivelInstruccionOptions(response.data.nivel_instruccion);
            setGeneroOptions(response.data.genero);
            setEstadoOptions(response.data.estado);
            setSuperatecOptions(response.data.superatec);
            setgrupoPrioritarioOptions(response.data.grupo_prioritario);
            setStatusOptions(response.data.status_seleccion);


    
        } catch (error) {
            setError('Error fetching filter options');
            console.error('Error fetching filter options:', error);
        }
    };

    

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
        let filtered = datos;

        if (filters.searchCedula) {
            filtered = filtered.filter(dato =>
                dato.cedula_identidad.toLowerCase().includes(filters.searchCedula.toLowerCase())
            );
        }

        if (filters.nivel_instruccion_id) {
            filtered = filtered.filter(dato =>
                dato.nivel_instruccion_id === parseInt(filters.nivel_instruccion_id)
            );
        }

        if (filters.genero_id) {
            filtered = filtered.filter(dato =>
                dato.genero_id === parseInt(filters.genero_id)
            );
        }

        if (filters.estado_id) {
            filtered = filtered.filter(dato =>
                dato.estado_id === parseInt(filters.estado_id)
            );
        }
      

        if (filters.como_entero_superatec_id) {
            filtered = filtered.filter(dato =>
                dato.como_entero_superatec_id === parseInt(filters.como_entero_superatec_id)
            );
        }
        if (filters.grupo_prioritario_id) {
            filtered = filtered.filter(dato =>
                dato.grupo_prioritario_id === parseInt(filters.grupo_prioritario_id)
            );
        }
        if (filters.status_seleccion_id) {
            filtered = filtered.filter(dato =>
                dato.status_seleccion_id === parseInt(filters.status_seleccion_id)
            );
        }

        
        setFilteredDatos(filtered);
        setCurrentPage(1);
    };

    if (error) {
        return <div>{error}</div>;
    }


    const loadData = async () => {
        setLoadingData(true); // Inicia el estado de carga
        try {
            await getAllDatos(); // Espera a que getAllDatos haga la solicitud y actualice los datos
        } catch (error) {
            console.error('Error recargando los datos:', error); // Maneja el error si ocurre
        } finally {
            setLoadingData(false); // Detener el estado de carga cuando la solicitud haya terminado
        }
    };
    


      // Cálculo de datos según filtros
    const activeFilters = Object.values(filters).some(val => val); // Comprobar si hay filtros activos
    const dataToUse = activeFilters ? filteredDatos : datos; // Usar filteredDatos si hay filtros activos, de lo contrario usar datos

    // Total de participantes basado en filtros activos
    const totalParticipantes = dataToUse.length;

    // Promedio de Edad basado en filtros activos
    const promedioEdad = dataToUse.length > 0 ? dataToUse.reduce((acc, curr) => acc + curr.edad, 0) / dataToUse.length : 0;

    // Porcentaje de Género basado en filtros activos
    const totalMasculino = dataToUse.filter(d => d.genero_id === 1).length;
    const totalFemenino = dataToUse.filter(d => d.genero_id === 3).length;
    const totalOtros = dataToUse.filter(d => d.genero_id === 2).length;

    const porcentajeMasculino = totalMasculino > 0 ? (totalMasculino / dataToUse.length) * 100 : 0;
    const porcentajeFemenino = totalFemenino > 0 ? (totalFemenino / dataToUse.length) * 100 : 0;
    const porcentajeOtros = totalOtros > 0 ? (totalOtros / dataToUse.length) * 100 : 0;

    // Cálculo de la mayor y menor edad
    const mayorEdad = dataToUse.length > 0 ? Math.max(...dataToUse.map(d => d.edad)) : 0;
    const menorEdad = dataToUse.length > 0 ? Math.min(...dataToUse.map(d => d.edad)) : 0;

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

    const getNivelInstruccionData = () => {
        // Crear un diccionario que mapea nivel_instruccion_id a descripcion
        const nivelDict = nivelInstruccionOptions.reduce((acc, nivel) => {
            acc[nivel.id] = nivel.descripcion;
            return acc;
        }, {});
    
        // Agrupar los datos filtrados por nivel de instrucción
        const groupedData = filteredDatos.reduce((acc, dato) => {
            const nivel = nivelDict[dato.nivel_instruccion_id] || 'Desconocido'; // Usar el nivelDict para obtener la descripción
    
            if (!acc[nivel]) {
                acc[nivel] = { name: nivel, count: 0 };
            }
            acc[nivel].count += 1;
    
            return acc;
        }, {});
    
        // Convertir el objeto en un array para usar en el gráfico
        return Object.values(groupedData);
    };
    
    console.log('filteredDatos:', filteredDatos);

    
    

    const getParticipantsByEstado = () => {
        // Crear un diccionario que mapea estado_id con la descripción
        const estadoDict = estadoOptions.reduce((acc, estado) => {
            acc[estado.id] = estado.descripcion;
            return acc;
        }, {});
    
        // Agrupar los datos de participantes por estado_id
        const groupedData = filteredDatos.reduce((acc, dato) => {
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
    
    
   // Función para procesar y agrupar los datos de como_entero_superatec
   const getComoEnteroSuperatecChartData = () => {

    // Crear un diccionario que mapea como_entero_superatec_id con la descripción
    const superatecDict = SuperatecOptions.reduce((acc, superatec) => {
        acc[superatec.id] = superatec.descripcion;
        return acc;
    }, {});

    // Usar rawComoEnteroData, ya que contiene los datos de las personas
    const groupedData = filteredDatos.reduce((acc, dato) => {
        // Asegúrate de que el dato tenga el campo `como_entero_superatec_id`
        const superatecId = dato?.como_entero_superatec_id || 'Desconocido'; 
        const superatecName = superatecDict[superatecId] || 'Desconocido';

        if (!acc[superatecName]) {
            acc[superatecName] = { name: superatecName, count: 0 };
        }
        acc[superatecName].count += 1;
        return acc;
    }, {});

    console.log("Agrupación de superatec", groupedData);

    const total = Object.values(groupedData).reduce((sum, dato) => sum + dato.count, 0); // Total de personas

    // Convertir el total a porcentaje para cada categoría
    return Object.values(groupedData).map(item => ({
        name: item.name,
        value: parseFloat(((item.count / total) * 100).toFixed(2)), // Calcular el porcentaje
    }));
};

const getGroupPrioritarioChartData = () => {
    const grupoDict = grupoPrioritarioOptions.reduce((acc, grupo) => {
        acc[grupo.id] = grupo.descripcion;
        return acc;
    }, {});

    const groupedData = filteredDatos.reduce((acc, dato) => {
        const grupoId = dato?.grupo_prioritario_id || 'Desconocido';
        const grupoName = grupoDict[grupoId] || 'Desconocido';

        if (!acc[grupoName]) {
            acc[grupoName] = { name: grupoName, count: 0 };
        }
        acc[grupoName].count += 1;
        return acc;
    }, {});

    const total = Object.values(groupedData).reduce((sum, dato) => sum + dato.count, 0);

    return Object.values(groupedData).map(item => ({
        name: item.name,
        value: parseFloat(((item.count / total) * 100).toFixed(2)),
    }));
};

const getStatusSeleccionBarChartData = () => {
    const statusDict = StatusOptions.reduce((acc, status) => {
        acc[status.id] = status.descripcion;
        return acc;
    }, {});

    const groupedData = filteredDatos.reduce((acc, dato) => {
        const statusId = dato?.status_seleccion_id || 'Desconocido';
        const statusName = statusDict[statusId] || 'Desconocido';

        if (!acc[statusName]) {
            acc[statusName] = { name: statusName, count: 0 };
        }
        acc[statusName].count += 1;
        return acc;
    }, {});

    return Object.values(groupedData);
};
const getAgeRangeData = () => {
    const ageRanges = {
        '6-12': 0,
        '13-17': 0,
        '18-25': 0,
        '26-35': 0,
        'Más de 35': 0,
    };

    filteredDatos.forEach(dato => {
        const edad = dato.edad;

        if (edad >= 6 && edad <= 12) {
            ageRanges['6-12'] += 1;
        } else if (edad >= 13 && edad <= 17) {
            ageRanges['13-17'] += 1;
        } else if (edad >= 18 && edad <= 25) {
            ageRanges['18-25'] += 1;
        } else if (edad >= 26 && edad <= 35) {
            ageRanges['26-35'] += 1;
        } else if (edad > 35) {
            ageRanges['Más de 35'] += 1;
        }
    });

    return Object.entries(ageRanges).map(([name, count]) => ({ name, count }));
};






    const columns = ["Cédula", "Nombres", "Apellidos","Email","Tlf", "Acciones"];

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
                    variant="btn btn-info" // Cambia aquí, solo debes pasar 'outline-info'
                    onClick={() => navigate(`/datos/${dato.id}`)}
                    className="me-2"
                >
                    <i className="bi bi-eye"></i>
                </Button>
                <Button
                    variant="btn btn-info" // Cambia aquí, solo debes pasar 'outline-info'
                    onClick={() => navigate(`/datos/cursos/${dato.cedula_identidad}`)}
                    className="me-2"
                >
                    <i className="bi bi-book-fill"></i>
                </Button>

    
                    {userRole === 'admin' || userRole === 'superuser' ? (
                        <>
                            <Button
                                variant="btn btn-warning"
                                onClick={() => navigate(`/datos/${dato.id}/edit`)}
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
                <div className="stat-card" style={{ padding: '5px', margin: '0 10px', width: '22%', textAlign: 'center' }}>
                <h4 style={{ fontSize: '1.1rem', color:'gray' }} className='mt-3'>Distribución por Rango de Edad</h4>
                    {filteredDatos.length > 0 && (
                        <>
                            <div style={{width: '90%',  // Ajusta el ancho para reducir el espacio que ocupa
                                height: '15px', 
                                backgroundColor: '#f1f1f1', 
                                borderRadius: '5px', 
                                overflow: 'hidden', 
                                margin: '0 auto'}}>
                                {getAgeRangeData().map((item, index) => (
                                    <div
                                        key={item.name}
                                        style={{
                                            width: `${(item.count / filteredDatos.length) * 100}%`,
                                            backgroundColor: COLORS[index % COLORS.length], // Usa diferentes colores para cada rango
                                            height: '100%',
                                            display: 'inline-block',
                                        }}
                                    ></div>
                                ))}
                            </div>

                            {/* Leyenda debajo de la barra */}
                            <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-around' }}>
                                {getAgeRangeData().map((item, index) => (
                                    <div key={item.name} style={{ display: 'flex', alignItems: 'center' }}>
                                        <div
                                            style={{
                                                width: '15px',
                                                height: '15px',
                                                backgroundColor: COLORS[index % COLORS.length],
                                                marginRight: '5px',
                                            }}
                                        ></div>
                                        <span>{item.name}</span>
                                    </div>
                                ))}
                            </div>
                        </>
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
                                        placeholder="Buscar por Cedula"
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

                                <Button variant="btn custom" onClick={() => navigate('/formulario/create')} className="btn-custom">
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
                                {nivelInstruccionOptions.map(option => (
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

                            <Form.Select
                                name="status_seleccion_id"
                                value={filters.status_seleccion_id}
                                onChange={handleFilterChange}
                                className="me-2"
                            >
                                <option value="">Status</option>
                                {StatusOptions.map(option => (
                                    <option key={option.id} value={option.id}>{option.descripcion}</option>
                                ))}
                            </Form.Select>
                        </div>
                        
                            
                        {/* Tabla paginada */}
                        <PaginationTable
                        data={filteredDatos}  // Datos filtrados
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
                            <PieChart >
                                <Pie
                                margin={{  right: 30, left: -20 }}
                                    data={getComoEnteroSuperatecChartData()}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={100}
                                    fill="#82ca9d"
                                    label={({ value }) => `${value}%`}
                                >
                                    {getComoEnteroSuperatecChartData().map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                {/* <Legend/> */}
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    )}

                    </div>


                <div className="chart-box" style={{ marginRight: '10px', paddingTop: '0px', paddingBottom: '0px' }}>

                    <h4 style={{ fontSize: '1.2rem' }}>Nivel de Instrucción</h4>

                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={getNivelInstruccionData()} margin={{  right: 30, left: -20 }} >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="count" fill="#8884d8" name="Participantes" />
                        </BarChart>
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
                            <BarChart data={getParticipantsByEstado()} margin={{ top: 40, right: 30, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="count" name="Participantes">
                                    {getParticipantsByEstado().map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>

                <div className="chart-box " style={{flex: '1 1 31%', maxWidth: '31%', marginRight: '10px'}}>
                <h4 style={{ fontSize: '1.2rem' }}>Porcentaje por Grupo Prioritario</h4>
                    {grupoPrioritarioOptions.length > 0 && (
                        <ResponsiveContainer width='100%' height={300}>
                            <PieChart>
                                <Pie
                                    data={getGroupPrioritarioChartData()}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={120}
                                    fill="#82ca9d"
                                    label={({ value }) => `${value}%`}
                                >
                                    {getGroupPrioritarioChartData().map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                        

                </div>
                <div className="chart-box "style={{ flex: '1 1 31%', maxWidth: '31%', marginRight: '10px'}}>
                <h4 style={{ fontSize: '1.2rem' }}>Participantes por Status Selección</h4>
                    {StatusOptions.length > 0 && (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={getStatusSeleccionBarChartData()} margin={{ top: 40, right: 30, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="count" fill="#82ca9d" name="Participantes" />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>




             {/* Gráfica tercera fila*/}
             <div className="col-lg-12 d-flex justify-content-between" style={{ gap: '20px' }}>


              

                <div className="chart-box" style={{flex: '1 1 100%', maxWidth: '100%', marginRight: '10px'}}>
                    <div className="d-flex justify-content-between align-items-center" >
                        <h4 style={{ fontSize: '1.2rem' }}>Registro de Participantes</h4>
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

export default ShowDatos;
