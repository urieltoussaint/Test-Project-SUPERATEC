import { useState, useEffect } from 'react';
import axios from '../axiosConfig';

const useFetchOptions = (endpoint, nameField, valueField) => {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const response = await axios.get(endpoint);
        
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
