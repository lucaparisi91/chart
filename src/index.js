import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import ScatterPlot from './ScatterPlot';
import * as serviceWorker from './serviceWorker';
import * as d3 from 'd3'


d3.dsv(" ","./test.dat", 
function(d)  {
  const d2={}

  for (const key in d)
  {
    if (!isNaN(d[key]))
    {
      d2[key]=+d[key]
    }
    else
    {
      d2[key]=d[key]
    }
  }
  return d2;

}).then( (data) =>{

  
  
  ReactDOM.render(
    <React.StrictMode>
      <ScatterPlot data={data} />
    </React.StrictMode>,
    document.getElementById('root')
  );

} )


// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
