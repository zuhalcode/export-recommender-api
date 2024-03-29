/* eslint-disable prettier/prettier */
import { Controller, Post } from '@nestjs/common';
import { TrademapService } from './trademap.service';

@Controller('trademap')
export class TrademapController {
  constructor(private readonly trademapService: TrademapService) {}

  @Post('/')
  async scrapeAndCreateProduct() {
    // Scraping data
    const scrapedData = await this.trademapService.scrapeHscodeData();

    // Membuat produk berdasarkan data yang di-scrape
    // const trademapHscode = await this.trademapService.create(scrapedData);

    return { message: 'Data Scraped Successfully', scrapedData };
  }

  @Post('/create')
  async create() {
    // Scraping data
    const createdTrademap = await this.trademapService.createTrademap();

    return {
      message: 'Trademap Data created successfully',
      createdTrademap,
    };
  }

  @Post('/create/importers')
  async createImporters() {
    const createdImporters = await this.trademapService.createImporters();

    return {
      message: 'Importer Data created successfully',
      createdImporters,
    };
  }

  @Post('/importers')
  async scrapeAndCreateImporters() {
    const scrapedImporters = await this.trademapService.scrapeImporters();

    return scrapedImporters;
  }

  @Post('/remain-importers')
  async scrapeRemainImporters() {
    const scrapedImporters = await this.trademapService.scrapeRemainImporters();

    return scrapedImporters;
  }

  @Post('/exporters')
  async scrapeAndCreateExporter() {
    const scrapedExporter = await this.trademapService.scrapeExportersTest();

    return scrapedExporter;
  }

  @Post('/test')
  async scrape() {
    const scrapedData = await this.trademapService.scrapeTest();

    return scrapedData;
  }

  @Post('/combine')
  async combine() {
    await this.trademapService.combine();

    return { message: 'Combine Exporter Successfully' };
  }
}
