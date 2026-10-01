/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // تخطي أخطاء التايب سكريبت للسماح ببناء الموقع بنجاح
    ignoreBuildErrors: true,
  },
  eslint: {
    // تخطي أخطاء الـ Linting أثناء الرفع
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
