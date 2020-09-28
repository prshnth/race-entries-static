import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Box from '@material-ui/core/Box';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import { withFirebase } from './Firebase';
import { withAuthorization } from './Session';
import * as allRoutes from '../constants/routes';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role='tabpanel'
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
    >
      {value === index && <Box p={3}>{children}</Box>}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `full-width-tab-${index}`,
    'aria-controls': `full-width-tabpanel-${index}`,
  };
}

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.paper,
    width: 500,
  },
  tabPanel: {
    display: 'flex',
    justifyContent: 'center',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    '& .MuiTextField-root': {
      margin: theme.spacing(1),
      width: 200,
    },
  },
  loginButton: {
    margin: '0 auto',
  },
}));
const LoginPage = (props) => {
  const classes = useStyles();
  const [value, setValue] = React.useState(0);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loginError, setloginError] = React.useState(null);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const doLogin = (event) => {
    event.preventDefault();
    props.firebase
      .doSignInWithEmailAndPassword(email, password)
      .then(() => {
        setEmail('');
        setPassword('');
        setloginError('');
        props.history.push(allRoutes.sideBarRoutes.ADMIN.path);
      })
      .catch(setloginError);
  };

  const isLoginInvalid = password === '' || email === '';

  return (
    <div className={classes.root}>
      <AppBar position='static' color='default'>
        <Tabs
          value={value}
          onChange={handleChange}
          indicatorColor='primary'
          textColor='primary'
          variant='fullWidth'
          aria-label='full width tabs'
        >
          <Tab label='Login' {...a11yProps(0)} />
          <Tab label='Sign Up' {...a11yProps(1)} />
        </Tabs>
      </AppBar>
      <TabPanel value={value} index={0} className={classes.tabPanel}>
        {loginError && (
          <Typography variant='subtitle1' color='error'>
            {loginError.message}
          </Typography>
        )}
        <form
          className={classes.form}
          noValidate
          autoComplete='off'
          onSubmit={doLogin}
        >
          <div>
            <div>
              <TextField
                required
                id='email'
                name='email'
                label='Email Id'
                variant='outlined'
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
            <div>
              <TextField
                required
                id='password'
                name='password'
                type='password'
                label='Password'
                variant='outlined'
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>
          </div>
          <Button
            variant='contained'
            className={classes.loginButton}
            color='primary'
            type='submit'
            disabled={isLoginInvalid}
          >
            Login
          </Button>
        </form>
      </TabPanel>
      <TabPanel value={value} index={1} className={classes.tabPanel}>
        <Typography variant='subtitle1' color='primary'>
          Please contact System Administrator to get an Admin Account.
        </Typography>
      </TabPanel>
    </div>
  );
};

const authCondition = (authUser) => !authUser;

export default withAuthorization(
  authCondition,
  allRoutes.HOME.path
)(withFirebase(LoginPage));
