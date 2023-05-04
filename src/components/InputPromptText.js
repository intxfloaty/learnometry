import React, { useState } from 'react';
import styles from '../styles/InputPromptText.module.css';
import SendIcon from '@mui/icons-material/Send';
import ElectricBoltIcon from '@mui/icons-material/ElectricBolt';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import PreferencesForm from './PreferencesForm';
import { Typography } from '@mui/material';


const InputPromptText = () => {
  const [inputText, setInputText] = useState('');
  const [responses, setResponses] = useState([]);
  const [preferencesModalOpen, setPreferencesModalOpen] = useState(false);


  // Open the preferences modal
  const handlePreferencesModalOpen = () => {
    setPreferencesModalOpen(true);
  };

  // Close the preferences modal
  const handlePreferencesModalClose = () => {
    setPreferencesModalOpen(false);
  };


  const handleInputChange = (event) => {
    setInputText(event.target.value);
  };

  const fetchResponse = async (topic, action) => {
    try {
      const requestBody = action === 'explainLikeFive' ? { topic, action } : { topic };
      const res = await fetch('/api/learningContent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      const data = await res.json()
      const responseData = { title: topic, text: data.content, prompts: data.question }

      setResponses((prevResponses) => [responseData, ...prevResponses]);
      console.log(data, 'data');
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
          {responses?.reverse().map((response, index) => {
            const textLines = response?.text?.split(/\r?\n/);
            const promptList = response?.prompts?.split(/\r?\n/).slice(3);
            return (
              <div key={index} className={styles.response}>
                <div className={styles.responseTitle}>{response.title}</div>
                <div className={styles.responseText}>
                  {textLines?.map((line, idx) => (
                    <React.Fragment key={idx}>
                      <Typography variant="body1" >
                        {line}
                        <br />
                      </Typography>
                    </React.Fragment>
                  ))}
                </div>
                <div className={styles.powerUpContainer}>
                  <button
                    className={styles.powerUpBtn}
                    onClick={handlePreferencesModalOpen}
                  >
                    Configure Preferences
                  </button>
                  <button className={styles.powerUpBtn}>Resources</button>
                </div>
                <div className={styles.promptSuggestions}>
                  <div className={styles.promptSuggestionsTitle}>Deep Dive:</div>
                  {promptList?.map((prompt, idx) => (
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


      <Dialog
        open={preferencesModalOpen}
        onClose={handlePreferencesModalClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Configure Preferences</DialogTitle>
        <DialogContent>
          <PreferencesForm />
        </DialogContent>
        <DialogActions>
          <Button onClick={handlePreferencesModalClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handlePreferencesModalClose} color="primary" variant="contained">
            Save Preferences
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default InputPromptText;


