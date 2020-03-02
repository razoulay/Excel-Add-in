const { Client } = require('pg')
const { Pool } = require('pg')




	
        const self = this;

        return new Promise(function(resolve, reject) {
            const pool = new Pool({
                connectionString: 'postgresql://rmaddin:123456@localhost:5432/middlewaredb',
            });
                    pool.connect()
                    console.log('connected');
                    const columnsClause = 'orders.id AS id, isin, op_type, limit_price, working, status, tif, broker_name, order_number , SUM(CAST(allocations.amount_ordered AS int)) AS amount_ordered';
                    
                    const query = {
                        text: 'select ' + columnsClause + ' from orders'  + ' INNER JOIN allocations ON orders.id = allocations.id' +
                            ' GROUP BY orders.id, isin, op_type, limit_price, working, status, tif, broker_name, order_number;',
                        
                    };

                    pool.query(query,
                                (error, results) => {
                                        if (error) {
                                                reject(error);
                                        }
                                        const successResponse = self.successResponse();
                                        successResponse.rows = results;
                                        successResponse.headers = self.getOrdersHeader();
                                        resolve(successResponse);
                                        console.log("get RM orders: "+  results)
                                }
                    );
       });



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


    


