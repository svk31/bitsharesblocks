import {blockchainTypes} from '../constants';
import _ from 'lodash';

export default function blockchain(state = {
  isFetching: false,
  didFail: false,
  latestBlocks: [],
  blocks: new Map(),
  dynGlobalObject: {}
}, action) {
  switch (action.type) {

  case blockchainTypes.REQUEST_LATEST_BLOCKS:
    return Object.assign({}, state, {
      isFetching: true,
      didFail: false,
      latestBlocks: []
    });

  case blockchainTypes.REQUEST_BLOCK:
    return Object.assign({}, state, {
      isFetching: true,
      didFail: false
    });

  case blockchainTypes.GOT_LATEST_BLOCKS:
    return Object.assign({}, state, {
      isFetching: false,
      didFail: false,
      latestBlocks: action.latestBlocks
    });

  case blockchainTypes.GOT_BLOCK:
    console.log('state.blocks:', state.blocks);
    return Object.assign({}, state, {
      isFetching: false,
      didFail: false,
      blocks: state.blocks.set(action.block.id.toString(), action.block)
    });

  case blockchainTypes.GOT_DYN_GLOBAL:
    return Object.assign({}, state, {
      dynGlobalObject: action.global
    });

  case blockchainTypes.GOT_HEAD_BLOCK:
    let newState = Object.assign({}, state);
    if (!_.some(newState.latestBlocks, block => {
      return block.id === action.block.id;
    })) {
      newState.latestBlocks.unshift(action.block);
    }
    while (newState.latestBlocks.length > 20) {
      newState.latestBlocks.pop();
    }
    return newState;

  default:
    return state;
  }
}
