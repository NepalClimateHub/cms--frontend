import { useEffect, useMemo, useRef, useState } from 'react'
import maplibregl, { LngLatBounds, type Map as MapLibreMap, type StyleSpecification } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import type { VisualSpec } from '@/query/ask-ai/climate-api'
import { reportClimateClientMetric } from '@/query/ask-ai/climate-api'
import { env } from '@/config/env.config'

type StationMapSpec = Extract<VisualSpec, { type: 'station_map' }>

const fallbackStyle: StyleSpecification = {
  version: 8,
  sources: {},
  layers: [
    {
      id: 'background',
      type: 'background',
      paint: { 'background-color': '#f8fafc' },
    },
  ],
}

export function StationMap({ visual }: { visual: StationMapSpec }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<MapLibreMap | null>(null)
  const fallbackReportedRef = useRef(false)
  const [useFallback, setUseFallback] = useState(!env.VITE_MAP_STYLE_URL)
  const points = useMemo(
    () => ({
      type: 'FeatureCollection' as const,
      features: visual.points.map((point) => ({
        type: 'Feature' as const,
        geometry: {
          type: 'Point' as const,
          coordinates: [point.longitude, point.latitude],
        },
        properties: point,
      })),
    }),
    [visual.points]
  )

  useEffect(() => {
    if (!containerRef.current) return
    const style = useFallback ? fallbackStyle : env.VITE_MAP_STYLE_URL!
    const map = new maplibregl.Map({
      container: containerRef.current,
      style,
      center: [83, 25],
      zoom: 3.2,
      attributionControl: { compact: true },
    })
    mapRef.current = map
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right')

    const handleError = () => {
      if (!useFallback && !map.loaded()) {
        if (!fallbackReportedRef.current) {
          fallbackReportedRef.current = true
          void reportClimateClientMetric('map_fallback')
        }
        setUseFallback(true)
      }
    }
    map.on('error', handleError)
    map.on('load', () => {
      map.addSource('south-asia', {
        type: 'geojson',
        data: '/south-asia-outline.geojson',
      })
      map.addLayer({
        id: 'south-asia-fill',
        type: 'fill',
        source: 'south-asia',
        paint: { 'fill-color': '#dbeafe', 'fill-opacity': 0.16 },
      })
      map.addLayer({
        id: 'south-asia-outline',
        type: 'line',
        source: 'south-asia',
        paint: { 'line-color': '#64748b', 'line-width': 1 },
      })
      map.addSource('climate-stations', {
        type: 'geojson',
        data: points,
        cluster: true,
        clusterMaxZoom: 8,
        clusterRadius: 42,
      })
      map.addLayer({
        id: 'station-clusters',
        type: 'circle',
        source: 'climate-stations',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': '#0f766e',
          'circle-radius': ['step', ['get', 'point_count'], 17, 20, 21, 75, 25],
          'circle-stroke-color': '#ffffff',
          'circle-stroke-width': 2,
        },
      })
      map.addLayer({
        id: 'station-cluster-count',
        type: 'symbol',
        source: 'climate-stations',
        filter: ['has', 'point_count'],
        layout: { 'text-field': ['get', 'point_count_abbreviated'], 'text-size': 12 },
        paint: { 'text-color': '#ffffff' },
      })
      map.addLayer({
        id: 'station-points',
        type: 'circle',
        source: 'climate-stations',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-radius': 7,
          'circle-color': [
            'interpolate',
            ['linear'],
            ['get', 'value'],
            visual.scale.min,
            '#2563eb',
            visual.scale.max === visual.scale.min ? visual.scale.max + 0.001 : visual.scale.max,
            '#dc2626',
          ],
          'circle-stroke-color': '#ffffff',
          'circle-stroke-width': [
            'interpolate',
            ['linear'],
            ['get', 'coverage'],
            1,
            1,
            24,
            3,
          ],
        },
      })

      const bounds = new LngLatBounds()
      visual.points.forEach((point) => bounds.extend([point.longitude, point.latitude]))
      if (!bounds.isEmpty()) map.fitBounds(bounds, { padding: 44, maxZoom: 7, duration: 0 })

      map.on('click', 'station-clusters', async (event) => {
        const feature = map.queryRenderedFeatures(event.point, { layers: ['station-clusters'] })[0]
        const clusterId = Number(feature?.properties?.cluster_id)
        const source = map.getSource('climate-stations') as maplibregl.GeoJSONSource
        if (!Number.isFinite(clusterId)) return
        const zoom = await source.getClusterExpansionZoom(clusterId)
        const coordinates = (feature.geometry as { coordinates: number[] }).coordinates as [number, number]
        map.easeTo({ center: coordinates, zoom })
      })
      map.on('click', 'station-points', (event) => {
        const feature = event.features?.[0]
        if (!feature || feature.geometry.type !== 'Point') return
        const properties = feature.properties as Record<string, string | number>
        const content = document.createElement('div')
        const heading = document.createElement('strong')
        heading.textContent = String(properties.name)
        const detail = document.createElement('div')
        detail.textContent = `${properties.country}: ${properties.value} ${visual.unit} (${properties.coverage} periods)`
        content.append(heading, detail)
        new maplibregl.Popup({ offset: 10 })
          .setLngLat((feature.geometry as { coordinates: number[] }).coordinates as [number, number])
          .setDOMContent(content)
          .addTo(map)
      })
      for (const layer of ['station-clusters', 'station-points']) {
        map.on('mouseenter', layer, () => {
          map.getCanvas().style.cursor = 'pointer'
        })
        map.on('mouseleave', layer, () => {
          map.getCanvas().style.cursor = ''
        })
      }
    })

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [points, useFallback, visual.scale.max, visual.scale.min, visual.unit, visual.points])

  return (
    <div className='space-y-3'>
      {useFallback && (
        <p className='text-xs text-muted-foreground'>Using the local South Asia boundary map.</p>
      )}
      <div
        ref={containerRef}
        className='h-80 w-full overflow-hidden border'
        role='img'
        aria-label={`${visual.indicator} values at ${visual.points.length} climate stations`}
      />
      <div className='max-h-52 overflow-auto border' role='region' aria-label='Station values table'>
        <table className='w-full text-left text-xs'>
          <thead className='sticky top-0 bg-background'>
            <tr className='border-b'>
              <th className='px-3 py-2 font-medium'>Station</th>
              <th className='px-3 py-2 font-medium'>Country</th>
              <th className='px-3 py-2 text-right font-medium'>Value</th>
              <th className='px-3 py-2 text-right font-medium'>Coverage</th>
            </tr>
          </thead>
          <tbody>
            {visual.points.map((point) => (
              <tr key={point.stationId} className='border-b last:border-0'>
                <td className='px-3 py-2'>{point.name}</td>
                <td className='px-3 py-2'>{point.country}</td>
                <td className='px-3 py-2 text-right'>{point.value} {visual.unit}</td>
                <td className='px-3 py-2 text-right'>{point.coverage}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
