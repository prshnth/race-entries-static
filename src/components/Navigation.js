import React from 'react';
import { withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import { Link } from 'react-router-dom';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import Drawer from '@material-ui/core/Drawer';
import Divider from '@material-ui/core/Divider';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import RemoveShoppingCartIcon from '@material-ui/icons/RemoveShoppingCart';
import SupervisorAccountIcon from '@material-ui/icons/SupervisorAccount';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import { makeStyles } from '@material-ui/core/styles';
import * as allRoutes from '../constants/routes';
import { withFirebase } from './Firebase';
import { AuthUserContext } from './Session';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  title: {
    flexGrow: 1,
    textAlign: 'center',
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  navBarLink: {
    textDecoration: 'none',
    color: 'inherit',
  },
  list: {
    width: 250,
  },
  toolbar: theme.mixins.toolbar,
}));

function Navigation({ firebase, history }) {
  const classes = useStyles();
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const authUser = React.useContext(AuthUserContext);

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const doLogout = () => {
    firebase.doSignOut();
    history.push(allRoutes.HOME.path);
  };

  return (
    <div className={classes.root}>
      <AppBar position='fixed'>
        <Toolbar>
          <IconButton
            color='inherit'
            aria-label='open drawer'
            edge='start'
            className={classes.menuButton}
            onClick={handleDrawerToggle}
          >
            <MenuIcon />
          </IconButton>
          <IconButton color='inherit'>
            <Link to={allRoutes.HOME.path} className={classes.navBarLink}>
              {allRoutes.HOME.text}
            </Link>
          </IconButton>
        </Toolbar>
      </AppBar>
      <Drawer anchor='left' open={drawerOpen} onClose={handleDrawerToggle}>
        <div className={classes.toolbar} />
        <Divider />
        <List className={classes.list} onClick={handleDrawerToggle}>
          {Object.values(allRoutes.sideBarRoutes).map((route) => (
            <Link
              to={route.path}
              key={route.text}
              className={classes.navBarLink}
            >
              <ListItem button color='inherit'>
                <ListItemIcon>
                  {route.text === 'Admin' ? (
                    <SupervisorAccountIcon />
                  ) : (
                    <RemoveShoppingCartIcon />
                  )}
                </ListItemIcon>
                <ListItemText primary={route.text} />
              </ListItem>
            </Link>
          ))}
          <Divider />
          {authUser ? (
            <ListItem button color='inherit' key='logout' onClick={doLogout}>
              <ListItemIcon>{<ExitToAppIcon />}</ListItemIcon>
              <ListItemText primary='Logout' />
            </ListItem>
          ) : (
            <Link
              to={allRoutes.LOGIN.path}
              key='login'
              className={classes.navBarLink}
            >
              <ListItem button color='inherit'>
                <ListItemIcon>{<ExitToAppIcon />}</ListItemIcon>
                <ListItemText primary={allRoutes.LOGIN.text} />
              </ListItem>
            </Link>
          )}
        </List>
      </Drawer>
    </div>
  );
}

export default compose(withRouter, withFirebase)(Navigation);
