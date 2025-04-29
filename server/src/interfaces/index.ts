export interface IBankCode {
  success: boolean;
  code: number;
  rows: {
    bankcode: string;
    name: string;
    statement_time?: [];
    tl?: number;
  }[];
}
export interface IBankCodePlaySonClub {
  List: {
    code: string;
    name: string;
  }[];
  Message?: string;
}
export interface ICaptchaResponse {
  auth: any;
  c: {
    b64: string;
    token: string;
    message: string;
  };
}
export interface IBankCodePlayB52 {
  success: boolean;
  code: number;
  rows: {
    bankcode: string;
    name: string;
    statement_time?: [];
    tl?: number;
    nicepay_code?: string;
    navigate_bank_code_cp?: string;
    min?: number;
    max?: number;
  }[];
}
export interface IBankCodePlayIwin {
  success: boolean;
  code: number;
  rows: {
    bankcode: string;
    name: string;
    statement_time?: [];
    tl?: number;
  }[];
}
export interface IBankCodeIRikvip {
  success: boolean;
  code: number;
  rows: {
    bankcode: string;
    name: string;
    statement_time?: [];
    tl?: number;
  }[];
}
export interface ISignUpResponse {
  token: string;
  username: string;
  password: string;
}
export interface IDepositResponse {
  account_no: string;
  account_holder: string;
  bank_name: string;
  bank_code?: string;
  code: string;
}
export interface IMomoResponsePlayIwin {
  success: boolean;
  code: number;
  rows: {
    code_bank: string;
    account_name: string;
    account_no: string;
    qrcode?: string;
  }[];
}
export interface IMomoResponsePlayB52 {
  success: boolean;
  code: number;
  rows: {
    code_bank: string;
    account_name: string;
    account_no: string;
    qrcode?: string;
  }[];
}
export interface IMomoResponseIRikvip {
  success: boolean;
  code: number;
  rows: {
    code_bank: string;
    account_name: string;
    account_no: string;
    qrcode?: string;
    qr_text?: string;
  }[];
}

export interface IAccountLogin {
  username: string;
  password: string;
  site_id: string;
  token: string;
  status?: boolean;
}
