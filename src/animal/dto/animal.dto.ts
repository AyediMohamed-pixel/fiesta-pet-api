import { IsString, IsArray, IsOptional, IsNotEmpty, ArrayMinSize } from 'class-validator';

export class CreateAnimalDto {
  @IsString()
  @IsNotEmpty()
  animalName: string;

  @IsString()
  @IsNotEmpty()
  ownerName: string;

  @IsString()
  @IsNotEmpty()
  adress: string;

  @IsArray()
  @ArrayMinSize(1, { message: 'At least one phone number is required' })
  @IsString({ each: true })
  phoneNumbers: string[];

  @IsOptional()
  @IsString()
  additionalNote?: string;

  @IsString()
  @IsNotEmpty()
  animalTypeId: string;

  @IsOptional()
  @IsString()
  qrCode?: string;

  @IsOptional()
  @IsString()
  img_uri?: string;

  @IsOptional()
  @IsString()
  ownerId?: string;
}

export class UpdateAnimalDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  animalName?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  ownerName?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  adress?: string;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one phone number is required' })
  @IsString({ each: true })
  phoneNumbers?: string[];

  @IsOptional()
  @IsString()
  additionalNote?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  animalTypeId?: string;

  @IsOptional()
  @IsString()
  qrCode?: string;

  @IsOptional()
  @IsString()
  img_uri?: string;

  @IsOptional()
  @IsString()
  ownerId?: string;
}

export class AnimalResponseDto {
  id: string;
  animalName: string;
  ownerName: string;
  adress: string;
  phoneNumbers: string[];
  additionalNote?: string;
  animalTypeId: string;
  qrCode?: string;
  img_uri?: string;
  ownerId?: string;
  createdAt: Date;
  updatedAt: Date;
  animalType?: {
    id: string;
    label: string;
  };
  owner?: {
    id: string;
    username: string;
    fullName: string;
    email?: string;
  };
}
