import React from "react";
import { User, Clock, MessageCircle, CheckCircle } from "lucide-react";

const StatsCards = ({ counts, consultationCount = 0 }) => {
  const statsData = [
    {
      title: "BN hôm nay",
      value: counts.total,
      icon: User,
      color: "text-blue-500",
      bgColor: "bg-blue-50",
    },
    {
      title: "Chờ khám",
      value: counts.queue,
      icon: Clock,
      color: "text-orange-500",
      bgColor: "bg-orange-50",
    },
    {
      title: "Tư vấn online",
      value: consultationCount,
      icon: MessageCircle,
      color: "text-green-500",
      bgColor: "bg-green-50",
    },
    {
      title: "Hoàn thành",
      value: counts.completed,
      icon: CheckCircle,
      color: "text-purple-500",
      bgColor: "bg-purple-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statsData.map((stat, index) => {
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

export default StatsCards;
