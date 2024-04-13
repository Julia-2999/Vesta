import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private searchSource = new Subject<string>();

  search$ = this.searchSource.asObservable();

  updateSearch(searchTerm: string) {
    this.searchSource.next(searchTerm);
  }
}
