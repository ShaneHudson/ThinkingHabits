document.addEventListener("DOMContentLoaded", function()  {
  var el_habits = document.querySelectorAll('[name=habits]');
  var details = {
    habits: []
  };

  for (var i = 0; i < el_habits.length; i++) {
    var el_habit = el_habits[i];
    el_habit.addEventListener('change', function selectHabit()  {
      var el_habits_checked = document.querySelectorAll('[name=habits]:checked');
      details.habits = [];

      for (var j = 0; j < el_habits_checked.length; j++)  {
        details.habits[j] = el_habits_checked[j].getAttribute('value');
      }

      console.log(details);
      if (el_habits_checked.length > 0) {
        var date = new Date();
        document.querySelector('.js-time').value = date.getHours() + ":" + date.getMinutes();
        document.querySelector('.js-date').valueAsDate = date;
        document.querySelector('.js-next').setAttribute('style', 'display:block');
      }
      else  {
        document.querySelector('.js-next').setAttribute('style', 'display:none');
      }
    });
  }

  var el_save = document.querySelector('.js-save');
  el_save.addEventListener('click', function saveDetails(e)  {
    // Store everything in details {} then save to local storage
    details.date = new Date(document.querySelector('.js-date').value + "T" + document.querySelector('.js-time').value).toISOString().slice(0,16);
    details.notes = document.querySelector('.js-notes').value;
    console.log(details);


    // add details to local storage
    if (window.localStorage)  {
      window.localStorage.setItem(details.date, JSON.stringify(details));
    }

    document.querySelector('.js-date').value = "";
    document.querySelector('.js-notes').value = "";
    document.querySelector('.js-details').setAttribute('style', 'display:none');
  });

  function getAllData()  {
    var output = {};
    for (i = 0; key = window.localStorage.key(i); i++) {
      output[key] = window.localStorage.getItem(key);
    }
    return output;
  }

  var el_export = document.querySelector('.js-export');
  el_export.addEventListener('click', function exportData()  {
    console.log(getAllData());
    var data = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(getAllData()));
    this.setAttribute("href", data);
    this.setAttribute("download", "thinkinghabits-export.json");
    this.click();
  });
  
  // habits is an array of habit objects
  function timeline(log)  {
    var el_timeline = document.querySelector('.js-timeline');
    el_timeline.innerHTML = "";

    for (var i = 0; i < log.length; i++)  {
      var log_item = log[i];
      el_timeline.innerHTML += "<li><p>" + log_item.date + "</p>";
      el_timeline.innerHTML += "<p>" + log_item.habits + "</p>";
      el_timeline.innerHTML += "<p>" + log_item.notes + "</p>";
      el_timeline.innerHTML += "</li>";
    }
  }


  var width = 960,
    height = 136,
    cellSize = 17; // cell size

  var day = d3.time.format("%w"),
    week = d3.time.format("%U"),
    percent = d3.format(".1%"),
    format = d3.time.format("%Y-%m-%d");

  /*
   var color = d3.scale.quantize()
   .domain([-.05, .05])
   .range(d3.range(11).map(function(d) { return "q" + d + "-11"; }));
   */

  var color = d3.scale.category10();
  var dateParse = d3.time.format("%m/%d/%Y");
  var today = new Date();

  var svg = d3.select("#tab_timeline").selectAll("svg")
    .data(d3.range(today.getFullYear(), today.getFullYear()+1))
    .enter().append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("class", "RdYlGn")
    .append("g")
    .attr("transform", "translate(" + ((width - cellSize * 53) / 2) + "," + (height - cellSize * 7 - 1) + ")");

  svg.append("text")
    .attr("transform", "translate(-6," + cellSize * 3.5 + ")rotate(-90)")
    .style("text-anchor", "middle")
    .text(function(d) { return d; });

  var rect = svg.selectAll(".day")
    .data(function(d) { return d3.time.days(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
    .enter().append("rect")
    .attr("class", function(d)  {
      if (new Date(d) > new Date()) return "day";
      else return "day q6-11";
    })
    .attr("width", cellSize)
    .attr("height", cellSize)
    .attr("x", function(d) { return week(d) * cellSize; })
    .attr("y", function(d) { return day(d) * cellSize; })
    .datum(format);

  rect.append("title")
    .text(function(d) { return d; });

  svg.selectAll(".month")
    .data(function(d) { return d3.time.months(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
    .enter().append("path")
    .attr("class", "month")
    .attr("d", monthPath);

    /*var data = d3.nest()
     .key(function(d) { return d.Date; })
     .rollup(function(d) { return (d[0].Close - d[0].Open) / d[0].Open; })
     .map(csv);
     */

  var formatTime = function(input, formatInput, formatOutput){
    var dateParse = d3.time.format(formatInput).parse;
    var dateFormat = d3.time.format(formatOutput);
    return dateFormat(dateParse(input));
  };

  var rawData = getAllData();
  var data = [];

  function pad(n){return n<10 ? '0'+n : n}

  for (var i = 0; i < Object.keys(rawData).length; i++) {
    var key = Object.keys(rawData)[i];
    var d = rawData[key];
    d = JSON.parse(d);
    var date = new Date(d.date);
    d.dd = date.getFullYear() + "-" + pad(date.getMonth()+1) + "-" + pad(date.getDate());
    data.push(d);
  }

  window.nest = d3.nest()
    .key(function(d) { return d.dd; })
    .map(data);

  // color.domain(d3.set(data.map(function(d) { return d.habits; })).values());

  rect.filter(function(d) { return d in nest; })
  //.attr("class", function(d) { return "day " + color(data[d]); })
    .attr("class", function(d) {
      var rectclass = "day q4-11";
      if (nest[d].length > 1) rectclass = "day q3-11";
      if (nest[d].length > 3) rectclass = "day q2-11";
      if (nest[d].length > 5) rectclass = "day q1-11";
      if (nest[d].length > 8) rectclass = "day q0-11";
      return rectclass;
    })
    .on("click", function(d, i)  {
      timeline(nest[d]);
    })
    .select("title")
    //.text(function(d) { return d + ": " + percent(data[d]); });
    .text(function(d) {
      var text = d + ": ";
      for (var i = 0; i < nest[d].length; i++)  {
        for (var j = 0; j < nest[d][i].habits.length; j++)  {
          if (i == 0 && j == 0) text += nest[d][i].habits[j];
          else text += ", " + nest[d][i].habits[j];
        }
      }
      return text;
    });

  function monthPath(t0) {
    var t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0),
      d0 = +day(t0), w0 = +week(t0),
      d1 = +day(t1), w1 = +week(t1);
    return "M" + (w0 + 1) * cellSize + "," + d0 * cellSize
      + "H" + w0 * cellSize + "V" + 7 * cellSize
      + "H" + w1 * cellSize + "V" + (d1 + 1) * cellSize
      + "H" + (w1 + 1) * cellSize + "V" + 0
      + "H" + (w0 + 1) * cellSize + "Z";
  }


});