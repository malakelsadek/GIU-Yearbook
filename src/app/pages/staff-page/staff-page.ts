import { Component, OnInit, computed, inject, signal } from '@angular/core';

import { StaffMember } from '../../models/staff.model';
import { StaffService } from '../../services/staff.service';

type SortMode = 'featured' | 'name';

const PLACEHOLDER = 'images/placeholder-portrait.svg';

@Component({
  selector: 'app-staff-page',
  templateUrl: './staff-page.html',
  styleUrl: './staff-page.css',
})
export class StaffPage implements OnInit {
  private readonly staffService = inject(StaffService);

  protected readonly staff = signal<StaffMember[]>([]);
  protected readonly loading = signal(true);
  protected readonly errorMessage = signal('');
  protected readonly searchText = signal('');
  protected readonly selectedDepartment = signal('all');
  protected readonly sortBy = signal<SortMode>('featured');

  protected readonly departments = computed(() =>
    [...new Set(this.staff().map((m) => m.department))].sort(),
  );

  protected readonly visibleStaff = computed(() => {
    const text = this.searchText().trim().toLowerCase();
    const dept = this.selectedDepartment();

    const filtered = this.staff().filter(
      (m) =>
        m.name.toLowerCase().includes(text) &&
        (dept === 'all' || m.department === dept),
    );

    return this.sortBy() === 'name'
      ? filtered.sort((a, b) => a.name.localeCompare(b.name))
      : filtered.sort((a, b) => Number(b.featured) - Number(a.featured) || a.id - b.id);
  });


  ngOnInit(): void {
    this.staffService.getStaff().subscribe({
      next: (data) => {
        this.staff.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('We could not load the staff list. Please try again.'); 
        this.loading.set(false);
      },
    });
  }

  protected onSearch(event: Event): void {
    this.searchText.set((event.target as HTMLInputElement).value);
  }
  protected onDepartmentChange(event: Event): void {
    this.selectedDepartment.set((event.target as HTMLSelectElement).value);
  }
  protected onSortChange(event: Event): void {
    this.sortBy.set((event.target as HTMLSelectElement).value as SortMode);
  }

  protected onPhotoError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (!img.src.endsWith(PLACEHOLDER)) {
      img.src = PLACEHOLDER;
    }
  }
}
