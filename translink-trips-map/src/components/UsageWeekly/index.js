import React, { Component } from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';
import { DAYS, LIGHT_BLUE, SVG_HEIGHT, SVG_WIDTH } from '../constants';

class UsageWeekly extends Component {
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

    var chart = d3.select(this.usageWeeklySVG)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var xChart = d3.scaleBand().range([0, width]);
    var yChart = d3.scaleLinear().range([height, 0]);

    var xAxis = d3.axisBottom(xChart).tickFormat(function (d, i) { return DAYS[i]; });
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
      .text("Day of the week");

    this.setState({
      chart: chart,
      xChart: xChart,
      yChart: yChart,
      xAxis: xAxis,
      yAxis: yAxis,
      margin: margin,
      width: width,
      height: height,
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
    //xChart.domain(DAYS);
    xChart.domain(data.map(function (d, i) { return +i; }));

    // set domain for y axis
    yChart.domain([0, d3.max(data, function (d) { return +d; })]);


    // get width of each bar
    var barWidth = this.state.width / data.length;

    var bars = chart.selectAll(".bar")
      .remove()
      .exit()
      .data(data);

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
        return LIGHT_BLUE;
      });

    // left axis
    chart.select(".y").call(yAxis);
    chart.select('.x')
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);
  }

  render() {
    return (
      <div id="usageWeekly">
        {/* <Table striped bordered>
          <thead>
            <tr>
              <th>{DAYS[6]}</th>
              <th>{DAYS[0]}</th>
              <th>{DAYS[1]}</th>  
              <th>{DAYS[2]}</th>
              <th>{DAYS[3]}</th>
              <th>{DAYS[4]}</th>
              <th>{DAYS[5]}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              {this.props.data.map((dayNum, index) =>
                index < 7 &&
                <td key={'day' + index}>{dayNum}</td>
              )}
            </tr>
          </tbody>
        </Table> */}
        <svg width={this.state.width} height={this.state.height} ref={el => this.usageWeeklySVG = el}>

        </svg>
      </div>
    );
  }
}

UsageWeekly.propTypes = {
  data: PropTypes.array
}

export default UsageWeekly;
