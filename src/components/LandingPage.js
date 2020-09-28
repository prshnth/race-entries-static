import React from 'react';
import { withFirebase } from './Firebase';
import RegisterForClass from './RegisterForClass';
import ConfirmationForClass from './ConfirmationForClass';
import Paper from '@material-ui/core/Paper';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import CircularProgress from '@material-ui/core/CircularProgress';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import HowToReg from '@material-ui/icons/HowToReg';
import Register from '@material-ui/icons/GroupAdd';
import Assignment from '@material-ui/icons/Assignment';
import Snackbar from '@material-ui/core/Snackbar';
import { compose } from 'recompose';
import moment from 'moment';
import _ from 'lodash';

const withStyles = (Component) => (props) => {
  const useStyles = makeStyles((theme) => ({
    boxContainer: {
      flex: '1 1 auto',
      overflow: 'hidden',
      padding: theme.spacing(1, 2),
      margin: theme.spacing(1, 0),
      maxWidth: '600px',
      width: '100%',
      bgcolor: 'background.paper',
      m: 1,
      style: { width: '5rem', height: '5rem' },
      borderColor: 'text.primary',
    },
    container: {
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    paper: {
      margin: `${theme.spacing(2)}px auto`,
      padding: theme.spacing(2),
    },
    button: {
      margin: '5px',
    },
    successAlert: {
      '& > div': {
        background: theme.palette.success.dark,
      },
    },
  }));
  const classes = useStyles();
  return <Component {...props} classes={classes} />;
};

class LandingPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      shows: [],
      participants: [],
      loading: false,
      registerDialogOpen: false,
      confirmationDialogOpen: false,
      selectedShow: null,
      selectedClass: null,
      registerSuccessAlertOpen: false,
      error: null,
      isRegistering: false,
    };
  }
  componentDidMount() {
    this.setState({ ...this.state, loading: true });
    this.participantsListener = this.props.firebase.db
      .collection('participants')
      .where('participationDate', '>=', moment().format('YYYY-MM-DD'))
      .onSnapshot((snapshot) => {
        const participants = snapshot.docs.map((participant) => {
          return {
            ...participant.data(),
            id: participant.id,
          };
        });
        this.setState({ ...this.state, participants });
      });
    this.showsListener = this.props.firebase.db
      .collection('shows')
      .where('showDate', '>=', moment().format('YYYY-MM-DD'))
      .onSnapshot((snapshot) => {
        const shows = snapshot.docs.map((show) => {
          return {
            ...show.data(),
            id: show.id,
          };
        });
        this.setState({ ...this.state, shows, loading: false });
      });
  }

  componentWillUnmount() {
    this.participantsListener();
    this.showsListener();
  }

  onDialogClose(openedDialogType) {
    this.setState({
      ...this.state,
      [openedDialogType]: false,
      selectedShow: null,
      selectedClass: null,
    });
  }

  handleSuccessAlertClose() {
    this.setState({ ...this.state, registerSuccessAlertOpen: false });
  }

  onSubmitRegistration(participantInfo) {
    this.setState({ ...this.state, isRegistering: true });
    this.props.firebase.db
      .collection('participants')
      .add({
        ...participantInfo,
        participationDate: this.state.selectedShow.showDate,
        participatingShow: this.state.selectedShow.showName,
        participationShowId: this.state.selectedShow.id,
        participationClass: this.state.selectedClass.name,
      })
      .then(() => {
        this.setState({
          ...this.state,
          registerDialogOpen: false,
          isRegistering: false,
          registerSuccessAlertOpen: true,
        });
      })
      .catch((error) => {
        this.setState({
          ...this.state,
          error: error,
          isRegistering: false,
        });
      });
  }

  render() {
    if (this.state.loading) return <CircularProgress />;
    return this.state.shows && this.state.shows.length ? (
      <div className={this.props.classes.container}>
        <RegisterForClass
          open={this.state.registerDialogOpen}
          handleRegisterDialogClose={() =>
            this.onDialogClose('registerDialogOpen')
          }
          submitRegistration={(participantInfo) =>
            this.onSubmitRegistration(participantInfo)
          }
          selectedClass={this.state.selectedClass}
          isRegistering={this.state.isRegistering}
        />
        <ConfirmationForClass
          handleConfirmationDialogClose={() =>
            this.onDialogClose('confirmationDialogOpen')
          }
          participants={this.state.participants}
          selectedShow={this.state.selectedShow}
          selectedClass={this.state.selectedClass}
          open={this.state.confirmationDialogOpen}
        />
        <Snackbar
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          autoHideDuration={2000}
          open={this.state.registerSuccessAlertOpen}
          onClose={() => this.handleSuccessAlertClose()}
          message='Registration Successful!'
          key='registrationSuccess'
          className={this.props.classes.successAlert}
        />
        {this.state.shows
          .sort((firstShow, secondShow) =>
            moment(firstShow.showDate).isBefore(secondShow.showDate) ? -1 : 1
          )
          .map((show, index) => (
            <Box
              border={1}
              boxSizing='border-box'
              key={index}
              borderRadius={12}
              borderColor='grey.400'
              className={this.props.classes.boxContainer}
            >
              <Typography noWrap variant='h6' display='inline' color='primary'>
                {moment(show.showDate, 'YYYY-MM-DD').format(
                  'dddd, MMMM Do YYYY'
                )}
              </Typography>
              {show.classes &&
              show.availableClasses &&
              show.availableClasses.length ? (
                show.classes
                  .filter((listedClass) =>
                    show.availableClasses.includes(listedClass.name)
                  )
                  .map((eachClass, classIndex) => (
                    <Paper
                      className={this.props.classes.paper}
                      elevation={6}
                      key={classIndex}
                    >
                      <Grid container wrap='nowrap' spacing={2}>
                        <Grid item>
                          <Typography
                            variant='subtitle2'
                            color='textSecondary'
                            noWrap
                          >
                            {eachClass.name}
                          </Typography>
                          <Button
                            variant='outlined'
                            size='small'
                            color='primary'
                            className={this.props.classes.button}
                            onClick={() =>
                              this.setState({
                                ...this.state,
                                registerDialogOpen: true,
                                selectedShow: show,
                                selectedClass: eachClass,
                              })
                            }
                            startIcon={<Register />}
                          >
                            Enter
                          </Button>
                          <Button
                            variant='outlined'
                            size='small'
                            color='primary'
                            className={this.props.classes.button}
                            onClick={() =>
                              this.setState({
                                ...this.state,
                                confirmationDialogOpen: true,
                                selectedShow: show,
                                selectedClass: eachClass,
                              })
                            }
                            startIcon={
                              _.isEmpty(show.draw[eachClass.id]) ? (
                                <HowToReg />
                              ) : (
                                <Assignment />
                              )
                            }
                          >
                            {_.isEmpty(show.draw[eachClass.id])
                              ? 'Confirmed'
                              : 'Draw'}
                          </Button>
                        </Grid>
                      </Grid>
                    </Paper>
                  ))
              ) : (
                <Typography noWrap variant='subtitle1' color='textSecondary'>
                  There are no classes available for this Show.
                </Typography>
              )}
            </Box>
          ))}
      </div>
    ) : (
      <Typography noWrap display='inline' color='primary'>
        There are no shows available currently.
      </Typography>
    );
  }
}

export default compose(withStyles, withFirebase)(LandingPage);
