import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, Users, Trophy, Calendar, Target } from 'lucide-react';
import { Card } from '../ui/Card';

interface RevenueAnalyticsProps {
  userType: 'platform' | 'organizer';
}

export const RevenueAnalytics: React.FC<RevenueAnalyticsProps> = ({ userType }) => {
  // Mock data - in real app, this would come from API
  const platformRevenue = {
    totalRevenue: 125000,
    monthlyGrowth: 15.2,
    commissionEarned: 85000,
    subscriptionRevenue: 40000,
    tournaments: 156,
    activeUsers: 2340
  };

  const organizerRevenue = {
    totalEarnings: 45000,
    monthlyGrowth: 22.5,
    tournamentsHosted: 12,
    totalParticipants: 890,
    averageEntryFee: 750,
    platformFeesDeducted: 2250
  };

  const data = userType === 'platform' ? platformRevenue : organizerRevenue;

  const stats = userType === 'platform' ? [
    {
      icon: <DollarSign className="h-6 w-6" />,
      title: 'Total Revenue',
      value: `रू ${data.totalRevenue.toLocaleString()}`,
      change: `+${data.monthlyGrowth}% this month`,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: 'Commission Earned',
      value: `रू ${platformRevenue.commissionEarned.toLocaleString()}`,
      change: 'From tournament fees',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: 'Subscription Revenue',
      value: `रू ${platformRevenue.subscriptionRevenue.toLocaleString()}`,
      change: 'Monthly recurring',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      icon: <Trophy className="h-6 w-6" />,
      title: 'Active Tournaments',
      value: String(data.tournaments),
      change: 'This month',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ] : [
    {
      icon: <DollarSign className="h-6 w-6" />,
      title: 'Total Earnings',
      value: `रू ${data.totalEarnings.toLocaleString()}`,
      change: `+${data.monthlyGrowth}% this month`,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      icon: <Trophy className="h-6 w-6" />,
      title: 'Tournaments Hosted',
      value: String(organizerRevenue.tournamentsHosted),
      change: 'This month',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: 'Total Participants',
      value: String(organizerRevenue.totalParticipants),
      change: 'Across all tournaments',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      icon: <Target className="h-6 w-6" />,
      title: 'Avg Entry Fee',
      value: `रू ${organizerRevenue.averageEntryFee}`,
      change: 'Per participant',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          {userType === 'platform' ? 'Platform Revenue Analytics' : 'Your Revenue Analytics'}
        </h2>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Calendar className="h-4 w-4" />
          <span>Last 30 days</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {stat.change}
                  </p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <div className={stat.color}>
                    {stat.icon}
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Revenue Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {userType === 'platform' ? 'Revenue Sources' : 'Earnings Breakdown'}
          </h3>
          
          {userType === 'platform' ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                  <span className="text-gray-600">Tournament Commissions</span>
                </div>
                <span className="font-semibold">68%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                  <span className="text-gray-600">Subscription Plans</span>
                </div>
                <span className="font-semibold">32%</span>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-gray-600">Tournament Revenue</span>
                </div>
                <span className="font-semibold">रू {(organizerRevenue.totalEarnings + organizerRevenue.platformFeesDeducted).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                  <span className="text-gray-600">Platform Fees</span>
                </div>
                <span className="font-semibold">-रू {organizerRevenue.platformFeesDeducted.toLocaleString()}</span>
              </div>
              <div className="border-t pt-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-900">Net Earnings</span>
                  <span className="font-bold text-green-600">रू {organizerRevenue.totalEarnings.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Growth Metrics
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Monthly Growth</span>
              <span className="font-semibold text-green-600">+{data.monthlyGrowth}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Active Users</span>
              <span className="font-semibold">{userType === 'platform' ? platformRevenue.activeUsers : organizerRevenue.totalParticipants}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Conversion Rate</span>
              <span className="font-semibold">12.5%</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};