
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hibehrijqpbqfdakitup.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpYmVocmlqcXBicWZkYWtpdHVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2NTk3MDUsImV4cCI6MjA2NTIzNTcwNX0._UvbsYUikFq7vZy_odTC55U1FL_caf7-UkpVUIClLzg'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
