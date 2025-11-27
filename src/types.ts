export type Category = {
  id: string
  user_id?: string
  name: string
  created_at?: string
  weight?: number
}

export type Dish = {
  id: string
  user_id: string
  name: string
  calories: number
  weight: number
  category_id?: string
  created_at?: string
  image_url?: string
}
