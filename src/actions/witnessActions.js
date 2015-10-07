import fetch from 'isomorphic-fetch';
import {accountTypes} from '../constants';
import {accountApi} from '../lib/socket_api';

console.log('accountTypes:', accountTypes);

function requestWitnesses() {
  return {
    type: accountTypes.REQUEST_WITNESSES
  };
}

function receiveWitnesses(json) {
  return {
    type: accountTypes.GOT_WITNESSES,
    witnesses: json
  };
}

function receiveWitness(json) {
  return {
    type: accountTypes.GOT_WITNESS,
    witness: json
  };
}

export function subWitness() {
  return dispatch => {
    let cb = (result) => {
      dispatch(receiveWitness(result));
    };
    accountApi.subWitness(cb);
  };
}

export function unSubWitness() {
  return () => {
    accountApi.unSubWitness();
  };
}

// Thunks ??

export function fetchWitnesses() {
  console.log('launch fetchWitnesses');
  return dispatch => {
    console.log('dispatch requestWitnesses');
    dispatch(requestWitnesses());
    return fetch('http://127.0.0.1:8091/v1/witnesses')
      .then(response => response.json())
      .then(json => {console.log('got this json:', json); dispatch(receiveWitnesses(json));})
      .catch(err => {
        console.log('fetch error:', err);
      });
  };
}


