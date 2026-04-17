import axios from 'axios';

const API_URL = 'http://localhost:9090/api/predict';

export const getPrediction = async (symbol, prices, buyPrice, token) => {
  const response = await axios.post(
    `${API_URL}/${symbol}`,
    { prices, buyPrice },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};
