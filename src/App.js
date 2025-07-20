import React, { useState, useRef, useEffect } from 'react';
import { Download, Receipt, Shield, Archive, Trash2, Eye, X, Share2, RefreshCw } from 'lucide-react';

const EReceiptApp = () => {
  const [receiptData, setReceiptData] = useState({
    receiptNumber: '',
    date: new Date().toISOString().split('T')[0],
    receivedFrom: '',
    amountNumbers: '',
    amountWords: '',
    paymentFor: '',
    paymentMethod: 'Cash',
    additionalNotes: '',
    email: ''
  });

  const [archivedReceipts, setArchivedReceipts] = useState([]);
  const [showArchive, setShowArchive] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const receiptRef = useRef(null);

  const formatAmount = (value) => {
    if (!value) return '0';
    return parseFloat(value).toLocaleString('en-NG');
  };

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

  const clearForm = () => {
    setReceiptData({
      receiptNumber: '',
      date: new Date().toISOString().split('T')[0],
      receivedFrom: '',
      amountNumbers: '',
      amountWords: '',
      paymentFor: '',
      paymentMethod: 'Cash',
      additionalNotes: '',
      email: ''
    });
  };

  const downloadReceipt = () => {
    if (!receiptData.receiptNumber || !receiptData.receivedFrom || !receiptData.amountNumbers) {
      alert('Please fill in Receipt Number, Received From, and Amount fields');
      return;
    }

    const securityCode = generateSecurityCode();
    const receiptToSave = { 
      ...receiptData, 
      securityCode, 
      downloadDate: new Date().toISOString(),
      id: Date.now()
    };

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 360;
    canvas.height = 650;

    // Background
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Header
    ctx.fillStyle = '#7c3aed';
    ctx.fillRect(0, 0, canvas.width, 80);
    ctx.fillStyle = 'white';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('SPRINGFORTH ACADEMY', canvas.width / 2, 30);
    ctx.font = '10px Arial';
    ctx.fillText('No. 15 Tony Ogonenwe Close, off Living Water Avenue, Barnawa Narayi', canvas.width / 2, 50);
    ctx.fillText('Tel: 08035926459, 08094385502', canvas.width / 2, 65);

    // Title
    ctx.fillStyle = '#7c3aed';
    ctx.font = 'bold 14px Arial';
    ctx.fillText('OFFICIAL RECEIPT', canvas.width / 2, 100);

    // Details
    ctx.fillStyle = '#374151';
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';

    const labelX = 20;
    const valueX = canvas.width - 20;

    const details = [
      ['Receipt No:', receiptData.receiptNumber],
      ['Date:', receiptData.date],
      ['Received From:', receiptData.receivedFrom],
      ['Amount:', `₦${formatAmount(receiptData.amountNumbers)}`],
      ['The Sum of:', receiptData.amountWords],
      ['Being:', receiptData.paymentFor || 'Payment received'],
      ['Payment Method:', receiptData.paymentMethod]
    ];

    let currentY = 130;
    details.forEach(([label, value]) => {
      ctx.fillText(label, labelX, currentY);
      ctx.textAlign = 'right';
      
      // Handle long text wrapping
      const maxWidth = valueX - labelX - 10;
      const words = value.split(' ');
      let line = '';
      let lineY = currentY;
      
      for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i] + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && i > 0) {
          ctx.fillText(line, valueX, lineY);
          line = words[i] + ' ';
          lineY += 15;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, valueX, lineY);
      
      currentY = Math.max(currentY + 25, lineY + 25);
      ctx.textAlign = 'left';
    });

    if (receiptData.additionalNotes) {
      currentY += 10;
      ctx.fillText(`Notes: ${receiptData.additionalNotes}`, labelX, currentY);
      currentY += 20;
    }

    // Security features
    ctx.fillStyle = '#dc2626';
    ctx.font = 'bold 10px Arial';
    ctx.fillText('SECURITY CODE: ' + securityCode, labelX, currentY + 40);
    ctx.fillStyle = '#16a34a';
    ctx.fillText('✓ AUTHENTIC SPRINGFORTH ACADEMY RECEIPT', labelX, currentY + 55);

    const link = document.createElement('a');
    link.download = `SPRINGFORTH-RECEIPT-${receiptData.receiptNumber}.png`;
    link.href = canvas.toDataURL();
    link.click();

    setArchivedReceipts(prev => [receiptToSave, ...prev]);
    alert('Receipt downloaded and archived successfully!');
  };

  const deleteReceipt = (id) => {
    setArchivedReceipts(prev => prev.filter(receipt => receipt.id !== id));
    if (selectedReceipt && selectedReceipt.id === id) {
      setSelectedReceipt(null);
    }
  };

  const viewReceipt = (receipt) => {
    setSelectedReceipt(receipt);
  };

  const shareReceipt = (receipt) => {
    const message = `Springforth Academy Receipt
Receipt No: ${receipt.receiptNumber}
Date: ${receipt.date}
From: ${receipt.receivedFrom}
Amount: ₦${formatAmount(receipt.amountNumbers)}
Payment For: ${receipt.paymentFor || 'Payment received'}
Security Code: ${receipt.securityCode}`;
    
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (showArchive) {
    return (
      <div className="p-4 max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Archive className="w-6 h-6" />
            Receipt Archive ({archivedReceipts.length})
          </h1>
          <button
            onClick={() => setShowArchive(false)}
            className="bg-purple-600 text-white px-4 py-2 rounded flex items-center gap-2"
          >
            <Receipt className="w-4 h-4" />
            Back to Generator
          </button>
        </div>

        {archivedReceipts.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Archive className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No archived receipts yet</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              {archivedReceipts.map((receipt) => (
                <div key={receipt.id} className="border rounded-lg p-4 bg-white shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-purple-600">{receipt.receiptNumber}</h3>
                      <p className="text-sm text-gray-600">{receipt.receivedFrom}</p>
                    </div>
                    <span className="text-lg font-bold text-green-600">₦{formatAmount(receipt.amountNumbers)}</span>
                  </div>
                  <p className="text-sm text-gray-500 mb-3">{receipt.date}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => viewReceipt(receipt)}
                      className="bg-blue-500 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      View
                    </button>
                    <button
                      onClick={() => shareReceipt(receipt)}
                      className="bg-green-500 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
                    >
                      <Share2 className="w-3 h-3" />
                      Share
                    </button>
                    <button
                      onClick={() => deleteReceipt(receipt.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {selectedReceipt && (
              <div className="border rounded-lg p-4 bg-gray-50 sticky top-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-lg">Receipt Details</h3>
                  <button
                    onClick={() => setSelectedReceipt(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Receipt Number:</label>
                    <p className="font-semibold text-purple-600">{selectedReceipt.receiptNumber}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Date:</label>
                    <p>{selectedReceipt.date}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Received From:</label>
                    <p>{selectedReceipt.receivedFrom}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Amount:</label>
                    <p className="text-lg font-bold text-green-600">₦{formatAmount(selectedReceipt.amountNumbers)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">In Words:</label>
                    <p className="text-sm">{selectedReceipt.amountWords}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Payment For:</label>
                    <p>{selectedReceipt.paymentFor || 'Payment received'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Payment Method:</label>
                    <p>{selectedReceipt.paymentMethod}</p>
                  </div>
                  {selectedReceipt.email && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Email:</label>
                      <p>{selectedReceipt.email}</p>
                    </div>
                  )}
                  {selectedReceipt.additionalNotes && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Notes:</label>
                      <p className="text-sm">{selectedReceipt.additionalNotes}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-gray-600">Security Code:</label>
                    <p className="font-mono bg-red-100 text-red-800 px-2 py-1 rounded text-sm">
                      {selectedReceipt.securityCode}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Downloaded:</label>
                    <p className="text-xs text-gray-500">
                      {new Date(selectedReceipt.downloadDate).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-4 max-w-xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Receipt className="w-6 h-6 text-purple-600" />
          Receipt Generator
        </h1>
        <button
          onClick={() => setShowArchive(true)}
          className="bg-gray-600 text-white px-4 py-2 rounded flex items-center gap-2"
        >
          <Archive className="w-4 h-4" />
          Archive ({archivedReceipts.length})
        </button>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Receipt Number</label>
            <input
              type="text"
              placeholder="Receipt Number"
              className="w-full border rounded px-3 py-2"
              value={receiptData.receiptNumber}
              onChange={(e) => handleInputChange('receiptNumber', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              className="w-full border rounded px-3 py-2"
              value={receiptData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Received From *</label>
          <input
            type="text"
            placeholder="Full Name"
            className="w-full border rounded px-3 py-2"
            value={receiptData.receivedFrom}
            onChange={(e) => handleInputChange('receivedFrom', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Parent Email (Optional)</label>
          <input
            type="email"
            placeholder="parent@example.com"
            className="w-full border rounded px-3 py-2"
            value={receiptData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₦) *</label>
          <input
            type="number"
            placeholder="0"
            className="w-full border rounded px-3 py-2"
            value={receiptData.amountNumbers}
            onChange={(e) => handleInputChange('amountNumbers', e.target.value)}
          />
          {receiptData.amountWords && (
            <p className="text-sm text-gray-600 mt-1">In words: {receiptData.amountWords}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Payment For</label>
          <input
            type="text"
            placeholder="School fees, uniform, books, etc."
            className="w-full border rounded px-3 py-2"
            value={receiptData.paymentFor}
            onChange={(e) => handleInputChange('paymentFor', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={receiptData.paymentMethod}
            onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
          >
            <option value="Cash">Cash</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="Cheque">Cheque</option>
            <option value="POS">POS</option>
            <option value="Mobile Transfer">Mobile Transfer</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
          <textarea
            placeholder="Any additional information..."
            className="w-full border rounded px-3 py-2 h-20 resize-none"
            value={receiptData.additionalNotes}
            onChange={(e) => handleInputChange('additionalNotes', e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={generateReceiptNumber}
            className="bg-purple-600 text-white px-4 py-2 rounded flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Generate Receipt No
          </button>
          <button
            onClick={clearForm}
            className="bg-gray-500 text-white px-4 py-2 rounded"
          >
            Clear Form
          </button>
        </div>

        <button
          onClick={downloadReceipt}
          className="w-full bg-green-600 text-white px-4 py-3 rounded flex items-center justify-center gap-2 font-medium"
        >
          <Download className="w-5 h-5" />
          Generate & Download Receipt
        </button>

        {receiptData.receiptNumber && receiptData.receivedFrom && receiptData.amountNumbers && (
          <button
            onClick={() => shareReceipt(receiptData)}
            className="w-full bg-green-500 text-white px-4 py-2 rounded flex items-center justify-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            Share via WhatsApp
          </button>
        )}
      </div>
    </div>
  );
};

export default EReceiptApp;
