import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAnimalDto, UpdateAnimalDto } from './dto/animal.dto';
import { Pet } from '@prisma/client';

@Injectable()
export class AnimalService {
  constructor(private prisma: PrismaService) {}

  async create(createAnimalDto: CreateAnimalDto): Promise<Pet> {
    try {
      // Validate that animalTypeId exists
      const animalType = await this.prisma.animalType.findUnique({
        where: { id: createAnimalDto.animalTypeId }
      });

      if (!animalType) {
        throw new BadRequestException('Animal type not found');
      }

      // Validate phone numbers
      if (!createAnimalDto.phoneNumbers || createAnimalDto.phoneNumbers.length === 0) {
        throw new BadRequestException('At least one phone number is required');
      }

      const animal = await this.prisma.pet.create({
        data: {
          animalName: createAnimalDto.animalName,
          ownerName: createAnimalDto.ownerName,
          adress: createAnimalDto.adress,
          phoneNumbers: createAnimalDto.phoneNumbers,
          additionalNote: createAnimalDto.additionalNote,
          animalTypeId: createAnimalDto.animalTypeId,
          qrCode: createAnimalDto.qrCode,
          img_uri: createAnimalDto.img_uri,
          ownerId: createAnimalDto.ownerId,
        },
        include: {
          animalType: true,
          owner: true,
        },
      });

      return animal;
    } catch (error) {
      console.error('Error creating animal:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Failed to create animal: ${error.message}`);
    }
  }

  async findAll(): Promise<Pet[]> {
    try {
      return await this.prisma.pet.findMany({
        include: {
          animalType: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } catch (error) {
      console.error('Error fetching animals:', error);
      throw new BadRequestException('Failed to fetch animals');
    }
  }

  async findOne(id: string): Promise<Pet> {
    try {
      const animal = await this.prisma.pet.findUnique({
        where: { id },
        include: {
          animalType: true,
        },
      });

      if (!animal) {
        throw new NotFoundException(`Animal with ID ${id} not found`);
      }

      return animal;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error fetching animal:', error);
      throw new BadRequestException('Failed to fetch animal');
    }
  }

  async update(id: string, updateAnimalDto: UpdateAnimalDto): Promise<Pet> {
    try {
      // Check if animal exists
      const existingAnimal = await this.prisma.pet.findUnique({
        where: { id },
      });

      if (!existingAnimal) {
        throw new NotFoundException(`Animal with ID ${id} not found`);
      }

      // Validate animalTypeId if provided
      if (updateAnimalDto.animalTypeId) {
        const animalType = await this.prisma.animalType.findUnique({
          where: { id: updateAnimalDto.animalTypeId }
        });

        if (!animalType) {
          throw new BadRequestException('Animal type not found');
        }
      }

      // Validate phone numbers if provided
      if (updateAnimalDto.phoneNumbers && updateAnimalDto.phoneNumbers.length === 0) {
        throw new BadRequestException('At least one phone number is required');
      }

      const updatedAnimal = await this.prisma.pet.update({
        where: { id },
        data: {
          ...(updateAnimalDto.animalName && { animalName: updateAnimalDto.animalName }),
          ...(updateAnimalDto.ownerName && { ownerName: updateAnimalDto.ownerName }),
          ...(updateAnimalDto.adress && { adress: updateAnimalDto.adress }),
          ...(updateAnimalDto.phoneNumbers && { phoneNumbers: updateAnimalDto.phoneNumbers }),
          ...(updateAnimalDto.additionalNote !== undefined && { additionalNote: updateAnimalDto.additionalNote }),
          ...(updateAnimalDto.animalTypeId && { animalTypeId: updateAnimalDto.animalTypeId }),
          ...(updateAnimalDto.qrCode !== undefined && { qrCode: updateAnimalDto.qrCode }),
          ...(updateAnimalDto.img_uri !== undefined && { img_uri: updateAnimalDto.img_uri }),
          ...(updateAnimalDto.ownerId !== undefined && { ownerId: updateAnimalDto.ownerId }),
        },
        include: {
          animalType: true,
          owner: true,
        },
      });

      return updatedAnimal;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to update animal');
    }
  }

  async remove(id: string): Promise<{ message: string }> {
    try {
      // Check if animal exists
      const existingAnimal = await this.prisma.pet.findUnique({
        where: { id },
      });

      if (!existingAnimal) {
        throw new NotFoundException(`Animal with ID ${id} not found`);
      }

      await this.prisma.pet.delete({
        where: { id },
      });

      return { message: `Animal with ID ${id} has been successfully deleted` };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to delete animal');
    }
  }

  async findByOwner(ownerId: string): Promise<Pet[]> {
    try {
      return await this.prisma.pet.findMany({
        where: { ownerId },
        include: {
          animalType: true,
          owner: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } catch (error) {
      throw new BadRequestException('Failed to fetch animals by owner');
    }
  }

  async findByAnimalType(animalTypeId: string): Promise<Pet[]> {
    try {
      return await this.prisma.pet.findMany({
        where: { animalTypeId },
        include: {
          animalType: true,
          owner: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } catch (error) {
      throw new BadRequestException('Failed to fetch animals by type');
    }
  }
}