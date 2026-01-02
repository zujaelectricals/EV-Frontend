import { motion } from 'framer-motion';
import { FileText, Download, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export const StaffReports = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reports</h1>
          <p className="text-muted-foreground mt-1">Generate and view performance reports</p>
        </div>
        <Button>
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Generate Report
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium mb-2 block">Start Date</label>
                <Input type="date" />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">End Date</label>
                <Input type="date" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Report Type</label>
              <select className="w-full px-3 py-2 border rounded-lg bg-background">
                <option>Sales Report</option>
                <option>Lead Report</option>
                <option>Performance Report</option>
                <option>Revenue Report</option>
              </select>
            </div>
            <Button className="w-full">
              <FileText className="w-4 h-4 mr-2" />
              Generate Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

