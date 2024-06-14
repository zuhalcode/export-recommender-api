/* eslint-disable prettier/prettier */
import { Controller, Get, Param } from '@nestjs/common';
import { RegressionService } from './regression.service';

@Controller('/api/regression')
export class RegressionController {
  constructor(private readonly regressionService: RegressionService) {}

  @Get('/modelling')
  async dataModelling() {
    const data = await this.regressionService.dataModelling();
    return { data };
  }

  @Get('/testing')
  async dataTesting() {
    const data = await this.regressionService.dataTesting();
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
