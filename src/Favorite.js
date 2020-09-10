import IconButton from '@material-ui/core/IconButton';
import { makeStyles } from '@material-ui/core/styles';
import FavoriteIcon from '@material-ui/icons/Favorite';
import FavoriteBorderIcon from '@material-ui/icons/FavoriteBorder';
import React, { useContext, useState } from 'react';
import useDeepEffect from "./lib/deeply-checked-effect";
import { YingContext } from './lib/react-ying/index';

console.log(111)
const useStyles = makeStyles((theme) => ({
     button: {
          position: 'fixed',
          bottom: theme.spacing(3),
          left: theme.spacing(8),
     },
}));

export default function Favorite() {
     const classes = useStyles();
     const { user, sendData, getData } = useContext(YingContext)
     const [favorite, setFavorite] = useState();
     useDeepEffect(() => {
          const { current } = getData()
          if (current) {
               setFavorite(current.favorite)
          }
     }, [user])
     function handleFavorite() {
          const { current, sounds } = getData()
          const sound = sounds?.[current.id]
          if (sound) {
               const favorite = !sound.favorite
               sendData({ current: { favorite }, sounds: { [current.id]: { favorite } } })
          }
     }
     return (
          <IconButton aria-label="收藏" onClick={handleFavorite} className={classes.button}>
               {favorite ? <FavoriteIcon htmlColor='black' /> : <FavoriteBorderIcon htmlColor='black' />}
          </IconButton>
     );
}
