import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import Navigation from './Navigation';
import LandingPage from './LandingPage';
import LoginPage from './LoginPage.js';
import AdminPage from './AdminPage';
import AccountPage from './AccountPage';
import { makeStyles } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import * as allRoutes from '../constants/routes';
import { withAuthentication } from './Session';

const App = () => {
  const useStyles = makeStyles((theme) => ({
    root: {
      display: 'flex',
    },
    toolbar: theme.mixins.toolbar,
    content: {
      flexGrow: 1,
      display: 'flex',
      justifyContent: 'center',
      padding: theme.spacing(3),
      backgroundColor: theme.palette.grey['50']
    },
  }));
  const classes = useStyles();
  return (
    <Router className={classes.root}>
      <Navigation />
      <div className={classes.toolbar} />
      <main className={classes.content}>
        <CssBaseline />
        <Route exact path={allRoutes.HOME.path} component={LandingPage}></Route>
        <Route path={allRoutes.LOGIN.path} component={LoginPage}></Route>
        <Route
          path={allRoutes.sideBarRoutes.ADMIN.path}
          component={AdminPage}
        ></Route>
        <Route path={allRoutes.ACCOUNT.path} component={AccountPage}></Route>
      </main>
    </Router>
  );
};

export default withAuthentication(App);
