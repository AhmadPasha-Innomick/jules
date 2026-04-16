export interface SmartCardData {
  fullName: string;
  cprNumber: string;
  dateOfBirth: string;
  expiryDate: string;
  gender: string;
  nationality: string;
  photoUrl: string;
  FirstNameEnglish: string;
  LastNameEnglish: string;
  GovernorateNo: number;
  nationalityCode?: string;
}

export enum EkycStep {
  IDLE = "IDLE",
  READING_CARD = "READING_CARD",
  CARD_READ_SUCCESS = "CARD_READ_SUCCESS",
  SCANNING_FINGERPRINT = "SCANNING_FINGERPRINT",
  FINGERPRINT_VERIFIED = "FINGERPRINT_VERIFIED",
  SUBMITTING = "SUBMITTING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}

export enum SearchType {
  TRANSACTION_ID = "transaction_id",
  CPR_NUMBER = "cpr_number",
}

export interface Transaction {
  id: string;
  cprNumber?: string;
  customerName: string;
  serviceType: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "COMPLETED";
  date: string;
  amount: string;

  transactionId?: string;
  requestNo?: string;
  idNumber?: string;
  msisdn?: string;
  planName?: string;
  service?: string;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
  sender?: string;
  requestUserId?: string;
  occupation?: string;
}

export interface SmartCardData {
  cardNumber: string;
  fullName: string;
  cprNumber: string;
  dateOfBirth: string;
  expiryDate: string;
  gender: string;
  nationality: string;
  photoUrl: string;
  occupation: string;
}

export interface Banner {
  id: number;
  title: string;
  filename: string;
  extension: string;
  category: "home" | "product_catalog";
  order: number;
  created_by: string;
  created_date_time: string;
  updated_by: string;
  updated_date_time: string;
  image_base64: string;
}
export interface ApiResponse<T> {
  success: boolean;
  error_code: number;
  message: string;
  data: T;
}
