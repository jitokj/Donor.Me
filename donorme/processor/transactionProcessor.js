/**
 * Code to specify Transaction Processor portion.
 * 
 * Transfers Transaction Processing requests to registered handlers (DonorMeHandler & WaitlistHandler).
 */

  'use strict'
  // Works in strict mode

  const { TransactionProcessor } = require('sawtooth-sdk/processor')
  const DonorMeHandler = require('./DonorMeHandler');
  const WaitlistHandler = require('./WaitlistHandler');
  
  const address = 'tcp://validator:4004';
  console.log('Connected--------------------------------------------');
  const transactionProcessor = new TransactionProcessor(address);
  transactionProcessor.addHandler(new DonorMeHandler());
  transactionProcessor.addHandler(new WaitlistHandler());
  transactionProcessor.start();