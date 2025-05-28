
import { SoilData, CalculatedResults } from '@/pages/Index';
import { calculateFertilizerRecommendations } from './soilCalculations';
import { formatNumber, formatNumberOptional } from './numberFormat';

export const generatePDFReport = (soilData: SoilData, results: CalculatedResults) => {
  // Create a comprehensive HTML report
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Relatório de Análise de Solo - ${soilData.location}</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                margin: 20px;
                color: #333;
            }
            .header {
                text-align: center;
                border-bottom: 2px solid #2d5016;
                padding-bottom: 20px;
                margin-bottom: 30px;
            }
            .header h1 {
                color: #2d5016;
                margin: 0;
            }
            .info-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
                margin-bottom: 30px;
            }
            .info-box {
                border: 1px solid #ddd;
                padding: 15px;
                border-radius: 5px;
                background-color: #f9f9f9;
            }
            .table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 20px;
            }
            .table th, .table td {
                border: 1px solid #ddd;
                padding: 8px;
                text-align: left;
            }
            .table th {
                background-color: #2d5016;
                color: white;
            }
            .adequate { color: #16a34a; font-weight: bold; }
            .inadequate { color: #dc2626; font-weight: bold; }
            .section {
                margin-bottom: 30px;
                page-break-inside: avoid;
            }
            .footer {
                border-top: 1px solid #ddd;
                padding-top: 20px;
                margin-top: 40px;
                font-size: 12px;
                color: #666;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>FertiliSolo</h1>
            <h2>Relatório de Análise de Solo e Recomendação de Adubação</h2>
            <p>Método de Saturações por Bases</p>
        </div>

        <div class="info-grid">
            <div class="info-box">
                <h3>Informações da Análise</h3>
                <p><strong>Local:</strong> ${soilData.location}</p>
                <p><strong>Data:</strong> ${soilData.date}</p>
                <p><strong>CTC (T):</strong> ${formatNumberOptional(soilData.T)} cmolc/dm³</p>
            </div>
            <div class="info-box">
                <h3>Relação Ca/Mg</h3>
                <p><strong>Atual:</strong> ${formatNumber(results.caeMgRatio)}:1</p>
                <p><strong>Status:</strong> <span class="${results.isAdequate.CaMgRatio ? 'adequate' : 'inadequate'}">${results.isAdequate.CaMgRatio ? 'Adequada' : 'Inadequada'}</span></p>
                <p><strong>Ideal:</strong> 3:1 a 5:1</p>
            </div>
        </div>

        <div class="section">
            <h3>Dados da Análise e Saturações Atuais</h3>
            <table class="table">
                <thead>
                    <tr>
                        <th>Nutriente</th>
                        <th>Valor Atual</th>
                        <th>Saturação (%)</th>
                        <th>Faixa Ideal (%)</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Cálcio (Ca)</td>
                        <td>${formatNumberOptional(soilData.Ca)} cmolc/dm³</td>
                        <td>${formatNumber(results.saturations.Ca, 1)}%</td>
                        <td>50-60%</td>
                        <td class="${results.isAdequate.Ca ? 'adequate' : 'inadequate'}">${results.isAdequate.Ca ? 'Adequado' : 'Baixo'}</td>
                    </tr>
                    <tr>
                        <td>Magnésio (Mg)</td>
                        <td>${formatNumberOptional(soilData.Mg)} cmolc/dm³</td>
                        <td>${formatNumber(results.saturations.Mg, 1)}%</td>
                        <td>15-20%</td>
                        <td class="${results.isAdequate.Mg ? 'adequate' : 'inadequate'}">${results.isAdequate.Mg ? 'Adequado' : 'Baixo'}</td>
                    </tr>
                    <tr>
                        <td>Potássio (K)</td>
                        <td>${formatNumberOptional(soilData.K)} cmolc/dm³</td>
                        <td>${formatNumber(results.saturations.K, 1)}%</td>
                        <td>3-5%</td>
                        <td class="${results.isAdequate.K ? 'adequate' : 'inadequate'}">${results.isAdequate.K ? 'Adequado' : 'Baixo'}</td>
                    </tr>
                    <tr>
                        <td>Fósforo (P)</td>
                        <td>${formatNumberOptional(soilData.P)} ppm</td>
                        <td>-</td>
                        <td>≥ 15 ppm</td>
                        <td class="${results.isAdequate.P ? 'adequate' : 'inadequate'}">${results.isAdequate.P ? 'Adequado' : 'Baixo'}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="section">
            <h3>Necessidades de Correção</h3>
            <table class="table">
                <thead>
                    <tr>
                        <th>Nutriente</th>
                        <th>Necessidade</th>
                        <th>Unidade</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Cálcio (Ca)</td>
                        <td>${formatNumber(results.needs.Ca)}</td>
                        <td>cmolc/dm³</td>
                    </tr>
                    <tr>
                        <td>Magnésio (Mg)</td>
                        <td>${formatNumber(results.needs.Mg)}</td>
                        <td>cmolc/dm³</td>
                    </tr>
                    <tr>
                        <td>Potássio (K)</td>
                        <td>${formatNumber(results.needs.K)}</td>
                        <td>cmolc/dm³</td>
                    </tr>
                    <tr>
                        <td>Fósforo (P)</td>
                        <td>${formatNumber(results.needs.P, 1)}</td>
                        <td>kg/ha</td>
                    </tr>
                </tbody>
            </table>
        </div>

        ${generateFertilizerRecommendationsHTML(results)}

        <div class="footer">
            <p><strong>Observações importantes:</strong></p>
            <ul>
                <li>Estas recomendações são baseadas no método de Saturação por Bases</li>
                <li>Aplicar calcário 60-90 dias antes do plantio</li>
                <li>Incorporar uniformemente até 20 cm de profundidade</li>
                <li>Consulte um engenheiro agrônomo para validação das recomendações</li>
            </ul>
            <p>Relatório gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')} - FertiliSolo</p>
        </div>
    </body>
    </html>
  `;

  // Create and download the PDF
  const newWindow = window.open('', '_blank');
  if (newWindow) {
    newWindow.document.write(htmlContent);
    newWindow.document.close();
    newWindow.print();
  }
};

const generateFertilizerRecommendationsHTML = (results: CalculatedResults): string => {
  const nutrients = [
    { key: 'Ca' as const, name: 'Cálcio', need: results.needs.Ca },
    { key: 'Mg' as const, name: 'Magnésio', need: results.needs.Mg },
    { key: 'K' as const, name: 'Potássio', need: results.needs.K },
    { key: 'P' as const, name: 'Fósforo', need: results.needs.P },
  ];

  let html = '<div class="section"><h3>Recomendações de Fertilizantes</h3>';

  nutrients.forEach(nutrient => {
    if (nutrient.need > 0.01) {
      const recommendations = calculateFertilizerRecommendations(nutrient.key, nutrient.need);
      
      html += `
        <h4>${nutrient.name} - Necessita ${formatNumber(nutrient.need)} ${nutrient.key === 'P' ? 'kg/ha' : 'cmolc/dm³'}</h4>
        <table class="table">
          <thead>
            <tr>
              <th>Fonte</th>
              <th>Concentração</th>
              <th>Recomendação (kg/ha)</th>
              <th>Benefícios</th>
            </tr>
          </thead>
          <tbody>
      `;
      
      recommendations.forEach(rec => {
        html += `
          <tr>
            <td>${rec.source.name}</td>
            <td>${formatNumberOptional(rec.source.concentration)}${rec.source.unit}</td>
            <td>${formatNumber(rec.recommendation, 1)}</td>
            <td>${rec.source.benefits}</td>
          </tr>
        `;
      });
      
      html += '</tbody></table>';
    } else {
      html += `<h4>${nutrient.name} - <span class="adequate">Adequado (não necessita correção)</span></h4>`;
    }
  });

  html += '</div>';
  return html;
};
