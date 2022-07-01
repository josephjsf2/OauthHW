import { Injectable } from '@nestjs/common';
import uuid = require('uuid');
import { LineLoginProfile } from './oauth/models/line-login-profile';

/**
 * Fake DB
 */
@Injectable()
export class UserService {
  // sysToken -> lineLoginProfile
  loginUserMap = new Map<string, LineLoginProfile>();

  // lineLoginProfile.userId -> lineNotify.accessToken
  subscribeMap = new Map<string, string>();

  /**
   * Get lineLoginProfile by sysToken
   * @param sysToken
   * @returns
   */
  getUserBySysToken(sysToken: string) {
    return this.loginUserMap.get(sysToken);
  }

  /**
   * Get lineNotify accessToken by line userId
   * @param lineUserId
   * @returns
   */
  getUserSubscribeStatus(lineUserId: string) {
    return this.subscribeMap.get(lineUserId);
  }

  /**
   * Add line user to subscribe map
   * @param userId
   * @param accessToken
   * @returns
   */
  addUserSubscription(userId: string, accessToken: string) {
    return this.subscribeMap.set(userId, accessToken);
  }

  /**
   * Remove line user from subscribe map
   * @param lineUserId
   * @returns
   */
  removeUserSubscribe(lineUserId: string) {
    return this.subscribeMap.delete(lineUserId);
  }

  /**
   * Create new sysToken, and connecting to lineLoginProfile
   */
  addUserMapping(data: LineLoginProfile): string {
    const sysToken = uuid.v4() as string;
    this.loginUserMap.set(sysToken, data);
    return sysToken;
  }

  /**
   * Remove sysToken from map
   * @param sysToken
   * @returns
   */
  removeUserMapping(sysToken: string) {
    return this.loginUserMap.delete(sysToken);
  }

  getAllNotifyAccessToken() {
    return Array.from(this.subscribeMap.values());
  }
}
