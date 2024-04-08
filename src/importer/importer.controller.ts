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
    return { message: 'Importers Retrieved successfully', data: importers };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.importerService.findOne(+id);
  }
}
