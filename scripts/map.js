// Constants
const MAP_ID = 'map';
const MAP_DEFAULT_LATLONG = [25, 20];
const MAP_DEFAULT_ZOOM = 3;
const MAP_MIN_ZOOM = 1;
const MAP_MAX_ZOOM = 15;
const GEOJSON_PATH = '../data/2023d-combined-simplified.json';
const GEOJSON_TZID = 'tzid';
const TILES_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const TILES_COPYRIGHT_URL = 'http://www.openstreetmap.org/copyright';
const TILES_ATTRIBUTION = `&copy; <a href="${TILES_COPYRIGHT_URL}">OpenStreetMap</a>`;

// Styles
const ZONE_STYLE_DEFAULT = {
    color: '#ffffff',
    weight: 2,
    opacity: 1,
    dashArray: '3',
    fillColor: '#fd8d3c',
    fillOpacity: 0.1,
};
const ZONE_STYLE_HOVER = {
    color: '#666666',
    weight: 5,
    dashArray: '',
    fillOpacity: 0.3,
};
const ZONE_STYLE_SELECTED = {
    weight: 5,
    dashArray: '',
    fillColor: '#0000ff',
    fillOpacity: 0.3,
};

// Selectors
let tzValueEl = document.getElementById('tz-value');
let tzCopiedEl = document.getElementById('tz-copied');

// Variables
let autoDetectedTimeZone;
let selectedTimeZone;
let map;
let geoJsonLayer, tileLayer;
let selectedZoneLayer;
let hoveredZoneLayer;
let copiedTimer;

init();

async function init() {
    // Auto-detect time zone (shown as the starting value, not copied)
    autoDetectedTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (autoDetectedTimeZone) {
        selectedTimeZone = autoDetectedTimeZone;
        tzValueEl.innerText = autoDetectedTimeZone;
    }

    map = L.map(MAP_ID).setView(MAP_DEFAULT_LATLONG, MAP_DEFAULT_ZOOM);

    tileLayer = L.tileLayer(TILES_URL, {
        minZoom: MAP_MIN_ZOOM,
        maxZoom: MAP_MAX_ZOOM,
        attribution: TILES_ATTRIBUTION,
    }).addTo(map);

    let response = await fetch(GEOJSON_PATH);
    let json = await response.json();
    geoJsonLayer = L.geoJson(json, {
        style: _feature => ZONE_STYLE_DEFAULT,
        onEachFeature: initFeature,
    }).addTo(map);
}

function initFeature(_feature, zoneLayer) {
    zoneLayer.on({
        mouseover: hoverOnZone,
        mouseout: hoverOffZone,
        click: clickZone,
    });

    // Pre-select the auto-detected zone (highlight only, no copy)
    if (zoneLayer.feature.properties[GEOJSON_TZID] == autoDetectedTimeZone) {
        selectZoneLayer(zoneLayer);
    } else {
        zoneLayer.bringToBack();
    }
}

function hoverOnZone(event) {
    let zoneLayer = event.target;

    // Preview the hovered zone in the label
    tzValueEl.innerText = zoneLayer.feature.properties[GEOJSON_TZID];

    // Reset any previously hovered zone whose mouseout may have been dropped:
    // bringToFront/bringToBack reorder the SVG paths mid-hover and can swallow
    // the matching mouseout, otherwise leaving that zone stuck in the hover style.
    if (
        hoveredZoneLayer &&
        hoveredZoneLayer !== zoneLayer &&
        hoveredZoneLayer !== selectedZoneLayer
    ) {
        geoJsonLayer.resetStyle(hoveredZoneLayer);
        hoveredZoneLayer.bringToBack();
    }
    hoveredZoneLayer = undefined;

    if (zoneLayer == selectedZoneLayer) {
        return;
    }

    zoneLayer.setStyle(ZONE_STYLE_HOVER);
    zoneLayer.bringToFront();
    hoveredZoneLayer = zoneLayer;
}

function hoverOffZone(event) {
    let zoneLayer = event.target;

    // Restore the label to the current selection when the pointer leaves a zone
    if (selectedTimeZone) {
        tzValueEl.innerText = selectedTimeZone;
    }

    if (zoneLayer == selectedZoneLayer) {
        return;
    }

    geoJsonLayer.resetStyle(zoneLayer);
    zoneLayer.bringToBack();
    if (hoveredZoneLayer === zoneLayer) {
        hoveredZoneLayer = undefined;
    }
}

function clickZone(event) {
    let zoneLayer = event.target;
    selectZoneLayer(zoneLayer);
    // Real user gesture: copy automatically and confirm
    copyZone(selectedTimeZone);
}

function selectZoneLayer(zoneLayer) {
    if (selectedZoneLayer && selectedZoneLayer != zoneLayer) {
        geoJsonLayer.resetStyle(selectedZoneLayer);
        selectedZoneLayer.bringToBack();
    }

    zoneLayer.setStyle(ZONE_STYLE_SELECTED);
    zoneLayer.bringToFront();
    selectedZoneLayer = zoneLayer;
    selectedTimeZone = zoneLayer.feature.properties[GEOJSON_TZID];
    tzValueEl.innerText = selectedTimeZone;
    map.fitBounds(zoneLayer.getBounds());
}

async function copyZone(tz) {
    if (!tz) {
        return;
    }
    try {
        await navigator.clipboard.writeText(tz);
        showCopied();
    } catch (e) {
        // Clipboard blocked (rare): the zone is still selected, just no auto-copy.
    }
}

function showCopied() {
    tzCopiedEl.classList.add('show');
    clearTimeout(copiedTimer);
    copiedTimer = setTimeout(() => tzCopiedEl.classList.remove('show'), 1600);
}
