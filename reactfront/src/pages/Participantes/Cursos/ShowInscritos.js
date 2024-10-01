import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Table, Alert, Button, Form, Modal } from 'react-bootstrap';
import moment from 'moment';
import { useLoading } from '../../../components/LoadingContext';
import { toast, ToastContainer } from 'react-toastify';
import PaginationTable from '../../../components/PaginationTable';

const endpoint = 'http://localhost:8000/api';

const ShowInscritos = () => {
  const { cursoId } = useParams();
  const [inscripciones, setInscripciones] = useState([]);
  const [filteredInscripciones, setFilteredInscripciones] = useState([]);
  const [searchCedula, setSearchCedula] = useState('');
  const [error, setError] = useState('');
  const [cursoCod, setCursoCod] = useState(''); // Estado para guardar el código del curso
  const [showModal, setShowModal] = useState(false); // Estado para controlar el modal
  const [selectedId, setSelectedId] = useState(null); // Estado para guardar el ID de la inscripción a eliminar
  const navigate = useNavigate();
  const { setLoading } = useLoading();
  const userRole = localStorage.getItem('role'); // Puede ser 'admin', 'superuser', 'invitado', etc.
  const itemsPerPage = 5; // Número de elementos por página

  useEffect(() => {
    setLoading(true);
    Promise.all([getInscritos(), getCursoCod()]).finally(() => {
      setLoading(false);
    });
  }, [cursoId]);

  // Obtener los detalles del curso por ID
  const getCursoCod = async () => {
    try {
      const token = localStorage.getItem('token');
      let allCursos = [];
      let currentPage = 1;
      let totalPages = 1;

      // Obtener los cursos con paginación
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

      // Filtrar el curso que coincide con el ID
      const curso = allCursos.find((curso) => curso.id === parseInt(cursoId, 10));
      if (curso) {
        setCursoCod(curso.cod); // Guardar el código del curso en el estado
      } else {
        setCursoCod('Desconocido');
      }
    } catch (error) {
      console.error('Error fetching curso cod:', error);
      setError('Error al obtener el código del curso');
    }
  };

  const getInscritos = async () => {
    try {
      const token = localStorage.getItem('token');
      let allInscripciones = [];
      let currentPage = 1;
      let totalPages = 1;

      // Loop para obtener todas las páginas de inscripciones
      while (currentPage <= totalPages) {
        const response = await axios.get(`${endpoint}/cursos_inscripcion?curso_id=${cursoId}&page=${currentPage}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        allInscripciones = [...allInscripciones, ...response.data.data];
        totalPages = response.data.last_page;
        currentPage++;
      }

      // Agregamos los detalles de identificación a cada inscripción
      const inscripcionesConDetalles = await Promise.all(allInscripciones.map(async (inscripcion) => {
        try {
          const detallesResponse = await axios.get(`${endpoint}/identificacion/${inscripcion.cedula_identidad}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          return { ...inscripcion, ...detallesResponse.data };
        } catch (error) {
          console.error('Error fetching detalles:', error);
          return { ...inscripcion, nombres: 'N/A', apellidos: 'N/A' };
        }
      }));

      setInscripciones(inscripcionesConDetalles);
      setFilteredInscripciones(inscripcionesConDetalles);
    } catch (error) {
      setError('Error fetching data');
      console.error('Error fetching data:', error);
    }
  };

  const getStatusPayColor = (status_pay) => {
    if (status_pay === '1') return 'red'; // No pagado
    if (status_pay === '2') return 'orange'; // En proceso
    if (status_pay === '3') return 'green'; // Pagado
    return 'gray'; // Desconocido
  };

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

  const [selectedPayStatus, setSelectedPayStatus] = useState(''); // Estado para el filtro de estado de pago

  const handlePayStatusChange = (e) => {
    const value = e.target.value;
    setSelectedPayStatus(value);
    applyPayStatusFilter(value);
  };

  const applyPayStatusFilter = (statusValue) => {
    let filtered = [...inscripciones];
    if (statusValue) {
      filtered = filtered.filter(inscripcion => inscripcion.status_pay === statusValue);
    }
    setFilteredInscripciones(filtered);
  };

  // Mostrar el modal para confirmar la eliminación
  const handleShowModal = (id) => {
    setSelectedId(id);  // Almacena el ID de la inscripción que se va a eliminar
    setShowModal(true); // Muestra el modal
  };

  const handleCloseModal = () => {
    setShowModal(false); // Cierra el modal
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${endpoint}/cursos_inscripcion/${selectedId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success('Éxito al eliminar la inscripción');
      setFilteredInscripciones(filteredInscripciones.filter(inscripcion => inscripcion.id !== selectedId));
      setShowModal(false); // Cierra el modal tras la eliminación exitosa
    } catch (error) {
      console.error('Error deleting inscripcion:', error);
      setError('Error al eliminar la inscripción');
      setShowModal(false); // Cierra el modal tras el error
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchCedula(value);
    const filtered = inscripciones.filter(inscripcion =>
      inscripcion.cedula_identidad.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredInscripciones(filtered);
  };

  const columns = ["Estado", "Cédula", "Fecha de Inscripción", "Nombres", "Apellidos", "Acciones"];

  const renderItem = (inscripcion) => (
    <tr key={inscripcion.id}>
      <td className="text-center">{renderStatusPayDot(inscripcion.status_pay)}</td>
      <td>{inscripcion.cedula_identidad}</td>
      <td>{moment(inscripcion.fecha_inscripcion).format('YYYY-MM-DD')}</td>
      <td>{inscripcion.nombres}</td>
      <td>{inscripcion.apellidos}</td>
      <td>
        <div className="d-flex justify-content-around">
          <Button
            variant="info"
            onClick={() => navigate(`/pagos/curso/${inscripcion.id}`)}
          >
            Ver Pagos
          </Button>
          {userRole === 'admin' && (
            <Button
              variant="danger"
              onClick={() => handleShowModal(inscripcion.id)}
            >
              Eliminar
            </Button>
            
          )}
        </div>
      </td>
    </tr>
  );

  return (
    <div className="container">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1>Inscritos del Curso {cursoCod}</h1>
        <div>
          {(userRole === 'admin' || userRole === 'superuser' ) && (
            <Button
              variant="success"
              onClick={() => navigate(`/inscribir/${cursoId}`)}
              className="me-2"
            >
              Inscribir
            </Button>
          )}

          <Button
            variant="secondary"
            onClick={() => navigate('/cursos')}
          >
            Volver
          </Button>
        </div>
      </div>

      {/* Alinear el buscador y el filtro en la misma fila */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <Form.Control
          type="text"
          placeholder="Buscar por cédula"
          value={searchCedula}
          onChange={handleSearchChange}
          style={{ width: '250px' }}
        />
        <Form.Select
          value={selectedPayStatus}
          onChange={handlePayStatusChange}
          className="me-2"
          style={{ width: 'auto' }}
        >
          <option value="">Filtrar por estado de pago</option>
          <option value="1">No pagado (Rojo)</option>
          <option value="2">En proceso (Naranja)</option>
          <option value="3">Pagado (Verde)</option>
        </Form.Select>
      </div>

      {/* Leyenda de colores */}
      <div className="status-legend d-flex justify-content-start mb-3">
        <span className="status-dot red"></span> No pagado (Rojo)
        <span className="status-dot orange ms-3"></span> En proceso (Naranja)
        <span className="status-dot green ms-3"></span> Pagado (Verde)
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {/* Tabla paginada */}
      <PaginationTable
        data={filteredInscripciones}
        itemsPerPage={itemsPerPage}
        columns={columns}
        renderItem={renderItem}
      />

      {/* Modal de eliminación */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>¿Estás seguro de que deseas eliminar esta inscripción?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Eliminar
          </Button>
        </Modal.Footer>
      </Modal>

      <ToastContainer />
    </div>
  );
};

export default ShowInscritos;
