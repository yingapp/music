import * as mmb from 'music-metadata-browser';
import Fab from '@material-ui/core/Fab';
import { makeStyles } from '@material-ui/core/styles';
import AddIcon from '@material-ui/icons/Add';
import React, { useContext } from 'react';
import { YingContext } from './lib/react-ying/index';

console.log(111)
const useStyles = makeStyles((theme) => ({
     root: {
     },
     input: {
          display: 'none',
     },
     fab: {
          position: 'fixed',
          bottom: theme.spacing(3),
          right: theme.spacing(5),
     },
}));

export default function Add() {
     const classes = useStyles();
     const { sendMsg } = useContext(YingContext);
     const add = (event) => {
          const files = [...event.target.files]
          files.forEach(file => {
               const reader = new FileReader()
               reader.onload = function () {
                    const { result } = reader
                    const id = file.name.split('.')[0] //文件前缀
                    const type = file.type.split('/')[0]
                    if (type === 'audio') {
                         mmb.parseBlob(file).then(metadata => {
                              const {
                                   common: {
                                        artist,
                                        genre = [],
                                        title = id
                                   },
                                   format: {
                                        duration
                                   }
                              } = metadata
                              onAdd({
                                   [id]: { title, artist, genre, audio: result, duration }
                              })
                         })
                    } else if (type === 'image') {
                         onAdd({ [id]: { image: result } })
                    }
               }
               if (file) {
                    reader.readAsDataURL(file);
               }
          });
     }
     const onAdd = (sounds) => {
          sendMsg({ user: { intents: { yinyue: { data: { sounds } } } } })
     }
     return (
          <div className={classes.root}>
               <input
                    accept="audio/*,image/*"
                    className={classes.input}
                    id="contained-button-file"
                    multiple
                    type="file"
                    onChange={add}
               />
               <label htmlFor="contained-button-file">
                    <Fab color="primary" className={classes.fab} component="span">
                         <AddIcon />
                    </Fab>
               </label>

          </div>
     );
}