import { UserService } from './../../user.service';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { map, tap } from 'rxjs';
import { LineLoginAccessToken } from '../models/line-login-access-token';
import { LineLoginProfile } from '../models/line-login-profile';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LineLoginService {
  authorizeUrl = 'https://access.line.me/oauth2/v2.1/authorize';
  accessTokenUrl = 'https://api.line.me/oauth2/v2.1/token';
  profileUrl = 'https://api.line.me/v2/profile';
  revokeUrl = 'https://api.line.me/oauth2/v2.1/revoke';
  redirectUrl = 'http://localhost:3000/oauth/lineLogin/callback';
  grant_type = 'code';
  clientId = '';
  clientSecret = '';
  state = '123';
  scope = 'profile%20openid%20email';

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {
    this.clientId = this.configService.get('lineLoginClientId');
    this.clientSecret = this.configService.get('lineLoginSecret');
  }

  getOauthUrl(): string {
    return `${this.authorizeUrl}?client_id=${this.clientId}&response_type=${this.grant_type}&redirect_uri=${this.redirectUrl}&state=${this.state}&scope=${this.scope}`;
  }

  getAccessToken(code: string) {
    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    params.append('code', code);
    params.append('redirect_uri', this.redirectUrl);
    params.append('client_id', this.clientId);
    params.append('client_secret', this.clientSecret);

    return this.httpService
      .post<LineLoginAccessToken>(this.accessTokenUrl, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      })
      .pipe(map((resp) => resp.data));
  }

  getProfile(token: string) {
    return this.httpService
      .get<LineLoginProfile>(this.profileUrl, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .pipe(map((resp) => resp.data));
  }

  revokeToken() {
    const params = new URLSearchParams();
    params.append('access_token', 'authorization_code');
    params.append('client_id', this.clientId);
    params.append('client_secret', this.clientSecret);
    return this.httpService.post(this.revokeUrl, params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
  }
}
