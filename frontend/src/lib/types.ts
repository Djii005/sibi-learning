export interface User {
  id: number;
  email: string;
  display_name: string;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface Sign {
  id: number;
  label: string;
  description: string;
  instructions: string;
  image_alt: string;
  image_url: string;
  order_index: number;
}

export interface Lesson {
  id: number;
  slug: string;
  title: string;
  description: string;
  category: string;
  order_index: number;
  is_dynamic: boolean;
}

export interface LessonDetail extends Lesson {
  signs: Sign[];
}

export interface ProgressItem {
  sign_id: number;
  best_score: number;
  attempts: number;
  correct: number;
  updated_at: string;
}

export interface ProgressSummary {
  total_signs: number;
  mastered_signs: number;
  attempts: number;
  average_score: number;
  items: ProgressItem[];
}
