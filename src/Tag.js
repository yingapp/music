import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import { makeStyles } from '@material-ui/core/styles';
import React, { useState, useContext } from 'react';
import TagSub from './TagSub';
import { YingContext } from './lib/react-ying/index';
import useDeepEffect from "./lib/deeply-checked-effect";
import { getStatusBarHeight } from './lib/util/util'

const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: getStatusBarHeight(),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    '& > *': {
      margin: theme.spacing(3),
    },
  },
}));

export default function BasicButtonGroup() {
  const classes = useStyles();
  const { user, sendData ,getData} = useContext(YingContext)
  const [tag, setTag] = useState();
  const handleClick = (t) => () => {
    sendData({ tag: t })
  }
  useDeepEffect(() => {
    let { tag } = getData()
    setTag(tag);
  }, [user])
  return (
    <>
      <div className={classes.root}>
        <ButtonGroup size='medium' color="primary" aria-label="标签">
          <Button
            onClick={handleClick('genre')}
            color={tag === 'genre' ? 'secondary' : 'primary'}
          >风格</Button>
          <Button
            onClick={handleClick('artist')}
            color={tag === 'artist' ? 'secondary' : 'primary'}
          >音乐人</Button>
          <Button
            onClick={handleClick('favorite')}
            color={tag === 'favorite' ? 'secondary' : 'primary'}
          >收藏</Button>
        </ButtonGroup>
      </div>
      <TagSub tag={tag} />
    </>
  );
}
