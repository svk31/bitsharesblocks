import { combineReducers } from 'redux';
import blockchain from './blockchain';
import accounts from './accounts';

export default combineReducers({
  blockchain,
  accounts
});
