import { useEffect, useState } from 'react';
import FieldConfig, { type FieldConfigModel } from './components/FieldConfig';
import {
  decodeDateFormat,
  encodeDateFormat,
  type DateFormatSettings,
} from './utils/dateFormat';

const MESSAGE_GETSETTINGS = 'GetSettings';
const MESSAGE_SAVESETTINGS = 'SaveSettings';

const DEFAULT_FIELD_CONFIG: FieldConfigModel = {
  dateFieldName: 'Committed Date',
  orangeThreshold: 10,
  redThreshold: 20,
};

interface CommonSettings extends DateFormatSettings {
  greenColour: string;
  orangeColour: string;
  redColour: string;
}

const DEFAULT_COMMON_SETTINGS: CommonSettings = {
  dateSplitter: '/',
  datePartYearIndex: 2,
  datePartMonthIndex: 1,
  datePartDayIndex: 0,
  greenColour: '#008000',
  orangeColour: '#FFA500',
  redColour: '#FF0000',
};

const DATE_FORMATS = [
  { label: 'dd/mm/yyyy', value: 'ddmmyy/' },
  { label: 'dd-mm-yyyy', value: 'ddmmyy-' },
  { label: 'dd.mm.yyyy', value: 'ddmmyy.' },
  { label: 'mm/dd/yyyy', value: 'mmddyy/' },
  { label: 'mm-dd-yyyy', value: 'mmddyy-' },
  { label: 'mm.dd.yyyy', value: 'mmddyy.' },
  { label: 'yyyy/mm/dd', value: 'yymmdd/' },
  { label: 'yyyy-mm-dd', value: 'yymmdd-' },
  { label: 'yyyy.mm.dd', value: 'yymmdd.' },
] as const;

interface LegacyFieldConfig {
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

interface SettingsPayload {
  fieldConfigs?: LegacyFieldConfig[];
  dateFieldName?: string | string[];
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

interface SaveSettingsPayload {
  fieldConfigs: FieldConfigModel[];
  dateSplitter: string;
  datePartYearIndex: number;
  datePartMonthIndex: number;
  datePartDayIndex: number;
  greenColour: string;
  orangeColour: string;
  redColour: string;
  dateFieldName: string[];
  orangeThreshold: number;
  redThreshold: number;
}

function getThreshold(value: number | undefined, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

export default function SettingsApp() {
  const [fieldConfigs, setFieldConfigs] = useState<FieldConfigModel[]>([
    DEFAULT_FIELD_CONFIG,
  ]);
  const [commonSettings, setCommonSettings] =
    useState<CommonSettings>(DEFAULT_COMMON_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    chrome.runtime.sendMessage(
      { message: MESSAGE_GETSETTINGS },
      (settings: SettingsPayload | undefined) => {
        const incoming = settings ?? {};
        let configs: FieldConfigModel[] = [];
        let common: CommonSettings = {
          ...DEFAULT_COMMON_SETTINGS,
          dateSplitter: incoming.dateSplitter ?? DEFAULT_COMMON_SETTINGS.dateSplitter,
          datePartYearIndex:
            incoming.datePartYearIndex ?? DEFAULT_COMMON_SETTINGS.datePartYearIndex,
          datePartMonthIndex:
            incoming.datePartMonthIndex ?? DEFAULT_COMMON_SETTINGS.datePartMonthIndex,
          datePartDayIndex:
            incoming.datePartDayIndex ?? DEFAULT_COMMON_SETTINGS.datePartDayIndex,
          greenColour: incoming.greenColour ?? DEFAULT_COMMON_SETTINGS.greenColour,
          orangeColour: incoming.orangeColour ?? DEFAULT_COMMON_SETTINGS.orangeColour,
          redColour: incoming.redColour ?? DEFAULT_COMMON_SETTINGS.redColour,
        };

        if (Array.isArray(incoming.fieldConfigs) && incoming.fieldConfigs.length > 0) {
          configs = incoming.fieldConfigs.map((cfg) => ({
            dateFieldName: cfg.dateFieldName ?? DEFAULT_FIELD_CONFIG.dateFieldName,
            orangeThreshold: getThreshold(
              cfg.orangeThreshold,
              getThreshold(incoming.orangeThreshold, DEFAULT_FIELD_CONFIG.orangeThreshold)
            ),
            redThreshold: getThreshold(
              cfg.redThreshold,
              getThreshold(incoming.redThreshold, DEFAULT_FIELD_CONFIG.redThreshold)
            ),
          }));

          const firstConfig = incoming.fieldConfigs[0];
          common = {
            ...common,
            dateSplitter: firstConfig.dateSplitter ?? common.dateSplitter,
            datePartYearIndex:
              firstConfig.datePartYearIndex ?? common.datePartYearIndex,
            datePartMonthIndex:
              firstConfig.datePartMonthIndex ?? common.datePartMonthIndex,
            datePartDayIndex: firstConfig.datePartDayIndex ?? common.datePartDayIndex,
            greenColour: firstConfig.greenColour ?? common.greenColour,
            orangeColour: firstConfig.orangeColour ?? common.orangeColour,
            redColour: firstConfig.redColour ?? common.redColour,
          };
        } else if (incoming.dateFieldName) {
          if (Array.isArray(incoming.dateFieldName)) {
            configs = incoming.dateFieldName.map((name) => ({
              dateFieldName: name,
              orangeThreshold: getThreshold(
                incoming.orangeThreshold,
                DEFAULT_FIELD_CONFIG.orangeThreshold
              ),
              redThreshold: getThreshold(
                incoming.redThreshold,
                DEFAULT_FIELD_CONFIG.redThreshold
              ),
            }));
          } else {
            configs = [
              {
                dateFieldName: incoming.dateFieldName,
                orangeThreshold: getThreshold(
                  incoming.orangeThreshold,
                  DEFAULT_FIELD_CONFIG.orangeThreshold
                ),
                redThreshold: getThreshold(
                  incoming.redThreshold,
                  DEFAULT_FIELD_CONFIG.redThreshold
                ),
              },
            ];
          }
        }

        setFieldConfigs(configs.length > 0 ? configs : [DEFAULT_FIELD_CONFIG]);
        setCommonSettings(common);
        setLoading(false);
      }
    );
  }, []);

  const handleAddField = () => {
    setFieldConfigs((prev) => [...prev, { ...DEFAULT_FIELD_CONFIG }]);
  };

  const handleRemoveField = (index: number) => {
    setFieldConfigs((prev) =>
      prev.length > 1 ? prev.filter((_, i) => i !== index) : prev
    );
  };

  const handleUpdateField = (index: number, updatedConfig: FieldConfigModel) => {
    setFieldConfigs((prev) => {
      const next = [...prev];
      next[index] = updatedConfig;
      return next;
    });
  };

  const handleSave = () => {
    const normalizedConfigs = fieldConfigs.map((cfg) => ({
      dateFieldName: cfg.dateFieldName,
      orangeThreshold: cfg.orangeThreshold,
      redThreshold: cfg.redThreshold,
    }));

    const newSettings: SaveSettingsPayload = {
      fieldConfigs: normalizedConfigs,
      dateSplitter: commonSettings.dateSplitter,
      datePartYearIndex: commonSettings.datePartYearIndex,
      datePartMonthIndex: commonSettings.datePartMonthIndex,
      datePartDayIndex: commonSettings.datePartDayIndex,
      greenColour: commonSettings.greenColour,
      orangeColour: commonSettings.orangeColour,
      redColour: commonSettings.redColour,
      dateFieldName: normalizedConfigs.map((fc) => fc.dateFieldName),
      orangeThreshold: normalizedConfigs[0]?.orangeThreshold ?? 10,
      redThreshold: normalizedConfigs[0]?.redThreshold ?? 20,
    };

    chrome.runtime.sendMessage(
      { message: MESSAGE_SAVESETTINGS, data: newSettings },
      () => {
        window.close();
      }
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  const dateFormatValue = encodeDateFormat(
    commonSettings.dateSplitter,
    commonSettings.datePartYearIndex,
    commonSettings.datePartMonthIndex,
    commonSettings.datePartDayIndex
  );

  return (
    <div className="w-full bg-gray-50 min-h-screen p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">DevOps Date Badge</h1>
            <p className="text-sm text-gray-500 mt-1">
              Configure date field tracking across your boards
            </p>
          </div>
          <img src="icon_128.png" alt="App Icon" className="w-16 h-16 rounded" />
        </div>

        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6 rounded">
          <p className="text-sm text-blue-800">
            Date format and colors are shared across all configurations. Each
            configuration sets a field name and thresholds.
          </p>
        </div>

        <div className="border border-gray-300 rounded-md p-3 bg-white shadow-sm mb-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Common Settings</h3>

          <div className="mb-2">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Date Format
            </label>
            <select
              value={dateFormatValue}
              onChange={(e) => {
                const decoded = decodeDateFormat(e.target.value);
                setCommonSettings((prev) => ({ ...prev, ...decoded }));
              }}
              className="w-full h-8 px-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {DATE_FORMATS.map((fmt) => (
                <option key={fmt.value} value={fmt.value}>
                  {fmt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Green Color
              </label>
              <div className="flex gap-1.5">
                <input
                  type="color"
                  value={commonSettings.greenColour}
                  onChange={(e) =>
                    setCommonSettings((prev) => ({
                      ...prev,
                      greenColour: e.target.value,
                    }))
                  }
                  className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={commonSettings.greenColour}
                  onChange={(e) =>
                    setCommonSettings((prev) => ({
                      ...prev,
                      greenColour: e.target.value,
                    }))
                  }
                  className="flex-1 h-8 px-2 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-green-500 font-mono"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Orange Color
              </label>
              <div className="flex gap-1.5">
                <input
                  type="color"
                  value={commonSettings.orangeColour}
                  onChange={(e) =>
                    setCommonSettings((prev) => ({
                      ...prev,
                      orangeColour: e.target.value,
                    }))
                  }
                  className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={commonSettings.orangeColour}
                  onChange={(e) =>
                    setCommonSettings((prev) => ({
                      ...prev,
                      orangeColour: e.target.value,
                    }))
                  }
                  className="flex-1 h-8 px-2 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-green-500 font-mono"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Red Color
              </label>
              <div className="flex gap-1.5">
                <input
                  type="color"
                  value={commonSettings.redColour}
                  onChange={(e) =>
                    setCommonSettings((prev) => ({
                      ...prev,
                      redColour: e.target.value,
                    }))
                  }
                  className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={commonSettings.redColour}
                  onChange={(e) =>
                    setCommonSettings((prev) => ({
                      ...prev,
                      redColour: e.target.value,
                    }))
                  }
                  className="flex-1 h-8 px-2 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-green-500 font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={handleAddField}
          className="mb-6 inline-flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
        >
          <span>+</span>
          Add Field Configuration
        </button>

        <div className="space-y-2 mb-4 max-h-[28rem] overflow-y-auto pr-1">
          {fieldConfigs.map((config, index) => (
            <FieldConfig
              key={index}
              index={index}
              config={config}
              onUpdate={(updated) => handleUpdateField(index, updated)}
              onRemove={() => handleRemoveField(index)}
              canRemove={fieldConfigs.length > 1}
            />
          ))}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            onClick={() => window.close()}
            className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
          >
            Save
          </button>
        </div>

        <p className="text-xs text-gray-400 mt-4 text-center">
          Refresh the page after saving settings
        </p>
      </div>
    </div>
  );
}
