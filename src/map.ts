import {
  config,
  Map,
  MapOptions,
  MapStyle,
} from '@maptiler/sdk'

import '@maptiler/sdk/style.css'

/**
 * Initializes and returns a new map instance with the specified configuration.
 *
 * @returns {Map} A new map instance configured with the specified options.
 */
export function initMap() {
  checkMapEnvVariables()

  const container = getMapContainer()

  // These options could be made confirgurable by the user
  // But given the scope of this project, it would be
  // premature optimization at present.
  const mapConfig: MapOptions = {
    ...config,
    container,
    apiKey: import.meta.env.VITE_MAPTILER_API_KEY as string,
    style: MapStyle.OUTDOOR,
    center: [-7.445255156094822, 39.41918253748721],
    zoom: 14.5,
    pitch: 80,
    bearing: -0,
    terrain: true,
  }

  return new Map(mapConfig)
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