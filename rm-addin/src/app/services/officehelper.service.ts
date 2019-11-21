import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { forkJoin } from 'rxjs';

import { DataService } from './data.service';
import { ExtendedOrder } from '../models/order.model';

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
          const sheetName = 'New Trade';
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

          if (rows !== null && rows !== undefined && rows.length > 0) {
            const data = this.getJsonDataAsArray(headers, rows);
            expensesTable.rows.add(null, data);
          }

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
   * Creates RM Orders sheet
   */
  createRMOrdersSheet(headers: any, rows: any): Observable<boolean> {
    console.log('Officehelper RMOrders method');
    return Observable.create(observer => {
      if (Office.context !== undefined && Office.context != null) {
        Excel.run(async context => {
          const sheetName = 'RM Orders';
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
          expensesTable.name = 'RMOrdersTable';

          expensesTable.getHeaderRowRange().values = [ headers ];

          if (rows !== null && rows !== undefined && rows.length > 0) {
            const data = this.getJsonDataAsArray(headers, rows);
            expensesTable.rows.add(null, data);
          }

          if (Office.context.requirements.isSetSupported('ExcelApi', '1.2')) {
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
          range.formulas = [[ `=SUM(B5:B${uRowsIndex.rowIndex + 1})` ]];
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
        range.load(['rowCount', 'rowIndex']);
        await context.sync();
        console.log(range.rowIndex + '; ' + range.rowCount);

        if (range.rowCount > 0 && range.rowIndex > 0) {
          const sheet = context.workbook.worksheets.getActiveWorksheet();

          const expensesTable = sheet.tables.getItem('OrdersTable');
          const headerRange = expensesTable.getHeaderRowRange().load('values');
          await context.sync();

          const ids = new Array();
          const startIndex = range.rowIndex + 1;
          const endIndex = range.rowIndex + range.rowCount;
          for (let index = startIndex; index <= endIndex; ++index) {
            range = sheet.getRange(`A${index}`);
            range.load('values');
            await context.sync();
            const headers = headerRange.values[0];
            const statusIndex = this.getHeaderIndex(headers, 'status');
            if (statusIndex > 0) {
              const columnIndex = this.toColumnName(statusIndex);
              const address = `${columnIndex}${index}`;
              const statusRange = sheet.getRange(address);
              statusRange.load('values');
              await context.sync();
              if (statusRange.values !== null && statusRange.values !== undefined && statusRange.values.length > 0 
                  && statusRange.values[0][0] === 'NOT EXECUTED') {
                ids.push(range.values[0][0]);
              }
            }
          }
          this.completeObservable(observer, ids);
        } else {
          this.completeObservable(observer, null);
        }
      })
      .catch(error => {
        console.log(`Error: ${error}`);
        throw Observable.throw(error);
      });
    });
  }

  getChangedOrder(isRm: boolean): Observable<ExtendedOrder> {
    console.log('Officehelper getChangedOrder method');
    return Observable.create(observer => {
      Excel.run(async context => {
        const sheet = context.workbook.worksheets.getActiveWorksheet();
        sheet.load('name');
        await context.sync();
        const sheetName = isRm ? 'RM Orders' : 'My Orders';
        const tableName = isRm ? 'RMOrdersTable' : 'OrdersTable';
        if (sheet.name !== sheetName) {
          this.completeObservable(observer, null);
        } else {
          const range = context.workbook.getSelectedRange();
          range.load(['rowIndex']);
          await context.sync();
          const expensesTable = sheet.tables.getItem(tableName);
          expensesTable.rows.load(['count']);
          await context.sync();
          const rowIndex = range.rowIndex - 1;
          if (expensesTable !== null && expensesTable !== undefined && expensesTable.rows.count > rowIndex && rowIndex >= 0) {
            const rowRange = expensesTable.rows.getItemAt(rowIndex);
            rowRange.load('values');
            await context.sync();
            const rowValues = rowRange.values;
            const extendedOrder = new ExtendedOrder();
            extendedOrder.id = rowValues[0][0];
            extendedOrder.user_token = rowValues[0][2];
            extendedOrder.account = rowValues[0][3];
            extendedOrder.parseketable = rowValues[0][4];
            extendedOrder.isin = rowValues[0][5];
            extendedOrder.op_type = rowValues[0][6];
            extendedOrder.amount_ordered = rowValues[0][7];
            extendedOrder.limit_price = rowValues[0][8];
            extendedOrder.tif = rowValues[0][9];
            extendedOrder.instructions = rowValues[0][10];
            extendedOrder.security_name = rowValues[0][11];
            extendedOrder.side = rowValues[0][12];
            extendedOrder.filled_name = rowValues[0][13];
            extendedOrder.working = rowValues[0][14];
            extendedOrder.amnt_left = rowValues[0][15];
            extendedOrder.pct_left = rowValues[0][16];
            extendedOrder.average_price = rowValues[0][17];
            extendedOrder.broker_name = rowValues[0][18];
            extendedOrder.status = rowValues[0][19];
            extendedOrder.portfolio_manager = rowValues[0][20];
            extendedOrder.trader_name = rowValues[0][21];
            extendedOrder.order_date = rowValues[0][22];
            extendedOrder.order_creation = rowValues[0][23];
            extendedOrder.last_touched = rowValues[0][24];
            extendedOrder.ts_order_date = rowValues[0][25];
            extendedOrder.settle_date = rowValues[0][26];
            extendedOrder.security_id = rowValues[0][27];
            extendedOrder.order_number = rowValues[0][28];
            extendedOrder.ticket_number = rowValues[0][29];
            this.completeObservable(observer, extendedOrder);
          } else {
            this.completeObservable(observer, null);
          }
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
