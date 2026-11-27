'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { API_BASE_URL } from '@/lib/utils';
import { authFetch } from '@/lib/api';
import {
  Database,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  LoaderCircle,
  Download,
  Copy,
  Check,
  ShieldCheck,
  Play,
  FileCode2,
  Server,
} from 'lucide-react';

interface SchemaTableItem {
  name: string;
  label: string;
  description: string;
  exists: boolean;
  row_count: number;
  checked_columns: string[];
  missing_columns: string[];
  status: 'ok' | 'missing_table' | 'missing_columns' | 'base_table_missing';
}

interface SchemaStatusReport {
  schema_version: string;
  database_name: string;
  mysql_version: string;
  checked_at: string;
  up_to_date: boolean;
  missing_count: number;
  tables: SchemaTableItem[];
  sql_script: string;
}

export default function AdminSystemSchemaPage() {
  const { toast } = useToast();
  const [report, setReport] = useState<SchemaStatusReport | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [showSql, setShowSql] = useState(false);
  const [lastApplied, setLastApplied] = useState<string[]>([]);

  const checkSchemaStatus = useCallback(
    async (notify = false) => {
      setIsChecking(true);
      try {
        const res = await authFetch(`${API_BASE_URL}/system/schema-status/`, { method: 'GET' });
        const json = await res.json().catch(() => null);
        if (!res.ok) {
          throw new Error(json?.error || 'Could not inspect database schema.');
        }
        setReport(json);
        if (notify) {
          toast({
            title: json.up_to_date ? 'Schema Up to Date' : 'Schema Updates Available',
            description: json.up_to_date
              ? 'All tables and extension columns are verified and present.'
              : `${json.missing_count} missing schema item(s) detected.`,
          });
        }
      } catch (err) {
        toast({
          variant: 'destructive',
          title: 'Schema Check Failed',
          description: err instanceof Error ? err.message : 'Unable to reach schema endpoint.',
        });
      } finally {
        setIsChecking(false);
      }
    },
    [toast]
  );

  useEffect(() => {
    checkSchemaStatus(false);
  }, [checkSchemaStatus]);

  const handleRunUpdates = async () => {
    setIsUpdating(true);
    setLastApplied([]);
    try {
      const res = await authFetch(`${API_BASE_URL}/system/schema-update/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        throw new Error(json?.errors?.[0] || json?.error || 'Failed to execute schema updates.');
      }

      if (json.status) {
        setReport(json.status);
      }
      const applied: string[] = Array.isArray(json.applied) ? json.applied : [];
      setLastApplied(applied);

      toast({
        title: applied.length > 0 ? 'Schema Updated Successfully' : 'Already Up to Date',
        description:
          applied.length > 0
            ? `Applied ${applied.length} non-destructive database update(s).`
            : 'No pending database migrations were needed.',
      });
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Migration Error',
        description: err instanceof Error ? err.message : 'Could not run updates.',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCopySql = () => {
    if (!report?.sql_script) return;
    navigator.clipboard.writeText(report.sql_script);
    setCopiedSql(true);
    toast({ title: 'SQL Copied', description: 'Migration script copied to clipboard.' });
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const handleDownloadSql = () => {
    if (!report?.sql_script) return;
    const blob = new Blob([report.sql_script], { type: 'text/sql;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sapphire-trails-schema-${report.schema_version}.sql`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderStatusBadge = (item: SchemaTableItem) => {
    if (item.status === 'ok') {
      return (
        <Badge className="bg-emerald-600 text-white text-[10px] px-2.5 py-0.5 gap-1">
          <CheckCircle2 className="h-3 w-3" /> Installed
        </Badge>
      );
    }
    if (item.status === 'missing_table') {
      return (
        <Badge variant="destructive" className="text-[10px] px-2.5 py-0.5 gap-1">
          <AlertTriangle className="h-3 w-3" /> Missing Table
        </Badge>
      );
    }
    if (item.status === 'missing_columns') {
      return (
        <Badge className="bg-amber-600 text-white text-[10px] px-2.5 py-0.5 gap-1">
          <AlertTriangle className="h-3 w-3" /> Update Needed
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="text-[10px] px-2.5 py-0.5">
        Base Table Missing
      </Badge>
    );
  };

  return (
    <div className="flex flex-col gap-6 pb-12 w-full">
      {/* Executive Command Banner */}
      <section className="relative overflow-hidden rounded-2xl bg-[#08111e] text-white p-6 sm:p-8 border border-primary/25 shadow-sm">
        <div className="absolute -top-24 -right-12 w-80 h-80 bg-primary/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-amber-300/90">
                Database &amp; Migration Engine
              </span>
              {report && (
                <Badge
                  className={
                    report.up_to_date
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px]'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-400/30 text-[10px]'
                  }
                >
                  {report.up_to_date ? 'Up to Date' : `${report.missing_count} Pending Update(s)`}
                </Badge>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-headline font-bold tracking-tight text-white">
              Database Schema &amp; Update Check
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              Runtime DDL checks have been moved out of API requests for maximum speed. Inspect schema health or apply non-destructive updates here anytime after deploying new code.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => checkSchemaStatus(true)}
              disabled={isChecking || isUpdating}
              className="gap-1.5 h-9 px-3.5 rounded-xl border-white/15 bg-white/5 text-slate-200 hover:bg-white/10 hover:text-white text-xs"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isChecking ? 'animate-spin text-amber-300' : ''}`} />
              <span>{isChecking ? 'Checking...' : 'Check for Updates'}</span>
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={handleRunUpdates}
              disabled={isChecking || isUpdating || !report || report.up_to_date}
              className="gap-1.5 h-9 px-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs shadow-sm disabled:opacity-50"
            >
              {isUpdating ? (
                <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Play className="h-3.5 w-3.5" />
              )}
              <span>{isUpdating ? 'Applying Updates...' : 'Apply Schema Updates'}</span>
            </Button>
          </div>
        </div>
      </section>

      {/* Telemetry KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card className="border-border/80 rounded-2xl shadow-sm bg-card">
          <CardContent className="p-5 flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                Schema Version
              </p>
              <p className="text-xl font-headline font-bold text-foreground mt-1">
                {report?.schema_version || '—'}
              </p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 rounded-2xl shadow-sm bg-card">
          <CardContent className="p-5 flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                Active Database
              </p>
              <p className="text-base font-mono font-bold text-foreground mt-1 truncate max-w-[180px]">
                {report?.database_name || 'Loading...'}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5 truncate max-w-[180px]">
                MySQL {report?.mysql_version || '—'}
              </p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Server className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 rounded-2xl shadow-sm bg-card">
          <CardContent className="p-5 flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                Tracked Objects
              </p>
              <p className="text-xl font-headline font-bold text-foreground mt-1">
                {report?.tables.length ?? 0} Tables
              </p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Database className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 rounded-2xl shadow-sm bg-card">
          <CardContent className="p-5 flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                Pending Updates
              </p>
              <p
                className={`text-xl font-headline font-bold mt-1 ${
                  (report?.missing_count ?? 0) > 0
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-emerald-600 dark:text-emerald-400'
                }`}
              >
                {report ? (report.missing_count === 0 ? '0 (Synced)' : report.missing_count) : '—'}
              </p>
            </div>
            <div
              className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                (report?.missing_count ?? 0) > 0
                  ? 'bg-amber-500/10 text-amber-600'
                  : 'bg-emerald-500/10 text-emerald-600'
              }`}
            >
              {(report?.missing_count ?? 0) > 0 ? (
                <AlertTriangle className="h-5 w-5" />
              ) : (
                <CheckCircle2 className="h-5 w-5" />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Applied Migration Banner */}
      {lastApplied.length > 0 && (
        <Card className="border-emerald-500/30 bg-emerald-500/5 rounded-2xl">
          <CardContent className="p-5 space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" /> Last Update Applied Cleanly
            </p>
            <ul className="text-xs text-foreground space-y-1 list-disc list-inside font-mono">
              {lastApplied.map((entry) => (
                <li key={entry}>{entry}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Full-Width Schema Status Table */}
      <Card className="border-border/80 rounded-2xl shadow-sm bg-card">
        <CardHeader className="p-5 sm:p-6 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base sm:text-lg font-headline font-bold">
              Schema Inspection Report
            </CardTitle>
            <CardDescription className="text-xs">
              Live structural check against MySQL INFORMATION_SCHEMA (last checked:{' '}
              {report?.checked_at ? new Date(report.checked_at).toLocaleTimeString() : '—'}).
            </CardDescription>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowSql((prev) => !prev)}
              className="rounded-xl text-xs h-8 px-3 gap-1.5"
            >
              <FileCode2 className="h-3.5 w-3.5 text-primary" />
              <span>{showSql ? 'Hide SQL Script' : 'Inspect .SQL Script'}</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopySql}
              disabled={!report?.sql_script}
              className="rounded-xl text-xs h-8 px-3 gap-1.5"
            >
              {copiedSql ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
              <span>Copy SQL</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDownloadSql}
              disabled={!report?.sql_script}
              className="rounded-xl text-xs h-8 px-3 gap-1.5"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download .sql</span>
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {isChecking && !report ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3 text-muted-foreground">
              <LoaderCircle className="h-7 w-7 animate-spin text-primary" />
              <p className="text-xs">Inspecting database tables and columns...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6 text-xs">Table</TableHead>
                    <TableHead className="text-xs">Purpose</TableHead>
                    <TableHead className="text-xs text-right">Rows</TableHead>
                    <TableHead className="text-xs">Extension Columns</TableHead>
                    <TableHead className="pr-6 text-xs text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {report?.tables.map((item) => (
                    <TableRow key={item.name} className="text-xs">
                      <TableCell className="pl-6 font-mono font-bold text-foreground whitespace-nowrap">
                        {item.name}
                      </TableCell>
                      <TableCell className="min-w-[240px]">
                        <p className="font-semibold text-foreground">{item.label}</p>
                        <p className="text-[11px] text-muted-foreground">{item.description}</p>
                      </TableCell>
                      <TableCell className="text-right font-mono text-muted-foreground">
                        {item.exists ? item.row_count.toLocaleString() : '—'}
                      </TableCell>
                      <TableCell>
                        {item.checked_columns.length === 0 ? (
                          <span className="text-[11px] text-muted-foreground">Full Table Definition</span>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {item.checked_columns.map((col) => {
                              const isMissing = item.missing_columns.includes(col);
                              return (
                                <span
                                  key={col}
                                  className={`px-2 py-0.5 rounded-md font-mono text-[10px] border ${
                                    isMissing
                                      ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30 font-bold'
                                      : 'bg-muted/50 text-muted-foreground border-border/60'
                                  }`}
                                >
                                  {col}
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="pr-6 text-right">{renderStatusBadge(item)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Expandable SQL Reference Panel */}
      {showSql && report?.sql_script && (
        <Card className="border-border/80 rounded-2xl shadow-sm bg-[#08111e] text-slate-200 overflow-hidden">
          <CardHeader className="p-5 pb-3 border-b border-white/10">
            <CardTitle className="text-sm font-headline font-bold text-amber-300 flex items-center gap-2">
              <FileCode2 className="h-4 w-4" />
              <span>server/database/schema_migrations.sql</span>
            </CardTitle>
            <CardDescription className="text-xs text-slate-400">
              Use this standalone SQL script in phpMyAdmin if your shared host disables DDL permissions on the runtime DB user.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <pre className="p-5 text-[11px] leading-relaxed font-mono overflow-x-auto max-h-[420px] admin-scrollbar text-slate-200">
              {report.sql_script}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
