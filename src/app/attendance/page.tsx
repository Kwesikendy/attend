'use client'

import { useState, useMemo, useEffect, useRef, useTransition } from 'react'
import { supabase } from '@/lib/supabase'
import { markAttendance, toggleAttendance } from './actions'

interface Member {
  id: string
  full_name: string
}

interface Service {
  id: string
  name: string
  description: string | null
  service_date: string
}

interface AttendanceRecord {
  id: string
  member_id: string
  service_date: string
}

async function getMembers(): Promise<Member[]> {
  const { data, error } = await supabase
    .from('members')
    .select('id, full_name')
    .order('full_name')

  if (error) {
    throw new Error('Failed to fetch members: ' + error.message)
  }

  return data || []
}

async function getServices(): Promise<Service[]> {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .order('service_date', { ascending: false })

  if (error) {
    throw new Error('Failed to fetch services: ' + error.message)
  }

  return data || []
}

async function getServiceAttendance(serviceId: string): Promise<AttendanceRecord[]> {
  const { data, error } = await supabase
    .from('attendance_records')
    .select('*')
    .eq('service_id', serviceId)

  if (error) {
    throw new Error('Failed to fetch service attendance: ' + error.message)
  }

  return data || []
}

export default function AttendancePage() {
  const [members, setMembers] = useState<Member[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [serviceAttendance, setServiceAttendance] = useState<AttendanceRecord[]>([])
  const [selectedLetter, setSelectedLetter] = useState<string>('')
  const [selectedMemberId, setSelectedMemberId] = useState<string>('')
  const [selectedServiceId, setSelectedServiceId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [isPending, startTransition] = useTransition()
  const [successMessage, setSuccessMessage] = useState<string>('')
  const [errorMessage, setErrorMessage] = useState<string>('')
  const selectRef = useRef<HTMLSelectElement>(null)

  useEffect(() => {
    const fetchData = async () => {
      const [membersData, servicesData] = await Promise.all([
        getMembers(),
        getServices()
      ])
      setMembers(membersData)
      setServices(servicesData)
      setLoading(false)
    }
    fetchData()
  }, [])

  // Fetch attendance when service is selected
  useEffect(() => {
    const fetchAttendance = async () => {
      if (selectedServiceId) {
        const attendanceData = await getServiceAttendance(selectedServiceId)
        setServiceAttendance(attendanceData)
      } else {
        setServiceAttendance([])
      }
    }
    fetchAttendance()
  }, [selectedServiceId])

  const attendedMemberIds = new Set(serviceAttendance.map(record => record.member_id))

  const filteredMembers = useMemo(() => {
    if (!selectedLetter) return members
    return members.filter(member =>
      member.full_name.toLowerCase().startsWith(selectedLetter.toLowerCase())
    )
  }, [members, selectedLetter])

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Attendance - {new Date().toLocaleDateString()}</h1>

        {/* Mark Attendance Form */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Mark Attendance</h2>

          {/* Alphabet Filter */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by First Letter
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedLetter('')}
                className={`px-3 py-1 rounded-md text-sm font-medium ${
                  selectedLetter === ''
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                All
              </button>
              {alphabet.map(letter => (
                <button
                  key={letter}
                  onClick={() => setSelectedLetter(letter)}
                  className={`px-3 py-1 rounded-md text-sm font-medium ${
                    selectedLetter === letter
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {letter}
                </button>
              ))}
            </div>
          </div>

          {/* Filtered Members Display */}
          {selectedLetter && (
            <div className="mb-4">
              <h3 className="text-lg font-medium text-gray-800 mb-2">
                Members starting with &quot;{selectedLetter}&quot; ({filteredMembers.length})
              </h3>
              {filteredMembers.length === 0 ? (
                <p className="text-gray-500">No members found starting with &#34;{selectedLetter}&#34;</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {filteredMembers.map((member) => (
                    <div
                      key={member.id}
                      className="p-3 bg-gray-50 rounded-md border border-gray-200 hover:bg-gray-100 cursor-pointer transition-colors"
                      onClick={() => {
                        // Set the selected member in the form
                        const selectElement = selectRef.current
                        if (selectElement) {
                          selectElement.value = member.id
                        }
                      }}
                    >
                      <span className="text-sm font-medium text-gray-900">{member.full_name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
              {successMessage}
            </div>
          )}

          {errorMessage && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {errorMessage}
            </div>
          )}

          <form
            action={async (formData: FormData) => {
              startTransition(async () => {
                const result = await markAttendance(formData)
                if (result.error) {
                  setErrorMessage(result.error)
                  setSuccessMessage('')
                  // Clear error message after 5 seconds
                  setTimeout(() => setErrorMessage(''), 5000)
                } else {
                  const memberName = members.find(m => m.id === selectedMemberId)?.full_name || 'Member'
                  const serviceName = services.find(s => s.id === selectedServiceId)?.name || 'Service'
                  setSuccessMessage(`Attendance marked successfully for ${memberName} at ${serviceName}!`)
                  setErrorMessage('')
                  setSelectedMemberId('')
                  setSelectedServiceId('')
                  setSelectedLetter('')
                  // Refresh attendance data
                  const attendanceData = await getServiceAttendance(selectedServiceId)
                  setServiceAttendance(attendanceData)
                  // Clear success message after 3 seconds
                  setTimeout(() => setSuccessMessage(''), 3000)
                }
              })
            }}
            className="space-y-4"
            id="attendanceForm"
          >
            <input type="hidden" name="serviceId" value={selectedServiceId} />
            <input type="hidden" name="memberId" value={selectedMemberId} />

            <div>
              <label htmlFor="serviceId" className="block text-sm font-medium text-gray-700 mb-1">
                Select Service *
              </label>
              <select
                id="serviceId"
                name="serviceId"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                onChange={(e) => setSelectedServiceId(e.target.value)}
                value={selectedServiceId}
              >
                <option value="">
                  {services.length === 0
                    ? 'No services found'
                    : `Choose a service… (${services.length} available)`
                  }
                </option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name} - {new Date(service.service_date).toLocaleDateString()}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="memberId" className="block text-sm font-medium text-gray-700 mb-1">
                Select Member {selectedLetter && `(Filtered by &#34;{selectedLetter}&#34;)`}
              </label>
              {selectedLetter ? (
                // Show filtered members as clickable list when a letter is selected
                <div className="border border-gray-300 rounded-md p-3 max-h-60 overflow-y-auto">
                  {filteredMembers.length === 0 ? (
                    <p className="text-gray-500 text-sm">No members found starting with &#34;{selectedLetter}&#34;</p>
                  ) : (
                    <div className="space-y-2">
                      {filteredMembers.map((member) => (
                        <div
                          key={member.id}
                          className={`p-2 bg-gray-50 rounded border hover:bg-gray-100 cursor-pointer transition-colors ${
                            selectedMemberId === member.id ? 'bg-blue-100 border-blue-300' : ''
                          }`}
                          onClick={() => setSelectedMemberId(member.id)}
                        >
                          <span className="text-sm font-medium text-gray-900">{member.full_name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                // Show select dropdown when no letter is selected
                <select
                  ref={selectRef}
                  id="memberId"
                  name="memberId"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  onChange={(e) => setSelectedMemberId(e.target.value)}
                >
                  <option value="">
                    {members.length === 0
                      ? 'No members found'
                      : `Choose a member&hellip; (${members.length} available)`
                    }
                  </option>
                  {members.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.full_name}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <button
              type="submit"
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
              disabled={isPending || !selectedServiceId || selectedLetter ? filteredMembers.length === 0 || !selectedMemberId : members.length === 0 || !selectedMemberId}
            >
              {isPending ? 'Marking...' : 'Mark Attendance'}
            </button>
          </form>
        </div>

        {/* Current Service Attendance */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            {selectedServiceId
              ? `${services.find(s => s.id === selectedServiceId)?.name || 'Service'} Attendance (${serviceAttendance.length})`
              : 'Select a service to view attendance'
            }
          </h2>
          {!selectedServiceId ? (
            <p className="text-gray-500">Please select a service above to view its attendance records.</p>
          ) : serviceAttendance.length === 0 ? (
            <p className="text-gray-500">No attendance marked yet for this service.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Member Name
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {members.map((member) => (
                    <tr key={member.id}>
                      <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                        {member.full_name}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <button
                          onClick={() => {
                            startTransition(async () => {
                              const result = await toggleAttendance(member.id, selectedServiceId)
                              if (result.error) {
                                setErrorMessage(result.error)
                                setSuccessMessage('')
                                // Clear error message after 5 seconds
                                setTimeout(() => setErrorMessage(''), 5000)
                              } else {
                                const attendanceData = await getServiceAttendance(selectedServiceId)
                                setServiceAttendance(attendanceData)
                                setErrorMessage('')
                              }
                            })
                          }}
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full transition-colors ${
                            attendedMemberIds.has(member.id)
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                          }`}
                          disabled={isPending}
                        >
                          {attendedMemberIds.has(member.id) ? 'Present' : 'Absent'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
