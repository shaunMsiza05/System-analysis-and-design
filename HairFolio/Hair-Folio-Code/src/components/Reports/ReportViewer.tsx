import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useSupabaseStore } from '@/hooks/useSupabaseStore';

interface ReportViewerProps {
  reportData: any;
  reportType: string;
  onClose: () => void;
  onExport: (format: 'pdf' | 'csv') => void;
}

export function ReportViewer({ reportData, reportType, onClose, onExport }: ReportViewerProps) {
  const { settings } = useSupabaseStore();
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: settings.currency,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const renderSummaryReport = () => {
    switch (reportType) {
      case 'business-summary':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(reportData.totalRevenue)}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Revenue</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-red-600">
                    {formatCurrency(reportData.totalExpenses)}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Expenses</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-blue-600">
                    {formatCurrency(reportData.netProfit)}
                  </div>
                  <div className="text-sm text-muted-foreground">Net Profit</div>
                </CardContent>
              </Card>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">{reportData.totalCustomers}</div>
                  <div className="text-sm text-muted-foreground">Total Customers</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">
                    {formatCurrency(reportData.averageTransactionValue)}
                  </div>
                  <div className="text-sm text-muted-foreground">Avg Transaction</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-purple-600">
                    {formatPercentage(reportData.profitMargin)}
                  </div>
                  <div className="text-sm text-muted-foreground">Profit Margin</div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 'service-performance':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-lg font-semibold text-green-600">
                    {reportData.topService}
                  </div>
                  <div className="text-sm text-muted-foreground">Top Performing Service</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-lg font-semibold text-orange-600">
                    {reportData.leastPopularService}
                  </div>
                  <div className="text-sm text-muted-foreground">Least Popular Service</div>
                </CardContent>
              </Card>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead>Count</TableHead>
                  <TableHead>Total Revenue</TableHead>
                  <TableHead>Avg Price</TableHead>
                  <TableHead>Percentage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportData.services.map((service: any, index: number) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{service.name}</TableCell>
                    <TableCell>{service.count}</TableCell>
                    <TableCell>{formatCurrency(service.totalRevenue)}</TableCell>
                    <TableCell>{formatCurrency(service.averagePrice)}</TableCell>
                    <TableCell>{formatPercentage(service.percentage)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        );

      default:
        return <div>Report type not implemented yet</div>;
    }
  };

  const renderDetailedReport = () => {
    switch (reportType) {
      case 'transaction-history':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">{reportData.totalCount}</div>
                  <div className="text-sm text-muted-foreground">Total Transactions</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(reportData.totalAmount)}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Amount</div>
                </CardContent>
              </Card>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportData.transactions.map((transaction: any) => (
                  <TableRow key={transaction.id}>
                    <TableCell>{formatDate(transaction.date)}</TableCell>
                    <TableCell>{transaction.service}</TableCell>
                    <TableCell>{formatCurrency(transaction.amount)}</TableCell>
                    <TableCell>{transaction.notes || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        );

      case 'expense-breakdown':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">{reportData.totalCount}</div>
                  <div className="text-sm text-muted-foreground">Total Expenses</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-red-600">
                    {formatCurrency(reportData.totalAmount)}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Amount</div>
                </CardContent>
              </Card>
            </div>
            <div className="mb-4">
              <h4 className="font-semibold mb-2">By Category:</h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(reportData.byCategory).map(([category, amount]: [string, any]) => (
                  <Badge key={category} variant="outline">
                    {category}: {formatCurrency(amount)}
                  </Badge>
                ))}
              </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportData.expenses.map((expense: any) => (
                  <TableRow key={expense.id}>
                    <TableCell>{formatDate(expense.date)}</TableCell>
                    <TableCell>
                      <Badge variant={expense.type === 'Fixed' ? 'default' : 'secondary'}>
                        {expense.type}
                      </Badge>
                    </TableCell>
                    <TableCell>{expense.description}</TableCell>
                    <TableCell>{formatCurrency(expense.amount)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        );

      default:
        return <div>Report type not implemented yet</div>;
    }
  };

  const renderExceptionReport = () => {
    switch (reportType) {
      case 'high-value-transactions':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-orange-600">
                    {formatCurrency(reportData.threshold)}
                  </div>
                  <div className="text-sm text-muted-foreground">Threshold</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">{reportData.count}</div>
                  <div className="text-sm text-muted-foreground">High-Value Transactions</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(reportData.totalValue)}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Value</div>
                </CardContent>
              </Card>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportData.transactions.map((transaction: any) => (
                  <TableRow key={transaction.id}>
                    <TableCell>{formatDate(transaction.date)}</TableCell>
                    <TableCell>{transaction.service}</TableCell>
                    <TableCell className="font-semibold text-green-600">
                      {formatCurrency(transaction.amount)}
                    </TableCell>
                    <TableCell>{transaction.notes || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        );

      case 'expense-anomalies':
        return (
          <div className="space-y-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-red-600">{reportData.totalAnomalies}</div>
                <div className="text-sm text-muted-foreground">Total Anomalies Detected</div>
              </CardContent>
            </Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Reason</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportData.anomalies.map((anomaly: any) => (
                  <TableRow key={anomaly.id}>
                    <TableCell>{formatDate(anomaly.date)}</TableCell>
                    <TableCell>{anomaly.description}</TableCell>
                    <TableCell className="font-semibold text-red-600">
                      {formatCurrency(anomaly.amount)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        anomaly.severity === 'high' ? 'destructive' :
                        anomaly.severity === 'medium' ? 'secondary' : 'outline'
                      }>
                        {anomaly.severity.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{anomaly.reason}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        );

      default:
        return <div>Report type not implemented yet</div>;
    }
  };

  const renderReport = () => {
    if (reportType.includes('summary') || reportType.includes('performance') || reportType.includes('analytics')) {
      return renderSummaryReport();
    } else if (reportType.includes('history') || reportType.includes('breakdown') || reportType.includes('operations')) {
      return renderDetailedReport();
    } else {
      return renderExceptionReport();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="capitalize">
              {reportType.replace('-', ' ')} Report
            </CardTitle>
            <div className="text-sm text-muted-foreground">
              Period: {reportData.period}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onExport('pdf')}>
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="overflow-auto max-h-[calc(90vh-8rem)]">
          {renderReport()}
        </CardContent>
      </Card>
    </div>
  );
}