import axios from 'axios';

const API_URL = 'http://localhost:5000/entries';

export const getEntries = async () => {
    const response = await axios.get(API_URL);
    return response.data;
};

export const addEntry = async (entry) => {
    const response = await axios.post(API_URL, entry);
    return response.data;
};

export const updateEntry = async (id, entry) => {
    const response = await axios.put(`${API_URL}/${id}`, entry);
    return response.data;
};

export const deleteEntry = async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
};