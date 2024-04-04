import { Module } from '@nestjs/common';
import { TrademapModule } from './trademap/trademap.module';
import { RegressionModule } from './regression/regression.module';
import { CommonModule } from './common/common.module';

@Module({
  imports: [TrademapModule, RegressionModule, CommonModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
