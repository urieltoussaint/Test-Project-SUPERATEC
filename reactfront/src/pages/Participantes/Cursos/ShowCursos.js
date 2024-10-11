import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Table from 'react-bootstrap/Table';
import { useNavigate } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import { Modal,Card } from 'react-bootstrap';
import Form from 'react-bootstrap/Form';
import './ShowCursos.css';
import { useLoading } from '../../../components/LoadingContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PaginationTable from '../../../components/PaginationTable';
import { ResponsiveContainer,PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { FaUserFriends, FaClock, FaBook,FaSync } from 'react-icons/fa';  // Importamos íconos de react-icons
import ProgressBar from 'react-bootstrap/ProgressBar';  // Importa ProgressBar



const endpoint = 'http://localhost:8000/api';
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];


const ShowCursos = () => {
    const [cursos, setCursos] = useState([]);
    const [filteredCursos, setFilteredCursos] = useState([]);
    const [searchCurso, setSearchCurso] = useState('');
    const [searchCod, setSearchCod] = useState(''); // Nuevo estado para el buscador por COD
    const [areaOptions, setAreaOptions] = useState([]);
    const [selectedArea, setSelectedArea] = useState('');
    const [error, setError] = useState(null);
    const { setLoading } = useLoading();
    const navigate = useNavigate();
    const userRole = localStorage.getItem('role');
    const itemsPerPage = 8;
    const [showModal, setShowModal] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [totalCursos, setTotalCursos] = useState(0);
    const [totalParticipants, setTotalParticipants] = useState(0);
    const [totalHours, setTotalHours] = useState(0);
    const [inscripciones, setInscripciones] = useState(0);
    const [avgHours, setAvgHours] = useState(0);
    const [statusPayCounts, setStatusPayCounts] = useState({ 1: 0, 2: 0, 3: 0, 4: 0 });
    const [avgCost, setAvgCost] = useState(0);
    const [ingresosPorCurso, setIngresosPorCurso] = useState([]);
    const [loadingData, setLoadingData] = useState(false); // Estado para controlar la recarga
    const [currentPage, setCurrentPage] = useState(1);  // Estado para la página actual





      // useEffect que llama a todas las promesas
      useEffect(() => {
        setLoading(true);
      
        // Resetea el estado antes de cargar
        setCursos([]);
        setInscripciones([]);
      
        Promise.all([getAllCursos(), fetchAreaOptions(), getInscritos()])
          .then(([cursosData, areaOptionsData, { inscritosPorCurso, allInscripciones, statusPayCounts }]) => { 
            setCursos(cursosData);
            setFilteredCursos(cursosData); // Si es necesario filtrar
            setAreaOptions(areaOptionsData);
            setInscripciones(allInscripciones);
            setStatusPayCounts(statusPayCounts); 
      
            // Calcular total de cursos y promedio de costos
            const totalCursos = cursosData.length;
            const totalCost = cursosData.reduce((acc, curso) => acc + parseFloat(curso.costo), 0);
            const avgCost = totalCursos > 0 ? totalCost / totalCursos : 0;
      
            // Actualizar los estados con estos valores
            setTotalCursos(totalCursos); // Total de cursos
            setAvgCost(avgCost); // Promedio de costos por curso
      
            // Calcular las métricas usando todas las inscripciones
            calculateMetricsInscritos(inscritosPorCurso, cursosData, allInscripciones);
          })
          .catch((error) => {
            console.error('Error al obtener los datos:', error);
            setError('Error al obtener los datos');
          })
          .finally(() => {
            setLoading(false); // Desactivar pantalla de carga
          });
      }, []);
      
      
      

    // Este useEffect se ejecutará cuando `cursos` y `inscripciones` hayan sido actualizados
    useEffect(() => {
      if (cursos.length > 0 && inscripciones.length > 0) {
        console.log('Calculando métricas...');
        calculateMetrics(cursos, inscripciones); // Sigue calculando las métricas globales
      } else {
        console.log('No hay suficientes datos para calcular métricas');
      }
    }, [cursos, inscripciones]);

  

    
    // Ahora las funciones devuelven los datos y actualizamos el estado en el primer useEffect
    const getAllCursos = async () => {
      try {
        const token = localStorage.getItem('token');
        let allCursos = [];
        let currentPage = 1;
        let totalPages = 1;
    
        while (currentPage <= totalPages) {
          const response = await axios.get(`${endpoint}/cursos?with=area&page=${currentPage}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
    
          allCursos = [...allCursos, ...response.data.data];
          totalPages = response.data.last_page;
          currentPage++;
        }
    
        return allCursos;
      } catch (error) {
        console.error('Error fetching data:', error);
        return [];
      }
    };
    
    const getInscritos = async () => {
      try {
        const token = localStorage.getItem('token');
        let allInscripciones = [];
        let currentPage = 1;
        let totalPages = 1;
    
        while (currentPage <= totalPages) {
          const response = await axios.get(`${endpoint}/cursos_inscripcion?page=${currentPage}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
    
          allInscripciones = [...allInscripciones, ...response.data.data];
          totalPages = response.data.last_page;
          currentPage++;
        }
    
        // Agrupamos las inscripciones por curso_id
        const inscritosPorCurso = allInscripciones.reduce((acc, inscripcion) => {
          const cursoId = inscripcion.curso_id;
          if (!acc[cursoId]) acc[cursoId] = 0;
          acc[cursoId]++;
          return acc;
        }, {});
    
        const statusPayCounts = allInscripciones.reduce((acc, inscripcion) => {
          const statusPay = Number(inscripcion.status_pay); // Asegúrate de que sea numérico
          acc[statusPay] = (acc[statusPay] || 0) + 1;
          return acc;
        }, {});
    
        return { inscritosPorCurso, allInscripciones, statusPayCounts };
      } catch (error) {
        console.error('Error fetching inscripciones:', error);
        return { inscritosPorCurso: {}, allInscripciones: [], statusPayCounts: {} };
      }
    };
    
    

    
    const fetchAreaOptions = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${endpoint}/area`, { headers: { Authorization: `Bearer ${token}` } });
        return response.data.data;
      } catch (error) {
        console.error('Error fetching area options:', error);
        return [];
      }
    };
    
    // Calculo de Metricas
    const calculateMetrics = (cursosData, inscripcionesData) => {
      const totalCursos = cursosData.length;
      const totalHours = cursosData.reduce((acc, curso) => acc + curso.cantidad_horas, 0);
      const totalCost = cursosData.reduce((acc, curso) => acc + parseInt(curso.costo, 10), 0);

      console.log("horas totales: ",totalHours);
      console.log("costo totales: ",totalCost);
      console.log("Promedio de costos es: ",avgCost);
    
      animateValue(0, totalCursos, setTotalCursos);
      animateValue(0, totalHours, setAvgHours);
      
      animateValue(0, totalHours, setTotalHours);
    };
    

    const calculateMetricsInscritos = (inscritosPorCurso, cursosData, allInscripciones) => {
      // Verificar que los datos no sean indefinidos o vacíos
      if (!cursosData || !allInscripciones || cursosData.length === 0 || allInscripciones.length === 0) {
        console.error("Error: cursosData o allInscripciones están vacíos o indefinidos");
        return;
      }
    
      // Filtrar inscripciones y pagos según los cursos filtrados
      const filteredInscripciones = allInscripciones.filter(inscripcion =>
        cursosData.some(curso => Number(curso.id) === Number(inscripcion.curso_id)) // Asegurarse que los tipos coincidan
      );
    
      // Recalcular el estado de pagos
      const filteredStatusPayCounts = filteredInscripciones.reduce((acc, inscripcion) => {
        const statusPay = Number(inscripcion.status_pay); // Asegurarse que sea numérico
        acc[statusPay] = (acc[statusPay] || 0) + 1;
        return acc;
      }, {});
    
      // Filtrar inscritos según los cursos filtrados
      const filteredInscritosPorCurso = Object.fromEntries(
        Object.entries(inscritosPorCurso).filter(([cursoId]) =>
          cursosData.some(curso => Number(curso.id) === Number(cursoId)) // Asegurarse que los tipos coincidan
        )
      );
    
      // Animar el número de inscritos
      const totalParticipants = Object.values(filteredInscritosPorCurso).reduce((acc, count) => acc + count, 0);
      animateValue(0, totalParticipants, setTotalParticipants);
    
      // Calcular el total de horas solo para los cursos filtrados
      const totalHours = cursosData.reduce((acc, curso) => acc + curso.cantidad_horas, 0);
      setTotalHours(totalHours); 
    
      // Calcular ingresos totales por curso
      const ingresosPorCurso = cursosData.map(curso => {
        const inscritos = filteredInscritosPorCurso[curso.id] || 0;
        const ingresoTotal = inscritos * parseFloat(curso.costo);
        return { name: curso.descripcion, ingresos: ingresoTotal };
      });
    
      // Top cursos con mayor ingreso
      const topIngresos = ingresosPorCurso.sort((a, b) => b.ingresos - a.ingresos).slice(0, 10);
    
      // Actualizar el estado con los pagos filtrados
      setStatusPayCounts(filteredStatusPayCounts);
      setIngresosPorCurso(topIngresos);
    
      console.log("Total de participantes filtrados:", totalParticipants);
      console.log("Estado de pagos filtrado:", filteredStatusPayCounts);
    };
    
    

    
    
    


    const handleShowModal = (id) => {
        setSelectedId(id);  // Almacena el ID del participante que se va a eliminar
        setShowModal(true); // Muestra el modal
    };
    
    const handleCloseModal = () => {
        setShowModal(false); // Cierra el modal
    };

    
    const deleteCursos = async () => {
        const token = localStorage.getItem('token');
        try {
            await axios.delete(`${endpoint}/cursos/${selectedId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            toast.success('Curso eliminado con Éxito');
            getAllCursos();
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
        setSearchCurso(value);
        applyFilters(value, searchCod, selectedArea); // Pasa el valor de búsqueda de curso
    };

    const handleCodChange = (e) => {
        const value = e.target.value;
        setSearchCod(value);
        applyFilters(searchCurso, value, selectedArea); // Pasa el valor de búsqueda por COD
    };

    const handleAreaChange = (e) => {
        const value = e.target.value;
        setSelectedArea(value);
        applyFilters(searchCurso, searchCod, value);
    };

    const applyFilters = (searchValue, codValue, areaValue) => {
      let filtered = cursos; // Iniciar con todos los cursos
    
      // Filtrar por el valor de búsqueda en la descripción del curso
      if (searchValue) {
        filtered = filtered.filter(curso =>
          curso.descripcion.toLowerCase().includes(searchValue.toLowerCase())
        );
      }
    
      // Filtrar por el código del curso
      if (codValue) {
        filtered = filtered.filter(curso =>
          curso.cod.toLowerCase().includes(codValue.toLowerCase())
        );
      }
    
      // Filtrar por el área del curso
      if (areaValue) {
        filtered = filtered.filter(curso =>
          curso.area_id === parseInt(areaValue)
        );
      }
    
      // Actualizar la lista de cursos filtrados
      setFilteredCursos(filtered);
      setCurrentPage(1);
    
      // Obtener todas las inscripciones y filtrar según los cursos filtrados
      getInscritos().then(({ inscritosPorCurso, allInscripciones }) => {
        // Calcular las métricas usando los cursos filtrados y todas las inscripciones
        calculateMetricsInscritos(inscritosPorCurso, filtered, allInscripciones);
        // Recalcular las métricas para los cursos filtrados
    calculateMetrics(filtered, allInscripciones);


    // **Calcular el promedio de costo de los cursos filtrados**
    const totalCostFiltered = filtered.reduce((acc, curso) => acc + parseFloat(curso.costo), 0);
    const avgCostFiltered = filtered.length > 0 ? totalCostFiltered / filtered.length : 0;
    // Actualizar el estado del promedio de costos
    setAvgCost(avgCostFiltered);
    animateValue(avgCost, avgCostFiltered, setAvgCost, 2000); // Duración de 2 segundos para la animación

      });
    };
    
    
    
    

    if (error) {
        return <div>{error}</div>;
    }

    // Datos para las gráficas
    const coursesByArea = filteredCursos.reduce((acc, curso) => {
        const area = areaOptions.find(a => a.id === curso.area_id)?.descripcion || 'Unknown';
        acc[area] = (acc[area] || 0) + 1;
        return acc;
    }, {});

    const pieChartData = Object.entries(coursesByArea).map(([name, value]) => ({ name, value }));

    const barChartData = filteredCursos
      .sort((a, b) => b.cantidad_horas - a.cantidad_horas) // Ordenar por horas
      .slice(0, 5) // Tomar los 5 cursos con más horas
      .map(curso => ({
      name: curso.descripcion,
      hours: curso.cantidad_horas,
      cost: curso.costo,
  }));



    // Función para cargar datos
  const loadData = () => {
    setLoadingData(true); // Inicia el estado de carga
    Promise.all([getAllCursos(), getInscritos()])
      .then(([cursosData, { inscritosPorCurso, allInscripciones }]) => {
        setCursos(cursosData);
        setFilteredCursos(cursosData);
        // Puedes llamar nuevamente la función de métricas si es necesario
        calculateMetricsInscritos(inscritosPorCurso, cursosData, allInscripciones);
      })
      .catch((error) => {
        console.error("Error al obtener los datos:", error);
      })
      .finally(() => {
        setLoadingData(false); // Detener el estado de carga
      });
  };

    // Animating the numbers from 0 to the final value
    const animateValue = (start, end, setState, duration = 2000) => {
      let startTime = null;

      const animate = (currentTime) => {
          if (!startTime) startTime = currentTime;
          const progress = currentTime - startTime;
          const value = Math.min(Math.floor((progress / duration) * (end - start) + start), end);
          setState(value);

          if (progress < duration) {
              requestAnimationFrame(animate);
          }
      };

      requestAnimationFrame(animate);
  };

    const columns = ["COD", "Descripción", "Horas", "Fecha", "Costo","Cuotas", "Acciones"];

    const renderItem = (curso) => (
        
        <tr key={curso.cod}>
            <td className='col-cods'>{curso.cod}</td>
            <td className='col-descripcions'>{curso.descripcion}</td>
            <td className='col-horass'>{curso.cantidad_horas}</td>
            <td className='col-fechas'>{curso.fecha_inicio}</td>
            <td className='col-costos'>{curso.costo} $</td>
            <td className='col-cuotas'>{curso.cuotas} </td>
            <td>
            <div className="d-flex justify-content-center align-items-center">
                  
                  
                    <Button variant="btn btn-info" onClick={() => navigate(`/inscritos/${curso.id}`)} className="me-2">
                        <i className="bi bi-eye"></i>
                    </Button>
                    {userRole === 'admin' || userRole === 'superuser' ? (
                        <>
                            <Button variant="btn btn-warning" onClick={() => navigate(`/cursos/${curso.id}/edit`)} className="me-2">
                                <i className="bi bi-pencil-fill"></i>
                            </Button>
                            <Button variant="btn btn-success" onClick={() => navigate(`/inscribir/${curso.id}`)} className="me-2">
                                <i className="bi bi-person-plus-fill"></i>
                            </Button>
                        </>
                    ) : null}
                    {userRole === 'admin' && (
                        <Button variant="btn btn-danger" onClick={() => handleShowModal(curso.id)} className="me-2">
                            <i className="bi bi-trash3-fill"></i>
                        </Button>
                    )}
                </div>
            </td>
        </tr>
    );
    // console.log("horas totales2",totalHours);
   
    return (
      <div className="container-fluid mt-2" style={{ fontSize: '0.85rem' }}>
       <div className="stat-box d-flex justify-content-between" style={{ maxWidth: '100%' }}> {/* Limitar el ancho máximo */}
        <div className="stat-card" style={{ padding: '5px', margin: '0 10px', width: '22%' }}> {/* Reducir el ancho a 22% */}
          <div className="stat-icon"><FaBook /></div>
          <div className="stat-number" style={{ color: '#58c765', fontSize: '1.2rem' }}>{totalCursos}</div>
          <div className="stat-label">Total de Cursos</div>
        </div>
        <div className="stat-card" style={{ padding: '5px', margin: '0 10px', width: '22%' }}>
        <div className="stat-icon"><FaUserFriends /></div>
        <div className="stat-number" style={{ color: '#ffda1f', fontSize: '1.2rem' }}>{totalParticipants}</div> {/* Total de inscritos */}
        <div className="stat-label">Total de Inscritos</div>
      </div>

      <div className="stat-card" style={{ padding: '5px', margin: '0 10px', width: '22%' }}>
        <div className="stat-icon"><FaClock /></div>
        <div className="stat-number" style={{ color: '#ffda1f', fontSize: '1.2rem' }}>{totalHours}</div> {/* Total de horas */}
        <div className="stat-label">Total de Horas</div>
      </div>
        <div className="stat-card" style={{ padding: '5px', margin: '0 10px', width: '22%' }}> {/* Reducir el ancho a 22% */}
          <div className="stat-icon"><i className="bi bi-currency-dollar"></i></div> {/* Icono de moneda */}
          <div className="stat-number" style={{ color: '#58c765', fontSize: '1.2rem' }}>
            {avgCost.toFixed(2)} $ {/* Mostrar el valor con símbolo de moneda */}
          </div>
          <div className="stat-label">Promedio de Costo por Curso</div>
        </div>
      </div>


    
        <div className="row mt-2">
          {/* Columna para la tabla */}
          <div className="col-lg-9"> {/* Ajustado para más espacio a la tabla */}
            <div className="card-box" style={{ padding: '10px' }}> {/* Reduce padding de la tabla */}
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 style={{ fontSize: '1.8rem' }}>Lista de Cursos</h2>
                <div className="d-flex align-items-center">
                  <Form.Control
                    type="text"
                    placeholder="Buscar por nombre de curso"
                    value={searchCurso}
                    onChange={handleSearchChange}
                    className="me-2"
                    style={{ fontSize: '0.9rem' }}
                  />

                  <Button
                    variant="primary me-2"
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
                    <Button variant="btn custom" onClick={() => navigate('/cursos/create')} className="btn-custom" style={{ fontSize: '0.9rem' }}>
                      <i className="bi bi-book-half me-2"></i> Nuevo
                    </Button>
                  ) : null}
                </div>
              </div>
    
              {/* Filtros */}
              <div className="d-flex mb-3 custom-width">
                <Form.Control
                  type="text"
                  placeholder="Buscar por COD"
                  value={searchCod}
                  onChange={handleCodChange}
                  className="me-2"
                  style={{ fontSize: '0.9rem' }}
                />
                <Form.Select
                  value={selectedArea}
                  onChange={handleAreaChange}
                  className="me-2"
                  style={{ fontSize: '0.9rem' }}
                >
                  <option value="">Filtrar por Área</option>
                  {areaOptions.map(option => (
                    <option key={option.id} value={option.id}>{option.descripcion}</option>
                  ))}
                </Form.Select>
              </div>
    
              {/* Tabla paginada */}
              <PaginationTable
                data={filteredCursos}  // Datos filtrados
                itemsPerPage={itemsPerPage}
                columns={columns}
                renderItem={renderItem}
                currentPage={currentPage}  // Página actual
                onPageChange={setCurrentPage}  // Función para cambiar de página
                />
            </div>
          </div>
    
    
          <div className="col-lg-3" style={{ marginLeft: '-100px' }}> {/* Reduce espacio entre columnas */}
            <div className="chart-box">
              <h4 style={{ fontSize: '1.2rem' }}>Cursos por Área</h4>
              <ResponsiveContainer width="100%" height={280}>
              <PieChart >
                <Pie
                  data={pieChartData}
                  cx={120}
                  cy={120}
                  outerRadius={60}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => ` ${(percent * 100).toFixed(0)}%`}
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend/>
              </PieChart>
              
              </ResponsiveContainer>
            </div>
    
            <div className="chart-box mt-2"> {/* Reduce margen entre gráficas */}
              <h4 style={{ fontSize: '1.2rem' }}>Horas y Costo por Curso</h4>
              <ResponsiveContainer width="100%" height={250}>
              <BarChart  data={barChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="hours" fill="#8884d8" name="Horas" />
                <Bar yAxisId="right" dataKey="cost" fill="#82ca9d" name="Costo" />
              </BarChart>
              </ResponsiveContainer>
            </div>

          </div>
        </div>
              {/* Gráfica de Estado de Pagos justo debajo de la tabla */}
              <div className="col-lg-12 d-flex  mt-2 justify-content-between"> {/* Añadido justify-content-between para separar */} 
                <div className="chart-box" style={{ flex: '1 1 50%', maxWidth: '50%', marginRight: '10px' }}>
                  <h4 style={{ fontSize: '1.2rem', textAlign: 'flex' }}>Estado de Pagos</h4>
                  <ResponsiveContainer width="100%" height={300}>
                  <BarChart  data={[
                    { name: 'No Pagado', value: statusPayCounts[1], fill: '#FF0000' },
                    { name: 'Pago en Proceso', value: statusPayCounts[2], fill: '#FFA500' },
                    { name: 'Pagado, Cursando', value: statusPayCounts[3], fill: '#008000' },
                    { name: 'Curso Finalizado', value: statusPayCounts[4], fill: '#0000FF' },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" barSize={30} />
                  </BarChart>
                  </ResponsiveContainer>

                </div>
                <div className="chart-box" style={{ flex: '1 1 50%', maxWidth: '50%', marginRight: '10px' }}>
                  <h4 style={{ fontSize: '1.2rem' }}> Cursos con mayor Ingreso</h4>
                  <ResponsiveContainer width="100%" height={300}>
                  <BarChart  data={ingresosPorCurso}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="ingresos" fill="#82ca9d" name="Ingresos" />
                    </BarChart>
                  </ResponsiveContainer>

                </div>
              </div>


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
                    <Button variant="danger" onClick={deleteCursos}>
                        Eliminar
                    </Button>
                </Modal.Footer>
            </Modal>

            <ToastContainer />
      </div>

      


                
    );
    
      

      
};

export default ShowCursos;
