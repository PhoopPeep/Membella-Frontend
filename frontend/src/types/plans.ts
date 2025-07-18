export interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  features: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreatePlanData {
  name: string;
  description: string;
  price: number;
  duration: number;
  features: string[];
}
