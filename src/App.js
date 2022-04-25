import './App.css';
import React from 'react';
import BarChart from "./components/barChart/BarChart";

function App() {
  return (
    <div className='App'>
      <div className='header'>
        <div className='wrap'>
          <div className='logo' >
            <img src='png/taipeilogo.png' alt='taipei-logo' />
          </div>
          <h1>臺北市<span>109年</span>人口戶數及性別</h1>
        </div>
      </div>
      <div className='container'>
        <div className='wrap'>
          <BarChart />
        </div>
      </div>
    </div>
  );
}

export default App;
