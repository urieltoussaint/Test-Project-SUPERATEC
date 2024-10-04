import axios from 'axios';

const endpoint = 'http://localhost:8000/api';

export const getPeticiones = async () => {
  const token = localStorage.getItem('token');
  const response = await axios.get(`${endpoint}/peticiones`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data.data;
};

export const deletePeticion = async (id) => {
  const token = localStorage.getItem('token');
  await axios.delete(`${endpoint}/peticiones/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const rejectMutation = async ({ id, comment, userId }) => {
  const token = localStorage.getItem('token');
  const payload = {
    comentario: comment,
    user_id: userId,
  };
  await axios.post(`${endpoint}/peticiones/${id}/reject`, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
