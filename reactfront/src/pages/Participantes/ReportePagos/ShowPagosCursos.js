import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import moment from 'moment';
import './ShowPagos.css';
import { useLoading } from '../../../components/LoadingContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PaginationTable from '../../../components/PaginationTable';

const endpoint = 'http://localhost:8000/api';

const ShowPagosCursos = () => {
    const [reportes, setReportes] = useState([]);
    const [filteredReportes, setFilteredReportes] = useState([]);
    const [error, setError] = useState(null);
    const [cedulaInscripcion, setCedulaInscripcion] = useState(null); // Estado para almacenar la cédula de la inscripción
    const [cursoCod, setCursoCod] = useState(null); // Estado para almacenar el código del curso
    const { inscripcion_curso_id } = useParams(); // Obtener el inscripcion_curso_id desde la URL
    const navigate = useNavigate();
    const { setLoading } = useLoading();
    const userRole = localStorage.getItem('role'); // Obtener el rol del usuario desde el localStorage
    const itemsPerPage = 4; // Número de elementos por página
    const [cursoId, setCursoId] = useState(null); // Estado para almacenar el ID del curso


    useEffect(() => {
        setLoading(true);
        getInscripcionCurso(inscripcion_curso_id)
            .then((data) => {
                const { cedula_identidad, curso_id } = data;
                setCedulaInscripcion(cedula_identidad);
                setCursoId(curso_id); // Guardar el ID del curso en el estado
                return getCursoCod(curso_id);
            })
            .then(() => {
                return getPagosByCurso();
            })
            .finally(() => {
                setLoading(false);
            });
    }, [inscripcion_curso_id]);

    // Función para obtener la cédula y el curso_id a través de la inscripción del curso
    const getInscripcionCurso = async (id) => {
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
    
            // Filtrar explícitamente por el inscripcion_curso_id correcto
            const inscripcion = allInscripciones.find(inscripcion => 
                String(inscripcion.id) === String(id)  // Convertimos a cadenas
            );
    
            if (inscripcion) {
                console.log("Inscripción encontrada:", inscripcion);
                return { cedula_identidad: inscripcion.cedula_identidad, curso_id: inscripcion.curso_id };
            } else {
                console.error("No se encontró ninguna inscripción para el curso con ID:", id);
                throw new Error('No se encontró la inscripción para el curso');
            }
        } catch (error) {
            console.error('Error fetching inscripcion:', error);
            toast.error('Error obteniendo la inscripción');
            throw error;
        }
    };

    // Función para obtener el código del curso usando el curso_id
    const getCursoCod = async (cursoId) => {
        try {
            const token = localStorage.getItem('token');
            let allCursos = [];
            let currentPage = 1;
            let totalPages = 1;

            while (currentPage <= totalPages) {
                const response = await axios.get(`${endpoint}/cursos?page=${currentPage}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                allCursos = [...allCursos, ...response.data.data];
                totalPages = response.data.last_page;
                currentPage++;
            }

            const curso = allCursos.find((curso) => curso.id === parseInt(cursoId, 10));
            if (curso) {
                setCursoCod(curso.cod);
                setCursoId(cursoId); // Asegurar que se guarda el curso_id
            } else {
                setCursoCod('Desconocido');
                setCursoId(null);
                throw new Error('No se encontró el curso con ese ID');
            }
        } catch (error) {
            console.error('Error fetching curso cod:', error);
            toast.error('Error obteniendo el código del curso');
        }
    };


    // Función para obtener los pagos por curso
    const getPagosByCurso = async () => {
        try {
            const token = localStorage.getItem('token');
            console.log("Inscripcion_curso_id de la URL:", inscripcion_curso_id); // Debug para ver el valor de la URL
    
            let allPagos = [];
            let currentPage = 1;
            let totalPages = 1;
    
            // Loop para obtener todas las páginas
            while (currentPage <= totalPages) {
                const response = await axios.get(`${endpoint}/pagos`, {
                    params: {
                        curso_id: inscripcion_curso_id,
                        page: currentPage,
                    },
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
    
                console.log(`Datos obtenidos de la página ${currentPage}:`, response.data.data);
    
                // Combinar los pagos obtenidos en esta página con el total de pagos
                allPagos = [...allPagos, ...response.data.data];
    
                // Obtener el número total de páginas
                totalPages = response.data.last_page;
                currentPage++;
            }
    
            // Filtrar los pagos que coinciden con el inscripcion_curso_id
            const pagosFiltrados = allPagos.filter(
                (reporte) => {
                    const match = reporte.inscripcion_curso_id === parseInt(inscripcion_curso_id);
                    console.log(`Comparando ${reporte.inscripcion_curso_id} con ${inscripcion_curso_id}:`, match); // Debug para ver la comparación
                    return match;
                }
            );
    
            // Si no hay coincidencias, verifica que el campo inscripcion_curso_id existe en la respuesta de la API
            if (pagosFiltrados.length === 0) {
                console.warn("No se encontraron pagos con inscripcion_curso_id:", inscripcion_curso_id);
            }
    
            // Ordenar por ID (más recientes primero)
            const sortedReportes = pagosFiltrados.sort((a, b) => b.id - a.id);
            setReportes(sortedReportes);
            setFilteredReportes(sortedReportes);
        } catch (error) {
            setError('Error fetching data');
            console.error('Error fetching data:', error);
        }
    };

    const deleteReporte = async (id) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar este Reporte de Pago?')) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`${endpoint}/pagos/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                getPagosByCurso(); // Volver a cargar los pagos después de la eliminación
                toast.success('Reporte eliminado con éxito');
            } catch (error) {
                setError('Error deleting data');
                console.error('Error deleting data:', error);
                toast.error('Error al eliminar el reporte');
            }
        }
    };

    const columns = ["id", "Cédula", "Fecha de Pago", "Monto Cancelado", "Monto Restante", "Comentario", "Acciones"];

    const renderItem = (reporte) => (
        <tr key={reporte.id}>
            <td className="col-id">{reporte.id}</td>
            <td className="col-cedula">{reporte.cedula_identidad}</td>
            <td className="col-fecha">{moment(reporte.fecha).format('YYYY-MM-DD')}</td>
            <td className="col-monto">{reporte.monto_cancelado} $</td>
            <td className="col-monto">{reporte.monto_restante} $</td>
            <td className="col-comentario">{reporte.comentario_cuota}</td>
            <td className="col-acciones">
                <div className="d-flex justify-content-around">
                    <Button
                        variant="info"
                        onClick={() => navigate(`/pagos/${reporte.id}`)} // Redirigir a la página de detalles
                        className="me-2"
                    >
                        Detalles
                    </Button>
                    {userRole === 'admin' && (
                    <Button
                        variant="danger"
                        onClick={() => deleteReporte(reporte.id)}
                    >
                        Eliminar
                    </Button>
                    )}
                </div>
            </td>
        </tr>
    );

    return (
        <div className="container mt-5">
            <meta name="csrf-token" content="{{ csrf_token() }}"></meta>
            <div className="d-flex flex-column align-items-start mb-3">
                <h1>Lista de Pagos</h1>
                <div className="d-flex justify-content-between w-100">
                    <h3>Participante V{cedulaInscripcion}</h3>
                    {(userRole === 'admin' || userRole === 'pagos') && cedulaInscripcion && (
                        <div>
                            <Button
                                variant="success"
                                onClick={() => navigate(`/pagos/${cedulaInscripcion}/${inscripcion_curso_id}`)}
                                style={{ marginRight: "10px" }} // Agrega un pequeño margen a la derecha del botón de Agregar
                            >
                                Agregar Nuevo Pago
                            </Button>
                            <Button
                                variant="secondary"
                                onClick={() => navigate(`/inscritos/${cursoId}`)} // Asegúrate de cambiar esto por la ruta real a la que debe volver
                            >
                                Volver
                            </Button>
                        </div>
                    )}
                </div>
                <h4>Curso {cursoCod}</h4>
            </div>
            {/* Tabla paginada */}
            <PaginationTable
                data={filteredReportes}
                itemsPerPage={itemsPerPage}
                columns={columns}
                renderItem={renderItem}
            />
            <ToastContainer />
        </div>
    );
    
    
};

export default ShowPagosCursos;
