import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Table from 'react-bootstrap/Table';
import { useParams, useNavigate } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import './ShowVoluntariados.css'; // Asegúrate de tener este archivo CSS en tu proyecto
import { useLoading } from '../../../components/LoadingContext';   
import { toast, ToastContainer } from 'react-toastify';
import PaginationTable from '../../../components/PaginationTable';
import { Modal } from 'react-bootstrap';
import { FaLocationDot } from "react-icons/fa6";
import { FaPerson } from "react-icons/fa6";
import { FaSync } from 'react-icons/fa';  // Importamos íconos de react-icons
import { ResponsiveContainer,Line, LineChart,BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,AreaChart,Area,Radar,RadarChart, PieChart, Cell, Pie, ComposedChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';





const endpoint = 'http://localhost:8000/api';

const ShowVoluntariados = () => {
    const [voluntariados, setVoluntariados] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [filteredVoluntariados, setFilteredVoluntariados] = useState([]);
    const [searchCedula, setSearchCedula] = useState('');
    const [areaOptions, setAreaOptions] = useState([]);
    const [selectedArea, setSelectedArea] = useState('');
    const [nivelOptions, setNivelOptions] = useState([]);
    const [selectedNivel, setSelectedNivel] = useState('');
    const [generoOptions, setGeneroOptions] = useState([]);
    const [selectedGenero, setSelectedGenero] = useState('');
    const [centroOptions, setCentroOptions] = useState([]);
    const [selectedCentro, setSelectedCentro] = useState('');
    const [error, setError] = useState(null);
    const { id } = useParams();
    const { setLoading } = useLoading();
    const userRole = localStorage.getItem('role'); // Puede ser 'admin', 'superuser', 'invitado', etc.
    const [currentPage, setCurrentPage] = useState(1);  // Estado para la página actual
    const [loadingData, setLoadingData] = useState(false); // Estado para controlar la recarga
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#FF4567'];

    

    const itemsPerPage = 4;

    const navigate = useNavigate();

    const handleShowModal = (id) => {
        setSelectedId(id);  // Almacena el ID del participante que se va a eliminar
        setShowModal(true); // Muestra el modal
    };
    
    const handleCloseModal = () => {
        setShowModal(false); // Cierra el modal
    };   

    useEffect(() => {
        setLoading(true);
        Promise.all([getAllVoluntariados(), fetchFilterOptions()]).finally(() => {
            setLoading(false);
            
        });
    }, [id]);
    const [filters, setFilters] = useState({
        centro_id: '',
        area_voluntariado_id: '',
        nivel_instruccion_id: '',
        genero_id: '',
    });


    const getAllVoluntariados = async () => {
        try {
            const token = localStorage.getItem('token');
            let allVoluntariados = [];
            let currentPage = 1;
            let totalPages = 1;
    
            // Loop para obtener todas las páginas
            while (currentPage <= totalPages) {
                const response = await axios.get(`${endpoint}/voluntariados?with=informacionVoluntariados,nivelInstruccion,genero&page=${currentPage}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
    
                allVoluntariados = [...allVoluntariados, ...response.data.data];
                totalPages = response.data.last_page; // Total de páginas
                currentPage++;
            }
    
            setVoluntariados(allVoluntariados);
            setFilteredVoluntariados(allVoluntariados);
            console.log('Voluntariados obtenidos:', allVoluntariados);
        } catch (error) {
            setError('Error fetching data');
            console.error('Error fetching data:', error);
        }
    };

    const fetchFilterOptions = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${endpoint}/filter-voluntariados`, { headers: { Authorization: `Bearer ${token}` } });
            
            setAreaOptions(response.data.area);
            setNivelOptions(response.data.nivel);
            setGeneroOptions(response.data.genero);
            setCentroOptions(response.data.centro);

        } catch (error) {
            setError('Error fetching filter options');
            console.error('Error fetching filter options:', error);
        }
    };

    const deleteVoluntariados = async () => {
        
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`${endpoint}/voluntariados/${selectedId}`,{
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                toast.success('Voluntariado eliminado con Éxito');
                setTimeout(() => {
                    getAllVoluntariados();
                }, 500);
                handleCloseModal();
                
            } catch (error) {
                setError('Error deleting data');
                toast.error('Error al eliminar Voluntariado');
                console.error('Error deleting data:', error);
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
        let filtered = voluntariados;

        if (filters.searchCedula) {
            filtered = filtered.filter(voluntario =>
                voluntario.cedula_identidad.toLowerCase().includes(filters.searchCedula.toLowerCase())

            );
        }

        if (filters.area_voluntariado_id) {
            filtered = filtered.filter(voluntario =>
                // voluntario.informacion_voluntariados.area_voluntariado_id === parseInt(areaValue)
                voluntario.informacion_voluntariados.area_voluntariado_id === parseInt(filters.area_voluntariado_id)

            );
        }

        if (filters.nivel_instruccion_id) {
            filtered = filtered.filter(voluntario =>
                // voluntario.nivel_instruccion_id === parseInt(nivelValue)
                voluntario.nivel_instruccion_id === parseInt(filters.nivel_instruccion_id)

            );
        }

        if (filters.genero_id) {
            filtered = filtered.filter(voluntario =>
                // voluntario.genero_id === parseInt(generoValue)
                voluntario.genero_id === parseInt(filters.genero_id)

            );
        }
        if (filters.centro_id) {
            filtered = filtered.filter(voluntario =>
                // voluntario.informacion_voluntariados.centro_id === parseInt(centroValue)
                voluntario.informacion_voluntariados.centro_id === parseInt(filters.centro_id)

            );
        }

        setFilteredVoluntariados(filtered);
        setCurrentPage(1);
        
    };

    if (error) {
        return <div>{error}</div>;
    }

    const loadData = async () => {
        setLoadingData(true); // Inicia el estado de carga
        try {
            await getAllVoluntariados(); // Espera a que getAllDatos haga la solicitud y actualice los datos
        } catch (error) {
            console.error('Error recargando los datos:', error); // Maneja el error si ocurre
        } finally {
            setLoadingData(false); // Detener el estado de carga cuando la solicitud haya terminado
        }
    };


    const activeFilters = Object.values(filters).some(val => val); // Comprobar si hay filtros activos
    const dataToUse = activeFilters ? filteredVoluntariados : voluntariados; // Usar filteredDatos si hay filtros activos, de lo contrario usar datos

    // Total de participantes basado en filtros activos
    const totalVoluntariados = dataToUse.length;
    const totalMasculino = dataToUse.filter(d => d.genero_id === 1).length;
    const totalFemenino = dataToUse.filter(d => d.genero_id === 3).length;
    const totalOtros = dataToUse.filter(d => d.genero_id === 2).length;
    const porcentajeMasculino = totalMasculino > 0 ? (totalMasculino / dataToUse.length) * 100 : 0;
    const porcentajeFemenino = totalFemenino > 0 ? (totalFemenino / dataToUse.length) * 100 : 0;
    const porcentajeOtros = totalOtros > 0 ? (totalOtros / dataToUse.length) * 100 : 0;

    const getAreaVoluntariadoData = () => {
        // Crear un diccionario para agrupar por áreas
        const areaCounts = filteredVoluntariados.reduce((acc, voluntario) => {
            const areaId = voluntario.informacion_voluntariados.area_voluntariado_id;
            acc[areaId] = (acc[areaId] || 0) + 1;
            return acc;
        }, {});
    
        // Convertir los datos en un formato adecuado para la gráfica
        return Object.keys(areaCounts).map(areaId => ({
            name: areaOptions.find(option => option.id === parseInt(areaId))?.descripcion || "Desconocido",
            value: areaCounts[areaId]
        }));
    };

    const getNivelInstruccionData = () => {
        // Crear un diccionario para agrupar por nivel de instrucción
        const nivelCounts = filteredVoluntariados.reduce((acc, voluntario) => {
            const nivelId = voluntario.nivel_instruccion_id;
            acc[nivelId] = (acc[nivelId] || 0) + 1;
            return acc;
        }, {});
    
        // Convertir los datos en un formato adecuado para la gráfica
        return Object.keys(nivelCounts).map(nivelId => ({
            name: nivelOptions.find(option => option.id === parseInt(nivelId))?.descripcion || "Desconocido",
            value: nivelCounts[nivelId]
        }));
    };

    const getDataByCentro = () => {
        const groupedData = filteredVoluntariados.reduce((acc, voluntario) => {
            const centroId = voluntario.informacion_voluntariados?.centro_id || 'Desconocido';
            if (!acc[centroId]) {
                acc[centroId] = { name: centroOptions.find(c => c.id === centroId)?.descripcion || 'Desconocido', count: 0 };
            }
            acc[centroId].count += 1;
            return acc;
        }, {});
    
        return Object.values(groupedData);
    };
    
    
    

    const columns = [ "Cédula", "Nombres", "Apellidos","Acciones"];

    const renderItem = (dato) => (
        <tr key={dato.cedula_identidad}>
            <td className='col-cedula' >{dato.cedula_identidad}</td>
            <td className='col-nombre'>{dato.nombres}</td>
            <td className='col-apellido'>{dato.apellidos}</td>
            <td >
            <div className="d-flex justify-content-around">

                    <Button
                        variant="btn btn-info" 
                        onClick={() => navigate(`/Voluntariados/${dato.id}`)}
                        className="me-2"
                    >
                        <i className="bi bi-eye"></i>
                    </Button>
                    {userRole && (userRole === 'admin' || userRole === 'superuser') && (

                        <Button
                        variant="btn btn-warning"
                        onClick={() => navigate(`/voluntariados/${dato.id}/edit`)}
                        className="me-2"
                        >
                        <i className="bi bi-pencil-fill"></i>
                        </Button>
                    )}
                    {userRole === 'admin' && (
                   
                    <Button
                    variant="btn btn-danger"
                    onClick={() => handleShowModal(dato.id)}
                    className="me-2"
                    >
                    <i className="bi bi-trash3-fill"></i>
                    </Button>
                    )}
                </div>
            </td>
        </tr>
    );
    
    
    return (
        <div className="container-fluid mt-2" style={{ fontSize: '0.85rem' }}>
            <div className="col-lg-11 mx-auto d-flex justify-content-center"> 
            <div className="stat-box mx-auto col-lg-11" style={{ maxWidth: '100%' }}> 
            {/* Total de Voluntariados */}
            <div className="stat-card" style={{  }}>
                <div className="stat-icon"><FaPerson  /></div>
                <div className="stat-number" style={{ color: '#58c765', fontSize: '1.2rem' }}>{totalVoluntariados}</div>
                <div className="stat-label">Total de Voluntariados</div>
            </div>
                {/* por genero */}
                <div className="stat-card" style={{  }}>
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
                </div>
                </div> 

                <div className="row" style={{ marginTop: '10px' }}>
                <div className="col-lg-11 mx-auto"> {/* Agregamos 'mx-auto' para centrar */}
                    <div className="card-box" style={{ padding: '20px', width: '100%', margin: '0 auto' }}> 
                            <div className="d-flex justify-content-between align-items-center mb-3" style={{ gap: '0px' }}>
                        <h1>Lista de Voluntarios</h1>
                        <div className="d-flex align-items-center">
                            <Form.Control
                                type="text"
                                placeholder="Buscar por cédula"
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
                                    
                            <Button variant="btn custom" onClick={() => navigate('create')} className="btn-custom">
                            <i className="bi bi-person-plus-fill me-2  "></i> Nuevo
                            </Button>
                            ): null}
                        </div>
            </div>
            <div className="d-flex mb-3">
                <Form.Select
                    name="area_voluntariado_id"
                    value={filters.area_voluntariado_id}
                    onChange={handleFilterChange}
                    className="me-2"
                    style={{ width: '150px' }}
                >
                    <option value="">Área</option>
                    {areaOptions.map(option => (
                        <option key={option.id} value={option.id}>{option.descripcion}</option>
                    ))}
                </Form.Select>
                

                <Form.Select
                    name="nivel_instruccion_id"
                    value={filters.nivel_instruccion_id}
                    onChange={handleFilterChange}
                    className="me-2"
                    style={{ width: '150px' }}
                >
                    <option value="">Nivel de Instrucción</option>
                    {nivelOptions.map(option => (
                        <option key={option.id} value={option.id}>{option.descripcion}</option>
                    ))}
                </Form.Select>

                <Form.Select
                    name="genero_id"
                    value={filters.genero_id}
                    onChange={handleFilterChange}
                    className="me-2"
                    style={{ width: '150px' }}
                >
                    <option value="">Género</option>
                    {generoOptions.map(option => (
                        <option key={option.id} value={option.id}>{option.descripcion}</option>
                    ))}
                </Form.Select>
                <Form.Select
                    name="centro_id"
                    value={filters.centro_id}
                    onChange={handleFilterChange}
                    className="me-2"
                    style={{ width: '150px' }}
                >
                    <option value="">Centro</option>
                    {centroOptions.map(option => (
                        <option key={option.id} value={option.id}>{option.descripcion}</option>
                    ))}
                </Form.Select>
            </div>
            <div className="cards-container"></div>
            <PaginationTable
                data={filteredVoluntariados}  // Datos filtrados
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
                <Modal.Body>¿Estás seguro de que deseas eliminar este Voluntariado?</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>
                        Cancelar
                    </Button>
                    <Button variant="danger" onClick={deleteVoluntariados}>
                        Eliminar
                    </Button>
                </Modal.Footer>
            </Modal>
            <ToastContainer />
        </div>
        <div className="col-lg-12 d-flex justify-content-between" style={{ gap: '20px', marginTop:'10px' }}>
            <div className="chart-box" style={{ flex: '1 1 31%', maxWidth: '31%', marginRight: '10px'}}>
            <h4 style={{ fontSize: '1.2rem', textAlign: 'center' }}>Distribución por Área</h4>

                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={getAreaVoluntariadoData()}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            fill="#82ca9d"
                            label={({ name, value }) => `${name}: ${value}`}
                        >
                            {getAreaVoluntariadoData().map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
          
            </div>

            <div className="chart-box " style={{flex: '1 1 31%', maxWidth: '31%', marginRight: '10px'}}>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={getNivelInstruccionData()} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8884d8">
                        {getNivelInstruccionData().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>


            </div>
            <div className="chart-box "style={{ flex: '1 1 31%', maxWidth: '31%', marginRight: '10px'}}>
            <h4 style={{ fontSize: '1.2rem' }}>Distribución por Centro</h4>
            <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={getDataByCentro()} cx="50%" cy="50%" outerRadius="80%">
                    <PolarGrid />
                    <PolarAngleAxis dataKey="name" />
                    <PolarRadiusAxis angle={30} domain={[0, Math.max(...getDataByCentro().map(d => d.count))]} />
                    <Radar name="Centros" dataKey="count" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                    <Legend />
                    <Tooltip />
                </RadarChart>
            </ResponsiveContainer>

            </div>
            </div>
        </div>
        </div>
        </div>
    );
};

export default ShowVoluntariados;
