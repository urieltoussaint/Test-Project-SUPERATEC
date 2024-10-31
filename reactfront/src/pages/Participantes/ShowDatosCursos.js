import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Table from 'react-bootstrap/Table';
import { useNavigate } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import moment from 'moment';
import { useLoading } from '../../components/LoadingContext';
import { ToastContainer,toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PaginationTable from '../../components/PaginationTable';
import { FaUserFriends, FaClock, FaBook,FaSync } from 'react-icons/fa';  // Importamos íconos de react-icons
import { Modal } from 'react-bootstrap';
import { ResponsiveContainer,Line, LineChart,BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,AreaChart,Area,Radar,RadarChart, PieChart, Cell, Pie, ComposedChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { useParams } from 'react-router-dom';
const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00C49F', '#FFBB28','#8884d8', '#82ca9d', '#ffc658', '#ff7300','rgba(48, 144, 99, 0.9)','rgb(72, 205, 143)','rgb(255, 74, 74)'];


const endpoint = 'http://localhost:8000/api';

const ShowDatosCursos = () => {

    const [inscripciones, setInscripciones] = useState([]);  // Cambiar a inscripciones
    const [filteredInscripciones, setFilteredInscripciones] = useState([]);  // Cambiar a inscripciones filtradas
    const [searchName, setSearchName] = useState('');
    const [error, setError] = useState(null);
    const { setLoading } = useLoading();
    const navigate = useNavigate();
    const { cedula_identidad } = useParams();  // Obtener cedula_identidad del URL
    const itemsPerPage = 7;
    const [currentPage, setCurrentPage] = useState(1);
    const [loadingData, setLoadingData] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [filteredDatos, setFilteredDatos] = useState([]);
    const [periodoOptions, setPeriodoOptions] = useState([]);
    const [areaOptions, setAreaOptions] = useState([]);
    const [unidadOptions, setunidadOptions] = useState([]);
    const [nivelOptions, setNivelOptions] = useState([]);
    const [tipoProgramaOptions, setTipoProgramaOptions] = useState([]);
    const [modalidadOptions, setModalidadOptions] = useState([]);
    const [cohortedOptions, setCohorteOptions] = useState([]);

    const userRole = localStorage.getItem('role'); // Puede ser 'admin', 'superuser', 'invitado', etc.



    const [filters, setFilters] = useState({
        periodo_id:'',
        nivel_id: '',
        area_id: '',
        modalidad_id: '',
        tipo_programa_id: '',
        unidad_id: '',
        status_pay:'',
        cohorte_id:''
    });
    
   
    

    useEffect(() => {
        setLoading(true);
        fetchFilterOptions();
        getAllDatosCursos().finally(() => {
          setLoading(false);
        });
      }, [cedula_identidad]);

    
    

      const getAllDatosCursos = async () => {
        try {
            let relationsArray = ['area', 'curso', 'nivel', 'modalidad', 'periodo','cohorte'];
            const relations = relationsArray.join(',');
    
            // Asegurarse de que cedula_identidad tiene valor
            if (!cedula_identidad) {
                console.error("El valor de cedula_identidad no está definido.");
                setError('La cédula no está disponible');
                return;
            }
    
            const token = localStorage.getItem('token');
            let allInscripciones = [];
            let currentPage = 1;
            let totalPages = 1;
    
            // Mientras haya más páginas, sigue obteniendo datos
            while (currentPage <= totalPages) {
                const response = await axios.get(`${endpoint}/datos/cursos/${cedula_identidad}?with=${relations}&page=${currentPage}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
    
                // Si la solicitud fue exitosa, agregamos los datos de inscripciones
                allInscripciones = [...allInscripciones, ...response.data.data];
                totalPages = response.data.last_page;
                currentPage++;
            }
    
            setInscripciones(allInscripciones);  // Guardar las inscripciones obtenidas
            setFilteredInscripciones(allInscripciones);  // Inicialmente mostrar todas las inscripciones
        } catch (error) {
            setError('Error fetching data');
            console.error('Error fetching data:', error);
        }
    };


    const fetchFilterOptions = async () => {
        try {
          const token = localStorage.getItem('token');
          
          // Suponiendo que el endpoint unificado sea `/filtros-cursos`
          const response = await axios.get(`${endpoint}/select-inc`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          // Desestructuramos los datos que vienen en la respuesta
          
            setCohorteOptions(response.data.cohorte);
            setAreaOptions(response.data.area);
            setunidadOptions(response.data.unidad);
            setNivelOptions(response.data.nivel);
            setTipoProgramaOptions(response.data.tipo_programa);
            setModalidadOptions(response.data.modalidad);
            setPeriodoOptions(response.data.periodo);
           
        } catch (error) {
          console.error('Error fetching filter options:', error);
        }
      };
    

    const loadData = async () => {
        setLoadingData(true); // Inicia el estado de carga
        try {
            await getAllDatosCursos(); // Espera a que getAllDatos haga la solicitud y actualice los datos
        } catch (error) {
            console.error('Error recargando los datos:', error); // Maneja el error si ocurre
        } finally {
            setLoadingData(false); // Detener el estado de carga cuando la solicitud haya terminado
        }
    };
// Agregar esta función para obtener el color del estado de pago
const getStatusPayColor = (status_pay) => {
    if (status_pay === '1') return 'red'; // No pagado
    if (status_pay === '2') return 'orange'; // En proceso
    if (status_pay === '3') return 'green'; // Pagado
    if (status_pay === '4') return 'blue'; // Culminado
    return 'gray'; // Desconocido
};
const getStatusCursoColor = (status_curso) => {
    if (status_curso === '1') return 'orange'; // No finalizado
    if (status_curso === '2') return 'green'; // Egresado/Certificado
    if (status_curso === '3') return 'red'; // Retirado
    return 'gray'; // Desconocido
};

// Función para renderizar el círculo de color
const renderStatusPayDot = (status_pay) => {
    const color = getStatusPayColor(status_pay);
    return (
        <div
            style={{
                height: '20px',
                width: '20px',
                borderRadius: '50%',
                backgroundColor: color,
                display: 'inline-block',
            }}
        ></div>
    );
};

const renderStatusCursoTriangle = (status_curso) => {
    const color = getStatusCursoColor(status_curso); // Usar la función correcta para el color
    return (
      <div
        style={{
          width: 10,
          height: 10,
          borderLeft: '6px solid transparent',    // Lado izquierdo del triángulo
          borderRight: '6px solid transparent',   // Lado derecho del triángulo
          borderBottom: `10px solid ${color}`,    // Base del triángulo, define el color
          display: 'inline-block',
          marginRight: '5px',
        }}
      ></div>
    );
  };

const applyFilters = (filters) => {
    let filtered = inscripciones;

    // Filtrar por periodo
    if (filters.periodo_id) {
        filtered = filtered.filter(inscripcion => inscripcion.periodo_id === parseInt(filters.periodo_id));
    }

    // Filtrar por nivel de instrucción
    if (filters.nivel_id) {
        filtered = filtered.filter(inscripcion => inscripcion.nivel_id === parseInt(filters.nivel_id));
    }

    // Filtrar por área
    if (filters.area_id) {
        filtered = filtered.filter(inscripcion => inscripcion.area_id === parseInt(filters.area_id));
    }

    // Filtrar por modalidad
    if (filters.modalidad_id) {
        filtered = filtered.filter(inscripcion => inscripcion.modalidad_id === parseInt(filters.modalidad_id));
    }

    // Filtrar por tipo de programa
    if (filters.tipo_programa_id) {
        filtered = filtered.filter(inscripcion => inscripcion.tipo_programa_id === parseInt(filters.tipo_programa_id));
    }

    // Filtrar por unidad
    if (filters.unidad_id) {
        filtered = filtered.filter(inscripcion => inscripcion.unidad_id === parseInt(filters.unidad_id));
    }
    // Filtrar por cohorte
    if (filters.cohorte_id) {
        filtered = filtered.filter(inscripcion => inscripcion.cohorte_id === parseInt(filters.cohorte_id));
    }

    // Filtrar por status_pay
    if (filters.status_pay) {
        filtered = filtered.filter(inscripcion => inscripcion.status_pay === filters.status_pay);
    }
    // Filtrar por status_curso
    if (filters.status_curso) {
        filtered = filtered.filter(inscripcion => inscripcion.status_curso === filters.status_curso);
    }
    // Actualizar los datos filtrados
    setFilteredInscripciones(filtered);
    setCurrentPage(1);  // Reiniciar a la primera página después de aplicar los filtros
};


const handleFilterChange = (e) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    applyFilters(newFilters);  // Aplicar los filtros cada vez que cambie un valor
};



  // Calcular el total de cursos
const totalCursos = filteredInscripciones.length;

// Calcular las horas cursando (status_pay = 3) y horas realizadas (status_pay = 4)
const horasCursando = filteredInscripciones
    .filter(inscripcion => inscripcion.status_curso === '1')
    .reduce((acc, curr) => acc + (curr.curso?.cantidad_horas || 0), 0);

const horasRealizadas = filteredInscripciones
    .filter(inscripcion => inscripcion.status_curso === '2')
    .reduce((acc, curr) => acc + (curr.curso?.cantidad_horas || 0), 0);

// Calcular el total de cursos no empezados (status_pay = 1), cursando (status_pay = 3) y terminados (status_pay = 4)
   
    const totalCursando = filteredInscripciones.filter(inscripcion => inscripcion.status_curso === '1').length;
    const totalTerminados = filteredInscripciones.filter(inscripcion => inscripcion.status_curso === '2').length;
    const totalRetirados = filteredInscripciones.filter(inscripcion => inscripcion.status_curso === '3').length;

    // Datos para el gráfico de dona según status_pay
   // Datos para el gráfico de dona según status_pay (actualizado con nuevos estados)
const dataPie = [
    { name: 'No Pagado', value: filteredInscripciones.filter(inscripcion => inscripcion.status_pay === '1').length, color: 'rgba(255, 74, 74, 0.9)' },  
    { name: 'Pago en Proceso', value: filteredInscripciones.filter(inscripcion => inscripcion.status_pay === '2').length, color: '#ffc658' }, 
    { name: 'Pagado', value: filteredInscripciones.filter(inscripcion => inscripcion.status_pay === '3').length, color: 'rgb(72, 205, 143)' },  
    { name: 'Patrocinado', value: filteredInscripciones.filter(inscripcion => inscripcion.status_pay === '4').length, color: 'rgb(61, 128, 200)' },
    { name: 'Exonerado', value: filteredInscripciones.filter(inscripcion => inscripcion.status_pay === '5').length, color: '#fc53c4' } // Rosa claro para Exonerado
];

const dataPieCursos = [
    { name: 'No Finalizado', value: filteredInscripciones.filter(inscripcion => inscripcion.status_curso === '1').length, color: '#ffc658' },  
    { name: 'Egresado/Certificado', value: filteredInscripciones.filter(inscripcion => inscripcion.status_curso === '2').length, color: 'rgb(72, 205, 143)' }, 
    { name: 'Retirado', value: filteredInscripciones.filter(inscripcion => inscripcion.status_curso === '3').length, color: 'red' },  
   
];


// Datos para el gráfico de barras según modalidad
const dataBar = modalidadOptions.map(modalidad => ({
    name: modalidad.descripcion,
    value: filteredInscripciones.filter(inscripcion => inscripcion.modalidad_id === modalidad.id).length
}));

// Datos para el gráfico de radar según nivel
const dataRadar = nivelOptions.map(nivel => ({
    subject: nivel.descripcion,
    value: filteredInscripciones.filter(inscripcion => inscripcion.nivel_id === nivel.id).length
}));

// Datos para el gráfico de ComposedChart por periodo
const dataCohorte = cohortedOptions.map(cohorte => ({
    name: cohorte.descripcion,
    cantidad: filteredInscripciones.filter(inscripcion => inscripcion.cohorte_id === cohorte.id).length,
}));


const dataBarTipoPrograma = tipoProgramaOptions.map(option => ({
    name: option.descripcion,
    value: filteredInscripciones.filter(inscripcion => inscripcion.tipo_programa_id === option.id).length,
}));

const dataPieUnidad = unidadOptions.map(option => ({
    name: option.descripcion,
    value: filteredInscripciones.filter(inscripcion => inscripcion.unidad_id === option.id).length,
}));







        


    const columns = [ "cod", "Nombre del Curso","Area","Horas","Estado de Pago","Estado de Curso","Acciones"];

    const renderItem = (informacion_inscripcion) => (
        <tr key={informacion_inscripcion.id}>
        <td >{informacion_inscripcion?.curso.cod}</td>
        <td >{informacion_inscripcion?.curso.descripcion}</td>
        <td >{informacion_inscripcion?.area?.descripcion}</td>
        <td >{informacion_inscripcion?.curso?.cantidad_horas}</td>
        <td className="text-center">{renderStatusPayDot(informacion_inscripcion.status_pay)}</td> 
        <td className="text-center">{renderStatusCursoTriangle(informacion_inscripcion.status_curso)}</td> 
        <td >
        <div className="d-flex justify-content-around">
                        
                        <Button
                                variant="btn btn-info"
                                onClick={() => navigate(`/inscritos/show/${informacion_inscripcion.id}`)}
                                className="me-2 icon-white"
                            >
                                <i className="bi bi-eye"></i>
                            </Button>

                            <Button variant="btn btn-info" onClick={() => navigate(`/pagos/curso/${informacion_inscripcion.id}`)} className="me-1">
                            <i className="bi bi-currency-exchange"></i>
                            </Button>
                            {/* Botón para editar si el rol es 'admin' */}
                            {(userRole === 'admin' || userRole === 'superuser') && (
                            <Button variant="btn btn-warning" onClick={() => navigate(`/inscritos/edit/${informacion_inscripcion.id}/${informacion_inscripcion.cedula_identidad}`)} className="me-1">
                                <i className="bi bi-pencil-fill"></i>
                            </Button>
                            )}
                    


                                
                    
            </div>
        </td>
    </tr>
    );

    return (

        
        
        <div className="container-fluid " style={{ fontSize: '0.85rem' }}>
            <div className="col-lg-11 mx-auto"> {/* Agregamos 'mx-auto' para centrar */}
            <div className="stat-box d-flex justify-content-between" style={{ maxWidth: '100%' }}>
                {/* Total de Cursos */}
                <div className="stat-card" style={{ padding: '5px', margin: '0 10px', width: '22%' }}>
                    <div className="stat-icon"><FaBook /></div>
                    <div className="stat-number" style={{ color: '#58c765', fontSize: '1.8rem' }}>{totalCursos}</div>
                    <h4 style={{ fontSize: '1.1rem', color: 'gray' }}>Total de Cursos</h4>
                </div>

                {/* Horas Cursando y Horas Realizadas */}
                <div className="stat-card" style={{
                    padding: '8px',
                    margin: '0 10px',
                    width: '22%',
                    position: 'relative',
                    backgroundColor: '#fff',
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                }}>
                    <h4 style={{ fontSize: '1rem', color: 'gray', textAlign: 'center' }}>Horas Cursando y Realizadas</h4>
                    <div className="stat-number" style={{
                        color: '#ffda1f',
                        fontSize: '1.5rem',
                        fontWeight: 'bold',
                        textAlign: 'center'
                    }}>
                        {horasCursando} / {horasRealizadas}
                    </div>
                    <div style={{ fontSize: '0.85rem', textAlign: 'center', color: '#6c757d' }}>Cursando / Realizadas</div>
                </div>

                {/* Cursos No Empezados, Cursando, y Terminados */}
                <div className="stat-card" style={{
                    padding: '8px',
                    margin: '0 10px',
                    width: '22%',
                    position: 'relative',
                    backgroundColor: '#fff',
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                }}>
                    <h4 style={{ fontSize: '1rem', color: 'gray', textAlign: 'center' }}>Status de Cursos</h4>
                    <div className="stat-number" style={{
                        fontSize: '1.2rem',
                        fontWeight: 'bold',
                        textAlign: 'center',
                        color: '#6c757d'
                    }}>
                        <span style={{ color: '#ffda1f' }}>{totalCursando}</span> / <span style={{ color: 'rgb(72, 205, 143)' }}>{totalTerminados}</span> / <span style={{ color: 'rgb(255, 74, 74)' }}>{totalRetirados}</span>
                    </div>
                    <div style={{ fontSize: '0.85rem', textAlign: 'center', color: '#6c757d' }}>No Finalizado / Egresado / Retirado</div>
                </div>
            </div>
            </div>



        <div className="row" style={{ marginTop: '10px' }}>
                {/* Columna para la tabla */}
                <div className="col-lg-11 mx-auto"> {/* Agregamos 'mx-auto' para centrar */}
                    <div className="card-box" style={{ padding: '20px', width: '100%', margin: '0 auto' }}> 
                    <div className="d-flex justify-content-between align-items-center mb-3" style={{ gap: '0px' }}>
                        <h1 style={{ marginRight: '10px' }}>Lista de Cursos de V-{cedula_identidad}</h1>

                        <div className="d-flex" style={{ gap: '5px' }}> 
                            <Button
                            variant="info"
                            onClick={loadData}
                            disabled={loadingData} // Deshabilita el botón si está cargando
                            style={{ padding: '8px 16px', width: '90px' }} // Ajustamos el padding para aumentar el grosor
                            >
                            {/* Icono de recarga */}
                            {loadingData ? (
                                <FaSync className="spin" /> // Ícono girando si está cargando
                            ) : (
                                <FaSync />
                            )}
                            </Button>
                            <Button variant="secondary" onClick={() => navigate(-1)} className="secondary" style={{ fontSize: '0.9rem' }}>
                                <i className="bi bi-arrow-90deg-left"></i>
                            </Button>
                            
                            
                        </div>
                    </div>

                    <div className="d-flex mb-3 ">
                    <Form.Select
                        name="status_pay"
                        value={filters.status_pay}
                        onChange={handleFilterChange}
                        className="me-2"
                    >
                        <option value="">Filtrar por Estado de Pago</option>
                        <option value="1">No Pagado</option>
                        <option value="2">Pago en Proceso</option>
                        <option value="3">Cursando</option>
                        <option value="4">Culminado</option>
                    </Form.Select>
                    <Form.Select
                        name="status_curso"
                        value={filters.status_curso}
                        onChange={handleFilterChange}
                        className="me-2"
                    >
                        <option value="">Filtrar por Estado de Curso</option>
                        <option value="1">No Finalizado</option>
                        <option value="2">Egresado/Certificado</option>
                        <option value="3">Retirado</option>
                    </Form.Select>
                    </div>
                    <div className="d-flex mb-3 ">
                    <Form.Select
                            name="cohorte_id"
                            value={filters.cohorte_id}
                            onChange={handleFilterChange}
                            className="me-2"
                        >
                            <option value="">Filtrar por Cohorte</option>
                            {cohortedOptions.map(option => (
                                <option key={option.id} value={option.id}>{option.descripcion}</option>
                            ))}
                        </Form.Select>

                        <Form.Select
                            name="periodo_id"
                            value={filters.periodo_id}
                            onChange={handleFilterChange}
                            className="me-2"
                        >
                            <option value="">Filtrar por Periodo</option>
                            {periodoOptions.map(option => (
                                <option key={option.id} value={option.id}>{option.descripcion}</option>
                            ))}
                        </Form.Select>

                        <Form.Select
                            name="nivel_id"
                            value={filters.nivel_id}
                            onChange={handleFilterChange}
                            className="me-2"
                        >
                            <option value="">Filtrar por Nivel</option>
                            {nivelOptions.map(option => (
                                <option key={option.id} value={option.id}>{option.descripcion}</option>
                            ))}
                        </Form.Select>

                        <Form.Select
                            name="area_id"
                            value={filters.area_id}
                            onChange={handleFilterChange}
                            className="me-2"
                        >
                            <option value="">Filtrar por Área</option>
                            {areaOptions.map(option => (
                                <option key={option.id} value={option.id}>{option.descripcion}</option>
                            ))}
                        </Form.Select>

                        <Form.Select
                            name="modalidad_id"
                            value={filters.modalidad_id}
                            onChange={handleFilterChange}
                            className="me-2"
                        >
                            <option value="">Filtrar por Modalidad</option>
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
                            <option value="">Filtrar por Tipo de Programa</option>
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
                            <option value="">Filtrar por Unidad</option>
                            {unidadOptions.map(option => (
                                <option key={option.id} value={option.id}>{option.descripcion}</option>
                            ))}
                        </Form.Select>



                    </div>
                    {/* Leyenda de colores */}
                        {/* Leyenda de colores actualizada para status_pay */}
                    <div className="status-legend d-flex justify-content-start mb-3">
                        <span className="status-dot red"></span> No Pagado (Rojo)
                        <span className="status-dot orange ms-3"></span> Pago en Proceso (Naranja)
                        <span className="status-dot green ms-3"></span> Pagado (Verde)
                        <span className="status-dot blue ms-3"></span> Patrocinado (Azul)
                        <span className="status-dot pink ms-3"></span> Exonerado (Rosado)
                    </div>
                    <div className="status-legend d-flex justify-content-start mb-3">
                        <span className="status-triangle not-finalized"></span> No Finalizado (Naranja)
                        <span className="status-triangle graduated ms-3"></span> Egresado/Certificado (Verde)
                        <span className="status-triangle withdrawn ms-3"></span> Retirado (Rojo)
                    </div>



                    <PaginationTable
                        data={filteredInscripciones}  // Pasamos los datos calculados con o sin filtros
                        itemsPerPage={itemsPerPage}
                        columns={columns}
                        renderItem={renderItem}
                        currentPage={currentPage}  // Página actual
                        onPageChange={setCurrentPage}  // Función para cambiar de página
                    />


            <ToastContainer />
        </div>

        
        <div className="col-lg-12 d-flex justify-content-between flex-wrap" style={{ gap: '20px', marginTop: '10px' }}>
            <div className="chart-box" style={{ flex: '1 1 31%', maxWidth: '31%', marginRight: '10px' }}>
            <h4 style={{ fontSize: '1.2rem' }}>Distribución de Cursos por Estado de Pagos</h4>
                <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={dataPie}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={70}  // Hacer la forma de dona
                        outerRadius={100}
                        fill="#8884d8"
                        label
                    >
                        {dataPie.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} /> 
                        ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                </PieChart>
                </ResponsiveContainer>

            </div>

            <div className="chart-box" style={{ flex: '1 1 31%', maxWidth: '31%', marginRight: '10px' }}>
            <h4 style={{ fontSize: '1.2rem' }}>Distribución de Cursos por Modalidad</h4>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={dataBar}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" fill="#8884d8">
                            {dataBar.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
            
            <div className="chart-box" style={{ flex: '1 1 31%', maxWidth: '31%', marginRight: '10px' }}>
            <h4 style={{ fontSize: '1.2rem' }}>Distribución de Cursos por Estado de Cursos</h4>
                <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={dataPieCursos}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={70}  // Hacer la forma de dona
                        outerRadius={100}
                        fill="#8884d8"
                        label
                    >
                        {dataPieCursos.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} /> 
                        ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
        <div className="col-lg-12 d-flex justify-content-between flex-wrap" style={{ gap: '20px', marginTop: '10px' }}>
            <div className="chart-box" style={{ flex: '1 1 31%', maxWidth: '31%', marginRight: '10px' }}>
            <h4 style={{ fontSize: '1.2rem' }}>Distribución de Cursos por Tipo de Programa</h4>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={dataBarTipoPrograma}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" name="Cursos" barSize={50}>
                            {dataBarTipoPrograma.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill="#FFA500" /> 
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>


            </div>
            <div className="chart-box" style={{ flex: '1 1 31%', maxWidth: '31%', marginRight: '10px' }}>
            <h4 style={{ fontSize: '1.2rem' }}>Distribución de Cursos por Unidad</h4>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={dataPieUnidad}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={70}  // Hacer la forma de dona
                            outerRadius={100}
                            fill="#82ca9d"  // Puedes cambiar este color si lo deseas
                            label
                        >
                            {dataPieUnidad.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>



            </div>
            <div className="chart-box" style={{ flex: '1 1 31%', maxWidth: '31%', marginRight: '10px' }}>
            <h4 style={{ fontSize: '1.2rem' }}>Distribución de Cursos por Nivel</h4>
                <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={dataRadar}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="subject" />
                        <PolarRadiusAxis angle={30} domain={[0, Math.max(...dataRadar.map(d => d.value))]} />
                        <Radar name="Cursos" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                        <Legend />
                    </RadarChart>
                </ResponsiveContainer>
            </div>

        </div>
        <div className="col-lg-12 d-flex justify-content-between flex-wrap" style={{ gap: '20px', marginTop: '10px' }}>
            <div className="chart-box" style={{ flex: '1 1 100%', maxWidth: '100%', marginRight: '10px' }}>
            <h4 style={{ fontSize: '1.2rem' }}>Cursos por Cohorte</h4>
            <div className="d-flex justify-content-between align-items-center">
                    
                    <ResponsiveContainer width="100%" height={400}>
                        <ComposedChart data={dataCohorte}>
                            <CartesianGrid stroke="#f5f5f5" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="cantidad" barSize={30} fill="#413ea0" />
                            <Line type="monotone" dataKey="cantidad" stroke="#ff7300" />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>

            </div>

        </div>

        </div>
       
        </div>
        

        </div>
    );
};

export default ShowDatosCursos;
