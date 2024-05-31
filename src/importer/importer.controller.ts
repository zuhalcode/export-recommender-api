/* eslint-disable prettier/prettier */
import { Controller, Get, Param } from '@nestjs/common';
import { ImporterService } from './importer.service';
import { WebResponse } from 'src/model/web.model';
import { ImporterResponse } from 'src/model/importer.model';

@Controller('/api/importers')
export class ImporterController {
  constructor(private readonly importerService: ImporterService) {}

  @Get()
  async findAll(): Promise<WebResponse<ImporterResponse[]>> {
    const importers = await this.importerService.findAll();

    return { data: importers };
  }

  @Get('/hscode/:hscode')
  async findByHscode(
    @Param('hscode') hscode: string,
  ): Promise<WebResponse<ImporterResponse[]>> {
    const importers = await this.importerService.findByHscode(hscode);

    return { message: 'Importers Retrieved successfully', data: importers };
  }
}
