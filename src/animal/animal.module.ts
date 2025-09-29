import { Module } from '@nestjs/common';
import { AnimalService } from './animal.service';
import { AnimalController } from './animal.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { SirvModule } from '../sirv/sirv.module';

@Module({
  imports: [PrismaModule, SirvModule],
  controllers: [AnimalController],
  providers: [AnimalService],
  exports: [AnimalService],
})
export class AnimalModule {}