import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Snackbar from '@material-ui/core/Snackbar';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';

export default function AccountSettingsDialog({
  open,
  firebase,
  handleAccountSettingsDialogClose,
}) {
  const useStyles = makeStyles((theme) => ({
    boxContainer: {
      display: 'flex',
      alignItems: 'center',
      margin: theme.spacing(2, 0),
    },
    passwordButton: {
      marginLeft: '10px',
    },
    successAlert: {
      '& > div': {
        background: theme.palette.success.dark,
      },
    },
  }));

  const classes = useStyles();
  const initialState = () => {
    return {
      password: '',
      error: null,
      showSuccessAlertOpen: false,
      successMessage: '',
    };
  };

  const [state, setState] = React.useState(initialState());

  const resetPassword = () => {
    const user = firebase.auth.currentUser;
    user
      .updatePassword(state.password)
      .then(() => {
        setState({
          ...state,
          showSuccessAlertOpen: true,
          successMessage: 'Password Reset Successful!',
        });
        handleAccountSettingsDialogClose();
      })
      .catch((error) => {
        setState({ ...state, error: error.message });
      });
  };

  const resendEmailVerification = () => {
    const user = firebase.auth.currentUser;
    user
      .sendEmailVerification()
      .then(() => {
        setState({
          ...state,
          showSuccessAlertOpen: true,
          successMessage: 'Email sent!',
        });
        handleAccountSettingsDialogClose();
      })
      .catch((error) => {
        setState({ ...state, error: error.message });
      });
  };

  return (
    <React.Fragment>
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        autoHideDuration={2000}
        open={state.showSuccessAlertOpen}
        onClose={() => setState({ ...state, showSuccessAlertOpen: false })}
        message={state.successMessage}
        key='showCreationSuccess'
        className={classes.successAlert}
      />
      <Dialog
        open={open}
        onClose={() => {
          setState(initialState());
          handleAccountSettingsDialogClose();
        }}
        onExited={() => {
          setState(initialState());
          handleAccountSettingsDialogClose();
        }}
        maxWidth='sm'
        aria-labelledby='form-dialog-title'
      >
        <DialogTitle id='form-dialog-title'>Account Settings</DialogTitle>
        <DialogContent dividers>
          {state.error && (
            <Typography variant='subtitle1' display='inline' color='error'>
              {state.error}
            </Typography>
          )}
          <Box boxSizing='border-box' className={classes.boxContainer}>
            <TextField
              size='small'
              required
              id='password'
              name='password'
              type='password'
              label='Password'
              variant='outlined'
              value={state.password}
              onChange={(event) =>
                setState({ ...state, password: event.target.value })
              }
            />
            <Button
              variant='contained'
              size='large'
              onClick={resetPassword}
              color='primary'
              className={classes.passwordButton}
              disabled={state.password === ''}
            >
              Reset
            </Button>
          </Box>

          <Button
            variant='outlined'
            size='medium'
            color='primary'
            onClick={resendEmailVerification}
          >
            Send Verification Email
          </Button>
        </DialogContent>
        <DialogActions>
          <Button
            variant='contained'
            size='small'
            onClick={() => {
              setState(initialState());
              handleAccountSettingsDialogClose();
            }}
            color='primary'
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
