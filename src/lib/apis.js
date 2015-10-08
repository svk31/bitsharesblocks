console.log('launching socket_api.js');

// API ROUTES
import blockchainApi from './blockchain_api.js';
import accountApi from './account_api.js';
import SocketIO from 'socket.io-client';
import fetch from 'isomorphic-fetch';

const API_HOST = __DEV__ ? 'http://localhost' : 'http://45.55.41.119';
const _socket = SocketIO.connect(API_HOST + ':8091');
let callBacks = new Map();

let api = {
  sub: (callback, room) => {
    _socket.emit('subscribe', room);
    let cb = result => {
      callback(JSON.parse(result));
    };
    callBacks.set(room, cb);
    _socket.on(room, cb);
  },

  unSub: (room) => {
    _socket.removeListener(room, callBacks.get(room));
    callBacks.delete(room);
    _socket.emit('unsubscribe', room);
  }
};

_socket.on('connect', () => {
  console.log('connected');
});

_socket.on('disconnect', () => {
  console.log('disconnected');
});

// _socket.on('message:', (data) => {
//   console.log('socket message:', data);
// });

let fetchApi = (route) => {
  return fetch(API_HOST + ':8091/' + route);
};

module.exports = {
  blockchainApi: blockchainApi(api),
  accountApi: accountApi(api),
  fetchApi: fetchApi
};
