import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonSearchbar,
  IonButton,
  IonIcon,
  IonBadge,
  IonSpinner,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { search, options, swapVertical, chevronDown } from 'ionicons/icons';
import { JobService, Job } from '../services/job.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonSearchbar,
    IonButton,
    IonIcon,
    IonBadge,
    IonSpinner,
  ],
})
export class HomePage implements OnInit {
  searchQuery: string = '';
  activeFilters: number = 2;
  jobs: Job[] = [];
  filteredJobs: Job[] = [];
  loading: boolean = false;

  constructor(private router: Router, private jobService: JobService) {
    addIcons({ search, options, swapVertical, chevronDown });
  }

  ngOnInit() {
    this.loadJobs();
  }

  loadJobs() {
    this.loading = true;
    this.jobService.getPublicJobs().subscribe({
      next: (jobs) => {
        console.log('Loaded jobs:', jobs);
        this.jobs = jobs;
        this.filteredJobs = [...this.jobs];
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading jobs:', error);
        console.error('Error details:', {
          status: error?.status,
          statusText: error?.statusText,
          message: error?.message,
          url: error?.url,
          error: error?.error,
        });
        this.jobs = [];
        this.filteredJobs = [];
        this.loading = false;
      },
    });
  }

  onSearchChange(event: any) {
    const query = event.detail.value.toLowerCase();
    this.searchQuery = query;
    this.filteredJobs = this.jobs.filter(
      (job) =>
        job.title?.toLowerCase().includes(query) ||
        job.location?.toLowerCase().includes(query)
    );
  }

  onSortClick() {
    // Sort logic here
    console.log('Sort clicked');
  }

  onFilterClick() {
    // Filter logic here
    console.log('Filter clicked');
  }

  onJobClick(jobId: number) {
    // Navigate to job detail/apply page
    this.router.navigate(['/job-detail', jobId]);
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  }

  formatJobSubtitle(job: Job): string {
    const parts: string[] = [];

    if (job.salaryFrom && job.salaryTo) {
      parts.push(`${job.salaryFrom} - ${job.salaryTo} VNĐ`);
    } else if (job.salaryFrom) {
      parts.push(`Từ ${job.salaryFrom} VNĐ`);
    }

    if (job.location) {
      parts.push(job.location);
    }

    return parts.length > 0 ? parts.join(' • ') : 'Thông tin công việc';
  }
}
