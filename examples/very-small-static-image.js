import GeoJSON from 'ol/format/GeoJSON.js';
import ImageLayer from '../src/ol/layer/Image.js';
import Map from '../src/ol/Map.js';
import Projection from '../src/ol/proj/Projection.js';
import Static from '../src/ol/source/ImageStatic.js';
import VectorLayer from '../src/ol/layer/Vector.js';
import VectorSource from '../src/ol/source/Vector.js';
import View from '../src/ol/View.js';
import {getCenter} from '../src/ol/extent.js';

// Map views always need a projection.  Here we just want to map image
// coordinates directly to map coordinates, so we create a projection that uses
// the image extent in pixels.
const extent = [0, 0, 500, 500];

const projection = new Projection({
  code: 'fake-projection',
  units: 'pixels',
  extent: extent,
});

function createVectorLayer(extent) {
  const vectorSource = new VectorSource();
  vectorSource.addFeature(
    new GeoJSON().readFeature({
      type: 'Feature',
      id: '1',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [extent[0], extent[1]],
            [extent[2], extent[1]],
            [extent[2], extent[3]],
            [extent[0], extent[3]],
            [extent[0], extent[1]],
          ],
        ],
      },
      properties: {},
    })
  );
  return new VectorLayer({
    zIndex: 2,
    source: vectorSource,
    style: {
      'stroke-width': 1,
      'stroke-color': 'red',
    },
  });
}

function createImageLayer(options, imageExtent) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const imageData = ctx?.createImageData(
    options.pixelWidth,
    options.pixelHeight
  );

  for (let i = 0; i < imageData.data.length; i += 4) {
    imageData.data[i + 0] = (i / imageData.data.length) * 255;
    imageData.data[i + 1] = (i / imageData.data.length) * 255;
    imageData.data[i + 2] = (i / imageData.data.length) * 255;
    imageData.data[i + 3] = 255;
  }

  ctx?.putImageData(imageData, 0, 0);
  const dataURL = canvas.toDataURL();

  return new ImageLayer({
    zIndex: 1,
    visible: true,
    source: new Static({
      url: dataURL,
      imageExtent: imageExtent,
      interpolate: false,
      projection: projection,
    }),
  });
}

const xLeft = 50;
const xRight = 250;
const xWidth = 100;

const map = new Map({
  layers: [
    // This works
    createImageLayer({pixelWidth: 300, pixelHeight: 300}, [xLeft, 200, xLeft + xWidth, 300]),
    createVectorLayer([xLeft, 200, xLeft + xWidth, 300]),

    // This does not work
    createImageLayer({pixelWidth: 30, pixelHeight: 30}, [xRight, 200, xRight + xWidth, 300]),
    createVectorLayer([xRight, 200, xRight + xWidth, 300]),
  ],
  target: 'map',
  view: new View({
    projection: projection,
    center: getCenter(extent),
    zoom: 2,
    maxZoom: 8,
  }),
});
