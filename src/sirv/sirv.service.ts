import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class SirvService {
  private readonly logger = new Logger(SirvService.name);
  private token: string | null = null;
  private tokenExpiry: number | null = null;

  constructor(
    private configService: ConfigService,
    private httpService: HttpService
  ) {}

  async getToken(): Promise<string> {
    if (this.token && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.token;
    }

    const clientId = this.configService.get<string>('SIRV_CLIENT_ID');
    const clientSecret = this.configService.get<string>('SIRV_CLIENT_SECRET');
    
    this.logger.debug(`Attempting to get token with clientId: ${clientId ? clientId.substring(0, 10) + '...' : 'NOT SET'}`);
    this.logger.debug(`Client secret present: ${clientSecret ? 'YES (' + clientSecret.length + ' chars)' : 'NO'}`);
    this.logger.debug(`Full clientId: ${clientId}`);
    this.logger.debug(`Full clientSecret: ${clientSecret}`);

    try {
      const response = await this.httpService.axiosRef.post('https://api.sirv.com/v2/token', {
        clientId: clientId,
        clientSecret: clientSecret,
      });

      this.token = response.data.token;
      this.tokenExpiry = Date.now() + response.data.expiresIn * 1000 - 60000; // 1 min buffer
      return this.token || '';
    } catch (error) {
      this.logger.error('Failed to get Sirv token:', error.message);
      throw new Error('Failed to authenticate with Sirv API');
    }
  }

  async uploadBase64Image(base64Data: string, path: string): Promise<any> {
    try {
      // Force fresh token for each upload to avoid caching issues
      this.token = null;
      this.tokenExpiry = null;
      
      const token = await this.getToken();
      this.logger.debug(`Token for upload: ${token ? token.substring(0, 20) + '...' : 'NO TOKEN'}`);
      
      // Remove data URL prefix if present (e.g., "data:image/jpeg;base64,")
      const base64Content = base64Data.replace(/^data:image\/[a-z]+;base64,/, '');
      
      // Convert base64 to buffer for binary upload
      const buffer = Buffer.from(base64Content, 'base64');
      
      // Determine MIME type from original data URL or default to jpeg
      let mimeType = 'image/jpeg';
      let fileExtension = 'jpg';
      const mimeMatch = base64Data.match(/^data:image\/([a-z]+);base64,/);
      if (mimeMatch) {
        const imageType = mimeMatch[1];
        mimeType = `image/${imageType}`;
        // Map MIME types to file extensions
        switch (imageType) {
          case 'png':
            fileExtension = 'png';
            break;
          case 'gif':
            fileExtension = 'gif';
            break;
          case 'webp':
            fileExtension = 'webp';
            break;
          case 'jpeg':
          case 'jpg':
          default:
            fileExtension = 'jpg';
            break;
        }
      }
      
      // Ensure the path has the correct file extension
      let filename = path;
      if (!filename.includes('.')) {
        filename = `${path}.${fileExtension}`;
      }
      
      // Enhanced logging
      console.log('Sirv Upload Debug:');
      console.log('- Token (first 20 chars):', token.substring(0, 20));
      console.log('- Buffer size:', buffer.length);
      console.log('- MIME type:', mimeType);
      console.log('- Original path:', path);
      console.log('- Final filename:', filename);
      
      // Correct URL format: use query parameter for filename
      const uploadUrl = `https://api.sirv.com/v2/files/upload?filename=${encodeURIComponent('/' + filename)}`;
      console.log('- Full upload URL:', uploadUrl);
      
      const response = await this.httpService.axiosRef.post(
        uploadUrl,
        buffer, // Send raw binary data
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': mimeType,
          },
        }
      );

      // Construct the public URL for the uploaded file
      const sirvDomain = this.configService.get<string>('SIRV_DOMAIN');
      const publicUrl = `https://${sirvDomain}/${filename}`;
      
      console.log('- Upload successful! Public URL:', publicUrl);
      
      return {
        success: true,
        url: publicUrl,
        filename: filename
      };
    } catch (error) {
      console.error('Sirv upload error:', error.response?.data || error.message);
      throw new Error(`Failed to upload image to Sirv: ${error.response?.data?.message || error.message}`);
    }
  }

  async uploadBuffer(buffer: Buffer, mimeType: string, originalFilename?: string): Promise<string> {
    // Extract extension from MIME type or original filename
    let ext = 'bin'; // default for unknown types

    if (originalFilename) {
      const fileExt = originalFilename.split('.').pop()?.toLowerCase();
      if (fileExt) ext = fileExt;
    } else {
      if (mimeType.includes('jpeg') || mimeType.includes('jpg')) ext = 'jpg';
      else if (mimeType.includes('gif')) ext = 'gif';
      else if (mimeType.includes('webp')) ext = 'webp';
      else if (mimeType.includes('png')) ext = 'png';
      else if (mimeType.startsWith('video/')) {
        const videoType = mimeType.split('/')[1];
        if (videoType === 'quicktime') ext = 'mov';
        else if (videoType === 'x-ms-wmv') ext = 'wmv';
        else if (videoType === 'x-matroska') ext = 'mkv';
        else ext = videoType;
      }
    }

    const filename = `uploads/${uuidv4()}.${ext}`;
    const token = await this.getToken();
    const sirvDomain = this.configService.get<string>('SIRV_DOMAIN');

    try {
      const response = await this.httpService.axiosRef.post(
        `https://api.sirv.com/v2/files/upload?filename=/${filename}`,
        buffer,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': mimeType,
            'Content-Length': buffer.length.toString(),
          },
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
        }
      );

      if (response.status !== 200) {
        throw new Error(`Sirv API error: ${response.status} - ${JSON.stringify(response.data)}`);
      }

      return `https://${sirvDomain}/${filename}`;
    } catch (err) {
      this.logger.error('Sirv upload error:', err.message);
      if (err.response) {
        this.logger.error('Response:', err.response.data);
      }
      throw err;
    }
  }
}