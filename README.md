# DiaTrack - Clinical Diabetes Management Platform

## Project Overview

DiaTrack is a comprehensive clinical support tool designed to help healthcare professionals manage diabetes patients effectively. The platform provides clinicians with tools to register patients, conduct diabetes risk assessments, track patient progress, and deliver personalized care recommendations.

## Key Features

### For Clinicians
- **Patient Management**: Register and manage multiple patients with comprehensive medical profiles
- **Risk Assessment**: Conduct diabetes risk assessments using advanced AI models
- **Progress Tracking**: Monitor patient progress over time with detailed analytics
- **Clinical Insights**: Get AI-powered insights and recommendations for patient care
- **Secure Platform**: HIPAA-compliant data management with role-based access control

### Patient Management
- Complete patient registration with medical history
- Patient ID system for easy identification
- Contact information and emergency details
- Medical history tracking and updates

### Assessment Tools
- Diabetes risk assessment using machine learning models
- Interpretable AI results with feature importance
- Personalized recommendations based on patient data
- Progress tracking and trend analysis

## Technology Stack

This project is built with:

- **Frontend**: React 18 with TypeScript
- **UI Framework**: shadcn/ui components with Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **State Management**: React Context + TanStack Query
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom diabetes-themed design system

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Supabase account and project

### Installation

```sh
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to the project directory
cd diatrack

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your Supabase URL and anon key to .env.local

# Start the development server
npm run dev
```

### Environment Variables

Create a `.env.local` file with the following variables:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Supabase Configuration

To ensure proper authentication flow, configure your Supabase project:

1. **Disable Email Confirmation** (Recommended for development):
   - Go to your Supabase Dashboard
   - Navigate to Authentication > Settings
   - Set "Enable email confirmations" to OFF
   - This allows immediate login after signup

2. **Or Enable Email Confirmation** (For production):
   - Keep email confirmations enabled
   - Users will need to verify their email before logging in
   - Configure email templates in Authentication > Email Templates

## Database Schema

### Clinicians Table
- `id`: Primary key (UUID)
- `user_id`: Reference to auth.users
- `work_id`: Unique clinician work ID
- `display_name`: Clinician's full name
- `email`: Contact email
- `specialization`: Medical specialization
- `license_number`: Professional license number

### Patients Table
- `id`: Primary key (UUID)
- `clinician_id`: Reference to clinicians table
- `patient_id`: Unique patient identifier
- `first_name`, `last_name`: Patient name
- `date_of_birth`: Patient DOB
- `gender`: Patient gender
- `contact_number`: Phone number
- `email`: Patient email
- `address`: Patient address
- `emergency_contact`: Emergency contact info
- `medical_history`: JSON field for medical data

## Development

### Running the Application

```sh
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Database Migrations

The project includes Supabase migrations for the database schema. To apply migrations:

```sh
# Apply migrations to your Supabase project
supabase db push
```

## Deployment

### Via Lovable
Simply open [Lovable](https://lovable.dev) and click on Share -> Publish.

### Manual Deployment
1. Build the project: `npm run build`
2. Deploy the `dist` folder to your preferred hosting platform
3. Configure environment variables on your hosting platform

## Security Features

- Row Level Security (RLS) policies ensure data isolation
- Clinicians can only access their own patients
- Secure authentication via Supabase Auth
- Encrypted data transmission
- Role-based access control

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team or create an issue in the repository.
