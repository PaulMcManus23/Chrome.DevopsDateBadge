export interface FieldConfigModel {
  dateFieldName: string;
  orangeThreshold: number;
  redThreshold: number;
}

interface FieldConfigProps {
  index: number;
  config: FieldConfigModel;
  onUpdate: (config: FieldConfigModel) => void;
  onRemove: () => void;
  canRemove: boolean;
}

export default function FieldConfig({
  index,
  config,
  onUpdate,
  onRemove,
  canRemove,
}: FieldConfigProps) {
  const handleFieldChange = <K extends keyof FieldConfigModel>(
    field: K,
    value: FieldConfigModel[K]
  ) => {
    onUpdate({ ...config, [field]: value });
  };

  return (
    <div className="border border-gray-300 rounded-md p-3 bg-white shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-900 leading-none">
          Field Configuration {index + 1}
        </h3>
        {canRemove && (
          <button
            onClick={onRemove}
            className="px-2 py-0.5 bg-red-500 hover:bg-red-600 text-white text-xs rounded transition-colors"
          >
            Remove
          </button>
        )}
      </div>

      <div className="mb-2">
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Date Field Name
        </label>
        <input
          type="text"
          value={config.dateFieldName}
          onChange={(e) => handleFieldChange('dateFieldName', e.target.value)}
          className="w-full h-8 px-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="e.g., Committed Date"
        />
      </div>

      <div className="grid grid-cols-2 gap-2 mb-2">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Orange Threshold (days)
          </label>
          <input
            type="number"
            value={config.orangeThreshold}
            onChange={(e) => {
              const nextValue = Number.parseInt(e.target.value, 10);
              handleFieldChange(
                'orangeThreshold',
                Number.isFinite(nextValue) ? nextValue : config.orangeThreshold
              );
            }}
            className="w-full h-8 px-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Red Threshold (days)
          </label>
          <input
            type="number"
            value={config.redThreshold}
            onChange={(e) => {
              const nextValue = Number.parseInt(e.target.value, 10);
              handleFieldChange(
                'redThreshold',
                Number.isFinite(nextValue) ? nextValue : config.redThreshold
              );
            }}
            className="w-full h-8 px-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>
    </div>
  );
}
