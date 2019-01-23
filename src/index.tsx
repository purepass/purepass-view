import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
ReactDOM.render(
  <App themeColour="#4a148c"/>,
  document.getElementById('root') as HTMLElement
);
registerServiceWorker();
