"use client";

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cnyrisvaalcbrhmhnobg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNueXJpc3ZhYWxjYnJobWhub2JnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwNDU1MDcsImV4cCI6MjA4NDYyMTUwN30.LbZJDdHJiwjLTS1zjFy30zUXgprX7I8kbk4s83xbtTs';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);