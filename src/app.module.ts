import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TrademapModule } from './trademap/trademap.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [TrademapModule, DatabaseModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
