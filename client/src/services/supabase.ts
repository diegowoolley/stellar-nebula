import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://komlitibejtmckgptuxn.supabase.co';
const supabaseKey = 'sb_secret_79yq5Ll-YWtGmS5ZcP8tXw_AbpuKl9Q';

export const supabase = createClient(supabaseUrl, supabaseKey);
