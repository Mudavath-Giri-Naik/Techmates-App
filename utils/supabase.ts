import 'react-native-url-polyfill/auto'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://uokeycybgnulyhhcibcj.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVva2V5Y3liZ251bHloaGNpYmNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyNjc3MTMsImV4cCI6MjA2Mjg0MzcxM30.ks7qEIAp2lll4rBXRkw7SqrwCpJZRo3Mq8Gwpq6lIEY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
}) 