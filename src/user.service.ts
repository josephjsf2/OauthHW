import { User } from './user';
import { Injectable } from '@nestjs/common';
import uuid = require('uuid');

/**
 * Fake DB
 */
@Injectable()
export class UserService {
  // uuid -> users
  registeredUsers = new Map<string, User>();

  // sysToken -> user
  loginUserMap = new Map<string, User>();
  // adminToken -> user
  loginAdminMap = new Map<string, User>();

  // uuid -> lineNotify.accessToken
  subscribeMap = new Map<string, string>();

  // Create new user
  createNewUser(data: User) {
    const user: User = {
      ...data,
      uuid: uuid.v4() as string,
    };
    this.registeredUsers.set(user.uuid, user);
    return user;
  }

  updateUser(user: User) {
    this.registeredUsers.set(user.uuid, user);
  }

  removeUser(uuid: string) {
    this.registeredUsers.delete(uuid);
  }

  getUserBySocialId(socialId: string) {
    return Array.from(this.registeredUsers.values()).find(
      (u) => u.lineAccountId === socialId || u.googleAccountId === socialId,
    );
  }

  /**
   * Get lineLoginProfile by sysToken
   * @param sysToken
   * @returns
   */
  getUserBySysToken(sysToken: string) {
    return this.loginUserMap.get(sysToken);
  }

  /**
   * Get lineLoginProfile by sysToken
   * @param sysToken
   * @returns
   */
  getUserByAdminToken(adminToken: string) {
    return this.loginAdminMap.get(adminToken);
  }

  /**
   * Get lineNotify accessToken by uuid
   * @param lineUserId
   * @returns
   */
  getUserSubscribeStatus(uuid: string) {
    return this.subscribeMap.get(uuid);
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
   * Create new sysToken, and connecting to User
   */
  addUserMapping(data: User): string {
    const sysToken = uuid.v4() as string;
    this.loginUserMap.set(sysToken, data);
    return sysToken;
  }

  /**
   * Create new adminToken, and connecting to User
   */
  addAdminMapping(data: User): string {
    const sysToken = uuid.v4() as string;
    this.loginAdminMap.set(sysToken, data);
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

  /**
   * Remove sysToken from admin map
   * @param sysToken
   * @returns
   */
  removeAdminMapping(sysToken: string) {
    return this.loginAdminMap.delete(sysToken);
  }

  getAllNotifyAccessToken() {
    return Array.from(this.subscribeMap.values());
  }
}
