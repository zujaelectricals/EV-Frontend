import { motion } from 'framer-motion';
import { ScrollText, Search, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const AuditLogs = () => {
  const logs = [
    { id: 1, action: 'User Login', user: 'admin@zuja.com', timestamp: '2024-01-15 10:30:45', ip: '192.168.1.1', status: 'success' },
    { id: 2, action: 'Payout Processed', user: 'admin@zuja.com', timestamp: '2024-01-15 09:15:22', ip: '192.168.1.1', status: 'success' },
    { id: 3, action: 'Vehicle Added', user: 'admin@zuja.com', timestamp: '2024-01-15 08:45:10', ip: '192.168.1.1', status: 'success' },
    { id: 4, action: 'Failed Login Attempt', user: 'unknown@example.com', timestamp: '2024-01-15 08:20:33', ip: '192.168.1.100', status: 'failed' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Audit Logs</h1>
          <p className="text-muted-foreground mt-1">View system activity and audit trail</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search logs..." className="pl-10 w-64" />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Activity Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {logs.map((log) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-foreground">{log.action}</h3>
                    <Badge variant={log.status === 'success' ? 'default' : 'destructive'}>
                      {log.status}
                    </Badge>
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground space-y-1">
                    <p>User: {log.user}</p>
                    <p>IP: {log.ip}</p>
                    <p>Time: {log.timestamp}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

