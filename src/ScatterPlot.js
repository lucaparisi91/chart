import React, { useState, useEffect, useLayoutEffect, useMemo } from 'react';
import logo from './logo.svg';
import './App.css';
import $ from "jquery";
import * as d3 from 'd3';


const boxSettings = 
{
    width : 600,
    height : 400,
    marginLeft : 40,
    marginRight : 10,
    marginBottom : 30,
    marginTop : 10,

    innerWidth : function() {return this.width - this.marginLeft - this.marginRight;},

    innerHeight : function(){return this.height - this.marginTop - this.marginBottom;}

};



const xAxis = 
{
  domain : [0,1],
  axis : "x"
};

const yAxis = Object.assign({},xAxis);
yAxis.axis="y"




const Figure = ()=>
{

}




const useAxis= (settings) =>
{
  const [xAxis,setXAxis] = useState(settings);

  let range=settings.range;
  if (settings.axis == "y")
  {
    range=range.reverse();
  }
  
  const scale = d3.scaleLinear()
  .domain(xAxis.domain)
  .range(xAxis.range);

  return [{...settings,scale},setXAxis]
}

const figureSettings = 
{
  box : boxSettings,
  axis : [xAxis,yAxis],
  xLabel : "x",
  yLabel : "y"
}










const Tick = ({orientation,width,innerWidth=0}) =>
{
    let innerTick;

    const getTickEndPoints= (orientation) =>
    {
        if (orientation === "bottom")
        {
            return [ [0,0] , [0,width]    ]
        }
        else if (orientation === "left")
        {
        return [ [-width,0] , [0,0]  ]
        }
    }

    if (orientation === "bottom")
    {
        innerTick=
        <line 
        className="inner"
        x1={0} 
        x2={0}
        y1={0}
        y2={-innerWidth}
        />
    }

    
    if (orientation === "left")
    {
        innerTick=
        <line 
        className="inner"
        x1={0} 
        x2={innerWidth}
        y1={0}
        y2={0}
        />
    }
    




    const [ [x1,y1], [x2,y2]  ] =getTickEndPoints(orientation);



    return <g className="tick">   
     <line className="outer"
        x1={x1}
        x2={x2}

        y1={y1}
        y2={y2}
        />

        {innerTick}
        </g>

    
}




  const Axis = ({scale , axis , innerTickWidth=10}) =>
{

    const range = scale.range();

    const getOrientation = (axis) =>
    {
      if (axis === "x")
      {
        return "bottom"
      }
      else
      {
        if (axis==="y")
        {
          return "left"
        }
      }
    }

    const orientation = getOrientation(axis);


    const tickWidth=6;
    
    
    const width= range[1] - range[0];


    const tickValues = scale.ticks()
    const tickRangeOffsets = tickValues.map( (offSet) => scale(offSet))
    
    const ticks = d3.zip(tickRangeOffsets,tickValues).map(([offSet,label]) => {

    const tick = <Tick orientation={orientation} width={tickWidth} innerWidth={innerTickWidth} ></Tick>;
    let tickTransform;
    let labelTransform;
    
    if ( orientation == "bottom" )
    {
        tickTransform=`translate(${offSet},0)`;
        labelTransform=`translateY(${ 20}px)`;

    }
    else if (orientation == "left")
    {
        tickTransform=`translate(0,${offSet})`;
        labelTransform=`translateX(-${20}px)`;

    }



    return <g transform={tickTransform} key={offSet}>
            {tick}
            <text
            style={{
              fontSize: "10px",
              textAnchor: "middle",
              transform: labelTransform
            }}>
                {label}
            </text>
        </g>
    });


    const getEndPoints= (orientation,range) =>
    {
        if ( orientation == "bottom" )
            {
            return [[range[0],0] , [range[1],0] ]
            }
        else if (orientation == "left")
            {
                return [[0,range[0]] , [0,range[1]]]
            }
    }


    const [[x1,y1],[x2,y2]] = getEndPoints(orientation,range);


    return  <g >

                <line
                x1={x1} 
                x2={x2}
                y1={y1}  
                y2={y2} 
                />  

                {ticks}

                </g>
}

const Scatter=({data,xLabel,yLabel,xScale,yScale,line}) =>
{
    const transformedData = data.map( 
        (d) =>{
            return [ xScale(d[xLabel]) , yScale(d[yLabel]) ]
        }
    );

    

    

     const dots=transformedData.map( (d)=>
    {
        return <Dot 
        key={`${d[0]}-${d[1]}`} 
        kind="circle" 
        x={d[0]}
        y={d[1]} 

        size={20}

        />
    });

    const lineGenerator = d3.line();

    const d=lineGenerator(transformedData);
    let lineElement={};

    if (line === undefined )
    {
    lineElement = <path
     d={d}
     style={{
         fill:"none",
         "strokeWidth": 2,
         "strokeLinejoin" :"round",
         "strokeLinecap": "round",
         "stroke" : "blue",
         "strokeDasharray":"6,6"
        }}
     > </path>;
    }

    return <g  >
        {dots}
        {lineElement}
        </g>
};

const Dot = ({kind,size,x,y}) =>
{

    if (kind === "circle")
    {
        const r=Math.sqrt(size);
        return <circle cx={x} cy={y} r={r} 
        />;
    }

}



const HilightBox = ( {left,right,bottom,top, xScale, yScale,show}) =>
{
    const x1 = xScale(left);
    const x2 = xScale(right);
    const y1 = yScale(bottom);
    const y2 = yScale(top);

    const width= Math.abs(x2 - x1);
    const height= Math.abs(y1 - y2);


    const visibility = (show === true) ? "visible" : "hidden";

    const leftX = Math.min(x1,x2);
    const topX = Math.min(y1,y2);

    return <g className="hilightBox" transform={`translate(${leftX},${topX})`} visibility={visibility}>
        <rect width={width} height={ height   }  />
    </g>

}


function ScatterPlot( {data,settings=figureSettings})
  {

  const [formattedData,setFormattedData]= useState(data);
  
  const [ box, setBox ] = useState(settings.box);
  const [ xAxis , setXAxis]= useAxis( { ...settings.axis[0], range : [0,box.innerWidth()]});
  const [ yAxis , setYAxis]= useAxis( { ...settings.axis[1], range : [0,box.innerHeight()],axis:"y"});



  const [xLabel,setXLabel] = useState(data.columns[0]);
  const [yLabel,setYLabel] = useState(data.columns[1] );


  
  const toogleZoom = ()=>
  {
    setZooming(!zooming);
  };


  const [zooming,setZooming] = useState(true);


  const xDataDomain = useMemo (()=>{
    return  d3.extent( data, (d) => {return d[xLabel] } );


  },[data,xLabel]);

  const yDataDomain = useMemo (()=>{
    return d3.extent( data, (d) => {return d[yLabel] } );


  },[data,yLabel]);



  useLayoutEffect( ()=>{
    setXAxis({ ...xAxis,domain : xDataDomain}); 
  },[xLabel,data])

  useLayoutEffect( ()=>{
    setYAxis({ ...yAxis,domain : yDataDomain}); 
  },[yLabel,data])

  const [selectionBox, setSelectionBox] =useState({left: 0 , right:0.5,bottom:-0.2,top:1.4,show : false});

  const resize = (xRange,yRange) =>
  {
    setXAxis({...xAxis,domain: xRange});
    setYAxis({...yAxis,domain: yRange});


  }

  const onMouseDownPlotArea= (e)=>
  {

    if (zooming)
    {
    const left=xAxis.scale.invert(e.nativeEvent.offsetX -box.marginLeft) ;

    const top=yAxis.scale.invert(e.nativeEvent.offsetY - box.marginTop) ;

    const newBox = {left: left, top : top, right:left,bottom:top,show :true};
    
    setSelectionBox(newBox);
    }

  }

  useEffect(()=> {

    document.addEventListener("mouseup",onMouseUpPlotArea)

    return ()=>{document.removeEventListener("mouseup",onMouseUpPlotArea);}
  } ) ;


  const onMouseUpPlotArea = (e) =>
  {
    if (zooming & selectionBox.show === true)
    {
    
    setSelectionBox({...selectionBox,show:false});

    const xRange = [selectionBox.left , selectionBox.right].sort();

    const yRange = [selectionBox.bottom,selectionBox.top].sort();

    if ( ( (xRange[1] - xRange[0]) > 0 ) & 
         ( (yRange[1] - yRange[0]) > 0 )
        )
        {
          resize(xRange,yRange);
        }

      }
  } 

  const onMoveHlightBox = (e) =>
  {
    if (zooming)
    {
    
    const right=xAxis.scale.invert(e.nativeEvent.offsetX - box.marginLeft) ;

    const bottom=yAxis.scale.invert(e.nativeEvent.offsetY - box.marginTop) ;

    

    setSelectionBox({...selectionBox,right:right,bottom:bottom});
    }
    
  }

  

  const reset= ()=>
  {
    resize(xDataDomain,yDataDomain);
  }


  return (
    <div className="scatterPlot">
      <svg width={box.width} height={box.height}  >


      {/*  Plotting area */}

      

      <g 
                    transform={
                        `translate(${boxSettings.marginLeft}, ${boxSettings.marginTop})`
                    }

                >
                <clipPath id="chartArea">
                <rect  style={{width:box.innerWidth(),height:box.innerHeight()}} />
                </clipPath>
                
                

                <rect className="plotArea" style={{width:box.innerWidth(),height:box.innerHeight()}} 
                
                onMouseDown={onMouseDownPlotArea}

                onMouseMove={onMoveHlightBox}
                
                
                />

                <HilightBox 

                            {... selectionBox}
                            xScale = {xAxis.scale}
                            yScale = {yAxis.scale}
                            

                        />
                
                    <g  clipPath="url(#chartArea)">
                        <Scatter
                        data={data} 
                        xScale={xAxis.scale}
                        yScale={yAxis.scale}
                        xLabel={xLabel}
                        yLabel={yLabel}
                        />
                    </g>
                </g>


     { /* Create Axis */}

     <g 
                transform={
                    `translate(${box.marginLeft}, ${box.height - box.marginBottom})`
                    }
                className="axis"
                >
                <Axis {...xAxis}
                innerTickWidth= {box.innerHeight()}
                />

      </g>


      <g 
                  transform={
                      `translate(${box.marginLeft}, ${box.marginTop})`
                      }
                  className="axis"
                  >
                  <Axis {...yAxis}
                  innerTickWidth={box.innerWidth()}
                  />

      </g>


      </svg>
      <button onClick= {()=>{setZooming(true)}} >
        Zoom
      </button>

      <button onClick= {reset} >
        Reset
      </button>
        

    </div>
  );
}

export default ScatterPlot;
