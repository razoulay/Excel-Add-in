const { Client } = require('pg')
const { Pool } = require('pg')




class MiddlewareApi {
    constructor(connectionString) {
        this.connectionString = connectionString;
    }

    /**
     * 
     */
    authenticate(username, password) {
        console.log(`authenticate the user : ${username}/${password}`);
        const self = this;
        return new Promise(function(resolve, reject) {
            const client = new Client({
                connectionString: self.connectionString,
            });

            client
                .connect()
                .then(() => {
                    console.log('connected');
                    const query = {
                        text: 'select id, user_token, allow_update_orders, usertype from managers WHERE name=$1::text and password=$2::text',
                        values: [username, password]
                    };
        
                    client
                        .query(query)
                        .then(res => {
                            console.log(`query result received`);
                            const successResponse = self.successResponse();
                            successResponse.rows = res.rows;
                            client.end();
                            resolve(successResponse);
                        }, error => {
                                client.end();
                                resolve(self.errorResponse(error.message));
                            }
                        )
                        .catch(e => {
                            console.error(e.stack);
                            client.end();
                            resolve(self.errorResponse(err.message));
                        });
        
                })
                .catch(err => {
                    console.error('connection error', err.stack);
                    client.end();
                    resolve(self.errorResponse(err.message));
                }
            );
        });
    }


    getUsername( userToken ) {
        console.log(`get username : ${userToken}`);
        const self = this;
        return new Promise(function(resolve, reject) {
            const client = new Client({
                connectionString: self.connectionString,
            });

            client
                .connect()
                .then(() => {
                    console.log('connected');
                    const query = {
                        text: 'select name from managers WHERE user_token=$1::text',
                        values: [userToken ]
                    };

                    client
                        .query(query)
                        .then(res => {
                            console.log(`middleware.js:  `+res.rows[0].name);
                            const successResponse = self.successResponse();
                            successResponse.rows = res.rows;
                            client.end();
                            resolve(successResponse);
                        }, error => {
                                client.end();
                                resolve(self.errorResponse(error.message));
                            }
                        )
                        .catch(e => {
                            console.error(e.stack);
                            client.end();
                            resolve(self.errorResponse(err.message));
                        });

                })
                .catch(err => {
                    console.error('connection error', err.stack);
                    client.end();
                    resolve(self.errorResponse(err.message));
                }
            );
        });
    }


    getUserInfo( userName ) {
        console.log(`get userUserInfo : ${userName}`);
        const self = this;
        return new Promise(function(resolve, reject) {
            const client = new Client({
                connectionString: self.connectionString,
            });

            client
                .connect()
                .then(() => {
                    console.log('connected');
                    const query = {
                        text: 'select * from managers WHERE name=$1::text',
                        values: [userName ]
                    };

                    client
                        .query(query)
                        .then(res => {
                            console.log(`middleware.js:  `+res.rows[0].email);
                            const successResponse = self.successResponse();
                            successResponse.rows = res.rows;
                            client.end();
                            resolve(successResponse);
                        }, error => {
                                client.end();
                                resolve(self.errorResponse(error.message));
                            }
                        )
                        .catch(e => {
                            console.error(e.stack);
                            client.end();
                            resolve(self.errorResponse(err.message));
                        });

                })
                .catch(err => {
                    console.error('connection error', err.stack);
                    client.end();
                    resolve(self.errorResponse(err.message));
                }
            );
        });
    }

    /** 
     * Returns agregated RM orders.
    */
    getRMOrders(userToken) {
        console.log(`gets the user ${userToken} orders`);
        const self = this;
	
        return new Promise(function(resolve, reject) {
            const pool = new Pool({
                connectionString: self.connectionString,
            });
		    pool.connect()
                    console.log('connected');
                    const columnsClause = 'orders.id AS id, orders.asset_type, orders.isin, orders.security_name, orders.side, orders.op_type, orders.limit_price, orders.tif, orders.portfolio_manager, orders.trader_name, orders.status, orders.instructions , orders.order_creation, orders.last_touched, orders.ts_order_date, SUM(CAST(allocations.amount_ordered AS int)) AS amount_ordered';
                    const whereClause = userToken !== '' ? ' WHERE user_token=$1::text' : '';
                    const query = {
                        text: 'select ' + columnsClause + ' from orders'  + ' INNER JOIN allocations ON orders.id = allocations.id' + whereClause +
                            ' GROUP BY orders.id, orders.asset_type, orders.isin, orders.security_name, orders.side, orders.limit_price, orders.tif, orders.portfolio_manager, orders.trader_name, orders.status, orders.order_creation, orders.last_touched, orders.ts_order_date;',
                        values: userToken !== '' ? [userToken] : null
                    };
		    
                    pool.query(query,
                                (error, results) => {
                                        if (error) {
                                                console.log("Error in getRMOrders! ")
						reject(error);
                                        }
                                        const successResponse = self.successResponse();
                                        successResponse.rows = results.rows;
                                        successResponse.headers = self.getOrdersHeader();
                                        resolve(successResponse);
                                        console.log("get RM orders: ");
					
                                }
                    )
       });
    }


    /**
     * Returns Filtered RM orders for the trader.
    */
    getFilterOrders(Bank, AssetType) {
        console.log('get filter by: '+ Bank +" "+AssetType);
        const self = this;

        return new Promise(function(resolve, reject) {
            const pool = new Pool({
                connectionString: self.connectionString,
            });
                    pool.connect()
                    console.log('connected');
                    const columnsClause = 'orders.id, allocations.account AS account, allocations.broker_name AS broker_name ,orders.asset_type, orders.isin, orders.security_name, orders.op_type, orders.limit_price, orders.instructions, orders.side ,orders.tif, CAST(allocations.amount_ordered AS int)';
                    const whereClause1 = ' WHERE broker_name=$1::text' ;
		    const whereClause2 = ' AND asset_type=$2::text' ;
		    const whereClause3 = ' AND status=$3::text' ;
		    const whereClause = whereClause1 + whereClause2 + whereClause3;
                    const query = {
                        text: 'select ' + columnsClause + ' from orders'  + ' INNER JOIN allocations ON orders.id = allocations.id' + whereClause,
                        values: [Bank, AssetType, 'WORKING']
                    };

                    pool.query(query,
                                (error, results) => {
                                        if (error) {
                                                console.log("Error! ")
                                                reject(error);
                                        }
                                        const successResponse = self.successResponse();
                                        successResponse.rows = results.rows;
                                        successResponse.headers = self.getFilterOrdersHeader();
                                        resolve(successResponse);
                                        console.log("get filtered orders: ")
                                }
                    )
       });
    }


    /**
     * Returns orders with specific status.
    */
    getOrdersByStatus(stat) {
        console.log('get filter by: '+ stat);
        const self = this;

        return new Promise(function(resolve, reject) {
            const pool = new Pool({
                connectionString: self.connectionString,
            });
                    pool.connect()
                    console.log('connected');
                    const columnsClause = 'orders.asset_type , allocations.account AS account, orders.isin AS isin, orders.security_name AS ticker, orders.op_type AS type, orders.limit_price AS limit, orders.instructions AS ccy, orders.side AS side ,orders.tif AS validity, CAST(allocations.amount_ordered AS int) AS size,  allocations.broker_name AS prime';

                    
                    
                    const query = {
                        text: 'select ' + columnsClause + ' from orders'  + ' INNER JOIN allocations ON orders.id = allocations.id WHERE status=$1',
                        values: [stat]
                    };

                    pool.query(query,
                                (error, results) => {
                                        if (error) {
                                                console.log("Error! getOrdersBystatus")
                                                reject(error);
                                        }
                                        const successResponse = self.successResponse();
                                        successResponse.rows = results.rows;
                                        successResponse.headers = self.getFilterOrdersHeader();
                                        resolve(successResponse);
                                        console.log("get filtered orders: ")
                                }
                    )
       });
    }



    /** 
     * Returns all user 's orders
    */
    getOrders(userToken) {
        console.log(`gets the user's ${userToken} orders`);
        const self = this;
        return new Promise(function(resolve, reject) {
            const pool = new Pool({
                connectionString: self.connectionString,
            })
            		pool.connect()
	    		console.log('connected');
                    	const columnsClause = 
				'allocations.order_id AS id, allocations.account, allocations.amount_ordered, allocations.broker_name, allocations.average_price, orders.user_token, orders.parseketable, orders.isin, orders.op_type, orders.limit_price, orders.tif, ' +
                    		'orders.security_name, orders.side, orders.filled_name, orders.working, orders.amnt_left, orders.pct_left, orders.status, orders.portfolio_manager, orders.instructions' +
                    		'orders.trader_name, orders.order_date, orders.order_creation, orders.last_touched, orders.ts_order_date, orders.settle_date, orders.security_id, orders.order_number, orders.ticket_number, orders.order_id, orders.asset_type ';
                    	const whereClause = userToken !== '' ? ' WHERE allocations.user_token=$1::text' : '';
                    	const query = {
                        	text: 'select ' + columnsClause + 'from orders' + ' INNER JOIN allocations ON orders.id = allocations.id' + whereClause,
                        	values: userToken !== '' ? [userToken] : null
                    	};
				
		
			pool.query(query,
    				(error, results) => {
      					if (error) {
        					reject(error);
      					}
      					const successResponse = self.successResponse();
                            		successResponse.rows = results.rows;
                            		successResponse.headers = self.getOrdersHeader();
					resolve(successResponse);
					console.log("get orders: "+  successResponse.headers)
    				}
  			);	
      
	})
    }

    /**
     * Insert a new order to the orders table
     */
   
    
    addOrder(orders) {
    // console.log(`inserts the order: ${JSON.stringify(order)}`);
    const self = this;
    return new Promise(function(resolve, reject) {
        const pool = new Pool({
            connectionString: self.connectionString,
        });
	// console.log("entering pool")
	var order = orders[0];
	console.log("middleapi - order.tif: "+order.tif);
	(async () => {
                // note: we don't try/catch this because if connecting throws an exception
                // we don't need to dispose of the client (it will be undefined)
                const client = await pool.connect()
                try {   
			const queryText = 
                    		'INSERT INTO orders(user_token, parseketable, isin, op_type, limit_price, tif, ' +
                    		'security_name, side, filled_name, working, amnt_left, pct_left, status, portfolio_manager, ' +
                    		'trader_name, order_date, order_creation, last_touched, ts_order_date, settle_date, security_id, order_number, ticket_number, order_id, asset_type, instructions) ' +
                    		'VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, ' +
                    		'$11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26' +
                    		') RETURNING id'
                    	const values = 	
				        [order.user_token,
                        		order.parseketable,
                        		order.isin,
                        		order.op_type,
                        		order.limit_price,
                        		order.tif,
                        		order.security_name,
                        		order.side,
                        		order.filled_name,
                        		order.working,
                        		order.amnt_left,
                        		order.pct_left,
                        		order.status,
                        		order.portfolio_manager,
                        		order.trader_name,
                        		order.order_date,
                        		order.order_creation,
                        		order.last_touched,
                        		order.ts_order_date,
                        		order.settle_date,
                        		order.security_id,
                        		order.order_number,
                        		order.ticket_number,
                        		order.order_id,
					order.asset_type,
					order.instructions
                    		]
                	
                        await client.query('BEGIN')
			const res = await client.query(queryText, values)
                        for (let i = 0; i < orders.length; i++){
 				order = orders[i];                       	
                        	const insertPhotoText = 'INSERT INTO allocations(account, amount_ordered, user_token, broker_name, average_price, id) VALUES ($1, $2, $3, $4, $5, $6)'
                        	const insertPhotoValues = [order.account, order.amount_ordered, order.user_token, order.broker_name, order.average_price, res.rows[0].id]
                        	await client.query(insertPhotoText, insertPhotoValues)
                        	await client.query('COMMIT')
                        	console.log("commited "+  res.rows[0].id)
			}
                } catch (e) {
                await client.query('ROLLBACK')
                throw e
                } finally {
                
		const successResponse = self.successResponse(); 
                resolve(successResponse);
		client.release()
		
                }
        })().catch(e =>  console.error(e.stack))    	  
                
    });
    }

    /**
     * Insert a new bulk order to the orders table
     */


    addBulkOrder(orders) {
    // console.log(`inserts bulk orders: ${JSON.stringify(order)}`);
    const self = this;
    return new Promise(function(resolve, reject) {
        const pool = new Pool({
            connectionString: self.connectionString,
        });
        // console.log("entering pool")
        var order = orders[0];
        console.log("middleapi - order.tif: "+order);
        (async () => {
                // note: we don't try/catch this because if connecting throws an exception
                // we don't need to dispose of the client (it will be undefined)
                const client = await pool.connect()
                try {
                        
			for (let i = 0; i < orders.length; i++){
                                order = orders[i];
				const queryText =
                                	'INSERT INTO orders(user_token, parseketable, isin, op_type, limit_price, tif, ' +
                                	'security_name, side, filled_name, working, amnt_left, pct_left, status, portfolio_manager, ' +
                                	'trader_name, order_date, order_creation, last_touched, ts_order_date, settle_date, security_id, order_number, ticket_number, order_id, asset_type, instructions) ' +
                                	'VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, ' +
                                	'$11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26' +
                                	') RETURNING id'
                        	const values =
                                        	[order.user_token,
                                        	order.parseketable,
                                        	order.isin,
                                        	order.op_type,
                                        	order.limit_price,
                                        	order.tif,
                                        	order.security_name,
                                        	order.side,
                                        	order.filled_name,
                                        	order.working,
                                        	order.amnt_left,
                                        	order.pct_left,
                                        	order.status,
                                        	order.portfolio_manager,
                                        	order.trader_name,
                                        	order.order_date,
                                        	order.order_creation,
                                        	order.last_touched,
                                        	order.ts_order_date,
                                        	order.settle_date,
                                        	order.security_id,
                                        	order.order_number,
                                        	order.ticket_number,
                                        	order.order_id,
                                        	order.asset_type,
                                        	order.instructions
                                		]

                        	await client.query('BEGIN')
                        	const res = await client.query(queryText, values)
                        
                                const insertPhotoText = 'INSERT INTO allocations(account, amount_ordered, user_token, broker_name, average_price, id) VALUES ($1, $2, $3, $4, $5, $6)'
                                const insertPhotoValues = [order.account, order.amount_ordered, order.user_token, order.broker_name, order.average_price, res.rows[0].id]
                                await client.query(insertPhotoText, insertPhotoValues)
                                await client.query('COMMIT')
                                console.log("commited "+  res.rows[0].id)
                        }
                } catch (e) {
                await client.query('ROLLBACK')
                throw e
    		} finally {

                const successResponse = self.successResponse();
                resolve(successResponse);
                client.release()

                }
        })().catch(e =>  console.error(e.stack))

    });
    }


     /**
     * Updates the existing order
     */
    updateOrder(id, order) {
	console.log("middleapi - updateorder: "+order.amount_ordered);
        // console.log(`updates the order: ${JSON.stringify(order)}`);
        const self = this;
        return new Promise(function(resolve, reject) {
            const pool = new Pool({
                connectionString: self.connectionString,
            });
        
	    (async () => {
                // note: we don't try/catch this because if connecting throws an exception
                // we don't need to dispose of the client (it will be undefined)
                const client = await pool.connect()
                try {
                        const queryText =
                                'UPDATE orders SET isin=$1, limit_price=$2, ' +
                        	'tif=$3, security_name=$4, ' +
                        	'trader_name=$5, last_touched=$6, ts_order_date=$7 ,status=$8, instructions=$9, op_type=$10 ' +
                        	'where id=$11 returning *'
                        const values =
                                        [
                                        
                                        order.isin,
                                        order.limit_price,
                                        order.tif,
                                        order.security_name,
					order.trader_name,
                                        order.last_touched,
					order.ts_order_date,
					order.status,
					order.instructions,
					order.op_type,
                                        id
                                ]

                        await client.query('BEGIN')

                        const res = await client.query(queryText, values)
                        const insertPhotoText = 'UPDATE allocations SET amount_ordered=$1 where id=$2'
                        const insertPhotoValues = [order.amount_ordered, id]
                        await client.query(insertPhotoText, insertPhotoValues)
                        await client.query('COMMIT')
                        console.log("commited ")
                } catch (e) {
                await client.query('ROLLBACK')
                throw e
                } finally {
                const successResponse = self.successResponse();
                resolve(successResponse);
		client.release()

                }
            })().catch(e => console.error(e.stack))
    

        });
    }


    /**
     * Update allocation
     */
    updateAllocation(id, allocation) {
        console.log(allocation.amount_ordered);
        // console.log(`updates the order: ${JSON.stringify(order)}`);
        const self = this;
        return new Promise(function(resolve, reject) {
            const pool = new Pool({
                connectionString: self.connectionString,
            });

            (async () => {
                // note: we don't try/catch this because if connecting throws an exception
                // we don't need to dispose of the client (it will be undefined)
                const client = await pool.connect()
                try {
                        const queryText =
                                'UPDATE allocations SET amount_ordered=$1 where order_id=$2 returning id'
                        const values =
                                        [
                                        allocation.amount_ordered,
                                        id
                                ]

                        await client.query('BEGIN')
			console.log('allocation.amount_ordered 1');
                        const res = await client.query(queryText, values)
			
			//const queryAllocations = 'SELECT SUM(CAST(amount_ordered AS int)) FROM allocations where id=$1'
                        //const queryAllocationValues = [res.rows[0].id]
                        //const sumQuantites = await client.query(queryAllocations, queryAllocationValues)
                        //const insertPhotoText = 'UPDATE orders SET amount_ordered=$1 where id=$2'
                        //const insertPhotoValues = [sumQuantites, res.rows[0].id]
                        //await client.query(insertPhotoText, insertPhotoValues)
                        await client.query('COMMIT')
                        console.log("commited ")
                } catch (e) {
                await client.query('ROLLBACK')
                throw e
                } finally {
                const successResponse = self.successResponse();
                resolve(successResponse);
                client.release()

                }
            })().catch(e => console.error(e.stack))


        });
    }


    /**
     * The trader is booking the execution price for each account 
     */
    bookOrder(id, order) {
        console.log("middleapi - bookOrder: "+order.average_price);
        // console.log(`updates the order: ${JSON.stringify(order)}`);
        const self = this;
        return new Promise(function(resolve, reject) {
            const pool = new Pool({
                connectionString: self.connectionString,
            });

            (async () => {
                // note: we don't try/catch this because if connecting throws an exception
                // we don't need to dispose of the client (it will be undefined)
                const client = await pool.connect()
                try {
                        const queryText =
                                'UPDATE allocations SET average_price=$1 where order_id=$2 returning id'
                        const values =
                                        [
                                        order.average_price,
					
                                        id
                                ]

                        await client.query('BEGIN')

                        const res = await client.query(queryText, values)
                        const insertPhotoText = 'UPDATE orders SET ts_order_date=$1 ,status=$2 where id=$3'
                        const insertPhotoValues = [order.ts_order_date, order.status, res.rows[0].id]
                        await client.query(insertPhotoText, insertPhotoValues)
                        await client.query('COMMIT')
                        console.log("commited ")


                } catch (e) {
                await client.query('ROLLBACK')
                throw e
                }  finally {
			const successResponse = self.successResponse();
                	resolve(successResponse);
                	client.release()

                }
            })().catch(e => console.error(e.stack))

        });
    }

    deleteOrder(id)  {
        console.log(`deletes the order: ${id}`);
        const self = this;
        return new Promise(function(resolve, reject) {
            const client = new Client({
                connectionString: self.connectionString,
            });

            client
                .connect()
                .then(() => {
                    const query = {
                        text: 'update orders set status=$2 where id=$1',
                        values: [id, "CANCELED"]
                    };
        
                    client
                        .query(query)
                        .then(res => {
                            console.log(res.rows[0]);
                            console.log(`query result received`);
                            const successResponse = self.successResponse();
                            successResponse.rows = res.rows;
                            client.end();
                            resolve(successResponse);
                        }, error => {
                                client.end();
                                resolve(self.errorResponse(error.message));
                            }
                        )
                        .catch(e => {
                            console.error(e.stack);
                            client.end();
                            resolve(self.errorResponse(err.message));
                        });
         
                })
                .catch(err => {
                    console.error('connection error', err.stack);
                    client.end();
                    resolve(self.errorResponse(err.message));
                }
            );

        });
    }
    
    
    getAllocationsByOrderId(orderId) {
       console.log("middleware.js - getAllocationsByOrderId, orderid:  " + orderId )
        const self = this;

        return new Promise(function(resolve, reject) {
            const client = new Client({
                connectionString: self.connectionString,
            });

            client
                .connect()
                .then(() => {
                    console.log('connected');
                    const columnsClause = 
				'allocations.order_id AS id, allocations.account, allocations.amount_ordered, allocations.broker_name, allocations.average_price, orders.instructions, orders.user_token, orders.parseketable, orders.isin, orders.op_type, orders.limit_price, orders.tif, ' +
                                'orders.security_name, orders.side, orders.filled_name, orders.working, orders.amnt_left, orders.pct_left, orders.status, orders.portfolio_manager, ' +
                                'orders.trader_name, orders.order_date, orders.order_creation, orders.last_touched, orders.ts_order_date, orders.settle_date, orders.security_id, orders.order_number, orders.ticket_number, orders.order_id, orders.asset_type ';
                    const whereClause =' WHERE orders.id = $1';
                    const query = {
                        text: 'select ' + columnsClause + ' from orders'  + ' INNER JOIN allocations ON orders.id = allocations.id'  + whereClause,
			values: [ orderId ]
                    };

                    client
                        .query(query)
                        .then(res => {
                            console.log(`query result received: `+ res);
                            const successResponse = self.successResponse();
                            successResponse.rows = res.rows;
                            successResponse.headers = self.getOrdersHeader();
                            client.end();
                            resolve(successResponse);
                        }, error => {
                                client.end();
                                resolve(self.errorResponse(error.message));
                            }
                        )
                        .catch(e => {
                            console.error(e.stack);
                            client.end();
                            resolve(self.errorResponse(err.message));
                        });

                })
                .catch(err => {
                    console.error('connection error', err.stack);
                    client.end();
                    resolve(self.errorResponse(err.message));
                }
            );
        });
    }

		
    /**
     * Helper function to return success response
     */
    successResponse() {
        return {
            success: true
        };
    }

    /**
     * Helper function to return error response
     */
    errorResponse(message) {
        return {
            success: false,
            error: message
        };
    }

    create_UUID() {
        var dt = new Date().getTime();
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
            var r = (dt + Math.random()*16)%16 | 0;
            dt = Math.floor(dt/16);
            return (c=='x' ? r :(r&0x3|0x8)).toString(16);
        });
        return uuid;
    }
	
    getOrdersHeader() {
        const data = [
            'id',
            'account',
	    'asset_type',
            'isin',
            'amount_ordered',
	    'op_type',
            'limit_price',
            'tif',
            'instructions',
            'security_name',
            'side',
            'average_price',
            'broker_name',
            'status',
            'portfolio_manager',
            'trader_name',
            'order_creation',
            'last_touched',
            'ts_order_date'
        ];
        return data;
    }


    getFilterOrdersHeader() {
        const data = [
            'asset_type',
	    'ticker',
            'isin',
	    'ccy',
	    'side',
	    'size',
	    'type',
            'limit',
            'validity',
            'account',
	    'prime',
            
        ];
        return data;
    }


    getOrdersHeader_CompleteList() {
        const data = [
            'id', 
            'order_id', 
            'user_token', 
            'account', 
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
        ];
        return data;
    }
}

module.exports = {
    MiddlewareApi
};
