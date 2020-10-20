import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import {
  BrowserRouter as Router,
} from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/App.scss';
import 'react-notifications/lib/notifications.css';

import { Provider } from 'react-redux';
import store from './Redux/Store/';
import {initialSetup} from './Redux/ICON';

import history from './Router/history';

initialSetup();
ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <Router history = {history}>
        <App />
      </Router>
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
