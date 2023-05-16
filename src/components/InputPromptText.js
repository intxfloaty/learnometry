import React, { useState, useEffect } from 'react';
import styles from '../styles/InputPromptText.module.css';
import SendIcon from '@mui/icons-material/Send';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import PreferencesForm from './PreferencesForm';
import { Typography } from '@mui/material';
import ComingSoonModal from './ComingSoonModal';
import { saveStackHistory, saveSubStack, updateSubStack } from '@/utils/firebase';

const InputPromptText = ({ responses, setResponses, depthResponse, setDepthResponse }) => {
  const [inputText, setInputText] = useState('');
  // const [responses, setResponses] = useState([]);
  // const [depthResponse, setDepthResponse] = useState({});
  const [preferencesModalOpen, setPreferencesModalOpen] = useState(false);
  const [resourceModalOpen, setResourceModalOpen] = useState(false);
  const [topic, setTopic] = React.useState('');
  const [stackId, setStackId] = useState();
  const [subStackId, setSubStackId] = useState();

  console.log(stackId, subStackId, 'stackId, subStackId')
  // State for the depth preference
  const [depth, setDepth] = React.useState(1);

  // State for learning styles
  const [learningStyle, setLearningStyle] = React.useState('socratic');

  console.log(responses, 'responses')
  console.log(depthResponse, 'depthResponse')

  // Close the preferences modal
  const handlePreferencesModalClose = () => {
    setPreferencesModalOpen(false);
  };

  const handleResourceModalClose = () => {
    setResourceModalOpen(false);
  };

  const handleInputChange = (event) => {
    setInputText(event.target.value);
  };

  const fetchResponse = async (topic, depth_level) => {
    try {
      if (topic && depth_level && learningStyle) {
        const res = await fetch('/api/learningContent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ topic, depth_level, learningStyle }),
        });
        const data = await res.json()
        const depthResponseData = {
          depth: depth_level,
          learningStyle: learningStyle,
          text: data.text,
        };
        setDepthResponse(prevDepthResponse => ({
          ...prevDepthResponse,
          [topic]: prevDepthResponse[topic]
            ? [...prevDepthResponse[topic], depthResponseData]
            : [depthResponseData],
        }));
        updateSubStack(stackId, subStackId, topic, depthResponseData);
      }
      else {
        const res = await fetch('/api/learningContent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ topic }),
        });
        const data = await res.json()
        const responseData = {
          title: topic,
          text: data.content,
          prompts: data.question,
        }
        setResponses((prevResponses) => [...prevResponses, responseData]);
        if (responses.length === 0) {
          const { stackId, subStackId } = await saveStackHistory(responseData);
          setStackId(stackId);
          setSubStackId(subStackId);
        } else {
          const subStackId = await saveSubStack(stackId, responseData);
          setSubStackId(subStackId)
        }
      }
    } catch (error) {
      console.error("Error calling OpenAI API:", error);
    }
  };

  const handleLearnButtonClick = () => {
    fetchResponse(inputText);
    setInputText('');
  };

  function handlePromptClick(prompt) {
    const cleanedPrompt = prompt.replace(/^\d+\.\s*/, '');
    fetchResponse(cleanedPrompt);
  }


  const handleSavePrefernces = () => {
    const depth_level = depth !== '' ? `Level_${depth}` : '';
    fetchResponse(topic, depth_level, learningStyle)
    handlePreferencesModalClose();
  }


  useEffect(() => {

  }, [])

  return (
    <div className={styles.wrapper}>
      {
        responses?.length != 0 &&
        <div className={styles.responseArea}>
          {responses?.map((response, index) => {
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

                <div className={styles.depthContainer}>
                  {depthResponse[response?.title] && depthResponse[response?.title]?.map((responseDepth, index) => {
                    const textLines = responseDepth?.text?.split(/\r?\n/);
                    const depthLevel = responseDepth?.depth.replace(/_/g, ' ')
                    return (
                      <React.Fragment key={index}>
                        <div className={styles.depthTitle}>
                          <div>Depth: <span style={{ color: "blue", fontSize: "1.1em" }}>{depthLevel}</span></div>
                          <div>Learning Style: <span style={{ color: "blue", fontSize: "1.1em", textTransform: "capitalize" }}>{responseDepth.learningStyle}</span></div>
                        </div>
                        <div className={`${styles.depthText} ${styles[`depth${responseDepth.depth}`]}`}>
                          {textLines?.map((line, idx) => (
                            <React.Fragment key={idx}>
                              <Typography variant="body1" >
                                {line}
                                <br />
                              </Typography>
                            </React.Fragment>
                          ))}
                        </div>
                      </React.Fragment>
                    )
                  })}
                </div>

                <div className={styles.powerUpContainer}>
                  <button
                    className={styles.powerUpBtn}
                    onClick={() => {
                      setTopic(response.title);
                      setPreferencesModalOpen(true)
                    }}
                  >
                    Learning Preference
                  </button>
                  <button onClick={() => setResourceModalOpen(true)} className={styles.powerUpBtn}>Explain Like I'm 5</button>
                  <button onClick={() => setResourceModalOpen(true)} className={styles.powerUpBtn}>Lesson Plan</button>
                  <button onClick={() => setResourceModalOpen(true)} className={styles.powerUpBtn}>Resources</button>
                </div>
                <div className={styles.promptSuggestions}>
                  <div className={styles.promptSuggestionsTitle}>Deep Dive:</div>
                  {promptList?.map((prompt, idx) => (
                    <button
                      key={idx}
                      className={styles.clickableItem}
                      onClick={() => handlePromptClick(prompt)}
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      }
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
          <PreferencesForm
            depth={depth}
            setDepth={setDepth}
            learningStyle={learningStyle}
            setLearningStyle={setLearningStyle}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handlePreferencesModalClose} color="primary">
            Cancel
          </Button>
          <Button className={styles.powerUpBtn} onClick={handleSavePrefernces} variant="contained">
            <SendIcon style={{ color: 'white' }} />
          </Button>
        </DialogActions>
      </Dialog>

      <ComingSoonModal
        open={resourceModalOpen}
        handleClose={handleResourceModalClose}
        modalType="resource"
      />
    </div>
  );
};

export default InputPromptText;