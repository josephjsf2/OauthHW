import { ConfigService } from '@nestjs/config';
import { GoogleLoginAccessToken } from './../models/google-login-access-token';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { map } from 'rxjs';
import { BaseOauthService } from './base-oauth.service';

@Injectable()
export class GoogleLoginService extends BaseOauthService {
  authorizeUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
  accessTokenUrl = 'https://oauth2.googleapis.com/token';
  profileUrl = 'https://www.googleapis.com/userinfo/v2/me';
  revokeUrl = 'https://oauth2.googleapis.com/revoke';
  verifyUrl = 'https://oauth2.googleapis.com/tokeninfo';
  grant_type = 'code';
  state = '123';
  scope =
    'https://www.googleapis.com/auth/userinfo.email%20https://www.googleapis.com/auth/userinfo.profile%20openid';

  constructor(
    protected httpService: HttpService,
    protected configService: ConfigService,
  ) {
    super(httpService);
    this.clientId = this.configService.get('googleClientId');
    this.clientSecret = this.configService.get('googleSecret');
    this.redirectUrl = `${this.configService.get(
      'siteDomain',
    )}/oauth/googleLogin/callback`;
  }

  getProfile(token: any) {
    return this.httpService
      .get<any>(`${this.verifyUrl}?id_token=${token.id_token}`)
      .pipe(
        map((resp) => resp.data),
        map((profile) => {
          return {
            name: profile.name,
            email: profile.email,
            googleAccountId: profile.sub,
            googleAccessToken: token.access_token,
          };
        }),
      );
  }

  revokeToken(token: string) {
    return this.httpService.post(`${this.revokeUrl}?token=${token}`, null, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
  }
}
