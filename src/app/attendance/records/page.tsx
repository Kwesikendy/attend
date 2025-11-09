import { supabase } from '@/lib/supabase'

interface AttendanceRecord {
  id: string
  service_date: string
  services: {
    name: string
  }[]
  members: {
    full_name: string
  }[]
}

async function getAttendanceRecords(): Promise<AttendanceRecord[]> {
  const { data, error } = await supabase
    .from('attendance_records')
    .select(`
      id,
      service_date,
      services (
        name
      ),
      members (
        full_name
      )
    `)
    .order('service_date', { ascending: false })

  if (error) {
    throw new Error('Failed to fetch attendance records: ' + error.message)
  }

  return data || []
}

export default async function RecordsPage() {
  const records = await getAttendanceRecords()

  // Group records by service
  const recordsByService = records.reduce((acc, record) => {
    const serviceName = record.services?.[0]?.name || 'Unknown Service'
    if (!acc[serviceName]) {
      acc[serviceName] = []
    }
    acc[serviceName].push(record)
    return acc
  }, {} as Record<string, AttendanceRecord[]>)

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Attendance Records</h1>

        {Object.keys(recordsByService).length === 0 ? (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <p className="text-gray-500">No attendance records found.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(recordsByService)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([serviceName, serviceRecords]) => (
                <div key={serviceName} className="bg-white p-6 rounded-lg shadow-md">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    {serviceName}
                  </h2>
                  <div className="overflow-x-auto">
                    <table className="min-w-full table-auto">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Member Name
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {serviceRecords.map((record) => (
                          <tr key={record.id}>
                            <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                              {record.members?.[0]?.full_name || 'Unknown Member'}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                              {new Date(record.service_date).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-4 text-sm text-gray-600">
                    Total attendees: {serviceRecords.length}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  )
}
