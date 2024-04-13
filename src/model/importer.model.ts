/* eslint-disable prettier/prettier */
export class ImporterResponse {
  id?: number;
  name: string;
  hscode: string;
  trade_balance?: number;
  quantity_imported?: number;
  value_imported?: number;
  unit_value?: number;
  quantity_unit?: string;
  prediction?: number;
}

export class ImporterPagination {
  page: number = 1;
  limit: number = 100;
}
