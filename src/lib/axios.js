import axios from 'axios';

// Create an Axios instance
const apiClient = axios.create({
    baseURL: 'http://localhost:3000/api', // Replace with your base URL
    timeout: 100000, // Set a timeout
});

// Request Interceptor
apiClient.interceptors.request.use(
    (config) => {
        // Add authorization token if available
        const token = localStorage.getItem('authToken'); // Replace with your token retrieval method
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }

        // You can log or modify the request here
        console.log('Request:', config);
        return config;
    },
    (error) => {
        // Handle request error
        console.log('Request Error:', error);
        return Promise.reject(error);
    }
);

// Response Interceptor
apiClient.interceptors.response.use(
    (response) => {
        // Any custom processing for successful responses
        console.log('Response:', response);
        return response;
    },
    (error) => {
        // Handle errors globally
        console.log('Response Error:', error);

        if (error.response) {
            // Example: Handle 401 Unauthorized
            if (error.response.status === 401) {
                console.log('Unauthorized. Logging out...');
                // Optional: Redirect to login or logout
                localStorage.removeItem('authToken'); // Remove token
                window.location.href = '/login'; // Redirect to login
            }
        }

        return Promise.reject(error); // Propagate error for specific handling
    }
);

export default apiClient;
