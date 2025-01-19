import {
  config,
  Map,
  MapOptions,
  MapStyle,
  // MaptilerProjectionControl,
} from '@maptiler/sdk'

import '@maptiler/sdk/style.css'
import ProjectionToggleControl from '../ProjectionToggleControl'
import { MAP_ORIGIN_LNG_LAT } from '../consts'
import ModelAttributionControl from '../ModelAttributionControl/ModelAttributionControl'

/**
 * Initializes and returns a new map instance with the specified configuration.
 *
 * @returns {Map} A new map instance configured with the specified options.
 */
export async function initMap() {
  checkMapEnvVariables()

  const container = getMapContainer()

  // These options could be made confirgurable by the user
  // But given the scope of this project, it would be
  // premature optimization at present.
  const mapConfig: MapOptions = {
    ...config,
    container,
    apiKey: import.meta.env.VITE_MAPTILER_API_KEY as string,
    style: MapStyle.HYBRID,
    center: MAP_ORIGIN_LNG_LAT,
    zoom: 15,
    minZoom: 1,
    pitch: 80,
    bearing: -0,
    terrain: true,
  }


  const map = new Map(mapConfig)

  // we could do this with the maptiler projection control
  // but I wanted to show how to create a custom control
  map.addControl(new ProjectionToggleControl());
  map.addControl(new ModelAttributionControl());

  return await map.onReadyAsync()
}

/**
 * Checks if the MapTiler API key is provided in the environment variables.
 * 
 * @throws {Error} If the `VITE_MAPTILER_API_KEY` environment variable is not set.
 */
function checkMapEnvVariables() {
  if (!import.meta.env.VITE_MAPTILER_API_KEY) {
    throw new Error('No MapTiler API key was provided')
  }
}

/**
 * Retrieves the map container element from the DOM or creates
 * a new one if it doesn't exist, appending it to the DOM
 * 
 * @returns {HTMLDivElement} The map container element.
 */
function getMapContainer(): HTMLDivElement {
  const existingContainer = document.getElementById('map')

  if (existingContainer) {
    return existingContainer as HTMLDivElement
  }

  const container = document.createElement('div')

  container.id = 'map'
  document.body.appendChild(container)

  return container
}