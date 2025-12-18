
import { Insight } from '../agents/AnalystAgent';

export class ReportService {
    static generateMarkdownReport(
        insights: Insight[],
        systemHealth: string,
        tier: string
    ): string {
        const timestamp = new Date().toISOString();

        let report = `# DEFRAG Cognitive System Report\n`;
        report += `**Generated:** ${timestamp}\n`;
        report += `**Analysis Tier:** ${tier}\n`;
        report += `**System Status:** ${systemHealth}\n\n`;

        report += `## Executive Summary\n`;
        if (insights.length === 0) {
            report += `System appears stable. No significant drift or entropy detected.\n`;
        } else {
            report += `Detected ${insights.length} systemic anomalies requiring attention.\n`;
        }
        report += `\n`;

        report += `## Detailed Insights\n`;
        insights.forEach(insight => {
            report += `### [${insight.severity}] ${insight.title}\n`;
            report += `*Type: ${insight.type}*\n`;

            // Deep Intelligence Metrics
            if (insight.metrics) {
                if (insight.metrics.passLevel) report += `*Analysis Depth: Level ${insight.metrics.passLevel}*\n`;
                if (insight.metrics.coherence !== undefined) report += `*Cognitive Coherence: ${(insight.metrics.coherence * 100).toFixed(1)}%*\n`;
            }

            report += `\n${insight.description}\n\n`;
            report += `> **Recommendation:** Verify node positions in the 3D visualizer.\n\n`;
        });

        report += `## Methodology\n`;
        report += `Computed using DEFRAG's proprietary topological analysis engine.\n`;
        report += `Data verification available via the Transparency Module.\n`;

        if (tier === 'EXPERT') {
            report += `\n## Multimedia Briefing\n`;
            report += `> [Listen to System Audio Summary](http://localhost:3002/api/voice/summary/${timestamp})\n`;
            // Note: In prod this would be a real S3 link or generated file
        }

        return report;
    }
}
