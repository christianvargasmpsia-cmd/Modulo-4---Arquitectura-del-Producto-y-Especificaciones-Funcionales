import { FileManager } from "../utils/FileManager.js";
import { Paths } from "../constants/Paths.js";

class HtmlReporter {

    async generate(results, analysis) {

        const html = `
<!DOCTYPE html>

<html>

<head>

<meta charset="UTF-8">

<title>AI Testing Report</title>

<style>

body{

font-family:Arial;

background:#f4f4f4;

padding:40px;

}

.container{

max-width:1000px;

margin:auto;

background:white;

padding:30px;

border-radius:10px;

box-shadow:0 0 10px rgba(0,0,0,.15);

}

table{

width:100%;

border-collapse:collapse;

margin-top:20px;

}

th,td{

border:1px solid #ddd;

padding:10px;

text-align:left;

}

th{

background:#2563eb;

color:white;

}

.failure{

margin-top:20px;

padding:15px;

background:#fee2e2;

border-left:5px solid #dc2626;

}

</style>

</head>

<body>

<div class="container">

<h1>AI Testing Report</h1>

<h2>Summary</h2>

<table>

<tr>

<th>Metric</th>

<th>Value</th>

</tr>

<tr>

<td>Total</td>

<td>${results.total}</td>

</tr>

<tr>

<td>Passed</td>

<td>${results.passed}</td>

</tr>

<tr>

<td>Failed</td>

<td>${results.failed}</td>

</tr>

<tr>

<td>Skipped</td>

<td>${results.skipped}</td>

</tr>

<tr>

<td>Duration</td>

<td>${results.duration} ms</td>

</tr>

</table>

<h2>Failures</h2>

${analysis.failures.map(failure => `

<div class="failure">

<h3>${failure.name}</h3>

<p><strong>Severity:</strong> ${failure.severity}</p>

<p><strong>Error:</strong> ${failure.error}</p>

</div>

`).join("")}

<h2>Recommendations</h2>

<ul>

${analysis.recommendations.map(item => `

<li>

<strong>${item.test}</strong>

<br>

${item.recommendation}

</li>

`).join("")}

</ul>

</div>

</body>

</html>
`;

        FileManager.write(

            Paths.HTML_REPORT,

            html

        );

    }

}

export default new HtmlReporter();