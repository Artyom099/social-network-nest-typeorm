import * as process from 'process';
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

export type EnvironmentVariable = { [key: string]: string | undefined };

export type EnvironmentsTypes =
  | 'DEVELOPMENT'
  | 'STAGING'
  | 'PRODUCTION'
  | 'TEST';

export class EnvironmentSettings {
  constructor(private env: EnvironmentsTypes) {}

  getEnv() {
    return this.env;
  }

  isProduction() {
    return this.env === 'PRODUCTION';
  }

  isStaging() {
    return this.env === 'STAGING';
  }

  isDevelopment() {
    return this.env === 'DEVELOPMENT';
  }

  isTest() {
    return this.env === 'TEST';
  }
}

export type SettingsType = {
  storage: StorageSettings;
  origin: OriginSettings;
  port: ConnectionData;
  email: EmailSettings;
  jwt: JwtSettings;
  // oauth: OauthSettings;
  backend: BackData;
  frontend: FrontData;
  i18n: I18nSettings;
};

export class OriginSettings {
  FRONTEND_URLS: string;

  constructor(envVariables: EnvironmentVariable) {
    this.FRONTEND_URLS = envVariables.FRONTEND_URLS!;
  }
}

export class StorageSettings {
  BASE_URL: string;
  STORAGE_TOKEN: string;

  constructor(envVariables: EnvironmentVariable) {
    this.BASE_URL = envVariables.STORAGE_BASE_URL!;
    this.STORAGE_TOKEN = envVariables.STORAGE_TOKEN!;
  }
}

export class ConnectionData {
  PORT: string;

  constructor(envVariables: EnvironmentVariable) {
    this.PORT = envVariables.PORT!;
  }
}

export class EmailSettings {
  EMAIL_HOST: string;
  EMAIL_USER: string;
  EMAIL_PASSWORD: string;

  constructor(envVariables: EnvironmentVariable) {
    this.EMAIL_HOST = envVariables.EMAIL_HOST!;
    this.EMAIL_USER = envVariables.EMAIL_USER!;
    this.EMAIL_PASSWORD = envVariables.EMAIL_PASSWORD!;
  }
}

export class JwtSettings {
  SECRET: string;
  PASSPHRASE: string;
  PUBLIC_KEY: string;
  PRIVATE_KEY: string;
  ACCESS_TOKEN_LIFETIME_SECONDS: number;
  REFRESH_TOKEN_LIFETIME_SECONDS: number;
  ENCRYPTION_TYPE: string;

  constructor(envVariables: EnvironmentVariable) {
    this.SECRET = envVariables.SECRET!;
    this.PASSPHRASE = envVariables.PASSPHRASE!;
    this.PUBLIC_KEY = decodeURIComponent(envVariables.PUBLIC_KEY!);
    this.PRIVATE_KEY = decodeURIComponent(envVariables.PRIVATE_KEY!);
    this.ACCESS_TOKEN_LIFETIME_SECONDS = Number(
      envVariables.ACCESS_TOKEN_LIFETIME_SECONDS!,
    );
    this.REFRESH_TOKEN_LIFETIME_SECONDS = Number(
      envVariables.REFRESH_TOKEN_LIFETIME_SECONDS!,
    );
    this.ENCRYPTION_TYPE = envVariables.ENCRYPTION_TYPE!;
  }
}

export class BackData {
  PORT: string;
  CURRENT_DOMAIN_URL: string;

  constructor(envVariables: EnvironmentVariable) {
    this.PORT = envVariables.PORT!;
    this.CURRENT_DOMAIN_URL = envVariables
      .CURRENT_DOMAIN_URL!.split('.')
      .splice(1, 4)
      .join('.');
  }
}

export class FrontData {
  FRONTEND_PASSWORD_RESET_URL: string;
  FRONTEND_EMAIL_CONFIRMATION_URL: string;

  constructor(envVariables: EnvironmentVariable) {
    this.FRONTEND_PASSWORD_RESET_URL =
      envVariables.FRONTEND_PASSWORD_RESET_URL!;
    this.FRONTEND_EMAIL_CONFIRMATION_URL =
      envVariables.FRONTEND_EMAIL_CONFIRMATION_URL!;
  }
}

export class I18nSettings {
  FALLBACK_LANGUAGE: string;
  I18N_PATH: string;

  constructor(envVariables: EnvironmentVariable) {
    this.FALLBACK_LANGUAGE = envVariables.FALLBACK_LANGUAGE!;
    this.I18N_PATH = envVariables.I18N_PATH!;
  }
}

export class AppConfig {
  constructor(
    public readonly env: EnvironmentSettings,
    public readonly settings: SettingsType,
  ) {
    console.log(env);
    console.log(settings);
  }
}

const envSettings = new EnvironmentSettings(
  (process.env.ENV || 'DEVELOPMENT') as EnvironmentsTypes,
);

const originSettings = new OriginSettings(process.env);
const storageSettings = new StorageSettings(process.env);
const connectionData = new ConnectionData(process.env);

const emailSettings = new EmailSettings(process.env);
const jwtSettings = new JwtSettings(process.env);
const backData = new BackData(process.env);
const frontData = new FrontData(process.env);
const i18nSettings = new I18nSettings(process.env);
// const oauthSettings = new OauthSettings(process.env);

export const appConfig = new AppConfig(envSettings, {
  origin: originSettings,
  storage: storageSettings,
  port: connectionData,
  email: emailSettings,
  jwt: jwtSettings,
  backend: backData,
  frontend: frontData,
  i18n: i18nSettings,
});
