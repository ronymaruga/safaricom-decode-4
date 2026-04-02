Page({
  onLoad(query) {
    // Page load
    this.webViewContext = my.createWebViewContext('decodeStarter');
    console.info(`Page onLoad with query: ${JSON.stringify(query)}`);
  },
  onReady() {
    // Page loading is complete
  },
  onShow() {
    // Page display
  },
  onHide() {
    // Page hidden
  },
  onUnload() {
    // Page is closed
  },
  onTitleClick() {
    // Title clicked
  },
  onPullDownRefresh() {
    // Page is pulled down
  },
  onReachBottom() {
    // Page is pulled to the bottom
  },
  onShareAppMessage() {
    // Back to custom sharing information
    return {
      title: 'My App',
      desc: 'My App description',
      path: 'pages/index/index',
    };
  },
  onMessage(e){
    // Handle payments
  if (e.detail.action === "pay") {
    my.call('buyGoods', {
      tillNumber: e.detail.tillNumber,
      amount: e.detail.amount,
      currency: 'KES',
      reason: `Purchase from ${e.detail.tradingName}`,
      success: (res) => {
        console.log('Payment Success Response:', res);
        
        // Extract transaction ID
        const transactionId = res.transactionId || res.orderId || null;
        
        // Format success response for H5
        const paymentResponse = {
          action: 'payments',
          type: 'paymentResponse',
          success: true,
          status: 'success',
          transactionId: transactionId,
        };
        
        // Send to H5
        this.webViewContext.postMessage(paymentResponse);
        
       
      },
      fail: (res) => {
        console.log('Payment Failed Response:', res);
        
        // Format error response for H5
        const paymentResponse = {
          action: 'payments',
          type: 'paymentResponse',
          success: false,
          status: 'failed',
          errorCode: res.error || res.errorCode || 'PAYMENT_FAILED',
          errorMessage: res.errorMessage || res.message || 'Payment failed',
          message: res.errorMessage || res.message || 'Payment failed',
        };
        
        // Send to H5
        this.webViewContext.postMessage(paymentResponse);
        
     
      },
    });
  }
  },
});
