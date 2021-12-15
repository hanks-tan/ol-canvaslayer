import ImageLayer from "ol/layer/Image";
import ImageCanvasSource from "ol/source/ImageCanvas";
import {
  create as createTransform,
  multiply as multiplyTransform,
  compose as composeTransform,
  makeInverse
} from 'ol/transform';
import CanvasImmediateRenderer from 'ol/render/canvas/Immediate';
import { getSquaredTolerance } from 'ol/renderer/vector';
import { getUserProjection, getTransformFromProjections } from 'ol/proj';
import Style from "ol/style/Style";
class CanvasLayer {
  constructor(options) {
    this.map_ = options.map
    this.style_ = options.style
    this.init()
  }

  init() {
    var canvasLayer = new ImageLayer({
      source: new ImageCanvasSource({
        canvasFunction: this.canvasFunc_.bind(this),
        projection: 'EPSG:4326'
      })
    })
    this.layer_ = canvasLayer
    if (this.map_) {
      this.map_.addLayer(this.layer_)
    }
  }
  
  canvasFunc_ (extent, resolution, pixelRatio, size, projection) {
    console.time('render')
    var canvas = document.createElement('canvas');
    var vc = this.getCanvasVectorContext(canvas, extent, resolution, pixelRatio, size, projection)
    if (this.data) {
      if (this.style_ instanceof Style) {
        this.data.forEach(item => {
          vc.drawFeature(item, this.style_)
        })
      } else if (this.style_ instanceof Function) {
        this.data.forEach(item => {
          var style = this.style_(item)
          vc.drawFeature(item, style)
        })
      }
    }
    console.timeEnd('render')
    return canvas;
  }

  getCanvasVectorContext(canvas, extent, resolution, pixelRatio, size, projection) {
    canvas.width = size[0] * pixelRatio;
    canvas.height = size[1] * pixelRatio;
    // let width = Math.round(size[0] * pixelRatio);
    // let height = Math.round(size[1] * pixelRatio);
    let width = size[0]
    let height = size[1]
    let context = canvas.getContext('2d');

    let coordinateToPixelTransform = createTransform();
    let pixelTransform = createTransform();
    let inversePixelTransform = createTransform();

    let rotation = this.map_.getView().getRotation();
    let center = this.map_.getView().getCenter();
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

  showData (data) {
    this.data = data
  }
}

export default CanvasLayer