/* eslint-disable prettier/prettier */
import { PartialType } from '@nestjs/mapped-types';
import { CreateRegressionDto } from './create-regression.dto';

export class UpdateRegressionDto extends PartialType(CreateRegressionDto) {}
