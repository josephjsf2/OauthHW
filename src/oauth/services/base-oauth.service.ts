import { pluck } from 'rxjs/operators';
import { HttpService } from '@nestjs/axios';
import { map, Observable } from 'rxjs';

export abstract class BaseOauthService {
  authorizeUrl = '';
  accessTokenUrl = '';
  profileUrl = '';
  revokeUrl = '';
  redirectUrl = '';
  grant_type = '';
  clientId = '';
  clientSecret = '';
  state = '';
  scope = '';
  verifyUrl = '';

  constructor(protected httpService: HttpService) {}

  getOauthUrl(): string {
    return `${this.authorizeUrl}?response_type=${this.grant_type}&client_id=${this.clientId}&redirect_uri=${this.redirectUrl}&scope=${this.scope}&state=${this.state}`;
  }

  getAccessToken(code: string): Observable<any> {
    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    params.append('code', code);
    params.append('redirect_uri', this.redirectUrl);
    params.append('client_id', this.clientId);
    params.append('client_secret', this.clientSecret);

    return this.httpService
      .post(this.accessTokenUrl, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      })
      .pipe(pluck('data'));
  }

  abstract getProfile(token: any): Observable<any>;

  abstract revokeToken(token: string): Observable<any>;
}
