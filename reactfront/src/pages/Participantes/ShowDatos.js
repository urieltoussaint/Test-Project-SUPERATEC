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
    const [centroOptions, setCentroOptions] = useState([]);
    const [areaOptions, setAreaOptions] = useState([]);
    const [periodoOptions, setPeriodoOptions] = useState([]);
    const [estadoOptions, setEstadoOptions] = useState([]);
    const [modalidadOptions, setModalidadOptions] = useState([]);
    const [tipoProgramaOptions, setTipoProgramaOptions] = useState([]);
    const [unidadOptions, setUnidadOptions] = useState([]);
    const [cohorteOptions, setCohorteOptions] = useState([]);
    const [SuperatecOptions, setSuperatecOptions] = useState([]);
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
                const response = await axios.get(`${endpoint}/datos?with=statusSeleccion,informacionInscripcion,NivelInstruccion,genero,estado&page=${currentPage}`, {
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
    

    const fetchFilterOptions = async () => {
        try {
            const token = localStorage.getItem('token');
            const [nivelRes, generoRes, centroRes, areaRes, periodoRes, estadoRes, modalidadRes, tipoProgramaRes, unidadRes, cohorteRes,superatecRes] = await Promise.all([
                axios.get(`${endpoint}/nivel_instruccion`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${endpoint}/genero`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${endpoint}/centro`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${endpoint}/area`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${endpoint}/periodo`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${endpoint}/estado`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${endpoint}/modalidad`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${endpoint}/tipo_programa`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${endpoint}/unidad`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${endpoint}/cohorte`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${endpoint}/como_entero_superatec`, { headers: { Authorization: `Bearer ${token}` } }),
            ]);
            setNivelInstruccionOptions(nivelRes.data.data);
            setGeneroOptions(generoRes.data.data);
            setCentroOptions(centroRes.data.data);
            setAreaOptions(areaRes.data.data);
            setPeriodoOptions(periodoRes.data.data);
            setEstadoOptions(estadoRes.data.data);
            setModalidadOptions(modalidadRes.data.data);
            setTipoProgramaOptions(tipoProgramaRes.data.data);
            setUnidadOptions(unidadRes.data.data);
            setCohorteOptions(cohorteRes.data.data);
            setSuperatecOptions(superatecRes.data.data);

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

        if (filters.centro_id) {
            filtered = filtered.filter(dato =>
                dato.informacion_inscripcion?.centro_id === parseInt(filters.centro_id)
            );
        }

        if (filters.area_id) {
            filtered = filtered.filter(dato =>
                dato.informacion_inscripcion?.area_id === parseInt(filters.area_id)
            );
        }

        if (filters.periodo_id) {
            filtered = filtered.filter(dato =>
                dato.informacion_inscripcion?.periodo_id === parseInt(filters.periodo_id)
            );
        }
        if (filters.estado_id) {
            filtered = filtered.filter(dato =>
                dato.estado_id === parseInt(filters.estado_id)
            );
        }
        if (filters.modalidad_id) {
            filtered = filtered.filter(dato =>
                dato.informacion_inscripcion?.modalidad_id === parseInt(filters.modalidad_id)
            );
        }
        if (filters.tipo_programa_id) {
            filtered = filtered.filter(dato =>
                dato.informacion_inscripcion?.tipo_programa_id === parseInt(filters.tipo_programa_id)
            );
        }
        if (filters.unidad_id) {
            filtered = filtered.filter(dato =>
                dato.informacion_inscripcion?.unidad_id === parseInt(filters.unidad_id)
            );
        }
        if (filters.cohorte_id) {
            filtered = filtered.filter(dato =>
                dato.informacion_inscripcion?.cohorte_id === parseInt(filters.cohorte_id)
            );
        }

        if (filters.como_entero_superatec_id) {
            filtered = filtered.filter(dato =>
                dato.informacion_inscripcion?.como_entero_superatec_id === parseInt(filters.como_entero_superatec_id)
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


    // Porcentaje de Aporte y Patrocinado basado en filtros activos
    const totalAporte = dataToUse.filter(d => d.informacion_inscripcion.realiza_aporte).length;
    const totalPatrocinado = dataToUse.filter(d => d.informacion_inscripcion.es_patrocinado).length;

    const porcentajeAporte = totalAporte > 0 ? (totalAporte / dataToUse.length) * 100 : 0;
    const porcentajePatrocinado = totalPatrocinado > 0 ? (totalPatrocinado / dataToUse.length) * 100 : 0;

    const getFilteredDataByDate = () => {
        const today = moment();
        const filteredData = dataToUse.filter(dato => {
            const inscripcionDate = moment(dato.informacion_inscripcion.fecha_inscripcion);
            return inscripcionDate.isAfter(today.clone().subtract(range, 'days'));
        });
    
        // Agrupar por fecha
        const dateCounts = filteredData.reduce((acc, dato) => {
            const fecha = moment(dato.informacion_inscripcion.fecha_inscripcion).format('YYYY-MM-DD');
            acc[fecha] = (acc[fecha] || 0) + 1;
            return acc;
        }, {});
    
        return Object.keys(dateCounts).map(date => ({
            fecha: date,
            count: dateCounts[date]
        }));
    };

    const getNivelInstruccionData = () => {
        // Agrupar los datos filtrados por nivel de instrucción
        const groupedData = filteredDatos.reduce((acc, dato) => {
            const nivel = dato.nivel_instruccion?.descripcion || 'Desconocido';
            
            if (!acc[nivel]) {
                acc[nivel] = { name: nivel, count: 0 };
            }
            acc[nivel].count += 1;
    
            return acc;
        }, {});
    
        // Convertir el objeto en un array para usar en el gráfico
        return Object.values(groupedData);
    };
    
    
    const getAreaDataForChart = () => {
        const totalParticipantes = filteredDatos.length;
    
        // Crear un diccionario que mapea area_id con la descripción
        const areaDict = areaOptions.reduce((acc, area) => {
            acc[area.id] = area.descripcion;
            return acc;
        }, {});
    
        // Agrupar los datos de participantes por area_id y asociarlos con sus descripciones
        const groupedData = filteredDatos.reduce((acc, dato) => {
            const areaId = dato.informacion_inscripcion?.area_id || 'Desconocido';
            const areaName = areaDict[areaId] || 'Desconocido';  // Obtiene el nombre del área desde areaDict
    
            if (!acc[areaName]) {
                acc[areaName] = { name: areaName, count: 0 };
            }
            acc[areaName].count += 1;
            return acc;
        }, {});
    
        // Convertir los datos en un array y calcular el porcentaje
        return Object.values(groupedData).map(item => ({
            name: item.name,
            value: parseFloat(((item.count / totalParticipantes) * 100).toFixed(2)), // Convertir el porcentaje a número
        }));
    };


    const getInscritosPorPeriodo = () => {
        // Total de participantes filtrados
        const totalParticipantes = filteredDatos.length;
    
        // Crear un diccionario que mapea periodo_id con la descripción
        const periodoDict = periodoOptions.reduce((acc, periodo) => {
            acc[periodo.id] = periodo.descripcion;
            return acc;
        }, {});
    
        // Agrupar los datos de participantes por periodo_id y asociarlos con sus descripciones
        const groupedData = filteredDatos.reduce((acc, dato) => {
            const periodoId = dato.informacion_inscripcion?.periodo_id || 'Desconocido';
            const periodoName = periodoDict[periodoId] || 'Desconocido';  // Obtiene el nombre del periodo desde periodoDict
    
            if (!acc[periodoName]) {
                acc[periodoName] = { name: periodoName, count: 0 };
            }
            acc[periodoName].count += 1;  // Incrementa el contador para ese periodo
            return acc;
        }, {});
    
        console.log("Agrupados por periodo", groupedData);
    
        // Convertir los datos en un array
        return Object.values(groupedData).map(item => ({
            name: item.name,   // Nombre del periodo
            count: item.count  // Número total de inscritos en ese periodo
        }));
    };

    const getInscritosPorModalidad = () => {
        // Total de participantes filtrados
        const totalParticipantes = filteredDatos.length;
    
        // Crear un diccionario que mapea modalidad_id con la descripción
        const modalidadDict = modalidadOptions.reduce((acc, modalidad) => {
            acc[modalidad.id] = modalidad.descripcion;
            return acc;
        }, {});
    
        // Agrupar los datos de participantes por modalidad_id y asociarlos con sus descripciones
        const groupedData = filteredDatos.reduce((acc, dato) => {
            const modalidadId = dato.informacion_inscripcion?.modalidad_id || 'Desconocido';
            const modalidadName = modalidadDict[modalidadId] || 'Desconocido';  // Obtiene el nombre de la modalidad desde modalidadDict
    
            if (!acc[modalidadName]) {
                acc[modalidadName] = { name: modalidadName, count: 0 };
            }
            acc[modalidadName].count += 1;  // Incrementa el contador para esa modalidad
            return acc;
        }, {});
    
        console.log("Agrupados por modalidad", groupedData);
    
        // Convertir los datos en un array
        return Object.values(groupedData).map(item => ({
            name: item.name,   // Nombre de la modalidad
            count: item.count  // Número total de inscritos en esa modalidad
        }));
    };
    

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
    
    
    const getParticipantesPorTipoPrograma = () => {
        const totalParticipantes = filteredDatos.length;
    
        // Crear un diccionario que mapea tipo_programa_id con la descripción
        const tipoProgramaDict = tipoProgramaOptions.reduce((acc, tipo) => {
            acc[tipo.id] = tipo.descripcion;
            return acc;
        }, {});
    
        // Agrupar los datos de participantes por tipo_programa_id
        const groupedData = filteredDatos.reduce((acc, dato) => {
            const tipoProgramaId = dato.informacion_inscripcion?.tipo_programa_id || 'Desconocido';
            const tipoProgramaName = tipoProgramaDict[tipoProgramaId] || 'Desconocido';
    
            if (!acc[tipoProgramaName]) {
                acc[tipoProgramaName] = { name: tipoProgramaName, count: 0 };
            }
            acc[tipoProgramaName].count += 1;
            return acc;
        }, {});
    
        // Convertir los datos en un array
        return Object.values(groupedData).map(item => ({
            name: item.name,
            value: item.count, // Cantidad de participantes
        }));
    };

    const getUnidadDataForChart = () => {
        const totalParticipantes = filteredDatos.length;
    
        // Crear un diccionario que mapea unidad_id con la descripción
        const unidadDict = unidadOptions.reduce((acc, unidad) => {
            acc[unidad.id] = unidad.descripcion;
            return acc;
        }, {});
    
        // Agrupar los filteredDatos de participantes por unidad_id y asociarlos con sus descripciones
        const groupedData = filteredDatos.reduce((acc, dato) => {
            const unidadId = dato.informacion_inscripcion?.unidad_id || 'Desconocido';
            const unidadName = unidadDict[unidadId] || 'Desconocido';
    
            if (!acc[unidadName]) {
                acc[unidadName] = { name: unidadName, count: 0 };
            }
            acc[unidadName].count += 1;
            return acc;
        }, {});
    
        // Convertir los datos en un array y calcular el porcentaje
        return Object.values(groupedData).map(item => ({
            name: item.name,
            value: parseFloat(((item.count / totalParticipantes) * 100).toFixed(2)), // Convertir el porcentaje a número
        }));
    };
    
    const getCohorteDataForChart = () => {
        const totalParticipantes = filteredDatos.length;
        // Crear un diccionario que mapea cohorte_id con la descripción
        const cohorteDict = cohorteOptions.reduce((acc, cohorte) => {
            acc[cohorte.id] = cohorte.descripcion;
            return acc;
        }, {});
    
        // Agrupar los filteredDatos de participantes por cohorte_id y asociarlos con sus descripciones
        const groupedData = filteredDatos.reduce((acc, dato) => {
            const cohorteId = dato.informacion_inscripcion?.cohorte_id || 'Desconocido';
            const cohorteName = cohorteDict[cohorteId] || 'Desconocido';
    
            if (!acc[cohorteName]) {
                acc[cohorteName] = { name: cohorteName, count: 0 };
            }
            acc[cohorteName].count += 1;
            return acc;
        }, {});
        
    
        // Convertir los datos en un array
        return Object.values(groupedData).map(item => ({
            name: item.name,
            count: item.count, // Total de participantes en la cohorte
        }));
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
        const superatecId = dato?.informacion_inscripcion?.como_entero_superatec_id || 'Desconocido'; 
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



    
      



    const columns = ["Cédula", "Nombres", "Apellidos","Email","Tlf", "Acciones"];

    const renderItem = (dato) => (
        <tr key={dato.cedula_identidad}>
            <td className="col-cedulas">{dato.cedula_identidad}</td>
            <td className="col-nombress">{dato.nombres}</td>
            <td className="col-apellidoss">{dato.apellidos}</td>
            <td className="col">{dato.direccion_email}</td>
            <td className="col">{dato.telefono_celular}</td>
            <td className="col-accioness">
                <div className="d-flex justify-content-around">
                <Button
                    variant="btn btn-info" // Cambia aquí, solo debes pasar 'outline-info'
                    onClick={() => navigate(`/datos/${dato.cedula_identidad}`)}
                    className="me-2"
                >
                    <i className="bi bi-list-task"></i>
                </Button>

    
                    {userRole === 'admin' || userRole === 'superuser' ? (
                        <>
                            <Button
                                variant="btn btn-warning"
                                onClick={() => navigate(`/datos/${dato.cedula_identidad}/edit`)}
                                className="me-2 icon-white"
                            >
                                <i className="bi bi-pencil-fill"></i>
                            </Button>

                           
    
                            {userRole === 'admin' && (
                         

                                <Button
                                variant="btn btn-danger"
                                onClick={() => handleShowModal(dato.cedula_identidad)}
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
                            now={(promedioEdad / 100) * 100} 
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
                            labelLine={false}
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
                    {/* Barra Aporte */}
                    <div style={{ marginBottom: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}> {/* Reducimos el marginBottom */}
                        <span style={{ whiteSpace: 'nowrap', color: 'rgb(72, 205, 143)', marginBottom: '3px' }}> {/* Reducimos el marginBottom del texto */}
                            {`${porcentajeAporte.toFixed(2)}% Realiza Aporte`}
                        </span>
                        <ProgressBar 
                            now={porcentajeAporte} 
                            style={{ 
                                width: '60%', 
                                backgroundColor: 'rgba(72, 205, 143, 0.2)', // Color de fondo
                                height: '12px',  // Reducimos la altura de la barra
                                borderRadius: '10px'  // Ajustamos el borde
                            }} 
                            variant=""
                        >
                            <div 
                                style={{ 
                                    width: `${porcentajeAporte}%`, 
                                    backgroundColor: 'rgb(72, 205, 143)', // Color de la barra llenada
                                    height: '100%',  // Aseguramos que el div interior ocupe toda la barra
                                    borderRadius: '10px',
                                }} 
                            />
                        </ProgressBar>
                    </div>

                    {/* Barra Patrocinado */}
                    <div style={{ marginBottom: '5px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}> {/* Reducimos el marginBottom */}
                        <span style={{ whiteSpace: 'nowrap', color: 'rgb(61, 128, 200)', marginBottom: '3px' }}> {/* Reducimos el marginBottom del texto */}
                            {`${porcentajePatrocinado.toFixed(2)}% Es Patrocinado`}
                        </span>
                        <ProgressBar 
                            now={porcentajePatrocinado} 
                            style={{ 
                                width: '60%', 
                                backgroundColor: 'rgba(61, 128, 200, 0.2)', // Color de fondo
                                height: '12px',  // Reducimos la altura de la barra
                                borderRadius: '10px'  // Ajustamos el borde
                            }} 
                            variant=""
                        >
                            <div 
                                style={{ 
                                    width: `${porcentajePatrocinado}%`, 
                                    backgroundColor: 'rgb(61, 128, 200)', // Color de la barra llenada
                                    height: '100%',  // Aseguramos que el div interior ocupe toda la barra
                                    borderRadius: '10px',
                                }} 
                            />
                        </ProgressBar>
                    </div>
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
                        <div className="d-flex ">
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
                        </div>
                        <div className="d-flex mb-3"> 
                            <Form.Select
                                name="modalidad_id"
                                value={filters.modalidad_id}
                                onChange={handleFilterChange}
                                className="me-2"
                            >
                                <option value="">Modalidad</option>
                                {modalidadOptions.map(option => (
                                    <option key={option.id} value={option.id}>{option.descripcion}</option>
                                ))}
                            </Form.Select>
                            <Form.Select
                                name="tipo_programa_id"
                                value={filters.tipo_programa_id}
                                onChange={handleFilterChange}
                                className="me-2"
                            >
                                <option value="">Tipo de Programa</option>
                                {tipoProgramaOptions.map(option => (
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
            <div className="col-lg-12 d-flex justify-content-between flex-wrap" style={{ gap: '20px', marginTop: '10px' }}>
            <div className="chart-box" style={{ flex: '1 1 31%', maxWidth: '31%', marginRight: '10px' }}>
                <h4 style={{ fontSize: '1.2rem' }}>Cantidad de Inscritos por Periodo</h4>
                {periodoOptions.length > 0 && (
                    <ResponsiveContainer width="100%" height={400}>
                    <ComposedChart data={getInscritosPorPeriodo()} margin={{ top: 10, right: 30, left: -20, bottom: 0 }}>
                        <CartesianGrid stroke="#f5f5f5" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" barSize={50} fill="#413ea0" name="Total Inscritos" />
                        <Line type="monotone" dataKey="count" stroke="#ff7300" name="Evolución" />
                    </ComposedChart>
                    </ResponsiveContainer>
                )}
                </div>


                <div className="chart-box" style={{ flex: '1 1 31%', maxWidth: '31%', marginRight: '10px'  }}>
                    <h4 style={{ fontSize: '1.2rem' }}>Distribución por Área</h4>
                    {areaOptions.length > 0 && (
                    <ResponsiveContainer width="100%" height={400}>
                        <PieChart>
                        <Pie
                            data={getAreaDataForChart()}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={125}
                            fill="#8884d8"
                            label={({ value }) => `${value}%`}
                        >
                            {getAreaDataForChart().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                    )}
                </div>

                <div className="chart-box" style={{ flex: '1 1 31%', maxWidth: '31%', marginRight: '10px'}}>
                    <h4 style={{ fontSize: '1.2rem' }}>Cantidad de Participantes por Modalidad</h4>
                    {modalidadOptions.length > 0 && (
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={getInscritosPorModalidad()} margin={{ top: 10, right: 30, left: -20, bottom: 0 }}>
                        <CartesianGrid stroke="#f5f5f5" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" barSize={35} fill="#82ca9d" name="Total Participantes" />
                        </BarChart>
                    </ResponsiveContainer>
                    )}
                </div>
                </div>



              {/* Gráfica segunda fila*/}
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
                    <h4 style={{ fontSize: '1.2rem' }}>Cantidad de Participantes por Tipo de Programa</h4>

                        {SuperatecOptions.length > 0 && (
                        <ResponsiveContainer width="100%" height={400}>
                            <RadarChart
                                cx="50%"
                                cy="50%"
                                outerRadius="80%"
                                data={getParticipantesPorTipoPrograma()}
                            >
                                <PolarGrid />
                                <PolarAngleAxis dataKey="name" />
                                <PolarRadiusAxis />
                                <Radar
                                    name="Participantes"
                                    dataKey="value"
                                    stroke="#8884d8"
                                    fill="#8884d8"
                                    fillOpacity={0.6}
                                />
                                <Tooltip />
                            </RadarChart>
                        </ResponsiveContainer>
                    )}


                </div>
                <div className="chart-box "style={{ flex: '1 1 31%', maxWidth: '31%', marginRight: '10px'}}>
                    <h4 style={{ fontSize: '1.2rem' }}>Distribución por Unidad</h4>

                        {unidadOptions.length > 0 && (
                            <ResponsiveContainer width="100%" height={400}>
                                <PieChart>
                                    <Pie
                                        data={getUnidadDataForChart()}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={0}  // Hacer la dona más pequeña
                                        outerRadius={120}
                                        fill="#82ca9d"
                                        label={({value }) => `${value}%`}  // Mostrar el valor con el símbolo de %
                                    >
                                        {getUnidadDataForChart().map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Legend />
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                </div>



                


            </div>




             {/* Gráfica tercera fila*/}
             <div className="col-lg-12 d-flex justify-content-between" style={{ gap: '20px' }}>


                <div className="chart-box" style={{flex: '1 1 50%', maxWidth: '50%', marginRight: '10px'}}>

                    <h4 style={{ fontSize: '1.2rem' }}>Cantidad de Participantes por Cohorte</h4>

                        {cohorteOptions.length > 0 && (
                            <ResponsiveContainer width="100%" height={400}>
                                <AreaChart
                                    data={getCohorteDataForChart()}
                                    margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
                                >
                                    <CartesianGrid stroke="#f5f5f5" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Area
                                        type="monotone"
                                        dataKey="count"
                                        stroke="#8884d8"
                                        fillOpacity={0.3}
                                        fill="#8884d8"
                                        name="Total Participantes"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                </div>

                <div className="chart-box" style={{flex: '1 1 50%', maxWidth: '50%', marginRight: '10px'}}>
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
