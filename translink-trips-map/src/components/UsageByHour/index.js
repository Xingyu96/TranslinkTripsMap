import React, { Component } from 'react';
import * as d3 from 'd3';

class UsageByHour extends Component {
  constructor(props) {
    super(props);
    this.state = {
      margin: null,
      width: 700,
      height: 400,
      chart: null,
      xChart: null,
      yChart: null,
      xAxis: null,
      yAxis: null,
    };

    this.createUsageGraph = this.createUsageGraph.bind(this);
    this.updateUsageGraph = this.updateUsageGraph.bind(this);
  }

  componentDidMount() {
    this.createUsageGraph();
    this.updateUsageGraph(this.props.data);
  }

  componentDidUpdate() {
    this.updateUsageGraph(this.props.data);
  }

  createUsageGraph() {
    // set up chart
    var margin = { top: 20, right: 20, bottom: 50, left: 40 };
    var width = this.state.width;
    var height = this.state.height;

    var chart = d3.select(this.usageByHourSVG)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var xChart = d3.scaleBand().range([0, width]);
    var yChart = d3.scaleLinear().range([height, 0]);

    var xAxis = d3.axisBottom(xChart);
    var yAxis = d3.axisLeft(yChart).tickFormat(d3.format("d"));

    // set up axes
    chart.append("g")
      .attr("class", "y axis")
      .call(yAxis);

    chart.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
      .selectAll("text")
      .style("text-anchor", "end");

    // add labels
    chart.append("text")
      .attr("transofrm", "translate(-35," + (height + margin.bottom) / 2 + ") rotate(-90)")
      .text("# of times used");
    chart.append("text")
      .attr("transform", "translate(" + (width / 2) + "," + (height + margin.bottom - 5) + ")")
      .text("Hour of day");

    this.setState({
      chart: chart,
      xChart: xChart,
      yChart: yChart,
      xAxis: xAxis,
      yAxis: yAxis,
      margin: margin,
    });

  }

  updateUsageGraph(data) {
    var xChart = this.state.xChart;
    var yChart = this.state.yChart;
    var chart = this.state.chart;
    var xAxis = this.state.xAxis;
    var yAxis = this.state.yAxis;
    var height = this.state.height;

    if (!chart) return;

    // set domain of x axis
    xChart.domain(data.map(function (d, i) { console.log(i); return i + ':00'; }));

    // set domain for y axis
    yChart.domain([0, d3.max(data, function (d) { return +d; })]);

    // get width of each bar
    var barWidth = this.state.width / data.length;

    // exit bars
    var bars = chart.selectAll(".bar")
      .remove()
      .exit()
      .data(data);

    // enter bars
    bars.enter().append("rect")
      .attr("class", "bar")
      .attr("x", function (d, i) { return i * barWidth + 1 })
      .attr("y", function (d) { return yChart(0); })
      .attr("height", 0)
      .attr("width", barWidth - 5)
      .transition()
      .duration(750)
      .attr("y", function (d) { return yChart(d); })
      .attr("height", function (d) { return height - yChart(d); })
      .attr("fill", function (d) {
        return "rgb(179, 205, 227)";
      });

    // set axes
    chart.select(".y").call(yAxis);
    chart.select('.x')
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);
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
        <svg width={this.state.width} height={this.state.height} ref={el => this.usageByHourSVG = el}>

        </svg>
      </div>
    );
  }
}

export default UsageByHour;
