import React from 'react';
import Add from './Add';
import Favorite from './Favorite';
import Refresh from './Refresh';
import Profile from './Profile';
import Tag from './Tag';

console.log(111)
export default function Staff() {
  return (
    <>
      <Tag/>
      <Favorite />
      <Add />
      <Refresh />
      <Profile />
    </>
  )
}