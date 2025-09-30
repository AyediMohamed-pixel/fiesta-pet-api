import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import * as express from 'express';
import morgan from 'morgan';
import * as bodyParser from 'body-parser';
import mongoSanitize from 'express-mongo-sanitize';
import cors from 'cors';
import { expressCspHeader, SELF, NONE } from 'express-csp-header';
import hsts from 'hsts';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as requestIp from 'request-ip';
import { ConfigService } from '@nestjs/config';
import { EventEmitter } from 'events';

async function bootstrap() {

  EventEmitter.defaultMaxListeners = 20;
  
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
  });


  const configService = app.get(ConfigService);
 
  const allowlist = [
      'https://fiesta-pet.vercel.app/',
      'https://fiesta-pet.vercel.app',
      'https://fiesta-pet-4iog.vercel.app/',
      'https://fiesta-pet-4iog.vercel.app',
      'http://localhost:8100',
      'http://localhost:8101'
  ];
  
  const corsOptionsDelegate = function (req, callback) {
    let corsOptions;
    // Allow all origins for testing, or check if origin is in allowlist
    if (!req.header('Origin') || allowlist.indexOf(req.header('Origin')) !== -1) {
      corsOptions = { origin: true }; // reflect (enable) the requested origin in the CORS response
    } else {
      corsOptions = { origin: false }; // disable CORS for this request
    }
    callback(null, corsOptions); // callback expects two parameters: error and options
  };

  // Temporarily disable CORS for testing
  app.use(cors({ origin: true }));
  app.use(morgan('dev'));
  app.use(bodyParser.json({ limit: '100mb' }));
  app.use(
    bodyParser.urlencoded({
      limit: '100mb',
      extended: true,
      parameterLimit: 1000000,
    }),
  );

  // Temporarily disable mongo sanitize due to compatibility issue
  // app.use(mongoSanitize());

  app.use(
    expressCspHeader({
      directives: {
        'default-src': [SELF],
        'object-src': [NONE],
        'require-trusted-types-for': "'script'",
      },
    }),
  );
  app.use(
    hsts({
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    }),
  );
  app.use(requestIp.mw());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      crossOriginEmbedderPolicy: false,
      contentSecurityPolicy: {
        directives: {
          imgSrc: [
            `'self'`,
            'data:',
            'apollo-server-landing-page.cdn.apollographql.com',
          ],
          scriptSrc: [`'self'`, `https: 'unsafe-inline'`],
          manifestSrc: [
            `'self'`,
            'apollo-server-landing-page.cdn.apollographql.com',
          ],
          frameSrc: [`'self'`, 'sandbox.embed.apollographql.com'],
        },
      },
    }),
  );

  /*if (configService.get('STATS') === 'prod') {
    const redisIoAdapter = new RedisIoAdapter(app);
    await redisIoAdapter.connectToRedis();
    app.useWebSocketAdapter(redisIoAdapter);
  }*/

  // app.useBodyParser({ limit: '100mb' });

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
