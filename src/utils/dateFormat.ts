export interface DateFormatSettings {
  dateSplitter: string;
  datePartYearIndex: number;
  datePartMonthIndex: number;
  datePartDayIndex: number;
}

export function encodeDateFormat(
  dateSplitter: string,
  datePartYearIndex: number,
  datePartMonthIndex: number,
  datePartDayIndex: number
): string {
  const dateFormatParts = ['', '', '', ''];
  dateFormatParts[datePartDayIndex] = 'dd';
  dateFormatParts[datePartMonthIndex] = 'mm';
  dateFormatParts[datePartYearIndex] = 'yy';
  dateFormatParts.push(dateSplitter);

  return dateFormatParts.join('');
}

export function decodeDateFormat(format: string): DateFormatSettings {
  return {
    dateSplitter: format.slice(-1),
    datePartYearIndex: (format.indexOf('yy') + 2) / 2 - 1,
    datePartMonthIndex: (format.indexOf('mm') + 2) / 2 - 1,
    datePartDayIndex: (format.indexOf('dd') + 2) / 2 - 1,
  };
}
