import { Component, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="relative w-full max-w-md">
      <span class="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">&#x1F50D;</span>
      <input
        type="text"
        [(ngModel)]="query"
        (input)="onSearch.emit(query)"
        placeholder="Search products..."
        class="w-full pl-11 pr-4 py-3 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:border-lime-400 transition-colors"
      />
    </div>
  `,
})
export class SearchBar {
  query = '';
  readonly onSearch = output<string>();
}
