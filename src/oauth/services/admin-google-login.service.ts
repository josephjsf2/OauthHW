import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleLoginService } from './google-login.service';

@Injectable()
export class AdminGoogleLoginService extends GoogleLoginService {
  constructor(
    protected httpService: HttpService,
    protected configService: ConfigService,
  ) {
    super(httpService, configService);
    this.redirectUrl = `${this.configService.get(
      'siteDomain',
    )}/admin/oauth/googleLogin/callback`;
  }
}
