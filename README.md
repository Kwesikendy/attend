# ChapelCheck v1.0.0 - Church Attendance Management System

## Overview

This is a comprehensive web-based church attendance management system built with Next.js 14, TypeScript, Tailwind CSS, and Supabase. The system allows churches to manage their members, schedule services, track attendance in real-time, and maintain historical attendance records. The application is designed to be user-friendly, responsive, and accessible to all users without requiring authentication.

## System Architecture

### Technology Stack
- **Frontend Framework**: Next.js 14 with App Router
- **Programming Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: Supabase (PostgreSQL)
- **Authentication**: None required (open access system)
- **Deployment**: Ready for Vercel or any Node.js hosting platform

### Application Structure
```
church-attendance/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout component
│   │   ├── page.tsx            # Home page with navigation
│   │   ├── globals.css         # Global styles
│   │   ├── admin/
│   │   │   └── page.tsx        # Member and service management
│   │   └── attendance/
│   │       ├── page.tsx        # Real-time attendance marking
│   │       ├── actions.ts      # Server actions for attendance
│   │       └── records/
│   │           └── page.tsx    # Historical attendance records
│   └── lib/
│       └── supabase.ts         # Supabase client configuration
├── middleware.js               # Next.js middleware (no auth)
├── package.json                # Dependencies and scripts
└── schema.sql                 # Database schema
```

## Database Schema

The system uses three main tables in Supabase PostgreSQL:

### 1. Members Table
```sql
CREATE TABLE members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  full_name TEXT NOT NULL,
  phone_number TEXT,
  email TEXT
);
```
**Purpose**: Stores church member information
- **id**: Unique identifier (UUID)
- **created_at**: Timestamp when member was added
- **full_name**: Member's full name (required)
- **phone_number**: Optional contact number
- **email**: Optional email address

### 2. Services Table
```sql
CREATE TABLE services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name TEXT NOT NULL,
  description TEXT,
  service_date DATE NOT NULL,
  UNIQUE(service_date)
);
```
**Purpose**: Defines church services/events
- **id**: Unique identifier (UUID)
- **created_at**: Timestamp when service was created
- **name**: Service name (e.g., "Sunday Service", "Bible Study")
- **description**: Optional service description
- **service_date**: Date of the service (unique constraint)
- **UNIQUE(service_date)**: Prevents duplicate services on same date

### 3. Attendance Records Table
```sql
CREATE TABLE attendance_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  service_date DATE NOT NULL
);
```
**Purpose**: Links members to services they attended
- **id**: Unique identifier (UUID)
- **member_id**: Foreign key to members table (cascades on delete)
- **service_id**: Foreign key to services table (cascades on delete)
- **service_date**: Redundant date field for easier querying

### Security and Access Control
```sql
-- Row Level Security (RLS) enabled on all tables
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;

-- Policies allow all operations for authenticated users
CREATE POLICY "Allow all operations for authenticated users" ON members
FOR ALL USING (auth.role() = 'authenticated');
```
**Note**: Despite RLS being enabled, the current middleware allows open access without authentication, making the system accessible to anyone with the URL.

## How Attendance is Taken

### Attendance Marking Process

1. **Service Selection**: User selects a service from the dropdown (populated from services table)
2. **Member Selection**: User selects a member using either:
   - Dropdown list (all members)
   - Alphabet filter + clickable member list (filtered by first letter)
3. **Attendance Submission**: Form submits member_id and service_id to server action
4. **Duplicate Prevention**: System checks if attendance already exists for this member-service combination
5. **Database Insertion**: If valid, creates attendance record with member_id, service_id, and service_date
6. **UI Feedback**: Shows success/error messages and refreshes attendance display

### Server-Side Attendance Logic (`actions.ts`)

```typescript
export async function markAttendance(formData: FormData) {
  const memberId = formData.get('memberId') as string
  const serviceId = formData.get('serviceId') as string

  // Validation
  if (!memberId || !serviceId) {
    return { error: 'Member and service are required' }
  }

  // Fetch service date
  const { data: service } = await supabase
    .from('services')
    .select('service_date')
    .eq('id', serviceId)
    .single()

  // Check for existing attendance
  const { data: existingRecord } = await supabase
    .from('attendance_records')
    .select('id')
    .eq('member_id', memberId)
    .eq('service_id', serviceId)
    .single()

  if (existingRecord) {
    return { error: 'Attendance already marked for this member for this service' }
  }

  // Insert attendance record
  const { error } = await supabase
    .from('attendance_records')
    .insert([{ member_id: memberId, service_id: serviceId, service_date: service.service_date }])

  if (error) {
    return { error: 'Failed to mark attendance: ' + error.message }
  }

  revalidatePath('/attendance')
  return { success: true }
}
```

### Toggle Attendance Feature

The attendance table allows toggling attendance status:
- **Present → Absent**: Deletes the attendance record
- **Absent → Present**: Creates new attendance record
- Uses the same duplicate prevention logic

## Data Storage and Retrieval

### Where Attendance Data is Stored

1. **Primary Storage**: Supabase PostgreSQL database
   - **attendance_records** table stores each attendance instance
   - **members** table stores member information
   - **services** table stores service definitions

2. **Data Relationships**:
   - Each attendance record links one member to one service
   - Foreign key constraints ensure data integrity
   - CASCADE deletes remove attendance records when members/services are deleted

3. **Redundant Data**: service_date is stored in both services and attendance_records tables for easier querying

### Data Retrieval Patterns

#### Current Service Attendance
```typescript
async function getServiceAttendance(serviceId: string) {
  const { data } = await supabase
    .from('attendance_records')
    .select('*')
    .eq('service_id', serviceId)
  return data || []
}
```

#### Historical Records with Joins
```typescript
async function getAttendanceRecords() {
  const { data } = await supabase
    .from('attendance_records')
    .select(`
      id, service_date,
      services (name),
      members (full_name)
    `)
    .order('service_date', { ascending: false })
  return data || []
}
```

## System Features and Functionality

### 1. Member Management (`/admin`)
- **Add Members**: Form to add new church members with name, phone, email
- **View Members**: Table displaying all members with contact info and join date
- **Data Validation**: Full name required, phone/email optional

### 2. Service Management (`/admin`)
- **Add Services**: Form to create services with name, description, date
- **View Services**: Table of all scheduled services
- **Date Uniqueness**: Prevents duplicate services on same date

### 3. Real-Time Attendance (`/attendance`)
- **Service Selection**: Dropdown of available services
- **Member Selection**:
  - Full dropdown list
  - Alphabet filter (A-Z, All)
  - Clickable member cards when filtered
- **Attendance Marking**: Form submission with validation
- **Live Status Table**: Shows present/absent for all members in selected service
- **Toggle Functionality**: Click to mark/unmark individual attendance
- **Error Handling**: Prevents duplicates, shows user-friendly messages
- **Success Feedback**: Confirmation messages with auto-clear

### 4. Historical Records (`/attendance/records`)
- **Grouped by Service**: Records organized by service name
- **Member-Attendance Lists**: Shows who attended each service
- **Attendance Counts**: Total attendees per service
- **Date Sorting**: Most recent first

### 5. Navigation and UI
- **Responsive Design**: Works on desktop, tablet, mobile
- **Clean Interface**: Tailwind CSS styling
- **Navigation Bar**: Links to Admin, Attendance, Records
- **Loading States**: Proper loading indicators
- **Error Boundaries**: Graceful error handling

## Access Control and Security

### Current Access Model
- **No Authentication Required**: System is open access
- **Middleware Configuration**: `middleware.js` allows all requests
- **RLS Policies**: Technically enabled but bypassed by open access
- **Public Access**: Anyone with the URL can view and modify data

### Security Considerations
- **Data Integrity**: Foreign key constraints prevent orphaned records
- **Input Validation**: Server-side validation on all forms
- **SQL Injection Protection**: Supabase client handles parameterization
- **CORS**: Supabase handles cross-origin requests

### Potential Security Enhancements
- Add authentication (Supabase Auth)
- Implement role-based access (admin vs. regular users)
- Add audit logging for data changes
- Implement data export restrictions

## Data Flow and User Interactions

### Typical Attendance Workflow

1. **Admin Setup**:
   - Admin adds members via `/admin`
   - Admin schedules services via `/admin`

2. **Attendance Taking**:
   - User navigates to `/attendance`
   - Selects service from dropdown
   - Chooses member (full list or filtered)
   - Submits attendance form
   - System validates and stores record
   - UI updates to show attendance marked

3. **Status Checking**:
   - Attendance table shows real-time status
   - Can toggle individual attendance
   - Error messages prevent duplicates

4. **Record Viewing**:
   - Navigate to `/attendance/records`
   - View historical data grouped by service
   - See attendance counts

### Error Handling
- **Duplicate Attendance**: "Attendance already marked for this member for this service"
- **Missing Data**: "Member and service are required"
- **Database Errors**: Generic error messages with details
- **Network Issues**: Supabase handles connection errors

## Deployment and Configuration

### Environment Variables
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Database Setup
1. Create Supabase project
2. Run `schema.sql` in SQL editor
3. Configure environment variables
4. Deploy application

### Production Considerations
- **Database Backups**: Regular Supabase backups
- **Monitoring**: Supabase dashboard for usage
- **Scaling**: Supabase handles scaling automatically
- **Cost**: Free tier suitable for small churches

## Future Enhancements

### Potential Features
- **Authentication**: User accounts and roles
- **Bulk Import**: CSV upload for members
- **Reports**: Advanced analytics and reporting
- **Notifications**: Email/SMS reminders
- **Mobile App**: React Native companion app
- **API Endpoints**: REST API for integrations
- **Data Export**: PDF/Excel reports
- **Recurring Services**: Automated service scheduling

### Technical Improvements
- **Testing**: Unit and integration tests
- **Caching**: Redis for performance
- **Real-time Updates**: WebSocket subscriptions
- **Offline Support**: PWA capabilities
- **Multi-tenancy**: Support multiple churches

## Troubleshooting

### Common Issues
- **Environment Variables**: Ensure correct Supabase credentials
- **Database Connection**: Check Supabase project status
- **Build Errors**: Verify Node.js version compatibility
- **Data Not Showing**: Check RLS policies and network connectivity

### Debug Mode
- Development server shows detailed error messages
- Browser console logs client-side errors
- Supabase dashboard shows database queries and errors

This system provides a complete solution for church attendance management, balancing ease of use with data integrity and scalability.
