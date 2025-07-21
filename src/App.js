import React, { useState } from 'react';
import { Download, Share, Receipt, Plus } from 'lucide-react';

const App = () => {
  const [receiptData, setReceiptData] = useState({
    receiptNumber: '',
    date: new Date().toISOString().split('T')[0],
    receivedFrom: '',
    amountNumbers: '',
    amountWords: '',
    description: '',
    paymentMethod: 'Cash',
    paymentFor: '',
    receivedBy: ''
  });

  const [isGenerating, setIsGenerating] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setReceiptData((prev) => ({ ...prev, [name]: value }));
  };

  const formatAmount = (num) => {
    if (!num) return '0.00';
    return parseFloat(num).toLocaleString('en-NG', { minimumFractionDigits: 2 });
  };

  const numberToWords = (amount) => {
    if (!amount || amount === 0) return 'Zero Naira Only';
    
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

    const convertHundreds = (num) => {
      let result = '';
      if (num >= 100) {
        result += ones[Math.floor(num / 100)] + ' Hundred ';
        num %= 100;
      }
      if (num >= 20) {
        result += tens[Math.floor(num / 10)] + ' ';
        num %= 10;
      } else if (num >= 10) {
        result += teens[num - 10] + ' ';
        num = 0;
      }
      if (num > 0) {
        result += ones[num] + ' ';
      }
      return result;
    };

    const num = Math.floor(amount);
    const kobo = Math.round((amount - num) * 100);
    
    let result = '';
    
    if (num >= 1000000) {
      result += convertHundreds(Math.floor(num / 1000000)) + 'Million ';
      num %= 1000000;
    }
    if (num >= 1000) {
      result += convertHundreds(Math.floor(num / 1000)) + 'Thousand ';
      num %= 1000;
    }
    if (num > 0) {
      result += convertHundreds(num);
    }
    
    result += 'Naira';
    if (kobo > 0) {
      result += ' and ' + convertHundreds(kobo) + 'Kobo';
    }
    result += ' Only';
    
    return result.replace(/\s+/g, ' ').trim();
  };

  const handleAmountChange = (e) => {
    const value = e.target.value;
    setReceiptData(prev => ({
      ...prev,
      amountNumbers: value,
      amountWords: value ? numberToWords(parseFloat(value)) : ''
    }));
  };

  const generateReceiptNumber = () => {
    const timestamp = Date.now().toString().slice(-6);
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    setReceiptData((prev) => ({ ...prev, receiptNumber: `SF${timestamp}${randomNum}` }));
  };

  const downloadReceiptAsImage = async () => {
    if (!receiptData.receivedFrom || !receiptData.amountNumbers) {
      alert('Please fill in required fields: Received From and Amount');
      return;
    }

    setIsGenerating(true);
    
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 800;
      const ctx = canvas.getContext('2d');

      // White background
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Header styling
      ctx.fillStyle = '#2563eb';
      ctx.fillRect(0, 0, canvas.width, 80);
      
      // Company name
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('SPRINGFORTH', canvas.width / 2, 35);
      ctx.font = '14px Arial';
      ctx.fillText('OFFICIAL RECEIPT', canvas.width / 2, 60);

      // Reset alignment and color for content
      ctx.textAlign = 'left';
      ctx.fillStyle = '#000';
      
      let y = 120;
      const lineHeight = 35;
      const leftMargin = 30;

      // Receipt details with better formatting
      ctx.font = 'bold 16px Arial';
      ctx.fillText('Receipt Details', leftMargin, y);
      y += lineHeight;

      ctx.font = '14px Arial';
      const details = [
        { label: 'Receipt No:', value: receiptData.receiptNumber },
        { label: 'Date:', value: new Date(receiptData.date).toLocaleDateString('en-GB') },
        { label: 'Received From:', value: receiptData.receivedFrom },
        { label: 'Amount:', value: `₦${formatAmount(receiptData.amountNumbers)}` },
        { label: 'In Words:', value: receiptData.amountWords },
        { label: 'Description:', value: receiptData.description },
        { label: 'Payment Method:', value: receiptData.paymentMethod },
        { label: 'Payment For:', value: receiptData.paymentFor },
        { label: 'Received By:', value: receiptData.receivedBy }
      ];

      details.forEach(({ label, value }) => {
        if (value) {
          ctx.font = 'bold 12px Arial';
          ctx.fillText(label, leftMargin, y);
          ctx.font = '12px Arial';
          
          // Handle text wrapping for long values
          const maxWidth = canvas.width - leftMargin - 20;
          const words = value.toString().split(' ');
          let line = '';
          let currentY = y + 15;
          
          words.forEach(word => {
            const testLine = line + word + ' ';
            const metrics = ctx.measureText(testLine);
            if (metrics.width > maxWidth && line !== '') {
              ctx.fillText(line, leftMargin, currentY);
              line = word + ' ';
              currentY += 15;
            } else {
              line = testLine;
            }
          });
          ctx.fillText(line, leftMargin, currentY);
          
          y += lineHeight + (currentY - y - 15);
        }
      });

      // Footer
      y += 30;
      ctx.strokeStyle = '#000';
      ctx.beginPath();
      ctx.moveTo(leftMargin, y);
      ctx.lineTo(canvas.width - leftMargin, y);
      ctx.stroke();

      y += 20;
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Thank you for your payment!', canvas.width / 2, y);
      ctx.fillText('This is a computer generated receipt', canvas.width / 2, y + 15);

      // Download image
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `SPRINGFORTH-RECEIPT-${receiptData.receiptNumber}.png`;
      link.href = dataUrl;
      link.click();

      // Prepare WhatsApp sharing
      const shareText = `🧾 SPRINGFORTH RECEIPT
      
Receipt No: ${receiptData.receiptNumber}
Date: ${new Date(receiptData.date).toLocaleDateString('en-GB')}
Amount: ₦${formatAmount(receiptData.amountNumbers)}
Received From: ${receiptData.receivedFrom}
Payment For: ${receiptData.paymentFor}

Thank you for your payment!`;

      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
      setTimeout(() => window.open(whatsappUrl, '_blank'), 500);
      
    } catch (error) {
      alert('Error generating receipt. Please try again.');
      console.error('Receipt generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const isFormValid = receiptData.receivedFrom && receiptData.amountNumbers && receiptData.receiptNumber;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-6">
            <div className="flex items-center justify-center space-x-3">
              <Receipt className="h-8 w-8 text-white" />
              <h1 className="text-2xl font-bold text-white">Springforth Receipt Generator</h1>
            </div>
            <p className="text-blue-100 text-center mt-2">Generate professional receipts instantly</p>
          </div>

          <div className="p-8">
            {/* Receipt Number Generator */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Receipt Number
                  </label>
                  <input
                    type="text"
                    name="receiptNumber"
                    value={receiptData.receiptNumber}
                    onChange={handleInputChange}
                    placeholder="Click generate or enter manually"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  onClick={generateReceiptNumber}
                  className="ml-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Generate</span>
                </button>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid gap-6">
              {[
                { label: "Date", name: "date", type: "date", required: false },
                { label: "Received From", name: "receivedFrom", required: true },
                { label: "Amount (Numbers)", name: "amountNumbers", type: "number", required: true, onChange: handleAmountChange },
                { label: "Amount (Words)", name: "amountWords", readonly: true },
                { label: "Description", name: "description" },
                { label: "Payment For", name: "paymentFor" },
                { label: "Received By", name: "receivedBy" },
              ].map(({ label, name, type = "text", required = false, readonly = false, onChange }) => (
                <div key={name}>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {label} {required && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type={type}
                    name={name}
                    value={receiptData[name]}
                    onChange={onChange || handleInputChange}
                    readOnly={readonly}
                    className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                      readonly ? 'bg-gray-100' : 'bg-white hover:border-gray-400'
                    }`}
                    placeholder={readonly ? 'Auto-generated from amount' : `Enter ${label.toLowerCase()}`}
                  />
                </div>
              ))}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Payment Method
                </label>
                <select
                  name="paymentMethod"
                  value={receiptData.paymentMethod}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors bg-white hover:border-gray-400"
                >
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Card">Card Payment</option>
                  <option value="Mobile Money">Mobile Money</option>
                </select>
              </div>
            </div>

            {/* Action Button */}
            <div className="mt-8">
              <button
                onClick={downloadReceiptAsImage}
                disabled={!isFormValid || isGenerating}
                className={`w-full py-4 rounded-lg font-semibold text-white transition-all duration-200 flex items-center justify-center space-x-3 ${
                  isFormValid && !isGenerating
                    ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                {isGenerating ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Download className="h-5 w-5" />
                    <span>Download Receipt & Share on WhatsApp</span>
                    <Share className="h-5 w-5" />
                  </>
                )}
              </button>
              
              {!isFormValid && (
                <p className="text-sm text-red-600 text-center mt-2">
                  Please fill in all required fields (Receipt Number, Received From, Amount)
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
