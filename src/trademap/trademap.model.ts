import { Prisma } from '@prisma/client';

export class Trademap implements Prisma.TrademapCreateInput {
  hscode: string;
  name: string;
  link: string;
}
