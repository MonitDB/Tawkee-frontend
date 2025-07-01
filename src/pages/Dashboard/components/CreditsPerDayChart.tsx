import { useTheme } from '@mui/material/styles';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { LineChart } from '@mui/x-charts/LineChart';
import { CurveType } from '@mui/x-charts/models';
import { Box } from '@mui/material';
import { Fragment, useMemo } from 'react';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

dayjs.extend(isSameOrBefore);

type AgentCredits = {
  agentId: string;
  agentName: string;
  credits: number;
};

type WorkspaceCredits = {
  workspaceId: string;
  workspaceName: string;
  credits: number;
};

type AgentCreditEntry = {
  date: string;
  totalCredits: number;
  creditsByAgent: AgentCredits[];
};

type WorkspaceCreditEntry = {
  date: string;
  totalCredits: number;
  creditsByWorkspace: WorkspaceCredits[];
};

type CreditsPerDayChartProps = {
  data: AgentCreditEntry[] | WorkspaceCreditEntry[];
  startDate: string;
  endDate: string;
  mode?: 'agent' | 'workspace';
};

function AreaGradient({ color, id }: { color: string; id: string }) {
  return (
    <defs>
      <linearGradient id={id} x1="50%" y1="0%" x2="50%" y2="100%">
        <stop offset="0%" stopColor={color} stopOpacity={0.5} />
        <stop offset="100%" stopColor={color} stopOpacity={0} />
      </linearGradient>
    </defs>
  );
}

function formatRelative(dateStr: string): string {
  const today = new Date();
  const target = new Date(`${dateStr}T00:00:00Z`);
  const diffTime = today.getTime() - target.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays > 1 && diffDays < 7) return `${diffDays} days ago`;
  return '';
}

function generateDateRange(startDate: string, endDate: string): string[] {
  const start = dayjs(startDate);
  const end = dayjs(endDate);
  const range: string[] = [];

  for (let d = start; d.isSameOrBefore(end); d = d.add(1, 'day')) {
    range.push(d.format('YYYY-MM-DD'));
  }

  return range;
}

function isAgentCreditEntry(entry: any): entry is AgentCreditEntry {
  return 'creditsByAgent' in entry;
}

function fillMissingDatesAgent(
  data: AgentCreditEntry[],
  startDate: string,
  endDate: string
): AgentCreditEntry[] {
  const fullRange = generateDateRange(startDate, endDate);
  const known = new Map(data.map((d) => [d.date, d]));

  const allAgents = Array.from(
    new Set(data.flatMap((d) => d.creditsByAgent.map((c) => c.agentId)))
  );

  const agentIdToName: Record<string, string> = {};
  data.forEach((d) =>
    d.creditsByAgent.forEach(({ agentId, agentName }) => {
      agentIdToName[agentId] = agentName;
    })
  );

  return fullRange.map((date) => {
    return (
      known.get(date) || {
        date,
        totalCredits: 0,
        creditsByAgent: allAgents.map((agentId) => ({
          agentId,
          agentName: agentIdToName[agentId] || 'Unknown',
          credits: 0,
        })),
      }
    );
  });
}

function fillMissingDatesWorkspace(
  data: WorkspaceCreditEntry[],
  startDate: string,
  endDate: string
): WorkspaceCreditEntry[] {
  const fullRange = generateDateRange(startDate, endDate);
  const known = new Map(data.map((d) => [d.date, d]));

  const allWorkspaces = Array.from(
    new Set(data.flatMap((d) => d.creditsByWorkspace.map((c) => c.workspaceId)))
  );

  const workspaceIdToName: Record<string, string> = {};
  data.forEach((d) =>
    d.creditsByWorkspace.forEach(({ workspaceId, workspaceName }) => {
      workspaceIdToName[workspaceId] = workspaceName;
    })
  );

  return fullRange.map((date) => {
    return (
      known.get(date) || {
        date,
        totalCredits: 0,
        creditsByWorkspace: allWorkspaces.map((workspaceId) => ({
          workspaceId,
          workspaceName: workspaceIdToName[workspaceId] || 'Unknown',
          credits: 0,
        })),
      }
    );
  });
}

export default function CreditsPerDayChart({
  data,
  startDate,
  endDate,
  mode,
}: CreditsPerDayChartProps) {
  const theme = useTheme();
  
  // Auto-detect mode if not provided
  const detectedMode = useMemo(() => {
    if (mode) return mode;
    if (data.length === 0) return 'agent';
    return isAgentCreditEntry(data[0]) ? 'agent' : 'workspace';
  }, [mode, data]);

  const adjustedData = useMemo(() => {
    if (detectedMode === 'agent') {
      return fillMissingDatesAgent(data as AgentCreditEntry[], startDate, endDate);
    } else {
      return fillMissingDatesWorkspace(data as WorkspaceCreditEntry[], startDate, endDate);
    }
  }, [data, startDate, endDate, detectedMode]);

  const labels = useMemo(() => {
    return adjustedData.map((d) => d.date);
  }, [adjustedData]);

  const { allEntityIds, series } = useMemo(() => {
    if (detectedMode === 'agent') {
      const agentData = adjustedData as AgentCreditEntry[];
      
      const allAgentIds = Array.from(
        new Set(
          agentData.flatMap((entry) => 
            entry.creditsByAgent.map((agent) => agent.agentId)
          )
        )
      );

      const agentIdToNameMap = new Map<string, string>();
      agentData.forEach((entry) => {
        entry.creditsByAgent.forEach(({ agentId, agentName }) => {
          if (!agentIdToNameMap.has(agentId)) {
            agentIdToNameMap.set(agentId, agentName);
          }
        });
      });

      const agentSeries = allAgentIds.map((agentId) => {
        const agentSeriesData = agentData.map(
          (entry) =>
            entry.creditsByAgent.find((c) => c.agentId === agentId)?.credits ?? 0
        );

        const agentName = agentIdToNameMap.get(agentId) || 'Unknown';

        return {
          id: agentId,
          label: `Agent ${agentName}`,
          data: agentSeriesData,
          showMark: false,
          curve: 'bumpX' as CurveType,
          area: true,
          stack: 'total',
        };
      });

      return {
        allEntityIds: allAgentIds,
        entityIdToNameMap: agentIdToNameMap,
        series: agentSeries,
      };
    } else {
      const workspaceData = adjustedData as WorkspaceCreditEntry[];
      
      const allWorkspaceIds = Array.from(
        new Set(
          workspaceData.flatMap((entry) => 
            entry.creditsByWorkspace.map((workspace) => workspace.workspaceId)
          )
        )
      );

      const workspaceIdToNameMap = new Map<string, string>();
      workspaceData.forEach((entry) => {
        entry.creditsByWorkspace.forEach(({ workspaceId, workspaceName }) => {
          if (!workspaceIdToNameMap.has(workspaceId)) {
            workspaceIdToNameMap.set(workspaceId, workspaceName);
          }
        });
      });

      const workspaceSeries = allWorkspaceIds.map((workspaceId) => {
        const workspaceSeriesData = workspaceData.map(
          (entry) =>
            entry.creditsByWorkspace.find((c) => c.workspaceId === workspaceId)?.credits ?? 0
        );

        const workspaceName = workspaceIdToNameMap.get(workspaceId) || 'Unknown';

        return {
          id: workspaceId,
          label: `Workspace ${workspaceName}`,
          data: workspaceSeriesData,
          showMark: false,
          curve: 'bumpX' as CurveType,
          area: true,
          stack: 'total',
        };
      });

      return {
        allEntityIds: allWorkspaceIds,
        entityIdToNameMap: workspaceIdToNameMap,
        series: workspaceSeries,
      };
    }
  }, [adjustedData, detectedMode, theme.palette]);

  const colorPalette = [
    theme.palette.success.main,
    theme.palette.info.main,
    theme.palette.warning.main,
    theme.palette.secondary.main,
    theme.palette.error.main,
    theme.palette.primary.main,
  ];

  const totalSum = series
    .flatMap((s) => s.data)
    .reduce((acc, val) => acc + val, 0);

  const chartTitle = detectedMode === 'agent' ? 'Daily Credit Usage' : 'Daily Credit Usage by Workspace';
  const chartSubtitle = detectedMode === 'agent' 
    ? `Credits stacked by agent per day (${totalSum})`
    : `Credits stacked by workspace per day (${totalSum})`;

  return (
    <Card
      variant="outlined"
      sx={{
        width: '100%',
        minHeight: 300,
        maxHeight: 1000,
        height: '100%',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <CardContent
        sx={{
          flex: 1,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <Typography component="h2" variant="subtitle2" gutterBottom>
          {chartTitle}
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary', mb: 1 }}>
          {chartSubtitle}
        </Typography>

        <Box sx={{ flex: 1, height: '100%' }}>
          <LineChart
            xAxis={[
              {
                scaleType: 'point',
                data: labels,
                valueFormatter: (value) => {
                  const date = new Date(`${value}T00:00:00Z`);
                  const label = date.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    timeZone: 'UTC',
                  });
                  const relative = formatRelative(value);
                  return relative ? `${label} (${relative})` : label;
                },
                tickInterval: (_, i) => (i + 1) % 2 === 0,
              },
            ]}
            yAxis={[
              {
                tickMinStep: 1,
                valueFormatter: (value: number) => `${Math.round(value)}`,
              },
            ]}
            series={series}
            colors={colorPalette}
            margin={{ left: 50, right: 20, top: 20, bottom: 20 }}
            grid={{ horizontal: true }}
            sx={{
              height: '99.4%',
              ...Object.fromEntries(
                allEntityIds.map((entityId) => [
                  `& .MuiAreaElement-series-${entityId}`,
                  { fill: `url('#${entityId}')` },
                ])
              ),
            }}
          >
            {allEntityIds.map((entityId, i) => (
              <Fragment key={entityId}>
                <AreaGradient
                  color={colorPalette[i % colorPalette.length]}
                  id={entityId}
                />
              </Fragment>
            ))}
          </LineChart>
        </Box>
      </CardContent>
    </Card>
  );
}