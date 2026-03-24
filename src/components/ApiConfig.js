import React, { createContext, useContext } from 'react';
import styles from './ApiConfig.module.css';

// Create API Configuration Context
const ApiConfigContext = createContext({
  baseUrl: 'https://api.example.com',
  token: null
});

// API Configuration Provider
export function ApiConfigProvider({ baseUrl = 'https://api.example.com', token, children }) {
  const value = { baseUrl, token };
  
  return (
    <ApiConfigContext.Provider value={value}>
      {children}
    </ApiConfigContext.Provider>
  );
}

// Hook to use API Configuration
export function useApiConfig() {
  return useContext(ApiConfigContext);
}

// API Configuration Display Component
export default function ApiConfig({ baseUrl, token }) {
  return (
    <div className={styles.apiConfig}>
      <h3>API Configuration</h3>
      <div className={styles.configItem}>
        <label>Base URL:</label>
        <code>{baseUrl || 'https://api.example.com'}</code>
      </div>
      {token && (
        <div className={styles.configItem}>
          <label>Authorization:</label>
          <code>Bearer {token}</code>
        </div>
      )}
    </div>
  );
}