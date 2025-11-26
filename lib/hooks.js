import { useState, useCallback } from 'react';

// Custom hook for API calls with loading and error states
export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const callApi = useCallback(async (url, options = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'API request failed');
      }
      
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, callApi };
};

// Custom hook for user authentication
export const useAuth = () => {
  const { loading, error, callApi } = useApi();
  const [user, setUser] = useState(null);

  // Check if user is authenticated
  const checkAuth = useCallback(async () => {
    try {
      const data = await callApi('/api/auth');
      setUser(data.user);
      return data.user;
    } catch (err) {
      setUser(null);
      return null;
    }
  }, [callApi]);

  // Login
  const login = useCallback(async (credentials) => {
    try {
      const data = await callApi('/api/auth', {
        method: 'POST',
        body: JSON.stringify(credentials)
      });
      setUser(data.user);
      return data;
    } catch (err) {
      throw err;
    }
  }, [callApi]);

  // Logout
  const logout = useCallback(async () => {
    try {
      await callApi('/api/auth', {
        method: 'DELETE'
      });
      setUser(null);
    } catch (err) {
      // Even if logout fails, clear user state
      setUser(null);
      throw err;
    }
  }, [callApi]);

  // Register
  const register = useCallback(async (userData) => {
    try {
      const data = await callApi('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData)
      });
      return data;
    } catch (err) {
      throw err;
    }
  }, [callApi]);

  return { user, loading, error, checkAuth, login, logout, register };
};

// Custom hook for user profile management
export const useProfile = () => {
  const { loading, error, callApi } = useApi();

  // Get user profile
  const getProfile = useCallback(async () => {
    return await callApi('/api/user');
  }, [callApi]);

  // Update user profile
  const updateProfile = useCallback(async (profileData) => {
    return await callApi('/api/user', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
  }, [callApi]);

  // Change password
  const changePassword = useCallback(async (passwordData) => {
    return await callApi('/api/user/password', {
      method: 'PATCH',
      body: JSON.stringify(passwordData)
    });
  }, [callApi]);

  return { loading, error, getProfile, updateProfile, changePassword };
};

// Custom hook for project management
export const useProjects = () => {
  const { loading, error, callApi } = useApi();

  // Get all projects
  const getProjects = useCallback(async () => {
    return await callApi('/api/project');
  }, [callApi]);

  // Get a specific project
  const getProject = useCallback(async (id) => {
    return await callApi(`/api/project/${id}`);
  }, [callApi]);

  return { loading, error, getProjects, getProject };
};