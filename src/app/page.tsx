'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Users, CheckCircle, BarChart3, TrendingUp, Shield, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import Navbar from '../components/Navbar';
import AttendanceChart from '../components/AttendanceChart';

export default function HomePage() {
  const features = [
    {
      icon: Users,
      title: 'Member Management',
      description: 'Easily manage your church members with comprehensive profiles and contact information.',
      href: '/admin',
      color: 'var(--brand-blue)',
    },
    {
      icon: CheckCircle,
      title: 'Attendance Tracking',
      description: 'Mark attendance for services and track participation with real-time updates.',
      href: '/attendance',
      color: 'var(--brand-red)',
    },
    {
      icon: BarChart3,
      title: 'Analytics & Reports',
      description: 'View detailed attendance reports and trends to understand your congregation better.',
      href: '/attendance/records',
      color: 'var(--brand-gold)',
    },
  ];

  const stats = [
    { label: 'Active Members', value: '150+', icon: Users },
    { label: 'Services Tracked', value: '25+', icon: CheckCircle },
    { label: 'Growth Rate', value: '+12%', icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center space-x-2 bg-(--brand-blue) text-white px-4 py-2 rounded-full text-sm font-medium mb-8"
            >
              <Shield className="w-4 h-4" />
              <span>ChapelCheck v1.0.0</span>
            </motion.div>

            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Church Attendance
              <span className="block text-(--brand-blue)">Made Simple</span>
            </h1>

            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Streamline your church management with our comprehensive attendance tracking system.
              Monitor growth, engage members, and focus on what matters most.
            </p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button asChild size="lg" className="bg-(--brand-blue) hover:bg-blue-700">
                <Link href="/admin">
                  <Users className="w-5 h-5 mr-2" />
                  Get Started
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/attendance">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Mark Attendance
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>

        {/* Background decoration */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-(--brand-blue)/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-(--brand-gold)/10 rounded-full blur-3xl"></div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-(--brand-blue)/10 rounded-full mb-4">
                  <stat.icon className="w-8 h-8 text-(--brand-blue)" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge variant="secondary" className="mb-4">
              <Zap className="w-4 h-4 mr-1" />
              Powerful Features
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Manage Attendance
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our comprehensive platform provides all the tools you need for effective church management.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow duration-300 border-0 shadow-md">
                  <CardHeader>
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                      style={{ backgroundColor: `${feature.color}20` }}
                    >
                      <feature.icon className="w-6 h-6" style={{ color: feature.color }} />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                    <CardDescription className="text-gray-600">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button asChild className="w-full" style={{ backgroundColor: feature.color }}>
                      <Link href={feature.href}>
                        Learn More
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>



      {/* Analytics Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge variant="outline" className="mb-4 border-(--brand-gold) text-(--brand-gold)">
              <BarChart3 className="w-4 h-4 mr-1" />
              Analytics Dashboard
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Attendance Trends & Insights
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Monitor your church&apos;s attendance patterns and track growth over time with real-time analytics.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-6xl mx-auto"
          >
            <Card className="border-0 shadow-xl bg-linear-to-br from-white to-gray-50">
              <CardContent className="p-8">
                <AttendanceChart />
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
