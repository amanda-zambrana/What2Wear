import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

export const createApiClient = (baseURL: string, timeout: number = 10000, headers = { 'Content-Type': 'application/json' }): AxiosInstance => {
  return axios.create({
    baseURL,
    timeout,
    headers,
  });
};
export const apiGet = async (client: AxiosInstance, url: string, config?: AxiosRequestConfig) => { //GetRequest
  try {
    const response = await client.get(url, config);
    return response.data;  // Return response data
  } catch (error) {
    console.error('GET request failed:', error);
    throw error;
  }
};


export const apiPost = async (client: AxiosInstance, url: string, data: any, config?: AxiosRequestConfig) => { //Postrequest
  try {
    const response = await client.post(url, data, config);
    return response.data;
  } catch (error) {
    console.error('POST request failed:', error);
    throw error;
  }
};


export const apiPut = async (client: AxiosInstance, url: string, data: any, config?: AxiosRequestConfig) => { //Putrequest
  try {
    const response = await client.put(url, data, config);
    return response.data;
  } catch (error) {
    console.error('PUT request failed:', error);
    throw error;
  }
};

export const apiDelete = async (client: AxiosInstance, url: string, config?: AxiosRequestConfig) => { //delete Request
  try {
    const response = await client.delete(url, config);
    return response.data;
  } catch (error) {
    console.error('DELETE request failed:', error);
    throw error;
  }
};

