"use client";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getDevices } from "@/lib/deviceMonitor";
import { getActivityLogs } from "@/lib/activityLogs";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import MetricCard from "../common/MetricCard";
import Text from "@/components/text/Text";
import { dashboardTexts } from "@/texts/dashboard/dashboard";
import { Laptop, LogsIcon, RecycleIcon, ShieldQuestion } from "lucide-react";
import NoDevicesFound from "../common/NoDeviceFound";
import Link from "next/link";
import { getRecoveryList } from "@/lib/fileRecovery";
import { deviceListTexts } from "@/texts/device/device-list";

const OrganizationDashboard = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["devices", 0, 10],
    queryFn: () => getDevices(0, 10),
  });
  const [totalActivityLogs, setTotalActivityLogs] = useState(0);
  const [totalRecoveryList, setTotalRecoveryList] = useState(0);
  const [deviceHealthCounts, setDeviceHealthCounts] = useState({
    Healthy: 0,
    AtRisk: 0,
    Critical: 0,
    UnKnown: 0,
  });

  const [activitySeverityCounts, setActivitySeverityCounts] = useState({
    Critical: 0,
    High: 0,
    Medium: 0,
    Low: 0,
  });

  const [recoveryStatusCounts, setRecoveryStatusCounts] = useState({
    Pending: 0,
    InProgress: 0,
    Completed: 0,
    Failed: 0,
    Queued: 0,
  });

  const router = useRouter();

  useEffect(() => {
    if (data?.devices) {
      const healthCounts = data?.devices.reduce(
        (counts, device) => {
          const health = device?.health?.toLowerCase();
          if (health === "healthy") counts.Healthy++;
          else if (health === "at risk" || health === "at_risk")
            counts.AtRisk++;
          else if (health === "critical") counts.Critical++;
          else if (health === "unknown") counts.UnKnown++;

          return counts;
        },
        { Healthy: 0, AtRisk: 0, Critical: 0, UnKnown: 0 }
      );

      setDeviceHealthCounts(healthCounts);
    }
  }, [data]);

  useEffect(() => {
    const fetchActivityLogs = async () => {
      const logsData = await getActivityLogs();

      const severityCounts = logsData?.logs.reduce(
        (counts, log) => {
          const severity = log.severity?.toLowerCase();
          if (severity === "critical") counts.Critical++;
          else if (severity === "high") counts.High++;
          else if (severity === "medium") counts.Medium++;
          else if (severity === "low") counts.Low++;
          return counts;
        },
        { Critical: 0, High: 0, Medium: 0, Low: 0 }
      );

      setTotalActivityLogs(logsData?.total || 0);
      setActivitySeverityCounts(severityCounts);
    };

    fetchActivityLogs();
  }, []);

  useEffect(() => {
    const fetchRecoveryStatus = async () => {
      const recoveryData = await getRecoveryList();

      const statusCounts = recoveryData?.recoveries.reduce(
        (counts, recovery) => {
          const status = recovery.status?.toLowerCase();
          if (status === "pending") counts.Pending++;
          else if (status === "in progress") counts.InProgress++;
          else if (status === "completed") counts.Completed++;
          else if (status === "failed") counts.Failed++;
          else if (status === "queued") counts.Queued++;
          return counts;
        },
        { Pending: 0, InProgress: 0, Completed: 0, Failed: 0, Queued: 0 }
      );
      setTotalRecoveryList(recoveryData?.total || 0);
      setRecoveryStatusCounts(statusCounts);
    };

    fetchRecoveryStatus();
  }, []);

  const deviceData = [
    { status: "Healthy", count: deviceHealthCounts.Healthy, color: "#198754" },
    {
      status: "At Risk",
      count: deviceHealthCounts.AtRisk,
      color: "#FFC107",
    },
    {
      status: "Critical",
      count: deviceHealthCounts.Critical,
      color: "#DC3545",
    },
    { status: "Unknown", count: deviceHealthCounts.UnKnown, color: "#6c757d" },
  ];

  const severityData = [
    {
      status: "Critical",
      count: activitySeverityCounts?.Critical,
      color: "#DC3545",
    },
    { status: "High", count: activitySeverityCounts?.High, color: "#F68D2B" },
    {
      status: "Medium",
      count: activitySeverityCounts?.Medium,
      color: "#FFC107",
    },
    { status: "Low", count: activitySeverityCounts?.Low, color: "#198754" },
  ];

  const recoveryData = [
    {
      status: "Pending",
      count: recoveryStatusCounts?.Pending,
      color: "#FFC107",
    },
    {
      status: "In Progress",
      count: recoveryStatusCounts?.InProgress,
      color: "#F68D2B",
    },
    {
      status: "Completed",
      count: recoveryStatusCounts?.Completed,
      color: "#198754",
    },
    { status: "Failed", count: recoveryStatusCounts?.Failed, color: "#DC3545" },
    { status: "Queued", count: recoveryStatusCounts?.Queued, color: "#00aaff" },
  ];

  const handlePieClick = (entry: { status: string }) => {
    const status = entry.status.toLowerCase().replace(/\s/g, "_");
    router.push(`/device-monitor?health=${status}`);
  };

  const handleSeverityClick = (entry: { status: string }) => {
    const severity = entry.status.toLowerCase().replace(/\s/g, "_");
    router.push(`/activity-logs?severity=${severity}`);
  };

  const handleRecoveryClick = (entry: { status: string }) => {
    const status = entry.status.toLowerCase().replace(/\s/g, "_");
    router.push(`/recovery?status=${status}`);
  };
  const totalDevices = data?.total || 0;

  const CustomTooltip = ({ active, payload, labelKey }: any) => {
    if (active && payload && payload.length) {
      const { [labelKey]: label, count } = payload[0].payload;
      return (
        <div className="custom-tooltip p-2 bg-white border border-gray-200 rounded shadow-sm">
          <p className="text-sm font-medium">
            {label}: {count}
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="flex flex-wrap justify-center space-x-4">
        {payload?.map((entry: any, index: number) => (
          <div key={`legend-item-${index}`} className="flex items-center">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: entry?.color }}
            ></div>
            <span className="ml-2 text-sm">
              {entry?.payload?.status}: {entry?.payload?.count}
            </span>
          </div>
        ))}
      </div>
    );
  };

  const CustomLegendForRecovery = () => {
    return (
      <div className="flex flex-wrap justify-center space-x-4 pt-5">
        {recoveryData?.map((entry: any, index: number) => (
          <div key={`legend-item-${index}`} className="flex items-center">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: entry?.color }}
            ></div>
            <span className="ml-2 text-sm">
              {entry.status}: {entry?.count}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        <Text text={dashboardTexts.organizationDashboardTitle} />
      </h1>

      {data?.devices?.length ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link href="/device-monitor">
              <MetricCard
                title={dashboardTexts.totalDevices}
                value={isLoading ? "Loading..." : totalDevices.toString()}
                icon={<Laptop className="h-6 w-6" />}
                description={dashboardTexts.registeredDevices}
              />
            </Link>
            <Link href="/activity-logs">
              <MetricCard
                title={dashboardTexts.totalActivityLogs}
                value={isLoading ? "Loading..." : totalActivityLogs.toString()}
                icon={<LogsIcon className="h-6 w-6" />}
                description={dashboardTexts.totalActivityLogsDesc}
              />
            </Link>
            <Link href="/recovery">
              <MetricCard
                title={dashboardTexts.totalRecoveries}
                value={isLoading ? "Loading..." : totalRecoveryList.toString()}
                icon={<RecycleIcon className="h-6 w-6" />}
                description={dashboardTexts.totalRecoveriesDesc}
              />
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {totalDevices > 0 && (
              <Card>
                <CardHeader className="flex flex-row justify-between">
                  <CardTitle className="text-xl font-semibold">
                    <Text text={dashboardTexts.deviceHealthStatus} />
                  </CardTitle>
                  <Link
                    href="/device-monitor"
                    className="block py-2 px-4 border border-memcryptRed text-sm font-medium rounded-md text-memcryptRed hover:bg-memcryptLightRed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-memcryptRed transition-colors duration-200"
                  >
                    View Details
                  </Link>
                </CardHeader>
                <CardContent>
                  {data?.devices?.every(
                    (device) => device.health?.toLowerCase() === "unknown"
                  ) ? (
                    <div className="text-center text-gray-600 text-sm p-10">
                      <ShieldQuestion className="mx-auto h-16 w-16 text-[#C02427] mb-4" />{" "}
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        <Text text={dashboardTexts.noDevicesWithStatus} />
                      </h3>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={deviceData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="count"
                          label={({ index, percent }) =>
                            index !== undefined && percent > 0
                              ? `${deviceData[index].status} ${(
                                  (percent ?? 0) * 100
                                ).toFixed(0)}%`
                              : ""
                          }
                          onClick={(data, index) =>
                            handlePieClick(deviceData[index])
                          }
                        >
                          {deviceData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          content={<CustomTooltip labelKey="status" />}
                        />
                        <Legend content={<CustomLegend />} />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            )}

            {totalActivityLogs > 0 && (
              <Card>
                <CardHeader className="flex flex-row justify-between">
                  <CardTitle className="text-xl font-semibold">
                    <Text text={dashboardTexts.activityStatus} />
                  </CardTitle>
                  <Link
                    href="/activity-logs"
                    className="block py-2 px-4 border border-memcryptRed text-sm font-medium rounded-md text-memcryptRed hover:bg-memcryptLightRed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-memcryptRed transition-colors duration-200"
                  >
                    View Details
                  </Link>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={severityData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                        label={({ index, percent }) =>
                          index !== undefined && percent > 0
                            ? `${severityData[index].status} ${(
                                (percent ?? 0) * 100
                              ).toFixed(1)}%`
                            : ""
                        }
                        onClick={(data, index) =>
                          handleSeverityClick(severityData[index])
                        }
                      >
                        {severityData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip labelKey="status" />} />
                      <Legend content={<CustomLegend />} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </div>
          {totalRecoveryList > 0 && (
            <Card>
              <CardHeader className="flex flex-row justify-between">
                <CardTitle className="text-xl font-semibold">
                  <Text text={dashboardTexts.recoveryStatus} />
                </CardTitle>
                <Link
                  href="/recovery"
                  className="block py-2 px-4 border border-memcryptRed text-sm font-medium rounded-md text-memcryptRed hover:bg-memcryptLightRed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-memcryptRed transition-colors duration-200"
                >
                  View Details
                </Link>
              </CardHeader>

              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={recoveryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="status" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip labelKey="status" />} />
                    <Bar
                      dataKey="count"
                      barSize={50}
                      onClick={(data, index) =>
                        handleRecoveryClick(recoveryData[index])
                      }
                    >
                      {recoveryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                    <Legend content={<CustomLegendForRecovery />} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        <div className="text-center py-4">
          <div className="text-lg text-gray-600">
            <NoDevicesFound />
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizationDashboard;
