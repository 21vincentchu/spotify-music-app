// import logo from './logo.svg';
import './App.css';

import React from "react";
import {Routes, Route, BrowserRouter} from 'react-router-dom'

import SignInPage from './pages/SignInPage';


function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<SignInPage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
