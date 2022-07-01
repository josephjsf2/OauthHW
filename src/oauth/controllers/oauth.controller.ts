import { IdentityPipe } from './../pipes/identity.pipe';
import { UserService } from './../../user.service';
import { LineNotifyService } from './../services/line-notify.service';
import { LineLoginService } from '../services/line-login.service';
import { Body, Controller, Get, Post, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { lastValueFrom, switchMap, tap } from 'rxjs';
import { Cookies } from 'src/cookie.decorator';
import { LineLoginProfile } from '../models/line-login-profile';

@Controller('oauth')
export class OauthController {
  constructor(
    private lineLoginService: LineLoginService,
    private lineNoifyService: LineNotifyService,
    private userService: UserService,
  ) {}

  @Get('/lineLogin')
  lineLogin(@Res() resp: Response): void {
    return resp.redirect(this.lineLoginService.getOauthUrl());
  }

  @Get('/lineNotify')
  lineNoify(@Res() resp: Response): void {
    return resp.redirect(this.lineNoifyService.getOauthUrl());
  }

  @Get('/lineLogin/callback')
  async lineLoginCallback(@Query('code') code: string, @Res() resp: Response) {
    try {
      await lastValueFrom(
        this.lineLoginService.getAccessToken(code).pipe(
          switchMap((token) =>
            this.lineLoginService.getProfile(token.access_token),
          ),
          tap((profile) => {
            const sysToken = this.userService.addUserMapping(profile);
            this.addCookie(resp, 'sysToken', sysToken);
          }),
        ),
      );
      return resp.redirect('/');
    } catch (err) {
      console.log(err);
    }

    return resp.status(500).send({ error: 'Oops, something went wrong.' });
  }

  @Get('/logout')
  logout(@Cookies('sysToken') sysToken, @Res() resp: Response) {
    if (sysToken) {
      this.userService.removeUserMapping(sysToken);
      resp.clearCookie('sysToken');
    }
    return resp.redirect('/');
  }

  @Get('/lineNotify/callback')
  async lineNotifyCallback(
    @Cookies('sysToken', IdentityPipe) user: LineLoginProfile,
    @Query('code') code: string,
    @Query('error') error: string,
    @Res() resp: Response,
  ) {
    try {
      // Cannot obtain sysToken or access denied, redirect to index page
      if (!user || error) {
        return resp.redirect('/');
      }

      await lastValueFrom(
        this.lineNoifyService
          .getAccessToken(code)
          .pipe(
            tap((accessToken) =>
              this.userService.addUserSubscription(user.userId, accessToken),
            ),
          ),
      );
      return resp.redirect('/');
    } catch (err) {
      console.log(err);
    }
    return resp.status(500).send({ error: 'Oops, something went wrong.' });
  }

  @Post('/lineLogin/revoke')
  async revokeLineLoginToken(
    @Cookies('sysToken', IdentityPipe) user: LineLoginProfile,
    @Res() resp: Response,
  ) {
    if (user) {
      try {
        await lastValueFrom(
          this.lineLoginService
            .revokeToken()
            .pipe(
              tap((_) => this.userService.removeUserSubscribe(user.userId)),
            ),
        );
      } catch (err) {
        console.log(err);
      }
    }
    return resp.redirect('/');
  }

  @Get('/unconnectLineNotify')
  async unConnectLineNotify(
    @Cookies('sysToken', IdentityPipe) user: LineLoginProfile,
    @Res() resp: Response,
  ) {
    if (!user) {
      return resp.redirect('/');
    }
    const notifyAccessToken = this.userService.getUserSubscribeStatus(
      user.userId,
    );
    if (user && notifyAccessToken) {
      try {
        await lastValueFrom(
          this.lineNoifyService
            .revokeToken(notifyAccessToken)
            .pipe(
              tap((_) => this.userService.removeUserSubscribe(user.userId)),
            ),
        );
      } catch (err) {
        console.log(err);
      }
    }
    return resp.redirect('/');
  }

  /**
   * 寫入cookie
   */
  private addCookie(resp: Response, key: string, value: string) {
    const cookieOptions = { httpOnly: true, secure: true };
    resp.cookie(key, value, cookieOptions);
  }

  @Post('/sendMessage')
  async sendMessage(@Body() msg: { message: string }, @Res() resp: Response) {
    const subscriber = this.userService.getAllNotifyAccessToken();
    for (const accessToken of subscriber) {
      try {
        await lastValueFrom(
          this.lineNoifyService.sendMessage(accessToken, msg.message),
        );
      } catch (err) {
        console.log(err);
      }
    }
    return resp.status(200).send({ success: true });
  }
}
