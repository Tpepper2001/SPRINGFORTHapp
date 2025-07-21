// Full working version with PDF, Image, and Share Options

import React, { useState, useRef, useEffect } from 'react'; import jsPDF from 'jspdf'; import { Download, Receipt, Share2, RefreshCw, } from 'lucide-react';

const EReceiptApp = () => { const [receiptData, setReceiptData] = useState({ receiptNumber: '', date: new Date().toISOString().split('T')[0], receivedFrom: '', amountNumbers: '', amountWords: '', paymentFor: '', paymentMethod: 'Cash', additionalNotes: '', email: '' });

const formatAmount = (value) => { if (!value) return '0'; return parseFloat(value).toLocaleString('en-NG'); };

const numberToWords = (num) => { if (!num || num === 0) return ''; const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine']; const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']; const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

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

useEffect(() => { const words = receiptData.amountNumbers ? numberToWords(receiptData.amountNumbers) : ''; setReceiptData(prev => ({ ...prev, amountWords: words })); }, [receiptData.amountNumbers]);

const handleInputChange = (field, value) => { setReceiptData(prev => ({ ...prev, [field]: value })); };

const generateReceiptNumber = () => {
  const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  handleInputChange('receiptNumber', `SF${randomNum}`);
};
const generateSecurityCode = () => { const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'; let result = ''; for (let i = 0; i < 8; i++) { result += chars.charAt(Math.floor(Math.random() * chars.length)); } return result; };

const downloadReceiptAsPDF = () => { const doc = new jsPDF(); const securityCode = generateSecurityCode(); doc.setFont('helvetica', 'bold'); doc.setFontSize(16); doc.setTextColor('#7c3aed'); doc.text('SPRINGFORTH ACADEMY', 105, 15, null, null, 'center');

doc.setFontSize(10);
doc.text('No. 15 Tony Ogonenwe Close, off Living Water Avenue, Barnawa Narayi', 105, 22, null, null, 'center');
doc.text('Tel: 08035926459, 08094385502', 105, 28, null, null, 'center');

doc.setFontSize(12);
doc.setTextColor(0, 0, 0);
doc.text('OFFICIAL RECEIPT', 105, 38, null, null, 'center');

const details = [
  ['Receipt No:', receiptData.receiptNumber],
  ['Date:', receiptData.date],
  ['Received From:', receiptData.receivedFrom],
  ['Amount:', `₦${formatAmount(receiptData.amountNumbers)}`],
  ['The Sum of:', receiptData.amountWords],
  ['Being:', receiptData.paymentFor || 'Payment received'],
  ['Payment Method:', receiptData.paymentMethod],
  ...(receiptData.additionalNotes ? [['Notes:', receiptData.additionalNotes]] : []),
  ['Security Code:', securityCode]
];

let y = 50;
details.forEach(([label, value]) => {
  doc.setFont('helvetica', 'bold');
  doc.text(label, 20, y);
  doc.setFont('helvetica', 'normal');
  doc.text(value, 70, y);
  y += 10;
});

doc.setTextColor(0, 128, 0);
doc.text('✓ AUTHENTIC SPRINGFORTH ACADEMY RECEIPT', 20, y + 5);
doc.save(`SPRINGFORTH-RECEIPT-${receiptData.receiptNumber}.pdf`);

};

const downloadReceiptAsImage = () => { const canvas = document.createElement('canvas'); canvas.width = 360; canvas.height = 650; const ctx = canvas.getContext('2d'); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, canvas.width, canvas.height); ctx.fillStyle = '#000'; ctx.font = '14px Arial'; ctx.fillText(Receipt: ${receiptData.receiptNumber}, 20, 50); ctx.fillText(Received From: ${receiptData.receivedFrom}, 20, 70); ctx.fillText(Amount: ₦${formatAmount(receiptData.amountNumbers)}, 20, 90); ctx.fillText(In Words: ${receiptData.amountWords}, 20, 110); const link = document.createElement('a'); link.download = SPRINGFORTH-RECEIPT-${receiptData.receiptNumber}.png; link.href = canvas.toDataURL(); link.click(); };

const shareReceiptOptions = () => { const message = Springforth Academy Receipt\nReceipt No: ${receiptData.receiptNumber}\nDate: ${receiptData.date}\nFrom: ${receiptData.receivedFrom}\nAmount: ₦${formatAmount(receiptData.amountNumbers)}\nPayment For: ${receiptData.paymentFor || 'Payment received'}; const encoded = encodeURIComponent(message);

if (navigator.share) {
  navigator.share({ title: 'Springforth Receipt', text: message });
} else {
  const option = prompt('Share via:\n1. WhatsApp\n2. Telegram\n3. Email');
  if (option === '1') window.open(`https://wa.me/?text=${encoded}`);
  else if (option === '2') window.open(`https://t.me/share/url?text=${encoded}`);
  else if (option === '3') window.location.href = `mailto:?subject=Springforth Receipt&body=${encoded}`;
}

};

return ( <div className="p-4 max-w-xl mx-auto"> <h1 className="text-xl font-bold mb-4 flex items-center gap-2"> <Receipt className="w-5 h-5 text-purple-600" /> Receipt Generator </h1> <div className="space-y-3"> <input placeholder="Receipt Number" className="w-full border px-3 py-2 rounded" value={receiptData.receiptNumber} onChange={(e) => handleInputChange('receiptNumber', e.target.value)} /> <input placeholder="Received From" className="w-full border px-3 py-2 rounded" value={receiptData.receivedFrom} onChange={(e) => handleInputChange('receivedFrom', e.target.value)} /> <input type="number" placeholder="Amount" className="w-full border px-3 py-2 rounded" value={receiptData.amountNumbers} onChange={(e) => handleInputChange('amountNumbers', e.target.value)} /> <input placeholder="Payment For" className="w-full border px-3 py-2 rounded" value={receiptData.paymentFor} onChange={(e) => handleInputChange('paymentFor', e.target.value)} />

<div className="flex gap-2">
      <button onClick={generateReceiptNumber} className="bg-purple-600 text-white px-4 py-2 rounded flex items-center gap-2">
        <RefreshCw className="w-4 h-4" /> Generate No
      </button>
      <button onClick={downloadReceiptAsPDF} className="bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2">
        <Download className="w-4 h-4" /> PDF
      </button>
      <button onClick={downloadReceiptAsImage} className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2">
        <Download className="w-4 h-4" /> Image
      </button>
    </div>

    {receiptData.receiptNumber && receiptData.receivedFrom && receiptData.amountNumbers && (
      <button onClick={shareReceiptOptions} className="w-full bg-purple-700 text-white px-4 py-2 rounded flex items-center justify-center gap-2">
        <Share2 className="w-4 h-4" /> Share
      </button>
    )}
  </div>
</div>

); };

export default EReceiptApp;

