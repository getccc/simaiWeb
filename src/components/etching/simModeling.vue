<template>
  <div class="simModeling-container">
    <div ref="container" class="simModeling-map"></div>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref } from "vue";
import mapImage from "@/assets/images/map/map.png";
import Map from "ol/Map";
import View from "ol/View";
import ImageLayer from "ol/layer/Image";
import VectorLayer from "ol/layer/Vector";
import ImageStatic from "ol/source/ImageStatic";
import VectorSource from "ol/source/Vector";
import Draw from "ol/interaction/Draw";
import Overlay from "ol/Overlay";
import Projection from "ol/proj/Projection";
import Style from "ol/style/Style";
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";
import { getCenter } from "ol/extent";

const emit = defineEmits(["regionClick"]);

const container = ref(null);
const mapInstance = ref(null);
const drawInteraction = ref(null);
const overlays = [];

const vectorSource = new VectorSource();
const regionStyle = new Style({
  fill: new Fill({ color: "rgba(30, 144, 255, 0.25)" }),
  stroke: new Stroke({ color: "#1e90ff", width: 2 })
});

const vectorLayer = new VectorLayer({
  source: vectorSource,
  style: regionStyle
});

const DEFAULT_PADDING = 120;
const INITIAL_ZOOM_OUT_STEPS = 3;
const MIN_ZOOM = -1;
const EXTENT_EXPANSION_RATIO = 1;

const loadImageExtent = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve([0, 0, img.width, img.height]);
    };
    img.onerror = reject;
    img.src = src;
  });
};

const expandExtent = (extent, ratio = 0.2) => {
  const [minX, minY, maxX, maxY] = extent;
  const width = maxX - minX;
  const height = maxY - minY;
  const paddingX = width * ratio;
  const paddingY = height * ratio;
  return [minX - paddingX, minY - paddingY, maxX + paddingX, maxY + paddingY];
};

const handleMapClick = (event) => {
  const map = mapInstance.value;
  if (!map) return;

  const feature = map.forEachFeatureAtPixel(event.pixel, (feat) => feat);
  if (feature) {
    emit("regionClick", { feature, coordinate: event.coordinate });
  }
};

const initializeMap = async () => {
  if (!container.value) return;

  try {
    const extent = await loadImageExtent(mapImage);
    const expandedExtent = expandExtent(extent, EXTENT_EXPANSION_RATIO);

    const projection = new Projection({
      code: "sim-modeling-image",
      units: "pixels",
      extent: expandedExtent
    });

    const view = new View({
      projection,
      center: getCenter(extent),
      zoom: 2,
      minZoom: MIN_ZOOM,
      maxZoom: 8,
      extent: expandedExtent
    });

    mapInstance.value = new Map({
      target: container.value,
      layers: [
        new ImageLayer({
          source: new ImageStatic({
            url: mapImage,
            imageExtent: extent,
            projection
          })
        }),
        vectorLayer
      ],
      view,
      controls: []
    });

    const size = mapInstance.value.getSize() ?? [
      container.value.clientWidth || 0,
      container.value.clientHeight || 0
    ];

    view.fit(extent, {
      size,
      padding: [DEFAULT_PADDING, DEFAULT_PADDING, DEFAULT_PADDING, DEFAULT_PADDING]
    });

    const currentZoom = view.getZoom();
    if (typeof currentZoom === "number") {
      view.setZoom(Math.max(MIN_ZOOM, currentZoom - INITIAL_ZOOM_OUT_STEPS));
    }

    mapInstance.value.on("singleclick", handleMapClick);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Failed to initialize OpenLayers map", error);
  }
};

const disposeMap = () => {
  if (!mapInstance.value) return;

  mapInstance.value.un("singleclick", handleMapClick);

  overlays.forEach((overlay) => {
    mapInstance.value.removeOverlay(overlay);
  });
  overlays.length = 0;

  if (drawInteraction.value) {
    mapInstance.value.removeInteraction(drawInteraction.value);
    drawInteraction.value = null;
  }

  mapInstance.value.setTarget(undefined);
  mapInstance.value = null;
};

const drawRegionOnBasemap = (options = {}) => {
  const map = mapInstance.value;
  if (!map) return;

  if (drawInteraction.value) {
    map.removeInteraction(drawInteraction.value);
    drawInteraction.value = null;
  }

  const { type = "Polygon", style = regionStyle, onComplete } = options;

  const draw = new Draw({
    source: vectorSource,
    type
  });

  drawInteraction.value = draw;
  map.addInteraction(draw);

  draw.once("drawend", (evt) => {
    const feature = evt.feature;
    feature.setStyle(style || regionStyle);

    map.removeInteraction(draw);
    drawInteraction.value = null;

    if (typeof onComplete === "function") {
      onComplete(feature);
    }
  });
};

const addImageOverlay = ({ src, coordinate, size, positioning = "center-center" }) => {
  const map = mapInstance.value;
  if (!map || !Array.isArray(coordinate) || coordinate.length !== 2) return null;

  const element = document.createElement("img");
  element.src = src;
  element.alt = "overlay-image";
  element.className = "overlay-image";

  if (size && size.length === 2) {
    const [width, height] = size;
    if (width) element.style.width = `${width}px`;
    if (height) element.style.height = `${height}px`;
  }

  const overlay = new Overlay({
    element,
    position: coordinate,
    positioning,
    stopEvent: false
  });

  overlays.push(overlay);
  map.addOverlay(overlay);

  return overlay;
};

onMounted(async () => {
  await initializeMap();
});

onBeforeUnmount(() => {
  disposeMap();
});

defineExpose({
  drawRegionOnBasemap,
  addImageOverlay
});
</script>

<style scoped>
.simModeling-container {
  width: 100%;
  height: 100%;
  display: flex;
}

.simModeling-map {
  flex: 1;
  min-height: 400px;
}

.overlay-image {
  pointer-events: none;
}
</style>



