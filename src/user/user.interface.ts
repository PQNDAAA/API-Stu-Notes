export interface User {
  id?: number;
  email: string;
  username: string;
  password: string;
  dateOfBirthday: string;
  apple_user_id?: string;
  google_user_id?: string;
  photo_url?: string;
  reset_password_token?: string;
  reset_password_expires?: string;
}
