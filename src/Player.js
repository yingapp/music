import IconButton from '@material-ui/core/IconButton';
import { makeStyles } from '@material-ui/core/styles';
import PauseIcon from '@material-ui/icons/Pause';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import RepeatIcon from '@material-ui/icons/Repeat';
import RepeatOneIcon from '@material-ui/icons/RepeatOne';
import ShuffleIcon from '@material-ui/icons/Shuffle';
import SkipNextIcon from '@material-ui/icons/SkipNext';
import SkipPreviousIcon from '@material-ui/icons/SkipPrevious';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import useDeepEffect from "./lib/deeply-checked-effect";
import { useWindowSize } from "./lib/hook/hook";
import { YingContext } from './lib/react-ying/index';


console.log(111)
const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'fixed',
    bottom: 0,
    width: '100%',
    margin: 15,
  },
  details: {
    display: 'flex',
    flexDirection: 'column',
  },
  content: {
    flex: '1 0 auto',
  },
  cover: {
    width: 151,
  },
  controls: {
    display: 'flex',
    alignItems: 'center',
  },
  playIcon: {
    height: 50,
    width: 50,
  },
  repeatButton: {
    position: 'fixed',
    bottom: theme.spacing(3),
    left: theme.spacing(18),
  },
}));
const audioElement = document.createElement("audio");
const history = []
let data = {}
let repeat = 0
let firstRun = true
let currentAudio
let list
export default function Player({ data: musicList }) {
  const classes = useStyles();
  const { user, cache, sendData, update } = useContext(YingContext)
  const size = useWindowSize()
  const [pause, setPause] = useState();
  const [, updateState] = React.useState();
  const forceUpdate = React.useCallback(() => updateState({}), []);
  useEffect(() => {
    list = musicList
  }, [musicList]);
  function handlePlayPauseClick() {
    setPause(p => !p)
  }
  const handleNav = (step) => () => {
    let current
    const id = data.current?.id
    const length = list.length
    if (step < 0 && repeat === 0) {
      current = history.pop()
    }
    if (!current) {//没有后退历史，从列表提取
      const prevIndex = list.findIndex(i => i.id === id)
      let index = prevIndex + ((step > 0 && repeat === 2) ? Math.floor(Math.random() * length) : step)
      if (index < 0) index = list.length - 1
      if (index >= length) index = 0
      current = list[index]
    }
    if (repeat === 2 && step > 0 && current?.id === id && length > 1) {//随机播放时，防止重复
      handleNav(step)()
      return
    }
    if (step > 0 && current) history.push(current)//前进加入历史
    if (!current || current.id === id) {//播放歌曲没有变化，再播一次
      audioElement.play()
    }
    if (current) sendData({ current })

  }

  function handleRepeat() {
    repeat = repeat + 1 > 2 ? -1 : repeat + 1
    forceUpdate()
    sendData({ repeat })
  }
  useDeepEffect(() => {
    const { data: d = {} } = user?.intents?.yinyue || {}
    if (!d.current) {
      const { sounds = {} } = d
      const ids = Object.keys(sounds)
      if (ids.length) {
        const current = sounds[ids[0]]
        current.id = ids[0]
        d.current = current
      }
    }
    data = d
    repeat = data.repeat || 0
    if (currentAudio !== data.current?.audio) play()
    currentAudio = data.current?.audio
    forceUpdate()
  }, [user])

  const handleEnd = () => {
    if (repeat === 1) {
      handleNav(0)()
    } else {
      handleNav(1)()
    }
  }

  if (firstRun) {
    audioElement.addEventListener('ended', handleEnd)
    firstRun = false
  }


  useDeepEffect(() => {
    play()
  }, [update]);
  function play() {
    const { current, volume = 50 } = data
    if (current?.audio) {
      const { id, audio } = current;
      const data = typeof audio === 'string' && audio.length === 128 ? cache[audio] : audio
      if (data) {
        sendData({ sounds: { [id]: { loading: false } } })
        audioElement.src = data;
        audioElement.volume = volume * 0.01;
        audioElement.play()
        setPause(false)
      } else {
        sendData({ sounds: { [id]: { loading: true } } })
      }
    }
  }

  useEffect(() => {
    if (pause) audioElement.pause()
    else if (audioElement.canPlayType) audioElement.play()
  }, [pause]);
  const bottom = useMemo(() => size.width > 500 ? 0 : 50, [size])
  return (
    <div className={classes.root} style={{ bottom }}>
      <div className={classes.controls}>

        <IconButton aria-label="后退" onClick={handleNav(-1)}>
          <SkipPreviousIcon htmlColor='black' />
        </IconButton>
        <IconButton aria-label="播放/暂停" onClick={handlePlayPauseClick} >
          {pause ? <PlayArrowIcon htmlColor='black' className={classes.playIcon} /> :
            <PauseIcon htmlColor='black' className={classes.playIcon} />}
        </IconButton>
        <IconButton aria-label="前进" onClick={handleNav(1)}>
          <SkipNextIcon htmlColor='black' />
        </IconButton>
      </div>
      <IconButton aria-label="重复" onClick={handleRepeat} className={classes.repeatButton}>
        {repeat === 1 ? <RepeatOneIcon htmlColor='black' /> :
          repeat === 2 ? <ShuffleIcon htmlColor='black' /> :
            <RepeatIcon htmlColor={repeat === 0 ? 'black' : 'lightgray'} />}
      </IconButton>
    </div>
  );
}
