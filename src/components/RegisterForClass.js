import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormControl from '@material-ui/core/FormControl';
import FormGroup from '@material-ui/core/FormGroup';
import FormLabel from '@material-ui/core/FormLabel';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import CircularProgress from '@material-ui/core/CircularProgress';

export default function RegisterForClass(props) {
  const useStyles = makeStyles((theme) => ({
    wrapper: {
      margin: theme.spacing(1),
      position: 'relative',
    },
    buttonProgress: {
      color: theme.palette.success.light,
      position: 'absolute',
      top: '50%',
      left: '50%',
      marginTop: -12,
      marginLeft: -12,
    },
  }));

  const classes = useStyles();

  const initialState = () => {
    return {
      horseName: '',
      ownerName: '',
      riderName: '',
      selectedSeniorWorldTour: false,
    };
  };
  const onDialogClose = () => {
    setState(initialState());
    props.handleRegisterDialogClose();
  };

  const [state, setState] = React.useState(initialState());
  const updateField = (e) => {
    const value =
      e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setState({
      ...state,
      [e.target.name]: value,
    });
  };

  const isFormInvalid =
    state.horseName === '' || state.ownerName === '' || state.riderName === '';

  return (
    <Dialog
      open={props.open}
      onClose={onDialogClose}
      onExited={onDialogClose}
      maxWidth='sm'
      aria-labelledby='form-dialog-title'
    >
      <DialogTitle id='form-dialog-title'>Register for a Class</DialogTitle>
      <DialogContent dividers>
        <DialogContentText>Please fill out below information</DialogContentText>
        <TextField
          autoFocus
          required
          margin='dense'
          id='horseName'
          label='Horse Name'
          type='text'
          variant='outlined'
          fullWidth
          name='horseName'
          value={state.horseName}
          onChange={updateField}
        />

        <TextField
          required
          margin='dense'
          id='ownerName'
          label='Owner Name'
          type='text'
          variant='outlined'
          fullWidth
          name='ownerName'
          value={state.ownerName}
          onChange={updateField}
        />
        <TextField
          required
          margin='dense'
          id='riderName'
          label='Rider Name'
          type='text'
          variant='outlined'
          fullWidth
          name='riderName'
          value={state.riderName}
          onChange={updateField}
        />
        {props.selectedClass && props.selectedClass.hasSeniorWorldTour && (
          <FormControl component='fieldset' margin='dense'>
            <FormLabel component='legend'>Senior World Tour?</FormLabel>
            <FormGroup aria-label='position' row>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={state.selectedSeniorWorldTour}
                    onChange={updateField}
                    color='primary'
                    name='selectedSeniorWorldTour'
                  />
                }
                label='Yes'
                labelPlacement='end'
              />
            </FormGroup>
          </FormControl>
        )}
      </DialogContent>
      <DialogActions>
        <Button
          variant='contained'
          size='small'
          onClick={onDialogClose}
          color='primary'
        >
          Cancel
        </Button>
        <div className={classes.wrapper}>
          <Button
            variant='contained'
            size='small'
            onClick={() => props.submitRegistration(state)}
            color='primary'
            disabled={isFormInvalid || props.isRegistering}
          >
            Register
          </Button>
          {props.isRegistering && (
            <CircularProgress size={24} className={classes.buttonProgress} />
          )}
        </div>
      </DialogActions>
    </Dialog>
  );
}
