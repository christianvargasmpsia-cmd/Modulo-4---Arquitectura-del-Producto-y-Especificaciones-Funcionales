import FailureClassifier from "./FailureClassifier.js";
import RecommendationEngine from "./RecommendationEngine.js";

class ResultAnalyzer {
    async analyze(results) {
        if (!results || !results.tests) {
            return {
                summary: "No test results available",
                overallStatus: "UNKNOWN",
                failures: [],
                recommendations: [],
                stats: { total: 0, passed: 0, failed: 0, skipped: 0 }
            };
        }

        const failedTests = results.tests.filter(test => test.status === "failed");
        
        const failures = failedTests.map(test => ({
            name: test.title || test.name || "Unknown test",
            file: test.file || "Unknown file",
            error: test.error || "Unknown error",
            severity: FailureClassifier.classify(test),
            timestamp: new Date().toISOString()
        }));

        const recommendations = failures.map(failure => ({
            test: failure.name,
            severity: failure.severity,
            recommendation: RecommendationEngine.generate(failure),
            actionItems: this.generateActionItems(failure)
        }));

        const stats = {
            total: results.total || 0,
            passed: results.passed || 0,
            failed: results.failed || 0,
            skipped: results.skipped || 0,
            duration: results.duration || 0
        };

        const overallStatus = this.determineStatus(stats);

        return {
            summary: this.generateSummary(stats),
            overallStatus,
            failures,
            recommendations,
            stats,
            successRate: stats.total > 0 ? ((stats.passed / stats.total) * 100).toFixed(2) : 0
        };
    }

    determineStatus(stats) {
        if (stats.failed === 0) return "✓ STABLE";
        if (stats.failed <= stats.total * 0.1) return "⚠ DEGRADED";
        return "🔴 CRITICAL";
    }

    generateSummary(stats) {
        const passRate = stats.total > 0 ? ((stats.passed / stats.total) * 100).toFixed(1) : 0;
        return `Tests ejecutadas: ${stats.total} | Pasadas: ${stats.passed} (${passRate}%) | Fallidas: ${stats.failed} | Duración: ${stats.duration}ms`;
    }

    generateActionItems(failure) {
        const items = [];
        
        if (failure.severity === "CRITICAL") {
            items.push("🔴 CRÍTICO: Revisar inmediatamente");
            items.push("Ejecutar tests localmente para reproducir");
            items.push("Revisar logs de stderr/stdout");
        } else if (failure.severity === "HIGH") {
            items.push("⚠ ALTO: Priorizar en siguiente sprint");
            items.push("Crear issue de bug si no existe");
        } else {
            items.push("Documentar para seguimiento");
            items.push("Considerar para próximas mejoras");
        }
        
        return items;
    }
}

export default new ResultAnalyzer();