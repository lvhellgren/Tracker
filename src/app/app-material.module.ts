import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {
   MatButtonModule,
   MatCardModule,
   MatDialogModule,
   MatFormFieldModule,
   MatIconModule,
   MatInputModule,
   MatListModule,
   MatPaginatorModule,
   MatProgressSpinnerModule,
   MatSelectModule,
   MatSidenavModule,
   MatSortModule,
   MatTableModule,
   MatTabsModule,
   MatToolbarModule,
   MatTooltipModule
} from '@angular/material';
import {
   FormsModule,
   ReactiveFormsModule
} from '@angular/forms';

@NgModule({
   imports: [
      CommonModule,
      // FormsModule,
      ReactiveFormsModule,
      MatButtonModule,
      MatCardModule,
      MatDialogModule,
      MatFormFieldModule,
      MatIconModule,
      MatInputModule,
      MatListModule,
      MatPaginatorModule,
      MatProgressSpinnerModule,
      MatSelectModule,
      MatSidenavModule,
      MatSortModule,
      MatTableModule,
      MatTabsModule,
      MatToolbarModule,
      MatTooltipModule
   ],
   exports: [
      CommonModule,
      // FormsModule,
      ReactiveFormsModule,
      MatButtonModule,
      MatCardModule,
      MatDialogModule,
      MatFormFieldModule,
      MatIconModule,
      MatInputModule,
      MatListModule,
      MatPaginatorModule,
      MatProgressSpinnerModule,
      MatSelectModule,
      MatSidenavModule,
      MatSortModule,
      MatTableModule,
      MatTabsModule,
      MatToolbarModule,
      MatTooltipModule
   ],
   declarations: []
})
export class AppMaterialModule {
}
