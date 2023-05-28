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
import { useRouter } from 'next/router'


const InputPromptText = ({ responses, setResponses, depthResponse, setDepthResponse, id }) => {
  const [inputText, setInputText] = useState('');
  const [tokens, setTokens] = useState([])

  console.log(tokens, 'tokens')
  const [preferencesModalOpen, setPreferencesModalOpen] = useState(false);
  const [resourceModalOpen, setResourceModalOpen] = useState(false);
  const [topic, setTopic] = React.useState('');
  const [stackId, setStackId] = useState();
  const [subStackId, setSubStackId] = useState();
  const router = useRouter()

  // console.log(stackId, 'subStackId')

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
        const depthResponseData = {
          depth: depth_level,
          learningStyle: learningStyle,
          text: "",
        };

        setDepthResponse(prevDepthResponse => ({
          ...prevDepthResponse,
          [topic]: prevDepthResponse[topic]
            ? [...prevDepthResponse[topic], depthResponseData]
            : [depthResponseData],
        }));

        const url = `/api/learningContent?topic=${encodeURIComponent(topic)}&depth_level=${encodeURIComponent(depth_level)}&learningStyle=${encodeURIComponent(learningStyle)}`;
        const eventSource = new EventSource(url);

        eventSource.onmessage = function (event) {
          const data = JSON.parse(event.data);

          if (data.token) {
            // Handle token data here
            setTokens((prevTokens) => [...prevTokens, data.token])
          }

          if (data.response) {
            eventSource.close();
            const newDepthResponseData = {
              depth: depth_level,
              learningStyle: learningStyle,
              text: data?.response?.text,
            };
            setDepthResponse(prevDepthResponse => {
              const updatedDepthResponse = { ...prevDepthResponse };
              const topicResponses = updatedDepthResponse[topic];
              topicResponses[topicResponses.length - 1] = newDepthResponseData;
              return updatedDepthResponse;
            });
            setTokens([]);
            updateSubStack(stackId || id, subStackId, topic, newDepthResponseData);
          }
        };
        eventSource.onerror = function (error) {
          console.error("Error calling OpenAI API:", error);
          eventSource.close();
        };
      }
      else {
        const responseData = {
          title: topic,
          text: "",
          prompts: "",
        }
        setResponses((prevResponses) => [...prevResponses, responseData]);
        const url = `/api/learningContent?topic=${encodeURIComponent(topic)}`;
        const eventSource = new EventSource(url);
        eventSource.onmessage = async function (event) {
          const data = JSON.parse(event.data);
          if (data.token) {
            // Handle token data here
            setTokens((prevTokens) => [...prevTokens, data.token])
          }
          if (data.response) {
            eventSource.close();
            console.log(data.response, "response data")
            const responseData = {
              title: topic,
              text: data.response.content, // Assuming 'content' field in 'response'
              prompts: data.response.question, // Assuming 'question' field in 'response'
            }
            setResponses((prevResponses) => {
              const updatedResponses = [...prevResponses];
              const index = updatedResponses.slice().reverse().findIndex(response => response.title === topic);
              const realIndex = index >= 0 ? updatedResponses.length - 1 - index : index;

              if (realIndex > -1) {
                updatedResponses[realIndex] = {
                  ...updatedResponses[realIndex],
                  text: data.response.content,
                  prompts: data.response.question,
                };
              }

              return updatedResponses;
            });
            setTokens([])
            if (responses.length === 0) {
              const { stackId, subStackId } = await saveStackHistory(responseData);
              setStackId(stackId);
              setSubStackId(subStackId);
            } else {
              const subStackId = await saveSubStack(stackId || id, responseData);
              setSubStackId(subStackId)
            }
          }
        };
        eventSource.onerror = function (error) {
          console.error("Error calling OpenAI API:", error);
          console.log(error, "error")
          eventSource.close();
        };
      }
    } catch (error) {
      console.error("Error calling OpenAI API:", error);
    }
  };


  const handleLearnButtonClick = () => {
    setTokens([]);
    fetchResponse(inputText);
    setInputText('');
  };

  function handlePromptClick(prompt) {
    setTokens([]);
    const cleanedPrompt = prompt.replace(/^\d+\.\s*/, '');
    fetchResponse(cleanedPrompt);
  }


  const handleSavePrefernces = () => {
    setTokens([]);
    const depth_level = depth !== '' ? `Level_${depth}` : '';
    fetchResponse(topic, depth_level, learningStyle)
    handlePreferencesModalClose();
  }


  useEffect(() => {
    if (window.performance) {
      const navigationEntry = window.performance.getEntriesByType("navigation")[0];
      if (navigationEntry && navigationEntry.type === 'reload') {
        if (stackId && responses) {
          router.push(`/stacks/${stackId}`);
        }
      }
    }
  }, [stackId, responses, router]);

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

                {!response?.text &&
                  tokens.map((token, index) => {
                    if (token.endsWith('.\n\n') || token.endsWith(':\n\n')) {
                      return <span key={index} className={styles.token}>{token.slice(0, -2)}<br /><br /></span>
                    } else {
                      return (<span key={index} className={styles.token}>{token}</span>)
                    }
                  })}


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


                          {!responseDepth?.text &&
                            tokens.map((token, index) => {
                              if (token.endsWith('.\n\n') || token.endsWith(':\n\n')) {
                                return <span key={index} className={styles.token}>{token.slice(0, -2)}<br /><br /></span>
                              } else {
                                return (<span key={index} className={styles.token}>{token}</span>)
                              }
                            })}
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
                      console.log(response?.id, 'response?.id')
                      if (response?.id) {
                        setSubStackId(response?.id)
                      }
                      setPreferencesModalOpen(true)
                    }}
                  >
                    Learning Preference
                  </button>
                  <button onClick={() => setResourceModalOpen(true)} className={styles.powerUpBtn}>Explain Like I am 5</button>
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
    </div >
  );
};

export default InputPromptText;