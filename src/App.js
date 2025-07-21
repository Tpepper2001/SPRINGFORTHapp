import React, { useState } from 'react';
import { Download, Share, Receipt, Plus, Eye, FileText } from 'lucide-react';

const App = () => {
  const [receiptData, setReceiptData] = useState({
    receiptNumber: '',
    date: new Date().toISOString().split('T')[0],
    receivedFrom: '',
    amountNumbers: '',
    amountWords: '',
    balanceRemaining: '',
    description: '',
    paymentMethod: 'Cash',
    paymentFor: '',
    receivedBy: '',
    draftChequeNo: ''
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setReceiptData((prev) => ({ ...prev, [name]: value }));
  };

  const formatAmount = (num) => {
    if (!num || isNaN(num)) return '0.00';
    const cleanNum = parseFloat(num.toString().replace(/,/g, ''));
    if (isNaN(cleanNum)) return '0.00';
    return cleanNum.toLocaleString('en-NG', { minimumFractionDigits: 2 });
  };

  const numberToWords = (amount) => {
    if (!amount || amount === 0 || isNaN(amount)) return 'Zero Naira Only';
    
    const cleanAmount = parseFloat(amount.toString().replace(/,/g, ''));
    if (isNaN(cleanAmount)) return 'Zero Naira Only';
    
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

    const convertHundreds = (num) => {
      let result = '';
      const hundreds = Math.floor(num / 100);
      const remainder = num % 100;
      
      if (hundreds > 0) {
        result += ones[hundreds] + ' Hundred ';
      }
      
      if (remainder >= 20) {
        result += tens[Math.floor(remainder / 10)] + ' ';
        const units = remainder % 10;
        if (units > 0) {
          result += ones[units] + ' ';
        }
      } else if (remainder >= 10) {
        result += teens[remainder - 10] + ' ';
      } else if (remainder > 0) {
        result += ones[remainder] + ' ';
      }
      
      return result;
    };

    let num = Math.floor(cleanAmount);
    const kobo = Math.round((cleanAmount - num) * 100);
    
    let result = '';
    
    if (num >= 1000000000) {
      result += convertHundreds(Math.floor(num / 1000000000)) + 'Billion ';
      num %= 1000000000;
    }
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
    try {
      setReceiptData(prev => ({
        ...prev,
        amountNumbers: value,
        amountWords: value ? numberToWords(value) : ''
      }));
    } catch (error) {
      console.error('Error converting amount:', error);
      setReceiptData(prev => ({
        ...prev,
        amountNumbers: value,
        amountWords: 'Invalid Amount'
      }));
    }
  };

  const generateReceiptNumber = () => {
    const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    setReceiptData((prev) => ({ ...prev, receiptNumber: randomNum }));
  };

  const generateReceiptImage = async () => {
    if (!receiptData.receivedFrom || !receiptData.amountNumbers) {
      alert('Please fill in required fields: Received From and Amount');
      return;
    }

    setIsGenerating(true);
    
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 600;
      canvas.height = 450; // Increased height to accommodate new field
      const ctx = canvas.getContext('2d');

      // White background
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Purple header section
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
      gradient.addColorStop(0, '#8B5A96');
      gradient.addColorStop(1, '#A569BD');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, 80);

      // Company logo area
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(60, 40, 25, 0, 2 * Math.PI);
      ctx.fill();
      ctx.fillStyle = '#8B5A96';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('SA', 60, 45);

      // Company name and details
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 28px Arial';
      ctx.textAlign = 'left';
      ctx.fillText('SPRINGFORTH ACADEMY', 100, 35);
      
      ctx.font = '10px Arial';
      ctx.fillText('No. 15 Tony Ogomienwe Close, off Living water Avenue,', 100, 50);
      ctx.fillText('Barnawa Narayi, Sabon Gari, Kaduna East, Kaduna', 100, 62);
      ctx.fillText('CRÈCHE, DAYCARE, PLAYGROUP, NURSERY, PRIMARY, LESSON + TUTORIALS', 100, 74);

      // Receipt number
      ctx.font = '12px Arial';
      ctx.textAlign = 'right';
      ctx.fillText(`KD: ${receiptData.receiptNumber}`, canvas.width - 20, 25);
      ctx.fillText(`No: ${receiptData.receiptNumber}`, canvas.width - 20, 45);

      // Official Receipt banner
      ctx.fillStyle = '#8B5A96';
      ctx.fillRect(200, 90, 200, 30);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('OFFICIAL RECEIPT', 300, 110);

      // Form fields
      ctx.fillStyle = '#000';
      ctx.font = '14px Serif';
      ctx.textAlign = 'left';
      
      let y = 150;
      const lineHeight = 25;
      const leftMargin = 30;
      
      // Date
      ctx.fillText('Date:', leftMargin, y);
      ctx.fillText(new Date(receiptData.date).toLocaleDateString('en-GB'), leftMargin + 50, y);
      
      y += lineHeight;
      
      // Received From
      ctx.fillText('Received From:', leftMargin, y);
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(leftMargin + 120, y + 2);
      ctx.lineTo(canvas.width - 30, y + 2);
      ctx.stroke();
      if (receiptData.receivedFrom) {
        ctx.fillText(receiptData.receivedFrom, leftMargin + 125, y - 2);
      }
      
      y += lineHeight;
      
      // The Sum of
      ctx.fillText('The Sum of:', leftMargin, y);
      ctx.beginPath();
      ctx.moveTo(leftMargin + 90, y + 2);
      ctx.lineTo(canvas.width - 30, y + 2);
      ctx.stroke();
      if (receiptData.amountNumbers) {
        ctx.fillText(`₦${formatAmount(receiptData.amountNumbers)}`, leftMargin + 95, y - 2);
      }
      
      y += lineHeight;
      
      // Balance Remaining
      ctx.fillText('Balance Remaining:', leftMargin, y);
      ctx.beginPath();
      ctx.moveTo(leftMargin + 120, y + 2);
      ctx.lineTo(canvas.width - 30, y + 2);
      ctx.stroke();
      if (receiptData.balanceRemaining) {
        ctx.fillText(`₦${formatAmount(receiptData.balanceRemaining)}`, leftMargin + 125, y - 2);
      }
      
      y += lineHeight;
      
      // Being (description)
      ctx.fillText('Being:', leftMargin, y);
      ctx.beginPath();
      ctx.moveTo(leftMargin + 60, y + 2);
      ctx.lineTo(canvas.width - 30, y + 2);
      ctx.stroke();
      if (receiptData.paymentFor) {
        ctx.fillText(receiptData.paymentFor, leftMargin + 65, y - 2);
      }
      
      y += lineHeight * 2;
      
      // Amount in words
      const words = receiptData.amountWords;
      const maxWidth = canvas.width - 60;
      const wordsLines = [];
      let currentLine = '';
      
      words.split(' ').forEach(word => {
        const testLine = currentLine + word + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && currentLine !== '') {
          wordsLines.push(currentLine.trim());
          currentLine = word + ' ';
        } else {
          currentLine = testLine;
        }
      });
      if (currentLine.trim()) {
        wordsLines.push(currentLine.trim());
      }
      
      wordsLines.forEach((line, index) => {
        ctx.beginPath();
        ctx.moveTo(leftMargin, y + 2);
        ctx.lineTo(canvas.width - 30, y + 2);
        ctx.stroke();
        ctx.fillText(line, leftMargin, y - 2);
        y += lineHeight;
      });
      
      y += 10;
      
      // Draft/Cheque No
      if (receiptData.draftChequeNo) {
        ctx.fillText('Draft/Cheque No:', leftMargin, y);
        ctx.beginPath();
        ctx.moveTo(leftMargin + 130, y + 2);
        ctx.lineTo(leftMargin + 280, y + 2);
        ctx.stroke();
        ctx.fillText(receiptData.draftChequeNo, leftMargin + 135, y - 2);
        y += lineHeight + 10;
      } else {
        y += 10;
      }
      
      // No Refund notice
      ctx.font = 'bold 12px Arial';
      ctx.fillText('No Refund of Money after Payment', leftMargin, y);
      
      // N : K box
      ctx.strokeRect(leftMargin, y + 10, 40, 20);
      ctx.fillText('N', leftMargin + 10, y + 23);
      ctx.fillText(':', leftMargin + 20, y + 23);
      ctx.fillText('K', leftMargin + 25, y + 23);
      
      // For Springforth Academy
      ctx.textAlign = 'right';
      ctx.font = 'italic 14px Arial';
      ctx.fillText('For Springforth Academy', canvas.width - 30, y + 25);
      
      // Signature line
      ctx.beginPath();
      ctx.moveTo(canvas.width - 200, y + 35);
      ctx.lineTo(canvas.width - 30, y + 35);
      ctx.stroke();

      const dataUrl = canvas.toDataURL('image/png', 1.0);
      setGeneratedImageUrl(dataUrl);
      return dataUrl;
      
    } catch (error) {
      alert('Error generating receipt. Please try again.');
      console.error('Receipt generation error:', error);
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const viewReceipt = async () => {
    const imageUrl = generatedImageUrl || await generateReceiptImage();
    if (!imageUrl) return;

    const newWindow = window.open();
    newWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Springforth Academy Receipt - ${receiptData.receiptNumber}</title>
          <style>
            body {
              margin: 0;
              padding: 20px;
              background-color: #f5f5f5;
              font-family: Arial, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
            }
            .container {
              background: white;
              padding: 20px;
              border-radius: 10px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              text-align: center;
            }
            img {
              max-width: 100%;
              height: auto;
              border: 1px solid #ddd;
              border-radius: 5px;
            }
            .actions {
              margin-top: 20px;
            }
            button {
              background: #8B5A96;
              color: white;
              border: none;
              padding: 10px 20px;
              margin: 0 10px;
              border-radius: 5px;
              cursor: pointer;
              font-size: 14px;
            }
            button:hover {
              background: #A569BD;
            }
            .print-button {
              background: #28a745;
            }
            .print-button:hover {
              background: #218838;
            }
            @media print {
              body { background: white; }
              .actions { display: none; }
              .container { box-shadow: none; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Springforth Academy Official Receipt</h2>
            <img src="${imageUrl}" alt="Receipt" />
            <div class="actions">
              <button onclick="window.print()" class="print-button">🖨️ Print</button>
              <button onclick="downloadImage()">💾 Download</button>
              <button onclick="window.close()">❌ Close</button>
            </div>
          </div>
          <script>
            function downloadImage() {
              const link = document.createElement('a');
              link.download = 'SPRINGFORTH-RECEIPT-${receiptData.receiptNumber}.png';
              link.href = '${imageUrl}';
              link.click();
            }
          </script>
        </body>
      </html>
    `);
    newWindow.document.close();
  };

  const generatePDF = async () => {
    const imageUrl = generatedImageUrl || await generateReceiptImage();
    if (!imageUrl) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Springforth Academy Receipt - ${receiptData.receiptNumber}</title>
          <style>
            body {
              margin: 0;
              padding: 20px;
              font-family: Arial, sans-serif;
              background: white;
            }
            .receipt-container {
              text-align: center;
              max-width: 800px;
              margin: 0 auto;
            }
            .receipt-image {
              max-width: 100%;
              height: auto;
              border: 1px solid #ddd;
            }
            .receipt-details {
              margin-top: 20px;
              text-align: left;
              font-size: 12px;
              line-height: 1.5;
            }
            .detail-row {
              margin-bottom: 10px;
            }
            .label {
              font-weight: bold;
              display: inline-block;
              width: 120px;
            }
            @page {
              size: A4;
              margin: 1cm;
            }
          </style>
        </head>
        <body>
          <div class="receipt-container">
            <img src="${imageUrl}" alt="Receipt" class="receipt-image" />
            <div class="receipt-details">
              <h3>Receipt Details:</h3>
              <div class="detail-row">
                <span class="label">Receipt No:</span>
                <span>${receiptData.receiptNumber}</span>
              </div>
              <div class="detail-row">
                <span class="label">Date:</span>
                <span>${new Date(receiptData.date).toLocaleDateString('en-GB')}</span>
              </div>
              <div class="detail-row">
                <span class="label">Received From:</span>
                <span>${receiptData.receivedFrom}</span>
              </div>
              <div class="detail-row">
                <span class="label">Amount:</span>
                <span>₦${formatAmount(receiptData.amountNumbers)}</span>
              </div>
              <div class="detail-row">
                <span class="label">Balance Remaining:</span>
                <span>${receiptData.balanceRemaining ? '₦' + formatAmount(receiptData.balanceRemaining) : 'N/A'}</span>
              </div>
              <div class="detail-row">
                <span class="label">Payment For:</span>
                <span>${receiptData.paymentFor || 'N/A'}</span>
              </div>
              <div class="detail-row">
                <span class="label">Payment Method:</span>
                <span>${receiptData.paymentMethod}</span>
              </div>
              ${receiptData.draftChequeNo ? `
              <div class="detail-row">
                <span class="label">Cheque/Draft No:</span>
                <span>${receiptData.draftChequeNo}</span>
              </div>
              ` : ''}
              <div class="detail-row">
                <span class="label">Generated:</span>
                <span>${new Date().toLocaleString()}</span>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    const newWindow = window.open();
    newWindow.document.write(htmlContent);
    newWindow.document.close();
    
    setTimeout(() => {
      newWindow.print();
      newWindow.onafterprint = () => {
        setTimeout(() => {
          if (confirm('Receipt printed successfully! Close this window?')) {
            newWindow.close();
          }
        }, 1000);
      };
    }, 1000);
  };

  const shareViaWhatsApp = async () => {
    const imageUrl = generatedImageUrl || await generateReceiptImage();
    if (!imageUrl) return;

    const shareText = `🧾 SPRINGFORTH ACADEMY RECEIPT
      
Receipt No: ${receiptData.receiptNumber}
Date: ${new Date(receiptData.date).toLocaleDateString('en-GB')}
Amount: ₦${formatAmount(receiptData.amountNumbers)}
Balance Remaining: ${receiptData.balanceRemaining ? '₦' + formatAmount(receiptData.balanceRemaining) : 'N/A'}
Received From: ${receiptData.receivedFrom}
Payment For: ${receiptData.paymentFor || receiptData.description}

Thank you for your payment!`;

    if (navigator.share) {
      try {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const file = new File([blob], `Springforth-Receipt-${receiptData.receiptNumber}.png`, { 
          type: 'image/png' 
        });
        
        await navigator.share({
          title: 'Springforth Academy Receipt',
          text: shareText,
          files: [file]
        });
        return;
      } catch (error) {
        console.log('Direct image sharing not supported, trying WhatsApp');
      }
    }

    const link = document.createElement('a');
    link.download = `Springforth-Receipt-${receiptData.receiptNumber}.png`;
    link.href = imageUrl;
    link.click();

    setTimeout(() => {
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText + '\n\nReceipt image downloaded to your device - please attach it manually.')}`;
      window.open(whatsappUrl, '_blank');
    }, 1000);
  };

  const generateAndPreview = async () => {
    await generateReceiptImage();
  };

  const isFormValid = receiptData.receivedFrom && receiptData.amountNumbers && receiptData.receiptNumber;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-6">
              <div className="flex items-center justify-center space-x-3">
                <Receipt className="h-8 w-8 text-white" />
                <h1 className="text-2xl font-bold text-white">Springforth Academy</h1>
              </div>
              <p className="text-purple-100 text-center mt-2">Official Receipt Generator</p>
            </div>

            <div className="p-8">
              {/* Receipt Number Generator */}
              <div className="bg-purple-50 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Receipt Number
                    </label>
                    <input
                      type="text"
                      name="receiptNumber"
                      value={receiptData.receiptNumber}
                      onChange={handleInputChange}
                      placeholder="Click generate or enter manually"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <button
                    onClick={generateReceiptNumber}
                    className="ml-4 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md transition-colors flex items-center space-x-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Generate</span>
                  </button>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={receiptData.date}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors bg-white hover:border-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Received From <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="receivedFrom"
                    value={receiptData.receivedFrom}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors bg-white hover:border-gray-400"
                    placeholder="Enter payer's name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Amount (Numbers) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold">₦</span>
                    <input
                      type="text"
                      name="amountNumbers"
                      value={receiptData.amountNumbers}
                      onChange={handleAmountChange}
                      className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors bg-white hover:border-gray-400"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Balance Remaining
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold">₦</span>
                    <input
                      type="text"
                      name="balanceRemaining"
                      value={receiptData.balanceRemaining}
                      onChange={handleInputChange}
                      className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors bg-white hover:border-gray-400"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Amount (Words)
                  </label>
                  <textarea
                    name="amountWords"
                    value={receiptData.amountWords}
                    readOnly
                    rows={2}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none bg-gray-100 text-gray-700"
                    placeholder="Auto-generated from amount"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Payment For / Description
                  </label>
                  <input
                    type="text"
                    name="paymentFor"
                    value={receiptData.paymentFor}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors bg-white hover:border-gray-400"
                    placeholder="e.g., School fees, Registration fee, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Payment Method
                  </label>
                  <select
                    name="paymentMethod"
                    value={receiptData.paymentMethod}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors bg-white hover:border-gray-400"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Card">Card Payment</option>
                    <option value="Mobile Money">Mobile Money</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Draft/Cheque Number
                  </label>
                  <input
                    type="text"
                    name="draftChequeNo"
                    value={receiptData.draftChequeNo}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors bg-white hover:border-gray-400"
                    placeholder="Enter cheque/draft number if applicable"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Received By
                  </label>
                  <input
                    type="text"
                    name="receivedBy"
                    value={receiptData.receivedBy}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors bg-white hover:border-gray-400"
                    placeholder="Name of person receiving payment"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 space-y-4">
                <button
                  onClick={generateAndPreview}
                  disabled={!isFormValid || isGenerating}
                  className={`w-full py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center space-x-3 ${
                    isFormValid && !isGenerating
                      ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-xl'
                      : 'bg-gray-400 cursor-not-allowed text-white'
                  }`}
                >
                  {isGenerating ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <Receipt className="h-5 w-5" />
                      <span>Generate Preview</span>
                    </>
                  )}
                </button>

                {generatedImageUrl && (
                  <div className="grid grid-cols-1 gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={viewReceipt}
                        className="py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
                      >
                        <Eye className="h-4 w-4" />
                        <span>View Receipt</span>
                      </button>
                      <button
                        onClick={generatePDF}
                        className="py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
                      >
                        <FileText className="h-4 w-4" />
                        <span>Download PDF</span>
                      </button>
                    </div>
                    <button
                      onClick={shareViaWhatsApp}
                      className="py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
                    >
                      <Share className="h-4 w-4" />
                      <span>Share via WhatsApp</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Preview Section */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-6">
              <h2 className="text-xl font-bold text-white text-center">Receipt Preview</h2>
            </div>
            <div className="p-8">
              {generatedImageUrl ? (
                <div className="flex flex-col items-center">
                  <img
                    src={generatedImageUrl}
                    alt="Receipt Preview"
                    className="max-w-full h-auto border border-gray-300 rounded-lg shadow-md"
                  />
                  <p className="mt-4 text-sm text-gray-600 italic">
                    Preview of the generated receipt
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <Receipt className="h-16 w-16 mb-4" />
                  <p>Generate a receipt to see the preview here</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
