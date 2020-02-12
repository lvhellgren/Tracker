import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Subscription } from 'rxjs';
import { SubscriberDoc, SubscriberService } from './subscriber.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorDlgComponent } from '../../core/error-dlg/error-dlg.component';
import { AuthService } from '../../core/auth/auth.service';
import { ACT_NOTIFICATION_SUBSCRIBERS, HelpService } from '../../../drawers/help/help.service';

@Component({
  selector: 'app-subscribers',
  templateUrl: './subscribers.component.html',
  styleUrls: ['./subscribers.component.css']
})
export class SubscribersComponent implements OnInit, OnDestroy {

  dataSource = new MatTableDataSource<SubscriberDoc>();
  displayedColumns = ['subscriber', 'subscriptionId', 'email', 'text', 'active', 'modifiedAt'];
  subscriptionId: string;

  accountSubscription: Subscription;
  subscriberSubscription: Subscription;

  // Page attributes:
  public pageIndex = 0;
  public previousPageIndex = 0;
  public startPageSize = 20;
  public pageSize = this.startPageSize;
  public pageSizeOptions = [this.startPageSize, 50, 100];
  public length = (this.pageIndex + 1) * this.pageSize + this.pageSize;
  private bottomPageRows = [0];

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    private subscriberService: SubscriberService,
    private authService: AuthService,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private router: Router,
    private helpService: HelpService) {
  }

  ngOnInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    this.accountSubscription = this.authService.userAccountSelect.subscribe((accountId: string) => {
      if (this.subscriberSubscription) {
        this.subscriberSubscription.unsubscribe();
      }
      this.subscriberSubscription =
        this.subscriberService.subscribers$(accountId, this.bottomPageRows[this.bottomPageRows.length - 1], this.pageSize)
          .subscribe(docs => {
            this.dataSource.data = docs;
          });
    });

    this.helpService.component$.next(ACT_NOTIFICATION_SUBSCRIBERS);
  }

  ngOnDestroy() {
    if (this.accountSubscription) {
      this.accountSubscription.unsubscribe();
    }
    if (this.subscriberSubscription) {
      this.subscriberSubscription.unsubscribe();
    }
  }

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim();
    filterValue = filterValue.toLowerCase();
    this.dataSource.filter = filterValue;

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  onSubscriberClick(row) {
    if (row.documentId) {
      this.router.navigate([`../account-subscriber`, row.documentId], {relativeTo: this.route});
    } else {
      const msg = 'Invalid subscriber data in table row';
      this.dialog.open(ErrorDlgComponent, {
        data: {msg: msg}
      });
      console.error(msg);
    }
  }

  rowBackground(row) {
    return this.isSelected(row) ? '#3f51b5' : '';
  }

  rowColor(row) {
    return this.isSelected(row) ? 'white' : '';
  }

  isSelected(row): boolean {
    const id = this.subscriberService.getSubscriberId();
    return row && id && id === row.documentId;
  }
}
