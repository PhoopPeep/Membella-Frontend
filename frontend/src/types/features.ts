export interface Feature {
  feature_id: string
  name: string
  description: string
  owner_id: string
  create_at: string
  update_at: string
  delete_at?: string | null
}

export interface CreateFeatureData {
  name: string
  description: string
}

export interface UpdateFeatureData {
  name: string
  description: string
}
