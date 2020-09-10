import IconButton from '@material-ui/core/IconButton';
import { makeStyles } from '@material-ui/core/styles';
import RefreshIcon from '@material-ui/icons/Refresh';
import React, { useContext } from 'react';
import { YingContext } from './lib/react-ying/index';

console.log(111)
const useStyles = makeStyles((theme) => ({
     root: {
     },
     input: {
          display: 'none',
     },
     button: {
          position: 'fixed',
          bottom: theme.spacing(3),
          right: theme.spacing(15),
     },
}));

export default function Add() {
     const classes = useStyles();
     const { sendMsg } = useContext(YingContext);
     const add = () => {
          sendMsg({ refresh: true })
     }
     return (
          <div className={classes.root}>
               <IconButton className={classes.button} onClick={add}>
                    <RefreshIcon />
               </IconButton>
          </div>
     );
}