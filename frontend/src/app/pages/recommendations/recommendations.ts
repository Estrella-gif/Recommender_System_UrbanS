import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { Recommendation } from '../../models';
import { RecommendationService } from '../../services/recommendation.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-recommendations',
  standalone: true,
  imports: [RouterLink, DecimalPipe],
  templateUrl: './recommendations.html',
})
export class RecommendationsPage implements OnInit {
  recommendations = signal<Recommendation[]>([]);
  loading = signal(true);

  constructor(
    private recommendationService: RecommendationService,
    readonly auth: AuthService,
  ) {}

  ngOnInit(): void {
    if (this.auth.isAuthenticated()) {
      this.recommendationService.getForUser().subscribe({
        next: (r) => { this.recommendations.set(r); this.loading.set(false); },
        error: () => this.loading.set(false),
      });
    } else {
      this.loading.set(false);
    }
  }
}
