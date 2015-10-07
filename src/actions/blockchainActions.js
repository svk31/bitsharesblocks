import fetch from 'isomorphic-fetch';
import {blockchainTypes} from '../constants';
import {blockchainApi} from '../lib/socket_api';

// MULTIPLE BLOCKS METHODS
function requestBlocks() {
  return {
    type: blockchainTypes.REQUEST_LATEST_BLOCKS
  };
}

function receiveLatestBlocks(json) {
  return {
    type: blockchainTypes.GOT_LATEST_BLOCKS,
    latestBlocks: json
  };
}

function receiveBlock(json) {
  return {
    type: blockchainTypes.GOT_HEAD_BLOCK,
    block: json
  };
}

function receiveDynGlobal(json) {
  return {
    type: blockchainTypes.GOT_DYN_GLOBAL,
    global: json
  };
}

export function subHeadBlock() {
  return dispatch => {
    let cb = (result) => {
      dispatch(receiveBlock(result));
    };
    blockchainApi.subHeadBlock(cb);
  };
}

export function unsubHeadBlock() {
  return () => {
    blockchainApi.unSubHeadBlock();
  };
}

export function subDynGlobal() {
  return dispatch => {
    let cb = (result) => {
      dispatch(receiveDynGlobal(result));
    };
    blockchainApi.subDynGlobal(cb);
  };
}

// Thunks
export function fetchBlocks() {
  console.log('launch fetchBlocks');
  return dispatch => {
    console.log('dispatch requestBlocks');
    dispatch(requestBlocks());
    return fetch('http://127.0.0.1:8091/v1/blocks/recent')
      .then(response => response.json())
      .then(json => {console.log('got this json:', json); dispatch(receiveLatestBlocks(json));})
      .catch(err => {
        console.log('fetch error:', err);
      });
  };
}

// SINGLE BLOCK METHODS
function requestBlock() {
  return {
    type: blockchainTypes.REQUEST_BLOCK
  };
}

function receivedBlock(json) {
  return {
    type: blockchainTypes.GOT_BLOCK,
    block: json
  };
}

// Thunks
export function fetchBlock(height) {
  console.log('launch fetchBlock', height);
  return dispatch => {
    console.log('dispatch requestBlocks');
    dispatch(requestBlock());
    return fetch('http://127.0.0.1:8091/v1/blocks/' + height)
      .then(response => response.json())
      .then(json => {console.log('got this block:', json); dispatch(receivedBlock(json));})
      .catch(err => {
        console.log('fetch error:', err);
      });
  };
}
