import React, { useState } from 'react';
import { Download, Share, Receipt, Plus, Eye, FileText } from 'lucide-react';

// Replace with the actual path to your logo image (e.g., in public folder or external URL)
const logoUrl = '/logo.png'; // Example: Place logo.png in public folder or use a URL like 'https://example.com/logo.png'

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
    if (!num || isNaN(num)) return { naira: '0', kobo: '00' };
    const cleanNum = parseFloat(num.toString().replace(/,/g, ''));
    if (isNaN(cleanNum)) return { naira: '0', kobo: '00' };
    const naira = Math.floor(cleanNum).toLocaleString('en-NG');
    const kobo = Math.round((cleanNum - Math.floor(cleanNum)) * 100).toString().padStart(2, '0');
    return { naira, kobo };
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

  const loadImage = (src) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous'; // Handle CORS if logo is from an external URL
      img.onload = () => resolve(img);
      img.onerror = (err) => reject(err);
      img.src = src;
    });
  };

  const generateReceiptImage = async () => {
    if (!receiptData.receivedFrom || !receiptData.amountNumbers) {
      alert('Please fill in required fields: Received From and Amount');
      return null;
    }

    setIsGenerating(true);
    
    try {
      const canvas = document.createElement('canvas');
      const scale = 2; // Scaling factor for high DPI
      canvas.width = 600 * scale;
      canvas.height = 450 * scale;
      const ctx = canvas.getContext('2d');

      ctx.scale(scale, scale);

      // White background
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, canvas.width / scale, canvas.height / scale);

      // Load logo image
      const logo = await loadImage(logoUrl);

      // Draw watermark (semi-transparent logo in the center)
      ctx.globalAlpha = 0.1; // Set low opacity for watermark
      const watermarkSize = 300; // Adjust size as needed
      const watermarkX = (canvas.width / scale - watermarkSize) / 2;
      const watermarkY = (canvas.height / scale - watermarkSize) / 2;
      ctx.drawImage(logo, watermarkX, watermarkY, watermarkSize, watermarkSize);
      ctx.globalAlpha = 1.0; // Reset opacity

      // Purple header section
      const gradient = ctx.createLinearGradient(0, 0, canvas.width / scale, 0);
      gradient.addColorStop(0, '#8B5A96');
      gradient.addColorStop(1, '#A569BD');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width / scale, 80);

      // Draw logo in header (top-left corner)
      const logoSize = 50; // Adjust size as needed
      ctx.drawImage(logo, 20, 15, logoSize, logoSize);

      // Company name and details (adjusted to accommodate logo)
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 28px Arial';
      ctx.textAlign = 'left';
      ctx.fillText('SPRINGFORTH ACADEMY', 80, 35); // Shifted right to avoid logo overlap
      
      ctx.font = '10px Arial';
      ctx.fillText('No. 15 Tony Ogomienwe Close, off Living water Avenue,', 80, 50);
      ctx.fillText('Barnawa Narayi, Sabon Gari, Kaduna East, Kaduna', 80, 62);
      ctx.fillText('CRÈCHE, DAYCARE, PLAYGROUP, NURSERY, PRIMARY, LESSON + TUTORIALS', 80, 74);

      // Receipt number
      ctx.font = '12px Arial';
      ctx.textAlign = 'right';
      ctx.fillText(`KD: ${receiptData.receiptNumber}`, canvas.width / scale - 20, 25);
      ctx.fillText(`No: ${receiptData.receiptNumber}`, canvas.width / scale - 20, 45);

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
      
      ctx.fillText('Date:', leftMargin, y);
      ctx.fillText(new Date(receiptData.date).toLocaleDateString('en-GB'), leftMargin + 50, y);
      
      y += lineHeight;
      
      ctx.fillText('Received From:', leftMargin, y);
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(leftMargin + 120, y + 2);
      ctx.lineTo(canvas.width / scale - 30, y + 2);
      ctx.stroke();
      if (receiptData.receivedFrom) {
        ctx.fillText(receiptData.receivedFrom, leftMargin + 125, y - 2);
      }
      
      y += lineHeight;
      
      ctx.fillText('The Sum of:', leftMargin, y);
      ctx.beginPath();
      ctx.moveTo(leftMargin + 90, y + 2);
      ctx.lineTo(canvas.width / scale - 30, y + 2);
      ctx.stroke();
      if (receiptData.amountNumbers) {
        const { naira, kobo } = formatAmount(receiptData.amountNumbers);
        ctx.fillText(`₦${naira}.${kobo}`, leftMargin + 95, y - 2);
      }
      
      y += lineHeight;
      
      ctx.fillText('Balance Remaining:', leftMargin, y);
      ctx.beginPath();
      ctx.moveTo(leftMargin + 120, y + 2);
      ctx.lineTo(canvas.width / scale - 30, y + 2);
      ctx.stroke();
      if (receiptData.balanceRemaining) {
        const { naira, kobo } = formatAmount(receiptData.balanceRemaining);
        ctx.fillText(`₦${naira}.${kobo}`, leftMargin + 125, y - 2);
      }
      
      y += lineHeight;
      
      ctx.fillText('Being:', leftMargin, y);
      ctx.beginPath();
      ctx.moveTo(leftMargin + 60, y + 2);
      ctx.lineTo(canvas.width / scale - 30, y + 2);
      ctx.stroke();
      if (receiptData.paymentFor) {
        ctx.fillText(receiptData.paymentFor, leftMargin + 65, y - 2);
      }
      
      y += lineHeight * 2;
      
      const words = receiptData.amountWords;
      const maxWidth = canvas.width / scale - 60;
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
        ctx.lineTo(canvas.width / scale - 30, y + 2);
        ctx.stroke();
        ctx.fillText(line, leftMargin, y - 2);
        y += lineHeight;
      });
      
      y += 10;
      
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
      
      ctx.font = 'bold 12px Arial';
      ctx.fillText('No Refund of Money after Payment', leftMargin, y);
      
      ctx.strokeRect(leftMargin, y + 10, 60, 20);
      const amount = formatAmount(receiptData.amountNumbers);
      ctx.fillText(amount.naira, leftMargin + 10, y + 23);
      ctx.fillText(':', leftMargin + 30, y + 23);
      ctx.fillText(amount.kobo, leftMargin + 40, y + 23);
      
      ctx.textAlign = 'right';
      ctx.font = 'italic 14px Arial';
      ctx.fillText('For Springforth Academy', canvas.width / scale - 30, y + 25);
      
      ctx.beginPath();
      ctx.moveTo(canvas.width / scale - 200, y + 35);
      ctx.lineTo(canvas.width / scale - 30, y + 35);
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
              image-rendering: optimizeQuality;
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
              img { max-width: 100%; image-rendering: optimizeQuality; }
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

    const amount = formatAmount(receiptData.amountNumbers);
    const balance = formatAmount(receiptData.balanceRemaining);

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
              image-rendering: optimizeQuality;
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
                <span>₦${amount.naira}.${amount.kobo}</span>
              </div>
              <div class="detail-row">
                <span class="label">Balance Remaining:</span>
                <span>${receiptData.balanceRemaining ? `₦${balance.naira}.${balance.kobo}` : 'N/A'}</span>
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

    const amount = formatAmount(receiptData.amountNumbers);
    const balance = formatAmount(receiptData.balanceRemaining);

    const shareText = `🧾 SPRINGFORTH ACADEMY RECEIPT
      
Receipt No: ${receiptData.receiptNumber}
Date: ${new Date(receiptData.date).toLocaleDateString('en-GB')}
Amount: ₦${amount.naira}.${amount.kobo}
Balance Remaining: ${receiptData.balanceRemaining ? `₦${balance.naira}.${balance.kobo}` : 'N/A'}
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
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-6">
              <div className="flex items-center justify-center space-x-3">
                <Receipt className="h-8 w-8 text-white" />
                <h1 className="text-2xl font-bold text-white">Springforth Academy</h1>
              </div>
              <p className="text-purple-100 text-center mt-2">Official Receipt Generator</p>
            </div>

            <div className="p-8">
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
                      type="number"
                      step="0.01"
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
                      type="number"
                      step="0.01"
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
                    style={{ imageRendering: 'optimizeQuality' }}
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
