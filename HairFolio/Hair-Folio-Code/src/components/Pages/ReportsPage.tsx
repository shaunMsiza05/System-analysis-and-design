import { useState } from 'react';
import { FileText, TrendingUp, AlertTriangle, Calendar, Filter } from 'lucide-react';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSupabaseStore } from '@/hooks/useSupabaseStore';
import { ReportGenerator } from '@/utils/reportGenerator';
import { ReportCard } from '@/components/Reports/ReportCard';
import { ReportViewer } from '@/components/Reports/ReportViewer';
import { ReportConfig, ReportDateRange } from '@/types/reports';
import { useToast } from '@/hooks/use-toast';

const REPORT_CONFIGS: ReportConfig[] = [
  // Summary Reports
  {
    type: 'business-summary',
    name: 'Business Summary',
    description: 'High-level overview of revenue, expenses, and profit',
    category: 'summary',
    defaultDateRange: 'last30days',
    exportFormats: ['pdf', 'csv']
  },
  {
    type: 'service-performance',
    name: 'Service Performance',
    description: 'Analysis of most and least popular services with revenue breakdown',
    category: 'summary',
    defaultDateRange: 'last30days',
    exportFormats: ['pdf', 'csv']
  },
  
  // Detailed Reports
  {
    type: 'transaction-history',
    name: 'Complete Transaction History',
    description: 'Detailed list of all transactions with full information',
    category: 'detailed',
    defaultDateRange: 'last30days',
    exportFormats: ['csv', 'pdf']
  },
  {
    type: 'expense-breakdown',
    name: 'Detailed Expense Breakdown',
    description: 'Complete expense analysis with categories and descriptions',
    category: 'detailed',
    defaultDateRange: 'last30days',
    exportFormats: ['csv', 'pdf']
  },
  
  // Exception Reports
  {
    type: 'high-value-transactions',
    name: 'High-Value Transactions',
    description: 'Transactions exceeding configurable threshold amount',
    category: 'exception',
    defaultDateRange: 'last30days',
    exportFormats: ['csv', 'pdf']
  },
  {
    type: 'expense-anomalies',
    name: 'Expense Anomalies',
    description: 'Unusual spending patterns and unexpectedly high expenses',
    category: 'exception',
    defaultDateRange: 'last30days',
    exportFormats: ['csv', 'pdf']
  }
];

export function ReportsPage() {
  const { transactions, expenses, settings } = useSupabaseStore();
  const { toast } = useToast();
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: settings.currency,
    }).format(amount);
  };
  
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDateRange, setSelectedDateRange] = useState<string>('last30days');
  const [generatingReport, setGeneratingReport] = useState<string | null>(null);
  const [currentReport, setCurrentReport] = useState<{
    type: string;
    data: any;
  } | null>(null);

  const getDateRange = (range: string): ReportDateRange => {
    const today = new Date();
    switch (range) {
      case 'last7days':
        return {
          startDate: format(subDays(today, 7), 'yyyy-MM-dd'),
          endDate: format(today, 'yyyy-MM-dd')
        };
      case 'last30days':
        return {
          startDate: format(subDays(today, 30), 'yyyy-MM-dd'),
          endDate: format(today, 'yyyy-MM-dd')
        };
      case 'last90days':
        return {
          startDate: format(subDays(today, 90), 'yyyy-MM-dd'),
          endDate: format(today, 'yyyy-MM-dd')
        };
      case 'thisMonth':
        return {
          startDate: format(startOfMonth(today), 'yyyy-MM-dd'),
          endDate: format(endOfMonth(today), 'yyyy-MM-dd')
        };
      case 'lastYear':
        return {
          startDate: format(subDays(today, 365), 'yyyy-MM-dd'),
          endDate: format(today, 'yyyy-MM-dd')
        };
      default:
        return {
          startDate: format(subDays(today, 30), 'yyyy-MM-dd'),
          endDate: format(today, 'yyyy-MM-dd')
        };
    }
  };

  const generateReport = async (reportType: string) => {
    setGeneratingReport(reportType);
    
    try {
      const dateRange = getDateRange(selectedDateRange);
      const generator = new ReportGenerator(transactions, expenses);
      
      let reportData;
      
      switch (reportType) {
        case 'business-summary':
          reportData = generator.generateBusinessSummary(dateRange);
          break;
        case 'service-performance':
          reportData = generator.generateServicePerformance(dateRange);
          break;
        case 'transaction-history':
          reportData = generator.generateTransactionHistory(dateRange);
          break;
        case 'expense-breakdown':
          reportData = generator.generateExpenseBreakdown(dateRange);
          break;
        case 'high-value-transactions':
          reportData = generator.generateHighValueTransactions(dateRange, 100);
          break;
        case 'expense-anomalies':
          reportData = generator.generateExpenseAnomalies(dateRange);
          break;
        default:
          throw new Error(`Report type ${reportType} not implemented`);
      }
      
      setCurrentReport({ type: reportType, data: reportData });
      
      toast({
        title: 'Report Generated',
        description: 'Your report has been generated successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate report. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setGeneratingReport(null);
    }
  };

  const exportReport = (reportType: string, exportFormat: 'pdf' | 'csv') => {
    if (!currentReport || currentReport.type !== reportType) {
      toast({
        title: 'Error',
        description: 'Please generate the report first before exporting.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const reportConfig = REPORT_CONFIGS.find(r => r.type === reportType);
      const reportName = reportConfig?.name || reportType;
      const fileName = `${reportName.replace(/\s+/g, '_')}_${selectedDateRange}_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
      
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      
      // Header
      doc.setFontSize(20);
      doc.text(reportName, pageWidth / 2, 20, { align: 'center' });
      
      doc.setFontSize(10);
      doc.text(`Generated: ${format(new Date(), 'MMM dd, yyyy')}`, pageWidth / 2, 28, { align: 'center' });
      doc.text(`Period: ${currentReport.data.period || ''}`, pageWidth / 2, 34, { align: 'center' });
      
      let yPosition = 45;
      
      // Generate PDF content based on report type
      if (reportType === 'business-summary') {
        const data = [
          ['Total Revenue', formatCurrency(currentReport.data.totalRevenue || 0)],
          ['Total Expenses', formatCurrency(currentReport.data.totalExpenses || 0)],
          ['Net Profit', formatCurrency(currentReport.data.netProfit || 0)],
          ['Total Customers', currentReport.data.totalCustomers || 0],
          ['Average Transaction Value', formatCurrency(currentReport.data.averageTransactionValue || 0)],
          ['Profit Margin', `${currentReport.data.profitMargin?.toFixed(2) || 0}%`],
        ];
        
        autoTable(doc, {
          startY: yPosition,
          head: [['Metric', 'Value']],
          body: data,
          theme: 'grid',
        });
      } else if (reportType === 'service-performance') {
        const data = currentReport.data.services.map((service: any) => [
          service.name,
          service.count,
          formatCurrency(service.totalRevenue || 0),
          formatCurrency(service.averagePrice || 0),
          `${service.percentage?.toFixed(2) || 0}%`
        ]);
        
        autoTable(doc, {
          startY: yPosition,
          head: [['Service', 'Count', 'Total Revenue', 'Avg Price', 'Percentage']],
          body: data,
          theme: 'grid',
        });
      } else if (reportType === 'transaction-history') {
        const data = currentReport.data.transactions.map((t: any) => [
          t.date,
          t.service,
          formatCurrency(t.amount || 0),
          t.notes || ''
        ]);
        
        autoTable(doc, {
          startY: yPosition,
          head: [['Date', 'Service', 'Amount', 'Notes']],
          body: data,
          theme: 'grid',
        });
      } else if (reportType === 'expense-breakdown') {
        const data = currentReport.data.expenses.map((e: any) => [
          e.date,
          e.type,
          e.description,
          formatCurrency(e.amount || 0)
        ]);
        
        autoTable(doc, {
          startY: yPosition,
          head: [['Date', 'Type', 'Description', 'Amount']],
          body: data,
          theme: 'grid',
        });
      } else if (reportType === 'high-value-transactions') {
        const data = currentReport.data.transactions.map((t: any) => [
          t.date,
          t.service,
          formatCurrency(t.amount || 0),
          t.notes || ''
        ]);
        
        autoTable(doc, {
          startY: yPosition,
          head: [['Date', 'Service', 'Amount', 'Notes']],
          body: data,
          theme: 'grid',
        });
      } else if (reportType === 'expense-anomalies') {
        const data = currentReport.data.anomalies.map((a: any) => [
          a.date,
          a.description,
          formatCurrency(a.amount || 0),
          a.severity,
          a.reason
        ]);
        
        autoTable(doc, {
          startY: yPosition,
          head: [['Date', 'Description', 'Amount', 'Severity', 'Reason']],
          body: data,
          theme: 'grid',
        });
      }
      
      // Save the PDF
      doc.save(fileName);
      
      toast({
        title: "Export Successful",
        description: `${reportName} exported as PDF`,
      });
    } catch (error) {
      console.error('PDF Export Error:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export report. Please try again.",
        variant: "destructive",
      });
    }
  };

  const filteredReports = REPORT_CONFIGS.filter(config => 
    selectedCategory === 'all' || config.category === selectedCategory
  );

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'summary':
        return TrendingUp;
      case 'detailed':
        return FileText;
      case 'exception':
        return AlertTriangle;
      default:
        return FileText;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <FileText className="w-6 h-6" />
        <h1 className="text-2xl font-bold">Business Reports</h1>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Report Filters
          </CardTitle>
          <CardDescription>
            Customize your reports by selecting category and date range
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Report Category</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="summary">Summary Reports</SelectItem>
                  <SelectItem value="detailed">Detailed Reports</SelectItem>
                  <SelectItem value="exception">Exception Reports</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Date Range</label>
              <Select value={selectedDateRange} onValueChange={setSelectedDateRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last7days">Last 7 Days</SelectItem>
                  <SelectItem value="last30days">Last 30 Days</SelectItem>
                  <SelectItem value="last90days">Last 90 Days</SelectItem>
                  <SelectItem value="thisMonth">This Month</SelectItem>
                  <SelectItem value="lastYear">Last Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {['summary', 'detailed', 'exception'].map(category => {
          const categoryReports = REPORT_CONFIGS.filter(r => r.category === category);
          const Icon = getCategoryIcon(category);
          
          return (
            <Card key={category}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Icon className="w-8 h-8 text-muted-foreground" />
                  <div>
                    <div className="text-2xl font-bold">{categoryReports.length}</div>
                    <div className="text-sm text-muted-foreground capitalize">
                      {category} Reports
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReports.map(config => (
          <ReportCard
            key={config.type}
            config={config}
            onGenerate={generateReport}
            onExport={exportReport}
            isGenerating={generatingReport === config.type}
          />
        ))}
      </div>

      {/* Report Viewer Modal */}
      {currentReport && (
        <ReportViewer
          reportData={currentReport.data}
          reportType={currentReport.type}
          onClose={() => setCurrentReport(null)}
          onExport={(format) => exportReport(currentReport.type, format)}
        />
      )}
    </div>
  );
}