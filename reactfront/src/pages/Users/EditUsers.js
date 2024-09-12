import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Button } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import SelectComponent from '../../components/SelectComponent';
import { useLoading } from '../../components/LoadingContext'; 
import { ToastContainer, toast } from 'react-toastify';

const endpoint = 'http://localhost:8000/api';

const EditUsers = () => {
    const [formData, setFormData] = useState({
        name: '',        // Asegúrate de que estos campos tengan un valor predeterminado
        email: '',
        role_id: '',
    });

    const navigate = useNavigate();
    const { id } = useParams(); // Obtener el ID desde la ruta
    const { setLoading } = useLoading();

    useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        let relationsArray = ['role']; // Asumiendo que role es la única relación que deseas
        const relations = relationsArray.join(',');
        const token = localStorage.getItem('token');
        const response = await axios.get(`${endpoint}/users/${id}?with=${relations}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Actualiza el estado con los datos correctos del backend
        const userData = response.data.user; // Accede a los datos dentro de "user"
        setFormData({
          name: userData.name || '', // Valores predeterminados vacíos en caso de que falten
          email: userData.email || '',
          role_id: userData.role_id || '', // Role ID también debe ser actualizado correctamente
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);


    // Manejar cambios en los inputs del formulario
    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value || '', // Asegurarse de que siempre haya un valor
        }));
    };

    // Manejar el envío del formulario
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');

            console.log('Enviando datos al backend:', formData); // Verificar los datos que se están enviando

            await axios.put(`${endpoint}/users/${id}`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            toast.success('Actualización exitosa');
            navigate('/users');
        } catch (error) {
            console.error('Error al actualizar los datos:', error);
            toast.error('Error al actualizar');
        }
    };

    return (
        <div className="container">
            <meta name="csrf-token" content="{{ csrf_token() }}" />
            <h1>Actualizar Usuario</h1>
            <Form onSubmit={handleSubmit}>
                <div className="row">
                    <div className="col-md-6">
                        {/* Input para el nombre de usuario */}
                        <Form.Group controlId="name">
                            <Form.Label>Nombre de Usuario</Form.Label>
                            <Form.Control
                                type="text"
                                name="name"
                                value={formData.name || ''}   // Evitar que sea undefined
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>

                        {/* Input para el email */}
                        <Form.Group controlId="email">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                name="email"
                                value={formData.email || ''}  // Evitar que sea undefined
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>

                        {/* Componente Select para el rol */}
                        <SelectComponent
                            endpoint={`${endpoint}/role`}
                            nameField="name"
                            valueField="id"
                            selectedValue={formData.role_id || ''} // Evitar que sea undefined
                            handleChange={handleChange}
                            controlId="role_id"
                            label="Rol"
                        />
                    </div>
                </div>

                {/* Botones para guardar o volver */}
                <Button variant="success" type="submit">
                    Guardar
                </Button>
                <Button 
                    variant="secondary" 
                    onClick={() => navigate('/users')}
                    className="ms-2"
                >
                    Volver
                </Button>
            </Form>
            <ToastContainer />
        </div>
    );
};

export default EditUsers;
