import {Component, inject, OnDestroy} from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {Subscription} from 'rxjs';
import {AuthorDetails} from '../books/model/book';
import {BooksService} from '../books/service/books.service';

@Component({
  selector: 'app-authors',
  templateUrl: './authors.component.html',
  styleUrls: ['./authors.component.css'],
  standalone: true,
  imports: [ReactiveFormsModule]
})
export class AuthorsComponent implements OnDestroy {
  private builder: FormBuilder = inject(FormBuilder);
  private booksService: BooksService = inject(BooksService);
  private subscription?: Subscription;
  private bioSubscription?: Subscription;

  authorForm = this.builder.group({
    authorId: ['', [Validators.required, Validators.pattern('^[0-9]+$')]]
  });

  selectedAuthor: AuthorDetails | null = null;
  bio: string | null = null;
  message: string | null = null;

  get authorId() { return this.authorForm.get('authorId'); }

  onSubmit(): void {
    const id = String(this.authorForm.value.authorId).trim();
    this.selectedAuthor = null;
    this.bio = null;
    this.message = null;
    this.subscription?.unsubscribe();
    this.bioSubscription?.unsubscribe();
    this.subscription = this.booksService.getAuthor(id).subscribe({
      next: (author: AuthorDetails) => {
        this.selectedAuthor = author;
        this.bioSubscription = this.booksService.getAuthorBio(id).subscribe({
          next: bio => { this.bio = bio.biodata; },
          error: _ => { this.bio = null; }
        });
      },
      error: (_: any) => {
        this.message = `Sorry, no author was found with id ${id}.`;
      }
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.bioSubscription?.unsubscribe();
  }
}
