/* eslint-disable prettier/prettier */
import { Controller, Get, Param } from '@nestjs/common';
import { RegressionService } from './regression.service';

@Controller('/api/regression')
export class RegressionController {
  constructor(private readonly regressionService: RegressionService) {}

  @Get('/accurate')
  async getFinalAccuracy() {
    const data = await this.regressionService.getFinalAccuracy();

    return { data };
  }

  @Get('/calculate2')
  async getCalculate2Digit() {
    const data = await this.regressionService.calculate2Digit();

    return { data };
  }

  @Get('/calculate4')
  async getCalculate4Digit() {
    const data = await this.regressionService.calculate4Digit();

    return { data };
  }

  @Get('/delete')
  async delete() {
    const data = await this.regressionService.delete();

    return { data };
  }

  @Get(':hscode')
  async multipleLinearRegression(@Param('hscode') hscode: string) {
    const data = await this.regressionService.multipleLinearRegression(hscode);

    return { data };
  }
}
