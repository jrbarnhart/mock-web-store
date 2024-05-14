import prisma from "@/components/db/db";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency, formatNumber } from "@/lib/formatters";

async function getSalesData() {
  const data = await prisma.order.aggregate({
    _sum: { totalPaidInCents: true },
    _count: true,
  });

  return {
    amount: (data._sum.totalPaidInCents || 0) / 100,
    numberOfSales: data._count,
  };
}

async function getUserData() {
  const [userCount, orderData] = await Promise.all([
    prisma.user.count(),
    prisma.order.aggregate({
      _sum: { totalPaidInCents: true },
    }),
  ]);

  return {
    userCount,
    averagePaidPerUser:
      userCount === 0
        ? 0
        : (orderData._sum.totalPaidInCents || 0) / userCount / 100,
  };
}

export default async function AdminDashboard() {
  const [salesData, userData] = await Promise.all([
    getSalesData(),
    getUserData(),
  ]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <DashboardCard
        title="Sales"
        subtitle={`${formatNumber(salesData.numberOfSales)} Orders`}
        body={formatCurrency(salesData.amount)}
      />
      <DashboardCard
        title="Customers"
        subtitle={`${formatCurrency(
          userData.averagePaidPerUser
        )} Average Value`}
        body={`${formatNumber(userData.userCount)}`}
      />
    </div>
  );
}

interface DashboardCardProps {
  title: string;
  subtitle: string;
  body: string;
}

function DashboardCard({ title, subtitle, body }: DashboardCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{subtitle}</CardDescription>
      </CardHeader>
      <CardContent>
        <p>{body}</p>
      </CardContent>
    </Card>
  );
}
