//Author-Tejasvi Raj Pant

import { applyMiddleware, configureStore, compose } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';

import rootReducer from '../Reducers';
import rootSaga from '../Sagas';
import { composeWithDevTools } from 'redux-devtools-extension';

const sagaMiddleware = createSagaMiddleware();
// const store = createStore(rootReducer, applyMiddleware(sagaMiddleware))
// const store = createStore(rootReducer, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());

// const devTools =
//   process.env.NODE_ENV === 'development' ? composeWithDevTools() : null;

const store = configureStore({
  reducer: rootReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      thunk: false,
      immutableCheck: false,
      serializableCheck: false,
    }).concat(sagaMiddleware),
  devTools: process.env.NODE_ENV !== 'production',
});

sagaMiddleware.run(rootSaga);

export default store;
