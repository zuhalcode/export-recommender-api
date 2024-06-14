/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { join } from 'path';
import * as fs from 'fs';
import { DatabaseService } from 'src/common/database.service';
import {
  CreateProductResponse,
  ProductResponse,
} from 'src/model/product.model';

@Injectable()
export class ProductService {
  constructor(private readonly databaseService: DatabaseService) {}

  async findAll(): Promise<ProductResponse[]> {
    try {
      const products: ProductResponse[] =
        await this.databaseService.products.findMany({
          select: { id: true, hscode: true, name: true, desc: true },
        });

      return products;
    } catch (error) {
      console.log(error);
    }
  }

  async findByHscode(hscode: string): Promise<ProductResponse[]> {
    try {
      const products = await this.databaseService.products.findMany({
        where: { hscode },
        orderBy: { name: 'asc' },
        select: { id: true, hscode: true, name: true, desc: true },
      });
      return products;
    } catch (error) {
      console.log(error);
    }
  }

  async findOne(id: number) {
    try {
      const product = await this.databaseService.products.findFirstOrThrow({
        where: { id },
      });

      return product;
    } catch (error) {
      console.log(error);
    }
  }

  async create(): Promise<CreateProductResponse> {
    try {
      const filePath = join(process.cwd(), 'src', 'data', 'products.json');
      const rawData = fs.readFileSync(filePath, 'utf-8');
      const productData = JSON.parse(rawData);

      const createdProducts = await this.databaseService.products.createMany({
        data: productData.map((data) => ({
          name: data.name.toLowerCase(),
          desc: data.desc.toLowerCase(),
          hscode: data.hscode,
        })),
        skipDuplicates: true, // Skip creating entries with duplicate fields
      });

      return createdProducts;
    } catch (e) {
      console.log(e);
    }
  }
}
