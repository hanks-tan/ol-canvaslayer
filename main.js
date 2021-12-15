import './style.css';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import LineString from 'ol/geom/LineString';

import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import Feature from 'ol/Feature';
import Style from 'ol/style/Style';
import Stroke from 'ol/style/Stroke';
import Fill from 'ol/style/Fill';

import CanvasLayer from './canvasLayer'

var layer = new VectorLayer({
  source: new VectorSource(),
  style: new Style({
    stroke: new Stroke({
      color: '#FFEB3B',
      width: 2
    }),
    fill: new Fill({
      color: '#7b7f838a'
    })
  })
})

var tile = new TileLayer({
  source: new OSM(),
})
var map = new Map({
  layers: [tile, layer

  ],
  target: 'map',
  view: new View({
    projection: 'EPSG:4326',
    center: [104, 30],
    zoom: 1
  })
});

var randomFeatures = [];
for (var i = 0; i < 100000; i++) {
  var anchor = new Feature({
    geometry: new LineString([[Math.random() * 180, Math.random() * 160 - 80], [Math.random() * 180, Math.random() * 160 - 80], [Math.random() * 180, Math.random() * 160 - 80]])
  });
  randomFeatures.push(anchor)
}

var lineStyle = new Style({
  stroke: new Stroke({
    color: [255, 0, 0, 0.5],
    width: 0.1
  }),
});


var cvLayer = new CanvasLayer({
  map: map,
  style: lineStyle
})

cvLayer.showData(randomFeatures)
