import React from 'react';
import styles from '../styles/ResponseArea.module.css';

const ResponseArea = ({ responses }) => {
  return (
    <div className={styles.responseArea}>
      {responses.map((response, index) => (
        <div key={index} className={styles.response}>
          <div className={styles.responseText}>{response.text}</div>
          <div className={styles.promptSuggestions}>
            This is a prompt suggestion
          </div>
        </div>
      ))}
    </div>
  );
};

export default ResponseArea;
