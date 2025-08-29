// src/components/vendor/VendorAnalyticsCharts.jsx
import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const VendorAnalyticsCharts = ({ analytics }) => {
  if (!analytics) return null;

  // Order Status Chart Data
  const orderStatusData = {
    labels: ['Pending', 'Processing', 'Shipped', 'Delivered'],
    datasets: [
      {
        data: [
          analytics.orders.pending,
          analytics.orders.processing,
          analytics.orders.shipped,
          analytics.orders.delivered,
        ],
        backgroundColor: [
          '#F59E0B', // Yellow for pending
          '#3B82F6', // Blue for processing
          '#8B5CF6', // Purple for shipped
          '#10B981', // Green for delivered
        ],
        borderWidth: 0,
      },
    ],
  };

  // Top Products Chart Data
  const topProductsData = {
    labels: analytics.top_products.map(p => p.product__title?.substring(0, 15) + '...' || 'Product'),
    datasets: [
      {
        label: 'Units Sold',
        data: analytics.top_products.map(p => p.total_sold),
        backgroundColor: '#3B82F6',
        borderColor: '#1D4ED8',
        borderWidth: 1,
        maxBarThickness: 60, // ✅ FIXED: Limit bar width
      },
    ],
  };

  // Revenue Chart
  const revenueData = {
    labels: ['Weekly', 'Monthly', 'Total'],
    datasets: [
      {
        label: 'Revenue (₹)',
        data: [
          analytics.revenue.monthly * 0.25,
          analytics.revenue.monthly,
          analytics.revenue.total,
        ],
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderColor: '#3B82F6',
        borderWidth: 2,
        fill: true,
      },
    ],
  };

  // ✅ FIXED: Optimized chart options with better sizing
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false, // ✅ Allow custom sizing
    plugins: {
      legend: {
        position: 'bottom', // ✅ FIXED: Move to bottom to save space
        labels: {
          boxWidth: 12,
          font: {
            size: 11
          }
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          font: {
            size: 10
          }
        }
      },
      x: {
        ticks: {
          font: {
            size: 10
          }
        }
      }
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 12,
          font: {
            size: 11
          }
        }
      },
    },
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      
      {/* Revenue Chart */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="text-lg font-semibold mb-4 text-primary-800">Revenue Trends</h3>
        <div className="h-64"> {/* ✅ FIXED: Set fixed height */}
          <Line data={revenueData} options={chartOptions} />
        </div>
      </div>

      {/* Top Products Chart */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="text-lg font-semibold mb-4 text-primary-800">Top Products</h3>
        <div className="h-64"> {/* ✅ FIXED: Set fixed height */}
          <div className="overflow-x-auto"> {/* ✅ FIXED: Add scroll for many products */}
            <Bar data={topProductsData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Order Status Chart */}
      <div className="bg-white rounded-lg shadow-md p-4 md:col-span-2 xl:col-span-1">
        <h3 className="text-lg font-semibold mb-4 text-primary-800">Order Status</h3>
        <div className="h-64 flex justify-center"> {/* ✅ FIXED: Center doughnut chart */}
          <div className="w-48">
            <Doughnut data={orderStatusData} options={doughnutOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorAnalyticsCharts;
