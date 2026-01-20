import React, { useState } from 'react';
import { useApiConfig } from './ApiConfig.js';
import styles from './ApiEndpoint.module.css';

const ApiEndpoint = ({
  method = 'GET',
  endpoint,
  title,
  description,
  pathParams = [],
  queryParams = [],
  requestBody,
  responseExample
}) => {
  const { config } = useApiConfig();
  const [activeTab, setActiveTab] = useState('description');
  const [testResult, setTestResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pathValues, setPathValues] = useState({});
  const [queryValues, setQueryValues] = useState({});
  const [bodyContent, setBodyContent] = useState(requestBody || '');

  const getMethodStyle = (method) => {
    const methodStyles = {
      GET: styles.methodGet,
      POST: styles.methodPost,
      PUT: styles.methodPut,
      DELETE: styles.methodDelete,
      PATCH: styles.methodPatch
    };
    return methodStyles[method] || styles.methodDefault;
  };

  const buildUrl = () => {
    let url = config.baseUrl + endpoint;
    
    // Reemplazar parámetros de path
    Object.entries(pathValues).forEach(([key, value]) => {
      url = url.replace(`{${key}}`, encodeURIComponent(value || ''));
    });
    
    // Agregar parámetros de query
    const queryString = Object.entries(queryValues)
      .filter(([key, value]) => value)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');
    
    if (queryString) {
      url += `?${queryString}`;
    }
    
    return url;
  };

  const handleTest = async () => {
    if (!config.baseUrl || !config.token) {
      setTestResult({
        error: 'Please configure the base URL and token first'
      });
      return;
    }

    setIsLoading(true);
    try {
      const url = buildUrl();
      const options = {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.token}`
        }
      };

      if (method !== 'GET' && bodyContent) {
        options.body = bodyContent;
      }

      const response = await fetch(url, options);
      const data = await response.json();
      
      setTestResult({
        status: response.status,
        statusText: response.statusText,
        data
      });
    } catch (error) {
      setTestResult({
        error: error.message
      });
    }
    setIsLoading(false);
  };

  const formatJson = (obj) => {
    if (typeof obj === 'string') {
      try {
        return JSON.stringify(JSON.parse(obj), null, 2);
      } catch {
        return obj;
      }
    }
    return JSON.stringify(obj, null, 2);
  };

  return (
    <div className={styles.apiEndpoint}>
      <div className={styles.header}>
        <div className={styles.methodBadge}>
          <span className={getMethodStyle(method)}>{method}</span>
        </div>
        <div className={styles.endpointInfo}>
          <h4 className={styles.title}>{title}</h4>
          <code className={styles.endpoint}>{endpoint}</code>
        </div>
      </div>

      <div className={styles.tabs}>
        <button
          className={activeTab === 'description' ? styles.tabActive : styles.tab}
          onClick={() => setActiveTab('description')}
        >
          📋 Descripción
        </button>
        <button
          className={activeTab === 'test' ? styles.tabActive : styles.tab}
          onClick={() => setActiveTab('test')}
        >
          🧪 Probar
        </button>
        <button
          className={activeTab === 'example' ? styles.tabActive : styles.tab}
          onClick={() => setActiveTab('example')}
        >
          📄 Ejemplo
        </button>
      </div>

      <div className={styles.content}>
        {activeTab === 'description' && (
          <div className={styles.description}>
            <p>{description}</p>
            
            {pathParams.length > 0 && (
              <div className={styles.params}>
                <h5>Parámetros de Path</h5>
                <ul>
                  {pathParams.map((param, index) => (
                    <li key={index}>
                      <code>{param.name}</code> 
                      {param.required && <span className={styles.required}> *</span>}
                      - {param.description}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {queryParams.length > 0 && (
              <div className={styles.params}>
                <h5>Parámetros de Query</h5>
                <ul>
                  {queryParams.map((param, index) => (
                    <li key={index}>
                      <code>{param.name}</code>
                      {param.required && <span className={styles.required}> *</span>}
                      - {param.description}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {activeTab === 'test' && (
          <div className={styles.testSection}>
            <div className={styles.testForm}>
              <div className={styles.urlPreview}>
                <strong>URL:</strong> <code>{buildUrl()}</code>
              </div>

              {pathParams.length > 0 && (
                <div className={styles.paramSection}>
                  <h5>Parámetros de Path</h5>
                  {pathParams.map((param, index) => (
                    <div key={index} className={styles.paramInput}>
                      <label>{param.name} {param.required && <span className={styles.required}>*</span>}</label>
                      <input
                        type="text"
                        placeholder={param.description}
                        value={pathValues[param.name] || ''}
                        onChange={(e) => setPathValues(prev => ({
                          ...prev,
                          [param.name]: e.target.value
                        }))}
                      />
                    </div>
                  ))}
                </div>
              )}

              {queryParams.length > 0 && (
                <div className={styles.paramSection}>
                  <h5>Parámetros de Query</h5>
                  {queryParams.map((param, index) => (
                    <div key={index} className={styles.paramInput}>
                      <label>{param.name} {param.required && <span className={styles.required}>*</span>}</label>
                      <input
                        type="text"
                        placeholder={param.description}
                        value={queryValues[param.name] || ''}
                        onChange={(e) => setQueryValues(prev => ({
                          ...prev,
                          [param.name]: e.target.value
                        }))}
                      />
                    </div>
                  ))}
                </div>
              )}

              {(method === 'POST' || method === 'PUT' || method === 'PATCH') && (
                <div className={styles.paramSection}>
                  <h5>Request Body</h5>
                  <textarea
                    className={styles.bodyInput}
                    value={bodyContent}
                    onChange={(e) => setBodyContent(e.target.value)}
                    placeholder="Enter JSON request body..."
                    rows={8}
                  />
                </div>
              )}

              <button
                className={styles.testButton}
                onClick={handleTest}
                disabled={isLoading || !config.baseUrl || !config.token}
              >
                {isLoading ? '🔄 Probando...' : '▶️ Probar Endpoint'}
              </button>

              {testResult && (
                <div className={styles.testResult}>
                  <h5>Resultado</h5>
                  {testResult.error ? (
                    <div className={styles.error}>
                      <strong>Error:</strong> {testResult.error}
                    </div>
                  ) : (
                    <div>
                      <div className={styles.statusInfo}>
                        <strong>Status:</strong> {testResult.status} {testResult.statusText}
                      </div>
                      <pre className={styles.responseData}>
                        {formatJson(testResult.data)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'example' && (
          <div className={styles.example}>
            <h5>Ejemplo de Respuesta</h5>
            <pre className={styles.responseData}>
              {formatJson(responseExample)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApiEndpoint;