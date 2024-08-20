import { useState, useEffect } from 'react';
import axios from '../axiosConfig';

const useFetchOptions = (endpoint, nameField, valueField) => {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        // const response = await axios.get(endpoint);
        const response = await axios.get(`${endpoint}`, {
          headers: {
              Authorization: `Bearer ${token}`,
          }
      });
      setLoading(false);
        
        const formattedOptions = response.data.data.map(item => ({
          name: item[nameField],
          value: item[valueField],
         
          
        }));
        setOptions(formattedOptions);
      } 
      
      catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchOptions();
  }, [endpoint, nameField, valueField]);

  return { options, loading, error };
};

export default useFetchOptions;
