import { UserService } from './../../user.service';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { map, switchMap, tap } from 'rxjs';
import { LineLoginAccessToken } from '../models/line-login-access-token';
import { LineLoginProfile } from '../models/line-login-profile';
import { ConfigService } from '@nestjs/config';
import { BaseOauthService } from './base-oauth.service';
import { User } from 'src/user';

@Injectable()
export class LineLoginService extends BaseOauthService {
  authorizeUrl = 'https://access.line.me/oauth2/v2.1/authorize';
  accessTokenUrl = 'https://api.line.me/oauth2/v2.1/token';
  profileUrl = 'https://api.line.me/v2/profile';
  revokeUrl = 'https://api.line.me/oauth2/v2.1/revoke';
  verifyUrl = 'https://api.line.me/oauth2/v2.1/verify';
  redirectUrl = '';
  grant_type = 'code';
  clientId = '';
  clientSecret = '';
  state = '123';
  scope = 'profile%20openid%20email';

  constructor(
    protected httpService: HttpService,
    private configService: ConfigService,
  ) {
    super(httpService);
    this.clientId = this.configService.get('lineLoginClientId');
    this.clientSecret = this.configService.get('lineLoginSecret');
    this.redirectUrl = `${this.configService.get(
      'siteDomain',
    )}/oauth/lineLogin/callback`;
  }

  getProfile(token: any) {
    const params = new URLSearchParams();
    params.append('id_token', token.id_token);
    params.append('client_id', this.clientId);
    return this.httpService
      .post(this.verifyUrl, params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })
      .pipe(
        map((resp) => resp.data),
        map((profile) => {
          return {
            name: profile.name,
            email: profile.email,
            lineAccountId: profile.sub,
            lineAccessToken: token.access_token,
          };
        }),
      );
  }

  revokeToken(token: string) {
    const params = new URLSearchParams();
    params.append('access_token', token);
    params.append('client_id', this.clientId);
    params.append('client_secret', this.clientSecret);
    return this.httpService.post(this.revokeUrl, params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
  }
}
