/* eslint-disable prettier/prettier */
export class TrademapResponse {
  message?: string;
  count?: number;
  data?: string;
}

export class CreateTrademapResponse {
  message?: string;
  count?: number;
}

export class ScrapeHscodeResponse {
  hscode: string;
  name: string;
  url: string;
}

export class ScrapeImporterResponse {
  importer: string;
  hscode: string;
  trade_balance: number;
  quantity_imported: number;
  value_imported: number;
  unit_value: number;
  quantity_unit: string;
}

export class ScrapeExporterResponse {
  importer_id: number;
  name: string;
  trade_balance: string;
  quantity_imported: string;
  value_imported: string;
  unit_value: string;
}
