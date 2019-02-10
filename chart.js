var fn = {};
var vars = {};

vars.margin = {
  top: 100, right: 100, bottom: 100, left: 100
};

vars.chart = {
  width: 960 - vars.margin.left - vars.margin.right,
  height: 500 - vars.margin.top - vars.margin.bottom,
  containers: {},
  selections: {}
};

vars.data = {};

vars.data.points = [
  { x: -2, y: 1 },
  { x: 1, y: 5 },
  { x: 4, y: -3 },
  { x: 6, y: 8 },
  { x: 8, y: 10 }
];

vars.data.points2 = [
  { x: -2, y: -3 },
  { x: 1, y: 5 },
  { x: 4, y: -3 },
  { x: 8, y: 8 },
  { x: 6, y: 10 }
];

fn.random_int_inclusive = function(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);

  // The maximum is inclusive and the minimum is inclusive
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

fn.random_point = function(min, max) {
  var obj = {
    x: fn.random_int_inclusive(min, max),
    y: fn.random_int_inclusive(min, max)
  };

  return obj;
}

fn.update_data_points = function(min, max) {
  var num_points = fn.random_int_inclusive(5, 15);

  vars.data.points =  $.map(d3.range(num_points), function() {
    return fn.random_point(min, max);
  });
};

fn.set_up_scale = function(data) {
  vars.data.ymin = d3.min(data, function (pt) {
    return pt.y;
  });

  vars.data.ymax = d3.max(data, function (pt) {
    return pt.y;
  });

  vars.data.xmin = d3.min(data, function (pt) {
    return pt.x;
  });

  vars.data.xmax = d3.max(data, function (pt) {
    return pt.x;
  });

  vars.chart.x_scale = d3.scaleLinear()
    .domain([vars.data.xmin, vars.data.xmax]) // input
    .range([0, vars.chart.width]); // output

  vars.chart.y_scale = d3.scaleLinear()
    .domain([vars.data.ymin, vars.data.ymax]) // input
    .range([vars.chart.height, 0]); // output
};

fn.draw_x_axis = function(selection, scale) {
  selection.transition().call(d3.axisBottom(scale));
}

fn.draw_y_axis = function(selection, scale) {
  selection.transition().call(d3.axisLeft(scale));
}

fn.draw_points = function(selection, data, x_scale, y_scale) {
  var update = selection.selectAll("circle")
      .data(data);

  update.enter().append("circle")
    .merge(update).transition()
    .attr("class", "data-point")
    .attr("r", 5)
    .attr("cx", function(d) {
      return x_scale(d.x);
    })
    .attr("cy", function(d) {
      return y_scale(d.y);
    })
    .attr("fill", "black");


  // Remove data no longer needed.
  update.exit().remove();
}

fn.draw_chart = function() {
  fn.set_up_scale(vars.data.points)

  fn.draw_x_axis(vars.chart.selections.x_axis, vars.chart.x_scale);
  fn.draw_y_axis(vars.chart.selections.y_axis, vars.chart.y_scale);

  vars.chart.line_fn = d3.line()
    .x(function(d, i) {
      return vars.chart.x_scale(d.x);
    })
    .y(function(d) {
      return vars.chart.y_scale(d.y);
    })

  // Vertical line at x = 0
  var origin_vert_data = [
    { x: 0, y: vars.data.ymin },
    { x: 0, y: vars.data.ymax }
  ];
  var origin_horiz_data = [
    { x: vars.data.xmin, y: 0 },
    { x: vars.data.xmax, y: 0 }
  ];

  var origin_vert_selection = vars.chart.selections.origin_vert
      .selectAll("path#origin-line-vert")
      .data([origin_vert_data])
  var origin_horiz_selection = vars.chart.selections.origin_horiz
      .selectAll("path#origin-line-horiz")
      .data([origin_horiz_data])

  origin_vert_selection.enter().append("path")
    .merge(origin_vert_selection).transition()
    .attr("class", function() {
      // We only want to draw the vertical axis if the domain (x axis)
      // actually contains zero on the visible part of the chart.
      if (vars.data.xmin < 0 && vars.data.xmax > 0) {
        return "origin-line";
      } else {
        return "origin-line invisible";
      }
    })
    .attr("id", "origin-line-vert")
    .attr("d", vars.chart.line_fn);

  origin_horiz_selection.enter().append("path")
    .merge(origin_horiz_selection).transition()
    .attr("class", function() {
      if (vars.data.ymin < 0 && vars.data.ymax > 0) {
        return "origin-line";
      } else {
        return "origin-line invisible";
      }
    })
    .attr("id", "origin-line-horiz")
    .attr("d", vars.chart.line_fn);

  origin_vert_selection.exit().remove();
  origin_horiz_selection.exit().remove();

  // vars.svg.selectAll("path.origin-line").remove();

  // line_horiz
  //   .selectAll("path#origin-line-horiz")
  //   .data([origin_horiz])
  //   .enter().append("path")
  //   .merge(line_horiz)
  //   .attr("class", "origin-line")
  //   .attr("id", "origin-line-horiz")
  //   .attr("d", vars.chart.line_fn);

  // line_horiz.


  // vars.svg
  //   .selectAll("path#origin-line-vert")
  //   .data(origin_vert)
  //   .enter().append("path")
  //   .merge(vars.svg)
  //   .attr("class", "origin-line")
  //   .attr("id", "origin-line-vert")
  //   .attr("d", vars.chart.line_fn);
  // vars.svg
  //   .datum(origin_horiz).merge(vars.svg)
  //   .append("path")
  //   .attr("class", "origin-line")
  //   .attr("id", "origin-line-horiz")
  //   .attr("d", vars.chart.line_fn);

  fn.draw_points(vars.chart.selections.points,
                 vars.data.points,
                 vars.chart.x_scale,
                 vars.chart.y_scale);

}





fn.main = function() {
  d3.select("#update").on("click", function() {
    fn.update_data_points(-10, 10);
    fn.draw_chart();
  });

  vars.svg = d3.select("#chart-div")
    .append("svg")
    .attr("id", "chart-svg")
    .attr("width", vars.chart.width + vars.margin.left + vars.margin.right)
    .attr("height", vars.chart.height + vars.margin.top + vars.margin.bottom)
  // Having a g here with the transform allows us to ignore margins from here on
    .append("g")
    .attr("transform", "translate(" + vars.margin.left + ", " + vars.margin.top + ")");

  // X axis selection
  vars.chart.selections.x_axis = vars.svg.append("g")
    .attr("class", "axis")
    .attr("id", "x-axis")
  // Have it at the bottom
    .attr("transform", "translate(0," + vars.chart.height + ")")

  // Y axis selection
  vars.chart.selections.y_axis = vars.svg.append("g")
    .attr("class", "axis")
    .attr("id", "y-axis")

  vars.chart.selections.origin_vert = vars.svg.append("g");
  vars.chart.selections.origin_horiz = vars.svg.append("g");

  // Point container
  vars.chart.selections.points = vars.svg
    .append("g")
    .attr("class", "data-point-container")

  fn.draw_chart();

};
