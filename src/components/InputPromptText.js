import React, { useState, useEffect, useRef } from 'react';
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
import MyPlanModal from './MyPlanModal';
import { saveStackHistory, saveSubStack, updateSubStack } from '@/utils/firebase';
import { useRouter } from 'next/router'
import { auth, checkUserResponseCount } from '@/utils/firebase'
import Loading from './Loading';
import CircularProgress from '@mui/material/CircularProgress';
import { useSubscription } from '@/context/subscriptionContext';


const InputPromptText = ({ responses, setResponses, isResponseLoading, depthResponse, setDepthResponse, id }) => {
  const [uid, setUid] = useState('');
  const { subscriber, productName } = useSubscription();
  const [inputText, setInputText] = useState('');
  const [tokens, setTokens] = useState([])
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('You have exhausted your free 20 responses. Please upgrade to continue learning.')
  const [preferencesModalOpen, setPreferencesModalOpen] = useState(false);
  const [resourceModalOpen, setResourceModalOpen] = useState(false);
  const [topic, setTopic] = React.useState('');
  const [stackId, setStackId] = useState();
  const [subStackId, setSubStackId] = useState();
  const router = useRouter()
  const messagesEndRef = useRef(null);
  const [clickedPrompts, setClickedPrompts] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [depth, setDepth] = React.useState(1);
  // State for learning styles
  const [learningStyle, setLearningStyle] = React.useState('Textbook');
  const topics = ['Solar System', 'Biotechnology', 'Quantum Mechanics', 'Indus Valley Civilization', 'AC machines', 'DC Machines', 'Laws of Motion', 'CUDA', 'Calculus'];
  const mobileTopics = ['Solar System', 'Biotechnoloy', 'Quantum Mechanics', 'Robotics', 'AC machines', 'DC Machines', 'Indus Valley Civilization', 'CUDA']
  const [isDesktop, setIsDesktop] = useState(window.innerWidth > 768);
  const [responseCount, setResponseCount] = useState()

  const updateMedia = () => {
    setIsDesktop(window.innerWidth > 950);
  };

  useEffect(() => {
    window.addEventListener("resize", updateMedia);
    return () => window.removeEventListener("resize", updateMedia);
  }, []);


  // Close the preferences modal
  const handlePreferencesModalClose = () => {
    setPreferencesModalOpen(false);
  };

  const handleResourceModalClose = () => {
    setResourceModalOpen(false);
  };

  const handleModalOpen = () => {
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
  };

  const handleInputChange = (event) => {
    setInputText(event.target.value);
  };

  // useEffect(() => {
  //   if (!subscriber) {
  //     checkUserResponseCount().then((userStatus) => {
  //       setResponseCount(userStatus.responseCount);
  //     });
  //   }

  // }, [responses, depthResponse])


  const fetchResponse = async (topic, depth_level) => {

    // If fetchResponse is in progress, we do not start another one
    if (isFetching) {
      return;
    }

    setIsFetching(true);

    // if (!subscriber) {
    //   const userStatus = await checkUserResponseCount()

    //   if (!userStatus.subscriber && userStatus.responseCount <= 0) {
    //     handleModalOpen()
    //     setIsFetching(false);
    //     return
    //   }
    // }

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

        const url = ` https://learningcontent-h2i33bupla-uc.a.run.app?topic=${encodeURIComponent(topic)}&depth_level=${encodeURIComponent(depth_level)}&learningStyle=${encodeURIComponent(learningStyle)}&uid=${encodeURIComponent(uid)}`;
        // const url = `/api/learningContent?topic=${encodeURIComponent(topic)}&depth_level=${encodeURIComponent(depth_level)}&learningStyle=${encodeURIComponent(learningStyle)}`;

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
            updateSubStack(uid, stackId || id, subStackId, topic, newDepthResponseData);
            setIsFetching(false);
          }
        };
        eventSource.onerror = function (error) {
          console.error("Error calling OpenAI API:", error);
          eventSource.close();
          setIsFetching(false);
        };
      }
      else {
        const responseData = {
          title: topic,
          text: "",
          prompts: "",
        }
        setResponses((prevResponses) => [...prevResponses, responseData]);
        const url = ` https://learningcontent-h2i33bupla-uc.a.run.app?topic=${encodeURIComponent(topic)}&uid=${encodeURIComponent(uid)}`;
        // const url = `/api/learningContent?topic=${encodeURIComponent(topic)}`;
        const eventSource = new EventSource(url);
        eventSource.onmessage = async function (event) {
          const data = JSON.parse(event.data);
          if (data.token) {
            // Handle token data here
            setTokens((prevTokens) => [...prevTokens, data.token])
          }
          if (data.response) {
            eventSource.close();
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
              const { stackId, subStackId } = await saveStackHistory(uid, responseData);
              setStackId(stackId);
              setSubStackId(subStackId);
            } else {
              const subStackId = await saveSubStack(uid, stackId || id, responseData);
              setSubStackId(subStackId)
            }
            setIsFetching(false);
          }
        };
        eventSource.onerror = function (error) {
          console.error("Error calling OpenAI API:", error);
          console.log(error, "error")
          eventSource.close();
          setIsFetching(false);
        };
      }
    } catch (error) {
      console.error("Error calling OpenAI API:", error);
      setIsFetching(false);
    }
  };


  const handleLearnButtonClick = () => {
    setTokens([]);
    fetchResponse(inputText);
    setInputText('');
  };

  const handleTopicBlockClick = (topic) => {
    fetchResponse(topic);
  }

  function handlePromptClick(prompt) {
    setTokens([]);
    setClickedPrompts((prev) => [...prev, prompt]);
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
    if (stackId && responses) {
      router.push(`/stacks/${stackId}`);
    }
  }, [stackId, responses[0], router]);

  useEffect(() => {
    if (auth.currentUser) {
      setUid(auth.currentUser.uid);
    }
  }, [auth.currentUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [responses]);


  if (isResponseLoading) {
    return (
      <Loading />
    )
  }

  // Render topics when response array is empty
  if (isDesktop && (!responses || responses.length === 0)) {
    return (
      <>
        <Typography variant="h5" style={{ marginBottom: "15px" }}>Learn about any topic</Typography>
        <div className={styles.topicBlocks}>
          {topics.map((topic, index) => (
            <button key={index} className={styles.topicBlock} onClick={() => handleTopicBlockClick(topic)}>
              {topic}
            </button>
          ))}
        </div>
        <div className={styles.container}>
          <input
            className={styles.inputField}
            type="text"
            placeholder={responses.length === 0 ? "What do you want to learn?" : ""}
            value={inputText}
            onChange={handleInputChange}
          />
          <button className={styles.learnButton}
            onClick={handleLearnButtonClick}
            disabled={(inputText === "" ? true : false) || isFetching}
          >
            <SendIcon style={{ color: isFetching || inputText === "" ? 'grey' : 'white' }} />
          </button>
          {/* {!subscriber && <Typography style={{ marginLeft: "10px" }} >{responseCount}</Typography>} */}
        </div>
        <MyPlanModal open={modalOpen} handleClose={handleModalClose} modalMessage={modalMessage} />
      </>
    );
  }

  if (!isDesktop && (!responses || responses.length === 0)) {
    return (
      <div className={styles.mobileWrapper}>
        <div className={styles.responsiveTypography}>
          <Typography variant="h5">Learn about any topic</Typography>
        </div>
        <div className={styles.topicBlocks}>
          {mobileTopics.map((topic, index) => (
            <button key={index} className={styles.topicBlock} onClick={() => handleTopicBlockClick(topic)}>
              {topic}
            </button>
          ))}
        </div>
        <div className={styles.container}>
          <input
            className={styles.inputField}
            type="text"
            placeholder={responses.length === 0 ? "What do you want to learn?" : ""}
            value={inputText}
            onChange={handleInputChange}
          />
          <button className={styles.learnButton}
            onClick={handleLearnButtonClick}
            disabled={(inputText === "" ? true : false) || isFetching}
          >
            <SendIcon style={{ color: isFetching || inputText === "" ? 'grey' : 'white' }} />
          </button>
          {/* {!subscriber && <Typography style={{ marginLeft: "10px" }} >{responseCount}</Typography>} */}
        </div>
        <MyPlanModal open={modalOpen} handleClose={handleModalClose} modalMessage={modalMessage} />
      </div>
    );
  }


  return (
    <div className={styles.wrapper}>
      {
        responses?.length != 0 &&
        <div className={styles.responseArea}>
          {responses?.map((response, index) => {
            const textLines = response?.text?.split(/\r?\n/);
            const promptList = response?.prompts?.split(/\r?\n{1,}/)
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

                {!response?.text
                  && (!tokens || tokens?.length === 0)
                  &&
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <CircularProgress color="inherit" size={24} />
                  </div>}

                {!response?.text &&
                  tokens.map((token, index) => {
                    if (token.endsWith('.\n\n') || token.endsWith(':\n\n') || token.endsWith('\n\n')) {
                      return <span key={index} className={styles.token}>{token.slice(0, -2)}<br /><br /></span>
                    } else if (token.endsWith('\n')) {
                      return <span key={index} className={styles.token}>{token.slice(0, -1)}<br /></span>
                    }
                    else {
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
                    disabled={isFetching}
                    onClick={() => {
                      setTopic(response.title);
                      if (response?.id) {
                        setSubStackId(response?.id)
                      }
                      setPreferencesModalOpen(true)
                    }}
                  >
                    Learning Preference
                  </button>
                  {/* <button onClick={() => setResourceModalOpen(true)} className={styles.powerUpBtn}>Explain Like I am 5</button> */}
                </div>
                <div className={styles.promptSuggestions}>
                  <div className={styles.promptSuggestionsTitle}>Deep Dive:</div>
                  {promptList?.map((prompt, idx) => (
                    <button
                      key={idx}
                      className={styles.clickableItem}
                      onClick={() => handlePromptClick(prompt)}
                      disabled={isFetching || clickedPrompts.includes(prompt)}
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      }
      <div className={styles.container}>
        <input
          className={styles.inputField}
          type="text"
          placeholder={responses.length === 0 ? "What do you want to learn?" : ""}
          value={inputText}
          onChange={handleInputChange}
        />
        <button className={styles.learnButton}
          onClick={handleLearnButtonClick}
          disabled={(inputText === "" ? true : false) || isFetching}
        >
          <SendIcon style={{ color: isFetching || inputText === "" ? 'grey' : 'white' }} />
        </button>
        {/* {!subscriber && <Typography style={{ marginLeft: "10px" }} >{responseCount}</Typography>} */}
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
      <MyPlanModal open={modalOpen} handleClose={handleModalClose} modalMessage={modalMessage} />
    </div >
  );
};

export default InputPromptText;