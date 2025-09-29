import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { AnimalTypesService } from './animal-types.service';

@Controller('animal-types')
export class AnimalTypesController {
  constructor(private readonly animalTypesService: AnimalTypesService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll() {
    return this.animalTypesService.findAll();
  }

  @Get('health')
  @HttpCode(HttpStatus.OK)
  async health() {
    return { 
      status: 'ok', 
      message: 'Animal types controller is working', 
      timestamp: new Date().toISOString() 
    };
  }
}