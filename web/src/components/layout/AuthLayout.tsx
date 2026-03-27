import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-primary-600 px-12 py-10 text-white">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
            <span className="text-primary-600 font-bold text-lg">OI</span>
          </div>
          <span className="font-semibold text-xl">Ouvriers Ivoiriens</span>
        </Link>
        <div>
          <h1 className="text-4xl font-bold leading-tight mb-4">
            Des artisans qualifiés, près de chez vous.
          </h1>
          <p className="text-primary-100 text-lg">
            Électriciens, plombiers, menuisiers — trouvez le bon artisan en quelques minutes.
          </p>
        </div>
        <p className="text-primary-200 text-sm">© 2025 Ouvriers Ivoiriens</p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold">OI</span>
            </div>
            <span className="font-semibold text-gray-900">Ouvriers Ivoiriens</span>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
