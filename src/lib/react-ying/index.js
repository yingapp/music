import jsonmergepatch from 'json-merge-patch';
import React, { useState, useCallback } from "react";
import { isPC } from '../util/util';
console.log(111)
/**
 * 和父窗口交互
 */
const fns = {}
const config = {
     ui: /Ying_\w+/.test(navigator.userAgent) ? 'app' : 'web',
     mode: navigator.userAgent === 'Ying_app' ? 'app' : 'web',
};
let fid = 0;
const cbs = new Set();
if (config.mode === 'web') {
     window.addEventListener('message', onReceivedPostMessage, false);
} else {
     window.callJS = callJS.bind(this)
}

function notify(msg) {
     cbs.forEach(cb => cb(msg));
}
function send(msg, fn) {
     if (typeof fn === 'function') {
          const id = 'fid' + fid++
          fns[id] = fn;
          msg.fid = id;
     }
     //debug
     if (config.mode === 'web') {
          window.parent.postMessage(msg, '*');
          //window.parent.postMessage(msg, 'https://yingapp.herokuapp.com');
     } else {
          prompt(JSON.stringify(msg))
     }
}
function onReceivedPostMessage(event) {
     const msg = event.data;
     performAction(msg);
}
function callJS(json) {
     const msg = JSON.parse(json);
     performAction(msg);
}
function performAction(msg) {
     const { fid } = msg;
     if (fid) {
          const fn = fns[fid];
          if (fn) {
               delete msg.fid;
               fn(msg.dataURI ? msg.dataURI : msg);
               // delete fns[fid];//为了再次接收回调
          }
     } else {
          notify(msg);
     }
}
window.YING = { send, cbs }

/**
 * 主题
 */
const defaultThemes = {
     light: {
          bar: {
               backgroundColor: '#fffffff2',
          },
          button: {
               backgroundColor: '#f1f3f5',
               focus: {
                    backgroundColor: '#e1e3e5',
               }
          },
          input: {
               backgroundColor: '#eaebec',
               focus: {
                    backgroundColor: '#d1d3d5',
               }
          },
          bubble: {
               color: 'white',
               backgroundColor: '#000095'
          },
          avatar: {
               color: 'white',
               backgroundColor: '#000095'
          },
     },
     dark: {
          bar: {
               backgroundColor: '#1f1f1ff2',
          },
          button: {
               backgroundColor: '#282c2f',
               focus: {
                    backgroundColor: '#3c4043',
               }
          },
          input: {
               backgroundColor: '#1a1a1a',
               focus: {
                    backgroundColor: '#101010',
               }
          },
          bubble: {
               color: 'white',
               backgroundColor: '#000095'
          },
          avatar: {
               color: 'white',
               backgroundColor: '#000095'
          },
     },
}
let themes = JSON.parse(JSON.stringify(defaultThemes))
const padding = isPC() ? '0.35em 1em' : '0.5em 1em'
export function getInput(theme) {
     const palette = themes[theme.palette.type].input
     return {
          borderRadius: 50,
          padding,
          color: palette?.color,
          backgroundColor: palette?.backgroundColor,
          transition: theme.transitions.create(['background-color', 'color', 'box-shadow']),
          boxShadow: `0 0 0 0.1rem transparent`,
          '&:hover': {
               color: palette?.focus?.color,
               backgroundColor: palette?.focus?.backgroundColor,
               boxShadow: `0 0 0 0.1rem ${palette?.focus?.borderColor}`,
          },
          '&:focus': {
               color: palette?.focus?.color,
               backgroundColor: palette?.focus?.backgroundColor,
               boxShadow: `0 0 0 0.1rem ${palette?.focus?.borderColor}`,
          }
     }
}
export function getBar(theme) {
     const palette = themes[theme.palette.type].bar
     return {
          backgroundColor: palette?.backgroundColor,
     }
}
export function getPalette(theme) {
     return themes[theme.palette.type]
}
export function getThemes() {
     return themes
}
/**
 * 消息
 */
cbs.add(handleMsg);
let setThemeUpdaterCallback, setUserCallback //, setCacheCallBack
function handleMsg(msg) {
     if (msg.user) {
          const msgUserThemes = msg.user?.profile?.manner?.themes
          if (msgUserThemes) {
               jsonmergepatch.apply(themes, msgUserThemes)
          } else {
               themes = JSON.parse(JSON.stringify(defaultThemes))
          }
          handleThemeChange()
          if (setUserCallback) {
               setUserCallback(msg.user)
          }
     }
     // else if (msg.state?.theme) {
     //      themes.type = msg.state.themse
     //      handleThemeChange()
     // }
}
/**
 *缓存
 */
// const cacheProxy = new Proxy({}, {
//      get: (target, id) => {
//           if (id in target) {
//                return target[id]
//           } else {
//                window.YING.send({ data: id }, r => {
//                     if (r.data) {
//                          target[id] = r.data
//                          setCacheCallBack(target)
//                     }
//                })
//           }
//      }
// })
function handleThemeChange() {
     if (typeof setThemeUpdaterCallback === 'function') {
          setThemeUpdaterCallback(JSON.stringify(themes))
     }
}
/**
 * React 组件
 */
export const YingContext = React.createContext([{}, () => { }]);
export const YingProvider = (props) => {
     const [user, setUser] = useState({})
     const [update, setUpdate] = useState()
     const [cache] = useState(new Proxy({}, {
          get: (target, id) => {
               if (id in target) {
                    return target[id]
               } else {
                    window.YING.send({ data: { id } }, r => {
                         if (r.data) {
                              target[id] = r.data
                              setUpdate(new Date().getTime())
                         }
                    })
                    return null
               }
          },
          set: (target, id, value) => {
               if (typeof id !== 'string') {
                    throw new TypeError('Id必须时字符串');
                    // return false
               }
               target[id] = value
               setUpdate(new Date().getTime())
               return true
          }
     }))
     const showDialog = useCallback((chat, fn) => {
          const data = {
               id: 'yinyue',
               outer: {
                    open: true,
                    transition: 'slide',
               },
               inner: {
                    clear: true,
                    bot: {
                         uid: 'yinyueBot',
                         profile: {
                              name: '音乐',
                              manner: {
                                   color: 'pink,deeppink,hotpink,pink',
                                   bubble: 'Telegram',
                                   top: -3,
                                   zoom: 120,
                                   backgroundSize: 350,
                              }
                         }
                    },
                    option: {
                         title: 'untitled',
                         titleStyle: {
                              color: 'deeppink'
                         },
                         direction: 'left',
                    },
               },
          }
          sendMsg({ chat: jsonmergepatch.apply(data, chat) }, fn)
     }, [])
     const sendMsg = (msg, fn) => {
          window.YING.send(msg, fn)
     }
     const sendData = (data) => {
          sendMsg({ user: { intents: { yinyue: { data } } } })
     }
     const getData = () => {
          return user?.intents?.yinyue?.data || {}
     }

     setUserCallback = setUser
     return (
          <YingContext.Provider value={{ user, cache, update, showDialog, sendMsg, sendData, getData }}>
               {props.children}
          </YingContext.Provider>
     );
}
export function useYing() {
     const [themeUpdater, setThemeUpdater] = useState()
     setThemeUpdaterCallback = setThemeUpdater

     return { themeUpdater }
}