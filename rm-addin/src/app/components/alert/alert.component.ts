import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output
} from '@angular/core';

import { OnChange } from '../shared/utils/decorators';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class AlertComponent implements OnInit {
  /** Alert type.
   * Provides one of four bootstrap supported contextual classes:
   * `success`, `info`, `warning` and `danger`
   */
  @Input() type = 'danger';
  /** If set, displays an inline "Close" button */
  @OnChange()   @Input()  dismissible = true;
  /** Number in milliseconds, after which alert will be closed */
  @Input() dismissOnTimeout: number | string;

  /** Is alert visible */
  @Input() isOpen = false;

  /** This event fires immediately after close instance method is called,
   * $event is an instance of Alert component.
   */
  @Output() Close = new EventEmitter<AlertComponent>();
  /** This event fires when alert closed, $event is an instance of Alert component */
  @Output() Closed = new EventEmitter<AlertComponent>();


  classes = '';
  dismissibleChange = new EventEmitter<boolean>();

  constructor(private changeDetection: ChangeDetectorRef) {
    this.dismissibleChange.subscribe((dismissible: boolean) => {
      this.classes = this.dismissible ? 'alert-dismissible' : '';
      this.changeDetection.markForCheck();
    });
  }

  ngOnInit(): void {
    if (this.dismissOnTimeout) {
      setTimeout(
        () => {
          this.close();
        },
        parseInt(this.dismissOnTimeout as string, 10)
      );
    }
  }

  /**
   * Closes an alert by removing it from the DOM.
   */
  close(): void {
    if (!this.isOpen) {
      return;
    }

    console.log('alert closing.');
    this.Close.emit(this);
    this.isOpen = false;
    this.changeDetection.markForCheck();
    this.Closed.emit(this);
  }
}
