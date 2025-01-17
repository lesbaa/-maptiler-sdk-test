import { initMap } from './map'
import './global.css'

async function main() {
  try {
    const map = await initMap()
  } catch (error) {
    // Handle any errors that occur during initialization
    // TODO: deal with this more elegantly
    console.error(error)
  }
}

main()