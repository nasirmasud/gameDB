import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import mongoose from "mongoose";
import Link from "next/link";
import {
  ArrowLeft,
  Wifi,
  Database,
  HardDrive,
  Activity,
  Server,
  Cpu,
  Clock,
} from "lucide-react";
import os from "os";

export default async function SystemStatusPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    redirect("/login");
  }

  let dbStatus = "Disconnected";
  let dbName = "—";
  let collectionCounts: Array<{ name: string; count: number }> = [];

  try {
    await connectDB();
    const admin = mongoose.connection.db?.admin();
    if (admin) {
      dbStatus = "Connected";

      const ping = await admin.ping();
      if (!ping || ping.ok !== 1) {
        dbStatus = "Unreachable";
      }
    }

    dbName = mongoose.connection.db?.databaseName ?? "—";

    if (mongoose.connection.db) {
      const collections = await mongoose.connection.db.listCollections().toArray();
      for (const col of collections) {
        const count = await mongoose.connection.db
          .collection(col.name)
          .countDocuments();
        collectionCounts.push({ name: col.name, count });
      }
    }
  } catch {
    dbStatus = "Disconnected";
  }

  const uptime = process.uptime();
  const uptimeDays = Math.floor(uptime / 86400);
  const uptimeHours = Math.floor((uptime % 86400) / 3600);
  const uptimeMins = Math.floor((uptime % 3600) / 60);
  const uptimeStr =
    uptimeDays > 0
      ? `${uptimeDays}d ${uptimeHours}h ${uptimeMins}m`
      : uptimeHours > 0
        ? `${uptimeHours}h ${uptimeMins}m`
        : `${uptimeMins}m`;

  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  const memPercent = totalMem > 0 ? Math.round((usedMem / totalMem) * 100) : 0;
  const memStr = `${(usedMem / 1024 / 1024 / 1024).toFixed(1)} GB / ${(totalMem / 1024 / 1024 / 1024).toFixed(1)} GB`;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/admin/dashboard"
          className="flex items-center gap-1 rounded-lg border border-border bg-card px-3 py-2 text-sm hover:bg-secondary"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">System Status</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Real-time server and database health overview.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
            <Server className="h-5 w-5 text-blue-400" /> Server
          </h2>
          <div className="flex flex-col gap-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-muted-foreground">
                <Wifi className="h-4 w-4" /> Status
              </span>
              <span className="font-medium text-green-400">Operational</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" /> Uptime
              </span>
              <span className="font-medium">{uptimeStr}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-muted-foreground">
                <Cpu className="h-4 w-4" /> Platform
              </span>
              <span className="font-medium">{os.platform()} ({os.arch()})</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-muted-foreground">
                <Cpu className="h-4 w-4" /> Node.js
              </span>
              <span className="font-medium">{process.version}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-muted-foreground">
                <span className="h-4 w-4" />
                Environment
              </span>
              <span className="font-medium">{process.env.NODE_ENV ?? "development"}</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
            <HardDrive className="h-5 w-5 text-purple-400" /> Memory
          </h2>
          <div className="flex flex-col gap-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-muted-foreground">
                <HardDrive className="h-4 w-4" /> Usage
              </span>
              <span className="font-medium">{memStr}</span>
            </div>
            <div>
              <div className="mb-1.5 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{memPercent}% used</span>
                <span className="text-muted-foreground">
                  {100 - memPercent}% free
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-secondary">
                <div
                  className={`h-full rounded-full transition-all ${
                    memPercent > 80
                      ? "bg-red-500"
                      : memPercent > 60
                        ? "bg-yellow-500"
                        : "bg-green-500"
                  }`}
                  style={{ width: `${memPercent}%` }}
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-muted-foreground">
                <Activity className="h-4 w-4" /> Load Average
              </span>
              <span className="font-medium">
                {os.loadavg()[0].toFixed(2)} /
                {os.loadavg()[1].toFixed(2)} /
                {os.loadavg()[2].toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
            <Database className="h-5 w-5 text-green-400" /> Database
          </h2>
          <div className="flex flex-col gap-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-muted-foreground">
                <Database className="h-4 w-4" /> Status
              </span>
              <span
                className={`font-medium ${
                  dbStatus === "Connected" ? "text-green-400" : "text-red-400"
                }`}
              >
                {dbStatus}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-muted-foreground">
                <Database className="h-4 w-4" /> Database
              </span>
              <span className="font-medium">{dbName}</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
            <Database className="h-5 w-5 text-cyan-400" /> Collections
          </h2>
          <div className="flex flex-col gap-2 text-sm">
            {collectionCounts.length === 0 && (
              <p className="text-muted-foreground">No collections found.</p>
            )}
            {collectionCounts.map((c) => (
              <div
                key={c.name}
                className="flex items-center justify-between rounded-lg bg-secondary/50 px-3 py-2"
              >
                <span className="font-medium capitalize">
                  {c.name.replace(/[_-]/g, " ")}
                </span>
                <span className="text-muted-foreground">
                  {c.count.toLocaleString()} documents
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
