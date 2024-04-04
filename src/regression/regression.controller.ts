/* eslint-disable prettier/prettier */
import { Controller, Get } from '@nestjs/common';
import { RegressionService } from './regression.service';

@Controller('/api/regression')
export class RegressionController {
  constructor(private readonly regressionService: RegressionService) {}

  @Get()
  async multipleLinearRegression() {
    const data = await this.regressionService.multipleLinearRegression();

    return { data };
  }

  @Get('/partial')
  async linearRegression() {
    const data = await this.regressionService.linearRegression();

    return { data };
  }
}
