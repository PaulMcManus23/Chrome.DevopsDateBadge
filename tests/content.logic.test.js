import { beforeAll, describe, expect, it } from 'vitest';

describe('content.js date and settings logic', () => {
  beforeAll(async () => {
    await import('../src/content.ts');
  });

  it('parses dd/mm/yyyy with configured indexes', () => {
    const { parseConfiguredDate } = globalThis.__ddbTestHooks;
    const parsed = parseConfiguredDate('17/03/2026', {
      dateSplitter: '/',
      datePartDayIndex: 0,
      datePartMonthIndex: 1,
      datePartYearIndex: 2,
    });

    expect(parsed).not.toBeNull();
    expect(parsed.getFullYear()).toBe(2026);
    expect(parsed.getMonth()).toBe(2);
    expect(parsed.getDate()).toBe(17);
  });

  it('parses yyyy-mm-dd with configured indexes', () => {
    const { parseConfiguredDate } = globalThis.__ddbTestHooks;
    const parsed = parseConfiguredDate('2026-03-17', {
      dateSplitter: '-',
      datePartDayIndex: 2,
      datePartMonthIndex: 1,
      datePartYearIndex: 0,
    });

    expect(parsed).not.toBeNull();
    expect(parsed.getFullYear()).toBe(2026);
    expect(parsed.getMonth()).toBe(2);
    expect(parsed.getDate()).toBe(17);
  });

  it('returns null for impossible or invalid dates', () => {
    const { parseConfiguredDate } = globalThis.__ddbTestHooks;
    const settings = {
      dateSplitter: '/',
      datePartDayIndex: 0,
      datePartMonthIndex: 1,
      datePartYearIndex: 2,
    };

    expect(parseConfiguredDate('31/02/2026', settings)).toBeNull();
    expect(parseConfiguredDate('x/2/2026', settings)).toBeNull();
    expect(parseConfiguredDate('', settings)).toBeNull();
  });

  it('calculates stable whole day difference using midnight boundaries', () => {
    const { getWholeDayDifference } = globalThis.__ddbTestHooks;
    const today = new Date(2026, 2, 17, 23, 45, 0);
    const date = new Date(2026, 2, 16, 0, 5, 0);

    expect(getWholeDayDifference(today, date)).toBe(1);
  });

  it('normalizes legacy single-field settings', () => {
    const { normalizeSettings } = globalThis.__ddbTestHooks;
    const normalized = normalizeSettings({
      dateFieldName: 'Committed Date',
      dateSplitter: '/',
      datePartDayIndex: 0,
      datePartMonthIndex: 1,
      datePartYearIndex: 2,
      greenColour: '#008000',
      orangeColour: '#FFA500',
      redColour: '#FF0000',
      orangeThreshold: 7,
      redThreshold: 14,
    });

    expect(normalized.fieldConfigs).toEqual([
      {
        dateFieldName: 'Committed Date',
        orangeThreshold: 7,
        redThreshold: 14,
      },
    ]);
    expect(normalized.dateSplitter).toBe('/');
    expect(normalized.greenColour).toBe('#008000');
  });

  it('normalizes current fieldConfigs with per-config thresholds and common colors', () => {
    const { normalizeSettings } = globalThis.__ddbTestHooks;
    const normalized = normalizeSettings({
      dateSplitter: '-',
      datePartDayIndex: 2,
      datePartMonthIndex: 1,
      datePartYearIndex: 0,
      greenColour: '#111111',
      orangeColour: '#222222',
      redColour: '#333333',
      fieldConfigs: [
        {
          dateFieldName: 'Committed Date',
          orangeThreshold: 10,
          redThreshold: 20,
        },
      ],
    });

    expect(normalized.fieldConfigs).toEqual([
      {
        dateFieldName: 'Committed Date',
        orangeThreshold: 10,
        redThreshold: 20,
      },
    ]);
    expect(normalized.dateSplitter).toBe('-');
    expect(normalized.greenColour).toBe('#111111');
    expect(normalized.orangeColour).toBe('#222222');
    expect(normalized.redColour).toBe('#333333');
  });
});
