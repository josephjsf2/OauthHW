import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { pluck } from 'rxjs/operators';
import { BaseOauthService } from './base-oauth.service';

@Injectable()
export class LineNotifyService extends BaseOauthService {
  authorizeUrl = 'https://notify-bot.line.me/oauth/authorize';
  accessTokenUrl = 'https://notify-bot.line.me/oauth/token';
  revokeUrl = 'https://notify-api.line.me/api/revoke';
  messageUrl = 'https://notify-api.line.me/api/notify';
  grant_type = 'code';
  state = '123';
  scope = 'notify';

  constructor(
    protected httpService: HttpService,
    private configService: ConfigService,
  ) {
    super(httpService);
    this.clientId = this.configService.get('lineNotifyClientId');
    this.clientSecret = this.configService.get('lineNotifySecret');
    this.redirectUrl = `${this.configService.get(
      'siteDomain',
    )}/oauth/lineNotify/callback`;
  }

  getAccessToken(code: string) {
    return super.getAccessToken(code).pipe(pluck('access_token'));
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

  getProfile(token: string): Observable<any> {
    throw new Error('Method not implemented.');
  }
}
