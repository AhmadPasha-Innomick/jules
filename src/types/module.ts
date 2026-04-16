export interface ModuleRow {
  module_id: number;
  module_name: string;
  module_slug: string;
  module_category: string;
  module_order: number;
  module_desc: string;
  is_active: 0 | 1;
}

export interface UserProfile {
  birth_date: string | null;
  company_id: number | null;
  created_by: string | null;
  created_date_time: string | null;
  dealer_id: string | null;
  email: string | null;
  employer_ID: string | null;
  gender: "M" | "F" | string | null;
  idnumber: string | null;
  idtype_id: number | null;
  job_title: string | null;
  mm_id: string | null;
  mnp_charge: number | null;
  nationality_code: string | null;
  nationality_id: string | null;
  phone_number: string | null;
  pin: string | null;
  posid: string | null;
  reporting_to: string | null;
  send_notification_type: "SMS" | "EMAIL" | string | null;
  shop_id: string | null;
  sim_swap_charge: number | null;
  suspicious: number | boolean;
  terminalid: string | null;
  user_type: string | null;
}

export interface User {
  first_name: string;
  middle_name: string | null;
  last_name: string;
  full_name: string;

  is_admin: number | boolean;
  is_manager: number | boolean;
  profile_photo: string;
  modules: any[];
  profile: UserProfile;
}
