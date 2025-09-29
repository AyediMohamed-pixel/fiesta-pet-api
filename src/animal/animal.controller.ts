import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Query,
  ValidationPipe,
  UsePipes,
} from '@nestjs/common';
import { AnimalService } from './animal.service';
import { CreateAnimalDto, UpdateAnimalDto } from './dto/animal.dto';
import { SirvService } from '../sirv/sirv.service';

@Controller('animals')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class AnimalController {
  constructor(
    private readonly animalService: AnimalService,
    private readonly sirvService: SirvService,
  ) {}

  @Get('health')
  @HttpCode(HttpStatus.OK)
  async health() {
    return { status: 'ok', message: 'Animal controller is working', timestamp: new Date().toISOString() };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createAnimalDto: CreateAnimalDto) {
    return this.animalService.create(createAnimalDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query('ownerId') ownerId?: string,
    @Query('animalTypeId') animalTypeId?: string,
  ) {
    if (ownerId) {
      return this.animalService.findByOwner(ownerId);
    }
    
    if (animalTypeId) {
      return this.animalService.findByAnimalType(animalTypeId);
    }
    
    return this.animalService.findAll();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string) {
    return await this.animalService.findOne(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() updateAnimalDto: UpdateAnimalDto,
  ) {
    return await this.animalService.update(id, updateAnimalDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    return await this.animalService.remove(id);
  }

  @Get('owner/:ownerId')
  @HttpCode(HttpStatus.OK)
  async findByOwner(@Param('ownerId') ownerId: string) {
    return await this.animalService.findByOwner(ownerId);
  }

  @Get('type/:animalTypeId')
  @HttpCode(HttpStatus.OK)
  async findByAnimalType(@Param('animalTypeId') animalTypeId: string) {
    return await this.animalService.findByAnimalType(animalTypeId);
  }

  @Post(':id/upload-qr')
  @HttpCode(HttpStatus.OK)
  async uploadQRCode(
    @Param('id') id: string,
    @Body('qrCodeBase64') qrCodeBase64: string,
  ) {
    try {
      // Generate a unique filename for the QR code
      const timestamp = Date.now();
      const filename = `qr-codes/animal-${id}-${timestamp}`;
      
      // Upload the QR code to SIRV
      const uploadResult = await this.sirvService.uploadBase64Image(qrCodeBase64, filename);
      
      // Update the animal record with the QR code URL
      const updatedAnimal = await this.animalService.update(id, {
        qrCode: uploadResult.url
      });
      
      return {
        success: true,
        qrCodeUrl: uploadResult.url,
        animal: updatedAnimal
      };
    } catch (error) {
      throw new Error(`Failed to upload QR code: ${error.message}`);
    }
  }
}