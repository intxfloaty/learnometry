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

  const fetchResponse = async (topic) => {
    try {
      const res = await fetch('/api/learningContent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic }),
      });
      const data = await res.json()
      const responseData = { title: topic, text: data.content, prompts: data.question }

      setResponses((prevResponses) => [responseData, ...prevResponses]);
      console.log(data);
    } catch (error) {
      console.error("Error calling OpenAI API:", error);
    }
  };

  const handleLearnButtonClick = () => {
    fetchResponse(inputText);
    setInputText('');
  };

  function handleClick(prompt) {
    const cleanedPrompt = prompt.replace(/^\d+\.\s*/, '');
    fetchResponse(cleanedPrompt);
  }

  return (
    <div className={styles.wrapper}>
      {responses.length != 0 &&
        <div className={styles.responseArea}>
          {responses.reverse().map((response, index) => {
            const textLines = response.text.split(/\r?\n/);
            const promptList = response.prompts.split(/\r?\n/).slice(3);
            return (
              <div key={index} className={styles.response}>
                <div className={styles.responseTitle}>{response.title}</div>
                <div className={styles.responseText}>
                  {textLines.map((line, idx) => (
                    <React.Fragment key={idx}>
                      {line}
                      <br />
                    </React.Fragment>
                  ))}
                </div>
                <div className={styles.promptSuggestions}>
                  {promptList.map((prompt, idx) => (
                    <button
                      key={idx}
                      className={styles.clickableItem}
                      onClick={() => handleClick(prompt)}
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
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
