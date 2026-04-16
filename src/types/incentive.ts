export type IncentiveBoosterProps = {
  mnp?: number | string | null;
  mid_end_plan?: number | string | null;
  high_end_plan?: number | string | null;
  fiber?: number | string | null;
  postpaid_upgrade?: number | string | null;
  prepaid?: number | string | null;
  device_sale?: number | string | null;
  home_5g?: number | string | null;
  mbb_booster?: number | string | null;
  voice_booster?: number | string | null;
};

export type IncentiveSlab = {
  slabid?: number | null;
  slabno?: string | number | null;
  slab_start?: number | string | null;
  slab_end?: number | string | null;
  payout?: number | string | null;
  minperline?: number | string | null;
  payoutadd?: number | string | null;
};

export type IncentiveSubscriber = {
  id?: number | null;
  user_name: string;
  ind_target?: number | string | null;
  ind_payout?: number | string | null;
};

export type IncentiveScheme = {
  scheme_code: string;
  scheme_name?: string | null;
  scheme_type?: string | null;
  scheme_method?: string | null;
  service_type?: string | null;
  slab_method?: string | null;
  subservice_type?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  status?: string | null;
  booster?: string | null;
  payout?: string | null;
};

export type IncentiveSchemeListItem = IncentiveScheme & {
  created_by?: string | null;
  created_date_time?: string | null;
  updated_by?: string | null;
  updated_date_time?: string | null;
  can_edit?: boolean;
  edit_limited_to_dates?: boolean;
};

export type IncentiveSchemeDetail = {
  scheme: IncentiveScheme;
  booster_properties: IncentiveBoosterProps;
  slabs: IncentiveSlab[];
  subscribers: IncentiveSubscriber[];
  can_edit?: boolean;
  edit_limited_to_dates?: boolean;
  edit_rule_message?: string;
  source_scheme_code?: string;
};

export type IncentiveSchemePayload = IncentiveScheme & {
  booster_properties?: IncentiveBoosterProps;
  slabs?: IncentiveSlab[];
  subscribers?: IncentiveSubscriber[];
};

export type IncentivePlanTier = {
  id?: number;
  plan_product_part_code: string;
  plan_tier?: string | null;
  plan_family?: string | null;
  Type?: string | null;
  active?: number;
  created_by?: string | null;
  created_on?: string | null;
  updated_by?: string | null;
  updated_on?: string | null;
};

export type IncentiveAuditLog = {
  id?: number | null;
  scheme_code?: string | null;
  action?: string | null;
  user_id?: string | null;
  timestamp?: string | null;
  created_by?: string | null;
  created_date_time?: string | null;
  changed_fields_preview?: string | null;
  before_data?: Record<string, any>;
  after_data?: Record<string, any>;
};

export type IncentivePlanTierAuditLog = {
  id?: number | null;
  tier_id?: number | null;
  tier_code?: string | null;
  action?: string | null;
  user_id?: string | null;
  timestamp?: string | null;
  created_by?: string | null;
  created_date_time?: string | null;
  changed_fields_preview?: string | null;
  before_data?: Record<string, any>;
  after_data?: Record<string, any>;
};
