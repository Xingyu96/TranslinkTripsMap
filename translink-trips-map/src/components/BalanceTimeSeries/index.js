import React, { Component } from 'react';
import * as d3 from 'd3';
import { LIGHT_BLUE, SVG_HEIGHT, SVG_WIDTH } from '../constants';
import { arrayExpression } from '@babel/types';

class BalanceTimeSeries extends Component {
  constructor(props) {
    super(props);
    this.state = {
      margin: null,
      width: SVG_WIDTH,
      height: SVG_HEIGHT,
      chart: null,
      xChart: null,
      yChart: null,
      xAxis: null,
      yAxis: null,
      datum: null,
    };

    this.createGraph = this.createGraph.bind(this);
    this.updateGraph = this.updateGraph.bind(this);
    this.formatXY = this.formatXY.bind(this);
  }

  componentDidMount() {
    this.createGraph();
    this.updateGraph(this.props.data);
  }

  componentDidUpdate() {
    this.updateGraph(this.props.data);
  }

  formatXY(xChart, yChart, datum){
    let yMax = d3.max(datum, function (d) { return d.value; });
    if(yMax === 0) yMax = 1;
    xChart.domain(d3.extent(datum, function (d) { return d.date; }));
    yChart.domain([0, yMax]);
  }

  createGraph() {
    // set up datum
    var datum = [];
    for (let i = 0; i < this.props.data.length; i++) {
      let item = this.props.data[i];
      if (this.props.data[i][0] && this.props.data[i][1] >= 0) {
        datum.push({
          date: item[0],
          value: item[1],
        });
      }
    }

    // set up chart
    var margin = { top: 20, right: 20, bottom: 50, left: 40 };
    var width = this.state.width;
    var height = this.state.height;

    var chart = d3.select(this.balanceSVG)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var xChart = d3.scaleTime().range([0, width]);
    var yChart = d3.scaleLinear().range([height, 0]);

    this.formatXY(xChart, yChart, datum);

    var xAxis = d3.axisBottom(xChart);
    xAxis.ticks(10).tickFormat(d3.timeFormat("%y-%m-%d"));
    var yAxis = d3.axisLeft(yChart).tickFormat(d3.format(".2f"));;

    // set up axes
    chart.append("g")
      .attr("class", "y axis")
      .call(yAxis);

    chart.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
      .selectAll("text")
      .attr("transform", "rotate(-15)")
      .style("text-anchor", "end");

    // add labels
    chart.append("text")
      .attr("transofrm", "translate(-35," + (height + margin.bottom) / 2 + ") rotate(-90)")
      .text("Account Balance (CAD)");
    chart.append("text")
      .attr("transform", "translate(" + (width / 2) + "," + (height + margin.bottom - 5) + ")")
      .text("Date");

    var line = d3.line()
      .x(function (d, i) { return xChart(d.date); })
      .y(function (d) { return yChart(d.value); });
    chart.append("path")
      .data([datum])
      .attr("class", "line")
      .attr("stroke", LIGHT_BLUE)
      .attr("stroke-width", 5)
      .attr("fill", "none")
      .attr("d", line);

    this.setState({
      chart: chart,
      xChart: xChart,
      yChart: yChart,
      xAxis: xAxis,
      yAxis: yAxis,
      margin: margin,
      datum: datum,
    });

  }

  updateGraph(data) {
    var chart = this.state.chart;
    var xAxis = this.state.xAxis;
    var yAxis = this.state.yAxis;
    var height = this.state.height;
    var xChart = this.state.xChart;
    var yChart = this.state.yChart;

    if (!chart) return;

    var datum = [];
    for (let i = 0; i < this.props.data.length; i++) {
      let item = this.props.data[i];
      if (this.props.data[i][0] && this.props.data[i][1] >= 0) {
        datum.push({
          date: item[0],
          value: item[1],
        });
      }
    }

    this.formatXY(xChart, yChart, datum);

    var line = d3.line()
      .x(function (d, i) { return xChart(d.date); })
      .y(function (d) { return yChart(d.value); })
      .curve(d3.curveStep);

    chart.select(".line")
      .transition()
      .duration(750)
      .attr("d", line(datum));

    // set axes
    chart.select(".y").call(yAxis);
    chart.select('.x')
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);
    chart.select(".x").selectAll("text").attr("transform", "rotate(-15)");


  }

  render() {
    return (
      <div className="">
        {/* <Table striped bordered>
          <thead>
            <tr>
              {this.props.data.map((hourCount, index) =>
                <th key={'hour' + index}>{index + ':00'}</th>)}
            </tr>
          </thead>
          <tbody>
            <tr>
              {this.props.data.map((hourCount, index) =>
                <td key={'hourCount' + index}>{hourCount}</td>
              )}
            </tr>
          </tbody>
        </Table> */}
        <svg width={this.state.width} height={this.state.height} ref={el => this.balanceSVG = el}>

        </svg>
      </div>
    );
  }
}

export default BalanceTimeSeries;
