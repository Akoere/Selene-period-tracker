import { supabase } from './supabase';

// --- PROFILE FUNCTIONS ---

export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  // PGRST116 = JSON object requested, multiple (or no) rows returned
  if (error && error.code === 'PGRST116') {
    return { data: null, error: null };
  }
  
  return { data, error };
}

export async function updateProfile(userId, updates) {
  const { data, error } = await supabase
    .from('profiles')
    .upsert({ id: userId, ...updates })
    .select();
  
  return { data, error };
}

// --- LOGGING FUNCTIONS ---

export async function saveDailyLog(userId, date, logData) {
  // logData should be object: { flow_level, mood, symptoms, etc. }
  const { data, error } = await supabase
    .from('daily_logs')
    .upsert({ 
      user_id: userId, 
      date: date, 
      ...logData 
    }, { onConflict: 'user_id, date' })
    .select();

  return { data, error };
}

export async function getLogsForMonth(userId, year, month) {
  // Calculate start and end date of the month
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const endDate = `${year}-${String(month).padStart(2, '0')}-31`;

  const { data, error } = await supabase
    .from('daily_logs')
    .select('*')
    .eq('user_id', userId)
    .gte('date', startDate)
    .lte('date', endDate);

  return { data, error };
}

export async function getRecentLogs(userId, limit = 90) {
  // Fetch logs for the last 90 days
  const { data, error } = await supabase
    .from('daily_logs')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: true })
    .limit(limit);

  return { data, error };
}

export async function getAllLogs(userId) {
  const { data, error } = await supabase
    .from('daily_logs')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: true }); // Oldest to newest

  return { data, error };
}

export async function deleteDailyLog(userId, date) {
  const { error } = await supabase
    .from('daily_logs')
    .delete()
    .eq('user_id', userId)
    .eq('date', date);

  return { error };
}

export async function clearAllLogs(userId) {
  const { error } = await supabase
    .from('daily_logs')
    .delete()
    .eq('user_id', userId);

  return { error };
}

// --- STORAGE FUNCTIONS ---

export async function uploadAvatar(file) {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(filePath, file);

    if (error) {
      throw error;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    return { publicUrl, error: null };
  } catch (error) {
    return { publicUrl: null, error };
  }
}

// --- SUPPORT FUNCTIONS ---

export async function createSupportTicket(ticketData) {
  // ticketData: { name, email, message, user_id (optional) }
  const { data, error } = await supabase
    .from('support_tickets')
    .insert([
      { 
        ...ticketData,
        status: 'open',
        created_at: new Date().toISOString()
      }
    ])
    .select();

  return { data, error };
}