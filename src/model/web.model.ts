/* eslint-disable prettier/prettier */
export class WebResponse<T> {
  message?: string;
  count?: number;
  data: T;
  errors?: string;
}
