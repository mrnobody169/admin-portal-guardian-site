
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Database, List } from 'lucide-react';

const Dashboard = () => {
  const stats = [
    {
      title: "User Accounts",
      value: "24",
      description: "Total registered users",
      icon: Users,
      change: "+3 this week"
    },
    {
      title: "Bank Accounts",
      value: "36",
      description: "Registered bank accounts",
      icon: Database,
      change: "+5 this week"
    },
    {
      title: "System Logs",
      value: "1,254",
      description: "Total event logs",
      icon: List,
      change: "+48 today"
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">Welcome to your admin dashboard.</p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
                <div className="mt-2 flex items-center text-xs text-success">
                  {stat.change}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent User Activity</CardTitle>
            <CardDescription>Latest user logins and activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Activity</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>john.doe</td>
                    <td>Login</td>
                    <td>5 mins ago</td>
                  </tr>
                  <tr>
                    <td>jane.smith</td>
                    <td>Password Change</td>
                    <td>1 hour ago</td>
                  </tr>
                  <tr>
                    <td>mike.jones</td>
                    <td>Login</td>
                    <td>3 hours ago</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>Current system health and metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm">API Status</span>
                <span className="status-badge status-badge-success">Operational</span>
              </div>
              <div className="h-2 bg-secondary rounded-full">
                <div className="h-2 bg-success rounded-full" style={{ width: "98%" }}></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm">Database</span>
                <span className="status-badge status-badge-success">Operational</span>
              </div>
              <div className="h-2 bg-secondary rounded-full">
                <div className="h-2 bg-success rounded-full" style={{ width: "95%" }}></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm">Storage</span>
                <span className="status-badge status-badge-warning">High Load</span>
              </div>
              <div className="h-2 bg-secondary rounded-full">
                <div className="h-2 bg-warning rounded-full" style={{ width: "82%" }}></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
