import React from "react";

const GenericStatsCards = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <div
            key={index}
            className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 flex items-center justify-between hover:shadow-md transition-shadow"
          >
            <div>
              <p className="text-gray-600 text-sm font-medium mb-2">
                {stat.title}
              </p>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            </div>
            <div className={`p-3 rounded-full ${stat.bgColor} ${stat.color}`}>
              <IconComponent className="w-6 h-6" />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default GenericStatsCards;
