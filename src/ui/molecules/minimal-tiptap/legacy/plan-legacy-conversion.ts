import { convertLegacyBlogHtml } from './convert-legacy-html'

export interface LegacyConversionItem<Id extends string | number> {
  id: Id
  html: string
}

export interface LegacyConversionPlan<Id extends string | number> {
  id: Id
  changed: boolean
  changes: number
}

export const planLegacyConversion = <Id extends string | number>(
  items: ReadonlyArray<LegacyConversionItem<Id>>
): LegacyConversionPlan<Id>[] =>
  items.map(({ id, html }) => {
    const result = convertLegacyBlogHtml(html)
    return {
      id,
      changed: result.changes > 0 && result.html !== html,
      changes: result.changes,
    }
  })
