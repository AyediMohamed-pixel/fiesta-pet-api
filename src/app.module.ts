import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common'; 
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { SirvModule } from './sirv/sirv.module';
import { AnimalModule } from './animal/animal.module';
import { AnimalTypesModule } from './animal-types/animal-types.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(), 
    PrismaModule,
    SirvModule,
    AnimalModule,
    AnimalTypesModule,
    
  ],
 
})
export class AppModule {}