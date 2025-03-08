import { getDebouncer } from '@/utils/debouce';
import { type ParserBuilder, useQueryStates } from 'nuqs';
import { useCallback, useMemo } from 'react';

export type FilterValues =
  | string
  | number
  | boolean
  | string[]
  | number[]
  | null;
export type InitFilters = {
  [key: string]:
    | ParserBuilder<string>
    | ParserBuilder<number>
    | ParserBuilder<boolean>
    | ParserBuilder<string[]>
    | ParserBuilder<number[]>;
};

export const useFilters = (defaultFilters: InitFilters = {}) => {
  const [filters, setFilters] = useQueryStates(defaultFilters, {
    history: 'replace',
  });

  const setFilterValue = useCallback(
    (key: string, value: FilterValues) => {
      setFilters((prev) => ({
        ...prev,
        [key]: value,
      }));
    },
    [setFilters]
  );

  const setBulkFilterValues = useCallback(
    (filterValues: Record<string, FilterValues>) => {
      setFilters(filterValues);
    },
    [setFilters]
  );

  const {
    debounce: debounceFilterSetter,
    cancelDebounce: debounceFilterCanceller,
  } = useMemo(() => {
    return getDebouncer((key: string, value: FilterValues) => {
      setFilters({ [key]: value });
    }, 300);
  }, [setFilters]);

  const setFilterDebounce = useCallback(
    (key: string, value: FilterValues) => {
      debounceFilterSetter(key, value);
    },
    [setFilters]
  );

  const removeFilter = useCallback(
    (key: string) => {
      debounceFilterCanceller();
      setFilters((prev) => ({
        ...prev,
        [key]: null,
      }));
    },
    [setFilters]
  );

  const replaceFilter = useCallback(
    (oldKey: string, newKey: string, value: FilterValues) => {
      setFilters((prev) => ({
        ...prev,
        [oldKey]: null,
        [newKey]: value,
      }));
    },
    [setFilters]
  );

  const resetFilters = useCallback(() => {
    setFilters(null);
  }, [defaultFilters, setFilters]);

  return {
    filters,
    setFilterValue,
    setFilterDebounce,
    removeFilter,
    resetFilters,
    replaceFilter,
    setBulkFilterValues,
  };
};
