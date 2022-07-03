export interface User {
  uuid: string;
  name: string;
  email: string;
  googleAccountId: string;
  lineAccountId: string;
  googleAccessToken: string;
  lineAccessToken: string;
  registerSource: string; // account create from line or google
}
