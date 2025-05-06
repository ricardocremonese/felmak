
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { ChartContainer } from '@/components/ui/chart';

interface DashboardChartsProps {
  spendingByBlockData: Array<{
    name: string;
    value: number;
    color?: string;
  }>;
  productData: Array<{
    name: string;
    value: number;
  }>;
  formatCurrency: (value: number) => string;
}

const COLORS = ['#4caf50', '#81c784', '#c8e6c9', '#2e7d32', '#1b5e20', '#a5d6a7', '#66bb6a'];

const renderCustomizedLabel = ({ 
  cx, 
  cy, 
  midAngle, 
  innerRadius, 
  outerRadius, 
  percent 
}: { 
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  percent: number | string | undefined | null;
}) => {
  if (percent === undefined || percent === null) return null;
  
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  
  const numericPercent = typeof percent === 'string' ? parseFloat(percent) : percent;
  if (isNaN(numericPercent)) return null;
  
  const percentText = `${(numericPercent * 100).toFixed(0)}%`;

  return (
    <text 
      x={x} 
      y={y} 
      fill="white" 
      textAnchor={x > cx ? 'start' : 'end'} 
      dominantBaseline="central"
    >
      {percentText}
    </text>
  );
};

export const DashboardCharts = ({ 
  spendingByBlockData, 
  productData, 
  formatCurrency 
}: DashboardChartsProps) => {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 rounded-xl shadow-md border border-gray-200"
      >
        <h3 className="text-xl font-semibold mb-4">{t('dashboard.spendingByBlock')}</h3>
        <div className="h-[300px]">
          <ChartContainer config={{}} className="w-full h-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={spendingByBlockData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Bar 
                  dataKey="value" 
                  name={t('dashboard.totalSpent')}
                  fill="#4caf50" 
                  animationDuration={1000}
                >
                  {spendingByBlockData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || "#4caf50"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 rounded-xl shadow-md border border-gray-200"
      >
        <h3 className="text-xl font-semibold mb-4">{t('dashboard.productDistribution')}</h3>
        <div className="h-[300px]">
          <ChartContainer config={{}} className="w-full h-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={productData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  animationDuration={1000}
                >
                  {productData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${Number(value).toFixed(1)} L`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </motion.div>
    </div>
  );
};
