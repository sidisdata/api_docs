import React from 'react';
import styles from './ApiEndpoint.module.css';

export default function ApiEndpoint({ 
  method, 
  endpoint, 
  description, 
  parameters, 
  example,
  response 
}) {
  return (
    <div className={styles.apiEndpoint}>
      <div className={styles.header}>
        <span className={`${styles.method} ${styles[method?.toLowerCase()]}`}>
          {method}
        </span>
        <code className={styles.endpoint}>{endpoint}</code>
      </div>
      
      {description && (
        <div className={styles.description}>
          <p>{description}</p>
        </div>
      )}
      
      {parameters && (
        <div className={styles.section}>
          <h4>Parameters</h4>
          <div className={styles.parameters}>
            {parameters}
          </div>
        </div>
      )}
      
      {example && (
        <div className={styles.section}>
          <h4>Example Request</h4>
          <pre className={styles.codeBlock}>
            <code>{example}</code>
          </pre>
        </div>
      )}
      
      {response && (
        <div className={styles.section}>
          <h4>Response</h4>
          <pre className={styles.codeBlock}>
            <code>{response}</code>
          </pre>
        </div>
      )}
    </div>
  );
}