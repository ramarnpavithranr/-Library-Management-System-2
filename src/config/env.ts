/**
 * Frontend-Safe Environment Configuration
 * Centralized access to Next.js public environment variables with safe fallbacks.
 */
export const ENV = {
  APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'SSEC Smart Library Management System',
  APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION || 'v2.4 Smart Release',
  COLLEGE_NAME: process.env.NEXT_PUBLIC_COLLEGE_NAME || 'Sree Sakthi Engineering College',
  COLLEGE_SHORT_NAME: process.env.NEXT_PUBLIC_COLLEGE_SHORT_NAME || 'Sree Sakthi Engg College',
  COLLEGE_LOCATION: process.env.NEXT_PUBLIC_COLLEGE_LOCATION || 'Coimbatore',
  LIBRARY_NAME: process.env.NEXT_PUBLIC_LIBRARY_NAME || 'Central Smart Library',
  LIBRARY_EMAIL: process.env.NEXT_PUBLIC_LIBRARY_EMAIL || 'library@sreesakthi.edu.in',
  LIBRARY_PHONE: process.env.NEXT_PUBLIC_LIBRARY_PHONE || '+91 422 236 9900',
  CURRENCY_SYMBOL: process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '₹',
  DEFAULT_LOAN_DAYS: parseInt(process.env.NEXT_PUBLIC_DEFAULT_LOAN_DAYS || '14', 10),
  FINE_PER_DAY: parseFloat(process.env.NEXT_PUBLIC_FINE_PER_DAY || '5'),
  MAX_BOOKS_PER_STUDENT: parseInt(process.env.NEXT_PUBLIC_MAX_BOOKS_PER_STUDENT || '3', 10),
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  IS_SUPABASE_CONFIGURED: Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ),
} as const;
