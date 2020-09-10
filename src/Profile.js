import { makeStyles } from '@material-ui/core/styles';
import React, { useContext } from "react";
import Token from './Token';
import { YingContext } from './lib/react-ying/index';
import FlagIcon from '@material-ui/icons/OutlinedFlag';
import { getStatusBarHeight } from './lib/util/util'

const useStyles = makeStyles((theme) => ({
     root: {
          position: 'fixed',
          top: theme.spacing(2) + getStatusBarHeight(),
          left: theme.spacing(2),
     },
}));
export default function Profile() {
     const { user, showDialog } = useContext(YingContext)
     const token = user?.intents?.cehua || {}
     const classes = useStyles();
     const handleClick = () => {
          const chat = {
               id: 'userProfile',
               intentId: 'chat',
               inner: {
                    option: {
                         title: token.name,
                    },
                    bot: {
                         id: '_Ying',
                         profile: {
                              name: 'Ying',
                         }
                    },
                    guide: [
                         {
                              id: 'update',
                              path: '/update',
                              message: `请按提示修改`,
                         },
                    ],
                    menu: [
                         {
                              id: 'update',
                              path: '/update',
                              message: '修改',
                         },
                    ],
                    stepsData: {
                         update: [
                              {
                                   id: 'volume',
                                   path: 'data/volume',
                                   message: '音量',
                              },
                              {
                                   id: 'name',
                                   path: 'profile/name',
                                   message: '名称',
                              },
                              {
                                   id: 'avatar',
                                   path: 'profile/manner/avatar',
                                   message: '图标',
                              },
                         ]
                    },
               },
          }
          showDialog(chat);
     }

     return (
          <div className={classes.root}>
               <Token token={token} onClick={handleClick}>
                    <FlagIcon fontSize="large" htmlColor="#000095" />
               </Token>
          </div>
     );
}