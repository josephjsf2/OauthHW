import { lastValueFrom, switchMap, tap } from 'rxjs';
import { Response } from 'express';
import { BaseOauthService } from '../services/base-oauth.service';
import { UserService } from 'src/user.service';
import { User } from 'src/user';
export abstract class BaseOauthContoller {

  /**
   * 寫入cookie
   */
  protected addCookie(resp: Response, key: string, value: string) {
    const cookieOptions = { httpOnly: true, secure: true };
    resp.cookie(key, value, cookieOptions);
  }
}
