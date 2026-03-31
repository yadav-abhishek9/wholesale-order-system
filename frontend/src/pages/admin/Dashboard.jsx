import { useState, useEffect } from 'react';
import { TrendingUp, ShoppingCart, Users, Package } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { orderAPI, productAPI, partyAPI } from '../../services/api';
import DashboardLayout from '../../components/DashboardLayout';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalParties: 0,
    totalProducts: 0
  });
  const [chartData, setChartData] = useState(null);
  const [chartPeriod, setChartPeriod] = useState('daily');

  useEffect(() => {
    fetchDashboardData();
  }, [chartPeriod]);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, chartRes, partiesRes, productsRes] = await Promise.all([
        orderAPI.getDashboardStats(),
        orderAPI.getChartStats(chartPeriod),
        partyAPI.getAll(),
        productAPI.getAll()
      ]);

      setStats({
        totalSales: statsRes.data.totalSales || 0,
        totalOrders: statsRes.data.totalOrders || 0,
        totalParties: partiesRes.data.length || 0,
        totalProducts: productsRes.data.length || 0
      });

      const labels = chartRes.data.map(item => item.date);
      const salesData = chartRes.data.map(item => item.sales);

      setChartData({
        labels,
        datasets: [
          {
            label: 'Sales',
            data: salesData,
            borderColor: 'rgb(147, 51, 234)',
            backgroundColor: 'rgba(147, 51, 234, 0.1)',
            fill: true,
            tension: 0.4,
            pointBackgroundColor: 'rgb(147, 51, 234)',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 5,
            pointHoverRadius: 7
          }
        ]
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 14,
          weight: 'bold'
        },
        bodyFont: {
          size: 13
        },
        borderColor: 'rgba(147, 51, 234, 0.5)',
        borderWidth: 1,
        callbacks: {
          label: function(context) {
            return `Sales: ₹${context.parsed.y.toLocaleString()}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          drawBorder: false
        },
        ticks: {
          callback: function(value) {
            return '₹' + value.toLocaleString();
          },
          font: {
            size: 11
          }
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 11
          }
        }
      }
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-[1400px]">
        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-pink-600 to-red-600 rounded-3xl p-8 text-white shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-10 rounded-full -ml-24 -mb-24"></div>
          <div className="relative">
            <h1 className="text-4xl font-display font-black mb-2">Dashboard</h1>
            <p className="text-purple-100 text-lg">Welcome back! Here's your business overview</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="stat-card bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-2xl">
                <TrendingUp size={32} />
              </div>
            </div>
            <h3 className="text-sm font-semibold text-blue-100 mb-1">Total Sales</h3>
            <p className="text-4xl font-display font-black">₹{stats.totalSales.toLocaleString()}</p>
          </div>

          <div className="stat-card bg-gradient-to-br from-green-500 to-emerald-600 text-white border-0 transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-2xl">
                <ShoppingCart size={32} />
              </div>
            </div>
            <h3 className="text-sm font-semibold text-green-100 mb-1">Total Orders</h3>
            <p className="text-4xl font-display font-black">{stats.totalOrders}</p>
          </div>

          <div className="stat-card bg-gradient-to-br from-purple-500 to-pink-600 text-white border-0 transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-2xl">
                <Users size={32} />
              </div>
            </div>
            <h3 className="text-sm font-semibold text-purple-100 mb-1">Total Parties</h3>
            <p className="text-4xl font-display font-black">{stats.totalParties}</p>
          </div>

          <div className="stat-card bg-gradient-to-br from-orange-500 to-red-600 text-white border-0 transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-2xl">
                <Package size={32} />
              </div>
            </div>
            <h3 className="text-sm font-semibold text-orange-100 mb-1">Total Products</h3>
            <p className="text-4xl font-display font-black">{stats.totalProducts}</p>
          </div>
        </div>

        {/* Sales Chart */}
        <div className="card">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
            <h2 className="text-2xl font-display font-bold text-gray-900">Sales Overview</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setChartPeriod('daily')}
                className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                  chartPeriod === 'daily'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Daily
              </button>
              <button
                onClick={() => setChartPeriod('monthly')}
                className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                  chartPeriod === 'monthly'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Monthly
              </button>
            </div>
          </div>

          {chartData ? (
            <div className="h-80">
              <Line data={chartData} options={chartOptions} />
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center text-gray-500">
              Loading chart...
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;