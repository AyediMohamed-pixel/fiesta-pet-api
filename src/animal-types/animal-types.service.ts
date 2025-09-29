import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AnimalType } from '@prisma/client';

@Injectable()
export class AnimalTypesService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<AnimalType[]> {
    try {
      return await this.prisma.animalType.findMany({
        orderBy: {
          label: 'asc',
        },
      });
    } catch (error) {
      console.error('Error fetching animal types:', error);
      throw new BadRequestException('Failed to fetch animal types');
    }
  }
}