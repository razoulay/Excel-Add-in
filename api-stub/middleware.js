const { Client } = require('pg')

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
                        text: 'select id, user_token, allow_update_orders from managers WHERE name=$1::text and password=$2::text',
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

    /** 
     * Returns all user's orders
    */
    getOrders(userToken) {
        console.log(`gets the user's ${userToken} orders`);
        const self = this;
        return new Promise(function(resolve, reject) {
            const client = new Client({
                connectionString: self.connectionString,
            });

            client
                .connect()
                .then(() => {
                    console.log('connected');
                    const columnsClause = 'id, order_id, user_token, account, parseketable, isin, op_type, amount_ordered, limit_price, tif, instructions, ' +
                    'security_name, side, filled_name, working, amnt_left, pct_left, average_price, broker_name, status, portfolio_manager, ' +
                    'trader_name, order_date, order_creation, last_touched, ts_order_date, settle_date, security_id, order_number, ticket_number ';
                    const whereClause = userToken !== '' ? ' WHERE user_token=$1::text' : '';
                    const query = {
                        text: 'select ' + columnsClause + 'from orders' + whereClause,
                        values: userToken !== '' ? [userToken] : null
                    };
        
                    client
                        .query(query)
                        .then(res => {
                            console.log(`query result received`);
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
     * Insert a new order to the orders table
     */
    addOrder(order) {
        console.log(`inserts the order: ${JSON.stringify(order)}`);
        const self = this;
        return new Promise(function(resolve, reject) {
            const client = new Client({
                connectionString: self.connectionString,
            });

            client
                .connect()
                .then(() => {
                    console.log('connected: ' + order.user_token);
                    const query = {
                        text: 'insert into orders(user_token, account, parseketable, isin, op_type, amount_ordered, limit_price, tif, instructions, ' +
                        'security_name, side, filled_name, working, amnt_left, pct_left, average_price, broker_name, status, portfolio_manager, ' +
                        'trader_name, order_date, order_creation, last_touched, ts_order_date, settle_date, security_id, order_number, ticket_number, order_id) ' +
                        'values($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, ' +
                        '$11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29' +
                        ') RETURNING *',
                        values: [order.user_token,
                        	order.account,
                            order.parseketable,
                            order.isin,
                            order.op_type,
                            order.amount_ordered,
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
                            order.order_id
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

    /**
     * Updates the existing order
     */
    updateOrder(id, order) {
        console.log(`updates the order: ${JSON.stringify(order)}`);
        const self = this;
        return new Promise(function(resolve, reject) {
            const client = new Client({
                connectionString: self.connectionString,
            });

            client
                .connect()
                .then(() => {
                    const query = {
                        text: 'update orders set user_token=$1, account=$2, parseketable=$3, isin=$4, op_type=$5, amount_ordered=$6, limit_price=$7, ' +
                        'tif=$8, instructions=$9, security_name=$10, side=$11, filled_name=$12, working=$13, amnt_left=$14, pct_left=$15, average_price=$16, ' +
                        'broker_name=$17, status=$18, portfolio_manager=$19, trader_name=$20, order_date=$21, order_creation=$22, last_touched=$23, ts_order_date=$24, ' +
                        'settle_date=$25, security_id=$26, order_number=$27, ticket_number=$28 where id=$29 returning *',
                        values: [order.user_token,
                        	order.account,
                            order.parseketable,
                            order.isin,
                            order.op_type,
                            order.amount_ordered,
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
                            id
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
                        text: 'delete from orders where id=$1',
                        values: [id
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
            'ticket_number'
        ];
        return data;
    }
}

module.exports = {
    MiddlewareApi
};
