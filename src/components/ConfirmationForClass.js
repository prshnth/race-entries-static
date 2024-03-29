import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import moment from 'moment';
import Typography from '@material-ui/core/Typography';
import Checkbox from '@material-ui/core/Checkbox';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import IconButton from '@material-ui/core/IconButton';
import PictureAsPdfIcon from '@material-ui/icons/PictureAsPdf';
import DeleteIcon from '@material-ui/icons/Delete';
import SaveIcon from '@material-ui/icons/Save';
import SortIcon from '@material-ui/icons/Sort';
import CircularProgress from '@material-ui/core/CircularProgress';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import _ from 'lodash';

export default function ConfirmationForClass(props) {
  const useStyles = makeStyles((theme) => ({
    dialogContent: {
      padding: '20px 15px',
    },
    table: {
      minWidth: 200,
    },
    titleContainer: {
      display: 'flex',
    },
    inputOrder: {
      width: '20px',
      '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button':
        {
          '-webkit-appearance': 'none',
        },
    },
    wrapper: {
      position: 'relative',
      marginLeft: 'auto',
    },
    buttonProgress: {
      color: theme.palette.success.light,
      position: 'absolute',
      top: '50%',
      left: '50%',
      marginTop: -12,
      marginLeft: -12,
    },
    editButtons: {
      display: 'flex',
    },
  }));

  const classes = useStyles();
  const participantsDoc = new jsPDF();

  const onDialogClose = () => {
    props.handleConfirmationDialogClose();
  };

  const getParticipantsForClass = (shouldSort = false) => {
    return _.chain(props.participants)
      .filter(
        (participant) =>
          participant.participationShowId === props.selectedShow.id &&
          participant.participationClass === props.selectedClass.name
      )
      .sortBy(
        (participant) =>
          (!props.isAdmin || shouldSort) &&
          props.selectedShow.draw[props.selectedClass.id] &&
          props.selectedShow.draw[props.selectedClass.id][participant.id]
      )
      .value();
  };

  const makeParticipantsPDF = () => {
    const participantsList = getParticipantsForClass(true);
    participantsDoc.autoTable({
      head: [['Order', 'Rider Name', 'Horse Name', 'Owner Name']],
      body: participantsList.map((participant, index) => [
        index + 1,
        participant.riderName,
        participant.horseName,
        participant.ownerName,
      ]),
    });
    participantsDoc.save(
      `${props.selectedShow.showDate}_${_.kebabCase(
        props.selectedClass.name
      )}.pdf`
    );
  };

  const isSortDisabled = () => {
    if (!props.selectedShow) return;
    const participantsList = getParticipantsForClass();
    return (
      props.isSortLoading ||
      participantsList.length !==
        _.size(props.selectedShow.draw[props.selectedClass.id]) ||
      _.some(
        props.selectedShow.draw[props.selectedClass.id],
        (sortOrder) =>
          _.isEmpty(sortOrder) ||
          sortOrder > participantsList.length ||
          sortOrder < 1
      ) ||
      _.chain(_.values(props.selectedShow.draw[props.selectedClass.id]))
        .uniq()
        .value().length !==
        _.size(props.selectedShow.draw[props.selectedClass.id])
    );
  };

  return (
    <Dialog
      open={props.open}
      onClose={onDialogClose}
      onExited={onDialogClose}
      maxWidth='sm'
      aria-labelledby='form-dialog-title'
    >
      <DialogTitle id='form-dialog-title'>
        <div className={classes.titleContainer}>
          {props.selectedShow && (
            <Typography variant='h6' display='inline' noWrap>
              {props.selectedShow.showName +
                ' - ' +
                moment(props.selectedShow.showDate, 'YYYY-MM-DD').format(
                  'dddd, MMMM Do'
                )}
            </Typography>
          )}
          {props.isAdmin && (
            <div className={classes.wrapper}>
              <Button
                variant='contained'
                color='primary'
                size='small'
                startIcon={<SortIcon />}
                onClick={props.onSortClick}
                disabled={isSortDisabled()}
              >
                Sort
              </Button>
              {props.isSortLoading && (
                <CircularProgress
                  size={24}
                  className={classes.buttonProgress}
                />
              )}
            </div>
          )}
        </div>
      </DialogTitle>
      <DialogContent dividers className={classes.dialogContent}>
        <DialogContentText>
          Confirmations for the class:{' '}
          {props.selectedClass && props.selectedClass.name}
          {props.isAdmin && (
            <IconButton
              color='primary'
              aria-label='download pdf'
              onClick={makeParticipantsPDF}
            >
              <PictureAsPdfIcon />
            </IconButton>
          )}
        </DialogContentText>
        {props.selectedShow && getParticipantsForClass().length ? (
          <TableContainer component={Paper}>
            <Table
              stickyHeader
              className={classes.table}
              aria-label='participants table'
            >
              <TableHead>
                <TableRow>
                  {(props.isAdmin ||
                    !_.isEmpty(
                      props.selectedShow.draw[props.selectedClass.id]
                    )) && <TableCell>Order</TableCell>}
                  <TableCell>Rider Name</TableCell>
                  <TableCell>Horse Name</TableCell>
                  <TableCell>Owner Name</TableCell>
                  {props.selectedClass.hasSeniorWorldTour && (
                    <TableCell>SWT</TableCell>
                  )}
                  {props.isAdmin && <TableCell align='center'>Edit</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {getParticipantsForClass().map((participant) => (
                  <TableRow key={participant.id}>
                    {props.isAdmin ? (
                      <TableCell component='th' scope='row'>
                        <TextField
                          className={classes.inputOrder}
                          type='number'
                          value={
                            props.selectedShow.draw[props.selectedClass.id] &&
                            props.selectedShow.draw[props.selectedClass.id][
                              participant.id
                            ]
                          }
                          onChange={(e) =>
                            props.setOrder(e.target.value, participant.id)
                          }
                        />
                      </TableCell>
                    ) : !_.isEmpty(
                        props.selectedShow.draw[props.selectedClass.id]
                      ) ? (
                      <TableCell>
                        {
                          props.selectedShow.draw[props.selectedClass.id][
                            participant.id
                          ]
                        }
                      </TableCell>
                    ) : null}
                    {props.isAdmin ? (
                      <React.Fragment>
                        <TableCell component='th' scope='row'>
                          <TextField
                            type='text'
                            value={participant.riderName}
                            onChange={(e) =>
                              props.onUpdateParticipantState({
                                ...participant,
                                riderName: e.target.value,
                              })
                            }
                          />
                        </TableCell>
                        <TableCell component='th' scope='row'>
                          <TextField
                            type='text'
                            value={participant.horseName}
                            onChange={(e) =>
                              props.onUpdateParticipantState({
                                ...participant,
                                horseName: e.target.value,
                              })
                            }
                          />
                        </TableCell>
                        <TableCell component='th' scope='row'>
                          <TextField
                            type='text'
                            value={participant.ownerName}
                            onChange={(e) =>
                              props.onUpdateParticipantState({
                                ...participant,
                                ownerName: e.target.value,
                              })
                            }
                          />
                        </TableCell>
                        {props.selectedClass.hasSeniorWorldTour && (
                          <TableCell>
                            <Checkbox
                              checked={participant.selectedSeniorWorldTour}
                              onChange={(e) =>
                                props.onUpdateParticipantState({
                                  ...participant,
                                  selectedSeniorWorldTour: e.target.checked,
                                })
                              }
                              color='primary'
                              name='selectedSeniorWorldTour'
                            />
                          </TableCell>
                        )}
                        <TableCell className={classes.editButtons}>
                          <IconButton
                            aria-label='save-class'
                            color='primary'
                            onClick={() => props.onEditParticipant(participant)}
                          >
                            <SaveIcon />
                          </IconButton>
                          <IconButton
                            aria-label='delete-class'
                            color='secondary'
                            onClick={() =>
                              props.onDeleteParticipant(participant)
                            }
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </React.Fragment>
                    ) : (
                      <React.Fragment>
                        <TableCell component='th' scope='row'>
                          {participant.riderName}
                        </TableCell>
                        <TableCell>{participant.horseName}</TableCell>
                        <TableCell>{participant.ownerName}</TableCell>
                        {props.selectedClass.hasSeniorWorldTour && (
                          <TableCell>
                            {participant.selectedSeniorWorldTour ? 'Yes' : 'No'}
                          </TableCell>
                        )}
                      </React.Fragment>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography variant='h6' display='inline' color='primary'>
            There are no registrations for this class yet.
          </Typography>
        )}
      </DialogContent>
    </Dialog>
  );
}
