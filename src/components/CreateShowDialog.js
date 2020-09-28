import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import FormControl from '@material-ui/core/FormControl';
import FormGroup from '@material-ui/core/FormGroup';
import FormLabel from '@material-ui/core/FormLabel';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import CircularProgress from '@material-ui/core/CircularProgress';
import PlusOneIcon from '@material-ui/icons/PlusOne';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import DateFnsUtils from '@date-io/date-fns';
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from '@material-ui/pickers';
import _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';

export default function CreateShowDialog(props) {
  const useStyles = makeStyles((theme) => ({
    classBox: {
      padding: theme.spacing(1, 2),
      margin: theme.spacing(1, 0),
    },
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
    showTypeWrapper: {
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 10,
    },
    deleteIcon: {
      marginLeft: 'auto',
      padding: 0,
    },
  }));

  const styleClasses = useStyles();
  const initialState = () => {
    return {
      showName: '',
      showDate: new Date(),
      classes: [{ name: '', id: uuidv4(), hasSeniorWorldTour: false }],
      availableClasses: [],
      draw: {},
    };
  };

  const onDialogClose = () => {
    setState(initialState());
    setCustomShow(false);
    setStandardShowName('');
    props.handleCreateShowDialogClose();
  };

  const [state, setState] = React.useState(initialState());
  const [selectedStandardShowName, setStandardShowName] = React.useState('');
  const [isCustomShowSelected, setCustomShow] = React.useState(false);

  const onStandardShowSelect = (name) => {
    const {
      showName,
      classes,
      availableClasses,
      draw,
    } = _.find(props.standardShows, { showName: name });
    setState({
      showName,
      classes: _.map(classes, (eachClass) => ({ ...eachClass, id: uuidv4() })),
      showDate: new Date(),
      draw,
      availableClasses,
    });
    setStandardShowName(name);
    setCustomShow(false);
  };

  const onCustomShowSelect = () => {
    setState(initialState());
    setCustomShow(true);
    setStandardShowName('');
  };

  const updateClass = (e, id) => {
    const value =
      e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    let classes = _.map(state.classes, (eachClass) => {
      if (eachClass.id === id) {
        return { ...eachClass, [e.target.name]: value };
      }
      return eachClass;
    });
    setState({ ...state, classes });
  };

  const updateField = (e) => {
    const stateKey = e.target ? e.target.name : 'showDate';
    const stateValue = e.target ? e.target.value : e;
    setState({
      ...state,
      [stateKey]: stateValue,
    });
  };

  const onAddNewClass = () => {
    setState({
      ...state,
      classes: [
        ...state.classes,
        { name: '', id: uuidv4(), hasSeniorWorldTour: false },
      ],
    });
  };

  const onDeleteClass = (id) => {
    setState({
      ...state,
      classes: _.filter(state.classes, (eachClass) => eachClass.id !== id),
    });
  };

  const isFormInvalid =
    state.showName === '' ||
    state.showDate === '' ||
    _.some(state.classes, (eachClass) => eachClass.name === '');

  return (
    <Dialog
      open={props.open}
      onClose={onDialogClose}
      onExited={onDialogClose}
      maxWidth='sm'
      aria-labelledby='form-dialog-title'
    >
      <DialogTitle id='form-dialog-title'>Create a New Show</DialogTitle>
      <DialogContent dividers>
        <DialogContentText>
          Please select a Show with Standard Classes or create a Custom Show
        </DialogContentText>
        {props.error && (
          <Typography variant='subtitle1' display='inline' color='error'>
            {props.error}
          </Typography>
        )}
        <div className={styleClasses.showTypeWrapper}>
          <FormControl variant='outlined' margin='dense'>
            <Select
              labelId='standard-show-label'
              id='show-list-select'
              displayEmpty
              value={selectedStandardShowName}
              name='standardShow'
              onChange={(e) => onStandardShowSelect(e.target.value)}
            >
              <MenuItem value='' disabled>
                Select a Show
              </MenuItem>
              {_.map(props.standardShows, (standardShow) => {
                return (
                  <MenuItem
                    key={standardShow.showName}
                    value={standardShow.showName}
                  >
                    {standardShow.showName}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
          <Button
            variant='contained'
            size='medium'
            onClick={() => onCustomShowSelect()}
            color='primary'
          >
            Create Custom Show
          </Button>
        </div>
        {!!selectedStandardShowName || isCustomShowSelected ? (
          <div>
            <TextField
              autoFocus
              required
              margin='dense'
              id='showName'
              label='Show Name'
              type='text'
              variant='outlined'
              fullWidth
              name='showName'
              value={state.showName}
              onChange={updateField}
            />
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
              <KeyboardDatePicker
                autoOk
                disablePast
                required
                inputVariant='outlined'
                margin='dense'
                fullWidth
                id='date-picker-dialog'
                label='Show Date'
                format='MM/dd/yyyy'
                value={state.showDate}
                name='showDate'
                InputAdornmentProps={{ position: 'start' }}
                onChange={updateField}
                KeyboardButtonProps={{
                  'aria-label': 'change date',
                }}
              />
            </MuiPickersUtilsProvider>
            {_.map(state.classes, (showClass, classIndex) => {
              return (
                <Box
                  key={classIndex}
                  display='flex'
                  flexDirection='column'
                  border={1}
                  boxSizing='border-box'
                  borderRadius={4}
                  borderColor='grey.400'
                  className={styleClasses.classBox}
                >
                  <TextField
                    required
                    margin='dense'
                    id={`className.${classIndex}`}
                    label='Class Name'
                    type='text'
                    variant='outlined'
                    fullWidth
                    name='name'
                    value={showClass.name}
                    onChange={(e) => updateClass(e, showClass.id)}
                  />
                  <FormControl component='fieldset' margin='dense'>
                    <FormLabel component='legend'>
                      Senior World Tour Eligible?
                    </FormLabel>
                    <FormGroup aria-label='position' row>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={showClass.hasSeniorWorldTour}
                            onChange={(e) => updateClass(e, showClass.id)}
                            color='primary'
                            name='hasSeniorWorldTour'
                          />
                        }
                        label='Yes'
                        labelPlacement='end'
                      />
                    </FormGroup>
                  </FormControl>
                  {state.classes.length > 1 ? (
                    <IconButton
                      aria-label='delete-class'
                      color='secondary'
                      onClick={() => onDeleteClass(showClass.id)}
                      className={styleClasses.deleteIcon}
                    >
                      <DeleteIcon />
                    </IconButton>
                  ) : null}
                </Box>
              );
            })}
            <Button
              variant='outlined'
              size='medium'
              color='primary'
              onClick={onAddNewClass}
              startIcon={<PlusOneIcon />}
            >
              Add another Class
            </Button>
          </div>
        ) : null}
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
        <div className={styleClasses.wrapper}>
          <Button
            variant='contained'
            size='small'
            onClick={() => props.onCreateShowSubmit(state)}
            color='primary'
            disabled={isFormInvalid || props.isShowCreating}
          >
            Submit
          </Button>
          {props.isShowCreating && (
            <CircularProgress
              size={24}
              className={styleClasses.buttonProgress}
            />
          )}
        </div>
      </DialogActions>
    </Dialog>
  );
}
