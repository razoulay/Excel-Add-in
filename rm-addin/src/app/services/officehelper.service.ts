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

  static changedOrders: any;

  constructor(private dataService: DataService) {
    console.log('Officehelper service created');
    OfficehelperService.changedOrders = new Array();
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
	    ['Asset Type:', '', ''] ,
	    ['Isin:', '', ''] ,
	    ['Security name:', '', ''] ,
	    ['Side:', '', ''] ,
	    ['Orders sum:', '', ''] ,
	    ['Limit Price:', '', ''] ,
	    ['Valid:', 'Today', ''],
	    ['Prime:', '', ''],
            ['Allocations', '', ''],
            ['Account', 'Quantity', 'Comment'],
          ];

          let range = sheet.getRange('A1:C10');
          range.values = data;
          range.format.font.bold = true;
          range.format.autofitColumns();
          await context.sync();
	  
	  range = sheet.getRange('A9');
	  range.format.fill.color = "#FFC300";
	  await context.sync();

          range = sheet.getRange('B1');
          range.dataValidation.rule = {
            list: {
                inCellDropDown: true, 
                source: 'Equity, Bonds, Mutual Fund, Hedge Fund, Options, Futures'
            }
          };

	  range = sheet.getRange('B4');
          range.dataValidation.rule = {
            list: {
                inCellDropDown: true,
                source: 'Buy, Sell'
            }
          };

          range = sheet.getRange('B7');
          range.dataValidation.rule = {
            list: {
                inCellDropDown: true,
                source: 'Today,GTC'
            }
	  };

	  range = sheet.getRange('B8');
          range.dataValidation.rule = {
            list: {
                inCellDropDown: true,
                source: 'PICTET, UBP, SGV'
            }
          };

          await context.sync();

          range = sheet.getRange('A9:C9');
          range.merge(true);
          await context.sync();

          range = sheet.getRange('A11');
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
   * Initializes a filtered new Trade Sheet
   */
  filteredOrderSheet(): Observable<boolean> {
    console.log('Officehelper filtered sheet method');
    return Observable.create(observer => {
      if (Office.context !== undefined && Office.context != null) {
        Excel.run(async context => {
          const sheetName = 'Filter Orders';
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
	    ['Parameters', ''] ,
            ['Asset Type:', ''] ,
            ['Bank:', ''] 
          ];
		
	  
          let range = sheet.getRange('A1:B3');
          range.values = data;
          range.format.font.bold = true;
          range.format.autofitColumns();
          await context.sync();

          range = sheet.getRange('A1');
          range.format.fill.color = "#FFC300";
          await context.sync();

          range = sheet.getRange('B2');
          range.dataValidation.rule = {
            list: {
                inCellDropDown: true,
                source: 'Equity, Bonds, Mutual Fund, Hedge Fund, Options, Futures'
            }
          };

          range = sheet.getRange('B3');
          range.dataValidation.rule = {
            list: {
                inCellDropDown: true,
                source: 'PICTET, UBP, SGV'
            }
          };

          await context.sync();
		
	  range = sheet.getRange('B2');
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

          OfficehelperService.changedOrders = new Map();

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
                  source: 'SUSPENDED, MODIFIED'
              }
            };
	      
	    
	
	    var rowRange = expensesTable.columns.getItem("status").load("values");
            await context.sync();
            console.log("rowrange: "+ rowRange.values +" rowrange length: "+rowRange.values.length);
	
	    for (let i=0; i < rowRange.values.length; i++){
	
		if (rowRange.values[i] == "MODIFIED" || rowRange.values[i] == "NEW"){ 
			console.log("rowRange.values[i]: "+ rowRange.values[i] +"i: "+i);
			expensesTable.rows.getItemAt(i-1).getRange().format.fill.color = "#FFC300"; 
		}
	    }
          }
		
  	  	  
          expensesTable.onChanged.add(this.onTableChanged);
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

          OfficehelperService.changedOrders = new Map();

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
                  source: 'WORKING, MODIFIED'
              }
            };
            await context.sync();
          
	    var rowRange = expensesTable.columns.getItem("status").load("values");
            await context.sync();
            console.log("rowrange: "+ rowRange.values +" rowrange length: "+rowRange.values.length);

            for (let i=0; i < rowRange.values.length; i++){

                if (rowRange.values[i] == "MODIFIED" || rowRange.values[i] == "NEW"){
                        console.log("rowRange.values[i]: "+ rowRange.values[i] +" i: "+i);
                        expensesTable.rows.getItemAt(i-1).getRange().format.fill.color = "#FFC300";
                }
            }
	  }

          expensesTable.onChanged.add(this.onTableChanged);
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


  createDetailedRMOrdersSheet(headers: any, rows:any , order: any, isTrader: boolean): Observable<boolean>{
  
  
    console.log('createDetailedRMOrdersSheet method');
    return Observable.create(observer => {
      if (Office.context !== undefined && Office.context != null) {
        Excel.run(async context => {
	  
	  const sheetName = isTrader ? 'RM Orders' : 'My Orders';
          const tableName = isTrader ? 'RMOrdersTable' : 'OrdersTable';

    
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

          OfficehelperService.changedOrders = new Map();

          const expensesTable = sheet.tables.add(`A1:${this.toColumnName(headers.length)}1`, true);
          expensesTable.name = tableName;

          expensesTable.getHeaderRowRange().values = [ headers ];

          if (rows !== null && rows !== undefined && rows.length > 0) {
            
		const data = this.getJsonDataAsArray(headers, rows);

		console.log("TypeofData: "+ typeof(data)+ " Data: "+ data+ " order: "+order.status+ " typof order:"+ typeof(order))
		
		expensesTable.rows.add(null,  [ [order.id, order.account,  order.asset_type, order.isin, order.amount_ordered ,order.limit_price, order.tif, order.instructions, order.security_name, order.side, order.average_price, order.broker_name, order.status, order.portfolio_manager, order.trader_name, order.order_creation, order.last_touched, order.ts_order_date ]  ]);
		
		expensesTable.rows.add(null, data);
	   	expensesTable.rows.getItemAt(0).getRange().format.fill.color = "#FFC300"; 
          }

          if (Office.context.requirements.isSetSupported('ExcelApi', '1.2')) {
              sheet.getUsedRange().format.autofitColumns();
              sheet.getUsedRange().format.autofitRows();
          }

          sheet.activate();
          await context.sync();

          const statusIndex = this.getHeaderIndex(headers, 'working');
          if (statusIndex > 0) {
            const columnIndex = this.toColumnName(statusIndex);
            const address = `${columnIndex}2:${columnIndex}${rows.length + 1}`;
            const range = sheet.getRange(address);
            range.dataValidation.rule = {
              list: {
                  inCellDropDown: true,
                  source: 'WORKING, MODIFIED'
              }
            };
            await context.sync();
          }

          expensesTable.onChanged.add(this.onTableChanged);
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

  onTableChanged(eventArgs) {
    Excel.run(async context => {
        const address = eventArgs.address;

        const sheet = context.workbook.worksheets.getActiveWorksheet();
        const range = sheet.getRange(address);
        range.load(['rowIndex']);
        await context.sync();
        const rowIndex = range.rowIndex;
        console.log(`Changes at ${address}, rowIndex = ${rowIndex}`);
        OfficehelperService.changedOrders.set(rowIndex, rowIndex);
        return context.sync();
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

	let values = null ;	
	let metadata =null;
	const range = sheet.getRange(`A1:C8`);
        range.load('values');
        await context.sync();
	metadata = range.values;
	console.log("metadata: "+metadata);

        const uRowsIndex = sheet.getCell(0, 0).getEntireColumn().getUsedRange().getLastCell().load(['rowIndex']);
        await context.sync();
        console.log(`uIndex: ${uRowsIndex.rowIndex}`);
        
        if (uRowsIndex.rowIndex > 9) {
          const range = sheet.getRange(`A11:C${uRowsIndex.rowIndex + 1}`);
          range.load('values');
          await context.sync();
          values = range.values;
	  console.log("values: "+ values)
        }
	let valuesTemp = [];
	valuesTemp[0] = metadata;
	valuesTemp[1] = values;

	this.completeObservable(observer, valuesTemp);
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
    console.log('Officehelper CheckNewTrade method');
    return Observable.create(observer => {
      Excel.run(async context => {
        const sheet = context.workbook.worksheets.getActiveWorksheet();
        const uRowsIndex = sheet.getCell(0, 0).getEntireColumn().getUsedRange().getLastCell().load(['rowIndex']);
        await context.sync();
        console.log(`uIndex: ${uRowsIndex.rowIndex}`);
	let allowSubmit = false;

	let AssetType = '';
        let AssetTypeRange = sheet.getRange('B1');
        AssetTypeRange.load('values');
        await context.sync();

        if (AssetTypeRange.values.length > 0) {
                AssetType = AssetTypeRange.values[0][0];
        }

	let isin = '';
        let isinRange = sheet.getRange('B2');
        isinRange.load('values');
        await context.sync();

        if (isinRange.values.length > 0) {
                isin = isinRange.values[0][0];
        }

	let securityName = '';
        let securityNameRange = sheet.getRange('B3');
        securityNameRange.load('values');
        await context.sync();

        if (securityNameRange.values.length > 0) {
                securityName = securityNameRange.values[0][0];
        }
        console.log("securityname: "+securityName);

	let side = '';
        let sideRange = sheet.getRange('B4');
        sideRange.load('values');
        await context.sync();

        if (sideRange.values.length > 0) {
                side = sideRange.values[0][0];
        }
        console.log("side: "+side);

	let limit = '';
        let limitRange = sheet.getRange('B6');
        limitRange.load('values');
        await context.sync();

        if (limitRange.values.length > 0) {
                limit = limitRange.values[0][0];
        }
	console.log("limit: "+limit);

	let prime = '';
        let primeRange = sheet.getRange('B8');
        primeRange.load('values');
        await context.sync();

        if (primeRange.values.length > 0) {
                prime = primeRange.values[0][0];
        }
        console.log("prime: "+prime);

        if (uRowsIndex.rowIndex > 9) {
          let range = sheet.getRange('C1');
          range.formulas = [[ `=SUM(B11:B${uRowsIndex.rowIndex + 1})` ]];
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
          
	  if (totalSum !== null && totalSum !== undefined && totalSum !== '' && AssetType !== null && AssetType !== undefined && AssetType !== '' && isin !== null && isin !== undefined && isin !== '' && securityName !== null && securityName !== undefined && securityName !== '' && side !== null && side !== undefined && side !== '' && limit !== null && limit !== undefined && limit !== '' && prime !== null && prime !== undefined && prime !== '' ) {
            range = sheet.getRange('B5');
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


  /**
   * Returns the filtered paramateres entered in the sheet
   */
  getFilteredParamaters(): Observable<any> {
    console.log('Officehelper get Filtered paramaters method');
    return Observable.create(observer => {
      Excel.run(async context => {
        const sheet = context.workbook.worksheets.getActiveWorksheet();

        
        const AssetTypeRange = sheet.getRange(`B2`);
        AssetTypeRange.load('values');
	await context.sync();

	const BanksRange = sheet.getRange(`B3`);
        BanksRange.load('values');
	await context.sync();

	let FilteredParamaters = [];
	FilteredParamaters[0] = AssetTypeRange.values[0][0];
        FilteredParamaters[1] = BanksRange.values[0][0];
        console.log("FilteredParamaters[0]: "+FilteredParamaters[0]);

        this.completeObservable(observer, FilteredParamaters);
      })
      .catch(error => {
        console.log(`Error: ${error}`);
        throw Observable.throw(error);
      });
    });
  }


  /**
   * Checks is filtered data ready to submit
   */
  checkFilteredData(): Observable<boolean> {
    console.log('Officehelper checkFilteredData method');
    return Observable.create(observer => {
      Excel.run(async context => {
        const sheet = context.workbook.worksheets.getActiveWorksheet();
        const uRowsIndex = sheet.getCell(0, 0).getEntireColumn().getUsedRange().getLastCell().load(['rowIndex']);
        await context.sync();
        console.log(`uIndex: ${uRowsIndex.rowIndex}`);
        let allowSubmit = false;
        if (uRowsIndex.rowIndex > 1) {
          let AssetTypeRange = sheet.getRange('B2');
          AssetTypeRange.load('values');
          await context.sync();
          let BanksRange = sheet.getRange('B3');
          BanksRange.load('values');
          await context.sync();
          
	  console.log("BanksRange "+BanksRange);
          if (AssetTypeRange !== null && AssetTypeRange !== undefined && AssetTypeRange !== '' &&  BanksRange!== null && BanksRange !== undefined && BanksRange !== '') {
            
	    console.log("allowsumbit in check filtered data"+ true );
            allowSubmit = true;
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
          console.log("sheet: "+sheet);
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
	    console.log("INDEX : "+ index)
            const headers = headerRange.values[0];
	    console.log("headers: "+  headerRange.values[0])
	    console.log("range.values[0][0]: "+ range.values[0][0])
            const statusIndex = this.getHeaderIndex(headers, 'status');
            if (statusIndex > 0) {
              const columnIndex = this.toColumnName(statusIndex);
	      console.log("columnIndex: "+  columnIndex)
              const address = `${columnIndex}${index}`;
	      console.log("address: "+  address)
              const statusRange = sheet.getRange(address);
              statusRange.load('values');
              await context.sync();
              if (statusRange.values !== null && statusRange.values !== undefined && statusRange.values.length > 0 
                  && statusRange.values[0][0] !== 'EXECUTED' && statusRange.values[0][0] !== 'CANCELED') {
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
	console.log('sheetname: '+ sheetName+ ' ' +sheet.name);
        if (sheet.name !== sheetName) {
          this.completeObservable(observer, null);
        } else {
          if (OfficehelperService.changedOrders.size > 0) {
            const orders = new Array();
            const expensesTable = sheet.tables.getItem(tableName);
            expensesTable.rows.load(['count']);
            const headerRange = expensesTable.getHeaderRowRange().load('values');
            await context.sync();
            const headers = headerRange.values[0];
            const statusIndex = this.getHeaderIndex(headers, 'status');

            for (let rowIndex of OfficehelperService.changedOrders.values()) {
              rowIndex = rowIndex - 1;
	      console.log('rowindex: '+ rowIndex);
              if (expensesTable !== null && expensesTable !== undefined && expensesTable.rows.count > rowIndex && rowIndex >= 0) {
                const rowRange = expensesTable.rows.getItemAt(rowIndex);
                rowRange.load('values');
                await context.sync();
                const rowValues = rowRange.values;
                const statusValue = rowValues[0][statusIndex - 1];
		const isTrader = isRm ? 'True' : 'False';
		let passageOk = 'True'
		if (isTrader === 'True' && statusValue === 'SUSPENDED'){
                    passageOk = 'False';
                }
                if (isTrader === 'False' && statusValue === 'WORKING'){
                    passageOk = 'False';
                }
               	console.log('passage ok: '+ passageOk);
		if (statusValue !== 'EXECUTED' && statusValue != 'CANCELED' && passageOk === 'True' ) {
		  
                  const extendedOrder = new ExtendedOrder();
                  extendedOrder.id = rowValues[0][0];
                  extendedOrder.limit_price = rowValues[0][5];
                  extendedOrder.instructions = rowValues[0][7];
                  extendedOrder.security_name = rowValues[0][8];                  
		  extendedOrder.isin = rowValues[0][3];
	          extendedOrder.tif = rowValues[0][6];
		  extendedOrder.average_price = rowValues[0][10];
		  extendedOrder.last_touched = rowValues[0][16];
		  orders.push(extendedOrder);
		  console.log("orders[indesx]: "+typeof(extendedOrder.status)+ " " +typeof(extendedOrder.amount_ordered));

		}


			
              }
            }
            OfficehelperService.changedOrders = new Map();
            this.completeObservable(observer, orders);
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


  getSelectedOrder(isTrader, checkStatus): Observable<ExtendedOrder> {
  console.log('Officehelper getSelectedOrder method. Check staus? ' + checkStatus);
  return Observable.create(observer => {
    Excel.run(async context => {
      let range = context.workbook.getSelectedRange();
      range.load(['rowCount', 'rowIndex']);
      await context.sync();
      console.log(range.rowIndex + '; ' + range.rowCount);

      if (range.rowCount > 0 && range.rowIndex > 0) {
        const sheet = context.workbook.worksheets.getActiveWorksheet();
        console.log("sheet: "+sheet);
	sheet.load('name');
        const sheetName = isTrader ? 'RM Orders' : 'My Orders';
        const tableName = isTrader ? 'RMOrdersTable' : 'OrdersTable';
        await context.sync();

        if (sheet.name !== sheetName) {
          this.completeObservable(observer, null);
        } else {
          const orders = new Array();
          
          const expensesTable = sheet.tables.getItem(tableName);
          expensesTable.rows.load(['count']);
          const headerRange = expensesTable.getHeaderRowRange().load('values');
          await context.sync();
          const headers = headerRange.values[0];
          const statusIndex = this.getHeaderIndex(headers, 'status');

          const startIndex = range.rowIndex + 1;
          const endIndex = range.rowIndex + range.rowCount;

          for (let index = startIndex; index <= endIndex; ++index) {

            range = sheet.getRange(`A${index}`);
            range.load('values');
            await context.sync();
            console.log("index: "+ index)
            
            console.log("range.values[0][0]: "+ range.values[0][0])
            if (statusIndex > 0) {
              const columnIndex = this.toColumnName(statusIndex);
              console.log("columnIndex: "+  columnIndex)
              const address = `${columnIndex}${index}`;
              console.log("address: "+  address)
              const statusRange = sheet.getRange(address);
              statusRange.load('values');
              await context.sync();

	      var pass_ok = 1;
	      console.log("getSelectedOrder passok " + isTrader + " " + statusRange.values[0][0])
	      if (checkStatus == 1 && statusRange.values !== null && statusRange.values !== undefined && statusRange.values.length > 0 && (statusRange.values[0][0] == 'EXECUTED' || statusRange.values[0][0] == 'CANCELED' )){
	      	pass_ok = 0;
	      }
	      
	      if (checkStatus == 1 && isTrader && statusRange.values[0][0] == 'SUSPENDED'  ){
	      	console.log("getSelectedOrder passok " + isTrader + " " + pass_ok)
	      	pass_ok = 0;
	      }

	      if (checkStatus == 1 && !isTrader && statusRange.values[0][0] == 'WORKING'){
	      	console.log("getSelectedOrder passok " + isTrader + " " + pass_ok)
                pass_ok = 0;
	      }
	

              if (expensesTable !== null && expensesTable !== undefined && pass_ok == 1 && statusRange.values !== null && statusRange.values !== undefined && statusRange.values.length > 0) {
                    
		    var itemIndex = index-2
                    const rowRange = expensesTable.rows.getItemAt( itemIndex );
                    rowRange.load('values');
                    await context.sync();
		    console.log("Index is (index - 2) to get item of table "+itemIndex );
                    const rowValues = rowRange.values;
                    
                    const extendedOrder = new ExtendedOrder();
                    extendedOrder.id = rowValues[0][0];
                    extendedOrder.account = rowValues[0][1];
                    extendedOrder.asset_type = rowValues[0][2];
                    extendedOrder.isin = rowValues[0][3];
                    extendedOrder.amount_ordered = rowValues[0][4];
                    extendedOrder.limit_price = rowValues[0][5];
                    extendedOrder.tif = rowValues[0][6];
                    extendedOrder.instructions = rowValues[0][7];
                    extendedOrder.security_name = rowValues[0][8];
                    extendedOrder.side = rowValues[0][9];
                    extendedOrder.average_price = rowValues[0][10];
                    extendedOrder.broker_name = rowValues[0][11];
                    extendedOrder.status = rowValues[0][12];
                    extendedOrder.portfolio_manager = rowValues[0][13];
                    extendedOrder.trader_name = rowValues[0][14];
                    extendedOrder.order_creation = rowValues[0][15];
                    extendedOrder.last_touched = rowValues[0][16];
                    extendedOrder.ts_order_date = rowValues[0][17];
 
		    
		    orders.push(extendedOrder);
		    console.log("orders[indesx]: "+typeof(extendedOrder.status)+ " " +typeof(extendedOrder.amount_ordered)+" "+rowValues[0][5]+" "+rowValues[0][7]);
              }
            }
          }
          this.completeObservable(observer, orders);
      }} else {
        this.completeObservable(observer, null);
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
	'ticket_number',
	'asset_type'
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
