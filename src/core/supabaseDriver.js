import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabaseBucket = import.meta.env.VITE_SUPABASE_BUCKET

if (!supabaseUrl || !supabaseAnonKey || !supabaseBucket) {
  throw new Error(
    'Variabel VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, dan VITE_SUPABASE_BUCKET harus ada di file .env',
  )
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

const supabaseDriver = {
  client: supabase,

  async upload(sectionName, file) {
    const fileExtension = file.name.split('.').pop()
    const uniqueFileName = `${Date.now()}_${crypto.randomUUID()}.${fileExtension}`
    const filePath = `${sectionName}/${uniqueFileName}`

    const { data, error } = await supabase.storage.from(supabaseBucket).upload(filePath, file)

    if (error) {
      console.error('Supabase upload error:', error.message)
      throw error
    }

    return data.path
  },

  getPublicUrl(filePath) {
    const { data } = supabase.storage.from(supabaseBucket).getPublicUrl(filePath)
    return data.publicUrl
  },
}

export default supabaseDriver
