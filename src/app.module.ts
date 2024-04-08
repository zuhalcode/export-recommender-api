import { Module } from '@nestjs/common';
import { TrademapModule } from './trademap/trademap.module';
import { RegressionModule } from './regression/regression.module';
import { CommonModule } from './common/common.module';
import { ProductModule } from './product/product.module';
import { ImporterController } from './importer/importer.controller';
import { ImporterService } from './importer/importer.service';
import { ImporterModule } from './importer/importer.module';
import { ImporterModule } from './importer/importer.module';

@Module({
  imports: [TrademapModule, RegressionModule, CommonModule, ProductModule, ImporterModule],
  controllers: [ImporterController],
  providers: [ImporterService],
})
export class AppModule {}
