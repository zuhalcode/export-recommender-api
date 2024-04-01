/* eslint-disable prettier/prettier */
import { Controller, Post } from '@nestjs/common';
import { RegressionService } from './regression.service';

@Controller('regression')
export class RegressionController {
  constructor(private readonly regressionService: RegressionService) {}

  @Post()
  async linearRegression() {
    const data = await this.regressionService.linearRegression();

    return { data };
  }
}
