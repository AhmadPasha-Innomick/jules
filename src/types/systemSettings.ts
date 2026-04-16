export interface SystemSettingsResponse {
  id: number;
  sysdate_format: string;
  systime_format: string;
  currency: string;
  currency_symbol: string;
  admin_export_only: number;
  no_try_before_lock: number;
  lock_timeout: number;
  pre_validation_timer_ms: number;
  is_active: number;
  created_by: string;
  created_date_time: string;
}


export interface UpdateSystemSettingsPayload {
  sysdate_format: string;
  systime_format: string;
  currency: string;
  currency_symbol: string;
  admin_export_only: number;
  no_try_before_lock: number;
  lock_timeout: number;
  pre_validation_timer_ms: number;
  is_active: number;
}

