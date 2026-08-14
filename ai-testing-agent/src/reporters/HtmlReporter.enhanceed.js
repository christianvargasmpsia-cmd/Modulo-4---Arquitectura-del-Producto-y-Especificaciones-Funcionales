import { FileManager } from "../utils/FileManager.js";
import { Paths } from "../constants/Paths.js";

class HtmlReporter {
    async generate(results, analysis) {
        const timestamp = new Date().toLocaleString();
        const successRate = analysis.stats?.successRate || 0;
        
        const html = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🧪 UMSS Market - AI Testing Report</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
            min-height: 100vh;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 { font-size: 2.5em; margin-bottom: 10px; }
        .header p { font-size: 1.1em; opacity: 0.9; }
        .metrics {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            padding: 30px;
            background: #f8f9fa;
        }
        .metric-card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .metric-card.success { border-left-color: #28a745; }
        .metric-card.failed { border-left-color: #dc3545; }
        .metric-card.skipped { border-left-color: #ffc107; }
        .metric-value { font-size: 2em; font-weight: bold; }
        .metric-label { font-size: 0.9em; color: #666; margin-top: 5px; }
        .section { padding: 30px; border-bottom: 1px solid #eee; }
        .section h2 { color: #333; margin-bottom: 15px; font-size: 1.5em; }
        .failure {
            background: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin-bottom: 15px;
            border-radius: 4px;
        }
        .failure.critical {
            background: #f8d7da;
            border-left-color: #dc3545;
        }
        .failure h4 { color: #333; margin-bottom: 8px; }
        .failure p { color: #666; font-size: 0.95em; margin-bottom: 8px; }
        .severity { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 0.85em; font-weight: bold; }
        .severity.critical { background: #dc3545; color: white; }
        .severity.high { background: #fd7e14; color: white; }
        .severity.medium { background: #ffc107; color: #333; }
        .status-stable { color: #28a745; }
        .status-degraded { color: #fd7e14; }
        .status-critical { color: #dc3545; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 0.9em; }
        .progress-bar {
            width: 100%;
            height: 8px;
            background: #e9ecef;
            border-radius: 4px;
            overflow: hidden;
            margin: 10px 0;
        }
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #28a745, #20c997);
            width: ${successRate}%;
            transition: width 0.3s ease;
        }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background: #667eea; color: white; font-weight: bold; }
        tr:hover { background: #f8f9fa; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🧪 UMSS Market - AI Testing Report</h1>
            <p>Reporte de pruebas automatizadas - ${timestamp}</p>
        </div>

        <div class="section">
            <h2>📊 Métricas Generales</h2>
            <div class="progress-bar">
                <div class="progress-fill"></div>
            </div>
            <p>Tasa de éxito: <strong>${successRate}%</strong></p>
        </div>

        <div class="metrics">
            <div class="metric-card success">
                <div class="metric-value">${analysis.stats?.total || 0}</div>
                <div class="metric-label">Total de Pruebas</div>
            </div>
            <div class="metric-card success">
                <div class="metric-value">${analysis.stats?.passed || 0}</div>
                <div class="metric-label">Pruebas Pasadas ✓</div>
            </div>
            <div class="metric-card failed">
                <div class="metric-value">${analysis.stats?.failed || 0}</div>
                <div class="metric-label">Pruebas Fallidas ✗</div>
            </div>
            <div class="metric-card skipped">
                <div class="metric-value">${analysis.stats?.skipped || 0}</div>
                <div class="metric-label">Pruebas Omitidas</div>
            </div>
        </div>

        ${analysis.failures.length > 0 ? `
        <div class="section">
            <h2>🔴 Fallos Detectados</h2>
            ${analysis.failures.map(failure => `
            <div class="failure ${failure.severity === 'CRITICAL' ? 'critical' : ''}">
                <h4>${failure.name}</h4>
                <p><strong>Archivo:</strong> ${failure.file}</p>
                <p><strong>Error:</strong> ${failure.error}</p>
                <span class="severity ${failure.severity.toLowerCase()}">${failure.severity}</span>
            </div>
            `).join('')}
        </div>
        ` : `
        <div class="section" style="background: #d4edda;">
            <h2 style="color: #155724;">✓ Todas las pruebas pasaron correctamente</h2>
        </div>
        `}

        ${analysis.recommendations.length > 0 ? `
        <div class="section">
            <h2>💡 Recomendaciones</h2>
            <table>
                <thead>
                    <tr>
                        <th>Prueba</th>
                        <th>Severidad</th>
                        <th>Recomendación</th>
                    </tr>
                </thead>
                <tbody>
                    ${analysis.recommendations.map(rec => `
                    <tr>
                        <td>${rec.test}</td>
                        <td><span class="severity ${rec.severity.toLowerCase()}">${rec.severity}</span></td>
                        <td>${rec.recommendation}</td>
                    </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        ` : ''}

        <div class="section">
            <h2>📈 Estado General</h2>
            <p style="font-size: 1.2em;"><strong class="status-${analysis.overallStatus.toLowerCase().replace(' ', '-')}">${analysis.overallStatus}</strong></p>
            <p style="margin-top: 10px; color: #666;">${analysis.summary}</p>
        </div>

        <div class="footer">
            <p>Generado automáticamente por UMSS Market AI Testing Platform</p>
            <p>Timestamp: ${new Date().toISOString()}</p>
        </div>
    </div>
</body>
</html>
        `;

        FileManager.write(Paths.HTML_REPORT, html);
    }
}

export default new HtmlReporter();