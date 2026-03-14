/**
 * Supabase Database Helpers
 * All CRUD operations go through here — Supabase-backed.
 * This replaces the Firebase mock (src/lib/firebase.ts).
 */
import { supabase } from './supabase';

// ─── SCHOOLS ────────────────────────────────────────────────────────────────

export async function getSchools() {
    const { data, error } = await supabase.from('schools').select('*').order('name');
    if (error) throw error;
    return data ?? [];
}

export async function addSchool(school: Record<string, any>) {
    const { id, ...rest } = school;
    const { data, error } = await supabase.from('schools').insert(rest).select().single();
    if (error) throw error;
    return data;
}

export async function updateSchool(id: string, updates: Record<string, any>) {
    const { data, error } = await supabase.from('schools').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
}

export async function deleteSchool(id: string) {
    const { error } = await supabase.from('schools').delete().eq('id', id);
    if (error) throw error;
}

// ─── COMPETITIONS ────────────────────────────────────────────────────────────

export async function getCompetitions() {
    const { data, error } = await supabase.from('competitions').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
}

export async function addCompetition(comp: Record<string, any>) {
    const { id, ...rest } = comp;
    const { data, error } = await supabase.from('competitions').insert(rest).select().single();
    if (error) throw error;
    return data;
}

export async function updateCompetition(id: string, updates: Record<string, any>) {
    const { data, error } = await supabase.from('competitions').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
}

export async function deleteCompetition(id: string) {
    const { error } = await supabase.from('competitions').delete().eq('id', id);
    if (error) throw error;
}

// ─── QUESTIONS ───────────────────────────────────────────────────────────────

export async function getQuestions() {
    const { data, error } = await supabase.from('questions').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
}

export async function addQuestion(q: Record<string, any>) {
    const { id, ...rest } = q;
    const { data, error } = await supabase.from('questions').insert(rest).select().single();
    if (error) throw error;
    return data;
}

export async function updateQuestion(id: string, updates: Record<string, any>) {
    const { data, error } = await supabase.from('questions').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
}

export async function deleteQuestion(id: string) {
    const { error } = await supabase.from('questions').delete().eq('id', id);
    if (error) throw error;
}

// ─── QUESTION SETS ────────────────────────────────────────────────────────────

export async function getQuestionSets() {
    const { data, error } = await supabase.from('question_sets').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
}

export async function addQuestionSet(qs: Record<string, any>) {
    const { id, ...rest } = qs;
    const { data, error } = await supabase.from('question_sets').insert(rest).select().single();
    if (error) throw error;
    return data;
}

export async function updateQuestionSet(id: string, updates: Record<string, any>) {
    const { data, error } = await supabase.from('question_sets').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
}

export async function deleteQuestionSet(id: string) {
    const { error } = await supabase.from('question_sets').delete().eq('id', id);
    if (error) throw error;
}

// ─── USERS / PROFILES ────────────────────────────────────────────────────────

export async function getUsers() {
    const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
}

export async function updateUser(id: string, updates: Record<string, any>) {
    const { data, error } = await supabase.from('profiles').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
}

export async function deleteUser(id: string) {
    const { error } = await supabase.from('profiles').delete().eq('id', id);
    if (error) throw error;
}

// ─── APPROVALS ────────────────────────────────────────────────────────────────

export async function getPendingApprovals() {
    const { data, error } = await supabase
        .from('approvals')
        .select('*, profiles!approvals_requested_by_fkey(display_name, email)')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
}

export async function submitApproval(payload: {
    type: string;
    table_name: string;
    record_id?: string;
    data: Record<string, any>;
    requested_by: string;
    summary: string;
}) {
    const { data, error } = await supabase.from('approvals').insert({
        ...payload,
        status: 'pending',
    }).select().single();
    if (error) throw error;
    return data;
}

export async function approveAction(approvalId: string) {
    // Get the approval record
    const { data: approval, error: fetchErr } = await supabase
        .from('approvals')
        .select('*')
        .eq('id', approvalId)
        .single();

    if (fetchErr || !approval) throw fetchErr ?? new Error('Approval not found');

    // Apply the action to the correct table
    let applyError = null;
    if (approval.type === 'create') {
        const { error } = await supabase.from(approval.table_name).insert(approval.data);
        applyError = error;
    } else if (approval.type === 'update' && approval.record_id) {
        const { error } = await supabase.from(approval.table_name).update(approval.data).eq('id', approval.record_id);
        applyError = error;
    } else if (approval.type === 'delete' && approval.record_id) {
        const { error } = await supabase.from(approval.table_name).delete().eq('id', approval.record_id);
        applyError = error;
    }

    if (applyError) throw applyError;

    // Mark as approved
    const { error } = await supabase.from('approvals').update({ status: 'approved' }).eq('id', approvalId);
    if (error) throw error;
}

export async function rejectAction(approvalId: string) {
    const { error } = await supabase.from('approvals').update({ status: 'rejected' }).eq('id', approvalId);
    if (error) throw error;
}

// ─── MESSAGES ────────────────────────────────────────────────────────────────

export async function getMessages() {
    const { data, error } = await supabase
        .from('messages')
        .select('*, profiles!messages_sender_id_fkey(display_name, email)')
        .order('created_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
}

export async function sendMessage(msg: { subject: string; body: string; sender_id: string; recipient_role?: string; recipient_id?: string }) {
    const { data, error } = await supabase.from('messages').insert(msg).select().single();
    if (error) throw error;
    return data;
}

export async function deleteMessage(id: string) {
    const { error } = await supabase.from('messages').delete().eq('id', id);
    if (error) throw error;
}

// ─── AVATARS ─────────────────────────────────────────────────────────────────

export async function getAvatars() {
    const { data, error } = await supabase.from('avatars').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
}

export async function addAvatar(avatar: Record<string, any>) {
    const { id, ...rest } = avatar;
    const { data, error } = await supabase.from('avatars').insert(rest).select().single();
    if (error) throw error;
    return data;
}

export async function deleteAvatar(id: string) {
    const { error } = await supabase.from('avatars').delete().eq('id', id);
    if (error) throw error;
}
