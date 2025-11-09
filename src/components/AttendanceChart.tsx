'use client';

import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Badge } from './ui/badge';
import { supabase } from '../lib/supabase';

interface AttendanceData {
  date: string;
  attendance: number;
  fullDate: string;
}

export default function AttendanceChart() {
  const [data, setData] = useState<AttendanceData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        // Fetch attendance records with member info
        const { data: records, error } = await supabase
          .from('attendance_records')
          .select(`
            service_date,
            members!inner(full_name)
          `)
          .order('service_date', { ascending: true });

        if (error) {
          console.error('Error fetching attendance data:', error);
          return;
        }

        // Group by date and count attendance
        const attendanceByDate = records.reduce((acc: Record<string, number>, record: { service_date: string }) => {
          const date = record.service_date;
          if (!acc[date]) {
            acc[date] = 0;
          }
          acc[date]++;
          return acc;
        }, {});

        // Convert to array format for chart
        const chartData: AttendanceData[] = Object.entries(attendanceByDate)
          .map(([date, count]) => ({
            date: new Date(date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric'
            }),
            attendance: count as number,
            fullDate: date
          }))
          .sort((a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime())
          .slice(-12); // Show last 12 data points

        console.log('Chart data:', chartData); // Debug log
        setData(chartData);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceData();
  }, []);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white p-6 rounded-lg shadow-md"
      >
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white p-6 rounded-lg shadow-md"
    >
      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-lg font-semibold text-gray-900 mb-4"
      >
        Attendance Trends
      </motion.h3>

      {data.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="h-64 flex items-center justify-center text-gray-500"
        >
          No attendance data available yet
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="h-64 w-full"
        >
          <ResponsiveContainer width="100%" height="100%" minWidth={300} minHeight={200}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
              />
              <YAxis
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                labelStyle={{ color: '#374151', fontWeight: '600' }}
              />
              <Line
                type="monotone"
                dataKey="attendance"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2, fill: '#ffffff' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-4 space-y-2"
      >
        <div className="text-sm text-gray-600">
          Showing attendance trends over the last {data.length} services
        </div>

        {data.length > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing attendance trends over the last {data.length} services
            </div>
            {(() => {
              const first: number = data[0] ? data[0].attendance : 0;
              const last: number = data[data.length - 1] ? data[data.length - 1].attendance : 0;
              const change = last - first;
              const percentChange = first > 0 ? ((change / first) * 100).toFixed(1) : '0';

              return (
                change > 0 ? (
                  <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +{change} (+{percentChange}%)
                  </Badge>
                ) : change < 0 ? (
                  <Badge variant="secondary" className="bg-red-50 text-red-700 border-red-200">
                    <TrendingDown className="w-3 h-3 mr-1" />
                    {change} ({percentChange}%)
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                    <Minus className="w-3 h-3 mr-1" />
                    Stable
                  </Badge>
                )
              );
            })()}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
