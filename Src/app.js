import React, { useState, useRef, useEffect } from 'react';
import { Download, Receipt, Shield, CheckCircle, Archive, Trash2, Eye } from 'lucide-react';

const EReceiptApp = () => {
  const [receiptData, setReceiptData] = useState({
    receiptNumber: '',
    date: new Date().toISOString().split('T')[0],
    receivedFrom: '',
    amountNumbers: '',
    amountWords: '',
    paymentFor: '',
    paymentMethod: 'Cash',
    additionalNotes: ''
  });

  const [archivedReceipts, setArchivedReceipts] = useState([]);
  const [showArchive, setShowArchive] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const receiptRef = useRef(null);

  const numberToWords = (num) => {
    if (!num || num === 0) return '';
    
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    
    const convertHundreds = (n) => {
      let result = '';
      if (n >= 100) {
        result += ones[Math.floor(n / 100)] + ' Hundred ';
        n %= 100;
      }
      if (n >= 20) {
        result += tens[Math.floor(n / 10)];
        if (n % 10 !== 0) result += ' ' + ones[n % 10];
      } else if (n >= 10) {
        result += teens[n - 10];
      } else if (n > 0) {
        result += ones[n];
      }
      return result.trim();
    };
    
    const number = parseInt(num);
    if (number === 0) return 'Zero';
    
    let result = '';
    let billion = Math.floor(number / 1000000000);
    let million = Math.floor((number % 1000000000) / 1000000);
    let thousand = Math.floor((number % 1000000) / 1000);
    let hundred = number % 1000;
    
    if (billion > 0) result += convertHundreds(billion) + ' Billion ';
    if (million > 0) result += convertHundreds(million) + ' Million ';
    if (thousand > 0) result += convertHundreds(thousand) + ' Thousand ';
    if (hundred > 0) result += convertHundreds(hundred);
    
    return result.trim() + ' Naira Only';
  };

  useEffect(() => {
    const words = receiptData.amountNumbers ? numberToWords(receiptData.amountNumbers) : '';
    setReceiptData(prev => ({ ...prev, amountWords: words }));
  }, [receiptData.amountNumbers]);

  const handleInputChange = (field, value) => {
    setReceiptData(prev => ({ ...prev, [field]: value }));
  };

  const generateReceiptNumber = () => {
    const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    handleInputChange('receiptNumber', `SF${randomNum}`);
  };

  const generateSecurityCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const downloadReceipt = () => {
    if (!receiptData.receiptNumber || !receiptData.receivedFrom || !receiptData.amountNumbers) {
      alert('Please fill in Receipt Number, Received From, and Amount fields');
      return;
    }

    const securityCode = generateSecurityCode();
    const receiptToSave = { ...receiptData, securityCode, downloadDate: new Date().toISOString() };

    // Create canvas for download
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 800;
    canvas.height = 700;

    // Background
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Header
    ctx.fillStyle = '#7c3aed';
    ctx.fillRect(0, 0, canvas.width, 100);
    ctx.fillStyle = 'white';
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('SPRINGFORTH ACADEMY', canvas.width / 2, 40);
    ctx.font = '12px Arial';
    ctx.fillText('No. 15 Tony Ogonenwe Close, off Living Water Avenue, Barnawa Narayi', canvas.width / 2, 60);
    ctx.fillText('Tel: 08035926459, 08094385502', canvas.width / 2, 80);

    // Receipt content
    ctx.fillStyle = '#7c3aed';
    ctx.font = 'bold 18px Arial';
    ctx.fillText('OFFICIAL RECEIPT', canvas.width / 2, 130);

    ctx.fillStyle = '#374151';
    ctx.font = '14px Arial';
    ctx.textAlign = 'left';

    const details = [
      `Receipt No: ${receiptData.receiptNumber}`,
      `Date: ${receiptData.date}`,
      `Received From: ${receiptData.receivedFrom}`,
      `Amount: ₦${receiptData.amountNumbers}`,
      `The Sum of: ${receiptData.amountWords}`,
      `Being: ${receiptData.paymentFor}`,
      `Payment Method: ${receiptData.paymentMethod}`
    ];

    details.forEach((detail, index) => {
      ctx.fillText(detail, 50, 170 + (index * 30));
    });

    if (receiptData.additionalNotes) {
      ctx.fillText(`Notes: ${receiptData.additionalNotes}`, 50, 170 + (details.length * 30));
    }

    // Security
    ctx.fillStyle = '#dc2626';
    ctx.font = 'bold 12px Arial';
    ctx.fillText('SECURITY CODE: ' + securityCode, 50, 550);
    ctx.fillStyle = '#16a34a';
    ctx.fillText('✓ AUTHENTIC SPRINGFORTH ACADEMY RECEIPT', 50, 570);

    // Download
    const link = document.createElement('a');
    link.download = `SPRINGFORTH-RECEIPT-${receiptData.receiptNumber}.png`;
    link.href = canvas.toDataURL();
    link.click();

    // Save to archive
    setArchivedReceipts(prev => [receiptToSave, ...prev]);
  };

  const viewReceipt = (receipt) => {
    setSelectedReceipt(receipt);
    setReceiptData(receipt);
    setShowArchive(false);
  };

  const deleteReceipt = (index) => {
    setArchivedReceipts(prev => prev.filter((_, i) => i !== index));
  };

  const clearForm = () => {
    setReceiptData({
      receiptNumber: '',
      date: new Date().toISOString().split('T')[0],
      receivedFrom: '',
      amountNumbers: '',
      amountWords: '',
      paymentFor: '',
      paymentMethod: 'Cash',
      additionalNotes: ''
    });
    setSelectedReceipt(null);
  };

  if (showArchive) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <Archive className="w-6 h-6 mr-2" />
                Receipt Archive ({archivedReceipts.length})
              </h2>
              <button
                onClick={() => setShowArchive(false)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Back to Generator
              </button>
            </div>

            {archivedReceipts.length === 0 ? (
              <div className="text-center py-12">
                <Archive className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No receipts archived yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {archivedReceipts.map((receipt, index) => (
                  <div key={index} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <span className="font-bold text-purple-600 mr-4">{receipt.receiptNumber}</span>
                          <span className="text-sm text-gray-600">{receipt.date}</span>
                        </div>
                        <p className="text-gray-800 mb-1">
                          <span className="font-medium">From:</span> {receipt.receivedFrom}
                        </p>
                        <p className="text-gray-800 mb-1">
                          <span className="font-medium">Amount:</span> ₦{receipt.amountNumbers}
                        </p>
                        <p className="text-gray-800">
                          <span className="font-medium">For:</span> {receipt.paymentFor}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          Downloaded: {new Date(receipt.downloadDate).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => viewReceipt(receipt)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="View Receipt"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteReceipt(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          title="Delete Receipt"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Receipt className="w-10 h-10 text-purple-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-800">SPRINGFORTH ACADEMY</h1>
          </div>
          <p className="text-gray-600">Official Receipt Generator</p>
          <div className="flex items-center justify-center mt-4 space-x-4">
            <div className="flex items-center">
              <Shield className="w-4 h-4 text-green-600 mr-2" />
              <span className="text-sm text-green-600 font-medium">Secure & Authentic</span>
            </div>
            <button
              onClick={() => setShowArchive(true)}
              className="flex items-center px-3 py-1 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm"
            >
              <Archive className="w-4 h-4 mr-1" />
              Archive ({archivedReceipts.length})
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                <Receipt className="w-5 h-5 mr-2" />
                Receipt Information
              </h2>
              <button
                onClick={clearForm}
                className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Clear
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Receipt Number *</label>
                  <div className="flex">
                    <input
                      type="text"
                      value={receiptData.receiptNumber}
                      onChange={(e) => handleInputChange('receiptNumber', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="SF0001"
                    />
                    <button
                      onClick={generateReceiptNumber}
                      className="px-3 py-2 bg-purple-600 text-white rounded-r-lg hover:bg-purple-700"
                    >
                      Gen
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <input
                    type="date"
                    value={receiptData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Received From *</label>
                <input
                  type="text"
                  value={receiptData.receivedFrom}
                  onChange={(e) => handleInputChange('receivedFrom', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Student/Parent name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount (₦) *</label>
                <input
                  type="number"
                  value={receiptData.amountNumbers}
                  onChange={(e) => handleInputChange('amountNumbers', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="5000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount in Words</label>
                <div className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 min-h-[60px] flex items-center">
                  <span className="text-gray-700 italic text-sm">
                    {receiptData.amountWords || 'Amount will appear here automatically...'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment For</label>
                <select
                  value={receiptData.paymentFor}
                  onChange={(e) => handleInputChange('paymentFor', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Select payment type</option>
                  <option value="School Fees">School Fees</option>
                  <option value="Registration Fee">Registration Fee</option>
                  <option value="Examination Fee">Examination Fee</option>
                  <option value="Book/Uniform">Book/Uniform</option>
                  <option value="Extra Curricular Activities">Extra Curricular Activities</option>
                  <option value="Development Levy">Development Levy</option>
                  <option value="PTA Dues">PTA Dues</option>
                  <option value="Others">Others</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                <select
                  value={receiptData.paymentMethod}
                  onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cheque">Cheque</option>
                  <option value="POS">POS</option>
                  <option value="Online Payment">Online Payment</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
                <textarea
                  value={receiptData.additionalNotes}
                  onChange={(e) => handleInputChange('additionalNotes', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows="2"
                  placeholder="Any additional information"
                />
              </div>
            </div>
          </div>

          {/* Receipt Preview */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Receipt Preview</h2>
              <button
                onClick={downloadReceipt}
                disabled={!receiptData.receiptNumber || !receiptData.receivedFrom || !receiptData.amountNumbers}
                className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4 mr-2" />
                Download PNG
              </button>
            </div>

            <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4 min-h-[500px]">
              {/* Receipt Header */}
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-center py-4 rounded-t-lg -mx-4 -mt-4 mb-4">
                <h1 className="text-xl font-bold mb-1">SPRINGFORTH ACADEMY</h1>
                <p className="text-xs">No. 15 Tony Ogonenwe Close, off Living Water Avenue, Barnawa Narayi</p>
                <p className="text-xs">Tel: 08035926459, 08094385502</p>
              </div>

              <div className="text-center mb-4">
                <div className="inline-block bg-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  OFFICIAL RECEIPT
                </div>
              </div>

              {/* Receipt Details */}
              <div className="space-y-3 text-sm text-gray-800">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium">Receipt No:</span>
                    <span className="ml-2">{receiptData.receiptNumber || 'SF____'}</span>
                  </div>
                  <div>
                    <span className="font-medium">Date:</span>
                    <span className="ml-2">{receiptData.date}</span>
                  </div>
                </div>
                
                <div className="border-t pt-3">
                  <div className="mb-2">
                    <span className="font-medium">Received From:</span>
                    <div className="border-b border-dotted border-gray-400 mt-1 pb-1">
                      {receiptData.receivedFrom || '____________________'}
                    </div>
                  </div>
                </div>
                
                <div className="bg-purple-50 p-3 rounded-lg">
                  <div className="flex justify-between text-lg font-bold text-purple-700">
                    <span>Amount:</span>
                    <span>₦{receiptData.amountNumbers || '____'}</span>
                  </div>
                </div>
                
                <div className="border-t pt-3">
                  <div className="mb-2">
                    <span className="font-medium">The Sum of:</span>
                    <div className="border-b border-dotted border-gray-400 mt-1 pb-1 min-h-[40px] flex items-center">
                      <span className="italic text-purple-700 text-sm">
                        {receiptData.amountWords || '____________________'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="border-t pt-3">
                  <div className="mb-2">
                    <span className="font-medium">Being:</span>
                    <div className="border-b border-dotted border-gray-400 mt-1 pb-1">
                      {receiptData.paymentFor || '____________________'}
                    </div>
                  </div>
                </div>
                
                <div>
                  <span className="font-medium">Payment Method:</span>
                  <span className="ml-2">{receiptData.paymentMethod}</span>
                </div>
                
                {receiptData.additionalNotes && (
                  <div className="border-t pt-3">
                    <span className="font-medium">Notes:</span>
                    <p className="mt-1 text-sm">{receiptData.additionalNotes}</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="mt-6 text-center text-xs text-gray-600">
                <p className="font-medium">Thank you for your payment!</p>
                <p className="text-purple-600 mt-1">"No Refund of Money after Payment"</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EReceiptApp;
