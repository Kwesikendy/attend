'use server'

import { revalidatePath } from 'next/cache'
import { supabase } from '@/lib/supabase'

export async function markAttendance(formData: FormData) {
  const memberId = formData.get('memberId') as string
  const serviceId = formData.get('serviceId') as string

  if (!memberId || !serviceId) {
    return { error: 'Member and service are required' }
  }

  // Fetch the service date
  const { data: service, error: serviceError } = await supabase
    .from('services')
    .select('service_date')
    .eq('id', serviceId)
    .single()

  if (serviceError || !service) {
    return { error: 'Failed to fetch service details: ' + serviceError?.message }
  }

  // Check if attendance already exists for this member for this service
  const { data: existingRecord } = await supabase
    .from('attendance_records')
    .select('id')
    .eq('member_id', memberId)
    .eq('service_id', serviceId)
    .single()

  if (existingRecord) {
    return { error: 'Attendance already marked for this member for this service' }
  }

  const { error } = await supabase
    .from('attendance_records')
    .insert([{ member_id: memberId, service_id: serviceId, service_date: service.service_date }])

  if (error) {
    return { error: 'Failed to mark attendance: ' + error.message }
  }

  revalidatePath('/attendance')
  return { success: true }
}

export async function toggleAttendance(memberId: string, serviceId: string) {
  if (!memberId || !serviceId) {
    return { error: 'Member and service are required' }
  }

  // Fetch the service date
  const { data: service, error: serviceError } = await supabase
    .from('services')
    .select('service_date')
    .eq('id', serviceId)
    .single()

  if (serviceError || !service) {
    return { error: 'Failed to fetch service details: ' + serviceError?.message }
  }

  // Check if attendance already exists
  const { data: existingRecord } = await supabase
    .from('attendance_records')
    .select('id')
    .eq('member_id', memberId)
    .eq('service_id', serviceId)
    .single()

  if (existingRecord) {
    // Remove attendance (unmark)
    const { error } = await supabase
      .from('attendance_records')
      .delete()
      .eq('member_id', memberId)
      .eq('service_id', serviceId)

    if (error) {
      return { error: 'Failed to unmark attendance: ' + error.message }
    }
  } else {
    // Add attendance (mark)
    const { error } = await supabase
      .from('attendance_records')
      .insert([{ member_id: memberId, service_id: serviceId, service_date: service.service_date }])

    if (error) {
      return { error: 'Failed to mark attendance: ' + error.message }
    }
  }

  revalidatePath('/attendance')
  return { success: true }
}
