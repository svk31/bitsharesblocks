import {accountTypes} from '../constants';

export default function accounts(state = {
  isFetching: false,
  didFail: false,
  accounts: new Map(),
  witnesses: new Map(),
  delegates: new Map()
}, action) {
  switch (action.type) {

  case accountTypes.REQUEST_WITNESSES:
    return Object.assign({}, state, {
      isFetching: true,
      didFail: false
    });

  case accountTypes.GOT_WITNESSES:
    let witnesses = new Map(action.witnesses);
    return Object.assign({}, state, {
      isFetching: false,
      didFail: false,
      witnesses: witnesses
    });

  case accountTypes.GOT_WITNESS:
    console.log(accountTypes.GOT_WITNESS, action);
    return Object.assign({}, state, {
      isFetching: false,
      didFail: false,
      witnesses: state.witnesses.set(action.witness[0], action.witness[1])
    });

  default:
    return state;
  }
}
