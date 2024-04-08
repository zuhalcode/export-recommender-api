/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { ImporterService } from './importer.service';
import { ImporterController } from './importer.controller';

@Module({
  controllers: [ImporterController],
  providers: [ImporterService],
})
export class ImporterModule {}
