import { Controller, Post, Body, BadRequestException, Get } from '@nestjs/common';
import { SirvService } from './sirv.service';
import { ConfigService } from '@nestjs/config';

@Controller('sirv')
export class SirvController {
  constructor(
    private readonly sirvService: SirvService,
    private readonly configService: ConfigService
  ) {}

  @Get('test-env')
  async testEnvironment() {
    const clientId = this.configService.get<string>('SIRV_CLIENT_ID');
    const clientSecret = this.configService.get<string>('SIRV_CLIENT_SECRET');
    const domain = this.configService.get<string>('SIRV_DOMAIN');
    
    return {
      clientId: clientId ? clientId.substring(0, 10) + '...' : 'NOT SET',
      clientSecret: clientSecret ? 'SET (length: ' + clientSecret.length + ')' : 'NOT SET',
      domain: domain || 'NOT SET'
    };
  }

  @Get('test-token')
  async testToken() {
    try {
      const token = await this.sirvService.getToken();
      return {
        success: true,
        tokenReceived: !!token,
        tokenLength: token ? token.length : 0
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  @Post('upload')
  async uploadBase64Image(@Body('base64') base64: string, @Body('path') path: string) {
    try {
      if (!base64) {
        throw new BadRequestException('Base64 image data is required');
      }

      const imageUrl = await this.sirvService.uploadBase64Image(base64, path);

      return { status: 200, data: imageUrl }
    } catch (error) {
      throw new BadRequestException({
        success: false,
        message: error.message || 'Failed to upload image to Sirv'
      });
    }
  }
}
