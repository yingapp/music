import Chip from '@material-ui/core/Chip';
import { makeStyles } from '@material-ui/core/styles';
import React, { useContext, useMemo, useState } from 'react';
import useDeepEffect from "./lib/deeply-checked-effect";
import { YingContext } from './lib/react-ying/index';
import MusicList from './MusicList';


const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    justifyContent: 'center',
    flexWrap: 'wrap',
    '& > *': {
      margin: theme.spacing(0.5),
    },
  },
}));

export default function TagSub({ tag }) {
  const classes = useStyles();
  const { user, sendData, getData } = useContext(YingContext)
  const [data, setData] = useState([]);
  const [genre, setGenre] = useState();
  const [artist, setArtist] = useState();

  useDeepEffect(() => {
    let { sounds = {}, tagSubArtist, tagSubGenre } = getData()
    let d
    if (tag === 'favorite') {
      d = Object.values(sounds).filter(s => s.favorite)
    } else {
      d = Object.values(sounds)
    }
    if (tag === 'artist') {
      d = d.map(s => s.artist).flat(Infinity)
    } else {
      d = d.map(s => s.genre).flat(Infinity)
    }
    d = Array.from(new Set(d))
    setData(d);
    setArtist(tagSubArtist)
    setGenre(tagSubGenre);
  }, [user, tag])

  const handleClick = (i) => () => {
    if (tag === 'artist') {
      sendData({ tagSubArtist: i })
    } else {
      sendData({ tagSubGenre: i })
    }
  }

  const current = useMemo(() => tag === 'artist' ? artist : genre, [tag, genre, artist]);

  return (
    <>
      <div className={classes.root}>
        {data.length > 1 && <Chip label='全部' color={current ? 'inhert' : 'primary'} onClick={handleClick('')} />}
        {data.length > 1 && data.map(i => <Chip key={i} label={i} color={current === i ? 'primary' : 'default'} onClick={handleClick(i)} />)}
      </div>
      <MusicList tag={tag} genre={genre} artist={artist} />
    </>
  );
}
