var map = L.map("map", {
  center: [39.5, -95.3],
  zoom: 5,
});

// add basemap
var Stamen_TonerLite = L.tileLayer(
  "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
  {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: "abcd",
    maxZoom: 19,
  }
).addTo(map);

// add state borders
var geojsonStates = L.geoJson.ajax("data/us_states.geojson", {
  style: states,
});

geojsonStates.addTo(map);

// add county geojson
var geojson = L.geoJson.ajax("data/counties.geojson", {
  style: style,
  onEachFeature: onEachFeature,
  attribution:
    'Data: <a href="https://data.cdc.gov/Vaccinations/COVID-19-Vaccinations-in-the-United-States-County/8xkx-amqh/data">CDC</a> | Map: Chip Weir',
});

geojson.addTo(map);

//zoom to the highlighted feature when the mouse clicks it
function zoomToFeature(e) {
  map.fitBounds(e.target.getBounds());
}

//add these events to the layer object
function onEachFeature(feature, layer) {
  layer.on({
    mouseover: highlightFeature,
    click: zoomToFeature,
    mouseout: resetHighlight,
  });
}

function getColor(d) {
  return d >= 75
    ? "#2c7bb6"
    : d >= 50
    ? "#abd9e9"
    : d >= 25
    ? "#fdae61"
    : d > 0
    ? "#d7191c"
    : "#5f5f5f";
}

function states(feature) {
  return {
    weight: 4,
    opacity: 1,
    color: "whitesmoke",
  };
}

function style(feature) {
  return {
    weight: 0.75,
    opacity: 0.75,
    color: "whitesmoke",
    fillOpacity: 0.6,
    fillColor: getColor(feature.properties.vaxData_percentVaxxed),
  };
}

var info = L.control();
info.onAdd = function (map) {
  this._div = L.DomUtil.create("div", "info"); // create a div with a class "info"
  this.update();
  return this._div;
};

// method that we will use to update the control based on feature properties passed
info.update = function (props) {
  this._div.innerHTML = props
    ? "<b>" +
      props.NAMELSAD +
      ", " +
      props.STUSPS +
      "</b><br /><b>" +
      props.vaxData_percentVaxxed +
      "</b>" +
      "<b>%</b> of the population is fully vaccinated" +
      "<br />" +
      "<h6>" +
      "As of " +
      props.vaxData_Date +
      "</h6>" +
      "<h6>" +
      "The CDC's definition of fully vaccinated: Someone who has recieved the second dose of a two-dose vaccine or one dose a of singledose vaccine" +
      "</h6>"
    : "Hover over a county";
};
info.addTo(map);

function highlightFeature(e) {
  var layer = e.target;
  layer.setStyle({
    weight: 4,
    opacity: 0.9,
    color: "#dbff4d",
    fillColor: "#dbff4d",
    fillOpacity: 0.7,
  });
  layer.bringToFront();
  info.update(layer.feature.properties);
}

//reset the hightlighted feature when the mouse is out of its region
function resetHighlight(e) {
  geojson.resetStyle(e.target);
  info.update(); // this line will be called later
}

// 4. create the legend
// note that line breaks have been added and may need to be removed
var legend = L.control({ position: "bottomleft" });

legend.onAdd = function (map) {
  var div = L.DomUtil.create("div", "legend"),
    grades = [0, 25, 50, 75],
    labels = [];

  div.innerHTML = '<i style="background:#5f5f5f"></i>No data<br>';

  // loop through our density intervals and generate a label with a colored square for each interval

  for (var i = 0; i < grades.length; i++) {
    div.innerHTML +=
      '<i style="background:' +
      getColor(grades[i] + 1) +
      '"></i> ' +
      grades[i] +
      (grades[i + 1] ? "&ndash;" + grades[i + 1] + "<br>" : "+");
  }

  return div;
};

legend.addTo(map);
/*
TO-DO

update legend to have no number overlap (0-25, 26-50 rather than 25-50)
*/
