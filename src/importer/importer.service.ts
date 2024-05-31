/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/common/database.service';
import { ImporterResponse } from 'src/model/importer.model';

@Injectable()
export class ImporterService {
  constructor(private readonly databaseService: DatabaseService) {}

  async findAll(): Promise<ImporterResponse[]> {
    const importers = await this.databaseService.importers.findMany({
      where: { trade_balance: { not: undefined } },
      take: 100,
    });

    return importers;
  }

  async findByHscode(hscode: string): Promise<ImporterResponse[]> {
    const importers = await this.databaseService.importers.findMany({
      where: { hscode },
      orderBy: { trade_balance: 'desc' },
      take: 100,
    });

    return importers;
  }
}
