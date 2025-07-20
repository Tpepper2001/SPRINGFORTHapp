import React, { useState, useRef, useEffect } from 'react';
import { Download, Receipt, Shield, Archive, Trash2, Eye } from 'lucide-react';
import emailjs from '@emailjs/browser'; // Add EmailJS library

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
    email: '', // New email field
  });

  const [archivedReceipts, setArchivedReceipts] = useState([]);
  const [showArchive, setShowArchive] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const receiptRef = useRef(null);

  // ... (numberToWords, useEffect, handleInputChange, generateReceiptNumber, generateSecurityCode remain unchanged)

  const downloadReceipt = () => {
    if (!receiptData.receiptNumber || !receiptData.receivedFrom || !receiptData.amountNumbers || !receiptData.email) {
      alert('Please fill in Receipt Number, Received From, Amount, and Email fields');
      return;
    }

    const securityCode = generateSecurityCode();
    const receiptToSave = { ...receiptData, securityCode, downloadDate: new Date().toISOString() };

    // Create canvas for download (adjusted for mobile)
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 360; // Mobile-friendly width
    canvas.height = 600; // Adjusted height for content

    // Background
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Header
    ctx.fillStyle = '#7c3aed';
    ctx.fillRect(0, 0, canvas.width, 80);
    ctx.fillStyle = 'white';
    ctx.font = 'bold 20px Arial'; // Reduced font size
    ctx.textAlign = 'center';
    ctx.fillText('SPRINGFORTH ACADEMY', canvas.width / 2, 30);
    ctx.font = '10px Arial';
    ctx.fillText('No. 15 Tony Ogonenwe Close, off Living Water Avenue', canvas.width / 2, 50);
    ctx.fillText('Barnawa Narayi', canvas.width / 2, 60);
    ctx.fillText('Tel: 08035926459, 08094385502', canvas.width / 2, 70);

    // Receipt content
    ctx.fillStyle = '#7c3aed';
    ctx.font = 'bold 16px Arial';
    ctx.fillText('OFFICIAL RECEIPT', canvas.width / 2, 100);

    ctx.fillStyle = '#374151';
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';

    const details = [
      { label: 'Receipt No:', value: receiptData.receiptNumber },
      { label: 'Date:', value: receiptData.date },
      { label: 'Received From:', value: receiptData.receivedFrom },
      { label: 'Amount:', value: `₦${receiptData.amountNumbers}` },
      { label: 'The Sum of:', value: receiptData.amountWords },
      { label: 'Being:', value: receiptData.paymentFor },
      { label: 'Payment Method:', value: receiptData.paymentMethod },
    ];

    // Two-column layout for field names and values
    details.forEach((detail, index) => {
      ctx.textAlign = 'left';
      ctx.fillText(detail.label, 20, 130 + (index * 25));
      ctx.textAlign = 'right';
      ctx.fillText(detail.value, canvas.width - 20, 130 + (index * 25));
    });

    if (receiptData.additionalNotes) {
      ctx.textAlign = 'left';
      ctx.fillText('Notes:', 20, 130 + (details.length * 25));
      ctx.fillText(receiptData.additionalNotes, 20, 150 + (details.length * 25));
    }

    // Security
    ctx.fillStyle = '#dc2626';
    ctx.font = 'bold 10px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('SECURITY CODE: ' + securityCode, 20, 500);
    ctx.fillStyle = '#16a34a';
    ctx.fillText('✓ AUTHENTIC SPRINGFORTH ACADEMY RECEIPT', 20, 520);

    // Download PNG
    const link = document.createElement('a');
    link.download = `SPRINGFORTH-RECEIPT-${receiptData.receiptNumber}.png`;
    const imageData = canvas.toDataURL();
    link.href = imageData;
    link.click();

    // Send email with receipt
    const templateParams = {
      to_email: receiptData.email,
      receipt_number: receiptData.receiptNumber,
      date: receiptData.date,
      received_from: receiptData.receivedFrom,
      amount: `₦${receiptData.amountNumbers}`,
      amount_words: receiptData.amountWords,
      payment_for: receiptData.paymentFor,
      payment_method: receiptData.paymentMethod,
      additional_notes: receiptData.additionalNotes || 'None',
      security_code: securityCode,
      receipt_image: imageData, // Attach image as base64
    };

    emailjs
      .send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', templateParams, 'YOUR_PUBLIC_KEY')
      .then(() => {
        alert('Receipt sent to ' + receiptData.email);
      })
      .catch((error) => {
        console.error('Email sending failed:', error);
        alert('Failed to send receipt via email. Please try again.');
      });

    // Save to archive
    setArchivedReceipts(prev => [receiptToSave, ...prev]);
  };

  // ... (viewReceipt, deleteReceipt, clearForm remain unchanged)

  // Updated Input Form JSX
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
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

        <div className="grid md:grid-cols-2 gap-8">
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
              {/* ... (Other input fields remain unchanged) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                <input
                  type="email"
                  value={receiptData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="recipient@example.com"
                />
              </div>
              {/* ... (Rest of the input fields) */}
            </div>
          </div>

          {/* Receipt Preview */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Receipt Preview</h2>
              <button
                onClick={downloadReceipt}
                disabled={!receiptData.receiptNumber || !receiptData.receivedFrom || !receiptData.amountNumbers || !receiptData.email}
                className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4 mr-2" />
                Download & Email
              </button>
            </div>

            <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4 min-h-[500px] max-w-[360px] mx-auto">
              {/* Receipt Header */}
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-center py-4 rounded-t-lg -mx-4 -mt-4 mb-4">
                <h1 className="text-lg font-bold mb-1">SPRINGFORTH ACADEMY</h1>
                <p className="text-xs">No. 15 Tony Ogonenwe Close, off Living Water Avenue</p>
                <p className="text-xs">Barnawa Narayi</p>
                <p className="text-xs">Tel: 08035926459, 08094385502</p>
              </div>

              <div className="text-center mb-4">
                <div className="inline-block bg-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  OFFICIAL RECEIPT
                </div>
              </div>

              {/* Receipt Details */}
              <div className="space-y-3 text-sm text-gray-800">
                {[
                  { label: 'Receipt No:', value: receiptData.receiptNumber || 'SF____' },
                  { label: 'Date:', value: receiptData.date },
                  { label: 'Received From:', value: receiptData.receivedFrom || '____________________' },
                  { label: 'Amount:', value: `₦${receiptData.amountNumbers || '____'}` },
                  { label: 'The Sum of:', value: receiptData.amountWords || '____________________' },
                  { label: 'Being:', value: receiptData.paymentFor || '____________________' },
                  { label: 'Payment Method:', value: receiptData.paymentMethod },
                ].map((item, index) => (
                  <div key={index} className="flex justify-between">
                    <span className="font-medium">{item.label}</span>
                    <span className="text-right">{item.value}</span>
                  </div>
                ))}
                
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
