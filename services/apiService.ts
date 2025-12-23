import { AppState } from '../types';

const API_BASE_URL = '/api';

/**
 * Gets the authentication token from localStorage
 */
const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

/**
 * Fetches the complete application state from the central server.
 * This function ensures data is retrieved from the single source of truth,
 * enabling multi-device synchronization.
 */
export const fetchState = async (): Promise<AppState | null> => {
  try {
    const token = getAuthToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    // Add authorization header if token exists
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_BASE_URL}/data`, { 
      cache: 'no-store',
      headers,
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        console.error('Authentication failed. Token may be invalid.');
        // Clear invalid token
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
      throw new Error(`Server responded with status: ${response.status}`);
    }
    const data = await response.json();
    if (Object.keys(data).length === 0) {
      console.log('No state found on server. Will initialize with mock data.');
      return null; // Server has no data yet
    }
    console.log('State fetched from server.');
    return data as AppState;
  } catch (error) {
    console.error('Error fetching state from server:', error);
    // This could happen if the server is not running
    return null;
  }
};

/**
 * Saves the complete application state to the central server.
 * This function ensures that all changes are persisted to the single source of truth
 * and will be broadcast to other connected devices.
 */
export const saveState = async (data: AppState): Promise<boolean> => {
   try {
      const token = getAuthToken();
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      // Add authorization header if token exists
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${API_BASE_URL}/data`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          console.error('Authentication failed. Token may be invalid.');
          // Clear invalid token
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
        throw new Error(`Server responded with status: ${response.status}`);
      }
      return true;
    } catch (error) {
      console.error('Error saving state to server:', error);
      return false;
    }
};