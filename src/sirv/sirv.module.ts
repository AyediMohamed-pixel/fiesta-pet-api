import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { SirvController } from './sirv.controller';
import { SirvService } from './sirv.service';

@Module({
  imports: [HttpModule],
  controllers: [SirvController],
  providers: [SirvService],
  exports: [SirvService]
})
export class SirvModule {}
