import { GoogleLoginService } from './../services/google-login.service';
import { IdentityPipe } from './../pipes/identity.pipe';
import { UserService } from './../../user.service';
import { LineNotifyService } from './../services/line-notify.service';
import { LineLoginService } from '../services/line-login.service';
import { Body, Controller, Get, Post, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { lastValueFrom, switchMap, tap } from 'rxjs';
import { Cookies } from 'src/cookie.decorator';
import { LineLoginProfile } from '../models/line-login-profile';
import { BaseOauthService } from '../services/base-oauth.service';
import { BaseOauthContoller } from './base.controller';
import { AdminIdentityPipe } from '../pipes/admin-identity.pipe';
import { User } from 'src/user';
import { AdminGoogleLoginService } from '../services/admin-google-login.service';

@Controller('admin')
export class AdminOauthController extends BaseOauthContoller {
  constructor(
    private lineNoifyService: LineNotifyService,
    private adminGoogleService: AdminGoogleLoginService,
    protected userService: UserService,
  ) {
    super();
  }

  @Get('/oauth/login')
  login(@Res() resp: Response): void {
    return resp.redirect(this.adminGoogleService.getOauthUrl());
  }

  @Get('/oauth/googleLogin/callback')
  async googleLoginCallback(
    @Query('code') code: string,
    @Res() resp: Response,
  ) {
    return this.handleAccountLogin(this.adminGoogleService, code, resp);
  }

  @Get('/logout')
  logout(@Cookies('adminToken') adminToken, @Res() resp: Response) {
    if (adminToken) {
      this.userService.removeUserMapping(adminToken);
      resp.clearCookie('adminToken');
    }
    return resp.redirect('/');
  }

  @Post('/sendMessage')
  async sendMessage(
    @Cookies('adminToken', AdminIdentityPipe) user: User,
    @Body() msg: { message: string },
    @Res() resp: Response,
  ) {
    if (!user) {
      return resp.redirect('/admin');
    }
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

  protected async handleAccountLogin(
    oauthService: BaseOauthService,
    code: string,
    resp: Response,
  ) {
    try {
      await lastValueFrom(
        oauthService.getAccessToken(code).pipe(
          switchMap((token) => oauthService.getProfile(token)),
          tap((profile: User) => {
            let user = this.userService.getUserBySocialId(
              profile['googleAccountId'],
            );
            if (!user) {
              user = this.userService.createNewUser(profile);
            }
            const adminToken = this.userService.addAdminMapping(user);
            this.addCookie(resp, 'adminToken', adminToken);
          }),
        ),
      );
      return resp.redirect('/admin');
    } catch (err) {
      console.log(err);
    }

    return resp.status(500).send({ error: 'Oops, something went wrong.' });
  }
}
