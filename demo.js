import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import LineString from 'ol/geom/LineString';
import ImageLayer from 'ol/layer/Image';
import ImageCanvasSource from 'ol/source/ImageCanvas';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import Feature from 'ol/Feature';
import Style from 'ol/style/Style';
import Stroke from 'ol/style/Stroke';

import {
  create as createTransform,
  multiply as multiplyTransform,
  compose as composeTransform,
  makeInverse
} from 'ol/transform';
import CanvasImmediateRenderer from 'ol/render/canvas/Immediate';
import { getSquaredTolerance } from 'ol/renderer/vector';
import { getUserProjection, getTransformFromProjections } from 'ol/proj';

var layer = new VectorLayer({
  source: new VectorSource()
})

var tile = new TileLayer({
  source: new OSM()
})
var map = new Map({
  layers: [tile

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
  })
});


function getCanvasVectorContext(canvas, extent, resolution, pixelRatio, size, projection) {
  canvas.width = size[0] * pixelRatio;
  canvas.height = size[1] * pixelRatio;
  var [width, height] = size
  let context = canvas.getContext('2d');

  let coordinateToPixelTransform = createTransform();
  let pixelTransform = createTransform();
  let inversePixelTransform = createTransform();

  let rotation = map.getView().getRotation();
  let center = map.getView().getCenter();
  composeTransform(coordinateToPixelTransform,
    size[0] / 2, size[1] / 2,
    1 / resolution, -1 / resolution,
    -rotation,
    -center[0], -center[1]);
  composeTransform(pixelTransform,
    size[0] / 2, size[1] / 2,
    1 / pixelRatio, 1 / pixelRatio,
    rotation,
    -width / 2, -height / 2
  );
  makeInverse(inversePixelTransform, pixelTransform);
  const transform = multiplyTransform(inversePixelTransform.slice(), coordinateToPixelTransform);
  const squaredTolerance = getSquaredTolerance(resolution, pixelRatio);
  let userTransform;
  const userProjection = getUserProjection();
  if (userProjection) {
    userTransform = getTransformFromProjections(userProjection, projection);
  }
  return new CanvasImmediateRenderer(
    context, pixelRatio, extent, transform,
    rotation, squaredTolerance, userTransform);
}

var canvas = document.createElement('canvas');
var canvasLayer = new ImageLayer({
  source: new ImageCanvasSource({
    canvasFunction: (extent, resolution, pixelRatio, size, projection) => {
      console.time('render')
      var vc = getCanvasVectorContext(canvas, extent, resolution, pixelRatio, size, projection)
      randomFeatures.forEach(item => {
        vc.drawFeature(item, lineStyle)
      })
      console.timeEnd('render')
      return canvas;
    },
    projection: 'EPSG:4326'
  })
})
map.addLayer(canvasLayer);