import { GoogleLoginService } from './../services/google-login.service';
import { IdentityPipe } from './../pipes/identity.pipe';
import { UserService } from './../../user.service';
import { LineNotifyService } from './../services/line-notify.service';
import { LineLoginService } from '../services/line-login.service';
import { Body, Controller, Get, Post, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { lastValueFrom, Observable, switchMap, tap } from 'rxjs';
import { Cookies } from 'src/cookie.decorator';
import { LineLoginProfile } from '../models/line-login-profile';
import { BaseOauthService } from '../services/base-oauth.service';
import { BaseOauthContoller } from './base.controller';
import { User } from 'src/user';
import { type } from 'os';

@Controller('oauth')
export class OauthController extends BaseOauthContoller {
  constructor(
    private lineLoginService: LineLoginService,
    private lineNoifyService: LineNotifyService,
    private googleService: GoogleLoginService,
    protected userService: UserService,
  ) {
    super();
  }

  @Get('/login')
  login(@Query('type') type, @Res() resp: Response): void {
    let redirectUrl = '';
    if (type === 'LINE') {
      redirectUrl = this.lineLoginService.getOauthUrl();
    } else if (type === 'NOTIFY') {
      redirectUrl = this.lineNoifyService.getOauthUrl();
    } else if (type === 'GOOGLE') {
      redirectUrl = this.googleService.getOauthUrl();
    }
    return resp.redirect(redirectUrl);
  }

  @Get('/unlinkAccount')
  async linkAccount(
    @Cookies('sysToken', IdentityPipe) user: User,
    @Query('type') type,
    @Res() resp: Response,
  ) {
    let revokeReq$: Observable<any>;
    if (type === 'LINE') {
      revokeReq$ = this.lineLoginService.revokeToken(user.lineAccessToken);
      delete user.lineAccessToken;
      delete user.lineAccountId;
    } else if (type === 'GOOGLE') {
      revokeReq$ = this.googleService.revokeToken(user.googleAccessToken);
      delete user.googleAccessToken;
      delete user.googleAccountId;
    }
    this.userService.updateUser(user);
    await lastValueFrom(revokeReq$);
    return resp.redirect('/');
  }

  @Get('/lineLogin/callback')
  async lineLoginCallback(
    @Cookies('sysToken', IdentityPipe) user: User,
    @Query('code') code: string,
    @Res() resp: Response,
  ) {
    return this.handleAccountLogin(
      user,
      this.lineLoginService,
      code,
      resp,
      'LINE',
    );
  }

  @Get('/googleLogin/callback')
  async googleLoginCallback(
    @Cookies('sysToken', IdentityPipe) user: User,
    @Query('code') code: string,
    @Res() resp: Response,
  ) {
    return this.handleAccountLogin(
      user,
      this.googleService,
      code,
      resp,
      'GOOGLE',
    );
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
    @Cookies('sysToken', IdentityPipe) user: User,
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
              this.userService.addUserSubscription(user.uuid, accessToken),
            ),
          ),
      );
      return resp.redirect('/');
    } catch (err) {
      console.log(err);
    }
    return resp.status(500).send({ error: 'Oops, something went wrong.' });
  }

  @Get('/unconnectLineNotify')
  async unConnectLineNotify(
    @Cookies('sysToken', IdentityPipe) user: User,
    @Res() resp: Response,
  ) {
    if (!user) {
      return resp.redirect('/');
    }
    const notifyAccessToken = this.userService.getUserSubscribeStatus(
      user.uuid,
    );
    if (user && notifyAccessToken) {
      try {
        await lastValueFrom(
          this.lineNoifyService
            .revokeToken(notifyAccessToken)
            .pipe(tap((_) => this.userService.removeUserSubscribe(user.uuid))),
        );
      } catch (err) {
        console.log(err);
      }
    }
    return resp.redirect('/');
  }

  protected async handleAccountLogin(
    loginUser: User,
    oauthService: BaseOauthService,
    code: string,
    resp: Response,
    loginSrc: string,
  ) {
    let idKey = '';
    let tokenKey = '';
    if (loginSrc === 'LINE') {
      idKey = 'lineAccountId';
      tokenKey = 'lineAccessToken';
    } else if (loginSrc === 'GOOGLE') {
      idKey = 'googleAccountId';
      tokenKey = 'googleAccessToken';
    }
    try {
      await lastValueFrom(
        oauthService.getAccessToken(code).pipe(
          switchMap((token) => oauthService.getProfile(token)),
          tap((profile: User) => {
            if (loginUser) {
              // Binding account
              this.handleBinding(loginUser, profile, idKey, tokenKey);
            } else {
              // new login
              profile.registerSource = loginSrc;
              this.handleNewLogin(profile, resp, idKey);
            }
          }),
        ),
      );
      return resp.redirect('/');
    } catch (err) {
      console.log(err);
    }

    return resp.status(500).send({ error: 'Oops, something went wrong.' });
  }

  private handleNewLogin(profile, resp: Response, idKey: string) {
    let user = this.userService.getUserBySocialId(profile[idKey]);
    // new account
    if (!user) {
      user = this.userService.createNewUser(profile);
    }
    const sysToken = this.userService.addUserMapping(user);
    this.addCookie(resp, 'sysToken', sysToken);
  }

  private handleBinding(loginUser: User, profile, idKey, tokenKey) {
    // Merge two different account
    const originUser = this.userService.getUserBySocialId(profile[idKey]);
    loginUser[idKey] = profile[idKey];
    loginUser[tokenKey] = profile[tokenKey];

    // remove old account
    if (originUser) {
      this.userService.removeUser(originUser.uuid);
    }
    this.userService.updateUser(loginUser);
  }
}
