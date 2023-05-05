import React from 'react';
import styles from '../styles/PreferencesForm.module.css';
import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import TextField from '@mui/material/TextField';


const PreferencesForm = ({ depth, setDepth, learningStyle, setLearningStyle}) => {
  // State for custom learning method
  const [customLearningMethod, setCustomLearningMethod] = React.useState('');

  const handleCustomLearningMethodChange = (event) => {
    setCustomLearningMethod(event.target.value);
  };

  const handleDepthChange = (event, newValue) => {
    setDepth(newValue);
  };

  const handleLearningStyleChange = (event) => {
    setLearningStyle(event.target.value);
  };

  const learningStylesDescriptions = {
    textbook: "Adopts textbook-style language with well-structured sentences and rich vocabulary.",
    layman: "Simplifies complex ideas with everyday language and relatable examples.",
    storyTelling: "Utilizes narratives and anecdotes to make ideas engaging and memorable.",
    socratic: "Stimulates curiosity through thought-provoking questions and self-directed learning.",
    analogical: "Fosters deep understanding by comparing similarities between concepts.",
    humorous: "Infuses wit and light-hearted elements for enjoyable, engaging content."
  };


  return (
    <div className={styles.formContainer}>
      <div className={styles.preferenceSection}>
        <h4 style={{ marginBottom: "10px" }}>Depth</h4>
        <Typography variant="body2">
          The desired learning depth ranges from elementary to advanced content. A lower depth, such as Level 1, covers fundamental ideas and generalizations, while a higher depth, like Level 10, addresses precise details, complexities, and unique scenarios related to the subject matter.
        </Typography>
        <div className={styles.sliderContainer}>
          <Slider
            value={depth}
            min={1}
            max={5}
            step={1}
            marks
            onChange={handleDepthChange}
            valueLabelDisplay="auto"
          />
        </div>
      </div>
      <div className={styles.preferenceSection}>
        <h4 style={{ marginBottom: "10px" }}>Learning Styles</h4>
        <RadioGroup
          value={learningStyle}
          onChange={handleLearningStyleChange}
          className={styles.radioGroup}
        >
          {Object.entries(learningStylesDescriptions).map(([style, description]) => (
            <FormControlLabel
              key={style}
              value={style}
              control={<Radio />}
              label={`${style} : ${description}`}
            />
          ))}
        </RadioGroup>
      </div>
      <div className={styles.preferenceSection}>
        <h4 style={{ marginBottom: "20px" }}>Custom Learning Method</h4>
        <TextField
          label="Describe your preferred learning method"
          multiline
          rows={4}
          value={customLearningMethod}
          onChange={handleCustomLearningMethodChange}
          variant="outlined"
          fullWidth
        />
      </div>
    </div>
  );
};

export default PreferencesForm;
