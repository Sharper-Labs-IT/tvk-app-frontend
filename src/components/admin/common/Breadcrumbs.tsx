import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const Breadcrumbs: React.FC = () => {
    const location = useLocation();
    const pathnames = location.pathname.split('/').filter((x) => x);

    // Skip if on dashboard root
    if (pathnames.length === 1 && pathnames[0] === 'admin') return null;

    return (
        <nav className="flex mb-6" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-2">
                <li className="inline-flex items-center">
                    <Link to="/admin/dashboard" className="inline-flex items-center text-sm font-medium text-gray-400 hover:text-white">
                        <Home size={14} className="mr-2" />
                        Home
                    </Link>
                </li>
                {pathnames.slice(1).map((value, index) => {
                    const to = `/admin/${pathnames.slice(1, index + 2).join('/')}`;
                    const isLast = index === pathnames.length - 2;

                    // Clean ID params and capitalize
                    const displayName = !isNaN(Number(value)) 
                        ? `#${value}` 
                        : value.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

                    return (
                        <li key={to}>
                            <div className="flex items-center">
                                <ChevronRight size={14} className="text-gray-500 mx-1" />
                                {isLast ? (
                                    <span className="text-sm font-medium text-brand-gold">{displayName}</span>
                                ) : (
                                    <Link to={to} className="text-sm font-medium text-gray-400 hover:text-white">
                                        {displayName}
                                    </Link>
                                )}
                            </div>
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
};

export default Breadcrumbs;
