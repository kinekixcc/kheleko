import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Shield, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { createESewaPayment, submitESewaPayment } from '../../lib/esewa';
import toast from 'react-hot-toast';

interface ESewaPaymentProps {
  amount: number;
  tournamentId: string;
  tournamentName: string;
  userId: string;
  onPaymentInitiated?: () => void;
}

export const ESewaPayment: React.FC<ESewaPaymentProps> = ({
  amount,
  tournamentId,
  tournamentName,
  userId,
  onPaymentInitiated
}) => {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    try {
      console.log('🔄 Initiating eSewa payment...', {
        amount,
        tournamentId,
        tournamentName,
        userId
      });
      
      // Create eSewa payment data
      const paymentData = createESewaPayment(amount, tournamentId, tournamentName, userId);
      
      // Store payment info in localStorage for verification later
      localStorage.setItem('pending_payment', JSON.stringify({
        tournament_id: tournamentId,
        tournament_name: tournamentName,
        user_id: userId,
        amount: amount,
        transaction_uuid: paymentData.transaction_uuid,
        timestamp: new Date().toISOString()
      }));
      
      // Notify parent component
      if (onPaymentInitiated) {
        onPaymentInitiated();
      }
      
      // Show different messages for development vs production
      if (import.meta.env.DEV) {
        toast.success('Starting payment simulation...');
      } else {
        toast.success('Redirecting to eSewa payment gateway...');
      }
      
      // Submit payment to eSewa
      setTimeout(() => {
        submitESewaPayment(paymentData);
      }, 1000);
      
    } catch (error) {
      console.error('Payment initiation failed:', error);
      toast.error('Failed to initiate payment. Please try again.');
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <img 
            src="https://esewa.com.np/common/images/esewa_logo.png" 
            alt="eSewa" 
            className="w-12 h-8 object-contain"
            onError={(e) => {
              // Fallback if image doesn't load
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling!.style.display = 'flex';
            }}
          />
          <div className="w-12 h-8 bg-green-600 rounded flex items-center justify-center text-white font-bold text-sm" style={{ display: 'none' }}>
            eSewa
          </div>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Pay with eSewa
        </h3>
        <p className="text-gray-600">
          Nepal's most trusted digital payment platform
        </p>
      </div>

      {/* Payment Details */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-600">Tournament:</span>
          <span className="font-medium text-gray-900">{tournamentName}</span>
        </div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-600">Entry Fee:</span>
          <span className="font-medium text-gray-900">रू {amount}</span>
        </div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-600">Service Charge:</span>
          <span className="font-medium text-gray-900">रू 0</span>
        </div>
        <div className="border-t pt-2 mt-2">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-gray-900">Total Amount:</span>
            <span className="text-xl font-bold text-green-600">रू {amount}</span>
          </div>
        </div>
      </div>

      {/* Security Features */}
      <div className="mb-6">
        <div className="flex items-center space-x-3 text-sm text-gray-600 mb-2">
          <Shield className="h-4 w-4 text-green-600" />
          <span>{import.meta.env.DEV ? 'Development simulation mode' : '256-bit SSL encrypted payment'}</span>
        </div>
        <div className="flex items-center space-x-3 text-sm text-gray-600 mb-2">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <span>Instant payment confirmation</span>
        </div>
        <div className="flex items-center space-x-3 text-sm text-gray-600">
          <CreditCard className="h-4 w-4 text-green-600" />
          <span>Pay with eSewa wallet, bank account, or cards</span>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="mb-6">
        <p className="text-sm font-medium text-gray-700 mb-3">Supported Payment Methods:</p>
        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>eSewa Wallet</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>Bank Transfer</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <span>Debit Cards</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            <span>Mobile Banking</span>
          </div>
        </div>
      </div>

      {/* Important Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
        <div className="flex items-start space-x-2">
          <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">{import.meta.env.DEV ? 'Development Mode:' : 'Important:'}</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              {import.meta.env.DEV ? (
                <>
                  <li>This is a payment simulation for development</li>
                  <li>No real money will be charged</li>
                  <li>Payment will be automatically approved after 3 seconds</li>
                  <li>In production, this will redirect to real eSewa gateway</li>
                </>
              ) : (
                <>
                  <li>You will be redirected to eSewa's secure payment gateway</li>
                  <li>Complete the payment within 15 minutes</li>
                  <li>Keep your transaction ID for future reference</li>
                  <li>Your tournament registration will be confirmed after successful payment</li>
                </>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Pay Button */}
      <Button
        onClick={handlePayment}
        loading={loading}
        className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg font-semibold"
        size="lg"
      >
        {loading ? (
          import.meta.env.DEV ? 'Starting simulation...' : 'Redirecting to eSewa...'
        ) : (
          <>
            <CreditCard className="mr-2 h-5 w-5" />
            Pay रू {amount} with eSewa
          </>
        )}
      </Button>

      {/* Footer */}
      <p className="text-xs text-gray-500 text-center mt-4">
        {import.meta.env.DEV 
          ? 'Development mode - No real payment will be processed'
          : 'By proceeding, you agree to eSewa\'s terms and conditions'
        }
      </p>
    </Card>
  );
};