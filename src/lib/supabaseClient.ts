"use client";

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cnyrisvaalcbrhmhnobg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNueXJpc3ZhYWxjYnJpbWhub2JnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwNDU1MDcsImV4cCI6MjA4NDYyMTUwN30.LbZJDdHJiwjLTS1zjFy30zUXgprX7I8kbk4s83xbtTs';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Placeholder for the Support User ID. IMPORTANT: Replace this with the actual UUID of your Supabase support user.
// You need to create a user in Supabase Auth (e.g., support@connecthub.com) and get its UUID.
export const SUPPORT_USER_ID = '00000000-0000-0000-0000-000000000000'; // Replace with actual UUID