import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { forkJoin } from 'rxjs';

import { DataService } from './data.service';

declare const Office: any;
declare const Excel: any;

@Injectable({
  providedIn: 'root'
})
export class OfficehelperService {

  constructor(private dataService: DataService) {
    console.log('Officehelper service created');
  }

  /**
   * Initializes the new Trade Sheet
   */
  newTradeSheet(): Observable<boolean> {
    console.log('Officehelper newTradeSheet method');
    return Observable.create(observer => {
      if (Office.context !== undefined && Office.context != null) {
        Excel.run(async context => {
          const sheet = context.workbook.worksheets.getActiveWorksheet();
          sheet.getRange().clear();
          await context.sync();
          // set main headers
          const data = [
            ['Orders sum', '', ''] ,
            ['Selector', 'Yes', ''],
            ['Detailed Orders', '', ''],
            ['Account', 'Quantity', 'Comment'],
          ];

          let range = sheet.getRange('A1:C4');
          range.values = data;
          range.format.font.bold = true;
          range.format.autofitColumns();
          await context.sync();

          range = sheet.getRange('B2');
          range.dataValidation.rule = {
            list: {
                inCellDropDown: true,
                source: 'Yes,No'
            }
          };
          await context.sync();

          range = sheet.getRange('A3:C3');
          range.merge(true);
          await context.sync();

          range = sheet.getRange('A5');
          range.select();
          await context.sync();

          this.completeObservable(observer, true);
        })
        .catch(error => {
          console.log(`Error: ${error}`);
          throw Observable.throw(error);
        });
      } else {
        this.completeObservable(observer, false);
      }
    });
  }

  /**
   * Creates My Orders sheet
   */
  createMyOrdersSheet(headers: any, rows: any): Observable<boolean> {
    console.log('Officehelper myOrders method');
    return Observable.create(observer => {
      if (Office.context !== undefined && Office.context != null) {
        Excel.run(async context => {
          const sheetName = 'My Orders';
          const sheets = context.workbook.worksheets;
          sheets.load('items/name');
          await context.sync();
          let sheet = this.getWorksheetByName(sheets, sheetName);
          if (sheet === null || sheet === undefined) {
            console.log(`Sheet with name ${sheetName} not found`);
            sheet = sheets.add(sheetName);
            sheet.load('name, position');
            await context.sync();
          } else {
            sheet.getRange().clear();
            await context.sync();
          }

          const expensesTable = sheet.tables.add(`A1:${this.toColumnName(headers.length)}1`, true);
          expensesTable.name = 'OrdersTable';

          expensesTable.getHeaderRowRange().values = [ headers ];

          const data = this.getJsonDataAsArray(headers, rows);
          expensesTable.rows.add(null, data);

          if (Office.context.requirements.isSetSupported("ExcelApi", "1.2")) {
              sheet.getUsedRange().format.autofitColumns();
              sheet.getUsedRange().format.autofitRows();
          }

          sheet.activate();
          await context.sync();

          const statusIndex = this.getHeaderIndex(headers, 'status');
          if (statusIndex > 0) {
            const columnIndex = this.toColumnName(statusIndex);
            const address = `${columnIndex}2:${columnIndex}${rows.length + 1}`;
            const range = sheet.getRange(address);
            range.dataValidation.rule = {
              list: {
                  inCellDropDown: true,
                  source: 'EXECUTED,NOT EXECUTED'
              }
            };
            await context.sync();
          }

          this.completeObservable(observer, true);
        })
        .catch(error => {
          console.log(`Error: ${error}`);
          throw Observable.throw(error);
        });
      } else {
        this.completeObservable(observer, false);
      }
    });
  }

  /**
   * Returns the trafde data entered in the sheet
   */
  getNewTradeData(): Observable<any> {
    console.log('Officehelper getNewTradeData method');
    return Observable.create(observer => {
      Excel.run(async context => {
        const sheet = context.workbook.worksheets.getActiveWorksheet();
        const uRowsIndex = sheet.getCell(0, 0).getEntireColumn().getUsedRange().getLastCell().load(['rowIndex']);
        await context.sync();
        console.log(`uIndex: ${uRowsIndex.rowIndex}`);
        let values = null;
        if (uRowsIndex.rowIndex > 3) {
          const range = sheet.getRange(`A5:C${uRowsIndex.rowIndex + 1}`);
          range.load('values');
          await context.sync();
          values = range.values;
        }
        this.completeObservable(observer, values);
      })
      .catch(error => {
        console.log(`Error: ${error}`);
        throw Observable.throw(error);
      });
    });
  }

  /**
   * Checks is the new trade data ready to submit
   */
  checkNewTrade(): Observable<boolean> {
    console.log('Officehelper getNewTradeData method');
    return Observable.create(observer => {
      Excel.run(async context => {
        const sheet = context.workbook.worksheets.getActiveWorksheet();
        const uRowsIndex = sheet.getCell(0, 0).getEntireColumn().getUsedRange().getLastCell().load(['rowIndex']);
        await context.sync();
        console.log(`uIndex: ${uRowsIndex.rowIndex}`);
        let allowSubmit = false;
        if (uRowsIndex.rowIndex > 3) {
          let range = sheet.getRange('C1');
          range.formulas = [[ `=SUM(A5:A${uRowsIndex.rowIndex + 1})` ]];
          await context.sync();
          range = sheet.getRange('C1');
          range.load('values');
          await context.sync();
          let totalSum = '';
          if (range.values.length > 0) {
            totalSum = range.values[0][0];
            range.clear();
            await context.sync();
          }
          if (totalSum !== null && totalSum !== undefined && totalSum !== '') {
            range = sheet.getRange('B1');
            range.load('values');
            await context.sync();
            allowSubmit = (range.values.length > 0 && totalSum === range.values[0][0]);
          }

        }
        this.completeObservable(observer, allowSubmit);
      })
      .catch(error => {
        console.log(`Error: ${error}`);
        throw Observable.throw(error);
      });
    });
  }

  getSelectedOrderId(): Observable<string> {
    console.log('Officehelper getSelectedOrderId method');
    return Observable.create(observer => {
      Excel.run(async context => {
        let range = context.workbook.getSelectedRange();
        range.load(['rowIndex', 'values']);
        await context.sync();
        console.log(range.rowIndex);

        let rowIndex = -1;
        if (range.values !== null && range.values !== undefined && range.values.length > 0) {
          rowIndex = range.rowIndex;
        }

        const sheet = context.workbook.worksheets.getActiveWorksheet();
        range = sheet.getRange(`A${range.rowIndex + 1}`);
        range.load('values');
        await context.sync();

        const rangeValues = range.values;

        const expensesTable = sheet.tables.getItem('OrdersTable');
        const headerRange = expensesTable.getHeaderRowRange().load('values');
        await context.sync();

        const headers = headerRange.values[0];
        const statusIndex = this.getHeaderIndex(headers, 'status');
        if (statusIndex > 0) {
            const columnIndex = this.toColumnName(statusIndex);
            const address = `${columnIndex}${rowIndex + 1}`;
            const statusRange = sheet.getRange(address);
            statusRange.load('values');
            await context.sync();
            if (statusRange.values !== null && statusRange.values !== undefined && statusRange.values.length > 0 &&
                  statusRange.values[0][0] === 'NOT EXECUTED') {
              if (rangeValues !== null && rangeValues !== undefined && rangeValues.length > 0) {
                this.completeObservable(observer, range.values[0]);
              } else {
                this.completeObservable(observer, '');
              }
            } else {
              this.completeObservable(observer, '');
            }
        } else {
          this.completeObservable(observer, '');
        }

      })
      .catch(error => {
        console.log(`Error: ${error}`);
        throw Observable.throw(error);
      });
    });
  }

  private createOrdersColumnsHeaders(sheet: any): void {
    const data = [
      [ 'account',
        'parseketable',
        'isin',
        'op_type',
        'amount_ordered',
        'limit_price',
        'tif',
        'instructions',
        'security_name',
        'side',
        'filled_name',
        'working',
        'amnt_left',
        'pct_left',
        'average_price',
        'broker_name',
        'status',
        'portfolio_manager',
        'trader_name',
        'order_date',
        'order_creation',
        'last_touched',
        'ts_order_date',
        'settle_date',
        'security_id',
        'order_number',
        'ticket_number'
      ]
    ];
    const range = sheet.getRange('A1:AA1');
    range.values = data;
    range.format.font.bold = true;
    range.format.autofitColumns();
  }

  private getWorksheetByName(sheets: any, sheetName: string): any {
    for (const i in sheets.items) {
      if (sheets.items[i].name === sheetName) {
        return sheets.items[i];
      }
    }
    return null;
  }

  private async setRangeNumberFormat(context: any, sheet: any, address: string) {
    const formats = [
      ['0.00']
    ];

    const range = sheet.getRange(address);
    range.numberFormat = formats;
    await context.sync();
  }

  private toColumnName(num: any): string {
    let ret = '';
    let a = 1;
    let b = 26;
    for (ret = '', a = 1, b = 26; (num -= a) >= 0; a = b, b *= 26) {
      // tslint:disable-next-line:radix
      const value = ((num % b) / a) + 65;
      ret = String.fromCharCode(value) + ret;
    }
    return ret;
  }

  private getJsonDataAsArray(headers: any, rows): any {
    const data = [rows.length];
    for (let index = 0; index < rows.length; ++index) {
      const row = rows[index];
      const itemArray = new Array();
      for (let header = 0; header < headers.length; ++header) {
        const value = row[headers[header]];
        if (value === null || value === undefined) {
          itemArray.push('');  
        } else {
          itemArray.push(`${value}`);
        }
      }
      data[index] = itemArray;
    }
    return data;
  }

  private getHeaderIndex(headers: any, header: string): number {
    for (let index = 0; index < headers.length; ++index) {
      if (headers[index] === header) {
        return index + 1;
      }
    }
    return 0;
  }

  private completeObservable(observer: any, result: any): void {
    observer.next(result);
    observer.complete();
  }
}
