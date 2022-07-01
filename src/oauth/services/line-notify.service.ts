import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { map } from 'rxjs';
import { pluck } from 'rxjs/operators';

@Injectable()
export class LineNotifyService {
  authorizeUrl = 'https://notify-bot.line.me/oauth/authorize';
  accessTokenUrl = 'https://notify-bot.line.me/oauth/token';
  revokeUrl = 'https://notify-api.line.me/api/revoke';
  messageUrl = 'https://notify-api.line.me/api/notify';
  clientId = '';
  clientSecret = '';
  redirectUrl = '';
  grant_type = 'code';
  state = '123';
  scope = 'notify';

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {
    this.clientId = this.configService.get('lineNotifyClientId');
    this.clientSecret = this.configService.get('lineNotifySecret');
    this.redirectUrl = this.configService.get('lineNotifyCallback');
  }

  getOauthUrl(): string {
    return `${this.authorizeUrl}?response_type=${this.grant_type}&client_id=${this.clientId}&redirect_uri=${this.redirectUrl}&scope=${this.scope}&state=${this.state}`;
  }

  getAccessToken(code: string) {
    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    params.append('code', code);
    params.append('redirect_uri', this.redirectUrl);
    params.append('client_id', this.clientId);
    params.append('client_secret', this.clientSecret);

    return this.httpService
      .post<{ access_token: string }>(this.accessTokenUrl, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      })
      .pipe(
        map((resp) => resp.data),
        pluck('access_token'),
      );
  }

  revokeToken(accessToken: string) {
    return this.httpService.post(this.revokeUrl, null, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  }

  sendMessage(accessToken: string, message: string) {
    const params = new URLSearchParams();
    params.append('message', message);

    return this.httpService.post(this.messageUrl, params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Bearer ${accessToken}`,
      },
    });
  }
}
