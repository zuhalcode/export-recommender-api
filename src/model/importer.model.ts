/* eslint-disable prettier/prettier */
export class ImporterResponse {
  id?: number;
  name: string = 'Importers Retrieve Successfully';
  hscode: string;
  trade_balance?: number;
  quantity_imported?: number;
  value_imported?: number;
  unit_value?: number;
  quantity_unit?: string;
  prediction?: string;
}

export class ImporterPagination {
  page: number = 1;
  limit: number = 100;
}
