import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Table from 'react-bootstrap/Table';
import { useNavigate } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import { Modal,Card } from 'react-bootstrap';
import Form from 'react-bootstrap/Form';
import './ShowCursos.css';
import { useLoading } from '../../components/LoadingContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PaginationTable from '../../components/PaginationTable';
import { ResponsiveContainer,PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,PolarRadiusAxis,PolarAngleAxis,Radar,RadarChart,PolarGrid } from 'recharts';
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
    const [statusCursoCounts, setStatusCursoCounts] = useState({ 1: 0, 2: 0, 3: 0 });

    const [avgCost, setAvgCost] = useState(0);
    const [ingresosPorCurso, setIngresosPorCurso] = useState([]);
    const [loadingData, setLoadingData] = useState(false); // Estado para controlar la recarga
    const [currentPage, setCurrentPage] = useState(1);  // Estado para la página actual
    const [unidadOptions, setUnidadOptions] = useState([]);
    const [selectedUnidad, setSelectedUnidad] = useState('');

    const [nivelOptions, setNivelOptions] = useState([]);
    const [selectedNivel, setSelectedNivel] = useState('');

    const [tipoProgramaOptions, setTipoProgramaOptions] = useState([]);
    const [selectedTipoPrograma, setSelectedTipoPrograma] = useState('');

    const [modalidadOptions, setModalidadOptions] = useState([]);
    
    const [selectedModalidad, setSelectedModalidad] = useState('');
    const [participantsByAportePatrocinado, setParticipantsByAportePatrocinado] = useState('');
    const [inscritosPorCurso, setInscritosPorCurso] = useState({});



    useEffect(() => {
      setLoading(true);
    
      // Resetea el estado antes de cargar
      setCursos([]);
      setInscripciones([]);
    
      // Unificamos la carga de los datos de filtros en una sola solicitud
      Promise.all([getAllCursos(), fetchFilterOptions(), getInscritos()])
        .then(([cursosData, filterOptionsData, { inscritosPorCurso, allInscripciones, statusPayCounts }]) => { 
          setCursos(cursosData);
          setFilteredCursos(cursosData); // Si es necesario filtrar
          
          // Desestructuramos las opciones de filtros desde el objeto retornado
          const { areaOptions, unidadOptions, nivelOptions, tipoProgramaOptions, modalidadOptions } = filterOptionsData;
    
          // Asignamos las opciones a los estados respectivos
          setAreaOptions(areaOptions);
          setUnidadOptions(unidadOptions);
          setNivelOptions(nivelOptions);
          setTipoProgramaOptions(tipoProgramaOptions);
          setModalidadOptions(modalidadOptions);
    
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
          const response = await axios.get(`${endpoint}/cursos?&page=${currentPage}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
    
          // Aquí es donde puedes validar que 'costo' esté presente y sea válido.
          const cleanedCursos = response.data.data.map(curso => ({
            ...curso,
            costo: curso.costo ? parseFloat(curso.costo) : 0 // Reemplazar null/undefined con 0
          }));
    
          allCursos = [...allCursos, ...cleanedCursos];
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
    
        setInscritosPorCurso(inscritosPorCurso); // Update state here
        setStatusPayCounts(statusPayCounts);
        return { inscritosPorCurso, allInscripciones, statusPayCounts };
      } catch (error) {
        console.error('Error fetching inscripciones:', error);
        return { inscritosPorCurso: {}, allInscripciones: [], statusPayCounts: {} };
      }
    };
    
    
    const fetchFilterOptions = async () => {
  try {
    const token = localStorage.getItem('token');
    
    // Suponiendo que el endpoint unificado sea `/filtros-cursos`
    const response = await axios.get(`${endpoint}/filtros-cursos`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    // Desestructuramos los datos que vienen en la respuesta
    const { area, unidad, nivel, tipo_programa, modalidad } = response.data;

    // Retornamos las opciones en un solo objeto
    return {
      areaOptions: area,
      unidadOptions: unidad,
      nivelOptions: nivel,
      tipoProgramaOptions: tipo_programa,
      modalidadOptions: modalidad,
    };
  } catch (error) {
    console.error('Error fetching filter options:', error);
    return {
      areaOptions: [],
      unidadOptions: [],
      nivelOptions: [],
      tipoProgramaOptions: [],
      modalidadOptions: [],
    };
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
      if (!cursosData || !allInscripciones || cursosData.length === 0 || allInscripciones.length === 0) {
          console.error("Error: cursosData o allInscripciones están vacíos o indefinidos");
          return;
      }
  
      const filteredInscripciones = allInscripciones.filter(inscripcion =>
          cursosData.some(curso => Number(curso.id) === Number(inscripcion.curso_id))
      );
  
      const filteredStatusPayCounts = filteredInscripciones.reduce((acc, inscripcion) => {
          const statusPay = Number(inscripcion.status_pay);
          acc[statusPay] = (acc[statusPay] || 0) + 1;
          return acc;
      }, {});
  
      const statusCursoCounts = filteredInscripciones.reduce((acc, inscripcion) => {
          const statusCurso = Number(inscripcion.status_curso);
          acc[statusCurso] = (acc[statusCurso] || 0) + 1;
          return acc;
      }, {});
  
      const filteredInscritosPorCurso = Object.fromEntries(
          Object.entries(inscritosPorCurso).filter(([cursoId]) =>
              cursosData.some(curso => Number(curso.id) === Number(cursoId))
          )
      );
  
      const totalParticipants = Object.values(filteredInscritosPorCurso).reduce((acc, count) => acc + count, 0);
      animateValue(0, totalParticipants, setTotalParticipants);
  
      const totalHours = cursosData.reduce((acc, curso) => acc + curso.cantidad_horas, 0);
      setTotalHours(totalHours);
  
      const ingresosPorCurso = cursosData.map(curso => {
          const inscritosPagados = allInscripciones.filter(inscripcion =>
              inscripcion.curso_id === curso.id && inscripcion.status_pay === '3'
          );
          const ingresoTotal = inscritosPagados.length * parseFloat(curso.costo);
          return { name: curso.descripcion, ingresos: ingresoTotal };
      });
  
      const topIngresos = ingresosPorCurso.sort((a, b) => b.ingresos - a.ingresos).slice(0, 10);
      setIngresosPorCurso(topIngresos);
  
      // Calculate total counts for "Realiza Aporte" and "Es Patrocinado" across all courses
      const totalAportes = filteredInscripciones.filter(inscripcion => inscripcion.realiza_aporte === true).length;
      const totalPatrocinados = filteredInscripciones.filter(inscripcion => inscripcion.es_patrocinado === true).length;
  
      // Update the state with the calculated totals for the pie chart
      setParticipantsByAportePatrocinado([
          { name: 'Realiza Aporte', value: totalAportes },
          { name: 'Es Patrocinado', value: totalPatrocinados }
      ]);
  
      // Set other relevant state data
      setStatusPayCounts(filteredStatusPayCounts);
      setStatusCursoCounts(statusCursoCounts);
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
    const handleUnidadChange = (e) => {
      const value = e.target.value;
      setSelectedUnidad(value);
      applyFilters(searchCurso, searchCod, selectedArea, value, selectedNivel, selectedTipoPrograma, selectedModalidad);
    };
    
    const handleNivelChange = (e) => {
      const value = e.target.value;
      setSelectedNivel(value);
      applyFilters(searchCurso, searchCod, selectedArea, selectedUnidad, value, selectedTipoPrograma, selectedModalidad);
    };
    
    const handleTipoProgramaChange = (e) => {
      const value = e.target.value;
      setSelectedTipoPrograma(value);
      applyFilters(searchCurso, searchCod, selectedArea, selectedUnidad, selectedNivel, value, selectedModalidad);
    };
    
    const handleModalidadChange = (e) => {
      const value = e.target.value;
      setSelectedModalidad(value);
      applyFilters(searchCurso, searchCod, selectedArea, selectedUnidad, selectedNivel, selectedTipoPrograma, value);
    };
    

    const applyFilters = (searchValue, codValue, areaValue, unidadValue, nivelValue, tipoProgramaValue, modalidadValue) => {
      let filtered = cursos;
  
      if (searchValue) {
          filtered = filtered.filter(curso =>
              curso.descripcion.toLowerCase().includes(searchValue.toLowerCase())
          );
          console.log("Filtered by search:", filtered);
      }
  
      if (codValue) {
          filtered = filtered.filter(curso =>
              curso.cod.toLowerCase().includes(codValue.toLowerCase())
          );
          console.log("Filtered by COD:", filtered);
      }
  
      if (areaValue) {
          filtered = filtered.filter(curso => curso.area_id === parseInt(areaValue));
          console.log("Filtered by Area:", filtered);
      }
  
      if (unidadValue) {
          filtered = filtered.filter(curso => curso.unidad_id === parseInt(unidadValue));
          console.log("Filtered by Unidad:", filtered);
      }
  
      if (nivelValue) {
          filtered = filtered.filter(curso => curso.nivel_id === parseInt(nivelValue));
          console.log("Filtered by Nivel:", filtered);
      }
  
      if (tipoProgramaValue) {
          filtered = filtered.filter(curso => curso.tipo_programa_id === parseInt(tipoProgramaValue));
          console.log("Filtered by TipoPrograma:", filtered);
      }
  
      if (modalidadValue) {
          filtered = filtered.filter(curso => curso.modalidad_id === parseInt(modalidadValue));
          console.log("Filtered by Modalidad:", filtered);
      }
  
      setFilteredCursos(filtered); // This will update filteredCursos state
      setCurrentPage(1);
  
      // Recalculate metrics after filtering
      calculateMetricsInscritos(inscritosPorCurso, filtered, inscripciones);
      calculateMetrics(filtered, inscripciones);
  
      // Update average cost based on filtered data
      const totalCostFiltered = filtered.reduce((acc, curso) => {
          const costo = curso.costo ? parseFloat(curso.costo) : 0;
          return acc + (!isNaN(costo) && costo >= 0 ? costo : 0);
      }, 0);
      const avgCostFiltered = filtered.length > 0 ? totalCostFiltered / filtered.length : 0;
      setAvgCost(isNaN(avgCostFiltered) ? 0 : avgCostFiltered);
      animateValue(avgCost, avgCostFiltered, setAvgCost, 2000);
  };
  
  
  
    const coursesByNivel = filteredCursos.reduce((acc, curso) => {
      const nivel = nivelOptions.find(n => n.id === curso.nivel_id)?.descripcion || 'Unknown';
      acc[nivel] = (acc[nivel] || 0) + 1;
      return acc;
    }, {});
    
    const barChartDataNivel = Object.entries(coursesByNivel).map(([name, value]) => ({ name, value }));
    

    const coursesByUnidad = filteredCursos.reduce((acc, curso) => {
      const unidad = unidadOptions.find(u => u.id === curso.unidad_id)?.descripcion || 'Unknown';
      acc[unidad] = (acc[unidad] || 0) + 1;
      return acc;
    }, {});
    
    // Convertir a un formato adecuado para la gráfica
    const pieChartDataUnidad = Object.entries(coursesByUnidad).map(([name, value]) => ({ name, value }));
    
    // Calcular cantidad de cursos por tipo de programa
    const coursesByTipoPrograma = filteredCursos.reduce((acc, curso) => {
      const tipoPrograma = tipoProgramaOptions.find(tp => tp.id === curso.tipo_programa_id)?.descripcion || 'Desconocido';
      acc[tipoPrograma] = (acc[tipoPrograma] || 0) + 1;
      return acc;
    }, {});

    // Convertir el objeto en un arreglo para el BarChart
    const barChartDataTipoPrograma = Object.entries(coursesByTipoPrograma).map(([name, count]) => ({
      name, count
    }));

    const radarChartDataModalidad = filteredCursos.reduce((acc, curso) => {
      const modalidad = modalidadOptions.find(m => m.id === curso.modalidad_id)?.descripcion || 'Desconocido';
      const index = acc.findIndex(item => item.name === modalidad);
      
      if (index !== -1) {
        acc[index].count += 1;
      } else {
        acc.push({ name: modalidad, count: 1 });
      }
      
      return acc;
    }, []);
    


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


    const columns = ["COD", "Descripción", "Horas", "Fecha", "Costo","Cuotas","N° Inscritos", "Acciones"];

    const renderItem = (curso) => (
        
        <tr key={curso.cod} >
            <td className='col-cods'>{curso.cod}</td>
            <td className='col-descripcions'>{curso.descripcion}</td>
            <td className='col-horass'>{curso.cantidad_horas}</td>
            <td className='col-fechas'>{curso.fecha_inicio}</td>
            <td className='col-costos'>{curso.costo} $</td>
            <td className='col-cuotas'>{curso.cuotas} </td>
            <td className='col-inscritos'>{inscritosPorCurso[curso.id] || 0}</td>
            <td>
            <div className="d-flex justify-content-center align-items-center">
                  
                    <Button variant="btn btn-info" onClick={() => navigate(`/cursos/${curso.id}`)} className="me-2">
                        <i className="bi bi-eye"></i>
                    </Button>
                    <Button variant="btn btn-info" onClick={() => navigate(`/inscritos/${curso.id}`)} className="me-2">
                        <i className="bi bi-person-lines-fill"></i>
                    </Button>
                    {userRole === 'admin' || userRole === 'superuser'  || userRole === 'pagos' ? (
                        <>
                            <Button variant="btn btn-warning" onClick={() => navigate(`/cursos/${curso.id}/edit`)} className="me-2">
                                <i className="bi bi-pencil-fill"></i>
                            </Button>

                            <Button variant="btn btn-warning" onClick={() => navigate(`/cursos/${curso.id}/pagos`)} className="me-2">
                                <i className="bi bi-coin"></i>
                            </Button>
                            
                           
                        </>
                    ) :null}
                      {userRole === 'admin'  || userRole === 'superuser' ? (
                        <>
                            <Button variant="btn btn-success" onClick={() => navigate(`/inscribir/${curso.id}`)} className="me-2">
                                <i className="bi bi-person-plus-fill"></i>
                            </Button>
                        </>
                    ) :null}
                    
                    {userRole === 'admin' && (
                        <Button variant="btn btn-danger" onClick={() => handleShowModal(curso.id)} className="me-2">
                            <i className="bi bi-trash3-fill"></i>
                        </Button>
                    )}
                </div>
            </td>
        </tr>
    );
   
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
                label={({ name, value }) => ` ${value} participantes`}
                labelLine={true}
              >
                <Cell key="RealizaAporte" fill="#8884d8" />
                <Cell key="EsPatrocinado" fill="#82ca9d" />
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
              <div className="d-flex ">
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

                <Form.Select
                  value={selectedUnidad}
                  onChange={handleUnidadChange}
                  className="me-2"
                  style={{ fontSize: '0.9rem' }}
                >
                  <option value="">Filtrar por Unidad</option>
                  {unidadOptions.map(option => (
                    <option key={option.id} value={option.id}>{option.descripcion}</option>
                  ))}
                </Form.Select>

                <Form.Select
                  value={selectedNivel}
                  onChange={handleNivelChange}
                  className="me-2"
                  style={{ fontSize: '0.9rem' }}
                >
                  <option value="">Filtrar por Nivel</option>
                  {nivelOptions.map(option => (
                    <option key={option.id} value={option.id}>{option.descripcion}</option>
                  ))}
                </Form.Select>

                <Form.Select
                  value={selectedTipoPrograma}
                  onChange={handleTipoProgramaChange}
                  className="me-2"
                  style={{ fontSize: '0.9rem' }}
                >
                  <option value="">Filtrar por Tipo de Programa</option>
                  {tipoProgramaOptions.map(option => (
                    <option key={option.id} value={option.id}>{option.descripcion}</option>
                  ))}
                </Form.Select>

                <Form.Select
                  value={selectedModalidad}
                  onChange={handleModalidadChange}
                  className="me-2"
                  style={{ fontSize: '0.9rem' }}
                >
                  <option value="">Filtrar por Modalidad</option>
                  {modalidadOptions.map(option => (
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
    
            <div className="chart-box mt-2">
            <h4 style={{ fontSize: '1.2rem' }}>Comparación de Cursos por Nivel</h4>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={barChartDataNivel}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#8884d8" name="Cantidad de Cursos" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          </div>
        </div>
         {/* Gráfica de Estado de Pagos justo debajo de la tabla */}
         <div className="col-lg-12 d-flex  mt-2 justify-content-between"> {/* Añadido justify-content-between para separar */} 
                <div className="chart-box" style={{ flex: '1 1 30%', maxWidth: '30%', marginRight: '10px' }}>
                <h4 style={{ fontSize: '1.2rem' }}>Porcentaje de Cursos por Unidad</h4>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={pieChartDataUnidad}
                        cx="50%"
                        cy="50%" // Posiciona el centro
                        innerRadius={60} // Agujero del centro
                        outerRadius={80} // Radio externo
                        fill="#8884d8"
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`} // Mostrar nombre y porcentaje
                      >
                        {pieChartDataUnidad.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>

                </div>
                <div className="chart-box" style={{ flex: '1 1 30%', maxWidth: '30%', marginRight: '10px' }}>
                  <h4 style={{ fontSize: '1.2rem' }}>Comparación de Cursos por Tipo de Programa</h4>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={barChartDataTipoPrograma} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis
                          type="category"
                          dataKey="name"
                          width={70} // Aumenta el ancho del eje Y
                          tick={{ fontSize: 11 }} // Ajusta el tamaño de la fuente
                        />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" fill="#FF8042" stroke="#FF5722" barSize={20} name="Cantidad de Cursos" />
                      </BarChart>
                    </ResponsiveContainer>

                </div>
                <div className="chart-box" style={{ flex: '1 1 30%', maxWidth: '30%', marginRight: '10px' }}>
                  <h4 style={{ fontSize: '1.2rem' }}>Comparación de Cursos por Modalidad</h4>
                      <ResponsiveContainer width="100%" height={300}>
                        <RadarChart data={radarChartDataModalidad}>
                          <PolarGrid />
                          <PolarAngleAxis dataKey="name" tick={{ fontSize: 12 }} />
                          <PolarRadiusAxis angle={30} domain={[0, 'auto']} />
                          <Radar
                            name="Cantidad de Cursos"
                            dataKey="count"
                            stroke="#FF8042"
                            fill="#FF8042"
                            fillOpacity={0.6}
                          />
                          <Tooltip />
                          <Legend />
                        </RadarChart>
                      </ResponsiveContainer>
                </div>
              </div>

              {/* Gráfica de Estado de Pagos justo debajo de la tabla */}
              <div className="col-lg-12 d-flex  mt-2 justify-content-between"> {/* Añadido justify-content-between para separar */} 
                <div className="chart-box" style={{ flex: '1 1 50%', maxWidth: '50%', marginRight: '10px' }}>
                  <h4 style={{ fontSize: '1.2rem', textAlign: 'flex' }}>Estado de Pagos</h4>
                  <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={[
                      { name: 'No Pagado', value: statusPayCounts[1], fill: '#FF0000' },         // Rojo
                      { name: 'En Proceso', value: statusPayCounts[2], fill: '#FFA500' },   // Naranja
                      { name: 'Pagado', value: statusPayCounts[3], fill: '#008000' },  // Verde
                      { name: 'Patrocinado', value: statusPayCounts[4], fill: '#0000FF' },  // Azul
                      { name: 'Exonerado', value: statusPayCounts[5], fill: '#FF69B4' }          // Rosa claro
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
                <h4 style={{ fontSize: '1.2rem', textAlign: 'flex' }}>Estado de Cursos</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={[
                      { name: 'No Finalizado', value: statusCursoCounts[1], fill: '#FFA500' },   // Naranja
                      { name: 'Egresado/Certificado', value: statusCursoCounts[2], fill: '#28A745' }, // Verde
                      { name: 'Retirado', value: statusCursoCounts[3], fill: '#FF0000' }          // Rojo
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" barSize={30} />
                    </BarChart>
                  </ResponsiveContainer>

                </div>
              </div>

              {/* Gráfica de Estado de Pagos justo debajo de la tabla */}
              <div className="col-lg-12 d-flex  mt-2 justify-content-between"> {/* Añadido justify-content-between para separar */} 
                
                <div className="chart-box" style={{ flex: '1 1 100%', maxWidth: '100%', marginRight: '10px' }}>
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
