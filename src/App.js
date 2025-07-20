// Full updated App.js with all requested changes import React, { useState, useRef, useEffect } from 'react'; import { Download, Receipt, Shield, Archive, Trash2, Eye } from 'lucide-react';

const EReceiptApp = () => { const [receiptData, setReceiptData] = useState({ receiptNumber: '', date: new Date().toISOString().split('T')[0], receivedFrom: '', amountNumbers: '', amountWords: '', paymentFor: '', paymentMethod: 'Cash', additionalNotes: '', email: '' });

const [archivedReceipts, setArchivedReceipts] = useState([]); const [showArchive, setShowArchive] = useState(false); const [selectedReceipt, setSelectedReceipt] = useState(null); const receiptRef = useRef(null);

const formatAmount = (value) => { if (!value) return '0'; return parseFloat(value).toLocaleString('en-NG'); };

const numberToWords = (num) => { if (!num || num === 0) return '';

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

useEffect(() => { const words = receiptData.amountNumbers ? numberToWords(receiptData.amountNumbers) : ''; setReceiptData(prev => ({ ...prev, amountWords: words })); }, [receiptData.amountNumbers]);

const handleInputChange = (field, value) => { setReceiptData(prev => ({ ...prev, [field]: value })); };

const generateReceiptNumber = () => {
  const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  handleInputChange('receiptNumber', `SF${randomNum}`);
};
const generateSecurityCode = () => { const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'; let result = ''; for (let i = 0; i < 8; i++) { result += chars.charAt(Math.floor(Math.random() * chars.length)); } return result; };

const downloadReceipt = () => { if (!receiptData.receiptNumber || !receiptData.receivedFrom || !receiptData.amountNumbers) { alert('Please fill in Receipt Number, Received From, and Amount fields'); return; }

const securityCode = generateSecurityCode();
const receiptToSave = { ...receiptData, securityCode, downloadDate: new Date().toISOString() };

const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
canvas.width = 360;
canvas.height = 600;

ctx.fillStyle = '#f8f9fa';
ctx.fillRect(0, 0, canvas.width, canvas.height);

ctx.fillStyle = '#7c3aed';
ctx.fillRect(0, 0, canvas.width, 80);
ctx.fillStyle = 'white';
ctx.font = 'bold 20px Arial';
ctx.textAlign = 'center';
ctx.fillText('SPRINGFORTH ACADEMY', canvas.width / 2, 30);
ctx.font = '10px Arial';
ctx.fillText('No. 15 Tony Ogonenwe Close, off Living Water Avenue, Barnawa Narayi', canvas.width / 2, 50);
ctx.fillText('Tel: 08035926459, 08094385502', canvas.width / 2, 65);

ctx.fillStyle = '#7c3aed';
ctx.font = 'bold 14px Arial';
ctx.fillText('OFFICIAL RECEIPT', canvas.width / 2, 100);

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
  ['Being:', receiptData.paymentFor],
  ['Payment Method:', receiptData.paymentMethod]
];

details.forEach(([label, value], index) => {
  const y = 130 + index * 25;
  ctx.fillText(label, labelX, y);
  ctx.textAlign = 'right';
  ctx.fillText(value, valueX, y);
  ctx.textAlign = 'left';
});

if (receiptData.additionalNotes) {
  ctx.fillText(`Notes: ${receiptData.additionalNotes}`, labelX, 130 + details.length * 25);
}

ctx.fillStyle = '#dc2626';
ctx.font = 'bold 10px Arial';
ctx.fillText('SECURITY CODE: ' + securityCode, labelX, 520);
ctx.fillStyle = '#16a34a';
ctx.fillText('✓ AUTHENTIC SPRINGFORTH ACADEMY RECEIPT', labelX, 540);

const link = document.createElement('a');
link.download = `SPRINGFORTH-RECEIPT-${receiptData.receiptNumber}.png`;
link.href = canvas.toDataURL();
link.click();

setArchivedReceipts(prev => [receiptToSave, ...prev]);

};

return ( <div className="p-4 max-w-xl mx-auto"> <h1 className="text-2xl font-bold mb-4">Receipt Generator</h1>

<input type="text" placeholder="Received From" className="w-full mb-2 border p-2" value={receiptData.receivedFrom} onChange={(e) => handleInputChange('receivedFrom', e.target.value)} />
  <input type="email" placeholder="Parent Email (optional)" className="w-full mb-2 border p-2" value={receiptData.email} onChange={(e) => handleInputChange('email', e.target.value)} />
  <input type="number" placeholder="Amount" className="w-full mb-2 border p-2" value={receiptData.amountNumbers} onChange={(e) => handleInputChange('amountNumbers', e.target.value)} />

  <button onClick={generateReceiptNumber} className="bg-purple-600 text-white px-4 py-2 rounded">Generate Receipt No</button>
  <button onClick={downloadReceipt} className="ml-2 bg-green-600 text-white px-4 py-2 rounded">Download</button>

  <a
    href={`https://wa.me/?text=${encodeURIComponent(`Springforth Receipt\nReceipt No: ${receiptData.receiptNumber}\nAmount: ₦${formatAmount(receiptData.amountNumbers)}\nDate: ${receiptData.date}\nFrom: ${receiptData.receivedFrom}`)}`}
    target="_blank"
    rel="noopener noreferrer"
    className="block mt-4 bg-green-500 text-white px-4 py-2 rounded text-center"
  >
    Share via WhatsApp
  </a>
</div>

); };

export default EReceiptApp;

