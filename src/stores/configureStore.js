import { compose, createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import createLogger from 'redux-logger';
import { devTools } from 'redux-devtools';
import rootReducer from 'reducers/rootReducer';

const loggerMiddleware = createLogger();

let createStoreWithMiddleware;

if (__DEBUG__) {
  createStoreWithMiddleware = applyMiddleware(
    thunkMiddleware,
    loggerMiddleware
  )(compose(devTools())(createStore));
} else {
  createStoreWithMiddleware = applyMiddleware(
    thunkMiddleware,
    loggerMiddleware
  )(createStore);
}

export default function configureStore (initialState) {
  const store = createStoreWithMiddleware(rootReducer, initialState);

  if (module.hot) {
    module.hot.accept('../reducers/rootReducer', () => {
      const nextRootReducer = require('../reducers/rootReducer');

      store.replaceReducer(nextRootReducer);
    });
  }
  return store;
}
