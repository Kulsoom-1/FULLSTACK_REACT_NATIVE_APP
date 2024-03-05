import axios, {AxiosRequestConfig, AxiosResponse} from 'axios';

interface ApiResponse {
  status: number;
  data: any;
}

export const sendRequest = async (
  url: string,
  method: string = 'GET',
  data: any = null,
): Promise<any> => {
  const API_URL = 'http://localhost:3000/api/parking'; // Replace with your actual API base URL
  console.log(`${API_URL}${url}`, data, method);

  try {
    const config: AxiosRequestConfig = {
      url: `${API_URL}${url}`,
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      data: method !== 'GET' ? JSON.stringify(data) : null,
    };

    const response: AxiosResponse<ApiResponse> = await axios(config);

    if (response.status >= 200 && response.status < 300) {
      return response.data.data; // Assuming your data is inside a 'data' property
    } else {
      throw new Error(response?.data?.message || 'Request failed');
    }
  } catch (error) {
    console.error(`Error in API request: ${error?.message}`);
    throw new Error('Something went wrong, please try again.');
  }
};
