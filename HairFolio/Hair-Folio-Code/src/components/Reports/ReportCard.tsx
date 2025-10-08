import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Eye } from 'lucide-react';
import { ReportConfig } from '@/types/reports';

interface ReportCardProps {
  config: ReportConfig;
  onGenerate: (reportType: string) => void;
  onExport: (reportType: string, format: 'pdf' | 'csv') => void;
  isGenerating?: boolean;
}

export function ReportCard({ config, onGenerate, onExport, isGenerating }: ReportCardProps) {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'summary':
        return 'border-blue-200 bg-blue-50';
      case 'detailed':
        return 'border-green-200 bg-green-50';
      case 'exception':
        return 'border-orange-200 bg-orange-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const getCategoryBadge = (category: string) => {
    const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium';
    switch (category) {
      case 'summary':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'detailed':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'exception':
        return `${baseClasses} bg-orange-100 text-orange-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  return (
    <Card className={`transition-all hover:shadow-md ${getCategoryColor(config.category)}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-1">{config.name}</CardTitle>
            <div className={getCategoryBadge(config.category)}>
              {config.category.toUpperCase()}
            </div>
          </div>
        </div>
        <CardDescription className="text-sm text-muted-foreground mt-2">
          {config.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex gap-2">
          <Button
            onClick={() => onGenerate(config.type)}
            disabled={isGenerating}
            className="flex-1"
            variant="outline"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin mr-2" />
                Generating...
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 mr-2" />
                Generate
              </>
            )}
          </Button>
          <Button
            onClick={() => onExport(config.type, 'pdf')}
            variant="outline"
            size="icon"
            title="Export as PDF"
          >
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}