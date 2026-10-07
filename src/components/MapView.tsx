import { useEffect, useRef } from 'react'
import * as maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'
import { courierAt, routeOf, type LngLat } from '../lib/courier'

// Vite で動かすには、Worker を自分でビルドして場所を教える必要がある
maplibregl.setWorkerUrl(workerUrl)

const STYLE = 'https://tiles.openfreemap.org/styles/liberty' // APIキー不要。地図の出典表示はスタイルに含まれる

const pin = (emoji: string) => {
  const el = document.createElement('div')
  el.textContent = emoji
  el.style.cssText = 'font-size:28px;line-height:1;filter:drop-shadow(0 2px 2px rgb(0 0 0/.4))'
  return el
}

/** 追跡の地図。このファイルは追跡画面を開いた時だけ読み込む（トップの表示を重くしない） */
export default function MapView({ rest, home, progress, onFail }: { rest: LngLat; home: LngLat; progress: number; onFail: () => void }) {
  const box = useRef<HTMLDivElement>(null)
  const courier = useRef<maplibregl.Marker | null>(null)
  const progressRef = useRef(progress)
  progressRef.current = progress

  useEffect(() => {
    let map: maplibregl.Map
    try {
      map = new maplibregl.Map({ container: box.current!, style: STYLE, bounds: [[Math.min(rest[0], home[0]) - 0.008, Math.min(rest[1], home[1]) - 0.006], [Math.max(rest[0], home[0]) + 0.008, Math.max(rest[1], home[1]) + 0.006]], fitBoundsOptions: { padding: 24 } })
    } catch {
      onFail() // WebGL が使えない端末など
      return
    }
    map.on('load', () => {
      map.addSource('route', { type: 'geojson', data: { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: routeOf(rest, home) } } })
      map.addLayer({ id: 'route', type: 'line', source: 'route', paint: { 'line-color': '#2f9e5b', 'line-width': 5, 'line-opacity': 0.85 } })
    })
    new maplibregl.Marker({ element: pin('🏪') }).setLngLat(rest).addTo(map)
    new maplibregl.Marker({ element: pin('🏠') }).setLngLat(home).addTo(map)
    courier.current = new maplibregl.Marker({ element: pin('🛵') }).setLngLat(courierAt(progressRef.current, rest, home)).addTo(map)
    return () => map.remove()
  }, [rest, home, onFail])

  useEffect(() => {
    courier.current?.setLngLat(courierAt(progress, rest, home))
  }, [progress, rest, home])

  return <div ref={box} role="img" aria-label="配達員の現在地の地図" className="h-64 w-full overflow-hidden rounded-lg sm:h-80" />
}
