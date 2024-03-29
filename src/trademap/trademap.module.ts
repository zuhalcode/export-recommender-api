import { Module } from '@nestjs/common';
import { TrademapService } from './trademap.service';
import { TrademapController } from './trademap.controller';

@Module({
  controllers: [TrademapController],
  providers: [TrademapService],
})
export class TrademapModule {}
