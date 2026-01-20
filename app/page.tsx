import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-400 to-blue-500">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-white mb-4">🎯 Options Scanner</h1>
        <p className="text-xl text-white mb-8">Find $1-$10 options with high potential</p>
        <Link
          href="/dashboard"
          className="bg-white text-green-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 inline-block"
        >
          View Dashboard →
        </Link>
      </div>
    </div>
  );
}
