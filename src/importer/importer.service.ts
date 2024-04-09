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
      select: { id: true, name: true, hscode: true },
      take: 100,
    });

    return importers;
  }

  async findByHscode(hscode: string): Promise<ImporterResponse[]> {
    const importers = await this.databaseService.importers.findMany({
      where: { hscode },
      select: { id: true, name: true, hscode: true },
      take: 100,
    });

    return importers;
  }

  findOne(id: number) {
    return `This action returns a #${id} importer`;
  }
}
