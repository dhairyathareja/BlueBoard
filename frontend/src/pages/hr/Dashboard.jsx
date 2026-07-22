import React, { useEffect, useState } from 'react';
import { FiUsers, FiUserCheck, FiClock, FiCloud, FiFileText, FiAlertCircle } from 'react-icons/fi';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import StatsCard from '../../components/ui/StatsCard';
import PageHeader from '../../components/layout/PageHeader';
import Loader from '../../components/ui/Loader';
import employeeService from '../../services/employee.service';
import awsService from '../../services/aws.service';
import documentService from '../../services/document.service';

const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

const HRDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [awsCount, setAwsCount] = useState(0);
  const [docStats, setDocStats] = useState({ total: 0, pending: 0 });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // 1. Fetch main dashboard stats
        const statsRes = await employeeService.getDashboardStats();
        setStats(statsRes.dashboard || null);

        // 2. Fetch employee list for dynamic distributions
        const listRes = await employeeService.getList({ limit: 100 });
        const empList = listRes.employeeList || [];
        setEmployees(empList);

        // 3. Fetch AWS profiles count
        const awsRes = await awsService.getList({ limit: 1 });
        setAwsCount(awsRes.totalProfiles || 0);

        // 4. Fetch documents to compute Uploaded vs Pending
        const docRes = await documentService.getList({ limit: 100 });
        const docs = docRes.documentList || [];
        
        // Let's count pending docs: employees who have onboardingStatus = "Documents Pending"
        const employeesPendingDocs = empList.filter(e => e.onboardingStatus === 'Documents Pending').length;
        
        setDocStats({
          total: docRes.totalDocuments || docs.length,
          pending: employeesPendingDocs
        });

      } catch (error) {
        console.error('Error fetching dashboard metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <Loader />;
  }

  // Calculate Department Distribution
  const deptCounts = employees.reduce((acc, emp) => {
    const dept = emp.department || 'Unassigned';
    acc[dept] = (acc[dept] || 0) + 1;
    return acc;
  }, {});
  const departmentData = Object.keys(deptCounts).map(dept => ({
    name: dept,
    value: deptCounts[dept]
  }));

  // Calculate Employee Status
  const statusCounts = employees.reduce((acc, emp) => {
    const status = emp.status || 'Pending';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});
  const statusData = Object.keys(statusCounts).map(status => ({
    name: status,
    value: statusCounts[status]
  }));

  // Calculate Onboarding Status Distribution
  const onboardCounts = employees.reduce((acc, emp) => {
    const obs = emp.onboardingStatus || 'Pending';
    acc[obs] = (acc[obs] || 0) + 1;
    return acc;
  }, {});
  const onboardingData = Object.keys(onboardCounts).map(obs => ({
    name: obs,
    value: onboardCounts[obs]
  }));

  
  // ================= Employee Onboarding Trend =================

  const sortedEmployees = [...employees].sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
  );

  const dailyData = {};

  sortedEmployees.forEach(employee => {

      const date = new Date(employee.createdAt);

      const day = date.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short"
      });

      if (!dailyData[day]) {

          dailyData[day] = {
              day,
              completed: 0,
              pending: 0
          };

      }

      if (employee.onboardingStatus === "Completed") {

          dailyData[day].completed++;

      } else {

          dailyData[day].pending++;

      }

  });

  const timelineData = [];

  let completedTotal = 0;
  let pendingTotal = 0;

  Object.values(dailyData).forEach(item => {

      completedTotal += item.completed;
      pendingTotal += item.pending;

      timelineData.push({

          day: item.day,

          completed: completedTotal,

          pending: pendingTotal

      });

  });



  return (
    <div style={{ padding: '32px', position: 'relative' }}>
      <PageHeader
        title="Enterprise Onboarding Overview"
        subtitle="Track recruitment pipelines, AWS IAM profiles, and employee document checks."
      />

      {/* Stats Cards Grid */}
      <div className="dashboard-grid">
        <StatsCard
          title="Total Employees"
          value={stats?.totalEmployee || 0}
          icon={FiUsers}
          description="In directory"
          trend="+4"
        />
        <StatsCard
          title="Active Employees"
          value={stats?.activeEmployee || 0}
          icon={FiUserCheck}
          description="Fully onboarded"
          trend="+3"
        />
        <StatsCard
          title="Pending Onboarding"
          value={stats?.pendingOnboarding || 0}
          icon={FiClock}
          description="Awaiting completion"
          trend="-2"
          trendType="negative"
        />
        <StatsCard
          title="AWS Profiles"
          value={awsCount}
          icon={FiCloud}
          description="IAM Accounts active"
          trend="+5"
        />
        <StatsCard
          title="Uploaded Documents"
          value={docStats.total}
          icon={FiFileText}
          description="Validated in S3"
          trend="+12"
        />
        <StatsCard
          title="Pending Documents"
          value={docStats.pending}
          icon={FiAlertCircle}
          description="Actions required"
          trend="Needs check"
          trendType="negative"
        />
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        
        {/* Department Distribution (Bar Chart) */}
        <div className="glass-card" style={{ padding: '24px', minHeight: '380px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '20px', fontFamily: 'var(--font-display)' }}>
            Department Distribution
          </h3>
          <div style={{ width: '100%', height: '280px' }}>
            {departmentData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                  <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--bg-secondary)',
                      borderColor: 'var(--border-color)',
                      borderRadius: '8px',
                      color: 'var(--text-primary)'
                    }}
                  />
                  <Bar dataKey="value" fill="var(--primary)" radius={[4, 4, 0, 0]}>
                    {departmentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                No department data available
              </div>
            )}
          </div>
        </div>

        {/* Employee Status (Pie Chart) */}
        <div className="glass-card" style={{ padding: '24px', minHeight: '380px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '20px', fontFamily: 'var(--font-display)' }}>
            Employee Status Allocation
          </h3>
          <div style={{ width: '100%', height: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {statusData.length > 0 ? (
              <div style={{ width: '100%', height: '100%', display: 'flex' }}>
                <ResponsiveContainer width="60%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: 'var(--bg-secondary)',
                        borderColor: 'var(--border-color)',
                        borderRadius: '8px',
                        color: 'var(--text-primary)'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Legend */}
                <div style={{ width: '40%', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '12px' }}>
                  {statusData.map((entry, index) => (
                    <div key={entry.name} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '3px',
                        backgroundColor: COLORS[index % COLORS.length]
                      }} />
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {entry.name} ({entry.value})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ color: 'var(--text-muted)' }}>
                No status data available
              </div>
            )}
          </div>
        </div>

        {/* Onboarding Progress Trend (Area Chart) */}
        <div className="glass-card" style={{ padding: '24px', minHeight: '380px', gridColumn: 'span 2' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '20px', fontFamily: 'var(--font-display)' }}>
            Employee Onboarding Trend
          </h3>
          <div style={{ width: '100%', height: '280px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--success)" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="var(--success)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPending" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis
                    dataKey="day"
                    stroke="var(--text-muted)"
                    fontSize={11}
                    tickLine={false}
                />
                <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--bg-secondary)',
                    borderColor: 'var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)'
                  }}
                />
                <Area type="monotone" dataKey="completed" name="Completed Onboardings" stroke="var(--success)" fillOpacity={1} fill="url(#colorCompleted)" />
                <Area type="monotone" dataKey="pending" name="In Progress" stroke="var(--primary)" fillOpacity={1} fill="url(#colorPending)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};

export default HRDashboard;
