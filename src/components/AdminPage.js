import React from 'react';
import { withFirebase } from './Firebase';
import { withAuthorization } from './Session';
import { LOGIN as loginRoute } from '../constants/routes';
import moment from 'moment';
import Fab from '@material-ui/core/Fab';
import CircularProgress from '@material-ui/core/CircularProgress';
import AddIcon from '@material-ui/icons/Add';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Assignment from '@material-ui/icons/Assignment';
import SettingsIcon from '@material-ui/icons/Settings';
import Snackbar from '@material-ui/core/Snackbar';
import { makeStyles } from '@material-ui/core/styles';
import PanToolIcon from '@material-ui/icons/PanTool';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import Register from '@material-ui/icons/GroupAdd';
import { compose } from 'recompose';
import CreateShowDialog from './CreateShowDialog';
import AccountSettingsDialog from './AccountSettingsDialog';
import ConfirmationForClass from './ConfirmationForClass';
import RegisterForClass from './RegisterForClass';
import _ from 'lodash';

const withStyles = (Component) => (props) => {
  const useStyles = makeStyles((theme) => ({
    container: {
      maxWidth: '600px',
    },
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
    paper: {
      margin: `${theme.spacing(2)}px auto`,
      padding: theme.spacing(2),
    },
    button: {
      margin: '5px',
    },
    fab: {
      margin: theme.spacing(0, 2, 2, 0),
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

const ShowList = ({
  show,
  classes,
  firebase,
  isPrevious,
  setSelectedClassState,
  onRegisterClick,
}) => {
  const setClassState = (show, selectedClass) => {
    const operationType = _.includes(show.availableClasses, selectedClass.name)
      ? 'Remove'
      : 'Union';
    const showRef = firebase.db.collection('shows').doc(show.id);
    showRef.update({
      availableClasses: firebase.fieldValue[`array${operationType}`](
        selectedClass.name
      ),
    });
  };
  return (
    <Box
      border={1}
      boxSizing='border-box'
      borderRadius={12}
      borderColor='grey.400'
      className={classes.boxContainer}
    >
      <Typography noWrap variant='h6' display='inline' color='primary'>
        {moment(show.showDate, 'YYYY-MM-DD').format('dddd, MMMM Do YYYY')}
      </Typography>
      {show.classes
        ? show.classes.map((eachClass, classIndex) => (
            <Paper className={classes.paper} elevation={6} key={classIndex}>
              <Grid container wrap='nowrap' spacing={2}>
                <Grid item>
                  <Typography variant='subtitle2' color='textSecondary' noWrap>
                    {eachClass.name}
                  </Typography>
                  <Button
                    variant='outlined'
                    size='small'
                    color='primary'
                    className={classes.button}
                    onClick={() => onRegisterClick(eachClass)}
                    startIcon={<Register />}
                  >
                    Enter
                  </Button>
                  <Button
                    variant='outlined'
                    color='primary'
                    size='small'
                    className={classes.button}
                    startIcon={<Assignment />}
                    onClick={() => setSelectedClassState(show, eachClass)}
                  >
                    Draw
                  </Button>
                  {!isPrevious && (
                    <Button
                      variant='outlined'
                      color='primary'
                      size='small'
                      className={classes.button}
                      onClick={() => setClassState(show, eachClass)}
                      startIcon={
                        _.includes(show.availableClasses, eachClass.name) ? (
                          <PanToolIcon />
                        ) : (
                          <PlayArrowIcon />
                        )
                      }
                    >
                      {_.includes(show.availableClasses, eachClass.name)
                        ? 'Stop'
                        : 'Start'}
                    </Button>
                  )}
                </Grid>
              </Grid>
            </Paper>
          ))
        : null}
    </Box>
  );
};

class AdminPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      shows: [],
      standardShows: [],
      participants: [],
      createShowDialogOpen: false,
      showSuccessAlertOpen: false,
      accountSettingsDialog: false,
      registerDialogOpen: false,
      isShowCreating: false,
      drawDialogOpen: false,
      selectedShow: null,
      selectedClass: null,
      isSortLoading: false,
      isRegistering: false,
      successToastMessage: '',
    };
  }
  componentDidMount() {
    this.setState({ ...this.state, loading: true });
    this.participantsListener = this.props.firebase.db
      .collection('participants')
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
      .onSnapshot((snapshot) => {
        const shows = snapshot.docs.map((show) => {
          return {
            ...show.data(),
            id: show.id,
          };
        });
        this.setState({ ...this.state, shows, loading: false });
      });
    this.standardShowsListener = this.props.firebase.db
      .collection('standardShows')
      .onSnapshot((snapshot) => {
        const standardShows = snapshot.docs.map((show) => {
          return {
            ...show.data(),
          };
        });
        this.setState({ ...this.state, standardShows });
      });
  }

  componentWillUnmount() {
    this.participantsListener();
    this.showsListener();
    this.standardShowsListener();
  }

  onDialogClose(openedDialogType) {
    this.setState({
      ...this.state,
      error: '',
      [openedDialogType]: false,
      selectedShow: null,
      selectedClass: null,
    });
  }

  onSubmitCreateNewShow(showInfo) {
    let newShow = { ...showInfo };
    newShow.availableClasses = _.map(showInfo.classes, 'name');
    newShow.showDate = moment(showInfo.showDate).format('YYYY-MM-DD');
    this.setState({
      ...this.state,
      isShowCreating: true,
    });
    this.props.firebase.db
      .collection('shows')
      .add(newShow)
      .then(() => {
        this.setState({
          ...this.state,
          createShowDialogOpen: false,
          isShowCreating: false,
          showSuccessAlertOpen: true,
          successToastMessage: 'New Show Created!',
        });
      })
      .catch((error) => {
        this.setState({
          ...this.state,
          isShowCreating: false,
          error: error.message,
        });
      });
  }

  getAvailableShows() {
    return this.state.shows
      .filter((show) =>
        moment(show.showDate, 'YYYY-MM-DD').isSameOrAfter(
          moment().format('YYYY-MM-DD')
        )
      )
      .sort((firstShow, secondShow) =>
        moment(firstShow.showDate).isBefore(secondShow.showDate) ? -1 : 1
      );
  }

  getPreviousShows() {
    return this.state.shows
      .filter((show) =>
        moment(show.showDate, 'YYYY-MM-DD').isBefore(
          moment().format('YYYY-MM-DD')
        )
      )
      .sort((firstShow, secondShow) =>
        moment(firstShow.showDate).isBefore(secondShow.showDate) ? -1 : 1
      );
  }

  handleSuccessAlertClose() {
    this.setState({ ...this.state, showSuccessAlertOpen: false });
  }

  setSelectedClassState(show, eachClass) {
    this.setState({
      ...this.state,
      participants: _.sortBy(
        this.state.participants,
        (participant) => show.draw[participant.id]
      ),
      drawDialogOpen: true,
      selectedShow: show,
      selectedClass: eachClass,
    });
  }

  setDrawOrder(order, participantId) {
    this.setState({
      ...this.state,
      selectedShow: {
        ...this.state.selectedShow,
        draw: {
          ...this.state.selectedShow.draw,
          [this.state.selectedClass.id]: {
            ...this.state.selectedShow.draw[this.state.selectedClass.id],
            [participantId]: order,
          },
        },
      },
    });
  }

  sortList() {
    const { selectedShow } = this.state;
    const showRef = this.props.firebase.db
      .collection('shows')
      .doc(selectedShow.id);
    this.setState({
      ...this.state,
      isSortLoading: true,
      showSuccessAlertOpen: true,
    });
    showRef
      .update({
        [`draw.${this.state.selectedClass.id}`]: selectedShow.draw[
          this.state.selectedClass.id
        ],
      })
      .then(() => {
        this.setState({
          ...this.state,
          drawDialogOpen: false,
          successToastMessage: 'Draw submitted successfully!',
        });
      })
      .finally(() => {
        this.setState({ isSortLoading: false });
      });
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
          showSuccessAlertOpen: true,
          successToastMessage: 'Registration Successful!',
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
    const availableShows = this.getAvailableShows();
    const previousShows = this.getPreviousShows();
    if (this.state.loading) return <CircularProgress />;
    return (
      <Container className={this.props.classes.container}>
        <CreateShowDialog
          open={this.state.createShowDialogOpen}
          standardShows={this.state.standardShows}
          handleCreateShowDialogClose={() =>
            this.onDialogClose('createShowDialogOpen')
          }
          onCreateShowSubmit={(showInfo) =>
            this.onSubmitCreateNewShow(showInfo)
          }
          error={this.state.error}
          isShowCreating={this.state.isShowCreating}
        />
        <AccountSettingsDialog
          open={this.state.accountSettingsDialog}
          handleAccountSettingsDialogClose={() =>
            this.onDialogClose('accountSettingsDialog')
          }
          firebase={this.props.firebase}
        />
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
            this.onDialogClose('drawDialogOpen')
          }
          participants={this.state.participants}
          selectedShow={this.state.selectedShow}
          selectedClass={this.state.selectedClass}
          open={this.state.drawDialogOpen}
          isAdmin={true}
          isSortLoading={this.state.isSortLoading}
          setOrder={(order, id) => this.setDrawOrder(order, id)}
          onSortClick={() => this.sortList()}
        />
        <Snackbar
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          autoHideDuration={2000}
          open={this.state.showSuccessAlertOpen}
          onClose={() => this.handleSuccessAlertClose()}
          message={this.state.successToastMessage}
          key='showCreationSuccess'
          className={this.props.classes.successAlert}
        />
        <Fab
          className={this.props.classes.fab}
          size='medium'
          variant='extended'
          color='primary'
          aria-label='add'
          onClick={() =>
            this.setState({
              ...this.state,
              createShowDialogOpen: true,
            })
          }
        >
          <AddIcon />
          Add a New Show
        </Fab>
        <Fab
          className={this.props.classes.fab}
          size='medium'
          variant='extended'
          color='primary'
          aria-label='add'
          onClick={() =>
            this.setState({
              ...this.state,
              accountSettingsDialog: true,
            })
          }
        >
          <SettingsIcon />
          Account Settings
        </Fab>
        <Typography noWrap variant='h5' color='primary'>
          Available Shows
        </Typography>
        {availableShows && availableShows.length ? (
          availableShows.map((show, index) => (
            <ShowList
              show={show}
              key={index}
              classes={this.props.classes}
              firebase={this.props.firebase}
              setSelectedClassState={(selectedShow, selectedClass) =>
                this.setSelectedClassState(selectedShow, selectedClass)
              }
              onRegisterClick={(eachClass) =>
                this.setState({
                  ...this.state,
                  registerDialogOpen: true,
                  selectedShow: show,
                  selectedClass: eachClass,
                })
              }
            />
          ))
        ) : (
          <Typography noWrap variant='subtitle1' color='textSecondary'>
            There are no shows available, please create one.
          </Typography>
        )}
        <Typography noWrap variant='h5' color='primary'>
          Previous Shows
        </Typography>
        {previousShows && previousShows.length ? (
          previousShows.map((show, index) => (
            <ShowList
              show={show}
              key={index}
              isPrevious={true}
              classes={this.props.classes}
              firebase={this.props.firebase}
              setSelectedClassState={(selectedShow, selectedClass) =>
                this.setSelectedClassState(selectedShow, selectedClass)
              }
            />
          ))
        ) : (
          <Typography
            noWrap
            variant='subtitle1'
            display='inline'
            color='textSecondary'
          >
            There are no past shows available.
          </Typography>
        )}
      </Container>
    );
  }
}

const authCondition = (authUser) => !!authUser;

export default withAuthorization(
  authCondition,
  loginRoute.path
)(compose(withStyles, withFirebase)(AdminPage));
