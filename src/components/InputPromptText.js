import React, { useState } from 'react';
import styles from '../styles/InputPromptText.module.css';
import SendIcon from '@mui/icons-material/Send';


const InputPromptText = () => {
  const [inputText, setInputText] = useState('');

  const handleInputChange = (event) => {
    setInputText(event.target.value);
  };

  const fetchResponse = async () => {
    try {
      const res = await fetch('/api/learningContent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic: inputText }),
      });
      const data = await res.json();
      console.log(data);
    } catch (error) {
      console.error("Error calling OpenAI API:", error);
    }
  };

  const handleLearnButtonClick = () => {
    fetchResponse();
  };

  return (
    <div className={styles.container}>
      <input
        className={styles.inputField}
        type="text"
        placeholder="What do you want to learn?"
        value={inputText}
        onChange={handleInputChange}
      />
      <button className={styles.learnButton} onClick={handleLearnButtonClick}>
        <SendIcon style={{ color: 'white' }} />
      </button>
    </div>
  );
};

export default InputPromptText;
