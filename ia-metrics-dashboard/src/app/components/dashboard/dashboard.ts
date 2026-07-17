import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartType } from 'chart.js';
import { Subscription } from 'rxjs';
import { Metrics, ModelMetrics } from '../../services/metrics';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit, OnDestroy{
  activeModel: string = 'HYBRID';
  private metricsSub!: Subscription;

  // Configuración de Chart.js
  public lineChartData: ChartConfiguration['data'] = {
    datasets: [
      { data: [], label: 'Precision', borderColor: '#4f46e5', backgroundColor: 'rgba(79, 70, 229, 0.2)', fill: true, tension: 0.4 },
      { data: [], label: 'Recall', borderColor: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.2)', fill: true, tension: 0.4 }
    ],
    labels: []
  };

  public lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    animation: false, // Importante para fluidez en tiempo real
    scales: { y: { min: 0, max: 1 } }
  };
  public lineChartType: ChartType = 'line';

  constructor(private metrics: Metrics) {}

  ngOnInit(): void {
    this.startTracking(this.activeModel);
  }

  startTracking(model: string) {
    if (this.metricsSub) this.metricsSub.unsubscribe();
    this.activeModel = model;

    // Reiniciar los arreglos al cambiar de modelo
    this.lineChartData.datasets[0].data = [];
    this.lineChartData.datasets[1].data = [];
    this.lineChartData.labels = [];

    this.metricsSub = this.metrics.getRealTimeMetrics(model).subscribe(
      (data: ModelMetrics) => {
        this.updateChart(data);
      }
    );
  }

  updateChart(data: ModelMetrics) {
    const timeLabel = data.timestamp.toLocaleTimeString();

    // Mantener solo los últimos 10 puntos en pantalla
    if (this.lineChartData.labels!.length > 10) {
      this.lineChartData.labels!.shift();
      this.lineChartData.datasets[0].data.shift();
      this.lineChartData.datasets[1].data.shift();
    }

    this.lineChartData.labels!.push(timeLabel);
    this.lineChartData.datasets[0].data.push(data.precision);
    this.lineChartData.datasets[1].data.push(data.recall);

    // Clonar el objeto para forzar la actualización visual en Angular
    this.lineChartData = { ...this.lineChartData };
  }

  ngOnDestroy(): void {
    if (this.metricsSub) this.metricsSub.unsubscribe();
  }
}
