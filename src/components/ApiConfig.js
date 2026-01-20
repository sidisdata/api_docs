import React, { createContext, useContext, useState } from 'react';
import styles from './ApiConfig.module.css';

// Context para compartir la configuración entre componentes
const ApiConfigContext = createContext();

export const ApiConfigProvider = ({ children }) => {
  const [config, setConfig] = useState({
    baseUrl: 'https://api.sidis.com',
    token: ''
  });

  return (
    <ApiConfigContext.Provider value={{ config, setConfig }}>
      {children}
    </ApiConfigContext.Provider>
  );
};

export const useApiConfig = () => {
  const context = useContext(ApiConfigContext);
  if (!context) {
    throw new Error('useApiConfig must be used within ApiConfigProvider');
  }
  return context;
};

const ApiConfig = () => {
  const { config, setConfig } = useApiConfig();

  const handleInputChange = (field, value) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className={styles.apiConfig}>
      <div className={styles.header}>
        <h3>🔧 Configuración de API</h3>
        <p>Configura los parámetros globales para probar los endpoints</p>
      </div>
      
      <div className={styles.configForm}>
        <div className={styles.field}>
          <label htmlFor="baseUrl">
            <strong>URL Base del API:</strong>
          </label>
          <input
            id="baseUrl"
            type="text"
            value={config.baseUrl}
            onChange={(e) => handleInputChange('baseUrl', e.target.value)}
            placeholder="https://api.sidis.com"
            className={styles.input}
          />
          <small>URL base del servidor API</small>
        </div>

        <div className={styles.field}>
          <label htmlFor="token">
            <strong>Token de Autorización:</strong>
          </label>
          <input
            id="token"
            type="password"
            value={config.token}
            onChange={(e) => handleInputChange('token', e.target.value)}
            placeholder="Bearer token o API key"
            className={styles.input}
          />
          <small>Token de autenticación para los endpoints protegidos</small>
        </div>
      </div>

      <div className={styles.status}>
        <div className={styles.statusItem}>
          <span className={styles.statusLabel}>Estado:</span>
          <span className={config.baseUrl && config.token ? styles.ready : styles.pending}>
            {config.baseUrl && config.token ? '✅ Listo para probar' : '⏳ Configuración pendiente'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ApiConfig;