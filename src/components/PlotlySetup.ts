// This file configures react-plotly.js to use the basic distribution
import Plotly from 'plotly.js-basic-dist';
import createPlotlyComponent from 'react-plotly.js/factory';

// Create a Plotly React component using the basic distribution
const Plot = createPlotlyComponent(Plotly);

export default Plot;
