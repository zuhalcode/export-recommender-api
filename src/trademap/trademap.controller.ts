/* eslint-disable prettier/prettier */
import { Controller, Get, Param, Post } from '@nestjs/common';
import { TrademapService } from './trademap.service';
import { WebResponse } from 'src/model/web.model';
import {
  CreateTrademapResponse,
  GetTrademapResponse,
  ScrapeHscodeResponse,
} from 'src/model/trademap.model';

@Controller('/api/trademap')
export class TrademapController {
  constructor(private readonly trademapService: TrademapService) {}

  // FIX CONTROLLER
  @Get('/scrape/hscode')
  async scrapeHscode(): Promise<WebResponse<ScrapeHscodeResponse[]>> {
    const scrapedHscode = await this.trademapService.scrapeHscodeData();

    return { data: scrapedHscode };
  }

  @Post('/scrape/importer')
  async scrapeImporters() {
    const scrapedImporters = await this.trademapService.scrapeImporters();

    return { data: scrapedImporters };
  }

  @Post('/scrape/exporter')
  async scrapeExporter() {
    const scrapedExporter = await this.trademapService.scrapeExporters();

    return { data: scrapedExporter };
  }

  @Post()
  async createTrademap(): Promise<WebResponse<CreateTrademapResponse>> {
    // Scraping data
    const createdTrademap: CreateTrademapResponse =
      await this.trademapService.createTrademap();

    return {
      message: 'Trademap Data created successfully',
      data: createdTrademap,
    };
  }

  @Post('/importers')
  async createImporter() {
    const createdImporters = await this.trademapService.createImporters();

    return {
      message: 'Importer Data created successfully',
      createdImporters,
    };
  }
  // FIX CONTROLLER

  // TESTING CONTROLLER

  @Get()
  async findAll(): Promise<WebResponse<GetTrademapResponse[]>> {
    const trademaps = await this.trademapService.findAll();

    return { message: 'Trademap Data Retrieved Successfully', data: trademaps };
  }

  @Get(':hscode')
  async findOne(
    @Param('hscode') hscode: string,
  ): Promise<WebResponse<GetTrademapResponse>> {
    const trademap = await this.trademapService.findOne(hscode);
    return { message: 'Trademap Data Retrieved Successfully', data: trademap };
  }

  @Post() // OK
  async scrapeAndCreateProduct() {
    // Scraping data
    const scrapedData = await this.trademapService.scrapeHscodeData();

    return { data: scrapedData };
  }

  @Post('/create') // OK
  async create() {
    // Scraping data
    const createdTrademap = await this.trademapService.createTrademap();

    return {
      message: 'Trademap Data created successfully',
      createdTrademap,
    };
  }

  @Post('/create/importers') // OK
  async createImporters() {
    const createdImporters = await this.trademapService.createImporters();

    return {
      message: 'Importer Data created successfully',
      createdImporters,
    };
  }

  @Post('/importers') // OK
  async scrapeAndCreateImporters() {
    const scrapedImporters = await this.trademapService.scrapeImporters();

    return scrapedImporters;
  }

  @Post('/remain-importers')
  async scrapeRemainImporters() {
    const scrapedImporters = await this.trademapService.scrapeRemainImporters();

    return scrapedImporters;
  }

  @Post('/exporters') // OK
  async scrapeAndCreateExporter() {
    const scrapedExporter = await this.trademapService.scrapeExporters();

    return scrapedExporter;
  }

  @Post('/create/exporters')
  async scrape() {
    const exporterData = await this.trademapService.createExporters();

    return exporterData;
  }

  @Post('/combine')
  async combine() {
    await this.trademapService.combine();

    return { message: 'Combine all Exporters Successfully' };
  }

  @Post('/clean')
  async clean() {
    await this.trademapService.clean();

    return { message: 'Cleaning all Exporters Successfully' };
  }

  @Post('/clean-files')
  async cleanFiles() {
    await this.trademapService.cleanFiles();

    return { message: 'Cleaning all Exporters Successfully' };
  }
  // TESTING CONTROLLER
}
