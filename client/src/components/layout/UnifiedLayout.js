import React from "react";
import { useSelector } from "react-redux";
import Header from "./Header";
import Sidebar from "./Sidebar";

const UnifiedLayout = ({ children, title, breadcrumbs, actions }) => {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden md:ml-[280px]">
        {/* Header */}
        <Header />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Page Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                {breadcrumbs && (
                  <nav className="flex mt-2" aria-label="Breadcrumb">
                    <ol className="flex items-center space-x-2">
                      {breadcrumbs.map((crumb, index) => (
                        <li key={index} className="flex items-center">
                          {index > 0 && (
                            <svg
                              className="w-4 h-4 text-gray-400 mx-2"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                          {crumb.link ? (
                            <a
                              href={crumb.link}
                              className="text-sm font-medium text-blue-600 hover:text-blue-500"
                            >
                              {crumb.label}
                            </a>
                          ) : (
                            <span className="text-sm text-gray-500">
                              {crumb.label}
                            </span>
                          )}
                        </li>
                      ))}
                    </ol>
                  </nav>
                )}
              </div>
              {actions && (
                <div className="flex items-center space-x-3">{actions}</div>
              )}
            </div>
          </div>

          {/* Page Content */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default UnifiedLayout;
