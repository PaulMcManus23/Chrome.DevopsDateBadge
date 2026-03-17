const MESSAGE_GETSETTINGS = 'GetSettings';

interface FieldConfig {
  dateFieldName: string;
  orangeThreshold: number;
  redThreshold: number;
}

interface RawFieldConfig {
  dateFieldName?: string;
  orangeThreshold?: number;
  redThreshold?: number;
  dateSplitter?: string;
  datePartYearIndex?: number;
  datePartMonthIndex?: number;
  datePartDayIndex?: number;
  greenColour?: string;
  orangeColour?: string;
  redColour?: string;
}

interface RawSettings {
  dateSplitter?: string;
  datePartYearIndex?: number;
  datePartMonthIndex?: number;
  datePartDayIndex?: number;
  greenColour?: string;
  orangeColour?: string;
  redColour?: string;
  orangeThreshold?: number;
  redThreshold?: number;
  fieldConfigs?: RawFieldConfig[];
  dateFieldName?: string | string[];
}

interface NormalizedSettings {
  dateSplitter: string;
  datePartYearIndex: number;
  datePartMonthIndex: number;
  datePartDayIndex: number;
  greenColour: string;
  orangeColour: string;
  redColour: string;
  fieldConfigs: FieldConfig[];
}

interface TestHooks {
  parseConfiguredDate: (
    rawText: string,
    commonSettings: NormalizedSettings
  ) => Date | null;
  getWholeDayDifference: (today: Date, date: Date) => number;
  normalizeSettings: (settings: RawSettings) => NormalizedSettings;
}

function execute(): void {
  const hubMode =
    document.querySelectorAll('div.kanban-board-column').length !== 0;

  chrome.runtime.sendMessage(
    { message: MESSAGE_GETSETTINGS },
    (settings: RawSettings) => {
      const normalizedSettings = normalizeSettings(settings || {});
      const fieldConfigs = normalizedSettings.fieldConfigs;

      fieldConfigs.forEach((fieldConfig) => {
        const committedDateDivs = getCommittedDateDivs(hubMode, fieldConfig);
        const today = new Date();

        for (let i = 0; i < committedDateDivs.length; i += 1) {
          const committedDate = committedDateDivs[i] as HTMLElement;

          if (committedDate.innerText) {
            processBadge(
              committedDate,
              today,
              hubMode,
              fieldConfig,
              normalizedSettings
            );
          }
        }
      });
    }
  );
}

function normalizeSettings(settings: RawSettings): NormalizedSettings {
  const normalized: NormalizedSettings = {
    dateSplitter: settings.dateSplitter || '/',
    datePartYearIndex: settings.datePartYearIndex ?? 2,
    datePartMonthIndex: settings.datePartMonthIndex ?? 1,
    datePartDayIndex: settings.datePartDayIndex ?? 0,
    greenColour: settings.greenColour || '#008000',
    orangeColour: settings.orangeColour || '#FFA500',
    redColour: settings.redColour || '#FF0000',
    fieldConfigs: [],
  };

  if (settings.fieldConfigs && Array.isArray(settings.fieldConfigs)) {
    normalized.fieldConfigs = settings.fieldConfigs
      .map((cfg) => {
        if (!cfg.dateFieldName) {
          return null;
        }

        return {
          dateFieldName: cfg.dateFieldName,
          orangeThreshold: cfg.orangeThreshold ?? settings.orangeThreshold ?? 10,
          redThreshold: cfg.redThreshold ?? settings.redThreshold ?? 20,
        };
      })
      .filter((cfg): cfg is FieldConfig => cfg !== null);

    if (settings.fieldConfigs.length > 0) {
      const firstConfig = settings.fieldConfigs[0];
      normalized.dateSplitter = firstConfig.dateSplitter || normalized.dateSplitter;
      normalized.datePartYearIndex =
        firstConfig.datePartYearIndex ?? normalized.datePartYearIndex;
      normalized.datePartMonthIndex =
        firstConfig.datePartMonthIndex ?? normalized.datePartMonthIndex;
      normalized.datePartDayIndex =
        firstConfig.datePartDayIndex ?? normalized.datePartDayIndex;
      normalized.greenColour = firstConfig.greenColour || normalized.greenColour;
      normalized.orangeColour =
        firstConfig.orangeColour || normalized.orangeColour;
      normalized.redColour = firstConfig.redColour || normalized.redColour;
    }
  } else if (Array.isArray(settings.dateFieldName)) {
    normalized.fieldConfigs = settings.dateFieldName.map((fieldName) => ({
      dateFieldName: fieldName,
      orangeThreshold: settings.orangeThreshold ?? 10,
      redThreshold: settings.redThreshold ?? 20,
    }));
  } else if (typeof settings.dateFieldName === 'string') {
    normalized.fieldConfigs = [
      {
        dateFieldName: settings.dateFieldName,
        orangeThreshold: settings.orangeThreshold ?? 10,
        redThreshold: settings.redThreshold ?? 20,
      },
    ];
  }

  return normalized;
}

function getCommittedDateDivs(
  hubMode: boolean,
  fieldConfig: FieldConfig
): Element[] {
  if (hubMode) {
    const fields = document.querySelectorAll(
      'div.kanban-board-column div.field-container div.label.text-ellipsis'
    );
    const committedDateDivs: Element[] = [];

    fields.forEach((element) => {
      if (element.textContent === fieldConfig.dateFieldName) {
        if (element.nextElementSibling) {
          committedDateDivs.push(element.nextElementSibling);
        }
      }
    });

    return committedDateDivs;
  }

  return Array.from(
    document.querySelectorAll(
      'div.additional-field[field*="' +
        fieldConfig.dateFieldName.replace(/\s/g, '') +
        '"] .field-inner-element'
    )
  );
}

function processBadge(
  committedDate: HTMLElement,
  today: Date,
  hubMode: boolean,
  fieldConfig: FieldConfig,
  commonSettings: NormalizedSettings
): void {
  const badgeClass =
    'sensei-date-badge-' +
    fieldConfig.dateFieldName.replace(/\s+/g, '-').toLowerCase();

  let existingBadge: HTMLElement | null = null;
  const nextSibling = committedDate.nextElementSibling as HTMLElement | null;

  if (nextSibling && nextSibling.className === badgeClass) {
    existingBadge = nextSibling;
  }

  const date = parseConfiguredDate(committedDate.innerText, commonSettings);
  if (!date) {
    if (existingBadge && existingBadge.parentNode) {
      existingBadge.parentNode.removeChild(existingBadge);
    }
    return;
  }

  const differenceInDays = getWholeDayDifference(today, date);

  if (existingBadge && existingBadge.innerText === String(differenceInDays)) {
    return;
  }

  if (existingBadge && existingBadge.parentNode) {
    existingBadge.parentNode.removeChild(existingBadge);
  }

  const daysOldNode = document.createElement('div');
  daysOldNode.className = badgeClass;
  daysOldNode.title = 'Days Old';
  daysOldNode.style.position = 'absolute';
  daysOldNode.style.right = '5px';
  if (!hubMode) {
    daysOldNode.style.marginTop = '-22px';
  }

  const icon = document.createElement('i');
  icon.className = 'bowtie-icon bowtie-status-waiting';
  icon.style.color = commonSettings.greenColour;
  icon.style.marginRight = '2px';

  if (differenceInDays > fieldConfig.redThreshold) {
    icon.style.color = commonSettings.redColour;
  } else if (differenceInDays > fieldConfig.orangeThreshold) {
    icon.style.color = commonSettings.orangeColour;
  }

  daysOldNode.append(icon);
  daysOldNode.append(String(differenceInDays));

  committedDate.after(daysOldNode);
}

function parseConfiguredDate(
  rawText: string,
  commonSettings: NormalizedSettings
): Date | null {
  if (!rawText) {
    return null;
  }

  const parts = rawText
    .trim()
    .split(commonSettings.dateSplitter)
    .map((part) => part.trim());

  const year = Number.parseInt(parts[commonSettings.datePartYearIndex], 10);
  const month = Number.parseInt(parts[commonSettings.datePartMonthIndex], 10);
  const day = Number.parseInt(parts[commonSettings.datePartDayIndex], 10);

  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day)
  ) {
    return null;
  }

  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return null;
  }

  const parsedDate = new Date(year, month - 1, day);

  if (
    parsedDate.getFullYear() !== year ||
    parsedDate.getMonth() !== month - 1 ||
    parsedDate.getDate() !== day
  ) {
    return null;
  }

  return parsedDate;
}

function getWholeDayDifference(today: Date, date: Date): number {
  const msPerDay = 1000 * 3600 * 24;
  const todayMidnight = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
  const dateMidnight = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );

  return Math.floor((todayMidnight.getTime() - dateMidnight.getTime()) / msPerDay);
}

function initializeContentScript(): void {
  if (
    typeof chrome === 'undefined' ||
    !chrome.runtime ||
    !chrome.runtime.sendMessage ||
    typeof document === 'undefined' ||
    !document.body
  ) {
    return;
  }

  execute();

  const observer = new MutationObserver(() => {
    execute();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: false,
  });

  setInterval(() => {
    execute();
  }, 5000);
}

const testableGlobal = globalThis as typeof globalThis & {
  __ddbTestHooks?: TestHooks;
};

testableGlobal.__ddbTestHooks = {
  parseConfiguredDate,
  getWholeDayDifference,
  normalizeSettings,
};

initializeContentScript();
