import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  Slide,
  Typography,
} from '@mui/material';
import { useTheme, styled } from '@mui/system';
import useMediaQuery from '@mui/material/useMediaQuery';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const ComingSoonModal = ({ open, handleClose }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Dialog
      // fullScreen={fullScreen}
      open={open}
      onClose={handleClose}
      TransitionComponent={Transition}
      keepMounted
    >
      <Typography variant='h4' align='center' style={{ padding: "15px", fontWeight: "bold", color: "blue" }}>Coming Soon</Typography>
      <DialogContent>
        <Typography>
          We are diligently striving to enhance our platform with new features that will further support and elevate your self-learning experience. The Progress Report feature is currently under development and will be accessible in the near future. We appreciate your patience and understanding as we work towards delivering this valuable functionality.
        </Typography>
      </DialogContent>
    </Dialog>
  );
};

export default ComingSoonModal;
