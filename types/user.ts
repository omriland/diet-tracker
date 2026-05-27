export interface UserProfile {
  email: string;
  dailyCalorieTarget: number;
  createdAt: Date;
}

export const DEFAULT_CALORIE_TARGET = 2000;
