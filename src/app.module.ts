import { AdminGoogleLoginService } from './oauth/services/admin-google-login.service';
import { LineNotifyService } from './oauth/services/line-notify.service';
import { OauthController } from './oauth/controllers/oauth.controller';
import { Module } from '@nestjs/common';
import { LineLoginService } from './oauth/services/line-login.service';
import { HttpModule } from '@nestjs/axios';
import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';
import { UserService } from './user.service';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import appConfig from './app.config';
import { GoogleLoginService } from './oauth/services/google-login.service';
import { AdminOauthController } from './oauth/controllers/admin-oauth.controller';

const BASE_DIR_CFG = () => ({
  rootDir: join(__dirname, '..'),
  envDir: join(__dirname, '..', 'environments'),
});
@Module({
  imports: [
    HttpModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'assets'),
      serveRoot: '/assets',
    }),
    ConfigModule.forRoot({
      envFilePath: ['environments/.env'],
      load: [BASE_DIR_CFG, appConfig],
      expandVariables: true,
      isGlobal: true,
    }),
  ],
  controllers: [OauthController, AppController, AdminOauthController],
  providers: [
    UserService,
    LineLoginService,
    LineNotifyService,
    GoogleLoginService,
    AdminGoogleLoginService,
  ],
})
export class AppModule {}
