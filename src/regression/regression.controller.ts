/* eslint-disable prettier/prettier */
import { Controller, Get, Param } from '@nestjs/common';
import { RegressionService } from './regression.service';

@Controller('/api/regression')
export class RegressionController {
  constructor(private readonly regressionService: RegressionService) {}

  @Get(':hscode/:sort')
  async multipleLinearRegression(
    @Param('hscode') hscode: string,
    @Param('sort') sort: string,
  ) {
    const data = await this.regressionService.multipleLinearRegression(
      hscode,
      sort,
    );

    return { data };
  }

  @Get('/partial')
  async linearRegression() {
    const data = await this.regressionService.linearRegression();

    return { data };
  }
}
