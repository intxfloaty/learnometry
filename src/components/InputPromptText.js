import React, { useState } from 'react';
import styles from '../styles/InputPromptText.module.css';
import SendIcon from '@mui/icons-material/Send';


const InputPromptText = () => {
  const [inputText, setInputText] = useState('');
  const [responses, setResponses] = useState([]);

  console.log(responses, 'responses');

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
      const data = await res.json()
      const responseData = { title: inputText, text: data.text }

      setResponses((prevResponses) => [responseData, ...prevResponses]);
      console.log(data);
    } catch (error) {
      console.error("Error calling OpenAI API:", error);
    }
  };

  const handleLearnButtonClick = () => {
    fetchResponse();
  };

  return (
    <div className={styles.wrapper}>
      {responses.length != 0 &&
        <div className={styles.responseArea}>
          {responses.reverse().map((response, index) => (
            <div key={index} className={styles.response}>
              <div className={styles.responseTitle}>{response.title}</div>
              <div className={styles.responseText}>{response.text}</div>
              <div className={styles.promptSuggestions}>
                This is a prompt suggestion
              </div>
            </div>
          ))}
        </div>}
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
    </div>
  );
};

export default InputPromptText;
