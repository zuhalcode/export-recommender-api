/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/common/database.service';
import { ImporterResponse } from 'src/model/importer.model';
import { WebResponse } from 'src/model/web.model';

@Injectable()
export class ImporterService {
  constructor(private readonly databaseService: DatabaseService) {}

  async findAll(): Promise<ImporterResponse[]> {
    const importers = await this.databaseService.importers.findMany({
      select: { id: true, name: true, hscode: true },
    });

    return importers;
  }

  findOne(id: number) {
    return `This action returns a #${id} importer`;
  }
}
