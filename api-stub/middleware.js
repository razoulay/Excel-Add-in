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


    /** 
     * Returns agregated RM orders.
    */
    getRMOrders(userToken) {
        console.log(`gets the user's ${userToken} orders`);
        const self = this;
	
        return new Promise(function(resolve, reject) {
            const pool = new Pool({
                connectionString: self.connectionString,
            });
		    pool.connect()
                    console.log('connected');
                    const columnsClause = 'orders.id AS id, orders.asset_type, orders.isin, orders.security_name, orders.side, orders.limit_price, orders.average_price ,orders.tif, orders.broker_name, orders.portfolio_manager, orders.trader_name, orders.status , orders.order_creation, orders.last_touched, orders.ts_order_date, orders.instructions, SUM(CAST(allocations.amount_ordered AS int)) AS amount_ordered';
                    const whereClause = userToken !== '' ? ' WHERE user_token=$1::text' : '';
                    const query = {
                        text: 'select ' + columnsClause + ' from orders'  + ' INNER JOIN allocations ON orders.id = allocations.id' + whereClause +
                            ' GROUP BY orders.id, orders.asset_type, orders.isin, orders.security_name, orders.side, orders.limit_price, orders.average_price, orders.tif, orders.broker_name, orders.portfolio_manager, orders.trader_name, orders.status, orders.order_creation, orders.last_touched, orders.ts_order_date, orders.instructions;',
                        values: userToken !== '' ? [userToken] : null
                    };
		    
                    pool.query(query,
                                (error, results) => {
                                        if (error) {
                                                console.log("Error! ")
						reject(error);
                                        }
                                        const successResponse = self.successResponse();
                                        successResponse.rows = results.rows;
                                        successResponse.headers = self.getOrdersHeader();
                                        resolve(successResponse);
                                        console.log("get RM orders: ")
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
                    const columnsClause = 'orders.id, allocations.account AS account, orders.asset_type, orders.isin, orders.security_name, orders.limit_price, orders.side ,orders.tif, orders.broker_name, CAST(allocations.amount_ordered AS int)';
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
				'allocations.order_id AS id, allocations.account, allocations.amount_ordered, orders.user_token, orders.parseketable, orders.isin, orders.op_type, orders.limit_price, orders.tif, orders.instructions, ' +
                    		'orders.security_name, orders.side, orders.filled_name, orders.working, orders.amnt_left, orders.pct_left, orders.average_price, orders.broker_name, orders.status, orders.portfolio_manager, ' +
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
	(async () => {
                // note: we don't try/catch this because if connecting throws an exception
                // we don't need to dispose of the client (it will be undefined)
                const client = await pool.connect()
                try {   
			const queryText = 
                    		'INSERT INTO orders(user_token, parseketable, isin, op_type, limit_price, tif, instructions, ' +
                    		'security_name, side, filled_name, working, amnt_left, pct_left, average_price, broker_name, status, portfolio_manager, ' +
                    		'trader_name, order_date, order_creation, last_touched, ts_order_date, settle_date, security_id, order_number, ticket_number, order_id, asset_type) ' +
                    		'VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, ' +
                    		'$11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28' +
                    		') RETURNING id'
                    	const values = 	
				        [order.user_token,
                        		order.parseketable,
                        		order.isin,
                        		order.op_type,
                        		order.limit_price,
                        		order.tif,
                        		order.instructions,
                        		order.security_name,
                        		order.side,
                        		order.filled_name,
                        		order.working,
                        		order.amnt_left,
                        		order.pct_left,
                        		order.average_price,
                        		order.broker_name,
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
					order.asset_type
                    		]
                	
                        await client.query('BEGIN')
			const res = await client.query(queryText, values)
                        for (let i = 0; i < orders.length; i++){
 				order = orders[i];                       	
                        	const insertPhotoText = 'INSERT INTO allocations(account, amount_ordered, user_token, id) VALUES ($1, $2, $3, $4)'
                        	const insertPhotoValues = [order.account, order.amount_ordered, order.user_token ,res.rows[0].id]
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
                        	'tif=$3, instructions=$4, security_name=$5, average_price=$6, ' +
                        	'trader_name=$7, last_touched=$8, ts_order_date=$9 ,status=$10 ' +
                        	'where id=$11 returning *'
                        const values =
                                        [
                                        
                                        order.isin,
                                        order.limit_price,
                                        order.tif,
                                        order.instructions,
                                        order.security_name,
                                        order.average_price,
					order.trader_name,
                                        order.last_touched,
					order.ts_order_date,
					order.status,
                                        id
                                ]

                        await client.query('BEGIN')

                        const res = await client.query(queryText, values)
                        // const insertPhotoText = 'UPDATE allocations SET account=$1, amount_ordered=$2, where id=$3)'
                        // const insertPhotoValues = [order.account, order.amount_ordered, id]
                        // await client.query(insertPhotoText, insertPhotoValues)
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
                        values: [id, "CANCELED"
                        ]
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
				'allocations.order_id AS id, allocations.account, allocations.amount_ordered, orders.user_token, orders.parseketable, orders.isin, orders.op_type, orders.limit_price, orders.tif, orders.instructions, ' +
                                'orders.security_name, orders.side, orders.filled_name, orders.working, orders.amnt_left, orders.pct_left, orders.average_price, orders.broker_name, orders.status, orders.portfolio_manager, ' +
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
            'id',
	    'account',
            'asset_type',
            'isin',
            'amount_ordered',
            'limit_price',
            'tif',
            'instructions',
            'security_name',
            'side',
            'broker_name'
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
