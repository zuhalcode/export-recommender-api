/* eslint-disable prettier/prettier */
import { Controller, Get, Post, Param } from '@nestjs/common';
import { ProductService } from './product.service';
import { WebResponse } from 'src/model/web.model';
import {
  CreateProductResponse,
  ProductResponse,
} from 'src/model/product.model';
// import { WebResponse } from 'src/model/web.model';
// import { ProductResponse } from 'src/model/product.model';

@Controller('/api/products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  async findAll(): Promise<WebResponse<ProductResponse[]>> {
    const products: ProductResponse[] = await this.productService.findAll();
    return { message: 'Products Retrieved Successfully', data: products };
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
  ): Promise<WebResponse<ProductResponse>> {
    const products = await this.productService.findOne(+id);

    return { message: 'Products retrieved successfully', data: products };
  }

  @Get('/hscode/:hscode')
  async findByHscode(
    @Param('hscode') hscode: string,
  ): Promise<WebResponse<ProductResponse[]>> {
    const products = await this.productService.findByHscode(hscode);

    return { message: 'Products retrieved successfully', data: products };
  }

  @Post()
  async create(): Promise<WebResponse<CreateProductResponse>> {
    const products = await this.productService.create();

    return { message: 'Products created successfully', data: products };
  }
}
