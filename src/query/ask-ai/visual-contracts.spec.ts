import { describe, expect, it } from 'vitest'
import { visualSpecSchema } from './visual-contracts'

describe('structured climate visual contracts', () => {
  it('accepts an evidence-linked climate time series', () => {
    expect(
      visualSpecSchema.safeParse({
        version: 2,
        type: 'climate_timeseries',
        title: 'Nepal temperature',
        grain: 'year',
        yAxis: { label: 'TAVG', unit: 'degC' },
        series: [
          {
            name: 'Nepal - TAVG',
            sourceIndex: 1,
            points: [
              { period: '2023', value: 14.2, coverage: 2 },
              { period: '2024', value: 14.5, coverage: 2 },
            ],
          },
        ],
      }).success
    ).toBe(true)
  })

  it('rejects invalid map coordinates and more than 500 points', () => {
    const point = {
      stationId: 'NP000444540',
      name: 'Kathmandu Airport',
      country: 'Nepal',
      longitude: 181,
      latitude: 27.7,
      value: 14.2,
      coverage: 12,
      sourceIndex: 1,
    }
    const result = visualSpecSchema.safeParse({
      version: 2,
      type: 'station_map',
      indicator: 'TAVG',
      unit: 'degC',
      scale: { min: 10, max: 20 },
      points: Array.from({ length: 501 }, () => point),
    })
    expect(result.success).toBe(false)
  })

  it('requires two finite scatter coordinates and a valid source', () => {
    const result = visualSpecSchema.safeParse({
      version: 2,
      type: 'climate_scatter',
      xAxis: { label: 'TAVG', unit: 'degC' },
      yAxis: { label: 'PRCP', unit: 'mm' },
      points: [
        { label: 'A', x: 10, y: 20, sourceIndex: 1 },
        { label: 'B', x: 11, y: 22, sourceIndex: 9 },
      ],
    })
    expect(result.success).toBe(false)
  })
})
